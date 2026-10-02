import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { wordBelongsToLevel } from '../src/config/course.ts';
import { words as dataset } from '../src/data/content.ts';
import { filterWords } from '../src/repositories/content.ts';
import { advanceGame, createSession, gameModes, generateQuestions, getScore, getStats, isCorrectAnswer, isValidGameState, isValidQuestion, normalizeAnswer, type ChoiceQuestion, type GameState, type SessionConfig } from '../src/game/vocabulary.ts';
import { createSavedProgress, progressStore, readStoredSession } from '../src/services/progress.ts';
import type { Word } from '../src/types/content.ts';

const words: Word[] = ['dog', 'cat', 'bird', 'fish', 'cow'].map((word, index) => ({ id: index + 1, language: 'en', word, meaning: `meaning ${index}`, rank: index + 1, topics: ['animals'], imageUrl: `/images/vocabulary/${word}.svg`, imageAlt: `Demo illustration ${index}` }));
const random = () => 0.25;
const questions = generateQuestions(words, 'word-to-meaning', words, random) as ChoiceQuestion[];
const config: SessionConfig = { language: 'en', level: 'easy', topic: 'animals', mode: 'word-to-meaning', questionCount: 5 };

function storage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  return values;
}

function finish(session: NonNullable<ReturnType<typeof createSession>>) {
  let state = session.state;
  session.questions.forEach((question, index) => {
    const answer = index === 0 ? question.kind === 'choice' ? question.options.find(option => option !== question.correctAnswer)! : 'wrong word' : question.correctAnswer;
    state = advanceGame(state, { type: 'answer', answer }, session.questions);
    state = advanceGame(state, { type: 'next' }, session.questions);
  });
  return { ...session, state };
}

test('level thresholds are inclusive and cumulative', () => {
  for (const [level, max] of [['easy', 300], ['medium', 1200], ['hard', 3000]] as const) {
    assert.equal(wordBelongsToLevel(max, level), true);
    assert.equal(wordBelongsToLevel(max + 1, level), false);
    assert.equal(wordBelongsToLevel(0, level), false);
    assert.equal(wordBelongsToLevel(1.5, level), false);
  }
  assert.equal(wordBelongsToLevel(300, 'hard'), true);
});

test('shared data filters language, level and topic before generating questions', () => {
  const sample = [...words, { ...words[0], id: 10, rank: 301 }, { ...words[0], id: 11, rank: 1201 }, { ...words[0], id: 12, language: 'fr' }, { ...words[0], id: 13, topics: ['food'] }];
  assert.equal(filterWords(sample, 'en', 'easy', 'animals').length, 5);
  assert.equal(filterWords(sample, 'en', 'medium', 'animals').length, 6);
  assert.equal(filterWords(sample, 'en', 'hard', 'animals').length, 7);
  assert.equal(filterWords(sample, 'en', 'easy').length, 6);
  assert.equal(filterWords(sample, 'fr', 'easy', 'animals').length, 1);
});

test('all choice modes contain four unique answers with exactly one correct answer', () => {
  for (const mode of gameModes.filter(mode => mode.id !== 'type-the-word')) {
    const generated = generateQuestions(words, mode.id, words, random);
    assert.equal(generated.length, words.length);
    for (const question of generated) {
      assert.equal(isValidQuestion(question), true);
      assert.equal(question.kind, 'choice');
      if (question.kind !== 'choice') continue;
      assert.equal(new Set(question.options.map(normalizeAnswer)).size, 4);
      assert.equal(question.options.filter(option => option === question.correctAnswer).length, 1);
      assert.equal(question.correctAnswer, mode.id === 'word-to-meaning' ? words.find(word => `en-${word.id}` === question.id)!.meaning : words.find(word => `en-${word.id}` === question.id)!.word);
    }
    assert.deepEqual(generateQuestions(words, mode.id, words, random), generated);
  }
});

test('distractors prefer topic words and fall back safely within the provided level pool', () => {
  const outside = { ...words[0], id: 99, word: 'apple', meaning: 'fruit', topics: ['food'] };
  const generated = generateQuestions(words, 'meaning-to-word', [...words, outside], random) as ChoiceQuestion[];
  assert.equal(generated.some(question => question.options.includes('apple')), false);
  const small = generateQuestions(words.slice(0, 1), 'meaning-to-word', words, random);
  assert.equal(small.length, 1);
  assert.equal(generateQuestions(words.slice(0, 3), 'word-to-meaning').length, 0);
  assert.equal(generateQuestions(words.map(word => ({ ...word, meaning: 'same' })), 'word-to-meaning').length, 0);
  assert.equal(generateQuestions(words.map(word => ({ ...word, meaning: 'same' })), 'meaning-to-word').length, 0);
  const duplicates = [...words, words[0], { ...words[0], id: 50, word: 'DOG', meaning: 'Meaning 0' }];
  assert.equal(generateQuestions(duplicates, 'word-to-meaning', duplicates, random).filter(question => question.id === 'en-1').length, 1);
  assert.equal(generateQuestions(duplicates, 'word-to-meaning', duplicates, random).length, words.length);
});

test('image questions use only available local SVGs with descriptive alternative text', () => {
  assert.equal(dataset.length, 20);
  for (const word of dataset) {
    assert.ok(word.imageUrl && existsSync(`public${word.imageUrl}`));
    assert.ok(word.imageAlt?.trim());
  }
  assert.equal(generateQuestions([{ ...words[0], imageUrl: 'https://example.com/dog.svg' }], 'image-to-word', words).length, 0);
  assert.equal(generateQuestions([{ ...words[0], imageAlt: undefined }], 'image-to-word', words).length, 0);
  assert.equal(generateQuestions([{ ...words[0], imageUrl: undefined }], 'image-to-word', words).length, 0);
});

test('sessions honor question count, shuffle without mutation, cap small banks and reject invalid counts', () => {
  const snapshot = JSON.stringify(questions);
  const session = createSession({ ...config, questionCount: 3 }, questions, random)!;
  assert.equal(session.questions.length, 3);
  assert.equal(new Set(session.questions.map(question => question.id)).size, 3);
  assert.equal(JSON.stringify(questions), snapshot);
  assert.notDeepEqual(session.questions.map(question => question.id), questions.slice(0, 3).map(question => question.id));
  assert.equal(createSession({ ...config, questionCount: 10 }, questions)!.config.questionCount, 5);
  for (const questionCount of [0, -1, 1.5]) assert.equal(createSession({ ...config, questionCount }, questions), null);
  assert.equal(createSession(config, []), null);
});

test('answers lock once submitted and unanswered questions cannot be skipped', () => {
  const initial = { index: 0, answers: [] };
  assert.equal(advanceGame(initial, { type: 'next' }, questions), initial);
  assert.equal(advanceGame(initial, { type: 'answer', answer: 'invalid' }, questions), initial);
  const answered = advanceGame(initial, { type: 'answer', answer: questions[0].correctAnswer }, questions);
  assert.equal(getScore(answered.answers, questions), 1);
  assert.equal(advanceGame(answered, { type: 'answer', answer: questions[0].options[1] }, questions), answered);
  assert.equal(advanceGame(answered, { type: 'next' }, questions).index, 1);
});

test('typing trims whitespace, ignores case, handles wrong answers and refuses empty input', () => {
  const typed = generateQuestions(words, 'type-the-word');
  assert.equal(isCorrectAnswer(typed[0], '  DOG  '), true);
  assert.equal(isCorrectAnswer(typed[0], 'cat'), false);
  assert.equal(isCorrectAnswer(typed[0], 'do g'), false);
  const initial = { index: 0, answers: [] };
  assert.equal(advanceGame(initial, { type: 'answer', answer: '   ' }, typed), initial);
  const state = advanceGame(initial, { type: 'answer', answer: ' DOG ' }, typed);
  assert.equal(getScore(state.answers, typed), 1);
  assert.equal(advanceGame(state, { type: 'answer', answer: 'cat' }, typed), state);
  assert.equal(isValidGameState(state, typed), true);
  assert.equal(generateQuestions(words.slice(0, 1), 'type-the-word').length, 1);
});

test('every mode shares mixed scoring, explicit next, completion, percentage and restart', () => {
  for (const mode of gameModes) {
    const bank = generateQuestions(words, mode.id);
    const session = finish(createSession({ ...config, mode: mode.id }, bank)!);
    assert.deepEqual(getStats(session), { correct: 4, incorrect: 1, completed: 5, total: 5, percentage: 80, finished: true });
    assert.equal(isValidGameState(session.state, session.questions), true);
    assert.equal(advanceGame(session.state, { type: 'next' }, session.questions), session.state);
    assert.deepEqual(advanceGame(session.state, { type: 'restart' }, session.questions), { index: 0, answers: [] });
  }
});

test('resume rejects corrupted states and questions', () => {
  for (const state of [null, {}, { index: -1, answers: [] }, { index: 0.5, answers: [] }, { index: 2, answers: [] }, { index: 0, answers: ['bad'] }, { index: 0, answers: [null] }]) assert.equal(isValidGameState(state, questions), false);
  assert.equal(isValidQuestion({ ...questions[0], options: [questions[0].correctAnswer, 'same', 'same', 'other'] }), false);
  const session = createSession(config, questions)!;
  const saved = createSavedProgress(session);
  assert.equal(readStoredSession({ ...saved, session: { ...session, questions: [null] } }, config, config.mode, questions), null);
  assert.equal(readStoredSession({ ...saved, session: { ...session, config: { ...config, topic: 'food' } } }, config, config.mode, questions), null);
  assert.equal(readStoredSession({ ...saved, session: { ...session, questions: session.questions.map(question => ({ ...question, prompt: 'changed' })) } }, config, config.mode, questions), null);
});

test('progress round-trips exact shuffled sessions and isolates mode, language, level and topic', () => {
  const values = storage();
  const session = createSession(config, questions, random)!;
  session.state = advanceGame(session.state, { type: 'answer', answer: session.questions[0].correctAnswer }, session.questions);
  const saved = createSavedProgress(session);
  assert.equal(progressStore.save(saved), true);
  assert.deepEqual(readStoredSession(progressStore.get(config), config, config.mode, questions), session);
  assert.equal((progressStore.get({ ...config, mode: undefined }) as { mode: string }).mode, config.mode);
  for (const key of [{ ...config, level: 'medium' }, { ...config, language: 'fr' }, { ...config, topic: 'food' }, { ...config, mode: 'type-the-word' as const }]) assert.equal(progressStore.get(key), null);
  const typed = createSession({ ...config, mode: 'type-the-word' }, generateQuestions(words, 'type-the-word'))!;
  assert.equal(progressStore.save(createSavedProgress(typed)), true);
  assert.deepEqual(progressStore.get(config), saved);
  values.set('lingoplay:v2:en:easy:animals:word-to-meaning', 'bad json');
  assert.equal(progressStore.get(config), null);
});

test('completed result survives restart while new round state is reset', () => {
  const finished = finish(createSession(config, questions)!);
  const saved = createSavedProgress(finished);
  assert.deepEqual(saved.lastResult, { correct: 4, incorrect: 1, total: 5, percentage: 80 });
  const next = createSavedProgress({ ...finished, state: { index: 0, answers: [] } }, saved);
  assert.equal(next.score, 0);
  assert.equal(next.completed, 0);
  assert.deepEqual(next.lastResult, saved.lastResult);
});

test('v1 progress migrates with its original question order, answers and options preserved', () => {
  const values = storage();
  const oldQuestions = questions.map(({ id, prompt, correctAnswer, options }) => ({ id, prompt, correctAnswer, options }));
  const state: GameState = { index: 1, answers: [questions[0].correctAnswer] };
  const legacy = { language: 'en', level: 'easy', topic: 'animals', state, signature: JSON.stringify(oldQuestions), completed: 1, total: 5, score: 1, updatedAt: '' };
  const original = JSON.stringify(legacy);
  values.set('lingoplay:v1:en:easy:animals', original);
  const session = readStoredSession(progressStore.get(config), config, config.mode, questions)!;
  assert.ok(session);
  assert.deepEqual(session.state, state);
  assert.deepEqual(session.questions.map(question => question.id), oldQuestions.map(question => question.id));
  assert.deepEqual((session.questions[0] as ChoiceQuestion).options, oldQuestions[0].options);
  assert.equal(progressStore.save(createSavedProgress(session)), true);
  assert.equal(values.get('lingoplay:v1:en:easy:animals'), original);
  assert.equal(progressStore.get({ ...config, mode: 'meaning-to-word' }), null);
  assert.equal(readStoredSession({ ...legacy, signature: 'bad json' }, config, config.mode, questions), null);
});

test('blocked storage never prevents playing or scoring', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  assert.equal(progressStore.get(config), null);
  assert.equal(progressStore.save(createSavedProgress(createSession(config, questions)!)), false);
  assert.equal(getStats(finish(createSession(config, questions)!)).correct, 4);
});
