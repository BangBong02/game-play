# M1 — Demo content and Picture Pick

## Objective
Deliver50 useful Oxford-aligned demo words with stable IDs and enough owned visual/audio media to exercise all planned games.
## Current state
20 illustrated words; sparse illustrative ranks; optional media schema; four working games; exact round persistence.
## Desired state
50 words with own meanings/POS/examples, editorial priority, ranked useful topics, US audio and at least20 pictures. Keep the old20 IDs and SVG URLs. Explain demo scope and provenance.
## User flow
Home → Picture Pick → optional topic → short round → localized feedback → results/restart/new words. No level selection.
## Technical design
Extend existing local content, Topic priority and repository sorting. Native offline SAPI synthesis produces MP3 files; no runtime TTS/service dependency. SVG remains appropriate for existing small vectors. React gets URLs from content. Validate restored sessions against all current eligible topic words so rank changes do not discard old rounds.
## Data flow
Local Word[] → async Astro repository → normalized React props → pure question generator → native HTML image/audio → existing round storage.
## Edge cases
Missing media; fewer than4 distinct choices; old rounds with old rank windows; asset failure; duplicate meanings; locales share learning data.
## Testing
Content IDs/ranks/metadata/assets and eligibility; resume after priority reorder; baseline regressions; built HTML; desktop/tablet/mobile picture right/wrong/keyboard/reload/restart/result and console.
## Acceptance criteria
50 distinct English words; no fake frequency ranking; ≥20 usable media pairs; source/provenance documented; tests/build and relevant browser checks pass.
## Risks
Synthetic voice quality is demo-grade; full Oxford content redistribution is not inferred from public availability. Retain old media URLs rather than inventing a migration layer.
## Progress
- DONE:50 Oxford words +2 supplemental legacy words,52 stable IDs/POS/examples/MP3s,30 images (10 new WebP). Topic priority and full-pool restore implemented. Unit39/39 + HTML5/5 + build122 pages/0 diagnostics. Chrome desktop/tablet768/mobile390CSS right/wrong/Enter, reload exact feedback, restart, result4/5, naturalWidth480 WebP, no overflow or console warning/error.
## Decisions
US offline voice; teaching priority selected by Lingoplay; old rounds preserved; no bulk3000 import.
