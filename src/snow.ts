// Falling snow over the map. A canvas fixed over the map's view; each flake drifts down with
// its own size, speed and sway, and moves with the map when you scroll (near flakes a little
// more than far ones), so the snow feels like part of the world instead of a sticker on the glass.

interface Flake { x: number; y: number; r: number; speed: number; depth: number; phase: number; sway: number; alpha: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Starts snowing on `canvas`, following `scroller`'s scroll. Returns a stop function. */
export function startSnow(canvas: HTMLCanvasElement, scroller: HTMLElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, flakes: Flake[] = [];
  let lastScroll = scroller.scrollTop;
  let raf = 0, last = 0, stopped = false;

  const make = (anyY: boolean): Flake => {
    // Depth 0 is far (small, slow, faint), 1 is near (big, quicker, bright).
    const depth = Math.random() ** 1.6;
    return {
      x: rand(0, w), y: anyY ? rand(0, h) : rand(-30, -6),
      r: 1 + depth * 2.6 + rand(0, .5), speed: 18 + depth * 46 + rand(0, 10), depth,
      phase: rand(0, Math.PI * 2), sway: rand(.4, 1.1), alpha: .45 + depth * .5,
    };
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const nw = Math.round(box.width), nh = Math.round(box.height);
    if (!nw || !nh || (nw === w && nh === h)) return;
    w = nw; h = nh;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(120, Math.round((w * h) / 2600));
    flakes = Array.from({ length: count }, () => make(true));
    if (still) draw();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    // A faint blue rim keeps white flakes visible over the snowy areas too.
    ctx.fillStyle = '#4d7a99';
    for (const f of flakes) {
      ctx.globalAlpha = f.alpha * .3;
      ctx.beginPath();
      ctx.arc(f.x, f.y + .4, f.r + .9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    for (const f of flakes) {
      ctx.globalAlpha = f.alpha;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  // Scrolling moves the flakes with the map: near ones the whole way, far ones a bit less.
  const onScroll = () => {
    const dy = scroller.scrollTop - lastScroll;
    lastScroll = scroller.scrollTop;
    if (!dy) return;
    for (const f of flakes) {
      f.y -= dy * (.75 + f.depth * .25);
      if (f.y > h + 10) f.y -= h + 20;
      else if (f.y < -10) f.y += h + 20;
    }
    if (still) draw();
  };

  const tick = (t: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(tick);
    if (!canvas.isConnected) return stop();
    if (document.hidden) { last = 0; return; }
    const dt = last ? Math.min((t - last) / 1000, .05) : 0;
    last = t;
    const wind = Math.sin(t / 4200) * 8;
    for (const f of flakes) {
      f.phase += dt * f.sway * 1.6;
      f.y += f.speed * dt;
      f.x += (Math.sin(f.phase) * 14 * f.sway + wind) * dt * (.5 + f.depth);
      if (f.y > h + 8) Object.assign(f, make(false));
      if (f.x < -8) f.x += w + 16; else if (f.x > w + 8) f.x -= w + 16;
    }
    draw();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  scroller.addEventListener('scroll', onScroll, { passive: true });
  if (!still) raf = requestAnimationFrame(tick);

  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    scroller.removeEventListener('scroll', onScroll);
  }
  return stop;
}
