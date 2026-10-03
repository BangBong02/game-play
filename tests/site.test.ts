import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getGames } from '../src/config/games.ts';
import { locales, messages } from '../src/i18n.ts';
import { levels } from '../src/config/course.ts';
import { topics } from '../src/data/content.ts';

// Run after npm run build. Assert the HTML actually shipped by Astro, without a browser/test dependency.
const html = (path: string) => readFileSync(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');

test('both homepages render localized UI, four ordered games and no level step or React island', () => {
  for (const locale of locales) {
    const page = html(locale);
    assert.ok(page.includes(`<html lang="${locale}">`));
    assert.ok(page.includes(`<h1>${messages[locale].hero}</h1>`));
    assert.ok(page.includes(`>${messages[locale].learn}</a>`));
    assert.equal((page.match(/class="home-game-card /g) ?? []).length, 4);
    const links = [...page.matchAll(/href="([^\"]+)" data-skills=/g)].map(match => match[1]);
    assert.deepEqual(links, getGames().map(game => `/${locale}/games/${game.slug}`));
    assert.doesNotMatch(page, /astro-island|href="\/(en|vi)\/(easy|medium|hard)/);
    assert.ok(page.includes(`href="/${locale}/learn"`));
  }
});

test('rendered filters default to All and expose only skills with real games', () => {
  for (const locale of locales) {
    const page = html(locale);
    assert.match(page, /data-filter="all" aria-pressed="true"/);
    assert.match(page, /data-filter="vocabulary" aria-pressed="false"/);
    assert.match(page, /data-filter="spelling" aria-pressed="false"/);
    assert.match(page, /data-skills="vocabulary spelling"/);
    assert.doesNotMatch(page, /data-filter="(?:listening|grammar)"/);
  }
});

test('localized game routes share real English vocabulary HTML and one React game island', () => {
  for (const game of getGames()) {
    const pages = locales.map(locale => html(`${locale}/games/${game.slug}`));
    assert.equal(pages[0].match(/<tbody>.*?<\/tbody>/s)?.[0], pages[1].match(/<tbody>.*?<\/tbody>/s)?.[0]);
    for (let index = 0; index < pages.length; index++) {
      const page = pages[index]; const locale = locales[index];
      assert.ok(page.includes(`<h1>${game.title[locale]}</h1>`));
      assert.equal((page.match(/<astro-island /g) ?? []).length, 1);
      assert.equal((page.match(/<th scope="row" lang="en">/g) ?? []).length, game.id === 'image-to-word' ? 30 : 52);
      assert.ok(page.includes(`/${locale}/games/${game.slug}`));
      assert.match(page, /<meta name="description"/);
      // Local builds can omit SITE_URL; production builds must use the configured site.
      const canonical = page.match(/rel="canonical" href="([^"]+)"/);
      if (canonical) {
        assert.equal(new URL(canonical[1]).pathname, `/${locale}/games/${game.slug}`);
        assert.match(page, /hreflang="en"/); assert.match(page, /hreflang="vi"/);
      }
    }
  }
});

test('learn articles stay Astro HTML with the same English lesson in either UI locale', () => {
  const pages = locales.map(locale => html(`${locale}/learn/grammar/a-and-an`));
  assert.equal(pages[0].match(/<article lang="en".*?<\/article>/s)?.[0], pages[1].match(/<article lang="en".*?<\/article>/s)?.[0]);
  for (const page of pages) { assert.doesNotMatch(page, /astro-island/); assert.match(page, /<h2>/); }
  assert.match(html('vi/learn'), /Thư viện học tập/);
});

test('legacy level and topic bookmarks redirect to the new game flow', () => {
  for (const locale of locales) for (const level of levels) {
    assert.match(html(`${locale}/${level.id}`), /http-equiv="refresh"/);
    for (const topic of topics) {
      const page = html(`${locale}/${level.id}/vocabulary/${topic.id}`);
      assert.match(page, /http-equiv="refresh"/);
      assert.ok(page.includes(`/${locale}/games/word-match?topic=${topic.id}`));
    }
  }
});
