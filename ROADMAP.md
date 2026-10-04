# Lingoplay roadmap

Updated: 2026-10-04. Functional local MVP M0–M6 is delivered. Current priority is the owner-approved game-feel audit and one Image Match hybrid spike; content/backend remain BACKLOG.

| ID | Feature / goal | Dependencies | Priority | Acceptance | Status |
|---|---|---|---|---|---|
| M0.1 | Shared media eligibility and repository queries | Existing engine | P0 | Four games keep working; media filtered before rank/count; tests/build/browser pass | DONE |
| M1.1 | Product decisions, resumable plans and project conventions | Audit, owner answers | P0 | Required docs reflect real code and confirmed defaults | DONE |
| M1.2 | 50 curated words, topic priorities, US audio and Picture Pick polish | M0.1, M1.1 | P0 | Stable IDs; valid Oxford membership; own meanings/examples; ≥20 visual/audio words; responsive picture flow and assets validated | DONE |
| M2.1 | Listen → Image | M1.2 | P0 | Real opt-in/replay audio; image choices; keyboard/touch; failure feedback; resume/results; tests/build/browser pass | DONE |
| M3.1 | Image Match | M1.2, M2.1 | P0 | Select word then matching image; compact feedback; keyboard/touch; completed pairs/progress/results; resume; tests/build/browser pass | DONE |
| M4.1 | Global learning memory and due-first rounds | Stable IDs, all games | P0 | Three different-day correct answers; 1d/7d/60d and wrong5h; duplicate/reload protection; old rounds preserved; meaningful tests | DONE |
| M4.2 | Vocabulary targets, topic progress and review screen | M4.1 | P0 | Available/demo counts honest; unseen/learning/correct/due/mastered distinct; topic completion based on mastery; EN/VI | DONE |
| M5.1 | Release validation and handoff | All MVP features | P0 | Six games tested desktop/tablet/mobile, keyboard, wrong/right, reload/restart/results; console clean; unit/HTML/build pass; review diff; docs and dev pushes current | DONE |
| M6.1 | Chrome visual audit and incremental gameplay polish | M0–M5, connected Bang profile | P0 | Six current games actually played; Image Match multiple corrections/reload accurate; actionable study/review/free progress links and repeated review cycles; desktop/tablet/mobile, keyboard, media/progress/console; full validation and dev push | DONE |
| M7.1 | Product gap audit and owner decisions | M6, reference play, Pixi v8 research | P0 | Graded evidence-based comparison; one batch answered; new direction documented; remaining reference observations honest | DONE |
| M8.1 | Image Match hybrid flagship spike | M7.1 | P0 | One lazy Pixi scene, image drag/snap, tap/keyboard, gentle transitions, pronunciation/SFX/mute, DOM fallback; unchanged engine/SRS/storage; production QA gate | DONE |
| M8.2 | DOM/scene comparison and rollout decision | M8.1 | P0 | Record quality/complexity/bundle/responsive/accessibility/performance evidence and physical-device limits; promote only if useful; dev milestone validation/push | DONE |
| M9.1 | Discovery previews and selected game polish | M8.2, measured gaps | P1 | Static flagship card preview and consistent hierarchy; another canvas game waits for physical-device evidence and a concrete benefit | PLANNED |
| B1 | Expand verified content to 300, then 1,200, then 3,000 | Game-feel gate, editorial/source review | P1 | Useful curated order; cumulative boundaries; content/media QA; lawful provenance | BACKLOG |
| B2 | Supabase metadata repository | Demonstrated local-data constraint | P2 | Same normalized Word contract; build/refresh strategy; no engine coupling | BACKLOG |
| B3 | Account sync/auth | Owner request, B2 | P3 | Explicit sync/conflict/privacy policy; local progress migration | BACKLOG |

Commit a validated feature; push the development branch after each milestone. Never claim DONE from compilation alone. Roadmap status is updated alongside `docs/PROJECT_STATE.md` and the existing progress journal.

M3/M4 implementation and validation are complete:unit52/52, built HTML7/7, build154 pages/0 diagnostics; Playwright72/72 full matrix plus3/3 ten-pair matching checks. Six games EN/VI, desktop/tablet/mobile, keyboard/touch, media/storage failures, progress/mastery/review/reload/restart and console verified; screenshots reviewed. Validated feature commit `6e34c30` is pushed on `codex/oxford-learning-mvp`; M5 handoff is complete. Chrome Integration is the primary visual QA when connected; equivalent QA must not block on its availability.

Previous independent checks:153 built index routes and82 media URLs return200 on local static preview; unknown route404; all52 MP3s decode. Final review has no runtime mock-data imports/debug logs; diff check passes. The former Chrome-only blocker is removed. Local MVP M0–M5 is complete. B1/B2/B3 remain BACKLOG; main/production deployment is a separate release action.

M6 COMPLETE: Chrome Bang actually played all six current games and reviewed desktop/tablet/mobile, EN/VI, media, keyboard, progress/reload/restart/results and clean console. Fixed multiple Image Match corrections, actionable progress links and stale completed-review restore. Final unit52/52, HTML7/7, build154 pages/0 diagnostics, full Playwright87/87 exit0. Feature commits `569436b` and `cc08c34` are pushed to the dev branch. QA policy keeps Chrome as primary visual validation with safe fallback; a temporary tab/debugger interruption was recovered without blocking tests. No required current scope remains; B1/B2/B3 stay BACKLOG.

M7/M8 COMPLETE: owner-confirmed audit/decisions, one lazy Image Match scene and DOM comparison delivered in `870115d`, push confirmed from6fc322f to870115d on the dev branch. Final52 unit +7 HTML +123 browser tests pass with0 flaky/skipped; production-configured static build154/43 Astro files/0 diagnostics. Chrome desktop/mobile/EN/VI drag/keyboard/correction/reload/restart/result/progress and clean app console verified. Renderer fallback/cleanup and narrow recorded headless-driver diagnostics are documented in PRODUCT_AUDIT. Decision keeps this single development spike; no other canvas migration before physical-device/performance evidence. M9 discovery polish is the next planned product step; content/backend remain BACKLOG, production release separate.
