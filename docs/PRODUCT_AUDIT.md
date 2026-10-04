# Game feel audit — 2026-10-04

Baseline: `6fc322f`, six DOM games, 50 core words + two supplemental words. This audit reopens product quality after the functional MVP; it does not reopen content scale or backend work.

## Direct observations

Chrome Integration, profile Bang. Initial audit/research and one question batch occupied approximately the first 15 minutes; the owner confirmed all five recommendations. Local actual rounds: Picture Pick/Listen & Pick/Image Match with Travel (two words), Word Match/Find the Word/Spell the Word with Numbers (two words). All six reached results. Used mouse and Enter; typing included uppercase and Backspace. Image Match intentionally mixed a wrong and correct pair. These are short product audits, not a replacement for the full regression suite.

- [Fast Vocab](https://www.gamestolearnenglish.com/fast-vocab/): dragged Whistle, Straw and Basket into word circles. Each completed image stayed in its destination; score increased 250 per match, progress reached 3/40, and the board cleared automatically. Remaining pictures repositioned after a match. No persistent Correct/Incorrect counters or Next button in that board. Its description explains alternating matching/recognition stages; only the first board was directly played in this audit.
- [Monster Vocab](https://www.gamestolearnenglish.com/monster-vocab/): entered Computer preview and gameplay. Three large pictures and one word dominate the scene; selected Line and observed the highlighted image. Preview lets learners inspect image/word associations before Play. This audit has not yet verified every later stage or a full result round.
- [Fast English](https://www.gamestolearnenglish.com/fast-english/): Fast/Animals timed out during inspection and showed score-zero ranking; no ranking information was submitted. Then actually played Slow/Animals: Sheep and Butterfly advanced automatically to2/80 and3/80, score200 then400. Deliberately chose Cat for Crocodile: score dropped to350 and the wrong image disappeared while the question stayed. Choosing Crocodile cleared other pictures, gave a gold outline/check and score550. Large pictures, one prompt, small progress and score dominate; no Next or persistent Correct/Incorrect panel. This sample establishes success/error pacing; it is not a complete80-question playthrough.
- [Vocab Game](https://www.gamestolearnenglish.com/vocab-game/): entered Animals preview, skipped to reveal gameplay, uncovered image fragments with the lightning control, and deliberately chose Dragon for a bat-like partial image. The scene flashed a red frame and score remained zero; it avoided a text-heavy correction panel. At mobile width the preview changed to a vertical alternating image/word composition, rather than shrinking the desktop row unchanged. Later successful-answer flow remains to inspect.
- The reference footer links PixiJS. That is evidence of the site's renderer choice, not evidence of its Pixi version or that our whole website needs a canvas.

## Gap analysis

Grades assess Lingoplay against the intended clean, playful product, not pixel similarity.

| Area | Grade | Evidence / implication |
|---|---|---|
| Home | GOOD | Games appear immediately; no course dashboard blocks play. Keep Astro HTML. |
| Game cards | NEEDS IMPROVEMENT | Preview icons describe modes but do not show the actual game scene. Add scene previews after the flagship exists. |
| Game selection / filters | GOOD | Native skill filters make six games easy to scan. Preserve. |
| Topic selection | ACCEPTABLE | Fast native select and clear practice types; reference uses richer picture previews. Secondary priority. |
| Game area | MAJOR GAP | Current panel reads as a form; the reference presents a bounded scene with a gameplay composition. |
| Visual density | NEEDS IMPROVEMENT | Repeated headings, large flat question boxes and disabled Next consume attention. Use one instruction and compact HUD. |
| Image presentation | NEEDS IMPROVEMENT | Useful, owned assets exist but matching images dim before selection and stay fixed. Make images primary objects. |
| Animation | MAJOR GAP | Mostly hover movement; no entrance, snap, correction or board transition. |
| Click / touch feedback | NEEDS IMPROVEMENT | Correct semantics and borders, but limited tactile feedback or spatial response. |
| Drag/drop | MAJOR GAP | Select-word/select-image works; spatial matching interaction absent. Add an equivalent, accessible drag path. |
| Sound feedback | MAJOR GAP | Listening audio works on request; matching actions have no pronunciation or short sound cue. |
| Stage transition | MAJOR GAP | All boards wait for Next; reference clears and rearranges its scene. |
| Pacing | MAJOR GAP | Every successful answer requires another action. Auto-advance successful boards; preserve mistakes for review. |
| Score / progress | ACCEPTABLE | Honest completed count and shared learning memory. Need compact game score separated from mastery. |
| Result | ACCEPTABLE | Clear totals/replay/progress; visual celebration is one static star. Polish with the flagship. |
| Replay | GOOD | Persisted results and explicit restart work; retain protections against mastery farming. |
| Mobile | ACCEPTABLE | Functional native controls; scene composition and drag targets need a new dedicated QA pass. |
| Overall polish | NEEDS IMPROVEMENT | Reliable learning app; movement and rhythm do not yet make it feel like a game. |

## Renderer recommendation

Try **Image Match only**. Pixi fits moving images, snapped destinations and short feedback effects. Keep all routing, SEO/content, discovery, filters, topic selection, learning progress and textual controls in Astro/React/DOM. Text meaning/recall/spelling games should stay DOM. Listening and Picture Pick remain DOM until the spike proves a measurable visual/interaction benefit.

Use Pixi directly inside one React island with a lazy import; no additional React renderer wrapper, animation framework, sound package or generalized scene architecture. Native semantic button overlays can preserve keyboard/tap interaction while Pixi renders the same objects. Native pointer capture drives dragging; both input paths dispatch existing engine match actions. This deliberately tests a hybrid rather than making canvas responsible for every control.

### Technical constraints and official sources

- [Application v8](https://pixijs.com/8.x/guides/components/application): asynchronous `init`. Guard late resolution after unmount; destroy only initialized applications. Remove observers, listeners and ticker callbacks. No React state updates each frame.
- [Assets](https://pixijs.com/8.x/guides/components/assets): load only board URLs, including existing SVG/WebP. Do not destroy shared cached textures with scene children. Media or renderer failure switches to the existing DOM board with a readable explanation.
- [Events](https://pixijs.com/8.x/guides/components/events): pointer/touch and cancellation need explicit handling. A canceled/outside drop must return the picture without recording an answer. Dragging and tapping must have the same meaning.
- [Accessibility](https://pixijs.com/8.x/guides/components/accessibility): canvas alone lacks native semantics; Pixi offers opt-in DOM overlays. For this small hybrid use real HTML buttons, labels, visible keyboard focus and live feedback. Include Simple view and reduced-motion behavior.
- [Performance](https://pixijs.com/8.x/guides/concepts/performance-tips): few sprites, no heavy filters, capped DPR, no idle perpetual animation. Container resize must recompute composition, not merely resize pixels. Stop animation when hidden; clean up on navigation and restart.
- Native Audio/AudioContext after an explicit play gesture, visible mute and retry/error message. No background music. Existing offline US pronunciation files stay the source.
- Registry query `npm view pixi.js@8 version --json` verified **8.22.0** as the newest v8 listed on 2026-10-04; pin the spike to that version.

## Quality gate

Compare DOM and scene with the same board and existing engine/state. Require drag success/wrong/cancel, tap and keyboard equivalence, focus, multiple corrections, reload/restart/results, audio/mute/media failure, renderer failure, reduced motion, resizing and navigation cleanup. Run unit/HTML/build and the full three-viewport Playwright suite, then visible Chrome sessions. Record canvas bundle cost and emulated performance honestly; desktop emulation cannot certify physical low-end mobile GPU performance. Expansion to another Pixi game waits for this evidence and a useful quality improvement.

## Owner decisions

All five batch answers confirmed: Image Match flagship; gentle pacing/no timer or lives; playful minimal identity with owned current media; pronunciation + light SFX + mute/no music; one spike with quality gate and DOM fallback. Score/streak never change SRS/mastery rules. See `PRODUCT_DECISIONS.md` and `ROADMAP.md` for current delivery scope.

## DOM / scene comparison

| Dimension | DOM Simple view | Image Match scene |
|---|---|---|
| Game feel | Static select-word/select-image, manual Next | Drag/snap, short entrance/shake, spatial destinations and automatic successful boards |
| Corrective learning | Saved wrong attempts and text correction | Same saved attempts; own correct picture moves to its destination, correction remains until Continue |
| Input / semantics | Native buttons / keyboard | Same native semantics plus pointer capture/tap; canvas is aria-hidden |
| Audio | No matching action audio | Local US pronunciation, light native SFX and round-level mute; no music |
| Cost / complexity | Existing small component | Two dedicated files, one pinned dependency; no wrapper/scene framework, separate initialization/cleanup/failure paths |
| Fallback | Text descriptions if media missing | DOM on unavailable WebGL, lost context, failed assets or lazy chunk; explicit Simple view retained |

Local preview measurement with isolated mobile390 contexts, system fonts, no artificial network/CPU throttling: Simple view loaded262,343 bytes JS (84,541 gzip); scene846,320 bytes (258,387 gzip). The scene increment is173,846 gzip bytes, about170 KiB. Picture Pick loaded exactly the Simple-view chunk set with no Pixi/scene requests. Only WebGL-related runtime chunks loaded for the scene; emitted WebGPU/Canvas chunks were not requested. Gzip values were calculated from response bodies, not claimed as preview-server transfer encoding.

One cold local run from Play to usable board took52ms DOM,904ms scene and62ms Picture Pick. These are diagnostic samples on this Windows host while other QA was running, not reproducible device benchmarks or a low-end mobile guarantee. DPR is capped at2; four sprites maximum; rendering stops at idle/hidden; no filters/continuous background. Physical mobile GPU/memory/power checks remain a follow-up before extending Pixi to another game.

Decision: retain this isolated Image Match spike and DOM fallback because the spatial feedback/pacing improves the audited gaps. The bundle increment is substantial for four pictures; it does **not** justify migrating the other five games. Discovery preview polish can reuse the new composition without adding another canvas runtime. Next renderer expansion needs a concrete interaction benefit plus physical-device/performance evidence; CSS/DOM remains the default for text games.

Console gate: all application warnings/errors fail scene tests. Headless Chromium's specifically identified ANGLE `GPU stall due to ReadPixels` diagnostic is recorded in test attachments separately (not hidden with a blanket warning filter); [ANGLE source](https://chromium.googlesource.com/angle/angle/%2B/refs/heads/chromium/7879/src/libANGLE/renderer/vulkan/vk_helpers.cpp) associates this message with CPU readback. Product code does not call readPixels. Expected404s are allowed only in deliberate failure fixtures. Visible Chrome production-scene session logged no warnings/errors.

Dependency audit: `npm audit --json` reports one existing high advisory in Astro's `http-cache-semantics@4.2.0`, also present in baseline HEAD; none reported for PixiJS. No unrelated force-upgrade or architecture change was made during this spike.

Final local gate evidence:52 unit +7 HTML +123 browser cases pass, no retries/flaky/skipped; build154 static pages/43 Astro files/0 diagnostics. Full browser matrix includes both matching renderers and all six games, desktop/tablet/mobile, EN/VI, persistence/SRS and deliberate failure paths. Reviewed desktop/mobile and correction screenshots. Three scene cases attached the driver readback diagnostic; app console guard remained green. Chrome Bang played scene Travel2/2 and mobile Colors3/4 (one intentional wrong), checking snap, correction, score, reload, result/restart, Simple view and locale. Native Chrome logs were empty in those production-preview sessions. Local QA gate supports this single spike; physical mobile performance/assistive-technology audits and full reference later-stage coverage are not claimed.
