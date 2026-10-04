import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import type { MatchingQuestion } from '../../game/vocabulary';

export interface SceneBox { x: number; y: number; width: number; height: number }
export interface MatchLayout { width: number; height: number; pictures: SceneBox[]; words: SceneBox[] }

function layoutFor(width: number, count: number): MatchLayout {
  const columns = width >= 600 ? count : 2;
  const tileWidth = Math.min(164, (width - 32 - (columns - 1) * 12) / columns);
  const rows = Math.ceil(count / columns);
  const pictureHeight = Math.min(width < 600 ? 96 : 144, tileWidth);
  const slotHeight = width < 600 ? 98 : 124;
  const left = (width - columns * tileWidth - (columns - 1) * 12) / 2;
  const pictures = Array.from({ length: count }, (_, i) => ({ x: left + i % columns * (tileWidth + 12), y: 20 + Math.floor(i / columns) * (pictureHeight + 12), width: tileWidth, height: pictureHeight }));
  const words = Array.from({ length: count }, (_, i) => ({ x: left + i % columns * (tileWidth + 12), y: 20 + rows * (pictureHeight + 12) + 28 + Math.floor(i / columns) * (slotHeight + 12), width: tileWidth, height: slotHeight }));
  return { width, height: words.at(-1)!.y + slotHeight + 20, pictures, words };
}

// One board renderer. Learning state lives in React's existing engine, never in this scene.
export async function createImageMatchScene(host: HTMLDivElement, board: MatchingQuestion[], images: MatchingQuestion[], onLayout: (layout: MatchLayout) => void, onFailure: () => void, canceled: () => boolean) {
  const app = new Application();
  try { await app.init({ width: Math.max(host.clientWidth, 280), height: 400, backgroundAlpha: 0, preference: ['webgl'], resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false, antialias: true }); }
  catch (error) { if (app.renderer) app.destroy(true, { children: true }); else app.stage.destroy({ children: true }); throw error; }
  if (canceled()) { app.destroy(true, { children: true }); return null; }
  let textures;
  try { textures = await Promise.all(images.map(q => Assets.load(q.image.url))); }
  catch (error) { app.destroy(true, { children: true }); throw error; }
  if (canceled()) { app.destroy(true, { children: true }); return null; }
  host.append(app.canvas);
  app.canvas.setAttribute('aria-hidden', 'true');
  const background = new Graphics();
  const slots = board.map(() => new Graphics());
  const tiles = images.map((_, i) => {
    const tile = new Container();
    const card = new Graphics();
    const sprite = new Sprite(textures[i]);
    sprite.anchor.set(.5);
    tile.addChild(card, sprite);
    return { tile, card, sprite };
  });
  app.stage.addChild(background, ...slots, ...tiles.map(t => t.tile));
  let layout = layoutFor(Math.max(host.clientWidth, 280), board.length);
  let answers: string[] = [];
  let selected: string | null = null;
  let dragging: string | null = null;
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map<Container, { fromX: number; fromY: number; toX: number; toY: number; fromScale: number; toScale: number; fromAlpha: number; start: number; duration: number; shake: boolean }>();
  let destroyed = false;
  let lastWidth = 0;
  function paint() {
    background.clear().roundRect(0, 0, layout.width, layout.height, 20).fill(0xf4faf6);
    background.circle(layout.width - 22, 18, 60).fill({ color: 0xdceee3, alpha: .55 });
    slots.forEach((slot, i) => {
      const box = layout.words[i];
      const answer = answers[i];
      const correct = answer === board[i].correctAnswer;
      slot.clear().roundRect(box.x, box.y, box.width, box.height, 18).fill(answer ? correct ? 0xe2f4e9 : 0xffeee9 : 0xe9f2ec).stroke({ width: selected === board[i].id ? 3 : 2, color: answer ? correct ? 0x399265 : 0xc36550 : selected === board[i].id ? 0x167461 : 0xbad4c5 });
    });
    tiles.forEach(({ card, sprite }, i) => {
      const box = layout.pictures[i];
      card.clear().roundRect(-box.width / 2, -box.height / 2, box.width, box.height, 18).fill(0xffffff).stroke({ color: 0xc4d8cb, width: 2 });
      const fit = Math.min(box.width * .78 / sprite.texture.width, box.height * .78 / sprite.texture.height);
      sprite.scale.set(fit);
    });
  }
  function destination(i: number) {
    const image = images[i];
    const wordIndex = board.findIndex(q => q.id === image.id);
    const complete = !!answers[wordIndex];
    const box = complete ? layout.words[wordIndex] : layout.pictures[i];
    return { x: box.x + box.width / 2, y: box.y + (complete ? box.height * .38 : box.height / 2), scale: complete ? .66 : 1 };
  }
  function render() { if (!destroyed) app.render(); }
  function animate(tile: Container, x: number, y: number, scale = 1, shake = false) {
    if (reduced || document.hidden) { tile.position.set(x, y); tile.scale.set(scale); tile.alpha = 1; animations.delete(tile); render(); return; }
    animations.set(tile, { fromX: tile.x, fromY: tile.y, toX: x, toY: y, fromScale: tile.scale.x, toScale: scale, fromAlpha: tile.alpha, start: performance.now(), duration: shake ? 540 : 420, shake });
    app.start();
  }
  const tick = () => {
    const now = performance.now();
    for (const [tile, a] of animations) {
      const p = Math.min(1, (now - a.start) / a.duration);
      const ease = 1 - (1 - p) ** 3;
      tile.position.set(a.fromX + (a.toX - a.fromX) * ease + (a.shake ? Math.sin(p * Math.PI * 8) * 8 * (1 - p) : 0), a.fromY + (a.toY - a.fromY) * ease);
      tile.scale.set(a.fromScale + (a.toScale - a.fromScale) * ease);
      tile.alpha = a.fromAlpha + (1 - a.fromAlpha) * ease;
      if (p === 1) animations.delete(tile);
    }
    if (!animations.size) { render(); app.stop(); }
  };
  app.ticker.add(tick);
  function resize(force = false) {
    const width = Math.max(host.clientWidth, 280);
    if (!force && Math.abs(width - lastWidth) < 1) return;
    lastWidth = width;
    dragging = null;
    animations.clear();
    layout = layoutFor(width, board.length);
    app.renderer.resize(layout.width, layout.height);
    paint();
    tiles.forEach(({ tile }, i) => { const d = destination(i); tile.position.set(d.x, d.y); tile.scale.set(d.scale); tile.alpha = 1; });
    onLayout(layout);
    render();
  }
  resize();
  tiles.forEach(({ tile }, i) => { const d = destination(i); tile.y += 18; tile.alpha = .1; animate(tile, d.x, d.y, d.scale); });
  const observer = new ResizeObserver(() => resize());
  observer.observe(host);
  function visibility() {
    if (document.hidden) { animations.clear(); app.stop(); }
    else resize(true);
  }
  function motion(event: MediaQueryListEvent) { reduced = event.matches; if (reduced) resize(true); }
  function contextLost(event: Event) { event.preventDefault(); onFailure(); }
  document.addEventListener('visibilitychange', visibility);
  motionQuery.addEventListener('change', motion);
  app.canvas.addEventListener('webglcontextlost', contextLost);
  return {
    update(next: string[], selection: string | null) {
      const previous = answers;
      answers = next;
      selected = selection;
      paint();
      tiles.forEach(({ tile }, i) => {
        const position = board.findIndex(q => q.id === images[i].id);
        if (next[position] && !previous[position]) { const d = destination(i); animate(tile, d.x, d.y, d.scale, next[position] !== board[position].correctAnswer); }
      });
      render();
    },
    drag(id: string, x: number, y: number) {
      dragging = id;
      const index = images.findIndex(q => q.id === id);
      const tile = tiles[index].tile;
      animations.delete(tile);
      tile.scale.set(1.06);
      tile.alpha = 1;
      tile.position.set(x, y);
      app.stage.setChildIndex(tile, app.stage.children.length - 1);
      render();
    },
    release() {
      if (!dragging) return;
      const i = images.findIndex(q => q.id === dragging);
      dragging = null;
      const d = destination(i);
      animate(tiles[i].tile, d.x, d.y, d.scale);
    },
    destroy() {
      destroyed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      motionQuery.removeEventListener('change', motion);
      app.canvas.removeEventListener('webglcontextlost', contextLost);
      app.ticker.remove(tick);
      animations.clear();
      app.destroy(true, { children: true }); // Assets owns cached textures; do not destroy shared textures.
    },
  };
}
