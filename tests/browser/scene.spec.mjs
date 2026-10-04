import { test as base, expect } from '@playwright/test';

const test = base.extend({
  consoleGuard: [async ({ page }, use, testInfo) => {
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
    const errors = [];
    const gpuReadback = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (!['warning', 'error'].includes(message.type())) return;
      // Chromium/ANGLE CPU readback diagnostics, recorded separately; all other warnings still fail.
      if (/^\[\.WebGL-0x[0-9a-f]+\]GL Driver Message .*GPU stall due to ReadPixels/.test(message.text())) gpuReadback.push(message.text());
      else errors.push(message.text());
    });
    await use();
    if (gpuReadback.length) await testInfo.attach('gpu-readback-diagnostics', { body: Buffer.from(JSON.stringify(gpuReadback)), contentType: 'application/json' });
    const unexpected = testInfo.annotations.some(a => a.type === 'expected-media-failure') ? errors.filter(e => !/Failed to load resource.*404/.test(e)) : errors;
    expect(unexpected, 'Scene console stays clean').toEqual([]);
  }, { auto: true }],
});
const key = topic => `lingoplay:v3:en:image-match:${topic}:free`;
const read = (page, topic) => page.evaluate(key => JSON.parse(localStorage.getItem(key)).session, key(topic));
const image = (page, q) => page.locator(`[data-image-id="${q.id}"]`);
const word = (page, q) => page.locator(`[data-word-id="${q.id}"]`);
async function open(page, topic = 'colors', locale = 'en') {
  await page.goto(`/${locale}/games/image-match?topic=${topic}&practice=free`);
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.match-scene')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.match-canvas-host canvas')).toBeVisible();
  return read(page, topic);
}
async function fits(page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
async function dragTo(page, from, destination, touch = false) {
  await from.scrollIntoViewIfNeeded();
  const a = await from.boundingBox();
  const b = destination.boundingBox ? await destination.boundingBox() : destination;
  const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  if (touch) {
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
    for (let i = 1; i <= 8; i++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * i / 8, y: start.y + (end.y - start.y) * i / 8, id: 1 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await client.detach();
  } else {
    await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y, { steps: 8 }); await page.mouse.up();
  }
}
for (const locale of ['en', 'vi']) {
  test(`scene drag cancel, multiple mistakes, reload, keyboard and restart (${locale})`, async ({ page }, testInfo) => {
    const session = await open(page, 'colors', locale);
    await page.locator('.scene-mute').click();
    const q = session.questions;
    const box = await page.locator('.match-scene').boundingBox();
    await dragTo(page, image(page, q[0]), { x: box.x + 1, y: box.y + 1, width: 2, height: 2 });
    expect((await read(page, 'colors')).state.answers.filter(Boolean)).toHaveLength(0);
    await expect(image(page, q[0])).toHaveAttribute('aria-pressed', 'false');
    for (const [source, target] of [[1, 0], [3, 1]]) {
      await dragTo(page, image(page, q[source]), word(page, q[target]));
      await expect(word(page, q[target])).toBeDisabled();
      await expect(page.locator('.match-scene-game .notice')).toContainText(q[target].correctAnswer);
    }
    const saved = await read(page, 'colors');
    await page.reload();
    await expect(page.locator('.match-scene')).toHaveAttribute('aria-busy', 'false');
    expect((await read(page, 'colors')).state).toEqual(saved.state);
    for (const i of [0, 1]) await expect(page.locator('.match-scene-game .notice')).toContainText(q[i].correctAnswer);
    await page.locator('.scene-mute').click();
    for (const i of [2, 3]) {
      await word(page, q[i]).focus(); await page.keyboard.press('Enter');
      await expect(image(page, q[i])).toBeEnabled();
      await image(page, q[i]).focus(); await page.keyboard.press('Enter');
    }
    await expect(page.locator('.scene-score strong')).toHaveText('200');
    await page.waitForTimeout(1900);
    expect((await read(page, 'colors')).state.index).toBe(0); // Mistakes remain available for correction.
    await fits(page);
    await page.screenshot({ path: testInfo.outputPath(`scene-corrections-${locale}.png`), fullPage: true });
    await page.locator('.game-controls > button').press('Enter');
    await expect(page.locator('.result-score strong')).toHaveText('2 / 4');
    await page.reload();
    await expect(page.locator('.result-score strong')).toHaveText('2 / 4');
    await page.locator('.result-actions > button').first().click();
    await expect(page.locator('.match-scene')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.scene-word:enabled')).toHaveCount(4);
    await expect(page.locator('.scene-score strong')).toHaveText('0');
    await page.locator('.scene-view-toggle').click();
    await expect(page.locator('.matching-game')).toBeVisible();
    expect((await read(page, 'colors')).state.answers.filter(Boolean)).toHaveLength(0);
  });
}

test('scene touch drag/tap, automatic 3+2 boards, score and result', async ({ page }, testInfo) => {
  const session = await open(page, 'home');
  await page.locator('.scene-mute').click();
  let start = 0;
  for (const count of [3, 2]) {
    await expect(page.locator('.scene-word')).toHaveCount(count);
    await expect(page.locator('.scene-mute')).toHaveAttribute('aria-pressed', 'true');
    const board = session.questions.slice(start, start + count);
    for (let i = 0; i < board.length; i++) {
      if (i === 0) await dragTo(page, image(page, board[i]), word(page, board[i]), testInfo.project.use.hasTouch);
      else if (testInfo.project.use.hasTouch) { await word(page, board[i]).tap(); await image(page, board[i]).tap(); }
      else { await word(page, board[i]).press('Enter'); await image(page, board[i]).press('Enter'); }
      await expect.poll(async () => (await read(page, 'home')).state.answers[start + i]).toBe(board[i].correctAnswer);
    }
    if (start === 0) { await page.screenshot({ path: testInfo.outputPath('scene-complete.png'), fullPage: true }); await expect(page.locator('.scene-word')).toHaveCount(2); }
    start += count;
  }
  await expect(page.locator('.result-score strong')).toHaveText('5 / 5');
  expect((await read(page, 'home')).state.index).toBe(5);
  await fits(page);
});

test('scene reduced motion, resize, mode switch and unmount during load', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const session = await open(page, 'colors');
  await page.locator('.scene-mute').click();
  await dragTo(page, image(page, session.questions[0]), word(page, session.questions[0]));
  for (const width of [360, 430, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await fits(page); await expect(page.locator('.scene-picture:enabled')).toHaveCount(3); }
  await page.screenshot({ path: testInfo.outputPath('scene-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('scene-mobile.png'), fullPage: true });
  await page.locator('.scene-view-toggle').click();
  await expect(page.locator('.match-canvas-host canvas')).toHaveCount(0);
  await expect(page.locator('.match-word:disabled')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.matching-game')).toBeVisible();
  await page.locator('[data-locale][lang="vi"]').click();
  await expect(page.locator('.matching-game')).toBeVisible();
  await expect(page).toHaveURL(/\/vi\/games\/image-match.*view=simple/);
  await expect(page.locator('.match-word:disabled')).toHaveCount(1);
  await page.locator('.scene-view-toggle').click();
  await page.locator('.session-toolbar button').first().click();
  await expect(page.locator('.topic-picker')).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('scene renderer unavailable uses playable DOM fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (/webgl|webgpu/.test(type)) return null; return original.call(this, type, ...args); };
  });
  await page.goto('/en/games/image-match?topic=transport&practice=free');
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.matching-game')).toBeVisible();
  await expect(page.getByText('The scene could not load.', { exact: false })).toBeVisible();
  const session = await read(page, 'transport');
  await page.locator('.match-word').filter({ hasText: session.questions[0].correctAnswer }).click();
  await page.locator('.match-image').filter({ has: page.locator(`img[src="${session.questions[0].image.url}"]`) }).click();
  await expect(page.locator('.word-steps .completed')).toHaveCount(1);
});

test('scene pronunciation timing, mute, media retry and no mastery farming', async ({ page }) => {
  test.info().annotations.push({ type: 'expected-media-failure' });
  await page.addInitScript(() => {
    window.qaPronunciation = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function() { window.qaPronunciation.push(this.src); return original.call(this); };
  });
  let fail = true;
  await page.route('**/*.mp3', async route => { if (fail) await route.fulfill({ status: 404, body: '' }); else await route.continue(); });
  const session = await open(page, 'colors');
  expect(await page.evaluate(() => window.qaPronunciation)).toEqual([]);
  await word(page, session.questions[0]).click(); await image(page, session.questions[0]).click();
  await expect(page.getByText('Audio could not play.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => window.qaPronunciation.length)).toBe(1);
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('Audio could not play.', { exact: false })).toHaveCount(0);
  await page.locator('.scene-mute').click();
  await word(page, session.questions[1]).click(); await image(page, session.questions[1]).click();
  expect(await page.evaluate(() => window.qaPronunciation.length)).toBe(2);
  const memory = await page.evaluate(() => JSON.parse(localStorage.getItem('lingoplay:learning:v1:en')));
  expect(Object.keys(memory.words)).toHaveLength(2);
  expect(Object.values(memory.words).every(q => q.successes === 1)).toBe(true);
  for (const q of session.questions.slice(2)) { await word(page, q).click(); await image(page, q).click(); }
  await expect(page.locator('.game-result')).toBeVisible();
  await page.locator('.result-actions > button').first().click();
  await expect(page.locator('.match-scene')).toHaveAttribute('aria-busy', 'false');
  await page.locator('.scene-mute').click();
  await word(page, session.questions[0]).click(); await image(page, session.questions[0]).click();
  const repeated = await page.evaluate(() => JSON.parse(localStorage.getItem('lingoplay:learning:v1:en')));
  expect(repeated.words[session.questions[0].id].successes).toBe(1);
  expect(repeated.words[session.questions[0].id].dueAt).toBe(memory.words[session.questions[0].id].dueAt);
});

test('scene missing picture falls back without losing round', async ({ page }) => {
  test.info().annotations.push({ type: 'expected-media-failure' });
  await page.route('**/images/vocabulary/*.svg', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/en/games/image-match?topic=colors&practice=free');
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.matching-game')).toBeVisible();
  await expect(page.getByText('Picture unavailable. Text description:', { exact: false }).first()).toBeVisible();
  expect((await read(page, 'colors')).questions).toHaveLength(4);
  await fits(page);
});

test('scene context loss cleans up and preserves answers', async ({ page }) => {
  const session = await open(page, 'colors');
  await page.locator('.scene-mute').click();
  await word(page, session.questions[0]).press('Enter');
  await image(page, session.questions[0]).press('Enter');
  const saved = (await read(page, 'colors')).state;
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.locator('.matching-game')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect((await read(page, 'colors')).state).toEqual(saved);
  await expect(page.locator('.match-word:disabled')).toHaveCount(1);
});

test('scene asset resolves after navigation without stale canvas', async ({ page }) => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  let requested;
  const observed = new Promise(resolve => { requested = resolve; });
  await page.route('**/images/vocabulary/*.svg', async route => { requested(); await pending; await route.continue(); });
  await page.goto('/en/games/image-match?topic=colors&practice=free');
  await page.locator('.topic-picker > .primary-button').click();
  await observed;
  await page.locator('.session-toolbar button').first().click();
  release();
  await expect(page.locator('.topic-picker')).toBeVisible();
  await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.match-scene')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('scene lazy chunk failure keeps matching playable', async ({ page }) => {
  test.info().annotations.push({ type: 'expected-media-failure' });
  await page.route('**/ImageMatchScene.*.js', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/en/games/image-match?topic=transport&practice=free');
  await page.locator('.topic-picker > .primary-button').click();
  await expect(page.locator('.matching-game')).toBeVisible();
  const session = await read(page, 'transport');
  await page.locator('.match-word').filter({ hasText: session.questions[0].correctAnswer }).press('Enter');
  await page.locator('.match-image').filter({ has: page.locator(`img[src="${session.questions[0].image.url}"]`) }).press('Enter');
  await expect(page.locator('.word-steps .completed')).toHaveCount(1);
});

test('scene round is playable entirely with Tab and Enter', async ({ page }) => {
  const session = await open(page, 'transport');
  await expect(page.locator('.scene-word').first()).toBeFocused();
  for (const question of session.questions) {
    await expect(word(page, question)).toBeFocused();
    await page.keyboard.press('Enter');
    const target = image(page, question);
    for (let i = 0; i < 4 && !(await target.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(target).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(word(page, question)).toBeDisabled();
  }
  await expect(page.locator('.result-score strong')).toHaveText('2 / 2');
  await expect(page.locator('#result-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.result-actions > button').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.scene-word').first()).toBeFocused();
});

test('unrelated pointerup cannot end the captured drag', async ({ page }) => {
  const session = await open(page, 'colors');
  await page.locator('.scene-mute').click();
  await image(page, session.questions[0]).scrollIntoViewIfNeeded();
  const a = await image(page, session.questions[0]).boundingBox();
  const target = await word(page, session.questions[0]).boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  // Real captured drag plus an injected secondary-pointer end; single-finger trusted touch is covered above.
  await image(page, session.questions[1]).dispatchEvent('pointerup', { pointerId: 99, pointerType: 'touch', isPrimary: false, button: 0 });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await read(page, 'colors')).state.answers[0]).toBe(session.questions[0].correctAnswer);
  expect((await read(page, 'colors')).state.answers.filter(Boolean)).toHaveLength(1);
});
