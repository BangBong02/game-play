# Lingoplay roadmap

Updated: 2026-10-04. Current delivery scope is the local Oxford-aligned learning MVP. Future items explicitly marked BACKLOG are not required for this delivery.

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
| B1 | Expand verified content to 300, then 1,200, then 3,000 | MVP, editorial/source review | P1 | Useful curated order; cumulative boundaries; content/media QA; lawful provenance | BACKLOG |
| B2 | Supabase metadata repository | Demonstrated local-data constraint | P2 | Same normalized Word contract; build/refresh strategy; no engine coupling | BACKLOG |
| B3 | Account sync/auth | Owner request, B2 | P3 | Explicit sync/conflict/privacy policy; local progress migration | BACKLOG |

Commit a validated feature; push the development branch after each milestone. Never claim DONE from compilation alone. Roadmap status is updated alongside `docs/PROJECT_STATE.md` and the existing progress journal.

M3/M4 implementation and validation are complete:unit52/52, built HTML7/7, build154 pages/0 diagnostics; Playwright72/72 full matrix plus3/3 ten-pair matching checks. Six games EN/VI, desktop/tablet/mobile, keyboard/touch, media/storage failures, progress/mastery/review/reload/restart and console verified; screenshots reviewed. Validated feature commit `6e34c30` is pushed on `codex/oxford-learning-mvp`; M5 handoff is complete. Chrome Integration is optional; equivalent QA must not block on its availability.

Previous independent checks:153 built index routes and82 media URLs return200 on local static preview; unknown route404; all52 MP3s decode. Final review has no runtime mock-data imports/debug logs; diff check passes. The former Chrome-only blocker is removed. Local MVP M0–M5 is complete. B1/B2/B3 remain BACKLOG; main/production deployment is a separate release action.
