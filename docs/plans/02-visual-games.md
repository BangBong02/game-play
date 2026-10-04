# M2–M3 — Listening pictures and image matching

## Objective
Add two distinct polished visual interactions while reusing canonical vocabulary and the existing React engine.
## Current state
At planning: Picture Pick and three text/spelling modes; future media eligibility existed but no listening/matching games. Final delivery status is recorded below.
## Desired state
Listen/Image asks for a picture after explicit playback; Image Match connects English words to pictures through accessible two-step selection.
## User flow
Choose game/topic → short round → play/replay or select a word/image pair → compact feedback → next → result/restart. Image matching clears completed pairs; no drag-only interaction.
## Technical design
Add explicit normalized question media/image-option data. Keep scoring/progress/restart shared. Use a native audio element with explicit play/replay, stop on question change, catch errors and show localized retry feedback. Add small matching renderer only when its distinct interaction needs it.
## Data flow
Existing repository eligibility → generator builds mode-specific questions → shared session/storage → renderer consumes media fields. No filename guesses or source dataset imports in React.
## Edge cases
Audio blocked/unavailable; missing image; repeated click; option shuffle on reload; answered controls locked; mobile taps; keyboard focus; locale change.
## Testing
Generator media coverage, safe URLs, choice uniqueness, scoring/state validation/storage; all modes regression; real playback state, wrong/right, results/restart/reload, desktop/tablet/mobile and clean console.
## Acceptance criteria
Both activities playable and discoverable under real skill filters; no autoplay; accessible controls; valid persistence; existing four games intact; tests/build/browser pass before each feature commit.
## Risks
Do not expose the spoken target as visible text before listening answer. Describe image choices accessibly. Do not convert the whole website to a React application.
## Progress
- M2 DONE:normalized audio/image-choice questions, native opt-in/replay with caught failures/reload retry, skills Listening/Pictures. Unit40/40, HTML5/5, build124pages, Chrome desktop/tablet768/mobile390CSS, wrong/right/reload/result3of4/restart and actual playback. Controlled missing asset recovered after restore. M3 matching IN PROGRESS.
## Decisions
Owner approved Picture Pick → Listen/Image → Image Match. Native click/tap/keyboard matching, no PixiJS.

Checkpoint before fallback QA (2026-10-04):matching questions and2–4-pair boards (5 splits3+2); any-order attempts, stable imageOrder on save/reload, keyboard focus and wrong-pair correction implemented. Unit41/41 passed before memory integration; combined51/51 and HTML7/7/build154 passed. Chrome disconnected before M3 interaction testing, so interactive QA/commit were pending at that checkpoint.

Final M3 QA:Playwright72-case desktop/tablet/mobile matrix plus3 default10-pair checks passed; EN/VI5-pair3+2 and10-pair4+4+2 rounds, any-order wrong/right, answer locks, saved image order, reload/results/restart, Tab/Enter/touch, completed-pair progress and global memory. Focus now moves to result heading on completion. Screenshots reviewed; no overflow at360/390/430/768/1280. Shared media failure/retry/fallback verified. Unit52/52, HTML7/7, build154/0 diagnostics. Chrome Integration is optional; former blocker removed. Status:DONE. Validated feature `6e34c30` pushed on dev branch.
