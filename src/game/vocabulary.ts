import type { LevelId } from '../config/course';
import type { Word } from '../types/content';

export const gameModes = [
  { id: 'word-to-meaning', name: 'Word → Meaning', description: 'Choose the Vietnamese meaning.', icon: 'Aa' },
  { id: 'meaning-to-word', name: 'Meaning → Word', description: 'Find the English word.', icon: '↔' },
  { id: 'image-to-word', name: 'Image → Word', description: 'Match a picture to its word.', icon: '▧' },
  { id: 'type-the-word', name: 'Type the Word', description: 'Type the English word from its meaning.', icon: '⌨' },
] as const;
export type GameMode = typeof gameModes[number]['id'];
export const isGameMode = (value: unknown): value is GameMode => gameModes.some(mode => mode.id === value);

interface QuestionContent { id: string; prompt: string; promptLanguage: string; answerLanguage: string; correctAnswer: string }
export interface ChoiceQuestion extends QuestionContent { kind: 'choice'; options: string[]; image?: { url: string; alt: string } }
export interface TypingQuestion extends QuestionContent { kind: 'typing' }
export type Question = ChoiceQuestion | TypingQuestion;
export interface GameState { index: number; answers: string[] }
export interface SessionConfig { language: string; level: LevelId; topic: string; mode: GameMode; questionCount: number }
export interface VocabularySession { config: SessionConfig; questions: Question[]; state: GameState }
export type GameAction = { type: 'answer'; answer: string } | { type: 'next' } | { type: 'restart' };

export const normalizeAnswer = (answer: string) => answer.trim().normalize('NFC').toLowerCase();
export const isLocalImage = (url: string) => /^\/images\/vocabulary\/[a-z0-9-]+\.svg$/.test(url);

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

// Topic words come first; callers supply the shared dataset already filtered to the level.
export function generateDistractors(word: Word, answerField: 'word' | 'meaning', words: Word[], pool: Word[] = words, random: () => number = Math.random): string[] {
  const spelling = normalizeAnswer(word.word);
  const meaning = normalizeAnswer(word.meaning);
  const seen = new Set([normalizeAnswer(word[answerField])]);
  const candidates = (source: Word[]) => source.filter(candidate => candidate.language === word.language && normalizeAnswer(candidate.word) !== spelling && normalizeAnswer(candidate.meaning) !== meaning);
  const wrong: string[] = [];
  for (const candidate of [...shuffle(candidates(words), random), ...shuffle(candidates(pool), random)]) {
    const answer = candidate[answerField];
    const normalized = normalizeAnswer(answer);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    wrong.push(answer);
    if (wrong.length === 3) break;
  }
  return wrong;
}

export function generateQuestions(words: Word[], mode: GameMode, pool: Word[] = words, random: () => number = Math.random): Question[] {
  const questions: Question[] = [];
  const ids = new Set<string>();
  const spellings = new Set<string>();
  for (const word of words) {
    const id = `${word.language}-${word.id}`;
    const spelling = `${word.language}:${normalizeAnswer(word.word)}`;
    if (ids.has(id) || spellings.has(spelling) || !word.word.trim() || !word.meaning.trim()) continue;
    if (mode === 'image-to-word' && (!word.imageUrl || !isLocalImage(word.imageUrl) || !word.imageAlt?.trim())) continue;
    const reverse = mode !== 'word-to-meaning';
    const correctAnswer = reverse ? word.word : word.meaning;
    const content = { id, prompt: mode === 'image-to-word' ? 'Which word matches this picture?' : reverse ? word.meaning : word.word, promptLanguage: reverse ? 'vi' : word.language, answerLanguage: reverse ? word.language : 'vi', correctAnswer };
    if (mode === 'type-the-word') {
      questions.push({ ...content, kind: 'typing' });
    } else {
      const wrong = generateDistractors(word, reverse ? 'word' : 'meaning', words, pool, random);
      if (wrong.length < 3) continue;
      questions.push({ ...content, kind: 'choice', options: shuffle([correctAnswer, ...wrong], random), ...(mode === 'image-to-word' ? { promptLanguage: word.language, image: { url: word.imageUrl!, alt: word.imageAlt! } } : {}) });
    }
    ids.add(id);
    spellings.add(spelling);
  }
  return questions;
}

export function createSession(config: SessionConfig, bank: Question[], random: () => number = Math.random): VocabularySession | null {
  if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || !bank.length) return null;
  const questions = shuffle(bank, random).slice(0, config.questionCount).map(question => question.kind === 'choice' ? { ...question, options: shuffle(question.options, random) } : question);
  return { config: { ...config, questionCount: questions.length }, questions, state: { index: 0, answers: [] } };
}

export function isCorrectAnswer(question: Question, answer: string): boolean {
  return question.kind === 'typing' ? normalizeAnswer(answer) === normalizeAnswer(question.correctAnswer) : answer === question.correctAnswer;
}

function isAllowedAnswer(question: Question, answer: unknown): answer is string {
  return typeof answer === 'string' && (question.kind === 'choice' ? question.options.includes(answer) : answer.trim().length > 0 && answer.length <= 100);
}

export function advanceGame(state: GameState, action: GameAction, questions: Question[]): GameState {
  if (action.type === 'restart') return { index: 0, answers: [] };
  const question = questions[state.index];
  if (!question) return state;
  if (action.type === 'answer' && state.answers.length === state.index && isAllowedAnswer(question, action.answer)) return { ...state, answers: [...state.answers, action.answer] };
  if (action.type === 'next' && state.answers.length > state.index) return { ...state, index: state.index + 1 };
  return state;
}

export function getScore(answers: string[], questions: Question[]): number {
  return answers.reduce((score, answer, index) => score + Number(!!questions[index] && isCorrectAnswer(questions[index], answer)), 0);
}

export function getStats(session: VocabularySession) {
  const correct = getScore(session.state.answers, session.questions);
  const completed = session.state.answers.length;
  const total = session.questions.length;
  return { correct, incorrect: completed - correct, completed, total, percentage: total ? Math.round(correct / total * 100) : 0, finished: session.state.index === total };
}

export function isValidGameState(value: unknown, questions: Question[]): value is GameState {
  if (!value || typeof value !== 'object' || !('index' in value) || !('answers' in value)) return false;
  const { index, answers } = value;
  return typeof index === 'number' && Number.isInteger(index) && index >= 0 && index <= questions.length && Array.isArray(answers) &&
    (answers.length === index || (index < questions.length && answers.length === index + 1)) && answers.every((answer, position) => !!questions[position] && isAllowedAnswer(questions[position], answer));
}

export function isValidQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false;
  const question = value as Question;
  if (![question.id, question.prompt, question.promptLanguage, question.answerLanguage, question.correctAnswer].every(field => typeof field === 'string' && field.trim())) return false;
  if (question.kind === 'typing') return true;
  return question.kind === 'choice' && Array.isArray(question.options) && question.options.length === 4 && question.options.every(option => typeof option === 'string' && option.trim()) &&
    new Set(question.options.map(normalizeAnswer)).size === 4 && question.options.includes(question.correctAnswer) &&
    (!question.image || (typeof question.image.url === 'string' && isLocalImage(question.image.url) && typeof question.image.alt === 'string' && !!question.image.alt.trim()));
}
