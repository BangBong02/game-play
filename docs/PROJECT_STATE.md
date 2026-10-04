# Project state

Updated: 2026-10-04

- Branch: `codex/oxford-learning-mvp`. Main auto-deploys; leave it untouched.
- Current work: M0–M6 DONE. M7 audit and M8 single Image Match spike/comparison VALIDATED; feature commit/dev push pending. Owner confirmed all five choices. Astro/React/data/storage boundaries preserved; content/backend remain BACKLOG.
- Latest pushed implementation commits: `cc08c34` progress study/review/free links and completed-review restore; `569436b` multiple Image Match corrections. Earlier: `6e34c30` Image Match/memory, `aca4df1` Listen/Image, `430d644` content, `5491253` decisions, `2e58436` foundation. Main/production untouched.
- Confirmed decisions: cumulative curated Oxford subsets; mastery on3 scheduled different-day successes;1d/7d/60d, wrong5h; Picture Pick → Listen/Image → Image Match. Engineer chose local US demo voice; no paid services.
- Implemented content:50 verified Oxford core words +2 supplemental legacy words,30 pictures,52 US MP3s; stable IDs and topic priorities.
- Implemented M3:2–4-pair native matching boards, any-order word/image selection, locked attempts, wrong-pair correction, shared score/results/restart and persisted image order. Real5-pair3+2 and10-pair4+4+2 flows verified on desktop/tablet/mobile; result focus fixed.
- Implemented M4: global memory key `lingoplay:learning:v1:en`, due-first scheduling, separate study/review/free round keys, honest demo/target counts, topic mastery and progress island, static vocabulary topic pages with examples/audio. Legacy storage remains readable and is not treated as mastery.
- M6 baseline validation: unit52/52, HTML7/7, build154 pages/Astro40 files/0 diagnostics, Playwright87/87 exit0; full six-game EN/VI, responsive, keyboard/touch, media/storage and SRS/progress regression matrix. M8 current validation is below. No lint script.
- M6 Chrome baseline: Bang played all six games and inspected desktop/tablet/mobile, keyboard/media/progress/persistence/restart with clean console. Viewport reset; temporary debugger interruption recovered with a fresh tab while tests continued.
- Browser policy: unit/integration → build/typecheck/lint when available → Playwright → Chrome as primary visual QA → responsive. Reconnect reasonably on disconnect, then equivalent safe QA; never block the roadmap when a fallback works.
- Implemented M6: matching feedback derives all corrections from persisted answers; summary/topic links select review for due words, study for unseen words, free when waiting. Completed review opens setup when a playable due round is available; unfinished rounds resume, results persist when no new review is ready. No engine/storage schema/dependency changes.
- Exact next action: reviewed feature commit and dev milestone push, then close out M7/M8 status. Next product priority is M9 static discovery scene preview/hierarchy; another Pixi game needs a concrete interaction benefit and physical-mobile performance evidence. Main merge/production deployment remains a separate release action.
- Backlog:full300/1200/3000 editorial content, Supabase metadata, authentication/sync. Not blockers for this local MVP.

Local dev server: `http://127.0.0.1:4323` (started for this task). Unit tests inject time; no developer clock controls or debug routes are exposed in the product.

Prior independent checks:153 built index routes and82 media URLs returned200; unknown route404;52 MP3 files decoded successfully. Topic counters use all core word IDs across games, not only pictured words (School3/4 regression covered). Homepage prioritizes Picture Pick, Listen/Image and Image Match. No source mock import/debug log in game/React modules. Playwright is dev-only; M8 adds only pinned PixiJS8.22.0, lazy-loaded by Image Match.

## M8 local quality gate

- Drag/snap, short entrance/wrong feedback, semantic tap/keyboard, correct boards auto-next1.6s; wrong boards retain all corrections until Continue. Pronunciation + native SFX, mute persists across boards/restart. Score100 per correct pair never alters SRS.
- Simple view preserves the DOM board and round. WebGL unavailable/context lost/assets or lazy chunk failed: DOM remains playable. Cleanup covers late async init/load, observers, ticker, pointer capture and audio. No engine/localStorage schema changes.
- Fixed QA findings: post-drag touch compatibility clicks, mute reset, Simple-view initial focus and delayed animation-frame focus stealing a subsequent answer. Focus runs with committed DOM/preventScroll. Auto-transition assertions use persisted answers rather than a disappearing board.
- Final52/52 unit,7/7 HTML, production SITE_URL build154 pages/43 Astro files/0 diagnostics. Full123/123 Playwright exit0,0 flaky/skipped; both renderers and all six games, EN/VI, desktop/tablet/mobile, true touch drag/tap, Tab/Enter-only, right/wrong/cancel/reload/restart/results, SRS/media/mute/retry/resize/reduced-motion/unmount/context/chunk failure. Three headless cases recorded ANGLE readback diagnostics separately; app warnings/errors fail tests.
- Chrome Bang scene Travel2/2 via drag+Enter+auto result; reload/restart/Simple view/locale. Mobile VI Colors intentional wrong Green, correct Yellow, reload2/4/100, keyboard remaining→manual result3/4; correct pictures/corrections remain visible. Progress0 mastered/6 practiced confirms score≠mastery. Warn/error logs empty. Responsive screenshots reviewed; override reset. Real mobile hardware and assistive-technology audit remain follow-ups.
- Incremental scene cost about170 KiB gzip, cold local usable-board sample904ms vs52ms DOM; diagnostic sample only. Other games do not request Pixi. Decision: keep this one development spike/fallback, no other canvas migration yet. See PRODUCT_AUDIT for measured evidence and limits.
- `npm audit` identifies one pre-existing Astro transitive high advisory; none from Pixi. No unrelated force-upgrade. No current QA blocker.
