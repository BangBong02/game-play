# Implementation plans

Use `docs/plans/` for substantial features that change game rules, media flow or learning storage. Keep small fixes in the progress journal.

Each plan contains: Objective, Current state, Desired state, User flow, Technical design, Data flow, Edge cases, Testing, Acceptance criteria, Risks, Progress and Decisions.

1. Read `AGENTS.md`, `docs/PRODUCT_DECISIONS.md`, `ROADMAP.md`, `docs/PROJECT_STATE.md`, `doc/PHASES.md` and recent `doc/PROGRESS.md` entries before implementation.
2. Inspect relevant code and preserve user edits. Select the smallest correct change within the Astro/React/data boundaries.
3. Write testable acceptance criteria before changing important rules. Implement one feature at a time.
4. Record actual validation, unresolved issues and the exact next action. Tests/build/browser results must be observed, not inferred.
5. Update the roadmap and state after each feature; commit only validated code. Push the dev branch at milestone boundaries. Future BACKLOG work needs a concrete trigger and is not implemented speculatively.
