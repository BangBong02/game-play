# M4 — Learning memory and progress

## Objective
Turn round scores into evidence-based local learning progress without treating seen words as mastered.
## Current state
Versioned local round saves and completed IDs; no cross-game learning memory or due scheduling.
## Desired state
Canonical per-word state with three different-day successes, adjustable 1d/7d/60d intervals and mistake5h; due-first rounds; honest cumulative targets and topic progress.
## User flow
Answer a word → round saves and memory updates once → next visit reviews due words then unseen priority words → progress screen shows statuses and topic completion → explicit free practice if nothing due/new.
## Technical design
Small pure scheduler module with injected time, plus defensive localStorage read/write using a separate versioned key. No service abstraction/backend/library. Track credited day and last outcome; repeated same-day answers do not advance mastery or postpone due time. Wrong resets the success streak. Legacy round data remains untouched and is not promoted to mastery.
## Data flow
Question canonical ID + answer outcome → pure transition → local memory. Eligible topic pool + memory + current time → due/new selection. Progress counts unique IDs globally and available words per topic.
## Edge cases
Corrupt/blocked storage, reload after answering, same-day restarts, correct immediately after wrong, due mastered words, overlapping topics, rank reordering, partial dataset, clock inputs, free practice.
## Testing
Boundary times; wrong5h; three different-day successes; same-day duplicate/reload; mastery reset; selection ordering/media filtering; corrupt storage; migration regression; real browser progress/reload/topic flow.
## Acceptance criteria
States distinguish unseen/learning/correct/due/mastered; topic completion requires mastery; display50 available versus300 target honestly; all games update canonical memory once; old progress preserved; tests/build/browser pass.
## Risks
Local progress stays on this device. This is a product heuristic, not a replacement for a scientifically calibrated memory model. Course targets do not imply all3000 words are shipped.
## Progress
- Planned; stable content/games dependencies pending.
## Decisions
Owner accepted three separate-day successes and exact schedule. Supabase/auth/sync postponed.
