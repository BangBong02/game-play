# Image Match hybrid scene

## Objective
Turn the existing matching activity into a small, polished game and evaluate PixiJS v8 without changing website or learning architecture.

## Current / desired state
Current: select word, select picture, static locks, manual Next. Desired: large draggable pictures, word destinations, tap/keyboard equivalent, entrance/snap/wrong feedback, compact score, board transitions, pronunciation/SFX/mute. Keep the old DOM board available.

## Flow and design
Topic/practice selection remains DOM. First board appears with a short entrance. Drag an image into a word destination or select a word then its image. Correct pair moves into place and plays pronunciation. Wrong attempt is saved by the existing engine, displays its actual correct match and stays visible for correction. All-correct boards advance after brief feedback; boards containing mistakes wait for Continue. Result/restart and storage remain the shared engine flow.

## Data and technical boundaries
No storage/schema changes. Pronunciation uses a canonical-ID audio map from the existing normalized pool, including restored older rounds. React owns semantic UI and callbacks; Pixi owns ephemeral sprite position/animation. Native pointer capture on semantic overlays enables drag and keyboard equivalence. Lazy-load one renderer; direct Application/ref lifecycle, bounded DPR, ResizeObserver, reduced motion, context/media fallback. Do not add a scene manager/framework or move website navigation into canvas.

## Edge cases / testing
Partial/restored boards; wrong matching order; duplicate pointerup; outside/canceled drag; scrolling/touch; narrow width; resize during drag; hidden tab; assets missing; blocked WebGL; audio promise rejection; mute while sound plays; late asset/application initialization after unmount; restart with same board; auto-next canceled by navigation.

## Acceptance and risks
Existing six-game regression matrix stays green. New scene tests cover actual pointer drags plus touch, keyboard and persistence. Chrome desktop/mobile visually validates game feel. Canvas cost/complexity and physical-mobile limitations are documented; no migration beyond Image Match before the gate. Text fallback works when renderer/media fail. Owned art only; no timed pressure or content scale.

## Progress / decisions
2026-10-04: all five owner decisions implemented. One Pixi8.22 scene, DOM overlays/pointer capture, snap/entrance/wrong animation, success auto-next1.6s, correction-aware manual Continue, pronunciation/SFX/round-level mute and Simple view. No engine/storage/schema/data-source change. Missing assets/WebGL/chunk and context loss keep a playable DOM board; late initialization/unmount releases renderer/listeners/ticker.

QA found and fixed unreliable touch compatibility clicks after drag, mute reset across boards, initial Simple-view focus timing and a delayed requestAnimationFrame stealing the next keyboard answer's focus. Matching focus now follows committed DOM in useLayoutEffect with preventScroll. Tests assert saved answers when automatic board transition may remove the prior board.

Validation:52/52 unit,7/7 built HTML,154 static pages,43 Astro files/0 errors/warnings/hints; full123/123 Playwright cases exit0,0 flaky/skipped. Includes EN/VI, desktop/tablet/mobile, actual trusted touch drag/tap, Tab/Enter-only rounds in both renderers, wrong/correct/canceled drag, multiple corrections/reload/restart/results, media/mute/retry, SRS/progress, reduced motion360/430/768/1280, delayed assets/unmount and context/chunk fallback. Screenshots reviewed. Three headless cases recorded the narrowly identified ANGLE readback diagnostic; no unexpected app warnings/errors.

Chrome Bang: actually dragged Bus, completed Travel2/2 with Enter and automatic result; reload/restart/Simple view/VI checked. Mobile Colors: dragged Red into Green intentionally, matched Yellow, reloaded2/4/100 with correction retained, finished Red/Blue via Enter to4/4/300 and manual result3/4. Visible Chrome warn/error logs empty. Progress inspected separately; physical mobile hardware was not available. Comparative bundle/load evidence and expansion limit are in PRODUCT_AUDIT.md.

Implementation/local quality gate DONE; feature commit `870115d` pushed to `origin/codex/oxford-learning-mvp`. Expansion to another canvas game remains gated by physical-device evidence and a concrete need; discovery preview polish is the next small product step.

Final review also preserves Simple view across locale changes and ignores unrelated pointerup during captured drag. Primary drag is real; secondary pointerup is injected in the regression. Native single-finger touch remains separately covered; no claim of physical multi-touch QA. Targeted6/6 and subsequent full123/123 exit0 confirmed after fixture corrections.
