# Project state

Updated: 2026-10-03

- Branch: `codex/oxford-learning-mvp` (main auto-deploys; leave main untouched).
- Milestone: M2 — Listen → Image.
- Current feature: M2.1 — explicit audio and image choices.
- Recent commit: `2e58436` — shared media eligibility/repository preparation. Starting baseline `5457f7b`.
- Confirmed decisions: cumulative curated Oxford subsets; mastery on three different days; 1d/7d/60d, wrong5h; Picture Pick → Listen/Image → Image Match. Engineer-selected local US demo voice; no paid services.
- Validation: baseline unit37/37, built HTML5/5 and production SITE_URL build passed. Chrome local homepage and restored Picture Pick round observed. M1 unit39/39, HTML5/5, build122 pages/0 diagnostics; Chrome Picture Pick desktop/tablet/mobile390CSS, wrong/right keyboard, result4/5, reload/restart, WebP loaded, old round restored, console clean.
- Known limitations: 50 Oxford words +2 supplemental,30 pictures,52 real demo MP3s; no mastery scheduler, listening/matching not implemented yet. Existing saved rounds must survive content priority changes.
- Blockers: none. Full3000 production content, Supabase and sync are BACKLOG.
- Exact next action: commit/push validated M1, then implement Listen/Image normalized audio/image options, playback/replay/failure handling and skill filters.

Maintain this file as a concise restart point. Detailed evidence belongs in `doc/PROGRESS.md`.
