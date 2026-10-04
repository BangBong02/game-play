import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyMemory, isMastered, learningCounts, learningStatus, recordAttempt, reviewIntervals, selectLearningWords } from '../src/game/learning.ts';
import { createSavedProgress, learningStore, migrateLevelProgress, progressStore, readLearningMemory, readStoredSession } from '../src/services/progress.ts';
import { words } from '../src/data/content.ts';
import { createSession, generateQuestions } from '../src/game/vocabulary.ts';
import { getWordsForGame } from '../src/repositories/queries.ts';

const start = Date.parse('2026-10-04T12:00:00Z');
const day = 24 * 60 * 60 * 1000;
function storage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  return values;
}
function mastered(id: string) {
  let memory = recordAttempt(emptyMemory(), id, true, start, 'first');
  memory = recordAttempt(memory, id, true, start + day, 'second');
  return recordAttempt(memory, id, true, start + 8 * day, 'third');
}

test('mastery takes three scheduled different-day successes with1d/7d/60d intervals', () => {
  let memory = emptyMemory();
  assert.equal(learningStatus(memory.words.word, start), 'unseen');
  memory = recordAttempt(memory, 'word', true, start, 'a');
  assert.equal(memory.words.word.successes, 1);
  assert.equal(memory.words.word.dueAt, start + day);
  assert.equal(learningStatus(memory.words.word, start), 'correct');
  assert.equal(isMastered(memory.words.word), false);
  memory = recordAttempt(memory, 'word', true, start + day, 'b');
  assert.equal(memory.words.word.successes, 2);
  assert.equal(memory.words.word.dueAt, start + 8 * day);
  assert.equal(learningStatus(memory.words.word, start + 8 * day), 'review');
  memory = recordAttempt(memory, 'word', true, start + 8 * day, 'c');
  assert.equal(memory.words.word.successes, 3);
  assert.equal(memory.words.word.dueAt, start + 68 * day);
  assert.equal(isMastered(memory.words.word), true);
  assert.equal(learningStatus(memory.words.word, start + 8 * day), 'mastered');
  assert.equal(learningStatus(memory.words.word, start + 68 * day), 'review');
  assert.equal(isMastered(memory.words.word), true, 'Maintenance due does not erase earned mastery');
});

test('reload duplicates and early repeats cannot farm mastery or postpone scheduled reviews', () => {
  const first = recordAttempt(emptyMemory(), 'word', true, start, 'session:word');
  assert.equal(recordAttempt(first, 'word', false, start + 1, 'session:word'), first);
  const replay = recordAttempt(first, 'word', true, start + 60_000, 'restart:word');
  assert.equal(replay.words.word.successes, 1);
  assert.equal(replay.words.word.dueAt, first.words.word.dueAt);
  const nextDayEarly = recordAttempt(replay, 'word', true, Date.parse('2026-10-05T00:01:00Z'), 'early');
  assert.equal(nextDayEarly.words.word.successes, 1);
  assert.equal(nextDayEarly.words.word.dueAt, first.words.word.dueAt);
  const second = recordAttempt(nextDayEarly, 'word', true, start + day, 'due');
  const earlyThird = recordAttempt(second, 'word', true, start + 2 * day, 'too-soon');
  assert.equal(earlyThird.words.word.successes, 2);
  assert.equal(earlyThird.words.word.dueAt, second.words.word.dueAt);
});

test('a mistake resets mastery and returns after exactly five hours', () => {
  const earned = mastered('word');
  const mistakeTime = start + 9 * day;
  const wrong = recordAttempt(earned, 'word', false, mistakeTime, 'wrong');
  assert.equal(isMastered(wrong.words.word), false);
  assert.equal(wrong.words.word.successes, 0);
  assert.equal(wrong.words.word.dueAt, mistakeTime + reviewIntervals.wrong);
  assert.equal(learningStatus(wrong.words.word, mistakeTime), 'learning');
  const early = recordAttempt(wrong, 'word', true, mistakeTime + 1, 'early-correct');
  assert.equal(early.words.word.successes, 0);
  assert.equal(early.words.word.dueAt, wrong.words.word.dueAt);
  assert.equal(selectLearningWords([{ ...words[0], id: 'word' }], wrong, wrong.words.word.dueAt - 1).length, 0);
  assert.equal(selectLearningWords([{ ...words[0], id: 'word' }], wrong, wrong.words.word.dueAt).length, 1);
  const relearned = recordAttempt(early, 'word', true, wrong.words.word.dueAt, 'relearn');
  assert.equal(relearned.words.word.successes, 1);
});

test('same-day relearning after a mistake cannot reuse an earlier credited day or loop forever', () => {
  const first = recordAttempt(emptyMemory(), 'word', true, start, 'first');
  const wrong = recordAttempt(first, 'word', false, start + 1, 'wrong');
  const relearn = recordAttempt(wrong, 'word', true, wrong.words.word.dueAt, 'relearn');
  assert.equal(relearn.words.word.successes, 0);
  assert.equal(relearn.words.word.dueAt, wrong.words.word.dueAt + day);
  assert.equal(selectLearningWords([{ ...words[0], id: 'word' }], relearn, wrong.words.word.dueAt).length, 0);
  const nextDay = recordAttempt(relearn, 'word', true, relearn.words.word.dueAt, 'next-day');
  assert.equal(nextDay.words.word.successes, 1);
});

test('due-first selection respects priority, media eligibility, review-only and supplemental boundaries', () => {
  const pool = getWordsForGame(words, { game: 'listen-to-image', startRank: 1 });
  let memory = recordAttempt(emptyMemory(), pool[4].id, false, start, 'a');
  memory = recordAttempt(memory, pool[2].id, false, start + 1000, 'b');
  const before = JSON.stringify(pool);
  const dueTime = start + reviewIntervals.wrong + 1000;
  assert.deepEqual(selectLearningWords([...pool].reverse(), memory, dueTime, 3).map(word => word.id), [pool[4].id, pool[2].id, pool[0].id]);
  assert.deepEqual(selectLearningWords(pool, memory, dueTime, 10, 'review').map(word => word.id), [pool[4].id, pool[2].id]);
  assert.deepEqual(selectLearningWords(pool, memory, start, 10, 'review'), []);
  assert.equal(selectLearningWords(words, emptyMemory(), start, 100).length, 50);
  assert.equal(selectLearningWords(words, emptyMemory(), start, 100, 'free').length, 52);
  assert.equal(selectLearningWords(pool, memory, dueTime, 3).every(word => !!word.imageUrl && !!word.audioUrl), true);
  assert.equal(JSON.stringify(pool), before);
  for (const count of [0, -1, 1.5, NaN]) assert.deepEqual(selectLearningWords(pool, memory, dueTime, count), []);
});

test('topic/global counts deduplicate canonical IDs and completion needs mastery, not seen words', () => {
  const one = words[0];
  const two = words[1];
  const learning = recordAttempt(emptyMemory(), one.id, true, start, 'a');
  assert.equal(learningCounts([one], learning, start).complete, false);
  const earned = mastered(one.id);
  const counts = learningCounts([one, one, two], earned, start + 68 * day);
  assert.equal(counts.total, 2);
  assert.equal(counts.mastered, 1);
  assert.equal(counts.statuses.review, 1);
  assert.equal(counts.statuses.unseen, 1);
  assert.equal(counts.complete, false);
  assert.equal(learningCounts([one], earned, start + 68 * day).complete, true);
  assert.equal(learningCounts([], earned, start).complete, false);
});

test('mastering only the pictured school words does not complete the full school topic', () => {
  const fullTopic = words.filter(word => word.curriculum === 'oxford-3000' && word.topics.includes('school'));
  const visual = getWordsForGame(fullTopic, { game: 'image-to-word', startRank: 1 });
  assert.equal(fullTopic.length, 4);
  assert.equal(visual.length, 3);
  const memory = { version: 1 as const, words: Object.fromEntries(visual.map(word => [word.id, mastered(word.id).words[word.id]])) };
  const counts = learningCounts(fullTopic.map(({ id }) => ({ id })), memory, start + 8 * day);
  assert.equal(counts.mastered, 3);
  assert.equal(counts.total, 4);
  assert.equal(counts.complete, false);
});

test('defensive local memory storage preserves unrelated legacy progress and ignores corrupt records', () => {
  const values = storage();
  values.set('lingoplay:v1:en:easy:animals', 'old untouched');
  const memory = mastered(words[0].id);
  assert.equal(learningStore.save(memory), true);
  assert.deepEqual(learningStore.get(), memory);
  assert.equal(values.get('lingoplay:v1:en:easy:animals'), 'old untouched');
  assert.deepEqual(readLearningMemory(null), emptyMemory());
  assert.deepEqual(readLearningMemory({ version: 2, words: memory.words }), emptyMemory());
  assert.deepEqual(readLearningMemory({ version: 1, words: [] }), emptyMemory());
  const corrupt = { ...memory.words, invalid: { ...memory.words[words[0].id], successes: 99 }, impossibleDate: { ...memory.words[words[0].id], lastCorrectDay: '2026-02-31' }, invalidTime: { ...memory.words[words[0].id], dueAt: Infinity } };
  assert.deepEqual(readLearningMemory({ version: 1, words: corrupt }), memory);
  values.set('lingoplay:learning:v1:en', 'bad json');
  assert.deepEqual(learningStore.get(), emptyMemory());
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  assert.deepEqual(learningStore.get(), emptyMemory());
  assert.equal(learningStore.save(memory), false);
  assert.deepEqual(learningStore.get(memory), memory);
});

test('unsaved in-page memory survives read-only storage without overriding newer saved attempts', () => {
  storage();
  const saved = recordAttempt(emptyMemory(), 'word', true, start, 'saved');
  learningStore.save(saved);
  const unsaved = recordAttempt(saved, 'other', false, start + 1, 'unsaved');
  assert.deepEqual(learningStore.get(unsaved), unsaved);
  const newer = recordAttempt(saved, 'word', false, start + day, 'newer');
  learningStore.save(newer);
  const merged = learningStore.get(unsaved);
  assert.deepEqual(merged.words.word, newer.words.word);
  assert.deepEqual(merged.words.other, unsaved.words.other);
});

test('free/review rounds use separate keys and old study rounds remain readable', () => {
  const values = storage();
  const bank = generateQuestions(words.slice(0, 5), 'word-to-meaning', words);
  const key = { language: 'en', game: 'word-match', topic: 'all', startRank: 1, mode: 'word-to-meaning' as const, questionCount: 5 };
  const old = createSession(key, bank)!;
  assert.equal(progressStore.save(createSavedProgress(old)), true);
  for (const practice of ['free', 'review'] as const) {
    const session = { ...old, config: { ...old.config, practice } };
    assert.equal(progressStore.get(session.config), null);
    assert.equal(progressStore.save(createSavedProgress(session)), true);
    assert.deepEqual(readStoredSession(progressStore.get(session.config), session.config, key.mode, bank), session);
    assert.equal(readStoredSession(createSavedProgress(old), session.config, key.mode, bank), null);
    assert.equal(migrateLevelProgress(session.config, key.mode, bank, [], new Map()), null);
  }
  assert.ok(values.has('lingoplay:v3:en:word-match:all:free'));
  assert.ok(values.has('lingoplay:v3:en:word-match:all:review'));
  assert.deepEqual(readStoredSession(progressStore.get(key), { ...key, practice: 'study' }, key.mode, bank), old);
});

test('invalid clocks and out-of-order attempts cannot corrupt scheduling', () => {
  const memory = recordAttempt(emptyMemory(), 'word', true, start, 'a');
  for (const now of [-1, NaN, Infinity, 8.64e15, start - 1]) assert.equal(recordAttempt(memory, 'word', true, now, 'b'), memory);
});
