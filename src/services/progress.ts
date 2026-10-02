import { getStats, isValidGameState, isValidQuestion, type GameMode, type Question, type VocabularySession } from '../game/vocabulary.ts';

export interface ProgressKey {
  language: string;
  level: string;
  topic: string;
  mode?: GameMode;
}

export interface SavedProgress extends ProgressKey {
  version: 2;
  mode: GameMode;
  session: VocabularySession;
  completed: number;
  total: number;
  score: number;
  updatedAt: string;
  lastResult: { correct: number; incorrect: number; total: number; percentage: number } | null;
}

export interface ProgressStore {
  get(key: ProgressKey): unknown;
  save(progress: SavedProgress): boolean;
}

const storageKey = (key: ProgressKey) => `lingoplay:v2:${key.language}:${key.level}:${key.topic}:${key.mode ?? 'recent'}`;
const legacyKey = (key: ProgressKey) => `lingoplay:v1:${key.language}:${key.level}:${key.topic}`;

export const progressStore: ProgressStore = {
  get(key) {
    try {
      const value = localStorage.getItem(storageKey(key)) ?? (!key.mode || key.mode === 'word-to-meaning' ? localStorage.getItem(legacyKey(key)) : null);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  save(progress) {
    try {
      localStorage.setItem(storageKey(progress), JSON.stringify(progress));
      const { session, ...summary } = progress;
      localStorage.setItem(storageKey({ ...progress, mode: undefined }), JSON.stringify(summary));
      return true;
    } catch {
      return false;
    }
  },
};

function readLastResult(value: unknown): SavedProgress['lastResult'] {
  if (!value || typeof value !== 'object' || !('lastResult' in value) || !value.lastResult || typeof value.lastResult !== 'object') return null;
  const result = value.lastResult as NonNullable<SavedProgress['lastResult']>;
  return [result.correct, result.incorrect, result.total, result.percentage].every(Number.isInteger) && result.total > 0 && result.correct >= 0 && result.incorrect >= 0 &&
    result.correct + result.incorrect === result.total && result.percentage === Math.round(result.correct / result.total * 100) ? result : null;
}

export function createSavedProgress(session: VocabularySession, previous?: unknown): SavedProgress {
  const stats = getStats(session);
  const { correct, incorrect, total, percentage } = stats;
  return { ...session.config, version: 2, session, completed: stats.completed, total, score: correct, updatedAt: new Date().toISOString(), lastResult: stats.finished ? { correct, incorrect, total, percentage } : readLastResult(previous) };
}

// Keep the exact question order/options on reload. Old v1 rounds are validated and read without deleting them.
export function readStoredSession(value: unknown, key: ProgressKey, mode: GameMode, bank: Question[], answerPool?: string[]): VocabularySession | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.language !== key.language || saved.level !== key.level || saved.topic !== key.topic) return null;
  let candidate: unknown = saved.session;
  if (!candidate && mode === 'word-to-meaning' && typeof saved.signature === 'string') {
    try {
      const oldQuestions: unknown = JSON.parse(saved.signature);
      if (!Array.isArray(oldQuestions)) return null;
      const questions = oldQuestions.map(old => {
        if (!old || typeof old !== 'object') return null;
        const current = bank.find(question => question.id === old.id);
        return current && { ...current, ...old, kind: 'choice' };
      });
      candidate = { config: { ...key, mode, questionCount: questions.length }, questions, state: saved.state };
    } catch { return null; }
  } else if (saved.version !== 2 || saved.mode !== mode) return null;
  if (!candidate || typeof candidate !== 'object') return null;
  const session = candidate as VocabularySession;
  if (!session.config || session.config.language !== key.language || session.config.level !== key.level || session.config.topic !== key.topic || session.config.mode !== mode ||
    !Array.isArray(session.questions) || !session.questions.length || session.questions.length !== session.config.questionCount || new Set(session.questions.map(question => question?.id)).size !== session.questions.length) return null;
  const allowedAnswers = new Set(answerPool ?? bank.flatMap(question => question.kind === 'choice' ? question.options : []));
  const valid = session.questions.every(question => {
    if (!isValidQuestion(question)) return false;
    const current = bank.find(item => item.id === question.id);
    return current && current.kind === question.kind && current.prompt === question.prompt && current.correctAnswer === question.correctAnswer && current.promptLanguage === question.promptLanguage && current.answerLanguage === question.answerLanguage &&
      (question.kind === 'typing' || (current.kind === 'choice' && JSON.stringify(current.image) === JSON.stringify(question.image) && question.options.every(option => allowedAnswers.has(option))));
  });
  return valid && isValidGameState(session.state, session.questions) ? session : null;
}
