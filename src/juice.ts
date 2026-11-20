// In-level celebration effects: combo callouts, confetti, shockwave rings, score count-up,
// board glow and Micah's hearts. Everything is transform/opacity only, capped in count and
// removed on a timer, so phones stay smooth. With reduced motion on, the moving extras are
// skipped and the text callouts simply appear.

/** True when the player asked their device for less motion. */
export const calm = (): boolean => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export type Hype = { tier: number; text: string };

const CHAIN_WORDS = ['', '', 'Sweet!', 'Tasty!', 'Pawsome!', 'Bark-tastic!', 'Micah Madness!'];

/**
 * How loudly to celebrate one wave of a cascade.
 * tier 0 = an ordinary match (no callout), up to tier 5 for the wildest moments.
 */
export function hype(chain: number, cleared: number, firedMicah: boolean, firedAny: boolean): Hype {
  let tier = chain >= 6 ? 5 : chain >= 5 ? 4 : chain >= 4 ? 3 : chain >= 3 ? 2 : chain >= 2 ? 1 : 0;
  let text = CHAIN_WORDS[Math.min(chain, 6)];
  if (firedMicah && tier < 4) {
    tier = 4;
    text = 'Micah Madness!';
  } else if (cleared >= 16 && tier < 3) {
    tier = 3;
    text = 'Fetch-tastic!';
  } else if ((cleared >= 10 || firedAny) && tier < 1) {
    tier = 1;
    text = cleared >= 10 ? 'Big fetch!' : 'Zoom zoom!';
  }
  return { tier, text };
}

const CONFETTI = ['#e8352f', '#ffc12e', '#ffffff', '#2f8fe0', '#cde33b', '#8e5bd6', '#ff7a1a'];

/** Big wobbly words over the board: "Tasty!", "Pawsome!" and so on. */
export function callout(host: HTMLElement, text: string, tier: number, sub = ''): void {
  host.querySelectorAll('.callout').forEach((e) => e.remove());
  const el = document.createElement('div');
  el.className = `callout t${Math.max(1, Math.min(5, tier))}`;
  el.setAttribute('aria-hidden', 'true');
  el.style.setProperty('--tilt', `${(Math.random() * 8 - 4).toFixed(1)}deg`);
  el.innerHTML = `<b></b>${sub ? '<small></small>' : ''}`;
  el.querySelector('b')!.textContent = text;
  if (sub) el.querySelector('small')!.textContent = sub;
  host.append(el);
  setTimeout(() => el.remove(), 1100);
}

/** Paper confetti bursting out of a point inside `host` (x, y in % of the host). */
export function confetti(host: HTMLElement, x: number, y: number, count: number, spread = 1): void {
  if (calm()) return;
  const frag = document.createDocumentFragment();
  const w = host.clientWidth || 320;
  for (let i = 0; i < Math.min(count, 60); i++) {
    const p = document.createElement('i');
    p.className = `confetti ${i % 3 === 0 ? 'round' : ''}`;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const v = (0.18 + Math.random() * 0.32) * w * spread;
    p.style.cssText =
      `left:${x}%;top:${y}%;background:${CONFETTI[i % CONFETTI.length]};` +
      `--dx:${(Math.cos(a) * v).toFixed(0)}px;--dy:${(Math.sin(a) * v).toFixed(0)}px;` +
      `--fall:${(w * (0.25 + Math.random() * 0.3)).toFixed(0)}px;--spin:${(Math.random() * 900 - 450).toFixed(0)}deg;` +
      `animation-duration:${(0.9 + Math.random() * 0.5).toFixed(2)}s`;
    frag.append(p);
  }
  host.append(frag);
  setTimeout(() => host.querySelectorAll(':scope > .confetti').forEach((e) => e.remove()), 1500);
}

/** Confetti raining across the whole screen, for a level win. */
export function confettiRain(count = 50): void {
  if (calm()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-rain';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = `confetti ${i % 3 === 0 ? 'round' : ''}`;
    p.style.cssText =
      `left:${(Math.random() * 100).toFixed(1)}%;background:${CONFETTI[i % CONFETTI.length]};` +
      `--spin:${(Math.random() * 1080 - 540).toFixed(0)}deg;--sway:${(Math.random() * 60 - 30).toFixed(0)}px;` +
      `animation-delay:${(Math.random() * 0.8).toFixed(2)}s;animation-duration:${(1.8 + Math.random() * 1.2).toFixed(2)}s`;
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 4000);
}

/** A ring that rushes outward from a point on the board (x, y in % of the host). */
export function ring(host: HTMLElement, x: number, y: number, color = '#ffc12e', size = 1): void {
  if (calm()) return;
  const el = document.createElement('i');
  el.className = 'shock';
  el.style.cssText = `left:${x}%;top:${y}%;--ring:${color};--size:${size}`;
  host.append(el);
  setTimeout(() => el.remove(), 600);
}

/** Shake the board, harder for bigger moments (1 to 5). */
export function shakeBoard(board: HTMLElement, strength: number): void {
  if (calm()) return;
  board.style.setProperty('--amp', `${2 + Math.min(strength, 5) * 1.6}px`);
  board.classList.remove('shake');
  void board.offsetWidth;
  board.classList.add('shake');
}

/** The board frame flashes gold (or brighter for higher tiers). */
export function glow(board: HTMLElement, tier: number): void {
  const cls = tier >= 4 ? 'glow-hot' : 'glow';
  board.classList.remove('glow', 'glow-hot');
  void board.offsetWidth;
  board.classList.add(cls);
}

/** Little hearts float up out of Micah's face. */
export function hearts(face: HTMLElement, n: number): void {
  if (calm()) return;
  for (let i = 0; i < Math.min(n, 5); i++) {
    const h = document.createElement('i');
    h.className = 'heart';
    h.setAttribute('aria-hidden', 'true');
    h.style.cssText = `--hx:${(Math.random() * 40 - 20).toFixed(0)}px;animation-delay:${i * 90}ms`;
    face.append(h);
    setTimeout(() => h.remove(), 1200 + i * 90);
  }
}

const counting = new WeakMap<HTMLElement, { from: number; to: number; start: number; raf: number }>();
/** Rolls a number up to its new value instead of snapping, and gives it a little bump. */
export function countUp(el: HTMLElement, to: number, ms = 450): void {
  const now = performance.now();
  const prev = counting.get(el);
  const shown = Number(el.dataset.v ?? to);
  if (prev) cancelAnimationFrame(prev.raf);
  if (shown === to || calm()) {
    el.dataset.v = String(to);
    el.textContent = to.toLocaleString();
    counting.delete(el);
    return;
  }
  const state = { from: shown, to, start: now, raf: 0 };
  const step = (t: number) => {
    const k = Math.min(1, (t - state.start) / ms);
    const v = Math.round(state.from + (state.to - state.from) * (1 - Math.pow(1 - k, 3)));
    el.dataset.v = String(v);
    el.textContent = v.toLocaleString();
    if (k < 1) state.raf = requestAnimationFrame(step);
    else counting.delete(el);
  };
  state.raf = requestAnimationFrame(step);
  counting.set(el, state);
  if (to > shown) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}
