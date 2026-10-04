import { getStats, isValidGameState, isValidQuestion, type ChoiceQuestion, type GameMode, type Question, type VocabularySession } from '../game/vocabulary.ts';
import { emptyMemory, type LearningMemory, type Practice, type WordMemory } from '../game/learning.ts';

export interface ProgressKey {
  language: string;
  level?: string;
  game?: string;
  startRank?: number;
  topic: string;
  mode?: GameMode;
  practice?: Practice;
}

export interface SavedProgress extends ProgressKey {
  version: 2 | 3;
  completedWordIds?: string[];
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

const storageKey = (key: ProgressKey) => key.game ? `lingoplay:v3:${key.language}:${key.game}:${key.topic}${key.practice && key.practice !== 'study' ? `:${key.practice}` : ''}` : `lingoplay:v2:${key.language}:${key.level}:${key.topic}:${key.mode ?? 'recent'}`;
const legacyKey = (key: ProgressKey) => `lingoplay:v1:${key.language}:${key.level}:${key.topic}`;

export const progressStore: ProgressStore = {
  get(key) {
    try {
      const value = localStorage.getItem(storageKey(key)) ?? (!key.game && (!key.mode || key.mode === 'word-to-meaning') ? localStorage.getItem(legacyKey(key)) : null);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  save(progress) {
    try {
      localStorage.setItem(storageKey(progress), JSON.stringify(progress));
      const { session, ...summary } = progress;
      if (!progress.game) localStorage.setItem(storageKey({ ...progress, mode: undefined }), JSON.stringify(summary));
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
  const oldIds = previous && typeof previous === 'object' && 'completedWordIds' in previous && Array.isArray(previous.completedWordIds) ? previous.completedWordIds.filter((id): id is string => typeof id === 'string') : [];
  const completedWordIds = [...new Set([...oldIds, ...(stats.finished ? session.questions.map(question => question.id) : [])])];
  return { ...session.config, version: session.config.game ? 3 : 2, ...(session.config.game ? { completedWordIds } : {}), session, completed: stats.completed, total, score: correct, updatedAt: new Date().toISOString(), lastResult: stats.finished ? { correct, incorrect, total, percentage } : readLastResult(previous) };
}

// Keep the exact question order/options on reload. Old v1 rounds are validated and read without deleting them.
export function readStoredSession(value: unknown, key: ProgressKey, mode: GameMode, bank: Question[], answerPool?: string[], imagePool?: ChoiceQuestion['optionImages']): VocabularySession | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.language !== key.language || saved.level !== key.level || saved.topic !== key.topic || saved.game !== key.game || (saved.practice ?? 'study') !== (key.practice ?? 'study')) return null;
  let candidate: unknown = saved.session;
  if (!candidate && !key.game && mode === 'word-to-meaning' && typeof saved.signature === 'string') {
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
  } else if (saved.version !== (key.game ? 3 : 2) || saved.mode !== mode) return null;
  if (!candidate || typeof candidate !== 'object') return null;
  const session = candidate as VocabularySession;
  if (session.id !== undefined && (typeof session.id !== 'string' || !session.id.trim() || session.id.length > 100)) return null;
  if (!session.config || session.config.language !== key.language || session.config.level !== key.level || session.config.topic !== key.topic || session.config.mode !== mode || session.config.game !== key.game || (session.config.practice ?? 'study') !== (key.practice ?? 'study') ||
    (key.game && (session.config.startRank !== key.startRank || !Number.isInteger(key.startRank) || key.startRank! < 1)) ||
    !Array.isArray(session.questions) || !session.questions.length || session.questions.length !== session.config.questionCount || new Set(session.questions.map(question => question?.id)).size !== session.questions.length) return null;
  const allowedAnswers = new Set(answerPool ?? bank.flatMap(question => question.kind === 'choice' ? question.options : []));
  const allowedImages = new Map((imagePool ?? bank.flatMap(question => question.kind === 'choice' ? question.optionImages ?? [] : [])).map(image => [image.answer, image]));
  if (mode === 'image-match' && (!Array.isArray(session.imageOrder) || session.imageOrder.length !== session.questions.length || new Set(session.imageOrder).size !== session.questions.length || !session.imageOrder.every(id => session.questions.some(question => question.id === id)))) return null;
  const valid = session.questions.every(question => {
    if (!isValidQuestion(question)) return false;
    const current = bank.find(item => item.id === question.id);
    return current && current.kind === question.kind && current.prompt === question.prompt && current.correctAnswer === question.correctAnswer && current.promptLanguage === question.promptLanguage && current.answerLanguage === question.answerLanguage &&
      (question.kind === 'typing' || (question.kind === 'matching' && current.kind === 'matching' && JSON.stringify(current.image) === JSON.stringify(question.image)) || (question.kind === 'choice' && current.kind === 'choice' && JSON.stringify(current.image) === JSON.stringify(question.image) && current.audio === question.audio && !!current.optionImages === !!question.optionImages && question.options.every(option => allowedAnswers.has(option)) && (!question.optionImages || question.optionImages.every(image => JSON.stringify(allowedImages.get(image.answer)) === JSON.stringify(image)))));
  });
  return valid && isValidGameState(session.state, session.questions) ? session : null;
}

// Copy a validated old topic round once. Existing v1/v2 keys remain untouched.
export function migrateLevelProgress(key: ProgressKey, mode: GameMode, bank: Question[], answerPool: string[], ranks: Map<string, number>): VocabularySession | null {
  if (!key.game || key.topic === 'all' || (key.practice && key.practice !== 'study')) return null;
  const candidates = ['easy', 'medium', 'hard'].map(level => {
    const oldKey = { language: key.language, level, topic: key.topic, mode };
    const value = progressStore.get(oldKey);
    const session = readStoredSession(value, oldKey, mode, bank, answerPool);
    return { session, updatedAt: value && typeof value === 'object' && 'updatedAt' in value && typeof value.updatedAt === 'string' ? value.updatedAt : '' };
  }).filter(candidate => candidate.session).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const old = candidates[0]?.session;
  if (!old) return null;
  const startRank = Math.min(...old.questions.map(question => ranks.get(question.id) ?? 1));
  return { ...old, config: { language: key.language, topic: key.topic, game: key.game, startRank, mode, questionCount: old.questions.length } };
}

const memoryKey = 'lingoplay:learning:v1:en';
export function readLearningMemory(value: unknown): LearningMemory {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('words' in value) || !value.words || typeof value.words !== 'object' || Array.isArray(value.words)) return emptyMemory();
  const entries = Object.entries(value.words).filter(([id, record]) => {
    if (!id.trim() || id.length > 100 || !record || typeof record !== 'object') return false;
    const word = record as WordMemory;
    const validTime = (time: number) => Number.isSafeInteger(time) && time >= 0 && time <= 8.64e15;
    return Number.isInteger(word.successes) && word.successes >= 0 && word.successes <= 3 && typeof word.lastOutcome === 'boolean' && (word.lastOutcome || word.successes === 0) && typeof word.lastAttemptId === 'string' && !!word.lastAttemptId.trim() && word.lastAttemptId.length <= 200 && validTime(word.dueAt) && validTime(word.lastAttemptAt) &&
      (word.lastCorrectDay === undefined ? word.successes === 0 : typeof word.lastCorrectDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(word.lastCorrectDay) && Number.isFinite(Date.parse(word.lastCorrectDay)) && new Date(word.lastCorrectDay).toISOString().slice(0, 10) === word.lastCorrectDay);
  });
  return { version: 1, words: Object.fromEntries(entries) };
}
export const learningStore = {
  get(fallback = emptyMemory()): LearningMemory {
    try {
      const value = localStorage.getItem(memoryKey);
      const stored = readLearningMemory(value ? JSON.parse(value) : null);
      // Preserve unsaved attempts when reads work but writes fail (e.g. quota or read-only storage).
      for (const [id, word] of Object.entries(fallback.words)) {
        if (!Object.hasOwn(stored.words, id) || stored.words[id].lastAttemptAt < word.lastAttemptAt) stored.words[id] = word;
      }
      return stored;
    } catch { return fallback; }
  },
  save(memory: LearningMemory): boolean { try { localStorage.setItem(memoryKey, JSON.stringify(memory)); return true; } catch { return false; } },
};
