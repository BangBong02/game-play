# Implementation plans

Use `docs/plans/` for substantial features that change game rules, media flow or learning storage. Keep small fixes in the progress journal.

Each plan contains: Objective, Current state, Desired state, User flow, Technical design, Data flow, Edge cases, Testing, Acceptance criteria, Risks, Progress and Decisions.

Current game-feel direction: see `docs/PRODUCT_AUDIT.md` and `docs/plans/image-match-scene.md`. Owner confirmed one Image Match PixiJS v8 spike; keep the functional engine/storage and Astro website, compare with DOM before expansion. Content scale and backend stay BACKLOG.

Browser integration failure must not block the roadmap when equivalent QA can be performed with Playwright, the Codex built-in browser, or another safe local validation method.

Local QA order: unit/integration tests → build/typecheck/lint when available → Playwright → Chrome Integration as the primary visual QA → responsive desktop/tablet/mobile. Use the connected Bang profile so the owner can observe actual interactions. Try a reasonable reconnect on failure, then switch to Playwright, the Codex built-in browser or equivalent safe validation and continue. Mark BLOCKED only when no reasonable validation method remains. Record actual interaction, viewport, keyboard/touch, persistence and console checks.

1. Read `AGENTS.md`, `docs/PRODUCT_DECISIONS.md`, `ROADMAP.md`, `docs/PROJECT_STATE.md`, `doc/PHASES.md` and recent `doc/PROGRESS.md` entries before implementation.
2. Inspect relevant code and preserve user edits. Select the smallest correct change within the Astro/React/data boundaries.
3. Write testable acceptance criteria before changing important rules. Implement one feature at a time.
4. Record actual validation, unresolved issues and the exact next action. Tests/build/browser results must be observed, not inferred.
5. Update the roadmap and state after each feature; commit only validated code. Push the dev branch at milestone boundaries. Future BACKLOG work needs a concrete trigger and is not implemented speculatively.
