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
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startYard(svgEl: SVGSVGElement, owned: string[], sfx: RoamSounds): () => void {
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

  svgEl.addEventListener('click', onClick);
  place();
  setPose('sit');
  if (!reduced) idleTimer = window.setTimeout(() => command(idle), 1200);

  return () => {
    stopped = true;
    token++;
    clearTimeout(idleTimer);
    cancelAnimationFrame(raf);
    svgEl.removeEventListener('click', onClick);
  };
}
