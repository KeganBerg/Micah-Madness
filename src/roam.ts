// Micah's Yard comes alive: she wanders between the things you've built, and tapping
// anything sends her over to play with it. Coordinates are the yard's 360x300 SVG space,
// and Micah's position is where her feet touch the grass.
import { DECOR, GROUND, START, type YardArea, type YardTime } from './yard';
import { SNACKS, type Snack } from './snacks';

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
  dustbath: { x: 96, y: 86 },
  shelf: { x: 50, y: 108 },
  veggies: { x: 50, y: 96 },
  birdbath: { x: 14, y: 96 },
  barrow: { x: 40, y: 56, on: true },
  compost: { x: 50, y: 100 },
  gnome: { x: 94, y: 92 },
  hammock: { x: 50, y: 62, on: true },
  pond: { x: 20, y: 90 },
  mat: { x: 50, y: 80, on: true },
  pumpkin: { x: 0, y: 92 },
  chimes: { x: 50, y: 330 },
  mailbox: { x: 10, y: 96 },
  lamp: { x: 86, y: 94 },
  rocker: { x: 50, y: 62, on: true },
  swing: { x: 50, y: 58, on: true },
  lantern: { x: 90, y: 96 },
  dock: { x: 50, y: 74, on: true },
  chair: { x: 50, y: 64, on: true },
  canoe: { x: 50, y: 70, on: true },
  tent: { x: 50, y: 96 },
  firepit: { x: 96, y: 86 },
  floaty: { x: 50, y: 62, on: true },
  hidey: { x: 104, y: 94 },
  hayrack: { x: 110, y: 100 },
  chews: { x: 112, y: 92 },
  ledges: { x: 104, y: 96 },
  wheel: { x: -24, y: 116 },
  blanket: { x: 76, y: 80, on: true },
};

/** Where Yoshi goes to use each of her things, in the item's 100x100 art box. */
const YOSHI_USE: Record<string, { x: number; y: number }> = {
  hidey: { x: 50, y: 92 },
  hayrack: { x: 50, y: 104 },
  chews: { x: -14, y: 94 },
  ledges: { x: 34, y: 96 },
  wheel: { x: 50, y: 86 },
  blanket: { x: 28, y: 80 },
};
/** The ledges she hops up, bottom to top. */
const LEDGES: [number, number][] = [[34, 68], [66, 44], [34, 20]];

/** Things Micah naps on. At night she heads for these. */
const NAPS = new Set(['bed', 'hammock', 'rocker', 'swing', 'blanket', 'floaty', 'tent']);

export { SNACKS } from './snacks';
export type { Snack } from './snacks';


export interface YardHooks {
  /** A falling thing was tapped away in time (saved) or Micah got to it first. */
  onSnack?: (snack: Snack, saved: boolean) => void;
  /** Yoshi was tapped and Micah came over to see her. */
  onYoshi?: () => void;
  /** A built item was tapped. */
  onItem?: (id: string) => void;
  /** Noah's Ark, over the back fence, was tapped. */
  onArk?: () => void;
  /** Micah reached her dig spot and dug. Returns where she buries the next one if she found something. */
  onDig?: () => { x: number; y: number } | null;
  /** Micah tore open today's advent present. */
  onGift?: () => void;
}

export interface YardOptions {
  area: YardArea;
  time: YardTime;
  /** Winter: Micah leaves paw prints in the snow. */
  snowy?: boolean;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startYard(
  svgEl: SVGSVGElement,
  owned: string[],
  sfx: RoamSounds,
  hooks: YardHooks = {},
  opts: YardOptions = { area: 'back', time: 'day' },
): () => void {
  const GRASS = GROUND[opts.area];
  const night = opts.time === 'night';
  const ym = svgEl.querySelector<SVGGElement>('.ym')!;
  const flip = ym.querySelector<SVGGElement>('.ym-flip')!;
  const pose = ym.querySelector<SVGGElement>('.ym-pose')!;
  const emote = ym.querySelector<SVGTextElement>('.ym-emote')!;
  const layer = ym.parentElement!;
  const items = [...svgEl.querySelectorAll<SVGGElement>('.yard-item')];
  const built = DECOR.filter((d) => d.area === opts.area && owned.includes(d.id));
  const naps = built.filter((d) => NAPS.has(d.id));
  const bath = built.find((d) => d.id === 'dustbath');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  let [x, y] = START[opts.area].micah;
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
    restack();
  };

  // Yoshi, Grace's chinchilla, is visiting. She hops about on her own and takes dust baths.
  const yy = svgEl.querySelector<SVGGElement>('.yy');
  const yFlip = yy?.querySelector<SVGGElement>('.yy-flip');
  const yPose = yy?.querySelector<SVGGElement>('.yy-pose');
  const yDust = yy?.querySelector<SVGGElement>('.yy-dust');
  const yEmote = yy?.querySelector<SVGTextElement>('.yy-emote');
  let [yx, yy0] = START[opts.area].yoshi;
  let yOn: string | null = null; // item Yoshi is on or in (drawn above it)
  const yItems = built.filter((d) => YOSHI_USE[d.id]);
  let yToken = 0;
  let yTimer = 0;
  let yRaf = 0;
  const ySetPose = (p: string) => yPose?.setAttribute('class', `yy-pose${p ? ` ${p}` : ''}`);
  const yFace = (left: boolean) => yFlip?.setAttribute('transform', left ? 'scale(-1 1)' : '');
  const ySay = (text: string) => {
    if (!yEmote) return;
    yEmote.textContent = text;
    yEmote.classList.remove('show');
    void yEmote.getBoundingClientRect();
    if (text) yEmote.classList.add('show');
  };
  const yPlace = () => {
    if (!yy) return;
    const s = (0.8 + ((yy0 - GRASS.y0) / (GRASS.y1 - GRASS.y0)) * 0.3) * 0.9;
    yy.setAttribute('transform', `translate(${yx.toFixed(1)} ${yy0.toFixed(1)}) scale(${s.toFixed(3)})`);
    restack();
  };

  /** Keeps Micah, Yoshi and the yard items drawn back to front by where their feet are. */
  function restack(): void {
    const above = onTop ? items.find((it) => it.dataset.id === onTop) : undefined;
    const depth = (el: Element): number => {
      if (el === ym) return above ? Number(above.dataset.bottom) + 0.01 : y;
      if (el === yy) {
        const on = yOn ? items.find((it) => it.dataset.id === yOn) : undefined;
        return on ? Number(on.dataset.bottom) + 0.02 : yy0;
      }
      return Number((el as SVGGElement).dataset.bottom);
    };
    const all: Element[] = [...items, ym, ...(yy ? [yy] : [])];
    const now = [...layer.children].filter((c) => all.includes(c));
    const want = [...all].sort((a, b) => depth(a) - depth(b));
    if (want.every((el, i) => el === now[i])) return;
    const firstSnack = layer.querySelector(':scope > .snack');
    for (const el of want) layer.insertBefore(el, firstSnack);
  }
  const yWait = (ms: number, t: number) =>
    new Promise<boolean>((res) => setTimeout(() => res(t === yToken && !stopped), ms));

  /** Hops to a spot on the grass (or, with `free`, anywhere, like up her ledges). */
  function yMoveTo(tx: number, ty: number, t: number, free = false): Promise<boolean> {
    if (!free) {
      tx = clamp(tx, GRASS.x0 + 10, GRASS.x1 - 10);
      ty = clamp(ty, GRASS.y0 + 30, GRASS.y1);
    }
    const dist = Math.hypot(tx - yx, ty - yy0);
    if (dist < 2) return Promise.resolve(t === yToken);
    yFace(tx < yx);
    ySetPose('hop');
    const x0 = yx;
    const y0 = yy0;
    const dur = (dist / (free ? 60 : 45)) * 1000;
    const start = performance.now();
    return new Promise((res) => {
      const tick = (now: number) => {
        if (t !== yToken || stopped) return res(false);
        const k = Math.min(1, (now - start) / dur);
        yx = x0 + (tx - x0) * k;
        yy0 = y0 + (ty - y0) * k;
        yPlace();
        if (k < 1) yRaf = requestAnimationFrame(tick);
        else {
          ySetPose('');
          res(true);
        }
      };
      yRaf = requestAnimationFrame(tick);
    });
  }

  function puffs(): void {
    if (!yDust) return;
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 7; i++) {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('class', 'yy-puff');
      c.setAttribute('cx', '0');
      c.setAttribute('cy', '-4');
      c.setAttribute('r', (3 + Math.random() * 3).toFixed(1));
      const a = Math.PI + (i / 6) * Math.PI;
      c.style.setProperty('--dx', `${(Math.cos(a) * 26).toFixed(0)}px`);
      c.style.setProperty('--dy', `${(Math.sin(a) * 18 - 4).toFixed(0)}px`);
      c.style.animationDelay = `${i * 60}ms`;
      yDust.append(c);
      setTimeout(() => c.remove(), 1400);
    }
  }

  function yCommand(run: (t: number) => Promise<void>): void {
    const t = ++yToken;
    clearTimeout(yTimer);
    cancelAnimationFrame(yRaf);
    yy?.classList.remove('inside');
    svgEl.querySelector('.yard-item.spinning')?.classList.remove('spinning');
    if (yOn !== 'ledges') yOn = null;
    void run(t).then(() => {
      if (t === yToken && !stopped && !reduced) yTimer = window.setTimeout(() => yCommand(yIdle), rand(2500, 5000));
    });
  }

  /** Yoshi goes and uses one of her own things in her corner. */
  async function yUse(id: string, t: number): Promise<void> {
    const d = yItems.find((b) => b.id === id);
    if (!d || !yy) return;
    const s = d.w / 100;
    const at = (ax: number, ay: number): [number, number] => [d.x + ax * s, d.y + ay * s];
    if (yOn === 'ledges') {
      // Down off the ledges first.
      if (!(await yMoveTo(...at(34, 96), t, true))) return;
    }
    yOn = null;
    const [px, py] = at(YOSHI_USE[id].x, YOSHI_USE[id].y);
    if (!(await yMoveTo(px, py, t))) return;
    switch (id) {
      case 'hidey':
        yy.classList.add('inside');
        ySay('');
        if (!(await yWait(2800, t))) return;
        yy.classList.remove('inside');
        ySay('!');
        break;
      case 'hayrack':
      case 'chews':
        yFace(id === 'hayrack' ? px < d.x + 50 * s : false);
        ySetPose('groom');
        ySay(id === 'chews' ? 'crunch' : 'nom');
        if (!(await yWait(1800, t))) return;
        break;
      case 'wheel': {
        yOn = 'wheel';
        yPlace();
        const el = items.find((it) => it.dataset.id === 'wheel');
        el?.classList.add('spinning');
        ySetPose('hop');
        sfx.whoosh();
        if (!(await yWait(3000, t))) return;
        el?.classList.remove('spinning');
        yOn = null;
        ySetPose('popcorn');
        if (!(await yWait(900, t))) return;
        break;
      }
      case 'ledges':
        yOn = 'ledges';
        for (const [lx, ly] of LEDGES) {
          if (!(await yMoveTo(...at(lx, ly), t, true))) return;
          ySetPose('sit');
          if (!(await yWait(450, t))) return;
        }
        ySetPose('popcorn');
        ySay('\u2665');
        if (!(await yWait(1600, t))) return;
        break;
      case 'blanket':
        yOn = 'blanket';
        yPlace();
        ySetPose('nap');
        ySay('z');
        if (!(await yWait(4000, t))) return;
        break;
    }
    ySetPose('sit');
  }

  /** Yoshi potters about: little hops, the odd popcorn jump, a groom. */
  async function yIdle(t: number): Promise<void> {
    while (t === yToken && !stopped) {
      const r = Math.random();
      if (yItems.length && r < 0.35) {
        await yUse(yItems[Math.floor(Math.random() * yItems.length)].id, t);
        if (t !== yToken) return;
      } else if (yOn === 'ledges') {
        // Hops back down before wandering off.
        await yUse('ledges', t);
        if (!(await yMoveTo(yx + 30, yy0 + 60, t, true))) return;
        yOn = null;
      } else if (r < 0.55) {
        let tx = yx;
        let ty = yy0;
        for (let i = 0; i < 8; i++) {
          tx = yx + rand(-70, 70);
          ty = yy0 + rand(-40, 40);
          if (Math.hypot(tx - x, ty - y) > 50) break;
        }
        if (!(await yMoveTo(tx, ty, t))) return;
      } else if (bath && r < 0.68) {
        const s = bath.w / 100;
        if (!(await yMoveTo(bath.x + 50 * s, bath.y + 80 * s, t))) return;
        ySetPose('roll');
        puffs();
        if (!(await yWait(1300, t))) return;
      } else if (r < 0.75) {
        ySetPose('popcorn');
        if (!(await yWait(900, t))) return;
      } else {
        ySetPose('groom');
        if (!(await yWait(1400, t))) return;
      }
      ySetPose('sit');
      if (!(await yWait(rand(2200, 5200), t))) return;
    }
  }

  /** Tapped: Yoshi has a dust bath (or a popcorn jump) and Micah comes over to say hello. */
  function meetYoshi(): void {
    yCommand(async (t) => {
      ySay('\u2665');
      if (yItems.length) {
        await yUse(yItems[Math.floor(Math.random() * yItems.length)].id, t);
        if (t !== yToken) return;
      } else if (bath) {
        // Hops into her own dust bath for a proper roll.
        const s = bath.w / 100;
        if (!(await yMoveTo(bath.x + 50 * s, bath.y + 80 * s, t))) return;
        ySetPose('roll');
        puffs();
        sfx.whoosh();
        if (!(await yWait(1300, t))) return;
        ySetPose('roll');
        puffs();
        if (!(await yWait(1300, t))) return;
      } else if (Math.random() < 0.5) {
        ySetPose('roll');
        puffs();
        sfx.whoosh();
        if (!(await yWait(1300, t))) return;
      } else {
        ySetPose('popcorn');
        sfx.select();
        if (!(await yWait(900, t))) return;
      }
      ySetPose('sit');
      if (!(await yWait(2500, t))) return;
    });
    hooks.onYoshi?.();
    command(async (t) => {
      onTop = null;
      const side = x < yx ? -48 : 48;
      if (!(await moveTo(yx + side, yy0 + 2, t, 130))) return;
      face(side > 0);
      yFace(side < 0);
      setPose('sniff');
      if (!(await wait(900, t))) return;
      say('\u2665');
      sfx.bark();
      setPose('sit');
      if (!(await wait(1200, t))) return;
    });
  }
  const wait = (ms: number, t: number) =>
    new Promise<boolean>((res) => setTimeout(() => res(t === token && !stopped), ms));

  // Winter: paw prints in the snow that fade after a while.
  const paws = opts.snowy && !reduced ? svgEl.querySelector<SVGGElement>('.paws') : null;
  let pawSide = 1;
  let pawFrom = { x, y };
  function pawPrint(): void {
    if (!paws || onTop) return;
    if (Math.hypot(x - pawFrom.x, y - pawFrom.y) < 11) return;
    const a = Math.atan2(y - pawFrom.y, x - pawFrom.x);
    pawFrom = { x, y };
    pawSide = -pawSide;
    const px = x + Math.cos(a + Math.PI / 2) * 4 * pawSide;
    const py = y + Math.sin(a + Math.PI / 2) * 2 * pawSide;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'paw-print');
    g.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(0)})`);
    g.innerHTML = '<ellipse cx="0" cy="1" rx="2.2" ry="1.8"/><circle cx="-2" cy="-1.8" r=".8"/><circle cx="0" cy="-2.6" r=".8"/><circle cx="2" cy="-1.8" r=".8"/>';
    paws.append(g);
    if (paws.childElementCount > 80) paws.firstElementChild?.remove();
    setTimeout(() => g.remove(), 9000);
  }

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
        pawPrint();
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
    // Restacking moves items in the DOM, which would replay a leftover wiggle.
    art.addEventListener('animationend', () => art.classList.remove('wiggle'), { once: true });
  };

  /** Micah and Yoshi curl up side by side (on the Nap Blanket if there is one here). */
  async function napTogether(t: number, hurry = false): Promise<void> {
    if (!yy) return;
    const b = yItems.find((d) => d.id === 'blanket');
    const s = b ? b.w / 100 : 0;
    const tx = b ? b.x + 28 * s : clamp(yOn ? yx + 40 : yx, GRASS.x0 + 20, GRASS.x1 - 60);
    const ty = b ? b.y + 80 * s : clamp(yy0 + (yOn ? 60 : 0), GRASS.y0 + 30, GRASS.y1);
    yCommand(async (yt) => {
      yOn = null;
      if (!(await yMoveTo(tx, ty, yt))) return;
      if (b) yOn = 'blanket';
      yPlace();
      yFace(false);
      ySetPose('nap');
      ySay('z');
      await yWait(9500, yt);
    });
    onTop = null;
    if (!(await moveTo(tx + 54, ty + 2, t, hurry ? 130 : 70))) return;
    if (b) onTop = 'blanket';
    place();
    face(true);
    setPose('nap');
    say('z z z');
    if (!(await wait(8500, t))) return;
    say('');
    setPose('scratch');
    if (!(await wait(800, t))) return;
  }

  /** Walk to an item and do the thing Micah does with it. */
  async function visit(id: string, t: number, hurry = false): Promise<void> {
    if (id === 'snowman') {
      onTop = null;
      if (!(await moveTo(256, 150, t, hurry ? 150 : 70))) return;
      face(false);
      setPose('sniff');
      if (!(await wait(1400, t))) return;
      say('?');
      setPose('sit');
      return;
    }
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
      case 'blanket':
        await napTogether(t);
        if (t !== token) return;
        break;
      case 'bed':
      case 'hammock':
      case 'rocker':
      case 'swing':
        if (id !== 'bed') wiggle(id);
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
      case 'veggies':
        setPose('dig');
        wiggle(id);
        sfx.whoosh();
        if (!(await wait(1200, t))) return;
        setPose('eat');
        sfx.crunch();
        if (!(await wait(700, t))) return;
        say('crunch');
        break;
      case 'compost':
        setPose('eat');
        wiggle(id);
        for (let i = 0; i < 3; i++) {
          sfx.crunch();
          if (!(await wait(550, t))) return;
        }
        say('yum');
        break;
      case 'birdbath':
      case 'pond':
        face(false);
        setPose('eat');
        wiggle(id);
        sfx.splash();
        if (!(await wait(1400, t))) return;
        say(id === 'pond' ? 'ribbit?' : '♥');
        break;
      case 'barrow':
      case 'mat':
        setPose('sit');
        wiggle(id);
        say('♥');
        if (!(await wait(2200, t))) return;
        break;
      case 'mailbox':
      case 'chimes':
        face(id === 'mailbox');
        wiggle(id);
        for (let i = 0; i < 3; i++) {
          setPose('jump');
          sfx.bark();
          if (!(await wait(500, t))) return;
        }
        say('!!');
        break;
      case 'dustbath':
        setPose('sniff');
        wiggle(id);
        if (!(await wait(1200, t))) return;
        say('achoo');
        setPose('scratch');
        if (!(await wait(800, t))) return;
        break;
      case 'gnome':
      case 'pumpkin':
        setPose('sniff');
        if (!(await wait(1000, t))) return;
        setPose('eat');
        sfx.crunch();
        if (!(await wait(500, t))) return;
        say('?');
        break;
      default:
        // Tree, hydrant, shelf and anything new: a good long sniff.
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
      if (yy && Math.random() < (night ? 0.2 : 0.07)) {
        // Nap time with Yoshi.
        await napTogether(t);
        if (!(await wait(rand(2000, 4000), t))) return;
      } else if (night && naps.length && r < 0.55) {
        // Bedtime: she heads for somewhere comfy and stays a good while.
        await visit(naps[Math.floor(Math.random() * naps.length)].id, t);
        if (!(await wait(rand(4000, 8000), t))) return;
      } else if (built.length && r < 0.4) {
        await visit(built[Math.floor(Math.random() * built.length)].id, t);
      } else if (yy && r < 0.52) {
        // Goes to check on Yoshi.
        onTop = null;
        const side = x < yx ? -48 : 48;
        if (!(await moveTo(yx + side, yy0 + 2, t))) return;
        face(side > 0);
        setPose('sniff');
        if (!(await wait(1400, t))) return;
        say('\u2665');
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
    if (target.closest('.yy')) {
      meetYoshi();
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
    const gift = target.closest<SVGGElement>('.advent-gift');
    if (gift && !gift.classList.contains('opened')) {
      command(async (t) => {
        onTop = null;
        const m = gift.transform.baseVal.consolidate()?.matrix;
        if (!(await moveTo((m?.e ?? x) + 24, (m?.f ?? y) + 6, t, 150))) return;
        face(true);
        setPose('dig');
        sfx.whoosh();
        gift.classList.add('tearing');
        if (!(await wait(1300, t))) return;
        if (gift.classList.contains('opened')) return;
        gift.classList.add('opened');
        hooks.onGift?.();
        setPose('jump');
        say('!');
        sfx.bark();
        if (!(await wait(1000, t))) return;
        setPose('sit');
        say('♥');
      });
      return;
    }
    const mound = target.closest<SVGGElement>('.dig-mound');
    if (mound) {
      command(async (t) => {
        onTop = null;
        const m = mound.transform.baseVal.consolidate()?.matrix;
        const mx = m?.e ?? x;
        const my = m?.f ?? y;
        if (!(await moveTo(mx + 26, my + 4, t, 150))) return;
        face(true);
        setPose('dig');
        sfx.whoosh();
        if (!(await wait(mound.classList.contains('ready') ? 1600 : 700, t))) return;
        const next = hooks.onDig?.() ?? null;
        if (!next) {
          setPose('sniff');
          say('?');
          return;
        }
        setPose('jump');
        say('!');
        sfx.bark();
        if (!(await wait(1400, t))) return;
        // Off to bury the next one for tomorrow.
        if (!(await moveTo(next.x + 26, next.y + 4, t))) return;
        face(true);
        setPose('dig');
        sfx.whoosh();
        if (!(await wait(1200, t))) return;
        setPose('sit');
        say('♥');
      });
      return;
    }
    if (target.closest('.yard-ark')) {
      hooks.onArk?.();
      command(async (t) => {
        onTop = null;
        if (!(await moveTo(214, GRASS.y0 + 6, t, 150))) return;
        face(false);
        for (let i = 0; i < 2; i++) {
          setPose('jump');
          sfx.bark();
          if (!(await wait(550, t))) return;
        }
        say('!');
        setPose('sit');
      });
      return;
    }
    const item = target.closest<SVGGElement>('.yard-item');
    const yid = item?.dataset.id;
    if (item && yid && YOSHI_USE[yid] && yy) {
      hooks.onItem?.(yid);
      wiggle(yid);
      if (yid === 'blanket') {
        command((t) => napTogether(t, true));
        return;
      }
      // Yoshi shows it off and Micah comes to watch.
      yCommand((yt) => yUse(yid, yt));
      command(async (t) => {
        onTop = null;
        const d = yItems.find((b) => b.id === yid)!;
        const sp = SPOTS[yid];
        if (!(await moveTo(d.x + sp.x * (d.w / 100), d.y + sp.y * (d.w / 100), t, 130))) return;
        face(true);
        setPose('sit');
        if (!(await wait(1500, t))) return;
        say('\u2665');
      });
      return;
    }
    if (item) {
      hooks.onItem?.(item.dataset.id!);
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
  yPlace();
  ySetPose('sit');
  if (!reduced) idleTimer = window.setTimeout(() => command(idle), 1200);
  if (!reduced && yy) yTimer = window.setTimeout(() => yCommand(yIdle), 2600);

  return () => {
    stopped = true;
    token++;
    clearTimeout(idleTimer);
    clearTimeout(dropTimer);
    clearTimeout(yTimer);
    cancelAnimationFrame(raf);
    cancelAnimationFrame(yRaf);
    yToken++;
    svgEl.removeEventListener('click', onClick);
  };
}
