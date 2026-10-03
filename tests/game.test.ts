import { games, getGames, gameSkills } from '../src/config/games.ts';
import { locales, messages, localePath, learningLanguage } from '../src/i18n.ts';
﻿import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { levels, wordBelongsToLevel } from '../src/config/course.ts';
import { topics, words as dataset } from '../src/data/content.ts';
import { filterWords, getWordsForProgress, wordRepository } from '../src/repositories/content.ts';
import { isMediaUrl, isWordEligible, type WordActivity } from '../src/game/eligibility.ts';
import { getWordsForGame } from '../src/repositories/queries.ts';
import { advanceGame, createSession, gameModes, generateDistractors, generateQuestions, getScore, getStats, isCorrectAnswer, isValidGameState, isValidQuestion, normalizeAnswer, type ChoiceQuestion, type GameState, type SessionConfig } from '../src/game/vocabulary.ts';
import { createSavedProgress, migrateLevelProgress, progressStore, readStoredSession } from '../src/services/progress.ts';
import type { Word } from '../src/types/content.ts';

const words: Word[] = ['dog', 'cat', 'bird', 'fish', 'cow'].map((word, index) => ({ id: `en-${word}`, language: 'en', word, meaning: `meaning ${index}`, level: 'easy', learningRank: index + 1, topics: ['animals'], imageUrl: `/images/vocabulary/${word}.svg`, imageAlt: `Demo illustration ${index}` }));
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

test('curriculum membership includes only selected and earlier levels in cumulative mode', () => {
  for (const [selectedIndex, selected] of levels.entries()) {
    for (const [wordIndex, wordLevel] of levels.entries()) {
      assert.equal(wordBelongsToLevel(wordLevel.id, selected.id), wordIndex <= selectedIndex);
      assert.equal(wordBelongsToLevel(wordLevel.id, selected.id, 'new-only'), wordLevel.id === selected.id);
    }
  }
});

test('shared data filters language, level and topic before generating questions', () => {
  const sample: Word[] = [...words, { ...words[0], id: 'en-medium', level: 'medium' }, { ...words[0], id: 'en-hard', level: 'hard' }, { ...words[0], id: 'fr-dog', language: 'fr' }, { ...words[0], id: 'en-food', topics: ['food'] }];
  assert.equal(filterWords(sample, 'en', 'easy', 'animals').length, 5);
  assert.equal(filterWords(sample, 'en', 'medium', 'animals').length, 6);
  assert.equal(filterWords(sample, 'en', 'hard', 'animals').length, 7);
  assert.equal(filterWords(sample, 'en', 'easy').length, 6);
  assert.equal(filterWords(sample, 'fr', 'easy', 'animals').length, 1);
});

test('new-only returns exact curriculum levels and partitions cumulative results', async () => {
  const counts = [43, 7, 2];
  const accumulated: Word[] = [];
  for (const [index, level] of levels.entries()) {
    const added = await wordRepository.list('en', level.id, undefined, 'new-only');
    assert.equal(added.length, counts[index]);
    assert.ok(added.every(word => word.level === level.id));
    accumulated.push(...added);
    assert.deepEqual(accumulated.map(word => word.id).sort(), filterWords(dataset, 'en', level.id).map(word => word.id).sort());
  }
});

test('learning order sorts ascending without mutating input or using frequency metadata for level', () => {
  const sample: Word[] = [
    { ...words[0], learningRank: 400, frequencyRank: 5000 },
    { ...words[1], learningRank: 2, frequencyRank: undefined },
    { ...words[2], level: 'medium', learningRank: 3, frequencyRank: 1 },
    { ...words[3], level: 'hard', learningRank: 1, frequencyRank: 2 },
    { ...words[4], learningRank: 20, frequencyRank: 10 },
  ];
  const snapshot = JSON.stringify(sample);
  assert.deepEqual(filterWords(sample, 'en', 'easy', undefined, 'new-only').map(word => word.id), ['en-cat', 'en-cow', 'en-dog']);
  assert.deepEqual(filterWords(sample, 'en', 'medium', undefined, 'new-only').map(word => word.id), ['en-bird']);
  assert.deepEqual(filterWords(sample, 'en', 'hard', undefined, 'new-only').map(word => word.id), ['en-fish']);
  assert.deepEqual(filterWords(sample, 'en', 'medium').map(word => word.id), ['en-cat', 'en-bird', 'en-cow', 'en-dog']);
  assert.deepEqual(filterWords(sample, 'en', 'hard').map(word => word.id), ['en-fish', 'en-cat', 'en-bird', 'en-cow', 'en-dog']);
  assert.equal(JSON.stringify(sample), snapshot);
  const changedFrequency = sample.map(word => ({ ...word, frequencyRank: undefined }));
  assert.deepEqual(filterWords(changedFrequency, 'en', 'hard').map(word => word.id), filterWords(sample, 'en', 'hard').map(word => word.id));
});

test('explicit demo IDs preserve pre-migration question IDs and stored rounds in every mode', () => {
  const values = storage();
  assert.equal(dataset.length, 52);
  assert.equal(new Set(dataset.map(word => word.id)).size, 52);
  assert.ok(dataset.every(word => typeof word.id === 'string' && word.id && !('rank' in word)));
  const selected = filterWords(dataset, 'en', 'easy', 'animals');
  assert.deepEqual(selected.map(word => word.id), ['en-1', 'en-2', 'en-3', 'en-4', 'en-5', 'en-7']);
  for (const mode of gameModes) {
    const bank = generateQuestions(selected, mode.id, selected, random);
    const session = createSession({ ...config, mode: mode.id }, bank, random)!;
    session.state = advanceGame(session.state, { type: 'answer', answer: session.questions[0].correctAnswer }, session.questions);
    progressStore.save(createSavedProgress(session));
    const before = [...values];
    const reordered = filterWords([...dataset].reverse(), 'en', 'easy', 'animals');
    const rebuiltBank = generateQuestions(reordered, mode.id, reordered, random);
    assert.deepEqual(readStoredSession(progressStore.get(session.config), session.config, mode.id, rebuiltBank), session);
    assert.deepEqual([...values], before);
  }
});

test('resume validates old distractors against the current curriculum pool, not a newly shuffled bank', () => {
  const pool = filterWords(dataset, 'en', 'medium');
  const targets = filterWords(dataset, 'en', 'medium', 'colors');
  const bank = generateQuestions(targets, 'meaning-to-word', pool, random) as ChoiceQuestion[];
  const session = createSession({ ...config, level: 'medium', topic: 'colors', mode: 'meaning-to-word', questionCount: 3 }, bank, random)!;
  const oldDistractor = pool.find(word => !bank.some(question => question.options.includes(word.word)))!;
  assert.ok(oldDistractor, 'Fixture needs a valid word absent from current shuffled choices');
  const first = session.questions[0] as ChoiceQuestion;
  first.options = [first.correctAnswer, oldDistractor.word, ...first.options.filter(option => option !== first.correctAnswer).slice(0, 2)];
  session.state = advanceGame(session.state, { type: 'answer', answer: oldDistractor.word }, session.questions);
  const saved = createSavedProgress(session);
  assert.equal(readStoredSession(saved, session.config, session.config.mode, bank), null);
  assert.deepEqual(readStoredSession(saved, session.config, session.config.mode, bank, pool.map(word => word.word)), session);
  assert.equal(readStoredSession(saved, session.config, session.config.mode, bank, pool.filter(word => word.id !== oldDistractor.id).map(word => word.word)), null);
  assert.equal(readStoredSession(saved, session.config, session.config.mode, bank, pool.map(word => word.meaning)), null);
});

test('demo data and topic counts use the selected language and actual level filter', async () => {
  const expected = [
    { total: 43, animals: 6, food: 11, colors: 0 },
    { total: 50, animals: 9, food: 12, colors: 3 },
    { total: 52, animals: 10, food: 12, colors: 4 },
  ];
  for (const [index, level] of levels.entries()) {
    const pool = await wordRepository.list('en', level.id);
    assert.equal(pool.length, expected[index].total);
    assert.ok(pool.every(word => wordBelongsToLevel(word.level, level.id)));
    assert.equal(new Set(pool.map(word => word.id)).size, pool.length);
    for (const topic of topics.filter(topic => ['animals', 'food', 'colors'].includes(topic.id))) {
      const filtered = await wordRepository.list('en', level.id, topic.id);
      assert.deepEqual(filtered, pool.filter(word => word.topics.includes(topic.id)));
      assert.equal(filtered.length, expected[index][topic.id as 'animals' | 'food' | 'colors'] ?? 0);
    }
  }
  assert.deepEqual(await wordRepository.list('fr', 'hard'), []);
});

test('a word can belong to multiple topics without duplication or mutation', () => {
  const snapshot = JSON.stringify(dataset);
  const chicken = dataset.find(word => word.word === 'chicken')!;
  for (const topic of ['animals', 'food']) {
    const filtered = filterWords(dataset, 'en', 'easy', topic);
    assert.equal(filtered.filter(word => word.id === chicken.id).length, 1);
  }
  assert.equal(filterWords(dataset, 'en', 'easy').filter(word => word.id === chicken.id).length, 1);
  assert.equal(JSON.stringify(dataset), snapshot);
});

test('eligibility separates text, image, visual matching and future listening requirements', () => {
  const textOnly = { ...words[0], imageUrl: undefined, audioUrl: undefined, visual: false };
  for (const mode of ['word-to-meaning', 'meaning-to-word', 'type-the-word'] as const) {
    assert.equal(isWordEligible(textOnly, mode), true);
    assert.equal(isWordEligible({ ...textOnly, word: ' ' }, mode), false);
    assert.equal(isWordEligible({ ...textOnly, meaning: ' ' }, mode), false);
  }
  assert.equal(isWordEligible(textOnly, 'image-to-word'), false);
  assert.equal(isWordEligible(words[0], 'image-to-word'), true);
  assert.equal(isWordEligible({ ...words[0], visual: false }, 'image-to-word'), false);
  assert.equal(isWordEligible({ ...words[0], imageAlt: ' ' }, 'image-to-word'), false);
  assert.equal(isWordEligible(words[0], 'image-match'), false);
  assert.equal(isWordEligible({ ...words[0], visual: true }, 'image-match'), true);
  assert.equal(isWordEligible({ ...textOnly, visual: true }, 'image-match'), false);
  assert.equal(isWordEligible({ ...words[0], visual: false }, 'image-match'), false);
  assert.equal(isWordEligible(textOnly, 'listening'), false);
  assert.equal(isWordEligible({ ...textOnly, audioUrl: ' ' }, 'listening'), false);
  assert.equal(isWordEligible({ ...textOnly, audioUrl: '/audio/dog.mp3' }, 'listening'), true);
  const mixed = [textOnly, ...words.slice(1)];
  assert.equal(generateQuestions(mixed, 'word-to-meaning').length, 5);
  assert.equal(generateQuestions(mixed, 'image-to-word').length, 4);
});

test('all four modes use filtered targets and distractors across levels, including small topics', () => {
  for (const level of levels) {
    const pool = filterWords(dataset, 'en', level.id);
    for (const topic of topics) {
      const targets = filterWords(dataset, 'en', level.id, topic.id);
      for (const mode of gameModes) {
        const bank = generateQuestions(targets, mode.id, pool, random);
        const eligible = targets.filter(word => isWordEligible(word, mode.id));
        assert.equal(bank.length, eligible.length);
        for (const question of bank) {
          assert.ok(targets.some(word => word.id === question.id));
          if (question.kind === 'choice') {
            const field = mode.id === 'word-to-meaning' ? 'meaning' : 'word';
            assert.ok(question.options.every(option => pool.some(word => word[field] === option)));
          }
        }
        assert.equal(createSession({ ...config, level: level.id, topic: topic.id, mode: mode.id }, bank)?.questions.length ?? 0, Math.min(5, eligible.length));
      }
    }
  }
});

test('empty level/topic results produce no playable sessions', async () => {
  const empty = await wordRepository.list('en', 'easy', 'colors');
  assert.deepEqual(empty, []);
  assert.deepEqual(filterWords([], 'en', 'hard'), []);
  assert.deepEqual(await wordRepository.list('en', 'easy', 'unknown'), []);
  for (const mode of gameModes) {
    const bank = generateQuestions(empty, mode.id, dataset);
    assert.deepEqual(bank, []);
    assert.equal(createSession({ ...config, mode: mode.id }, bank), null);
  }
});

test('saved rounds reject words moved outside their level without deleting stored progress', () => {
  const values = storage();
  const session = createSession(config, questions, random)!;
  progressStore.save(createSavedProgress(session));
  const before = [...values];
  const revised: Word[] = words.map(word => ({ ...word, level: word.id === 'en-dog' ? 'medium' : word.level }));
  const filtered = filterWords(revised, 'en', 'easy', 'animals');
  const bank = generateQuestions(filtered, config.mode, filtered, random);
  assert.equal(readStoredSession(progressStore.get(config), config, config.mode, bank), null);
  assert.deepEqual([...values], before);
  assert.ok(createSession(config, bank));
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
      assert.equal(question.correctAnswer, mode.id === 'word-to-meaning' ? words.find(word => word.id === question.id)!.meaning : words.find(word => word.id === question.id)!.word);
    }
    assert.deepEqual(generateQuestions(words, mode.id, words, random), generated);
  }
});

test('distractors prefer topic words and fall back safely within the provided level pool', () => {
  const outside = { ...words[0], id: 'en-apple', word: 'apple', meaning: 'fruit', topics: ['food'] };
  const generated = generateQuestions(words, 'meaning-to-word', [...words, outside], random) as ChoiceQuestion[];
  assert.equal(generated.some(question => question.options.includes('apple')), false);
  const small = generateQuestions(words.slice(0, 1), 'meaning-to-word', words, random);
  assert.equal(small.length, 1);
  assert.equal(generateQuestions(words.slice(0, 3), 'word-to-meaning').length, 0);
  assert.equal(generateQuestions(words.map(word => ({ ...word, meaning: 'same' })), 'word-to-meaning').length, 0);
  assert.equal(generateQuestions(words.map(word => ({ ...word, meaning: 'same' })), 'meaning-to-word').length, 0);
  const duplicates = [...words, words[0], { ...words[0], id: 'en-duplicate-dog', word: 'DOG', meaning: 'Meaning 0' }];
  assert.equal(generateQuestions(duplicates, 'word-to-meaning', duplicates, random).filter(question => question.id === 'en-dog').length, 1);
  assert.equal(generateQuestions(duplicates, 'word-to-meaning', duplicates, random).length, words.length);
});

test('distractor helper excludes equivalent answers, duplicates, blanks and other languages', () => {
  const invalid = [
    { ...words[0], id: 'en-duplicate-dog', word: ' DOG ', meaning: 'different meaning' },
    { ...words[0], id: 'en-hound', word: 'hound', meaning: ' MEANING 0 ' },
    { ...words[1], id: 'en-duplicate-cat', word: ' CAT ', meaning: ' MEANING 1 ' },
    { ...words[0], id: 'fr-chien', word: 'chien', meaning: 'French meaning', language: 'fr' },
    { ...words[0], id: 'en-blank', word: ' ', meaning: ' ' },
  ];
  const topic = words.slice(0, 2);
  const pool = [...words, ...invalid];
  const snapshot = JSON.stringify({ topic, pool });
  for (const field of ['word', 'meaning'] as const) {
    const distractors = generateDistractors(words[0], field, topic, pool, random);
    assert.equal(distractors[0], words[1][field]);
    assert.equal(distractors.length, 3);
    assert.equal(new Set(distractors.map(normalizeAnswer)).size, 3);
    assert.ok(distractors.every(answer => words.slice(1).some(word => normalizeAnswer(word[field]) === normalizeAnswer(answer))));
    assert.deepEqual(generateDistractors(words[0], field, topic, [], random), [words[1][field]]);
    assert.deepEqual(generateDistractors(words[0], field, topic, invalid, random), [words[1][field]]);
  }
  assert.equal(JSON.stringify({ topic, pool }), snapshot);
});

test('image questions keep existing local SVGs and accept content-supplied HTTPS media', () => {
  assert.equal(dataset.length, 52);
  for (const word of dataset.filter(word => isWordEligible(word, 'image-to-word'))) {
    assert.ok(word.imageUrl && existsSync(`public${word.imageUrl}`));
    assert.ok(word.imageAlt?.trim());
  }
  const imageUrl = 'https://media.example.com/vocabulary/dog.webp';
  const bank = generateQuestions([{ ...words[0], imageUrl }], 'image-to-word', words);
  assert.equal(bank.length, 1);
  assert.deepEqual((bank[0] as ChoiceQuestion).image, { url: imageUrl, alt: words[0].imageAlt });
  assert.equal(isValidQuestion(bank[0]), true);
  assert.equal(generateQuestions([{ ...words[0], imageAlt: undefined }], 'image-to-word', words).length, 0);
  assert.equal(generateQuestions([{ ...words[0], imageUrl: undefined }], 'image-to-word', words).length, 0);
});

test('media URLs support local paths and HTTPS CDN URLs without guessing formats', () => {
  for (const url of ['/images/vocabulary/dog.svg', '/media/images/vocabulary/cat.webp', '/media/images/vocabulary/apple.jpg', '/media/audio/vocabulary/dog.mp3', 'https://media.example.com/object?id=en-1', 'https://media.example.com/dog.png']) assert.equal(isMediaUrl(url), true, url);
  for (const url of [undefined, '', ' ', 'dog.svg', '//example.com/dog.svg', '/\\example.com/dog.svg', 'https://', 'https://user:pass@example.com/dog.svg', 'http://example.com/dog.svg', 'javascript:alert(1)', 'data:image/svg+xml,svg']) assert.equal(isMediaUrl(url), false, String(url));
  assert.equal(isValidQuestion({ ...questions[0], image: { url: 'javascript:alert(1)', alt: 'Dog' } }), false);
});

test('future audio and image-plus-audio capabilities use one canonical word with optional media', () => {
  const full: Word = { ...words[0], visual: true, imageUrl: '/media/images/vocabulary/dog.webp', audioUrl: '/media/audio/vocabulary/dog.mp3' };
  const activities: WordActivity[] = [...gameModes.map(mode => mode.id), 'image-match', 'listen-to-word', 'listening', 'listen-to-image'];
  for (const activity of activities) {
    assert.equal(isWordEligible(full, activity), true, activity);
    assert.equal(isWordEligible({ ...full, meaning: ' ' }, activity), false);
    assert.equal(isWordEligible({ ...full, word: ' ' }, activity), false);
  }
  const audioOnly = { ...full, visual: false, imageUrl: undefined, imageAlt: undefined };
  assert.equal(isWordEligible(audioOnly, 'listen-to-word'), true);
  assert.equal(isWordEligible(audioOnly, 'listen-to-image'), false);
  for (const partial of [{ ...full, audioUrl: undefined }, { ...full, imageUrl: undefined }, { ...full, imageAlt: ' ' }, { ...full, visual: undefined }, { ...full, visual: false }]) assert.equal(isWordEligible(partial, 'listen-to-image'), false);
  assert.equal(isWordEligible({ ...full, audioUrl: 'javascript:alert(1)' }, 'listen-to-word'), false);
});

const sparseMedia: Word[] = Array.from({ length: 26 }, (_, index) => ({
  ...words[0], id: `sparse-${index + 1}`, word: `word ${index + 1}`, meaning: `meaning ${index + 1}`,
  learningRank: index + 1, topics: index < 12 ? ['animals'] : ['food'], visual: true,
  imageUrl: index % 2 === 0 ? `/media/images/vocabulary/item-${index + 1}.webp` : undefined,
  audioUrl: index % 3 === 0 ? `/media/audio/vocabulary/item-${index + 1}.mp3` : undefined,
}));

test('media eligibility precedes the rank window and fills ten items beyond missing-media gaps', () => {
  const sample = [...sparseMedia].reverse();
  const before = JSON.stringify(sample);
  const first = getWordsForGame(sample, { game: 'image-to-word', startRank: 1, count: 10 });
  assert.deepEqual(first.map(word => word.learningRank), [1,3,5,7,9,11,13,15,17,19]);
  const bank = generateQuestions(first, 'image-to-word', getWordsForGame(sample, { game: 'image-to-word', startRank: 1 }), random);
  assert.equal(createSession({ ...config, mode: 'image-to-word', questionCount: 10 }, bank)!.questions.length, 10);
  const second = getWordsForGame(sample, { game: 'image-to-word', startRank: 20, count: 10 });
  assert.deepEqual(second.map(word => word.learningRank), [21,23,25]);
  assert.deepEqual(getWordsForGame(sample, { game: 'listen-to-word', startRank: 2, count: 10 }).map(word => word.learningRank), [4,7,10,13,16,19,22,25]);
  assert.equal(JSON.stringify(sample), before);
});

test('topic, English target and media capabilities combine before taking a ranked group', () => {
  const sample = [...sparseMedia, { ...sparseMedia[0], id: 'fr-extra', language: 'fr' }];
  assert.deepEqual(getWordsForGame(sample, { game: 'image-to-word', topic: 'food', startRank: 14, count: 3 }).map(word => word.learningRank), [15,17,19]);
  assert.deepEqual(getWordsForGame(sample, { game: 'listen-to-image', topic: 'animals', startRank: 1, count: 10 }).map(word => word.learningRank), [1,7]);
  assert.deepEqual(getWordsForGame(sample, { game: 'word-to-meaning', topic: 'animals', startRank: 1, count: 4 }).map(word => word.learningRank), [1,2,3,4]);
  assert.equal(getWordsForGame(sample, { game: 'image-to-word', startRank: 1 }).length, 13);
  assert.deepEqual(getWordsForGame(sample, { game: 'image-to-word', topic: 'unknown', startRank: 1, count: 10 }), []);
  for (const count of [0, -1, 1.5, NaN]) assert.deepEqual(getWordsForGame(sample, { game: 'image-to-word', startRank: 1, count }), []);
  assert.deepEqual(getWordsForGame(sample, { game: 'image-to-word', startRank: 26, count: 10 }), []);
});

test('repository and both UI locales share English records and identical image/audio URLs', async () => {
  for (const mode of gameModes) {
    const query = { game: mode.id, startRank: 1, count: 10 };
    const selected = await wordRepository.forGame(query);
    assert.deepEqual(selected, getWordsForGame(dataset, query));
    for (const locale of locales) {
      assert.ok(messages[locale].notEnoughContent);
      assert.deepEqual(await wordRepository.forGame(query), selected);
      assert.ok(selected.every(word => word.language === 'en' && dataset.includes(word)));
    }
  }
  assert.equal((await wordRepository.forGame({ game: 'listen-to-word', startRank: 1 })).length, 52);
  assert.equal((await wordRepository.forGame({ game: 'listen-to-image', startRank: 1 })).length, 30);
  const full = { ...words[0], visual: true, audioUrl: '/media/audio/vocabulary/dog.mp3' };
  for (const locale of locales) {
    assert.equal(localePath(locale, '/en/games/picture-pick'), `/${locale}/games/picture-pick`);
    assert.equal(getWordsForGame([full], { game: 'listen-to-image', startRank: 1 })[0], full);
  }
});

test('small banks cap at available words, require choice distractors and allow one typing item', () => {
  for (const mode of gameModes) {
    const selected = getWordsForGame(words.slice(0, 3), { game: mode.id, startRank: 1, count: 10 });
    const bank = generateQuestions(selected, mode.id, selected, random);
    assert.equal(createSession({ ...config, mode: mode.id, questionCount: 10 }, bank)?.questions.length ?? 0, mode.id === 'type-the-word' ? 3 : 0);
    const withFallback = generateQuestions(selected, mode.id, words, random);
    assert.equal(createSession({ ...config, mode: mode.id, questionCount: 10 }, withFallback)!.questions.length, 3);
    assert.equal(createSession({ ...config, mode: mode.id }, generateQuestions([], mode.id, words)), null);
  }
  assert.equal(createSession({ ...config, mode: 'type-the-word' }, generateQuestions(words.slice(0, 1), 'type-the-word'))!.questions.length, 1);
});

test('normalized CDN image questions resume through existing progress without changing the renderer contract', () => {
  const pool = words.map(word => ({ ...word, imageUrl: `https://media.example.com/objects/${word.id}.webp` }));
  const bank = generateQuestions(getWordsForGame(pool, { game: 'image-to-word', startRank: 1, count: 10 }), 'image-to-word', pool, random);
  const session = createSession({ ...config, mode: 'image-to-word' }, bank, random)!;
  session.state = advanceGame(session.state, { type: 'answer', answer: session.questions[0].correctAnswer }, session.questions);
  const saved = createSavedProgress(session);
  assert.deepEqual(readStoredSession(saved, session.config, session.config.mode, bank, pool.map(word => word.word)), session);
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
  for (const answer of ['dog', 'Dog', '  DOG  ']) assert.equal(isCorrectAnswer(typed[0], answer), true);
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

test('game registry orders real games and supports a game in multiple skill filters', () => {
  const reversed = [...games].reverse();
  assert.deepEqual(getGames('all', reversed).map(game => game.slug), ['word-match', 'find-the-word', 'picture-pick', 'spell-the-word']);
  assert.equal(getGames('vocabulary').length, 4);
  assert.deepEqual(getGames('spelling').map(game => game.slug), ['spell-the-word']);
  assert.deepEqual(gameSkills, ['vocabulary', 'spelling']);
  assert.equal(getGames('all', [{ ...games[0], status: 'coming-soon' }]).length, 0);
  assert.deepEqual(reversed, [...games].reverse());
});

test('locale changes UI and keeps the same English game identity, topic and target data', () => {
  assert.equal(messages.en.play, 'Play'); assert.equal(messages.vi.play, 'Chơi');
  assert.equal(messages.en.hero, 'Learn English through games.'); assert.equal(messages.vi.hero, 'Học tiếng Anh qua game.');
  assert.equal(learningLanguage, 'en');
  for (const locale of locales) {
    assert.deepEqual(getGames().map(game => game.id), gameModes.map(mode => mode.id));
    assert.ok(getGames().every(game => game.title[locale] && game.description[locale]));
    assert.equal(localePath(locale, '/en/games/word-match?topic=animals#main'), `/${locale}/games/word-match?topic=animals#main`);
    assert.ok(getWordsForProgress(dataset, { startRank: 1, count: 10 }).every(word => word.language === learningLanguage));
  }
});

test('learning windows advance by teaching rank across gaps without a level selection', () => {
  const original = [...dataset].reverse();
  const first = getWordsForProgress(original, { startRank: 1, count: 10 });
  assert.deepEqual(first.map(word => word.learningRank), [1,2,3,4,5,6,7,8,9,10]);
  const second = getWordsForProgress(original, { startRank: first.at(-1)!.learningRank + 1, count: 10 });
  assert.equal(second[0].learningRank, 11);
  assert.equal(second.at(-1)!.learningRank, 20);
  assert.equal(new Set([...first, ...second].map(word => word.id)).size, 20);
  assert.deepEqual(getWordsForProgress(original, { startRank: 1203, count: 10 }), []);
  assert.ok(getWordsForProgress(original, { startRank: 1, count: 10, topic: 'colors' }).every(word => word.topics.includes('colors')));
  assert.deepEqual(original, [...dataset].reverse());
  for (const startRank of [0, -1, 1.2, NaN]) assert.deepEqual(getWordsForProgress(dataset, { startRank, count: 10 }), []);
});

test('v3 progress is game/topic based, resumes its range and preserves completed IDs across rounds', () => {
  const values = storage();
  const current = { language: learningLanguage, game: 'word-match', topic: 'all', startRank: 1, mode: 'word-to-meaning' as const, questionCount: 5 };
  const session = finish(createSession(current, questions, random)!);
  const saved = createSavedProgress(session);
  assert.equal(saved.version, 3);
  assert.deepEqual(saved.completedWordIds?.sort(), words.map(word => word.id).sort());
  assert.equal(progressStore.save(saved), true);
  assert.ok(values.has('lingoplay:v3:en:word-match:all'));
  assert.deepEqual(readStoredSession(progressStore.get(current), current, current.mode, questions), session);
  assert.equal(progressStore.get({ ...current, game: 'find-the-word' }), null);
  assert.equal(progressStore.get({ ...current, topic: 'animals' }), null);
  assert.equal(readStoredSession(saved, { ...current, startRank: 2 }, current.mode, questions), null);
  const next = createSavedProgress({ ...session, state: { index: 0, answers: [] } }, saved);
  assert.deepEqual(next.completedWordIds, saved.completedWordIds);
  assert.deepEqual(next.lastResult, saved.lastResult);
});

test('small v2 to v3 migration preserves the newest valid topic round and old storage', () => {
  const values = storage();
  const old = createSession(config, questions, random)!;
  old.state = advanceGame(old.state, { type: 'answer', answer: old.questions[0].correctAnswer }, old.questions);
  const saved = createSavedProgress(old);
  saved.updatedAt = '2026-01-01T00:00:00.000Z';
  progressStore.save(saved);
  const newer = { ...old, config: { ...old.config, level: 'medium' as const }, state: advanceGame(old.state, { type: 'next' }, old.questions) };
  const newerSaved = createSavedProgress(newer);
  newerSaved.updatedAt = '2026-01-02T00:00:00.000Z';
  progressStore.save(newerSaved);
  const key = { language: 'en', game: 'word-match', topic: 'animals', mode: config.mode };
  const migrated = migrateLevelProgress(key, config.mode, questions, words.map(word => word.meaning), new Map(words.map(word => [word.id, word.learningRank])))!;
  assert.ok(migrated);
  assert.equal(migrated.config.level, undefined);
  assert.equal(migrated.config.startRank, 1);
  assert.deepEqual(migrated.questions, newer.questions); assert.deepEqual(migrated.state, newer.state);
  progressStore.save(createSavedProgress(migrated));
  assert.deepEqual(readStoredSession(progressStore.get(key), migrated.config, config.mode, questions), migrated);
  assert.deepEqual(JSON.parse(values.get('lingoplay:v2:en:easy:animals:word-to-meaning')!), saved);
  assert.equal(migrateLevelProgress({ ...key, topic: 'all' }, config.mode, questions, [], new Map()), null);
});

test('curated demo has50 Oxford-aligned words,52 stable IDs and authored metadata/media', () => {
  assert.equal(dataset.filter(word => word.curriculum === 'oxford-3000').length, 50);
  assert.deepEqual(dataset.filter(word => word.curriculum === 'supplemental').map(word => word.word).sort(), ['duck', 'rabbit']);
  assert.equal(new Set(dataset.map(word => word.learningRank)).size, 52);
  assert.ok(dataset.every(word => Number.isInteger(word.learningRank) && word.learningRank >= 1 && word.partOfSpeech && word.example && word.topics.every(id => topics.some(topic => topic.id === id)) && word.frequencyRank === undefined));
  assert.equal(dataset.filter(word => isWordEligible(word, 'listen-to-image')).length, 30);
  for (const word of dataset) assert.ok(word.audioUrl && existsSync(`public${word.audioUrl}`));
  assert.ok(dataset.filter(word => word.imageUrl?.endsWith('.webp')).length >= 10);
  for (let id = 1; id <= 20; id++) assert.equal(dataset.find(word => word.id === `en-${id}`)!.imageUrl, `/images/vocabulary/${dataset.find(word => word.id === `en-${id}`)!.word}.svg`);
});

test('priority changes preserve saved rounds when validated against the full eligible topic pool', () => {
  const current = { language: 'en', game: 'picture-pick', topic: 'all', startRank: 1, mode: 'image-to-word' as const, questionCount: 10 };
  const targets = getWordsForGame(dataset, { game: current.mode, startRank: 1, count: 10 });
  const old = createSession(current, generateQuestions(targets, current.mode, dataset, random), random)!;
  old.state = advanceGame(old.state, { type: 'answer', answer: old.questions[0].correctAnswer }, old.questions);
  const revised = dataset.map(word => ({ ...word, learningRank: 100 - word.learningRank }));
  const bank = generateQuestions(getWordsForGame(revised, { game: current.mode, startRank: 1 }), current.mode, revised, random);
  assert.deepEqual(readStoredSession(createSavedProgress(old), current, current.mode, bank, revised.map(word => word.word)), old);
});
