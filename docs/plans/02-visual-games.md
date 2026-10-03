# M2–M3 — Listening pictures and image matching

## Objective
Add two distinct polished visual interactions while reusing canonical vocabulary and the existing React engine.
## Current state
Picture Pick and three text/spelling modes; future media eligibility exists but no listening/matching games.
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
- Planned; M1 dependency pending.
## Decisions
Owner approved Picture Pick → Listen/Image → Image Match. Native click/tap/keyboard matching, no PixiJS.
