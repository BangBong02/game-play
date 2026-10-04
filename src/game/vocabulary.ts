import type { LevelId } from '../config/course';
import type { Word } from '../types/content';
import { isMediaUrl, isWordEligible } from './eligibility.ts';
import type { Practice } from './learning';

export const gameModes = [
  { id: 'word-to-meaning', name: 'Word → Meaning', description: 'Word meaning · Choose the Vietnamese meaning.', icon: 'Aa' },
  { id: 'meaning-to-word', name: 'Meaning → Word', description: 'Word recall · Find the English word.', icon: '↔' },
  { id: 'image-to-word', name: 'Image → Word', description: 'Picture vocabulary · Match the image to a word.', icon: '▧' },
  { id: 'type-the-word', name: 'Type the Word', description: 'Spelling · Type the English word.', icon: '⌨' },
  { id: 'listen-to-image', name: 'Listen → Image', description: 'Listen and identify the picture.', icon: '♫' },
  { id: 'image-match', name: 'Image Match', description: 'Connect words and pictures in small boards.', icon: '↔' },
] as const;
export type GameMode = typeof gameModes[number]['id'];
export const isGameMode = (value: unknown): value is GameMode => gameModes.some(mode => mode.id === value);

interface QuestionContent { id: string; prompt: string; promptLanguage: string; answerLanguage: string; correctAnswer: string }
export interface ChoiceQuestion extends QuestionContent { kind: 'choice'; options: string[]; image?: { url: string; alt: string }; audio?: string; optionImages?: { answer: string; url: string; alt: string }[] }
export interface TypingQuestion extends QuestionContent { kind: 'typing' }
export interface MatchingQuestion extends QuestionContent { kind: 'matching'; image: { url: string; alt: string } }
export type Question = ChoiceQuestion | TypingQuestion | MatchingQuestion;
export interface GameState { index: number; answers: string[] }
export interface SessionConfig { language: string; level?: LevelId; game?: string; startRank?: number; topic: string; mode: GameMode; questionCount: number; practice?: Practice }
export interface VocabularySession { config: SessionConfig; questions: Question[]; state: GameState; imageOrder?: string[]; id?: string }
export type GameAction = { type: 'answer'; answer: string } | { type: 'match'; id: string; answer: string } | { type: 'next' } | { type: 'restart' };
export const matchBoardSize = 4;
// Avoid a final board with a single trivial pair (e.g. five pairs become 3 + 2).
export const matchBoardEnd = (start: number, total: number) => Math.min(total, start + (total - start === 5 ? 3 : matchBoardSize));
function matchBoardStarts(total: number): number[] {
  const starts: number[] = [];
  for (let start = 0; start < total; start = matchBoardEnd(start, total)) starts.push(start);
  return starts;
}

export const normalizeAnswer = (answer: string) => answer.trim().normalize('NFC').toLowerCase();

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

// Topic words come first; callers supply the shared English-learning dataset.
export function generateDistractors(word: Word, answerField: 'word' | 'meaning', words: Word[], pool: Word[] = words, random: () => number = Math.random): string[] {
  const spelling = normalizeAnswer(word.word);
  const meaning = normalizeAnswer(word.meaning);
  const seen = new Set([normalizeAnswer(word[answerField])]);
  const candidates = (source: Word[]) => source.filter(candidate => isWordEligible(candidate, 'word-to-meaning') && candidate.language === word.language && normalizeAnswer(candidate.word) !== spelling && normalizeAnswer(candidate.meaning) !== meaning);
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
    const id = word.id;
    const spelling = `${word.language}:${normalizeAnswer(word.word)}`;
    if (ids.has(id) || spellings.has(spelling) || !isWordEligible(word, mode)) continue;
    const reverse = mode !== 'word-to-meaning';
    const correctAnswer = reverse ? word.word : word.meaning;
    const listening = mode === 'listen-to-image';
    const content = { id, prompt: listening ? 'Listen and pick a picture.' : mode === 'image-to-word' ? 'Which word matches this picture?' : reverse ? word.meaning : word.word, promptLanguage: listening ? word.language : reverse ? 'vi' : word.language, answerLanguage: reverse ? word.language : 'vi', correctAnswer };
    if (mode === 'image-match') {
      questions.push({ ...content, prompt: word.word, promptLanguage: word.language, kind: 'matching', image: { url: word.imageUrl!, alt: word.imageAlt! } });
    } else if (mode === 'type-the-word') {
      questions.push({ ...content, kind: 'typing' });
    } else {
      const optionPool = listening ? pool.filter(item => isWordEligible(item, mode)) : pool;
      const wrong = generateDistractors(word, reverse ? 'word' : 'meaning', listening ? words.filter(item => isWordEligible(item, mode)) : words, optionPool, random);
      if (wrong.length < 3) continue;
      const options = shuffle([correctAnswer, ...wrong], random);
      questions.push({ ...content, kind: 'choice', options, ...(mode === 'image-to-word' ? { promptLanguage: word.language, image: { url: word.imageUrl!, alt: word.imageAlt! } } : {}), ...(listening ? { audio: word.audioUrl!, optionImages: options.map(answer => { const item = answer === word.word ? word : optionPool.find(item => item.word === answer)!; return { answer, url: item.imageUrl!, alt: item.imageAlt! }; }) } : {}) });
    }
    ids.add(id);
    spellings.add(spelling);
  }
  return mode === 'image-match' && questions.length < 2 ? [] : questions;
}

export function createSession(config: SessionConfig, bank: Question[], random: () => number = Math.random): VocabularySession | null {
  if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || !bank.length) return null;
  const questions = shuffle(bank, random).slice(0, config.questionCount).map(question => question.kind === 'choice' ? { ...question, options: shuffle(question.options, random) } : question);
  if (config.mode === 'image-match' && questions.length < 2) return null;
  return { config: { ...config, questionCount: questions.length }, questions, state: { index: 0, answers: [] }, ...(config.mode === 'image-match' ? { imageOrder: shuffle(questions.map(question => question.id), random) } : {}) };
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
  if (question.kind === 'matching') {
    const end = matchBoardEnd(state.index, questions.length);
    const board = questions.slice(state.index, end);
    if (action.type === 'match') {
      const position = questions.findIndex(item => item.id === action.id);
      if (position < state.index || position >= end || state.answers[position] || !board.some(item => item.correctAnswer === action.answer)) return state;
      const answers = state.answers.length ? [...state.answers] : Array<string>(questions.length).fill('');
      answers[position] = action.answer;
      return { ...state, answers };
    }
    if (action.type === 'next' && board.every((_, index) => !!state.answers[state.index + index])) return { ...state, index: end };
    return state;
  }
  if (action.type === 'answer' && state.answers.length === state.index && isAllowedAnswer(question, action.answer)) return { ...state, answers: [...state.answers, action.answer] };
  if (action.type === 'next' && state.answers.length > state.index) return { ...state, index: state.index + 1 };
  return state;
}

export function getScore(answers: string[], questions: Question[]): number {
  return answers.reduce((score, answer, index) => score + Number(!!questions[index] && isCorrectAnswer(questions[index], answer)), 0);
}

export function getStats(session: VocabularySession) {
  const correct = getScore(session.state.answers, session.questions);
  const completed = session.state.answers.filter(Boolean).length;
  const total = session.questions.length;
  return { correct, incorrect: completed - correct, completed, total, percentage: total ? Math.round(correct / total * 100) : 0, finished: session.state.index === total };
}

export function isValidGameState(value: unknown, questions: Question[]): value is GameState {
  if (!value || typeof value !== 'object' || !('index' in value) || !('answers' in value)) return false;
  const { index, answers } = value;
  if (questions.every(question => question.kind === 'matching')) {
    const starts = matchBoardStarts(questions.length);
    if (typeof index !== 'number' || ![...starts, questions.length].includes(index) || !Array.isArray(answers)) return false;
    if (!answers.length) return index === 0;
    if (answers.length !== questions.length) return false;
    return answers.every((answer, position) => {
      if (typeof answer !== 'string') return false;
      if (position < index && !answer) return false;
      if (position >= matchBoardEnd(index, questions.length) && answer) return false;
      const start = starts.findLast(start => start <= position)!;
      return answer === '' || questions.slice(start, matchBoardEnd(start, questions.length)).some(item => item.correctAnswer === answer);
    });
  }
  return typeof index === 'number' && Number.isInteger(index) && index >= 0 && index <= questions.length && Array.isArray(answers) &&
    (answers.length === index || (index < questions.length && answers.length === index + 1)) && answers.every((answer, position) => !!questions[position] && isAllowedAnswer(questions[position], answer));
}

export function isValidQuestion(value: unknown): value is Question {
  if (!value || typeof value !== 'object') return false;
  const question = value as Question;
  if (![question.id, question.prompt, question.promptLanguage, question.answerLanguage, question.correctAnswer].every(field => typeof field === 'string' && field.trim())) return false;
  if (question.kind === 'typing') return true;
  if (question.kind === 'matching') return !!question.image && isMediaUrl(question.image.url) && typeof question.image.alt === 'string' && !!question.image.alt.trim();
  return question.kind === 'choice' && Array.isArray(question.options) && question.options.length === 4 && question.options.every(option => typeof option === 'string' && option.trim()) &&
    new Set(question.options.map(normalizeAnswer)).size === 4 && question.options.includes(question.correctAnswer) &&
    (!question.image || (isMediaUrl(question.image.url) && typeof question.image.alt === 'string' && !!question.image.alt.trim())) &&
    (question.audio === undefined || isMediaUrl(question.audio)) &&
    (question.optionImages === undefined || (Array.isArray(question.optionImages) && question.optionImages.length === 4 && new Set(question.optionImages.map(image => image.answer)).size === 4 && question.optionImages.every(image => question.options.includes(image.answer) && isMediaUrl(image.url) && typeof image.alt === 'string' && !!image.alt.trim())));
}
