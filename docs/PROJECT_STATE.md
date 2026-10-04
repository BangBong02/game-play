# Project state

Updated: 2026-10-04

- Branch: `codex/oxford-learning-mvp`. Main auto-deploys; leave it untouched.
- Current work: local MVP M0–M5 DONE; M6 Chrome visual audit/polish IN PROGRESS after owner requested visible QA. Chrome profile Bang works. Reproduced Image Match feedback reporting only the first mistake; deriving all corrections from persisted answers fixes it without storage changes.
- Latest pushed implementation commit: `6e34c30` Image Match/learning progress with Playwright regressions. Earlier: `aca4df1` Listen/Image, `430d644` demo content, `5491253` decisions/plans, `2e58436` foundation. M5 handoff docs follow the implementation milestone. No main push/production deployment performed.
- Confirmed decisions: cumulative curated Oxford subsets; mastery on3 scheduled different-day successes;1d/7d/60d, wrong5h; Picture Pick → Listen/Image → Image Match. Engineer chose local US demo voice; no paid services.
- Implemented content:50 verified Oxford core words +2 supplemental legacy words,30 pictures,52 US MP3s; stable IDs and topic priorities.
- Implemented M3:2–4-pair native matching boards, any-order word/image selection, locked attempts, wrong-pair correction, shared score/results/restart and persisted image order. Real5-pair3+2 and10-pair4+4+2 flows verified on desktop/tablet/mobile; result focus fixed.
- Implemented M4: global memory key `lingoplay:learning:v1:en`, due-first scheduling, separate study/review/free round keys, honest demo/target counts, topic mastery and progress island, static vocabulary topic pages with examples/audio. Legacy storage remains readable and is not treated as mastery.
- Final validation:unit52/52, built HTML7/7, production SITE_URL build154 pages /0 errors /0 warnings /0 hints. Playwright72/72 full matrix plus3/3 ten-pair matching checks:all six games EN/VI, desktop1280/tablet768/mobile390 and widths360/430, keyboard/touch, wrong/right/reload/restart/results, audio opt-in/replay/retry, image fallback, legacy locale/migration, blocked/read-only/partial storage, scheduled mastery/review and School3/4. Browser screenshots reviewed. App console clean; expected404 only in failure fixtures. Google Fonts CSS is stubbed to exercise system-font fallback offline. No lint script.
- Browser policy: unit/integration → build/typecheck/lint when available → Playwright → Chrome as primary visual QA → responsive. Reconnect reasonably on disconnect, then equivalent safe QA; never block the roadmap when a fallback works.
- Exact next action: full automated validation, actual six-game Chrome audit and desktop/tablet/mobile checks; fix observed issues, review/docs, then validated dev commit/push. B1/B2/B3 remain future backlog.
- Backlog:full300/1200/3000 editorial content, Supabase metadata, authentication/sync. Not blockers for this local MVP.

Local dev server: `http://127.0.0.1:4323` (started for this task). Unit tests inject time; no developer clock controls or debug routes are exposed in the product.

Prior independent checks:153 built index routes and82 media URLs returned200; unknown route404;52 MP3 files decoded successfully. Topic counters use all core word IDs across games, not only pictured words (School3/4 regression covered). Homepage prioritizes Picture Pick, Listen/Image and Image Match. No source mock import/debug log in game/React modules. Playwright is a dev-only QA dependency; runtime dependencies are unchanged.
