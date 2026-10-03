# Lingoplay — Product decisions

Updated: 2026-10-03. Source of truth for the current autonomous MVP; historical work remains in `doc/PROGRESS.md`.

## Confirmed by the owner

- English is the learning target; EN/VI are interface locales. Home shows games immediately with native skill filters. Topic selection is optional. Easy/Medium/Hard is legacy metadata only.
- Vocabulary targets are cumulative **300 ⊂ 1,200 ⊂ 3,000**, drawn from Oxford 3000. Lingoplay chooses a practical priority order emphasizing common everyday words; 300/1,200 are our subsets, not official Oxford lists or a verified corpus frequency ranking.
- Mastery requires correct answers on **three different days**. Intervals: **1 day → 7 days → 60 days**; a mistake schedules review after **5 hours**. Repeated answers on the same day cannot farm mastery. This is an adjustable MVP heuristic, not FSRS or a scientific claim of permanent recall.
- Build sequentially: polish **Picture Pick**, then **Listen → Image**, then **Image Match**. Preserve the existing four games.
- Local data and localStorage now; future metadata source is **Supabase**, with authentication/sync only when needed. No database, paid service, login or deployment change in this MVP.
- Autonomous feature commits and milestone pushes are authorized. Work on `codex/oxford-learning-mvp`; do not push main or trigger its production deployment.

## Implementation defaults

- **50 complete demo words**, with independently written Vietnamese meanings, POS, examples and stable IDs. At least 20 words have usable visual/audio media. Do not present 50 as a completed 300-word course.
- Use one **English US** local synthesized voice for the demo, selected by the engineer after the owner delegated the choice. No evidence establishes that the reference site consistently uses US or that US is most popular. Audio plays only on request, with replay and failure feedback. No Oxford audio is copied.
- Keep project-owned lightweight SVG illustrations where already appropriate; convert suitable raster/new illustrations to WebP. Media URLs remain content fields, never inferred by a game renderer. Record asset provenance.
- Review due words first, then unseen words in editorial priority order, in short rounds of up to ten. When nothing is due/new, offer explicit free practice rather than silently resetting learning memory.
- Topic completion counts mastered words in the **available dataset**. A mastered word due for maintenance is also marked for review. Existing round progress is retained but does not become mastery without new learning evidence.
- A word can belong to multiple topics; global learning memory uses its canonical ID and never double-counts it toward the vocabulary target.
- Keyboard and touch operate every activity. Image Match uses select-word → select-image; drag gestures are unnecessary for the MVP and would make mobile/keyboard access harder.

## Research and boundaries

- [Oxford's explanation](https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000): Oxford 3000 covers core A1–B2 vocabulary selected for frequency and learner relevance. Its public list does not provide the required 1–3,000 ranking. Verify membership using the [CEFR PDF](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000_by_CEFR_level.pdf); author our meanings/examples and never copy dictionary definitions, artwork or pronunciation files. Full production import/licensing is a later content review.
- Actual Chrome reference sessions are documented in Phase 6 of `doc/PROGRESS.md`: Monster Vocab, Fast Vocab and Numbers. Reuse small vocabulary groups, prioritize picture/audio/answer controls, lock completed answers, and keep feedback compact. No copied branding, artwork, colors or source.
- [Anki background](https://docs.ankiweb.net/background.html) supports the general review-spacing pattern; the exact MVP intervals above are the owner's product choice.
- [Native media playback](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) can fail; handle the promise and offer retry instead of leaving an unanswered listening question without explanation.

## Audit snapshot

Starting HEAD: `5457f7b`. Astro 7 + React 19 + TypeScript; Content Collections; independent pure vocabulary engine; four games; 20 local illustrated words; versioned round storage with legacy migration. Baseline: 37 unit tests, 5 built-HTML tests and production-configured build passed. Main is connected to Cloudflare Workers Builds. Existing media-ready work was reviewed and committed as `2e58436` before new implementation.
