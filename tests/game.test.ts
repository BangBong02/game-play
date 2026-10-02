import assert from 'node:assert/strict';
import test from 'node:test';
import { wordBelongsToLevel } from '../src/config/course.ts';
import { createQuestions, advanceGame, getScore, isValidGameState, type GameState } from '../src/game/multiple-choice.ts';
import { progressStore, type SavedProgress } from '../src/services/progress.ts';
import type { Word } from '../src/types/content.ts';

const words: Word[] = ['dog', 'cat', 'bird', 'fish', 'cow'].map((word, index) => ({ id: index, language: 'en', word, meaning: `meaning ${index}`, rank: index + 1, topics: ['animals'] }));
const questions = createQuestions(words);

test('level thresholds are inclusive and cumulative', () => {
  for (const [level, max] of [['easy', 300], ['medium', 1200], ['hard', 3000]] as const) {
    assert.equal(wordBelongsToLevel(max, level), true);
    assert.equal(wordBelongsToLevel(max + 1, level), false);
    assert.equal(wordBelongsToLevel(0, level), false);
    assert.equal(wordBelongsToLevel(1.5, level), false);
  }
  assert.equal(wordBelongsToLevel(300, 'hard'), true);
});

test('each question has exactly four unique options and one correct answer', () => {
  assert.equal(questions.length, words.length);
  for (const question of questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options.filter(option => option === question.correctAnswer).length, 1);
  }
  assert.deepEqual(createQuestions(words), questions);
});

test('insufficient or duplicate meanings cannot generate invalid questions', () => {
  assert.deepEqual(createQuestions(words.slice(0, 3)), []);
  assert.deepEqual(createQuestions(words.map(word => ({ ...word, meaning: 'same' }))), []);
});

test('answer locks once submitted and cannot skip unanswered questions', () => {
  const initial = { index: 0, answers: [] };
  assert.deepEqual(advanceGame(initial, { type: 'next' }, questions), initial);
  assert.deepEqual(advanceGame(initial, { type: 'answer', answer: 'invalid' }, questions), initial);
  const answered = advanceGame(initial, { type: 'answer', answer: questions[0].correctAnswer }, questions);
  assert.equal(getScore(answered.answers, questions), 1);
  assert.deepEqual(advanceGame(answered, { type: 'answer', answer: questions[0].options[1] }, questions), answered);
  assert.equal(advanceGame(answered, { type: 'next' }, questions).index, 1);
});

test('mixed answers score correctly, complete, and restart cleanly', () => {
  let state: GameState = { index: 0, answers: [] };
  questions.forEach((question, index) => {
    const answer = index === 0 ? question.options.find(option => option !== question.correctAnswer)! : question.correctAnswer;
    state = advanceGame(state, { type: 'answer', answer }, questions);
    state = advanceGame(state, { type: 'next' }, questions);
  });
  assert.equal(state.index, questions.length);
  assert.equal(getScore(state.answers, questions), questions.length - 1);
  assert.equal(isValidGameState(state, questions), true);
  assert.deepEqual(advanceGame(state, { type: 'next' }, questions), state);
  assert.deepEqual(advanceGame(state, { type: 'restart' }, questions), { index: 0, answers: [] });
});

test('resume accepts valid states and rejects corrupted saved answers', () => {
  assert.equal(isValidGameState({ index: 0, answers: [] }, questions), true);
  assert.equal(isValidGameState({ index: 0, answers: [questions[0].correctAnswer] }, questions), true);
  for (const state of [null, {}, { index: -1, answers: [] }, { index: 0.5, answers: [] }, { index: 2, answers: [] }, { index: 0, answers: ['bad'] }, { index: 0, answers: [null] }]) {
    assert.equal(isValidGameState(state, questions), false);
  }
});

test('progress storage round-trips and keeps languages, levels, topics separate', () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  const progress: SavedProgress = { language: 'en', level: 'easy', topic: 'animals', state: { index: 1, answers: [questions[0].correctAnswer] }, signature: JSON.stringify(questions), completed: 1, total: 5, score: 1, updatedAt: new Date().toISOString() };
  assert.equal(progressStore.save(progress), true);
  assert.deepEqual(progressStore.get(progress), progress);
  assert.equal(progressStore.get({ ...progress, level: 'medium' }), null);
  assert.equal(progressStore.get({ ...progress, language: 'jp' }), null);
  values.set('lingoplay:v1:en:easy:animals', 'bad json');
  assert.equal(progressStore.get(progress), null);
});

test('blocked storage does not prevent game play', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  assert.equal(progressStore.get({ language: 'en', level: 'easy', topic: 'animals' }), null);
  assert.equal(progressStore.save({ language: 'en', level: 'easy', topic: 'animals', state: { index: 0, answers: [] }, signature: '', completed: 0, total: 5, score: 0, updatedAt: '' }), false);
});
