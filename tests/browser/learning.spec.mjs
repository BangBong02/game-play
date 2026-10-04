import { test as base, expect } from '@playwright/test';

const memoryKey = 'lingoplay:learning:v1:en';
const roundKey = (game, topic = 'colors', practice = '') => `lingoplay:v3:en:${game}:${topic}${practice ? `:${practice}` : ''}`;
const test = base.extend({
  consoleGuard: [async ({ page }, use, testInfo) => {
    // Local QA is independent of the optional remote font stylesheet; exercise system-font fallback.
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (['error', 'warning'].includes(message.type())) errors.push(message.text());
    });
    await use();
    const unexpected = testInfo.annotations.some(item => item.type === 'expected-media-failure')
      ? errors.filter(message => !/Failed to load resource.*404/.test(message)) : errors;
    expect(unexpected, 'No unexpected browser warnings/errors').toEqual([]);
  }, { auto: true }],
});

async function readRound(page, game, topic = 'colors', practice = '') {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)).session, roundKey(game, topic, practice));
}
async function readMemory(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)), memoryKey);
}
async function fits(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal page overflow').toBe(true);
}
async function press(page, locator) {
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await locator.tap();
  else { await locator.focus(); await page.keyboard.press('Enter'); }
}
async function play(page, game, topic = 'colors', locale = 'en', practice = '') {
  await page.goto(`/${locale}/games/${game}?topic=${topic}${practice ? `&practice=${practice}` : ''}${game === 'image-match' ? '&view=simple' : ''}`);
  await page.locator('.topic-picker > .primary-button').waitFor();
  await press(page, page.locator('.topic-picker > .primary-button'));
  await page.locator('.game-shell').waitFor();
  if (game === 'image-match') await page.locator('.matching-game').waitFor();
  await fits(page);
  return readRound(page, game, topic, practice);
}
async function answer(page, question, wrong = false) {
  if (question.kind === 'typing') {
    const input = page.locator('#typed-answer');
    await input.fill(wrong ? 'wrong-word' : ` ${question.correctAnswer.toUpperCase()}x`);
    if (!wrong) { await input.press('End'); await input.press('Backspace'); }
    await input.press('Enter');
  } else {
    const value = wrong ? question.options.find(value => value !== question.correctAnswer) : question.correctAnswer;
    const index = question.options.indexOf(value);
    await press(page, page.locator('.answer-button').nth(index));
  }
  await expect(page.locator('.game-controls > button')).toBeEnabled();
}
async function finishChoices(page, session) {
  for (const question of session.questions) {
    await answer(page, question);
    await press(page, page.locator('.game-controls > button'));
  }
  await page.locator('.game-result').waitFor();
}

for (const locale of ['en', 'vi']) {
  test(`progress links choose new study, waiting free practice and due review (${locale})`, async ({ page }) => {
    const start = new Date('2026-10-04T04:00:00Z');
    await page.clock.setFixedTime(start);
    await page.goto(`/${locale}/progress`);
    const colors = page.locator('.topic-progress-card').filter({ has: page.locator('a[href*="topic=colors"]') });
    const link = colors.locator('.topic-progress-links a').first();
    await expect(link).toHaveAttribute('href', /practice=study$/);
    await press(page, link);
    await page.locator('.topic-picker > .primary-button').waitFor();
    await press(page, page.locator('.topic-picker > .primary-button'));
    await page.locator('.game-shell').waitFor();
    await finishChoices(page, await readRound(page, 'word-match'));
    const learned = await readMemory(page);
    await page.goto(`/${locale}/progress`);
    await expect(link).toHaveAttribute('href', /practice=free$/);
    await expect(link).toHaveText(locale === 'en' ? 'Free practice →' : 'Chơi tự do →');
    await press(page, link);
    await expect(page.locator('.practice-options button').last()).toHaveAttribute('aria-pressed', 'true');
    await press(page, page.locator('.topic-picker > .primary-button'));
    await page.locator('.game-shell').waitFor();
    await finishChoices(page, await readRound(page, 'word-match', 'colors', 'free'));
    for (const [id, word] of Object.entries((await readMemory(page)).words)) {
      expect(word.successes).toBe(learned.words[id].successes);
      expect(word.dueAt).toBe(learned.words[id].dueAt);
    }
    await page.clock.setFixedTime(new Date(+start + 86400000));
    await page.goto(`/${locale}/progress`);
    await expect(link).toHaveAttribute('href', /practice=review$/);
    await expect(link).toHaveText(locale === 'en' ? 'Review now →' : 'Ôn ngay →');
    await press(page, link);
    await page.locator('.topic-picker > .primary-button').waitFor();
    await press(page, page.locator('.topic-picker > .primary-button'));
    await page.locator('.game-shell').waitFor();
    await finishChoices(page, await readRound(page, 'word-match', 'colors', 'review'));
    await page.reload();
    await expect(page.locator('.result-score strong')).toHaveText('4 / 4');
    await page.clock.setFixedTime(new Date(+start + 8 * 86400000));
    await page.goto(`/${locale}/progress`);
    await press(page, link);
    await page.locator('.topic-picker > .primary-button').waitFor({ timeout: 3000 });
    await press(page, page.locator('.topic-picker > .primary-button'));
    await page.locator('.game-shell').waitFor();
    await finishChoices(page, await readRound(page, 'word-match', 'colors', 'review'));
    expect(Object.values((await readMemory(page)).words).every(word => word.successes === 3)).toBe(true);
    await fits(page);
  });

  test(`homepage skill filters and content navigation (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator('.home-game-card:visible')).toHaveCount(6);
    for (const [skill, count] of [['listening', 1], ['matching', 1], ['spelling', 1], ['imageBased', 3], ['all', 6]]) {
      const filter = page.locator(`[data-filter="${skill}"]`);
      await expect(filter).toBeEnabled();
      await press(page, filter);
      await expect(page.locator('.home-game-card:visible')).toHaveCount(count);
      await expect(filter).toHaveAttribute('aria-pressed', 'true');
      await fits(page);
    }
    await page.locator('.filter-status a').click();
    await page.locator('.learning-summary').waitFor();
    await expect(page.locator('.vocabulary-total')).toHaveText('0 / 300');
    await expect(page.locator('.learning-summary')).toContainText('50');
    await page.locator('a[href$="/learn/vocabulary/school"]').click();
    await expect(page.locator('.vocabulary-entries dt')).toHaveCount(4);
    await expect(page.locator('.vocabulary-entries audio')).toHaveCount(4);
    await expect(page.locator('astro-island')).toHaveCount(0);
    await fits(page);
  });

  for (const game of ['picture-pick', 'listen-and-pick', 'word-match', 'find-the-word', 'spell-the-word']) {
    test(`${game}: answers, keyboard/touch, reload, result and restart (${locale})`, async ({ page }) => {
      const session = await play(page, game, 'colors', locale);
      expect(session.questions).toHaveLength(4);
      await expect(page.locator('.word-steps .completed')).toHaveCount(0);
      if (game === 'listen-and-pick') {
        const audio = page.locator('.audio-prompt audio');
        expect(await audio.evaluate(audio => audio.paused && audio.currentTime === 0)).toBe(true);
        await press(page, page.locator('.audio-button'));
        await expect.poll(() => audio.evaluate(audio => !audio.paused && audio.duration > 0)).toBe(true);
        await press(page, page.locator('.audio-button'));
        await expect.poll(() => audio.evaluate(audio => audio.currentTime)).toBeLessThan(0.8);
      }
      await answer(page, session.questions[0], true);
      await expect(page.locator('.answer-feedback')).toContainText(session.questions[0].correctAnswer);
      await expect(page.locator('.word-steps .completed')).toHaveCount(1);
      const firstMemory = (await readMemory(page)).words[session.questions[0].id];
      expect(firstMemory.successes).toBe(0);
      expect(firstMemory.dueAt - firstMemory.lastAttemptAt).toBe(5 * 60 * 60 * 1000);
      await page.reload();
      await page.locator('.game-shell').waitFor();
      expect(await readRound(page, game)).toEqual({ ...session, state: { index: 0, answers: [(await readRound(page, game)).state.answers[0]] } });
      expect((await readMemory(page)).words[session.questions[0].id]).toEqual(firstMemory);
      await expect(page.locator('.game-controls > button')).toBeFocused();
      await press(page, page.locator('.game-controls > button'));
      for (const question of session.questions.slice(1)) {
        if (game === 'listen-and-pick') expect(await page.locator('audio').evaluate(audio => audio.paused && audio.currentTime === 0)).toBe(true);
        await answer(page, question);
        await fits(page);
        await press(page, page.locator('.game-controls > button'));
      }
      await expect(page.locator('.result-score strong')).toHaveText('3 / 4');
      await expect(page.locator('.result-stats')).toContainText('75%');
      await expect(page.locator('#result-heading')).toBeFocused();
      expect(Object.keys((await readMemory(page)).words)).toHaveLength(4);
      await page.reload();
      await page.locator('.game-result').waitFor();
      await press(page, page.locator('.result-actions > button').first());
      await expect(page.locator('.word-steps .completed')).toHaveCount(0);
      expect((await readRound(page, game)).id).not.toBe(session.id);
      await answer(page, session.questions[0]);
      expect((await readMemory(page)).words[session.questions[0].id].successes).toBe(0);
      await page.goto(`/${locale}/progress`);
      await page.locator('.learning-summary').waitFor();
      await expect(page.locator('.vocabulary-total')).toHaveText('0 / 300');
      await page.locator('.word-memory-list > summary').click();
      await expect(page.locator('.word-memory-list li')).toHaveCount(4);
      await fits(page);
    });
  }

  test(`Image Match: multiple corrections survive reload (${locale})`, async ({ page }) => {
    const session = await play(page, 'image-match', 'colors', locale);
    const imageFor = question => page.locator('.match-image').filter({ has: page.locator(`img[src="${question.image.url}"]`) });
    const wordFor = question => page.locator('.match-word').filter({ has: page.getByText(question.correctAnswer, { exact: true }) });
    for (const index of [2, 0]) {
      await press(page, wordFor(session.questions[index]));
      await press(page, imageFor(session.questions[1]));
      await expect(page.locator('.matching-game .notice')).toContainText(session.questions[index].correctAnswer);
    }
    for (const index of [2, 0]) {
      await expect(page.locator('.matching-game .notice')).toContainText(session.questions[index].correctAnswer);
      await expect(imageFor(session.questions[index])).toHaveClass(/incorrect/);
    }
    await page.reload();
    await page.locator('.matching-game').waitFor();
    for (const index of [2, 0]) await expect(page.locator('.matching-game .notice')).toContainText(session.questions[index].correctAnswer);
    await expect(page.locator('.word-steps .completed')).toHaveCount(2);
    for (const index of [1, 3]) {
      await press(page, wordFor(session.questions[index]));
      await press(page, imageFor(session.questions[index]));
    }
    await press(page, page.locator('.game-controls > button'));
    await expect(page.locator('.result-score strong')).toHaveText('2 / 4');
    expect(Object.keys((await readMemory(page)).words)).toHaveLength(4);
    await fits(page);
  });

  test(`Image Match: any-order, wrong lock, 3+2 boards, persisted images, keyboard/touch (${locale})`, async ({ page }, testInfo) => {
    const session = await play(page, 'image-match', 'home', locale);
    expect(session.questions).toHaveLength(5);
    await expect(page.locator('.match-word')).toHaveCount(3);
    await expect(page.locator('.match-image:enabled')).toHaveCount(0);
    const imageFor = question => page.locator('.match-image').filter({ has: page.locator(`img[src="${question.image.url}"]`) });
    const wordFor = question => page.locator('.match-word').filter({ has: page.locator('span').filter({ hasText: new RegExp(`^${question.correctAnswer}$`) }) });
    const first = session.questions[2];
    await press(page, wordFor(first));
    await expect(page.locator('.match-image:enabled').first()).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath(`matching-${locale}.png`), fullPage: true });
    await press(page, imageFor(session.questions[0]));
    await expect(wordFor(first)).toBeDisabled();
    await expect(imageFor(first)).toBeDisabled();
    await expect(wordFor(session.questions[0])).toBeEnabled();
    await expect(page.locator('.word-steps .completed')).toHaveCount(1);
    await expect(page.locator('.match-word:enabled').first()).toBeFocused();
    const images = await page.locator('.match-image img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    const saved = await readRound(page, 'image-match', 'home');
    await page.reload();
    await page.locator('.matching-game').waitFor();
    expect(await readRound(page, 'image-match', 'home')).toEqual(saved);
    expect(await page.locator('.match-image img').evaluateAll(images => images.map(image => image.getAttribute('src')))).toEqual(images);
    await expect(page.locator('.match-word:enabled').first()).toBeFocused();
    for (const question of session.questions.slice(0, 2)) { await press(page, wordFor(question)); await press(page, imageFor(question)); }
    await expect(page.locator('.game-controls > button')).toBeFocused();
    await press(page, page.locator('.game-controls > button'));
    await expect(page.locator('.match-word')).toHaveCount(2);
    for (const question of session.questions.slice(3)) { await press(page, wordFor(question)); await press(page, imageFor(question)); }
    await expect(page.locator('.word-steps .completed')).toHaveCount(5);
    await fits(page);
    await press(page, page.locator('.game-controls > button'));
    await expect(page.locator('.result-score strong')).toHaveText('4 / 5');
    await expect(page.locator('#result-heading')).toBeFocused();
    await page.reload();
    await page.locator('.game-result').waitFor();
    await press(page, page.locator('.result-actions > button').first());
    await expect(page.locator('.match-word')).toHaveCount(3);
    await expect(page.locator('.word-steps .completed')).toHaveCount(0);
    await fits(page);
  });
}

test('learning schedule and mastery across games, early repeats, reset and due review', async ({ page }, testInfo) => {
  const start = new Date('2026-10-04T04:00:00Z');
  await page.clock.setFixedTime(start);
  let session = await play(page, 'spell-the-word');
  await finishChoices(page, session);
  let memory = await readMemory(page);
  for (const word of Object.values(memory.words)) { expect(word.successes).toBe(1); expect(word.dueAt - word.lastAttemptAt).toBe(86400000); }
  session = await play(page, 'word-match', 'colors', 'en', 'free');
  await finishChoices(page, session);
  for (const [id, word] of Object.entries((await readMemory(page)).words)) {
    expect(word.successes).toBe(1); expect(word.dueAt).toBe(memory.words[id].dueAt);
  }
  await page.clock.setFixedTime(new Date(+start + 86400000));
  session = await play(page, 'find-the-word', 'colors', 'en', 'review');
  await finishChoices(page, session);
  for (const word of Object.values((await readMemory(page)).words)) { expect(word.successes).toBe(2); expect(word.dueAt - word.lastAttemptAt).toBe(7 * 86400000); }
  await page.clock.setFixedTime(new Date(+start + 8 * 86400000));
  session = await play(page, 'picture-pick', 'colors', 'en', 'review');
  await finishChoices(page, session);
  for (const word of Object.values((await readMemory(page)).words)) { expect(word.successes).toBe(3); expect(word.dueAt - word.lastAttemptAt).toBe(60 * 86400000); }
  await page.goto('/en/progress');
  await expect(page.locator('.vocabulary-total')).toHaveText('4 / 300');
  const colors = page.locator('.topic-progress-card').filter({ has: page.getByRole('heading', { name: 'Colors', exact: false }) });
  await expect(colors).toContainText('Completed');
  await page.screenshot({ path: testInfo.outputPath('progress-mastered.png'), fullPage: true });
  await page.reload();
  await expect(page.locator('.vocabulary-total')).toHaveText('4 / 300');
  session = await play(page, 'listen-and-pick', 'colors', 'en', 'free');
  await answer(page, session.questions[0], true);
  memory = await readMemory(page);
  expect(memory.words[session.questions[0].id].successes).toBe(0);
  await page.clock.setFixedTime(new Date(+start + 8 * 86400000 + 5 * 3600000));
  await page.goto('/en/progress');
  await expect(page.locator('.vocabulary-total')).toHaveText('3 / 300');
  await expect(colors).not.toContainText('Completed');
  await expect(page.locator('.learning-summary .primary-button')).toHaveAttribute('href', /practice=review/);
  session = await play(page, 'word-match', 'colors', 'en', 'review');
  expect(session.questions).toHaveLength(1);
  expect(session.questions[0].id).toBe(Object.entries(memory.words).find(([, word]) => !word.lastOutcome)[0]);
  await finishChoices(page, session);
  expect((await readMemory(page)).words[session.questions[0].id].successes).toBe(0);
});

test('default ten-pair Image Match round uses 4+4+2 boards and records every word once', async ({ page }, testInfo) => {
  const session = await play(page, 'image-match', 'all');
  expect(session.questions).toHaveLength(10);
  await page.screenshot({ path: testInfo.outputPath('matching-ten-pairs.png'), fullPage: true });
  let position = 0;
  for (const count of [4, 4, 2]) {
    await expect(page.locator('.match-word')).toHaveCount(count);
    for (const question of session.questions.slice(position, position + count).reverse()) {
      await press(page, page.locator('.match-word').filter({ hasText: new RegExp(`^${question.correctAnswer}$`) }));
      await press(page, page.locator('.match-image').filter({ has: page.locator(`img[src="${question.image.url}"]`) }));
    }
    position += count;
    await expect(page.locator('.word-steps .completed')).toHaveCount(position);
    await fits(page);
    await press(page, page.locator('.game-controls > button'));
  }
  await expect(page.locator('.result-score strong')).toHaveText('10 / 10');
  const memory = await readMemory(page);
  expect(Object.keys(memory.words).sort()).toEqual(session.questions.map(question => question.id).sort());
  expect(Object.values(memory.words).every(word => word.successes === 1)).toBe(true);
});

test('topic mastery counts words without images; single due pair cannot form a matching board', async ({ page }) => {
  await page.goto('/en');
  await page.evaluate(key => {
    const now = Date.now();
    const mastered = { successes: 3, dueAt: now + 60 * 86400000, lastAttemptAt: now, lastOutcome: true, lastAttemptId: 'fixture', lastCorrectDay: new Date(now).toISOString().slice(0, 10) };
    localStorage.setItem(key, JSON.stringify({ version: 1, words: { 'en-24': mastered, 'en-25': mastered, 'en-26': mastered, 'en-15': { ...mastered, successes: 0, lastOutcome: false, dueAt: now - 1000 } } }));
  }, memoryKey);
  await page.goto('/en/games/picture-pick?topic=school');
  await page.locator('.topic-picker').waitFor();
  await expect(page.locator('.topic-memory')).toContainText('3 / 4 mastered');
  await expect(page.locator('.topic-memory')).not.toContainText('Completed');
  await expect(page.locator('.topic-picker > .primary-button')).toBeDisabled();
  await page.goto('/en/progress');
  const school = page.locator('.topic-progress-card').filter({ has: page.getByRole('heading', { name: 'School', exact: false }) });
  await expect(school).toContainText('3 / 4');
  await expect(school).not.toContainText('Completed');
  await page.goto('/en/games/image-match?topic=colors&practice=review');
  await expect(page.locator('.topic-picker > .primary-button')).toBeDisabled();
  await expect(page.locator('.topic-picker .notice')).toBeVisible();
});

for (const readsBlocked of [true, false]) test(`storage writes blocked (reads blocked=${readsBlocked}): temporary memory and free practice`, async ({ page }) => {
  await page.addInitScript(readsBlocked => {
    if (readsBlocked) Storage.prototype.getItem = () => { throw new DOMException('blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError'); };
  }, readsBlocked);
  await page.goto('/vi/games/word-match?topic=colors');
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.game-session > .notice')).toBeVisible();
  for (let index = 0; index < 4; index++) {
    await page.locator('.answer-button').first().click();
    await page.locator('.game-controls > button').click();
  }
  await expect(page.locator('.game-result')).toBeVisible();
  await page.locator('.result-actions > .secondary-button').click();
  await expect(page.locator('.topic-picker > .primary-button')).toBeDisabled();
  await page.locator('.practice-options > button').last().click();
  await expect(page.locator('.topic-picker > .primary-button')).toBeEnabled();
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.game-shell')).toBeVisible();
  await fits(page);
});

test('legacy round migration preserves exact answers and locale switch without inventing mastery', async ({ page }) => {
  const session = await play(page, 'word-match');
  const legacyKey = 'lingoplay:v2:en:easy:colors:word-to-meaning';
  const legacy = await page.evaluate(({ session, legacyKey, round }) => {
    const config = { language: 'en', level: 'easy', topic: 'colors', mode: 'word-to-meaning', questionCount: 4 };
    const saved = JSON.stringify({ ...config, version: 2, session: { config, questions: session.questions, state: { index: 0, answers: [session.questions[0].correctAnswer] } }, completed: 1, completedWordIds: session.questions.map(question => question.id), updatedAt: '2026-10-01T00:00:00Z' });
    localStorage.setItem(legacyKey, saved);
    localStorage.removeItem(round);
    return saved;
  }, { session, legacyKey, round: roundKey('word-match') });
  await page.reload();
  await expect(page.locator('.answer-feedback')).toContainText('Correct!');
  const migrated = await readRound(page, 'word-match');
  expect(migrated.questions).toEqual(session.questions);
  expect(migrated.state).toEqual({ index: 0, answers: [session.questions[0].correctAnswer] });
  await page.locator('[data-locale][lang="vi"]').click();
  await expect(page).toHaveURL(/\/vi\/games\/word-match\?topic=colors/);
  await expect(page.locator('.answer-feedback')).toContainText('Chính xác!');
  expect(await readRound(page, 'word-match')).toEqual(migrated);
  expect(await page.evaluate(key => localStorage.getItem(key), legacyKey)).toBe(legacy);
  await page.goto('/vi/progress');
  await expect(page.locator('.vocabulary-total')).toHaveText('0 / 300');
});

test('partial memory save failure keeps the warning until memory is saved successfully', async ({ page }) => {
  await page.addInitScript(memoryKey => {
    const original = Storage.prototype.setItem;
    window.restoreTestStorage = () => { Storage.prototype.setItem = original; };
    Storage.prototype.setItem = function (key, value) {
      if (key === memoryKey) throw new DOMException('quota fixture', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  }, memoryKey);
  const session = await play(page, 'word-match');
  await answer(page, session.questions[0]);
  await expect(page.locator('.game-session > .notice')).toBeVisible();
  await press(page, page.locator('.game-controls > button'));
  await expect(page.locator('.game-session > .notice')).toBeVisible();
  await page.evaluate(() => window.restoreTestStorage());
  await answer(page, session.questions[1]);
  await expect(page.locator('.game-session > .notice')).toHaveCount(0);
  expect(Object.keys((await readMemory(page)).words).sort()).toEqual(session.questions.slice(0, 2).map(question => question.id).sort());
});

test('matching is playable entirely with Tab and Enter', async ({ page }) => {
  const session = await play(page, 'image-match', 'home');
  await expect(page.locator('#question-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.match-word').first()).toBeFocused();
  const first = session.questions[0];
  await page.keyboard.press('Enter');
  const correctImage = page.locator('.match-image').filter({ has: page.locator(`img[src="${first.image.url}"]`) });
  for (let index = 0; index < 3 && !(await correctImage.evaluate(element => element === document.activeElement)); index++) await page.keyboard.press('Tab');
  await expect(correctImage).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.match-word').first()).toBeDisabled();
  await expect(page.locator('.match-word:enabled').first()).toBeFocused();
  await expect(page.locator('.word-steps .completed')).toHaveCount(1);
});

test('corrupt progress never crashes or becomes mastery', async ({ page }) => {
  await page.goto('/en');
  await page.evaluate(({ memoryKey, round }) => {
    localStorage.setItem(memoryKey, '{broken');
    localStorage.setItem(round, JSON.stringify({ version: 3, completedWordIds: ['en-15'], session: { state: { index: 99 } } }));
  }, { memoryKey, round: roundKey('picture-pick') });
  await play(page, 'picture-pick');
  await page.goto('/en/progress');
  await expect(page.locator('.vocabulary-total')).toHaveText('0 / 300');
});

test('media failure: readable image fallback and audio retry after recovery', async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: 'expected-media-failure' });
  await page.route('**/images/vocabulary/*.svg', route => route.fulfill({ status: 404, body: 'missing fixture' }));
  await play(page, 'picture-pick');
  await expect(page.locator('.image-unavailable')).toBeVisible();
  await page.unroute('**/images/vocabulary/*.svg');
  await play(page, 'listen-and-pick');
  await page.route('**/media/audio/vocabulary/*.mp3', route => route.fulfill({ status: 404, body: 'missing fixture' }));
  await press(page, page.locator('.audio-button'));
  await expect(page.locator('.audio-prompt .notice')).toBeVisible();
  await page.unroute('**/media/audio/vocabulary/*.mp3');
  await press(page, page.locator('.audio-button'));
  await expect.poll(() => page.locator('.audio-prompt audio').evaluate(audio => !audio.paused && audio.duration > 0)).toBe(true);
  await expect(page.locator('.audio-prompt .notice')).toHaveCount(0);
});

test('small mobile widths and static content remain usable', async ({ page }, testInfo) => {
  for (const width of [360, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/vi');
    await fits(page);
    await play(page, 'image-match', 'home', 'vi');
    await fits(page);
    const boxes = await page.locator('.match-word, .match-image').evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height }; }));
    expect(boxes.every(box => box.width >= 44 && box.height >= 44)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`mobile-${width}.png`), fullPage: true });
    await page.goto('/vi/progress');
    await page.locator('.learning-summary').waitFor();
    await fits(page);
    await page.goto('/vi/learn/vocabulary/home');
    await fits(page);
    await page.evaluate(key => localStorage.removeItem(key), roundKey('image-match', 'home'));
  }
});
