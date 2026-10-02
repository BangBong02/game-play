import type { Word } from '../types/content';

export interface MultipleChoiceQuestion {
  id: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export interface GameState {
  index: number;
  answers: string[];
}

export type GameAction = { type: 'answer'; answer: string } | { type: 'next' } | { type: 'restart' };

export function createQuestions(words: Word[]): MultipleChoiceQuestion[] {
  const meanings = [...new Set(words.map(word => word.meaning))];
  if (meanings.length < 4) return [];
  return words.map((word, index) => {
    const wrong = meanings.filter(meaning => meaning !== word.meaning);
    const options = Array.from({ length: 3 }, (_, offset) => wrong[(index + offset) % wrong.length]);
    options.splice(index % 4, 0, word.meaning);
    return { id: `${word.language}-${word.id}`, prompt: word.word, correctAnswer: word.meaning, options };
  });
}

export function advanceGame(state: GameState, action: GameAction, questions: MultipleChoiceQuestion[]): GameState {
  if (action.type === 'restart') return { index: 0, answers: [] };
  const question = questions[state.index];
  if (!question) return state;
  if (action.type === 'answer' && state.answers.length === state.index && question.options.includes(action.answer)) {
    return { ...state, answers: [...state.answers, action.answer] };
  }
  if (action.type === 'next' && state.answers.length > state.index) return { ...state, index: state.index + 1 };
  return state;
}

export function getScore(answers: string[], questions: MultipleChoiceQuestion[]): number {
  return answers.reduce((score, answer, index) => score + Number(answer === questions[index]?.correctAnswer), 0);
}

export function isValidGameState(value: unknown, questions: MultipleChoiceQuestion[]): value is GameState {
  if (!value || typeof value !== 'object' || !('index' in value) || !('answers' in value)) return false;
  const { index, answers } = value;
  return typeof index === 'number' && Number.isInteger(index) && index >= 0 && index <= questions.length &&
    Array.isArray(answers) && (answers.length === index || (index < questions.length && answers.length === index + 1)) &&
    answers.every((answer, position) => typeof answer === 'string' && questions[position]?.options.includes(answer));
}
