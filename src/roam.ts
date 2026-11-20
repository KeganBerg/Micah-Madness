// Micah's Yard comes alive: she wanders between the things you've built, and tapping
// anything sends her over to play with it. Coordinates are the yard's 360x300 SVG space,
// and Micah's position is where her feet touch the grass.
import { DECOR } from './yard';

export interface RoamSounds {
  bark(): void;
  step(): void;
  crunch(): void;
  whoosh(): void;
  splash(): void;
  select(): void;
}

type Pose = 'walk' | 'run' | 'sniff' | 'nap' | 'eat' | 'dig' | 'jump' | 'sit' | 'scratch' | '';

/** Where Micah stands to use each item, relative to the item's 100x100 art box. */
const SPOTS: Record<string, { x: number; y: number; on?: boolean }> = {
  doghouse: { x: 50, y: 96 },
  bed: { x: 50, y: 70, on: true },
  tree: { x: 30, y: 100 },
  bowl: { x: 78, y: 82 },
  lobster: { x: 10, y: 96 },
  hydrant: { x: 0, y: 92 },
  ballpit: { x: 50, y: 74, on: true },
  flowers: { x: 50, y: 92 },
  sprinkler: { x: 50, y: 112 },
};

const GRASS = { x0: 24, x1: 336, y0: 100, y1: 292 };

/** Things that drop out of the sky. Micah will eat any of them. Drawn centred on (0,0), about 24 units across. */
export interface Snack { id: string; name: string; svg: string; }
export const SNACKS: Snack[] = [
  { id: 'sock', name: 'a sock', svg: '<path d="M-5 -12 H5 V2 Q5 8 11 8 Q14 12 10 13 H-2 Q-7 12 -6 6 Z" fill="#ffffff" stroke="#173a52" stroke-width="1.6"/><path d="M-5 -12 H5 V-8 H-5 Z" fill="#e8352f"/><path d="M-5 -4 H5" stroke="#e8352f" stroke-width="1.6"/>' },
  { id: 'duck', name: 'a rubber duck', svg: '<ellipse cx="1" cy="4" rx="11" ry="7" fill="#ffd23f" stroke="#b58a00" stroke-width="1.4"/><circle cx="-4" cy="-5" r="6" fill="#ffd23f" stroke="#b58a00" stroke-width="1.4"/><path d="M-10 -5 L-15 -3 L-10 -2 Z" fill="#f08a24"/><circle cx="-5" cy="-7" r="1.2" fill="#111"/>' },
  { id: 'flipflop', name: 'a flip-flop', svg: '<ellipse cx="0" cy="0" rx="7" ry="13" fill="#2f8fe0" stroke="#17599a" stroke-width="1.6" transform="rotate(20)"/><path d="M-4 -2 L1 -8 L5 0" fill="none" stroke="#ffd23f" stroke-width="2.2" stroke-linecap="round"/>' },
  { id: 'remote', name: 'the TV remote', svg: '<rect x="-5" y="-13" width="10" height="26" rx="3" fill="#3b3f46" stroke="#15171b" stroke-width="1.4" transform="rotate(-25)"/><g transform="rotate(-25)"><circle cx="0" cy="-8" r="1.8" fill="#e8352f"/><circle cx="-2" cy="-2" r="1.1" fill="#ccc"/><circle cx="2" cy="-2" r="1.1" fill="#ccc"/><circle cx="-2" cy="2" r="1.1" fill="#ccc"/><circle cx="2" cy="2" r="1.1" fill="#ccc"/></g>' },
  { id: 'crayon', name: 'a purple crayon', svg: '<g transform="rotate(35)"><rect x="-3.5" y="-11" width="7" height="18" rx="1" fill="#8e5bd6" stroke="#5a3392" stroke-width="1.2"/><path d="M-3.5 7 L0 13 L3.5 7 Z" fill="#b38df0" stroke="#5a3392" stroke-width="1.2"/><rect x="-3.5" y="-6" width="7" height="4" fill="#fff" opacity=".6"/></g>' },
  { id: 'pinecone', name: 'a pinecone', svg: '<ellipse cx="0" cy="0" rx="8" ry="12" fill="#8b5a2b" stroke="#5a3a1a" stroke-width="1.4"/><path d="M-7 -5 Q0 -1 7 -5 M-8 1 Q0 5 8 1 M-6 7 Q0 10 6 7 M-4 -10 Q0 -7 4 -10" fill="none" stroke="#5a3a1a" stroke-width="1.3"/>' },
  { id: 'tissue', name: 'a used tissue', svg: '<path d="M-10 4 Q-12 -6 -4 -9 Q0 -14 5 -9 Q12 -8 10 0 Q13 7 4 9 Q-4 12 -10 4 Z" fill="#f4f7fa" stroke="#9fb4c4" stroke-width="1.4"/><path d="M-4 -2 Q0 2 4 -3" fill="none" stroke="#9fb4c4" stroke-width="1.2"/>' },
  { id: 'glove', name: 'a gardening glove', svg: '<path d="M-8 10 V-2 L-10 -8 Q-9 -11 -7 -9 L-5 -4 V-12 Q-3 -14 -2 -12 V-5 V-13 Q0 -15 1 -13 V-5 V-11 Q3 -13 4 -11 V-3 L7 -7 Q10 -7 9 -4 L4 6 V10 Z" fill="#5fae57" stroke="#2f6a3c" stroke-width="1.3"/>' },
  { id: 'corn', name: 'a corn cob', svg: '<g transform="rotate(-30)"><ellipse cx="0" cy="0" rx="5.5" ry="12" fill="#ffc12e" stroke="#b58a00" stroke-width="1.3"/><path d="M-5 -4 H5 M-5.5 1 H5.5 M-5 6 H5 M0 -11 V11" stroke="#d99a1a" stroke-width="1"/><path d="M-5 9 Q-9 14 -4 14 M5 9 Q9 14 4 14" fill="#7fb85a" stroke="#4f8a3a" stroke-width="1"/></g>' },
  { id: 'lego', name: 'a toy brick', svg: '<rect x="-10" y="-4" width="20" height="12" rx="1.5" fill="#e8352f" stroke="#a3201c" stroke-width="1.4"/><rect x="-7" y="-8" width="5" height="4" rx="1" fill="#e8352f" stroke="#a3201c" stroke-width="1.2"/><rect x="2" y="-8" width="5" height="4" rx="1" fill="#e8352f" stroke="#a3201c" stroke-width="1.2"/>' },
];

export interface YardHooks {
  /** A falling thing was tapped away in time (saved) or Micah got to it first. */
  onSnack?: (snack: Snack, saved: boolean) => void;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startYard(svgEl: SVGSVGElement, owned: string[], sfx: RoamSounds, hooks: YardHooks = {}): () => void {
  const ym = svgEl.querySelector<SVGGElement>('.ym')!;
  const flip = ym.querySelector<SVGGElement>('.ym-flip')!;
  const pose = ym.querySelector<SVGGElement>('.ym-pose')!;
  const emote = ym.querySelector<SVGTextElement>('.ym-emote')!;
  const layer = ym.parentElement!;
  const items = [...svgEl.querySelectorAll<SVGGElement>('.yard-item')];
  const built = DECOR.filter((d) => owned.includes(d.id));
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let x = 228;
  let y = 168;
  let onTop: string | null = null; // item she is sitting on (drawn above it)
  let token = 0; // bumps on every new command, cancelling whatever she was doing
  let idleTimer = 0;
  let raf = 0;
  let stopped = false;

  const setPose = (p: Pose) => {
    pose.setAttribute('class', `ym-pose${p ? ` ${p}` : ''}`);
  };
  const face = (left: boolean) => flip.setAttribute('transform', left ? 'scale(-1 1)' : '');
  const say = (text: string) => {
    emote.textContent = text;
    emote.classList.remove('show');
    void emote.getBoundingClientRect();
    if (text) emote.classList.add('show');
  };
  const place = () => {
    const s = 0.8 + ((y - GRASS.y0) / (GRASS.y1 - GRASS.y0)) * 0.3; // a bit bigger nearer the front
    ym.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
    // Draw her behind anything whose base is in front of her feet.
    const ahead = items.find((it) => it.dataset.id !== onTop && Number(it.dataset.bottom) > y);
    const above = onTop ? items.find((it) => it.dataset.id === onTop) : undefined;
    const before = above ? (above.nextElementSibling as Element | null) : ahead ?? null;
    if (ym.nextElementSibling !== before && before !== ym) layer.insertBefore(ym, before);
  };
  const wait = (ms: number, t: number) =>
    new Promise<boolean>((res) => setTimeout(() => res(t === token && !stopped), ms));

  function moveTo(tx: number, ty: number, t: number, speed = 70): Promise<boolean> {
    tx = clamp(tx, GRASS.x0, GRASS.x1);
    ty = clamp(ty, GRASS.y0, GRASS.y1);
    const dist = Math.hypot(tx - x, ty - y);
    if (dist < 2) return Promise.resolve(t === token);
    face(tx < x);
    setPose(speed > 100 ? 'run' : 'walk');
    const x0 = x;
    const y0 = y;
    const dur = (dist / speed) * 1000;
    const start = performance.now();
    let lastStep = 0;
    return new Promise((res) => {
      const tick = (now: number) => {
        if (t !== token || stopped) return res(false);
        const k = Math.min(1, (now - start) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        x = x0 + (tx - x0) * e;
        y = y0 + (ty - y0) * e;
        place();
        if (now - lastStep > (speed > 100 ? 180 : 300)) {
          lastStep = now;
          if (speed > 100) sfx.step();
        }
        if (k < 1) raf = requestAnimationFrame(tick);
        else {
          setPose('');
          res(true);
        }
      };
      raf = requestAnimationFrame(tick);
    });
  }

  const wiggle = (id: string) => {
    const art = items.find((it) => it.dataset.id === id)?.querySelector('.yard-item-art');
    if (!art) return;
    art.classList.remove('wiggle');
    void (art as SVGGElement).getBoundingClientRect();
    art.classList.add('wiggle');
  };

  /** Walk to an item and do the thing Micah does with it. */
  async function visit(id: string, t: number, hurry = false): Promise<void> {
    const d = DECOR.find((v) => v.id === id);
    if (!d) return;
    const spot = SPOTS[id] ?? { x: 50, y: 100 };
    onTop = null;
    const s = d.w / 100;
    if (!(await moveTo(d.x + spot.x * s, d.y + spot.y * s, t, hurry ? 150 : 70))) return;
    onTop = spot.on ? id : null;
    place();
    switch (id) {
      case 'doghouse': {
        // Pops inside for a moment, then peeks back out.
        face(false);
        ym.classList.add('inside');
        say('');
        if (!(await wait(2600, t))) return;
        ym.classList.remove('inside');
        say('!');
        sfx.bark();
        break;
      }
      case 'bed':
        setPose('nap');
        say('z z z');
        if (!(await wait(6000, t))) return;
        say('');
        setPose('scratch');
        if (!(await wait(900, t))) return;
        break;
      case 'bowl':
        face(true);
        setPose('eat');
        wiggle(id);
        for (let i = 0; i < 3; i++) {
          sfx.crunch();
          if (!(await wait(600, t))) return;
        }
        say('♥');
        break;
      case 'lobster':
        face(true);
        setPose('jump');
        wiggle(id);
        sfx.select();
        if (!(await wait(700, t))) return;
        sfx.bark();
        say('♥');
        if (!(await wait(700, t))) return;
        break;
      case 'ballpit':
        setPose('jump');
        wiggle(id);
        sfx.whoosh();
        if (!(await wait(800, t))) return;
        setPose('jump');
        wiggle(id);
        if (!(await wait(800, t))) return;
        break;
      case 'flowers':
        setPose('dig');
        wiggle(id);
        sfx.whoosh();
        if (!(await wait(1600, t))) return;
        say('?');
        break;
      case 'sprinkler': {
        // Zoomies through the water.
        wiggle(id);
        sfx.splash();
        const cx = d.x + d.w / 2;
        const cy = d.y + d.w * 0.95;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          if (!(await moveTo(cx + Math.cos(a) * 50, cy + Math.sin(a) * 22, t, 170))) return;
        }
        say('!');
        break;
      }
      default:
        // Tree, hydrant and anything new: a good long sniff.
        setPose('sniff');
        if (!(await wait(1600, t))) return;
    }
    setPose('sit');
  }

  /** Left alone, Micah potters about on her own. */
  async function idle(t: number): Promise<void> {
    while (t === token && !stopped) {
      if (!(await wait(rand(1800, 4200), t))) return;
      const r = Math.random();
      if (built.length && r < 0.4) {
        await visit(built[Math.floor(Math.random() * built.length)].id, t);
      } else if (r < 0.85) {
        onTop = null;
        if (!(await moveTo(x + rand(-110, 110), y + rand(-60, 60), t))) return;
        setPose(Math.random() < 0.5 ? 'sniff' : 'sit');
      } else {
        setPose('scratch');
      }
    }
  }

  function command(run: (t: number) => Promise<void>): void {
    const t = ++token;
    clearTimeout(idleTimer);
    cancelAnimationFrame(raf);
    ym.classList.remove('inside');
    say('');
    void run(t).then(() => {
      if (t === token && !stopped && !reduced) idleTimer = window.setTimeout(() => command(idle), 2500);
    });
  }

  const toSvg = (e: MouseEvent) => {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svgEl.getScreenCTM()!.inverse());
    return { x: pt.x, y: pt.y };
  };

  const onClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const snackEl = target.closest<SVGGElement>('.snack');
    if (snackEl) {
      catchSnack(snackEl);
      return;
    }
    if (target.closest('.ym')) {
      command(async (t) => {
        sfx.bark();
        say('!');
        setPose('jump');
        await wait(700, t);
        setPose('sit');
      });
      return;
    }
    const item = target.closest<SVGGElement>('.yard-item');
    if (item) {
      wiggle(item.dataset.id!);
      command((t) => visit(item.dataset.id!, t, true));
      return;
    }
    const p = toSvg(e);
    command(async (t) => {
      onTop = null;
      if (await moveTo(p.x, p.y + 20, t, 150)) setPose('sniff');
    });
  };

  // ── Things fall from the sky. Tap them before Micah gets there, because she will eat anything. ──
  let dropTimer = 0;
  let falling: { el: SVGGElement; snack: Snack; x: number; y: number; landed: boolean } | null = null;

  function catchSnack(el: SVGGElement): void {
    if (!falling || falling.el !== el) return;
    const { snack } = falling;
    falling = null;
    el.classList.add('saved');
    setTimeout(() => el.remove(), 500);
    sfx.select();
    hooks.onSnack?.(snack, true);
    // Micah stops, a little disappointed.
    command(async (t) => {
      setPose('sit');
      say('?');
      await wait(900, t);
    });
    scheduleDrop();
  }

  function drop(): void {
    if (stopped || falling || document.hidden) return scheduleDrop();
    const snack = SNACKS[Math.floor(Math.random() * SNACKS.length)];
    // Land somewhere on the grass, not right on top of Micah.
    let lx = 0;
    let ly = 0;
    for (let i = 0; i < 12; i++) {
      lx = rand(GRASS.x0 + 20, GRASS.x1 - 20);
      ly = rand(GRASS.y0 + 30, GRASS.y1 - 10);
      if (Math.hypot(lx - x, ly - y) > 90) break;
    }
    const ns = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(ns, 'g') as SVGGElement;
    el.setAttribute('class', 'snack');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Grab ${snack.name} before Micah eats it`);
    el.innerHTML = `<ellipse class="snack-shadow" cx="0" cy="12" rx="11" ry="3.5" fill="#000" opacity=".2"/><g class="snack-fall"><g class="snack-art">${snack.svg}</g></g><circle cx="0" cy="0" r="22" fill="transparent"/>`;
    el.setAttribute('transform', `translate(${lx.toFixed(1)} ${ly.toFixed(1)}) scale(1.35)`);
    el.style.setProperty('--fall', `${((-ly - 30) / 1.35).toFixed(0)}px`);
    layer.append(el);
    falling = { el, snack, x: lx, y: ly, landed: false };
    sfx.whoosh();
    const mine = falling;
    // She spots it as it lands and dashes over.
    window.setTimeout(() => {
      if (falling !== mine || stopped) return;
      mine.landed = true;
      chase(mine);
    }, 700);
  }

  /** Micah dashes for the thing. If you call her away, she remembers it a moment later. */
  function chase(mine: NonNullable<typeof falling>): void {
    command(async (t) => {
      const retry = () => window.setTimeout(() => falling === mine && !stopped && chase(mine), 2500);
      onTop = null;
      ym.classList.remove('inside');
      face(mine.x < x);
      say('!');
      sfx.bark();
      if (!(await wait(550, t))) return void retry();
      const side = mine.x < x ? 14 : -14;
      if (!(await moveTo(mine.x + side, mine.y + 6, t, 105))) return void retry();
      if (falling !== mine) return;
      falling = null;
      face(mine.x < x);
      setPose('eat');
      mine.el.classList.add('eaten');
      sfx.crunch();
      await wait(450, t);
      mine.el.remove();
      sfx.crunch();
      hooks.onSnack?.(mine.snack, false);
      scheduleDrop();
      say('gulp');
      if (!(await wait(900, t))) return;
      setPose('sit');
    });
  }

  function scheduleDrop(first = false): void {
    clearTimeout(dropTimer);
    if (stopped || reduced) return;
    dropTimer = window.setTimeout(drop, first ? rand(5000, 9000) : rand(14000, 30000));
  }

  svgEl.addEventListener('click', onClick);
  scheduleDrop(true);
  place();
  setPose('sit');
  if (!reduced) idleTimer = window.setTimeout(() => command(idle), 1200);

  return () => {
    stopped = true;
    token++;
    clearTimeout(idleTimer);
    clearTimeout(dropTimer);
    cancelAnimationFrame(raf);
    svgEl.removeEventListener('click', onClick);
  };
}
