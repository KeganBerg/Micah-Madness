// Level map scenery: a themed, hand-drawn landscape for each area.
// Everything is flat SVG drawn at real pixel size (so props never stretch on wide phones),
// placed with a seeded random so the map looks the same on every visit, and kept clear of
// the path and level nodes so they stay easy to read and tap.
// Props carry data-poke (how they react to a tap) and data-fx (a little burst they throw).

import { YOSHI, YOSHI_LINES } from './yoshi';

export interface Band { top: number; bottom: number; }
interface Pt { x: number; y: number; }
export interface SceneInput {
  width: number;           // real map width in px
  height: number;          // map height in px
  nodes: Pt[];             // level node centres, already in px
  bands: Band[];           // one per area, index 0 = Area 1 (bottom of the map)
  banners: { x: number; y: number; w: number; h: number }[]; // area name tags to keep clear
}

// ───────────────────────────── helpers ─────────────────────────────

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
const pick = <T,>(r: R, a: T[]): T => a[Math.floor(r() * a.length)];
const f = (n: number) => Math.round(n * 10) / 10;
const shadow = (rx: number, o = 0.18) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${f(rx * 0.28)}" fill="#000" opacity="${o}"/>`;
/** An invisible disc that makes small props easy to tap. */
const hit = (r: number, cy = -r * 0.6) => `<circle cx="0" cy="${f(cy)}" r="${r}" fill="transparent"/>`;

interface Box { x: number; y: number; w: number; h: number; }
interface Prop { svg: string; r: number; poke?: string; fx?: string; sfx?: string; /** Lines shown when tapped, one picked in turn. */ say?: string[]; }

// ───────────────────────────── props ─────────────────────────────

const tree = (leaf: string, dark: string, s = 1): Prop => ({
  r: 30 * s, poke: 'rustle', fx: 'leaf', sfx: 'rustle',
  svg: `${shadow(26 * s)}
    <rect x="${-4 * s}" y="${-22 * s}" width="${8 * s}" height="${22 * s}" rx="2" fill="#7a5233"/>
    <g class="sway">
      <circle cx="${-12 * s}" cy="${-30 * s}" r="${15 * s}" fill="${dark}"/>
      <circle cx="${12 * s}" cy="${-30 * s}" r="${15 * s}" fill="${dark}"/>
      <circle cx="0" cy="${-44 * s}" r="${18 * s}" fill="${leaf}"/>
      <circle cx="${-10 * s}" cy="${-34 * s}" r="${13 * s}" fill="${leaf}"/>
      <circle cx="${11 * s}" cy="${-35 * s}" r="${12 * s}" fill="${leaf}"/>
      <ellipse cx="${-6 * s}" cy="${-50 * s}" rx="${6 * s}" ry="${4 * s}" fill="#fff" opacity=".18"/>
    </g>`,
});

const pine = (c: string, d: string, snow = false, s = 1): Prop => ({
  r: 24 * s, poke: 'rustle', fx: snow ? 'snow' : 'leaf', sfx: 'rustle',
  svg: `${shadow(18 * s)}
    <rect x="${-3 * s}" y="${-12 * s}" width="${6 * s}" height="${12 * s}" fill="#6b4529"/>
    <g class="sway">
      <path d="M0 ${-62 * s} L${16 * s} ${-34 * s} H${-16 * s} Z" fill="${c}"/>
      <path d="M0 ${-48 * s} L${21 * s} ${-20 * s} H${-21 * s} Z" fill="${d}"/>
      <path d="M0 ${-36 * s} L${24 * s} ${-9 * s} H${-24 * s} Z" fill="${c}"/>
      ${snow ? `<path d="M0 ${-62 * s} L${8 * s} ${-48 * s} L${3 * s} ${-50 * s} L0 ${-46 * s} L${-4 * s} ${-50 * s} L${-8 * s} ${-48 * s} Z" fill="#fff"/>
      <path d="M${-17 * s} ${-22 * s} Q0 ${-30 * s} ${17 * s} ${-22 * s} L${21 * s} ${-20 * s} H${-21 * s} Z" fill="#fff" opacity=".9"/>
      <path d="M${-20 * s} ${-11 * s} Q0 ${-18 * s} ${20 * s} ${-11 * s} L${24 * s} ${-9 * s} H${-24 * s} Z" fill="#fff" opacity=".9"/>` : ''}
    </g>`,
});

const bush = (c: string, d: string, berries?: string): Prop => ({
  r: 17, poke: 'rustle', fx: 'leaf', sfx: 'rustle',
  svg: `${shadow(17)}
    <circle cx="-9" cy="-9" r="9" fill="${d}"/><circle cx="9" cy="-9" r="9" fill="${d}"/>
    <circle cx="0" cy="-14" r="11" fill="${c}"/><circle cx="-8" cy="-8" r="8" fill="${c}"/><circle cx="8" cy="-8" r="8" fill="${c}"/>
    ${berries ? `<circle cx="-5" cy="-15" r="2" fill="${berries}"/><circle cx="4" cy="-10" r="2" fill="${berries}"/><circle cx="7" cy="-17" r="2" fill="${berries}"/>` : ''}`,
});

const flower = (petal: string): string => `
  <path d="M0 0 V-10" stroke="#3f7f40" stroke-width="1.6"/>
  <g transform="translate(0 -12)">
    <circle cx="0" cy="-3" r="2.6" fill="${petal}"/><circle cx="3" cy="0" r="2.6" fill="${petal}"/>
    <circle cx="0" cy="3" r="2.6" fill="${petal}"/><circle cx="-3" cy="0" r="2.6" fill="${petal}"/>
    <circle cx="0" cy="0" r="1.8" fill="#ffd23f"/>
  </g>`;
const flowers = (r: R, colors: string[]): Prop => {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<g transform="translate(${f(-14 + i * 7 + r() * 3)} ${f(r() * 6 - 3)})"><g class="sway" style="animation-delay:-${f(r() * 3)}s">${flower(pick(r, colors))}</g></g>`;
  return { r: 18, poke: 'wobble', fx: 'petal', sfx: 'tap', svg: `${shadow(18, 0.1)}${s}` };
};

const ball = (): Prop => ({
  r: 10, poke: 'bounce', sfx: 'boing',
  svg: `${shadow(7)}${hit(14, -7)}<g transform="translate(0 -7)">
    <circle r="7" fill="#cde33b" stroke="#87981c" stroke-width="1.5"/>
    <path d="M-5 -4.5 Q-1.5 0 -5 4.5 M5 -4.5 Q1.5 0 5 4.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`,
});

const bone = (): Prop => ({
  r: 12, poke: 'spin', sfx: 'tap',
  svg: `${hit(14, -4)}<g transform="translate(0 -4) rotate(-20)">
    <rect x="-9" y="-2.5" width="18" height="5" fill="#f6e7c8" stroke="#b8925a" stroke-width="1.4"/>
    <circle cx="-9" cy="-3" r="3.4" fill="#f6e7c8" stroke="#b8925a" stroke-width="1.4"/><circle cx="-9" cy="3" r="3.4" fill="#f6e7c8" stroke="#b8925a" stroke-width="1.4"/>
    <circle cx="9" cy="-3" r="3.4" fill="#f6e7c8" stroke="#b8925a" stroke-width="1.4"/><circle cx="9" cy="3" r="3.4" fill="#f6e7c8" stroke="#b8925a" stroke-width="1.4"/>
    <rect x="-9" y="-1.6" width="18" height="3.2" fill="#f6e7c8"/></g>`,
});

const fence = (w = 54): Prop => {
  let p = '';
  for (let x = -w / 2; x <= w / 2; x += 9) p += `<path d="M${x - 3} 0 V-17 L${x} -21 L${x + 3} -17 V0 Z" fill="#fbf4e6" stroke="#c9b28a" stroke-width="1.2"/>`;
  return { r: w / 2, poke: 'wobble', sfx: 'knock', svg: `${shadow(w / 2, 0.12)}<rect x="${-w / 2 - 3}" y="-14" width="${w + 6}" height="3" fill="#e5d6b8"/><rect x="${-w / 2 - 3}" y="-7" width="${w + 6}" height="3" fill="#e5d6b8"/>${p}` };
};

const doghouse = (): Prop => ({
  r: 28, poke: 'hop', fx: 'heart', sfx: 'bark',
  svg: `${shadow(26)}
    <rect x="-20" y="-30" width="40" height="30" fill="#f2c27b" stroke="#b5833f" stroke-width="2"/>
    <path d="M-25 -28 L0 -48 L25 -28 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-9 0 V-12 A9 9 0 0 1 9 -12 V0 Z" fill="#3b2a1c"/>
    <rect x="-10" y="-28" width="20" height="7" rx="2" fill="#fff"/>
    <text x="0" y="-22.5" text-anchor="middle" font-size="6" font-weight="900" fill="#a3201c" font-family="sans-serif">MICAH</text>`,
});

const hole = (): Prop => ({
  r: 16, poke: 'hop', fx: 'dirt', sfx: 'dig',
  svg: `<ellipse cx="0" cy="-2" rx="11" ry="5" fill="#4a3220"/><ellipse cx="0" cy="-3" rx="8" ry="3" fill="#2e1f14"/>
    <path d="M8 -1 Q14 -12 22 -1 Z" fill="#8b6340"/><circle cx="14" cy="-6" r="1.5" fill="#a77b52"/>${hit(16, -3)}`,
});

const hose = (): Prop => ({
  r: 16, poke: 'wobble', fx: 'drop', sfx: 'splash',
  svg: `${shadow(14, 0.12)}<g transform="translate(0 -5)" fill="none" stroke="#2fa35a" stroke-width="2.6">
    <ellipse rx="12" ry="5"/><ellipse rx="8" ry="3.4"/><path d="M12 0 Q20 2 22 -5"/></g>
    <rect x="20" y="-12" width="4" height="5" rx="1" fill="#ffc12e"/>`,
});

const butterfly = (c: string): Prop => ({
  r: 12, poke: 'flyoff', sfx: 'flutter',
  svg: `${hit(14, -16)}<g class="flutter"><g transform="translate(0 -18)">
    <g class="flap"><ellipse cx="-4" cy="-2" rx="4" ry="5" fill="${c}"/><ellipse cx="4" cy="-2" rx="4" ry="5" fill="${c}"/>
    <ellipse cx="-3" cy="3" rx="3" ry="3" fill="${c}" opacity=".8"/><ellipse cx="3" cy="3" rx="3" ry="3" fill="${c}" opacity=".8"/></g>
    <rect x="-.8" y="-5" width="1.6" height="10" rx=".8" fill="#2b2b2b"/></g></g>`,
});

const bird = (c: string): Prop => ({
  r: 12, poke: 'flyoff', sfx: 'tweet',
  svg: `${shadow(6, 0.15)}${hit(14, -6)}<g class="peck">
    <ellipse cx="0" cy="-7" rx="7" ry="6" fill="${c}"/><circle cx="5" cy="-12" r="4.2" fill="${c}"/>
    <path d="M8.5 -12.5 L12 -11.5 L8.5 -10.5 Z" fill="#ffb02e"/><circle cx="6" cy="-13" r="1" fill="#1b1b1b"/>
    <path d="M-3 -8 Q-1 -3 3 -6" fill="none" stroke="#0003" stroke-width="1.5"/>
    <path d="M-6 -8 L-11 -11 L-10 -6 Z" fill="${c}"/>
    <path d="M-1 -1 V1 M2 -1 V1" stroke="#ffb02e" stroke-width="1"/></g>`,
});

/** A friendly park dog seen from the side. Tail wags; a tap makes her hop and throw a heart. */
const dog = (body: string, ear: string, flip = false, spot?: string): Prop => ({
  r: 20, poke: 'hop', fx: 'heart', sfx: 'woof',
  svg: `${shadow(14)}<g transform="scale(${flip ? -1 : 1} 1)">
    <g class="wag"><path d="M-12 -14 Q-17 -18 -18 -25" stroke="${body}" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
    <rect x="-11" y="-9" width="3.2" height="9" rx="1.4" fill="${ear}"/><rect x="-5" y="-9" width="3.2" height="9" rx="1.4" fill="${body}"/>
    <rect x="4" y="-9" width="3.2" height="9" rx="1.4" fill="${ear}"/><rect x="9" y="-9" width="3.2" height="9" rx="1.4" fill="${body}"/>
    <ellipse cx="0" cy="-13" rx="13" ry="7" fill="${body}"/>
    ${spot ? `<ellipse cx="-3" cy="-15" rx="5" ry="3.5" fill="${spot}"/>` : ''}
    <circle cx="12" cy="-21" r="6.5" fill="${body}"/><ellipse cx="18" cy="-19" rx="4.5" ry="3.2" fill="${body}"/>
    <circle cx="22" cy="-20" r="1.6" fill="#1b1b1b"/><circle cx="14" cy="-23" r="1.1" fill="#1b1b1b"/>
    <ellipse cx="9" cy="-21" rx="2.6" ry="5.5" fill="${ear}" transform="rotate(15 9 -21)"/>
    <path d="M16 -16 Q18 -14 20 -16" stroke="#e8352f" stroke-width="1.4" fill="none"/></g>`,
});

const bench = (): Prop => ({
  r: 22, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(22, 0.15)}<rect x="-18" y="-12" width="3" height="12" fill="#5a4b40"/><rect x="15" y="-12" width="3" height="12" fill="#5a4b40"/>
    <rect x="-22" y="-14" width="44" height="4" rx="1" fill="#b07a45"/><rect x="-22" y="-23" width="44" height="4" rx="1" fill="#c68b51"/><rect x="-22" y="-30" width="44" height="4" rx="1" fill="#c68b51"/>
    <rect x="-20" y="-30" width="2.5" height="18" fill="#5a4b40"/><rect x="17.5" y="-30" width="2.5" height="18" fill="#5a4b40"/>`,
});

const lamp = (): Prop => ({
  r: 12, poke: 'glow', sfx: 'tap',
  svg: `${shadow(6)}${hit(14, -24)}<rect x="-1.5" y="-46" width="3" height="46" fill="#2d3e4a"/><rect x="-4" y="-4" width="8" height="4" fill="#2d3e4a"/>
    <path d="M-6 -46 H6 L4 -54 H-4 Z" fill="#2d3e4a"/><circle class="lamp-glow" cx="0" cy="-49" r="3" fill="#ffe28a"/>`,
});

const pond = (duck = true): Prop => ({
  r: 34, poke: 'splash', fx: 'drop', sfx: 'splash',
  svg: `<ellipse cx="0" cy="-12" rx="34" ry="15" fill="#3f9fd0"/><ellipse cx="0" cy="-12" rx="34" ry="15" fill="none" stroke="#9ad2ef" stroke-width="3"/>
    <ellipse class="ripple" cx="-12" cy="-10" rx="7" ry="2.5" fill="none" stroke="#fff" stroke-width="1.2"/>
    <ellipse class="ripple" style="animation-delay:-1.5s" cx="14" cy="-15" rx="6" ry="2" fill="none" stroke="#fff" stroke-width="1.2"/>
    ${duck ? `<g transform="translate(6 -14)"><g class="bob"><ellipse cx="0" cy="0" rx="6" ry="3.6" fill="#fff"/><circle cx="4" cy="-4" r="3" fill="#fff"/><path d="M6.5 -4.5 L9.5 -3.5 L6.5 -2.5 Z" fill="#ffb02e"/><circle cx="4.6" cy="-4.6" r=".7" fill="#1b1b1b"/></g></g>` : ''}
    <path d="M-34 -14 Q-38 -24 -33 -30 M-31 -12 Q-31 -22 -27 -26" stroke="#3f7f40" stroke-width="2" fill="none"/>`,
});

const frisbee = (c: string): Prop => ({
  r: 11, poke: 'spin', sfx: 'whoosh',
  svg: `${hit(14, -3)}<g transform="translate(0 -3)"><ellipse rx="9" ry="3.6" fill="${c}"/><ellipse rx="5.5" ry="2" fill="#fff" opacity=".35"/></g>`,
});

const hydrant = (): Prop => ({
  r: 12, poke: 'wobble', fx: 'drop', sfx: 'splash',
  svg: `${shadow(8)}<rect x="-5.5" y="-18" width="11" height="18" rx="2" fill="#e8352f"/><rect x="-8" y="-12" width="16" height="4" rx="2" fill="#c42a25"/>
    <path d="M-6 -18 Q0 -26 6 -18 Z" fill="#c42a25"/><rect x="-7" y="-2" width="14" height="3" fill="#a3201c"/>`,
});

const sea = (w: number, top: number, bottom: number, edge: number): string => {
  let wave = `M${w} ${top} L${edge} ${top}`;
  for (let y = top; y < bottom; y += 24) wave += ` Q${edge - 8} ${y + 12} ${edge} ${y + 24}`;
  wave += ` L${w} ${bottom} Z`;
  let foam = `M${edge} ${top}`;
  for (let y = top; y < bottom; y += 24) foam += ` Q${edge - 8} ${y + 12} ${edge} ${y + 24}`;
  return `<path d="${wave}" fill="#3fa9d8"/><path d="${wave}" fill="#2f8fc4" transform="translate(16 0)"/>
    <g class="foam"><path d="${foam}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/></g>
    <g class="foam" style="animation-delay:-1.4s"><path d="${foam}" fill="none" stroke="#bfe8fa" stroke-width="2" transform="translate(-9 6)" opacity=".7"/></g>`;
};

const umbrella = (a: string, b: string): Prop => ({
  r: 26, poke: 'wobble', sfx: 'whoosh',
  svg: `<ellipse cx="0" cy="0" rx="24" ry="6" fill="#000" opacity=".12"/><rect x="-1.2" y="-40" width="2.4" height="40" fill="#6b5a4a"/>
    <g class="sway"><path d="M-26 -36 Q0 -60 26 -36 Z" fill="${a}"/>
    <path d="M-9 -45 Q0 -58 9 -45 L5 -36 Q0 -50 -5 -36 Z" fill="${b}"/><path d="M-26 -36 Q-20 -50 -9 -45 L-5 -36 Q-15 -42 -26 -36 Z" fill="${b}"/>
    <path d="M26 -36 Q20 -50 9 -45 L5 -36 Q15 -42 26 -36 Z" fill="${b}"/></g>`,
});

const towel = (a: string, b: string): Prop => ({
  r: 20, poke: 'wobble', sfx: 'tap',
  svg: `<g transform="rotate(-12) translate(0 -8)"><rect x="-16" y="-9" width="32" height="18" rx="2" fill="${a}"/>
    <rect x="-16" y="-3" width="32" height="5" fill="${b}"/><path d="M-16 -9 v18 M16 -9 v18" stroke="#fff" stroke-width="1.5" stroke-dasharray="1.5 1.5"/></g>`,
});

const sandcastle = (): Prop => ({
  r: 20, poke: 'wobble', fx: 'sand', sfx: 'dig',
  svg: `${shadow(18, 0.12)}<path d="M-16 0 V-14 H-12 V-18 H-8 V-14 H-4 V-22 H-1 V-26 H3 V-22 H6 V-14 H10 V-18 H14 V-14 H16 V0 Z" fill="#e9c97f" stroke="#c9a253" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M-2 0 V-6 A3 3 0 0 1 4 -6 V0 Z" fill="#b48a3c"/><path d="M1 -26 V-34" stroke="#6b5a4a" stroke-width="1"/><path d="M1 -34 L8 -31.5 L1 -29 Z" fill="#e8352f"/>`,
});

const shell = (c: string): Prop => ({
  r: 9, poke: 'spin', sfx: 'tap',
  svg: `${hit(12, -3)}<path d="M0 -10 L-7 -1 Q0 2 7 -1 Z" fill="${c}"/><path d="M0 -10 L-3 0 M0 -10 V1 M0 -10 L3 0" stroke="#0002" stroke-width="1"/>`,
});

const starfish = (): Prop => {
  let p = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 - 90) * Math.PI / 180, b = a + 36 * Math.PI / 180;
    p += `${i ? 'L' : 'M'}${f(Math.cos(a) * 8)} ${f(Math.sin(a) * 8 - 4)} L${f(Math.cos(b) * 3.4)} ${f(Math.sin(b) * 3.4 - 4)} `;
  }
  return { r: 10, poke: 'spin', sfx: 'tap', svg: `${hit(12, -4)}<path d="${p}Z" fill="#ff8f5a" stroke="#d1603a" stroke-width="1" stroke-linejoin="round"/>` };
};

const crab = (): Prop => ({
  r: 14, poke: 'scuttle', sfx: 'scuttle',
  svg: `${shadow(9, 0.15)}<g class="scuttle"><path d="M-9 -4 L-13 0 M-8 -2 L-11 1 M9 -4 L13 0 M8 -2 L11 1" stroke="#c42a25" stroke-width="1.5"/>
    <ellipse cx="0" cy="-6" rx="9" ry="5.5" fill="#e8352f"/><circle cx="-11" cy="-11" r="3.4" fill="#e8352f"/><circle cx="11" cy="-11" r="3.4" fill="#e8352f"/>
    <path d="M-3 -10 V-14 M3 -10 V-14" stroke="#c42a25" stroke-width="1.2"/><circle cx="-3" cy="-14.5" r="1.6" fill="#fff"/><circle cx="3" cy="-14.5" r="1.6" fill="#fff"/>
    <circle cx="-3" cy="-14.5" r=".8" fill="#1b1b1b"/><circle cx="3" cy="-14.5" r=".8" fill="#1b1b1b"/></g>`,
});

const palm = (): Prop => ({
  r: 28, poke: 'rustle', fx: 'coconut', sfx: 'rustle',
  svg: `${shadow(20)}<path d="M2 0 Q-2 -26 6 -52" stroke="#a7784a" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M2 0 Q-2 -26 6 -52" stroke="#8a5f36" stroke-width="6" fill="none" stroke-dasharray="2 6"/>
    <g class="sway"><path d="M6 -52 Q-14 -64 -30 -48 Q-12 -56 6 -52 Z" fill="#3f9a4a"/><path d="M6 -52 Q26 -66 38 -48 Q22 -58 6 -52 Z" fill="#3f9a4a"/>
    <path d="M6 -52 Q-6 -74 -20 -72 Q-6 -66 6 -52 Z" fill="#4fb35a"/><path d="M6 -52 Q18 -76 32 -70 Q16 -66 6 -52 Z" fill="#4fb35a"/><path d="M6 -52 Q4 -72 10 -80 Q10 -66 6 -52 Z" fill="#59c064"/>
    <circle cx="3" cy="-50" r="3" fill="#7a5233"/><circle cx="9" cy="-49" r="3" fill="#6b4529"/></g>`,
});

const beachball = (): Prop => ({
  r: 12, poke: 'bounce', sfx: 'boing',
  svg: `${shadow(9)}<g transform="translate(0 -9)"><circle r="9" fill="#fff"/><path d="M0 -9 A9 9 0 0 1 9 0 L0 0 Z" fill="#e8352f"/><path d="M0 9 A9 9 0 0 1 -9 0 L0 0 Z" fill="#2f8fe0"/>
    <path d="M-9 0 A9 9 0 0 1 0 -9 L0 0 Z" fill="#ffc12e"/><circle r="9" fill="none" stroke="#0002"/><ellipse cx="-3" cy="-4" rx="2.5" ry="1.5" fill="#fff" opacity=".7"/></g>`,
});

const bucket = (): Prop => ({
  r: 12, poke: 'hop', fx: 'sand', sfx: 'dig',
  svg: `${shadow(8, 0.12)}<path d="M-7 -14 L-5 0 H5 L7 -14 Z" fill="#2f8fe0"/><ellipse cx="0" cy="-14" rx="7" ry="2" fill="#17599a"/><path d="M-7 -14 Q0 -24 7 -14" stroke="#17599a" fill="none" stroke-width="1"/>
    <path d="M9 0 L13 -16" stroke="#ffc12e" stroke-width="2"/><path d="M7 0 Q9 4 12 0 L11 -3 Z" fill="#ffc12e"/>`,
});

const puddle = (): Prop => ({
  r: 20, poke: 'splash', fx: 'mud', sfx: 'splash',
  svg: `<ellipse cx="0" cy="-5" rx="20" ry="7" fill="#5b4330"/><ellipse cx="0" cy="-5.5" rx="17" ry="5.5" fill="#7d9fb2"/>
    <ellipse cx="-5" cy="-7" rx="6" ry="1.4" fill="#fff" opacity=".45"/><ellipse class="ripple" cx="5" cy="-5" rx="5" ry="1.8" fill="none" stroke="#fff" stroke-width="1"/>`,
});

const log = (): Prop => ({
  r: 20, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(18, 0.15)}<rect x="-18" y="-12" width="32" height="11" rx="5" fill="#8a5f36"/><ellipse cx="14" cy="-6.5" rx="4" ry="5.5" fill="#d9b07a" stroke="#8a5f36"/>
    <ellipse cx="14" cy="-6.5" rx="1.8" ry="2.6" fill="none" stroke="#a7784a"/><path d="M-12 -9 h10 M-6 -5 h12" stroke="#6b4529" stroke-width="1"/>
    <path d="M-10 -12 Q-12 -18 -8 -20 Q-7 -15 -10 -12" fill="#59a14a"/>`,
});

const rock = (c: string): Prop => ({
  r: 13, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(12, 0.15)}<path d="M-12 0 Q-13 -9 -5 -12 Q3 -16 9 -10 Q14 -4 11 0 Z" fill="${c}"/><path d="M-6 -9 Q-2 -12 3 -11" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35"/>`,
});

const mushroom = (): Prop => ({
  r: 11, poke: 'bounce', sfx: 'boing',
  svg: `${shadow(7, 0.15)}<rect x="-2.5" y="-9" width="5" height="9" rx="2" fill="#f6ead2"/><path d="M-9 -8 Q0 -20 9 -8 Z" fill="#e8352f"/>
    <circle cx="-3" cy="-12" r="1.6" fill="#fff"/><circle cx="3" cy="-11" r="1.3" fill="#fff"/><circle cx="0" cy="-15" r="1.1" fill="#fff"/>
    <g transform="translate(9 0) scale(.6)"><rect x="-2.5" y="-9" width="5" height="9" rx="2" fill="#f6ead2"/><path d="M-9 -8 Q0 -20 9 -8 Z" fill="#c9893f"/></g>`,
});

const fern = (c: string): Prop => {
  let p = '';
  for (const a of [-50, -25, 0, 25, 50]) p += `<path d="M0 0 Q${f(a * 0.25)} -12 ${f(a * 0.4)} -20" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return { r: 14, poke: 'rustle', fx: 'leaf', sfx: 'rustle', svg: `${shadow(10, 0.12)}<g class="sway">${p}</g>` };
};

// Noah's Ark: the falling-down house Micah's family laughs at on every walk.
// Boarded windows, a sagging roof, and a full house of squirrels and raccoons.
const squirrelBit = (flip = false) => `<g><g transform="scale(${flip ? -1 : 1} 1)">
    <path d="M4 2 C14 0 15 -12 8 -15 C4 -16 2 -12 5 -10 C9 -8 8 -3 3 -2" fill="#b06a2c" stroke="#6e3e14" stroke-width="1"/>
    <ellipse cx="-1" cy="0" rx="4.5" ry="5" fill="#c27a38" stroke="#6e3e14" stroke-width="1"/>
    <circle cx="-2" cy="-6" r="3.6" fill="#c27a38" stroke="#6e3e14" stroke-width="1"/>
    <path d="M-4 -9 L-4.5 -12 L-2 -9.5 Z" fill="#c27a38" stroke="#6e3e14" stroke-width=".8"/>
    <circle cx="-3.2" cy="-6.6" r=".9" fill="#111"/><circle cx="-5.4" cy="-5.4" r=".7" fill="#5a2d10"/>
    <ellipse cx="0" cy="1" rx="2" ry="2.6" fill="#f0c48e"/></g></g>`;
const raccoonBit = () => `<g>
    <path d="M7 1 C14 -1 16 -6 13 -9" fill="none" stroke="#6d6d6d" stroke-width="4" stroke-linecap="round"/>
    <path d="M9.5 0.2 L10.5 -2.4 M12.6 -3.4 L14.2 -5.2" stroke="#2b2b2b" stroke-width="1.6"/>
    <ellipse cx="0" cy="0" rx="7" ry="5.5" fill="#8a8a8a" stroke="#3d3d3d" stroke-width="1"/>
    <ellipse cx="0" cy="-8" rx="6.5" ry="5.2" fill="#9a9a9a" stroke="#3d3d3d" stroke-width="1"/>
    <path d="M-6 -12 L-5 -15.5 L-2.5 -12.5 Z M6 -12 L5 -15.5 L2.5 -12.5 Z" fill="#7a7a7a" stroke="#3d3d3d" stroke-width=".8"/>
    <path d="M-6 -9 Q0 -11.5 6 -9 Q6 -6.5 0 -6.8 Q-6 -6.5 -6 -9 Z" fill="#2b2b2b"/>
    <circle cx="-2.6" cy="-8.6" r="1.1" fill="#fff"/><circle cx="2.6" cy="-8.6" r="1.1" fill="#fff"/>
    <circle cx="-2.6" cy="-8.6" r=".55" fill="#111"/><circle cx="2.6" cy="-8.6" r=".55" fill="#111"/>
    <ellipse cx="0" cy="-5" rx="2.4" ry="1.6" fill="#e6e6e6"/><circle cx="0" cy="-5.6" r=".8" fill="#111"/></g>`;
const boards = (x: number, y: number, w: number, h: number) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f1a17"/>
    <path d="M${x - 2} ${y + 2} L${x + w + 2} ${y + h - 2}" stroke="#b08a5a" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M${x - 2} ${y + h - 3} L${x + w + 2} ${y + 3}" stroke="#c49a66" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="${x}" cy="${y + 2}" r=".7" fill="#555"/><circle cx="${x + w}" cy="${y + 3}" r=".7" fill="#555"/>`;

/** The barn owl who lives over the garage. Perched, or (flying) with her wings out. */
export const owlSVG = (flying = false, part: 'all' | 'wings' | 'body' = 'all') => {
  if (!flying) return OWL_PERCHED;
  return (part !== 'body' ? OWL_WINGS : '') + (part !== 'wings' ? OWL_BODY : '');
};
const OWL_WINGS = `<path d="M-3 -2 C-12 -12 -22 -10 -27 -3 C-21 -4 -15 -1 -10 3 Z" fill="#8a6a4a" stroke="#4f3a26" stroke-width="1"/>
    <path d="M3 -2 C12 -12 22 -10 27 -3 C21 -4 15 -1 10 3 Z" fill="#8a6a4a" stroke="#4f3a26" stroke-width="1"/>`;
const OWL_BODY = `<ellipse cx="0" cy="0" rx="8" ry="9" fill="#9b7a56" stroke="#4f3a26" stroke-width="1"/>
    <ellipse cx="0" cy="2.5" rx="5" ry="5.5" fill="#e6d3b0"/>
    <path d="M-7 -6 L-6 -11 L-3 -7 Z M7 -6 L6 -11 L3 -7 Z" fill="#9b7a56" stroke="#4f3a26" stroke-width=".8"/>
    <circle cx="-3.2" cy="-4" r="3.2" fill="#ffc12e" stroke="#4f3a26" stroke-width=".7"/><circle cx="3.2" cy="-4" r="3.2" fill="#ffc12e" stroke="#4f3a26" stroke-width=".7"/>
    <circle cx="-3" cy="-4" r="1.5" fill="#111"/><circle cx="3" cy="-4" r="1.5" fill="#111"/>
    <path d="M-1.3 -1.2 L1.3 -1.2 L0 1.4 Z" fill="#e8892f"/>`;
const OWL_PERCHED = `<ellipse cx="0" cy="-8" rx="6.5" ry="8.5" fill="#9b7a56" stroke="#4f3a26" stroke-width="1"/>
    <ellipse cx="0" cy="-5.5" rx="4" ry="5" fill="#e6d3b0"/>
    <path d="M-6 -8 Q-8 -3 -4 0 M6 -8 Q8 -3 4 0" fill="#8a6a4a" stroke="#4f3a26" stroke-width=".8"/>
    <path d="M-5.5 -13 L-5 -18 L-2.5 -14 Z M5.5 -13 L5 -18 L2.5 -14 Z" fill="#9b7a56" stroke="#4f3a26" stroke-width=".8"/>
    <circle cx="-2.8" cy="-11.5" r="2.8" fill="#ffc12e" stroke="#4f3a26" stroke-width=".6"/><circle cx="2.8" cy="-11.5" r="2.8" fill="#ffc12e" stroke="#4f3a26" stroke-width=".6"/>
    <circle cx="-2.6" cy="-11.4" r="1.3" fill="#111"/><circle cx="2.6" cy="-11.4" r="1.3" fill="#111"/>
    <path d="M-1.1 -9 L1.1 -9 L0 -6.8 Z" fill="#e8892f"/>
    <path d="M-2 0 V1.4 M2 0 V1.4" stroke="#e8892f" stroke-width="1"/>`;

// The white garage next door: as run-down as the house, with peeling paint, a sagging roof,
// boarded windows and a door off its track. A little deck joins its top floor to the house.
const garage = () => `<g transform="translate(54 0) rotate(2.5)">
    <rect x="-24" y="-52" width="48" height="52" fill="#e4dfd2" stroke="#7d786c" stroke-width="2"/>
    <path d="M-24 -42 H24 M-24 -32 H24" stroke="#c9c3b5" stroke-width="1"/>
    <path d="M-23 -30 q4 -3 8 0 q-1 5 -5 6 q-4 -1 -3 -6 Z M12 -50 q5 -1 9 2 q-2 4 -6 4 q-3 -2 -3 -6 Z M-8 -50 q3 0 4 3 q-2 2 -4 1 Z M19 -28 q3 1 4 4 l-1 6 q-3 -2 -3 -10 Z" fill="#a89a84" opacity=".85"/>
    <path d="M-18 -44 l4 3 -2 3 M20 -34 l-3 4 2 3" stroke="#6f6a5f" stroke-width="1" fill="none"/>
    <path d="M-29 -50 L-1 -75 L29 -49 Q0 -45 -29 -50 Z" fill="#5d6268" stroke="#3a3f45" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-17 -56 h8 M2 -62 h8 M10 -55 h7" stroke="#474c52" stroke-width="1.8"/>
    <path d="M4 -60 L11 -57 L8 -52 L1 -55 Z" fill="#1f1a17"/><path d="M3 -59 L9 -53" stroke="#7a5a48" stroke-width="1.1"/>
    <path d="M-20 -26 H20 V0 H-20 Z" fill="#1f1a17"/>
    <path d="M-20 -26 H20 V-3 L-20 -8 Z" fill="#d6d0c2" stroke="#7d786c" stroke-width="1.5"/>
    <path d="M-20 -19.5 H20 M-20 -13 H20 M-20 -8 L20 -5" stroke="#aaa395" stroke-width="1.2"/>
    <path d="M-6 -22 q3 2 1 5" stroke="#8d8678" stroke-width="1.2" fill="none"/>
    <path d="M-22 -48 V-31 H-12 V-48 Z" fill="#1f1a17" stroke="#7d786c" stroke-width="1.5"/>
    <path d="M-24 -43 L-10 -38" stroke="#c49a66" stroke-width="3" stroke-linecap="round"/>
    ${boards(4, -47, 13, 11)}
    <path d="M-21 0 q-3 -10 1 -18 q3 -6 0 -12" stroke="#4f7a45" stroke-width="1.6" fill="none"/>
    <circle cx="-20" cy="-14" r="1.8" fill="#5e9a45"/><circle cx="-19" cy="-24" r="1.6" fill="#5e9a45"/><circle cx="-21" cy="-6" r="1.7" fill="#5e9a45"/>
  </g>`;
const deck = () => {
  let bal = '';
  for (let x = 12; x <= 30; x += 3) bal += `<path d="M${x} -36 V-45" stroke="#7a5233" stroke-width="1.1"/>`;
  return `<g>
    <path d="M14 -34 V0 M28 -34 V0" stroke="#6b4529" stroke-width="2.4"/>
    <path d="M14 -18 L28 -32 M28 -18 L14 -32" stroke="#6b4529" stroke-width="1.2" opacity=".8"/>
    <rect x="5" y="-37" width="27" height="4" fill="#9b7550" stroke="#5e3f25" stroke-width="1"/>
    ${bal}<path d="M7 -45.5 H31" stroke="#7a5233" stroke-width="2" stroke-linecap="round"/>
  </g>`;
};

export const noahsArk = (): Prop => ({
  r: 70, poke: 'critters', fx: 'leaf', sfx: 'tweet',
  say: [
    'Noah’s Ark. Still standing. Somehow.',
    'The squirrels have signed a long lease.',
    'A raccoon waves from the chimney. Rent is due Tuesday.',
    'Micah sniffs the porch. Verdict: very interesting.',
    'Two of every critter, as promised.',
    'The garage was white once. Nobody remembers when.',
    'The owl over the garage keeps an eye on Micah. Who? Micah.',
  ],
  svg: `<g transform="scale(.86)">${shadow(80, 0.22)}
    <path d="M-80 0 q2 -9 5 -1 q2 -11 4 0 M72 0 q2 -10 5 -1 q2 -8 4 0 M-34 0 q1 -7 3 -1" stroke="#55705f" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${garage()}
    <g class="critter c-owl owl-perch" transform="translate(56 -74)"><g>${owlSVG()}</g></g>
    <g transform="translate(-24 0) rotate(-3)">
      <rect x="-40" y="-56" width="72" height="56" fill="#8c7b66" stroke="#4f4237" stroke-width="2"/>
      <path d="M-40 -46 H32 M-40 -36 H32 M-40 -26 H32 M-40 -16 H32 M-40 -6 H32" stroke="#6f604f" stroke-width="1" opacity=".7"/>
      <path d="M-22 -50 l6 3 -4 4 M18 -20 l5 2 -3 5" stroke="#5c4e41" stroke-width="1.2" fill="none"/>
      <!-- The raccoon sits down inside the chimney: drawn first, then the chimney and its rim in front,
           so only its head and tail show over the top (and it can duck right in). -->
      <g transform="rotate(7 22 -72)">
        <rect x="15" y="-84" width="15" height="22" fill="#3a2a22"/>
        <g class="critter c-chimney" transform="translate(22.5 -83)">${raccoonBit()}</g>
        <rect x="15" y="-82" width="15" height="20" fill="#7a5a48" stroke="#4f4237" stroke-width="1.5"/>
        <path d="M15 -76 h15 M15 -70 h15 M22 -82 v6 M19 -76 v6 M26 -76 v6" stroke="#5f4538" stroke-width=".9"/>
        <rect x="13" y="-85" width="19" height="4" fill="#6a4a3a" stroke="#4f4237" stroke-width="1.2"/>
      </g>
      <path d="M-48 -54 L-4 -88 L40 -56 Q-4 -50 -48 -54 Z" fill="#4f4440" stroke="#2d2623" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-30 -62 h8 M-16 -70 h8 M2 -66 h8 M14 -60 h8" stroke="#3b322e" stroke-width="2"/>
      <path d="M-6 -78 L4 -72 L-2 -66 L-12 -70 Z" fill="#1f1a17"/>
      <path d="M-8 -76 L2 -68 M-4 -78 L-10 -68" stroke="#7a5a48" stroke-width="1.2"/>
      <g class="critter c-roof" transform="translate(-30 -60) rotate(-20)">${squirrelBit()}</g>
      ${boards(-33, -48, 16, 13)}
      ${boards(8, -48, 14, 13)}
      <g class="critter c-window" transform="translate(-25 -36)">${squirrelBit(true)}</g>
      ${boards(-33, -27, 14, 11)}
      <path d="M-6 0 V-26 H8 V0 Z" fill="#2a221d"/>
      <path d="M-6 -26 H8 L10 -2 L-4 1 Z" fill="#6b4f3a" stroke="#3b2a1c" stroke-width="1.2" transform="rotate(9 -6 -26)"/>
      <circle cx="5" cy="-12" r="1" fill="#c9a24a"/>
      <path d="M14 -24 h12 v10 h-12 Z" fill="#1f1a17"/><path d="M14 -24 L26 -14" stroke="#b08a5a" stroke-width="3" stroke-linecap="round"/>
      <path d="M-12 0 H16 L14 4 H-10 Z" fill="#6f5a45"/>
    </g>
    ${deck()}
    <g transform="translate(13 2) rotate(-25)"><rect x="-6" y="-12" width="12" height="12" rx="2" fill="#7d8a90" stroke="#4d5a60" stroke-width="1.2"/><path d="M-7 -12 h14" stroke="#4d5a60" stroke-width="2"/></g>
    <g class="critter c-porch" transform="translate(22 -1)">${raccoonBit()}</g>
    <g transform="translate(-68 2) rotate(-6)">
      <rect x="-1.6" y="-30" width="3.2" height="30" fill="#6b4529"/>
      <path d="M-27 -33 H23 L24 -20 H-28 Z" fill="#e3d5b5" stroke="#6b4529" stroke-width="1.3"/>
      <text x="-2" y="-23.6" text-anchor="middle" font-size="7.6" font-weight="900" fill="#a3201c" font-family="'Lilita One', sans-serif" textLength="44" lengthAdjust="spacingAndGlyphs" transform="rotate(-3 -2 -26)">NOAH&#8217;S ARK</text>
    </g>
    <rect x="-90" y="-92" width="176" height="94" fill="transparent"/></g>`,
});

const signpost = (text: string): Prop => ({
  r: 18, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(8, 0.15)}<rect x="-1.8" y="-34" width="3.6" height="34" fill="#7a5233"/><path d="M-16 -34 H12 L17 -29 L12 -24 H-16 Z" fill="#c68b51" stroke="#7a5233" stroke-width="1.2"/>
    <text x="-1" y="-26.8" text-anchor="middle" font-size="6.5" font-weight="900" fill="#4a3220" font-family="sans-serif">${text}</text>`,
});

const pawTrail = (r: R, n = 5): Prop => {
  let p = '';
  for (let i = 0; i < n; i++) {
    const x = (i % 2 ? 4 : -4), y = -i * 14;
    p += `<g transform="translate(${x} ${y}) rotate(${f(r() * 20 - 10)})" fill="#5d4128" opacity=".55"><ellipse cx="0" cy="0" rx="3" ry="2.6"/><circle cx="-3" cy="-3.4" r="1.1"/><circle cx="-1" cy="-4.6" r="1.1"/><circle cx="1.4" cy="-4.6" r="1.1"/><circle cx="3.4" cy="-3.4" r="1.1"/></g>`;
  }
  return { r: 12, svg: p };
};

const balloon = (c: string): Prop => ({
  r: 14, poke: 'float', sfx: 'pop',
  svg: `${hit(14, -30)}<g class="bob"><path d="M0 0 Q-4 -10 0 -20" stroke="#fff" stroke-width="1" fill="none"/><ellipse cx="0" cy="-31" rx="9" ry="11" fill="${c}"/>
    <path d="M-1.5 -20 L1.5 -20 L0 -22 Z" fill="${c}"/><ellipse cx="-3" cy="-35" rx="2.4" ry="3.6" fill="#fff" opacity=".4"/></g>`,
});

const gift = (box: string, ribbon: string): Prop => ({
  r: 13, poke: 'hop', fx: 'confetti', sfx: 'pop',
  svg: `${shadow(11, 0.15)}<rect x="-10" y="-17" width="20" height="17" rx="1.5" fill="${box}"/><rect x="-11.5" y="-20" width="23" height="5" rx="1.5" fill="${box}"/>
    <rect x="-2" y="-20" width="4" height="20" fill="${ribbon}"/><path d="M0 -20 Q-9 -28 -6 -20 M0 -20 Q9 -28 6 -20" stroke="${ribbon}" stroke-width="2.4" fill="none"/>`,
});

const yarn = (c: string, d: string): Prop => ({
  r: 12, poke: 'bounce', sfx: 'boing',
  svg: `${shadow(9)}<path d="M8 -4 Q18 0 22 -6 Q26 -12 30 -8" stroke="${c}" stroke-width="1.4" fill="none"/><g transform="translate(0 -9)"><circle r="9" fill="${c}"/>
    <path d="M-7 -5 Q0 2 7 -6 M-8 0 Q0 7 8 -1 M-5 6 Q2 -2 4 -8" stroke="${d}" stroke-width="1.3" fill="none"/></g>`,
});

const partyHat = (a: string, b: string): Prop => ({
  r: 11, poke: 'spin', fx: 'confetti', sfx: 'pop',
  svg: `${shadow(7, 0.12)}<path d="M-8 0 L0 -22 L8 0 Z" fill="${a}"/><path d="M-5 -8 L5 -10 M-3 -14 L3 -15" stroke="${b}" stroke-width="2.5"/><circle cx="0" cy="-23" r="2.6" fill="${b}"/>`,
});

const bunting = (w: number, colors: string[]): Prop => {
  let flags = '';
  const n = Math.floor(w / 12);
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (i * w) / n, sag = Math.sin((i / n) * Math.PI) * 10;
    if (i < n) flags += `<path d="M${f(x + 1)} ${f(-40 + sag)} h9 l-4.5 9 Z" fill="${colors[i % colors.length]}"/>`;
  }
  return { r: w / 2, poke: 'wobble', sfx: 'tap', svg: `<rect x="${-w / 2 - 1.5}" y="-44" width="3" height="44" fill="#7a5233"/><rect x="${w / 2 - 1.5}" y="-44" width="3" height="44" fill="#7a5233"/>
    <g class="sway"><path d="M${-w / 2} -41 Q0 -21 ${w / 2} -41" stroke="#4a3220" fill="none"/>${flags}</g>` };
};

const disco = (): Prop => ({
  r: 14, poke: 'spin', fx: 'sparkle', sfx: 'chime',
  svg: `${shadow(8, 0.12)}<rect x="-1" y="-30" width="2" height="12" fill="#666"/><g transform="translate(0 -12)"><circle r="10" fill="#c9d4dc"/>
    <path d="M-10 0 H10 M-8.6 -5 H8.6 M-8.6 5 H8.6 M0 -10 V10 M-5 -8.6 V8.6 M5 -8.6 V8.6" stroke="#8fa0ad" stroke-width=".8"/>
    <circle class="twinkle" cx="-4" cy="-4" r="2" fill="#fff"/><circle class="twinkle" style="animation-delay:-1s" cx="4" cy="3" r="1.6" fill="#fff"/></g>`,
});

const snowman = (): Prop => ({
  r: 20, poke: 'wobble', fx: 'snow', sfx: 'tap',
  svg: `${shadow(14, 0.12)}<circle cx="0" cy="-11" r="12" fill="#fff" stroke="#c7dbe8" stroke-width="1.5"/><circle cx="0" cy="-29" r="8.5" fill="#fff" stroke="#c7dbe8" stroke-width="1.5"/>
    <circle cx="-3" cy="-31" r="1.2" fill="#1b1b1b"/><circle cx="3" cy="-31" r="1.2" fill="#1b1b1b"/><path d="M0 -28.5 L6 -27 L0 -26 Z" fill="#ff7a1a"/>
    <circle cx="0" cy="-14" r="1.2" fill="#1b1b1b"/><circle cx="0" cy="-9" r="1.2" fill="#1b1b1b"/><path d="M-8 -22 Q0 -18 8 -22 L9 -19 Q0 -15 -9 -19 Z" fill="#e8352f"/>
    <path d="M-7 -36 Q0 -46 7 -36 Z" fill="#ff7a1a"/><path d="M-9 -36 H10 L12 -34 H-9 Z" fill="#ff8f3d"/>
    <path d="M-11 -14 L-20 -21 M11 -14 L20 -22" stroke="#7a5233" stroke-width="1.6" stroke-linecap="round"/>`,
});

const sled = (): Prop => ({
  r: 18, poke: 'scuttle', sfx: 'whoosh',
  svg: `${shadow(16, 0.12)}<path d="M-16 -2 H14 Q19 -2 18 -8" stroke="#6b7d8a" stroke-width="1.8" fill="none"/><rect x="-14" y="-10" width="26" height="5" rx="1.5" fill="#e8352f"/>
    <path d="M-10 -5 V-2 M6 -5 V-2" stroke="#6b7d8a" stroke-width="1.6"/>`,
});

const icePond = (): Prop => ({
  r: 30, poke: 'splash', fx: 'sparkle', sfx: 'chime',
  svg: `<ellipse cx="0" cy="-10" rx="30" ry="12" fill="#bfe3f4" stroke="#fff" stroke-width="3"/><path d="M-18 -10 Q-4 -18 10 -9 Q16 -5 20 -12" stroke="#fff" stroke-width="1.2" fill="none" opacity=".9"/>
    <path d="M-10 -5 Q2 -1 14 -6" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/><circle class="twinkle" cx="-8" cy="-12" r="1.6" fill="#fff"/>`,
});

const drift = (): Prop => ({
  r: 18, poke: 'hop', fx: 'snow', sfx: 'dig',
  svg: `<path d="M-20 0 Q-14 -12 -4 -9 Q4 -16 12 -8 Q20 -6 20 0 Z" fill="#fff"/><path d="M-12 -2 Q0 -6 12 -2" stroke="#c7dbe8" stroke-width="1.4" fill="none"/>`,
});

const jump = (): Prop => ({
  r: 22, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(20, 0.12)}<rect x="-20" y="-26" width="3" height="26" fill="#fff"/><rect x="17" y="-26" width="3" height="26" fill="#fff"/>
    <rect x="-20" y="-18" width="40" height="3.5" fill="#fff"/><path d="M-16 -18 h6 v3.5 h-6 Z M-4 -18 h6 v3.5 h-6 Z M8 -18 h6 v3.5 h-6 Z" fill="#e8352f"/>
    <rect x="-21" y="-1" width="5" height="2" fill="#ccc"/><rect x="16" y="-1" width="5" height="2" fill="#ccc"/>`,
});

const weave = (): Prop => {
  let p = '';
  for (let i = 0; i < 5; i++) p += `<rect x="${-18 + i * 9}" y="-26" width="2.6" height="26" rx="1.2" fill="${i % 2 ? '#ffc12e' : '#fff'}"/>`;
  return { r: 22, poke: 'wobble', sfx: 'knock', svg: `${shadow(20, 0.12)}<rect x="-20" y="-1.5" width="40" height="2" fill="#ccc"/>${p}` };
};

const tunnel = (): Prop => ({
  r: 24, poke: 'hop', fx: 'heart', sfx: 'woof',
  svg: `${shadow(24, 0.12)}<path d="M-22 0 A22 20 0 0 1 22 0 Z" fill="#2f8fe0"/><path d="M-14 0 A14 13 0 0 1 14 0 Z" fill="#17375a"/>
    <path d="M-20 -8 A22 20 0 0 1 -6 -19 M6 -19 A22 20 0 0 1 20 -8" stroke="#6fbaf0" stroke-width="2" fill="none"/>
    <g transform="translate(0 -1)"><circle cx="-2" cy="-5" r="4" fill="#f2c27b"/><circle cx="-3.4" cy="-6" r=".8" fill="#1b1b1b"/><circle cx="-.4" cy="-6" r=".8" fill="#1b1b1b"/><ellipse cx="-2" cy="-3.4" rx="1.2" ry=".8" fill="#1b1b1b"/></g>`,
});

const podium = (): Prop => ({
  r: 24, poke: 'hop', fx: 'sparkle', sfx: 'chime',
  svg: `${shadow(24, 0.12)}<rect x="-8" y="-24" width="16" height="24" fill="#ffc12e"/><rect x="-24" y="-16" width="16" height="16" fill="#d6e0e6"/><rect x="8" y="-11" width="16" height="11" fill="#e3a46a"/>
    <text x="0" y="-12" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="sans-serif">1</text>
    <text x="-16" y="-5" text-anchor="middle" font-size="8" font-weight="900" fill="#fff" font-family="sans-serif">2</text>
    <text x="16" y="-2.5" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="sans-serif">3</text>`,
});

const rosette = (c: string): Prop => {
  let petals = '';
  for (let i = 0; i < 10; i++) petals += `<ellipse cx="0" cy="-6" rx="2.6" ry="4.5" fill="${c}" transform="rotate(${i * 36})"/>`;
  return {
    r: 12, poke: 'spin', fx: 'sparkle', sfx: 'chime',
    svg: `${hit(13, -12)}<path d="M-3 -8 L-6 4 L-3 2 L-1 5 Z M3 -8 L6 4 L3 2 L1 5 Z" fill="${c}"/><g transform="translate(0 -14)">${petals}<circle r="5" fill="#fff"/><circle r="3.4" fill="${c}"/></g>`,
  };
};

const trophy = (): Prop => ({
  r: 14, poke: 'hop', fx: 'sparkle', sfx: 'chime',
  svg: `${shadow(9, 0.15)}<rect x="-7" y="-4" width="14" height="4" fill="#7a5233"/><rect x="-2" y="-11" width="4" height="7" fill="#e0a417"/>
    <path d="M-9 -26 H9 Q9 -11 0 -11 Q-9 -11 -9 -26 Z" fill="#ffc12e"/><path d="M-9 -23 Q-15 -23 -13 -17 Q-11 -14 -7 -15 M9 -23 Q15 -23 13 -17 Q11 -14 7 -15" stroke="#e0a417" stroke-width="1.8" fill="none"/>
    <path d="M-5 -23 Q-5 -16 -1 -14" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6"/>`,
});

const pennants = (w: number): Prop => bunting(w, ['#ffc12e', '#fff', '#2f8fe0']);

const cake = (big = false): Prop => {
  const s = big ? 1.6 : 1;
  let candles = '';
  for (const x of [-8, 0, 8]) candles += `<rect x="${x - 1.2}" y="-36" width="2.4" height="8" fill="#fff"/><path d="M${x - 1.2} -34 l2.4 -1.6 M${x - 1.2} -31 l2.4 -1.6" stroke="#2f8fe0" stroke-width=".8"/><ellipse class="flicker" cx="${x}" cy="-38.5" rx="1.6" ry="2.6" fill="#ffb02e"/>`;
  return {
    r: 22 * s, poke: 'hop', fx: 'confetti', sfx: 'chime',
    svg: `${shadow(20 * s, 0.15)}<g transform="scale(${s})"><ellipse cx="0" cy="-1" rx="20" ry="4" fill="#fff"/><rect x="-16" y="-16" width="32" height="15" fill="#f6d5a3"/><rect x="-16" y="-17" width="32" height="5" fill="#fff"/>
      <path d="M-16 -12 q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0 q2 4 4 0" fill="#fff"/>
      <rect x="-12" y="-28" width="24" height="11" fill="#f6b8c8"/><rect x="-12" y="-29" width="24" height="4" fill="#fff"/>
      <circle cx="-8" cy="-8" r="1.2" fill="#e8352f"/><circle cx="0" cy="-6" r="1.2" fill="#2f8fe0"/><circle cx="8" cy="-8" r="1.2" fill="#ffc12e"/>${candles}</g>`,
  };
};

const cupcake = (c: string): Prop => ({
  r: 11, poke: 'hop', fx: 'confetti', sfx: 'pop',
  svg: `${shadow(7, 0.15)}<path d="M-6 0 L-7 -9 H7 L6 0 Z" fill="#c68b51"/><path d="M-6 -6 h12" stroke="#a7784a" stroke-width=".8"/><path d="M-8 -9 Q-8 -17 0 -18 Q8 -17 8 -9 Z" fill="${c}"/>
    <circle cx="0" cy="-19" r="2" fill="#e8352f"/>`,
});

const sparkleStar = (): Prop => ({
  r: 8, poke: 'spin', sfx: 'chime',
  svg: `${hit(12, -6)}<path class="twinkle" d="M0 -14 L2 -8 L8 -6 L2 -4 L0 2 L-2 -4 L-8 -6 L-2 -8 Z" fill="#fff"/>`,
});

const wellies = (c: string): Prop => ({
  r: 13, poke: 'hop', fx: 'drop', sfx: 'splash',
  svg: `${shadow(12, 0.15)}<path d="M-11 0 V-16 H-4 V-6 Q-4 -3 -1 -3 V0 Z" fill="${c}"/><path d="M2 0 V-16 H9 V-6 Q9 -3 12 -3 V0 Z" fill="${c}"/>
    <rect x="-12" y="-18" width="9" height="3" rx="1" fill="#fff" opacity=".5"/><rect x="1" y="-18" width="9" height="3" rx="1" fill="#fff" opacity=".5"/>`,
});

const tent = (a: string, b: string): Prop => ({
  r: 26, poke: 'wobble', sfx: 'rustle',
  svg: `${shadow(26, 0.18)}<path d="M-26 0 L0 -36 L26 0 Z" fill="${a}"/><path d="M0 -36 L-8 0 H8 Z" fill="${b}"/>
    <path d="M0 -36 L0 -42" stroke="#7a5233" stroke-width="2"/><path d="M0 -42 L8 -39 L0 -37 Z" fill="#e8352f"/>`,
});

const campfire = (): Prop => ({
  r: 15, poke: 'bounce', fx: 'sparkle', sfx: 'pop',
  svg: `${shadow(14, 0.2)}<g fill="#8f9aa0"><circle cx="-11" cy="-2" r="3"/><circle cx="-4" cy="0" r="3"/><circle cx="4" cy="0" r="3"/><circle cx="11" cy="-2" r="3"/></g>
    <path d="M-10 -3 L10 -8 M-10 -8 L10 -3" stroke="#7a5233" stroke-width="3.5" stroke-linecap="round"/>
    <g class="flicker"><path d="M0 -26 Q9 -14 5 -6 H-5 Q-9 -14 0 -26Z" fill="#ff8a1f"/><path d="M0 -18 Q5 -11 3 -6 H-3 Q-5 -11 0 -18Z" fill="#ffd23f"/></g>`,
});

const pumpkin = (s = 1): Prop => ({
  r: 15 * s, poke: 'wobble', fx: 'leaf', sfx: 'knock',
  svg: `${shadow(15 * s, 0.18)}<g transform="scale(${s})"><ellipse cx="-7" cy="-10" rx="8" ry="10" fill="#e07a1f"/><ellipse cx="7" cy="-10" rx="8" ry="10" fill="#e07a1f"/>
    <ellipse cx="0" cy="-10" rx="8" ry="11" fill="#f08a24"/><path d="M0 -20 Q2 -26 5 -27" stroke="#4f7a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M5 -22 Q11 -26 13 -21 Q8 -19 5 -22Z" fill="#5c9f3a"/></g>`,
});

const hay = (): Prop => ({
  r: 20, poke: 'wobble', fx: 'dirt', sfx: 'rustle',
  svg: `${shadow(20, 0.16)}<rect x="-20" y="-20" width="40" height="20" rx="4" fill="#e3bf5c"/><path d="M-20 -13 H20 M-20 -6 H20" stroke="#c39c3a" stroke-width="1.4"/>
    <path d="M-8 -20 V0 M8 -20 V0" stroke="#a8322a" stroke-width="2"/>`,
});

const pillow = (c: string): Prop => ({
  r: 16, poke: 'bounce', fx: 'heart', sfx: 'boing',
  svg: `${shadow(15, 0.14)}<path d="M-16 -2 Q-18 -10 -14 -18 Q0 -14 14 -18 Q18 -10 16 -2 Q0 2 -16 -2Z" fill="${c}"/><path d="M-10 -9 Q0 -7 10 -9" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/>`,
});

const moon = (): Prop => ({
  r: 16, poke: 'spin', fx: 'sparkle', sfx: 'chime',
  svg: `${hit(16, -24)}<g class="bob"><circle cx="0" cy="-26" r="13" fill="#fff3c4"/><circle cx="6" cy="-30" r="11" fill="#5b5a9e"/></g>`,
});


// ── Levels 81-100: bath day, a backyard barbecue, the sprinkler and a moonlit walk ──
const bathtub = (): Prop => ({
  r: 26, poke: 'wobble', fx: 'drop', sfx: 'splash',
  say: ['Bath day! Micah is not a fan.', 'She’s already plotting her escape.', 'Lobster in the tub!'],
  svg: `${shadow(26, 0.15)}<path d="M-20 -1 L-18 4 M18 -1 L20 4" stroke="#c9a03a" stroke-width="3" stroke-linecap="round"/>
    <path d="M-26 -20 H26 Q26 0 10 0 H-10 Q-26 0 -26 -20 Z" fill="#ffffff" stroke="#9fc3d6" stroke-width="2"/>
    <g class="bob"><circle cx="-14" cy="-22" r="7" fill="#e8f8ff" stroke="#9fd8ec"/><circle cx="-3" cy="-26" r="8.5" fill="#e8f8ff" stroke="#9fd8ec"/><circle cx="10" cy="-23" r="7" fill="#e8f8ff" stroke="#9fd8ec"/><circle cx="19" cy="-30" r="3" fill="#e8f8ff" stroke="#9fd8ec"/><circle cx="-20" cy="-34" r="2.4" fill="#e8f8ff" stroke="#9fd8ec"/></g>
    <path d="M-26 -20 H26" stroke="#9fc3d6" stroke-width="3" stroke-linecap="round"/>`,
});

const duckToy = (): Prop => ({
  r: 10, poke: 'hop', fx: 'drop', sfx: 'boing',
  svg: `${shadow(8, 0.12)}<g class="bob"><ellipse cx="0" cy="-5" rx="8" ry="5" fill="#ffd23f"/><circle cx="5" cy="-11" r="4" fill="#ffd23f"/><path d="M8.5 -11.5 L12 -10.5 L8.5 -9.5 Z" fill="#ff8a1f"/><circle cx="5.8" cy="-12" r=".9" fill="#1b1b1b"/></g>`,
});

const grill = (): Prop => ({
  r: 20, poke: 'bounce', fx: 'sparkle', sfx: 'pop',
  say: ['Hot dogs! Micah will eat anything.', 'She has been sitting by the grill for an hour.', 'Nobody drop a hot dog. Too late.'],
  svg: `${shadow(16, 0.18)}<path d="M-10 0 L-6 -14 M10 0 L6 -14" stroke="#3a3f45" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M-17 -16 H17 Q17 -2 0 -2 Q-17 -2 -17 -16 Z" fill="#2b2f35"/>
    <path d="M-14 -17 H14" stroke="#8f9aa0" stroke-width="2"/>
    <rect x="-11" y="-21" width="9" height="3.6" rx="1.8" fill="#c96a3a"/><rect x="1" y="-21" width="9" height="3.6" rx="1.8" fill="#c96a3a"/>
    <g class="flicker"><path d="M-6 -24 q2 -5 0 -9 M4 -24 q2 -5 0 -9" stroke="#d6dde2" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></g>`,
});

const picnic = (): Prop => ({
  r: 24, poke: 'wobble', fx: 'heart', sfx: 'knock',
  svg: `${shadow(22, 0.12)}<path d="M-24 -8 L-16 -18 H20 L26 -8 Z" fill="#e8352f"/>
    <path d="M-20 -13 H23 M-10 -18 L-14 -8 M2 -18 L1 -8 M14 -18 L16 -8" stroke="#fff" stroke-width="1.6" opacity=".85"/>
    <circle cx="-6" cy="-15" r="3" fill="#fff"/><rect x="8" y="-17" width="7" height="4" rx="2" fill="#c96a3a"/>`,
});

const sprinkler = (): Prop => ({
  r: 18, poke: 'splash', fx: 'drop', sfx: 'splash',
  say: ['Run through! Shake off! Run through again!', 'Micah vs. the sprinkler: round 12.'],
  svg: `${shadow(8, 0.12)}<rect x="-4" y="-6" width="8" height="6" rx="2" fill="#ffc12e"/><rect x="-1.5" y="-12" width="3" height="7" fill="#e8352f"/>
    <g class="flicker" fill="none" stroke="#7fd0ec" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 4">
    <path d="M0 -12 Q-14 -30 -22 -8"/><path d="M0 -12 Q14 -30 22 -8"/><path d="M0 -12 Q-4 -34 -10 -12"/><path d="M0 -12 Q4 -34 10 -12"/></g>`,
});

const firefly = (): Prop => ({
  r: 12, poke: 'flyoff', fx: 'sparkle', sfx: 'chime',
  svg: `${hit(12, -22)}<g class="bob"><circle cx="0" cy="-22" r="7" fill="#fff3a0" opacity=".3"/><circle cx="0" cy="-22" r="3" fill="#ffe14d"/></g>`,
});

// ── Neighbourhood Walk: the streets on Micah's daily walk ──
const yoshi = (): Prop => ({
  r: 20, poke: 'hop', fx: 'heart', sfx: 'boing', say: YOSHI_LINES,
  svg: `${shadow(16, 0.16)}<g transform="scale(.82)">${YOSHI}</g>`,
});
const house = (wall: string, roof: string, door = '#e8352f'): Prop => ({
  r: 36, poke: 'wobble', fx: 'leaf', sfx: 'knock',
  svg: `${shadow(34, 0.16)}
    <rect x="-26" y="-36" width="52" height="36" fill="${wall}" stroke="#0003" stroke-width="1.5"/>
    <path d="M-32 -34 L0 -60 L32 -34 Z" fill="${roof}" stroke="#0004" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="12" y="-56" width="7" height="12" fill="${roof}" stroke="#0004" stroke-width="1"/>
    <rect x="-20" y="-28" width="12" height="11" fill="#cfe6f5" stroke="#fff" stroke-width="2"/><path d="M-14 -28 V-17 M-20 -22.5 H-8" stroke="#fff" stroke-width="1.2"/>
    <rect x="8" y="-28" width="12" height="11" fill="#ffe7a3" stroke="#fff" stroke-width="2"/><path d="M14 -28 V-17 M8 -22.5 H20" stroke="#fff" stroke-width="1.2"/>
    <rect x="-5" y="-18" width="10" height="18" rx="1" fill="${door}"/><circle cx="2.5" cy="-9" r="1" fill="#ffc12e"/>`,
});
const mailbox = (): Prop => ({
  r: 14, poke: 'hop', sfx: 'knock',
  say: ['Mail’s here. Micah suspects the mail carrier, as always.', 'Micah checked the mailbox. Nothing for her. Rude.', 'The little flag is up. Micah barks at it, just in case.'],
  svg: `${shadow(8, 0.15)}<rect x="-1.6" y="-22" width="3.2" height="22" fill="#6b4529"/>
    <path d="M-10 -22 V-32 Q-10 -38 0 -38 Q10 -38 10 -32 V-22 Z" fill="#2f8fe0" stroke="#1f5f9e" stroke-width="1.3"/>
    <rect x="10" y="-36" width="2" height="10" fill="#e8352f"/><rect x="10" y="-36" width="6" height="4" fill="#e8352f"/>`,
});
const leafPile = (): Prop => ({
  r: 20, poke: 'bounce', fx: 'leaf', sfx: 'rustle',
  say: ['A perfect leaf pile. Micah jumped in. It is now a leaf carpet.', 'Somebody raked this. Micah is very sorry. (She is not sorry.)', 'Crunch crunch crunch.'],
  svg: `${shadow(20, 0.14)}<path d="M-22 0 Q-18 -16 -4 -18 Q8 -24 16 -14 Q24 -10 22 0 Z" fill="#e8892f"/>
    <circle cx="-10" cy="-10" r="3" fill="#d9541f"/><circle cx="4" cy="-15" r="3" fill="#ffc12e"/><circle cx="12" cy="-6" r="3" fill="#c96a1f"/><circle cx="-2" cy="-5" r="2.6" fill="#ffc12e"/><circle cx="-16" cy="-3" r="2.4" fill="#a8501a"/>`,
});
const gnome = (): Prop => ({
  r: 10, poke: 'spin', sfx: 'boing',
  say: ['A garden gnome. Micah has questions.', 'The gnome hasn’t moved. Micah is keeping an eye on him anyway.'],
  svg: `${shadow(7, 0.15)}<path d="M-6 0 L-5 -10 H5 L6 0 Z" fill="#2f8fe0"/><path d="M-5 -10 Q0 -6 5 -10 L3 -14 H-3 Z" fill="#fff"/>
    <circle cx="0" cy="-15" r="3.4" fill="#f3c9a8"/><path d="M-5 -16 L0 -30 L5 -16 Z" fill="#e8352f"/>`,
});
const catWindow = (): Prop => ({
  r: 22, poke: 'hop', sfx: 'bark',
  say: ['The neighbour’s cat. Micah’s sworn enemy since forever.', 'The cat yawns. Micah takes this personally.', 'Micah: BARK. The cat: blinks slowly.'],
  svg: `${shadow(20, 0.14)}<rect x="-20" y="-34" width="40" height="34" fill="#d9c7a3" stroke="#0003" stroke-width="1.5"/>
    <rect x="-12" y="-28" width="24" height="18" fill="#cfe6f5" stroke="#fff" stroke-width="2.4"/>
    <g class="critter"><ellipse cx="0" cy="-12" rx="7" ry="4" fill="#e8892f"/><circle cx="0" cy="-17" r="5" fill="#e8892f"/>
    <path d="M-4.5 -20 L-3.5 -25 L-1 -21 Z M4.5 -20 L3.5 -25 L1 -21 Z" fill="#e8892f"/>
    <path d="M-3 -17.5 h2 M1 -17.5 h2" stroke="#2b2b2b" stroke-width="1.1" stroke-linecap="round"/></g>
    <rect x="-14" y="-10" width="28" height="3" fill="#fff"/>`,
});
const bin = (): Prop => ({
  r: 10, poke: 'wobble', sfx: 'knock',
  say: ['Bin day. Micah would like to inspect the contents.', 'Something smells AMAZING in there.'],
  svg: `${shadow(8, 0.15)}<path d="M-7 0 L-8 -20 H8 L7 0 Z" fill="#23925a" stroke="#176a40" stroke-width="1.2"/><rect x="-9" y="-23" width="18" height="4" rx="1" fill="#1b7a4a"/>`,
});
const homePorch = (): Prop => ({
  r: 44, poke: 'hop', fx: 'heart', sfx: 'bark',
  say: ['Home! Paws wiped, bowl full, best spot on the couch.', 'Micah’s front door. Every walk ends here.', 'The doormat says MICAH. She agrees.'],
  svg: `${shadow(42, 0.18)}
    <rect x="-38" y="-46" width="76" height="46" fill="#f2c27b" stroke="#b5833f" stroke-width="2"/>
    <path d="M-44 -44 L0 -76 L44 -44 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2" stroke-linejoin="round"/>
    <rect x="-30" y="-36" width="16" height="14" fill="#ffe7a3" stroke="#fff" stroke-width="2.4"/>
    <rect x="14" y="-36" width="16" height="14" fill="#ffe7a3" stroke="#fff" stroke-width="2.4"/>
    <rect x="-8" y="-26" width="16" height="26" rx="2" fill="#173a52"/><circle cx="4" cy="-13" r="1.4" fill="#ffc12e"/>
    <path d="M-10 -32 Q0 -38 10 -32" fill="none" stroke="#23925a" stroke-width="3"/>
    <rect x="-14" y="0" width="28" height="7" rx="1.5" fill="#a8743a"/>
    <text x="0" y="5.6" text-anchor="middle" font-size="5.4" font-weight="900" fill="#fff" font-family="sans-serif">MICAH</text>`,
});

// ── Levels 101-150: a road trip, from the lighthouse to the lake ──
const lighthouse = (): Prop => ({
  r: 26, poke: 'glow', fx: 'sparkle', sfx: 'chime',
  say: ['A lighthouse in lobster red. Micah approves.', 'The light goes round and round. So does Micah.', 'Ships, beware: there is a dog on this cliff.'],
  svg: `${shadow(20, 0.2)}<path d="M-16 0 L-12 -10 H12 L16 0 Z" fill="#8f9aa0"/>
    <path d="M-11 -10 L-7 -66 H7 L11 -10 Z" fill="#fff"/>
    <path d="M-10.3 -20 L-9.6 -30 H9.6 L10.3 -20 Z M-9 -40 L-8.3 -50 H8.3 L9 -40 Z M-7.7 -60 L-7 -66 H7 L7.7 -60 Z" fill="#e8352f"/>
    <rect x="-4" y="-18" width="8" height="8" rx="4" fill="#173a52"/>
    <rect x="-9" y="-70" width="18" height="4" fill="#2d3e4a"/>
    <rect x="-6" y="-80" width="12" height="10" fill="#ffe28a" stroke="#2d3e4a" stroke-width="1.6"/>
    <circle class="lamp-glow" cx="0" cy="-75" r="9" fill="#fff3a0" opacity=".6"/>
    <path d="M-8 -80 L0 -88 L8 -80 Z" fill="#e8352f"/>`,
});
const gull = (): Prop => ({
  r: 12, poke: 'flyoff', sfx: 'tweet',
  say: ['A seagull eyeing Micah’s snack.', 'Squawk!'],
  svg: `${shadow(6, 0.15)}${hit(13, -7)}<g class="peck"><ellipse cx="0" cy="-7" rx="8" ry="5.5" fill="#fff" stroke="#c9d2d8"/>
    <path d="M-6 -9 Q0 -4 6 -8 L2 -11 Z" fill="#9aa7b0"/><circle cx="6" cy="-12" r="4" fill="#fff" stroke="#c9d2d8"/>
    <path d="M9.6 -12 L14 -11 L9.6 -10 Z" fill="#ffc12e"/><circle cx="7" cy="-13" r=".9" fill="#1b1b1b"/>
    <path d="M-1 -1 V1 M2 -1 V1" stroke="#ffb02e" stroke-width="1"/></g>`,
});
const buoy = (): Prop => ({
  r: 10, poke: 'bounce', fx: 'drop', sfx: 'boing',
  svg: `${shadow(7, 0.15)}<g class="bob"><path d="M-6 -2 L-4 -16 H4 L6 -2 Z" fill="#e8352f"/><path d="M-5 -9 H5" stroke="#fff" stroke-width="3"/>
    <rect x="-1" y="-22" width="2" height="6" fill="#2d3e4a"/><circle cx="0" cy="-23" r="2" fill="#ffc12e"/></g>`,
});
const lobsterTrap = (): Prop => ({
  r: 16, poke: 'wobble', sfx: 'knock',
  say: ['A lobster trap. Micah checks it for cousins.', 'Empty. The lobsters must be out.'],
  svg: `${shadow(16, 0.15)}<path d="M-16 0 V-14 Q0 -26 16 -14 V0 Z" fill="#c9a66b" stroke="#7a5a33" stroke-width="1.6"/>
    <path d="M-16 -7 H16 M-8 0 V-20 M0 0 V-22 M8 0 V-20" stroke="#7a5a33" stroke-width="1.2"/>
    <circle cx="16" cy="-6" r="3.2" fill="#e8352f"/>`,
});
const cliffEdge = (w: number, b: Band): string => {
  // A rocky drop down to the sea along the left side of the area.
  let d = `M0 ${b.top} L26 ${b.top}`;
  for (let y = b.top; y < b.bottom; y += 30) d += ` L${30 + ((y / 30) % 3) * 6} ${y + 15} L24 ${y + 30}`;
  d += ` L0 ${b.bottom} Z`;
  return `<rect x="0" y="${b.top}" width="22" height="${b.bottom - b.top}" fill="#2f8fc4"/><path d="${d}" fill="#8f9aa0"/><path d="${d}" fill="#6f7a82" transform="translate(-6 0)"/>
    <g class="foam"><path d="M4 ${b.top} V${b.bottom}" stroke="#fff" stroke-width="3" stroke-dasharray="10 18" opacity=".8"/></g>${w > 0 ? '' : ''}`;
};

const saleTable = (): Prop => ({
  r: 24, poke: 'wobble', fx: 'dirt', sfx: 'knock',
  say: ['Everything 25 cents. The raccoons drive a hard bargain.', 'One boot, slightly chewed. Micah’s already interested.', 'Micah would like one of everything.'],
  svg: `${shadow(22, 0.15)}<path d="M-20 0 V-16 M20 0 V-16" stroke="#6b4529" stroke-width="2.4"/>
    <rect x="-24" y="-19" width="48" height="4" fill="#a7784a"/>
    <path d="M-20 -19 L-18 -27 H-10 L-8 -19 Z" fill="#6f8a3e"/><circle cx="2" cy="-23" r="4.5" fill="#ffc12e" stroke="#c49a1a"/>
    <path d="M10 -19 V-30 H18 V-19 Z" fill="#fff4e6" stroke="#8a7a66"/><path d="M10 -26 H18" stroke="#e8352f" stroke-width="2"/>
    <rect x="-4" y="-38" width="22" height="9" rx="1" fill="#fff" stroke="#8a7a66" transform="rotate(-6 7 -33)"/>
    <text x="7" y="-31" text-anchor="middle" font-size="6" font-weight="900" fill="#e8352f" font-family="sans-serif" transform="rotate(-6 7 -33)">SALE</text>`,
});
const tire = (): Prop => ({
  r: 13, poke: 'bounce', sfx: 'boing',
  svg: `${shadow(12, 0.15)}<ellipse cx="0" cy="-6" rx="12" ry="6" fill="#2b2b2b"/><ellipse cx="0" cy="-7" rx="6" ry="2.6" fill="#7d8f5a"/>
    <path d="M-10 -9 Q0 -12 10 -9" stroke="#4a4a4a" stroke-width="1.2" fill="none"/>`,
});
const raccoon = (): Prop => ({
  r: 14, poke: 'hop', sfx: 'tweet',
  say: ['A raccoon. Running the yard sale, apparently.', 'The raccoon offers Micah a sock. Deal.', 'No refunds, says the raccoon.'],
  svg: `${shadow(10, 0.15)}<g transform="translate(0 -6) scale(1.3)">${raccoonBit()}</g>`,
});
const parcelStack = (): Prop => ({
  r: 18, poke: 'wobble', sfx: 'knock',
  say: ['Parcels! Micah signs for them with her nose.', 'Was this one for Micah? It is now.'],
  svg: `${shadow(18, 0.15)}<rect x="-16" y="-16" width="20" height="16" fill="#c98f52" stroke="#6e4a26" stroke-width="1.4"/>
    <rect x="2" y="-13" width="15" height="13" fill="#b07a42" stroke="#6e4a26" stroke-width="1.4"/>
    <rect x="-10" y="-30" width="16" height="14" fill="#d9a066" stroke="#6e4a26" stroke-width="1.4"/>
    <path d="M-16 -9 H4 M-2 -30 V-16 M2 -7 H17" stroke="#e6c08a" stroke-width="2.4"/><path d="M-6 -24 h6" stroke="#e8352f" stroke-width="2"/>`,
});

const cactus = (s = 1): Prop => ({
  r: 18 * s, poke: 'wobble', sfx: 'knock',
  say: ['A cactus. Micah sniffed it. Once.', 'Pointy. Micah keeps her distance.'],
  svg: `${shadow(10 * s, 0.18)}<g transform="scale(${s})"><rect x="-5" y="-44" width="10" height="44" rx="5" fill="#3f9a5a"/>
    <path d="M-5 -20 H-12 Q-15 -20 -15 -24 V-34" stroke="#3f9a5a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M5 -26 H11 Q14 -26 14 -30 V-38" stroke="#3f9a5a" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M-1 -40 V-4 M2 -40 V-4" stroke="#2f7a46" stroke-width="1"/>
    <circle cx="0" cy="-46" r="3" fill="#ff8fb1"/></g>`,
});
const mesa = (): Prop => ({
  r: 40, poke: 'wobble', fx: 'sand', sfx: 'knock',
  svg: `${shadow(36, 0.12)}<path d="M-40 0 L-30 -26 L-24 -30 H20 L28 -24 L40 0 Z" fill="#c8572a"/>
    <path d="M-24 -30 H20 L23 -27 H-27 Z" fill="#e0794a"/><path d="M-34 -12 H34 M-30 -20 H30" stroke="#a8401a" stroke-width="2" opacity=".6"/>`,
});
const tumbleweed = (): Prop => ({
  r: 12, poke: 'scuttle', fx: 'sand', sfx: 'whoosh',
  say: ['A tumbleweed! Micah gave chase. The tumbleweed won.'],
  svg: `${shadow(9, 0.12)}<g class="scuttle" fill="none" stroke="#b08a4a" stroke-width="1.3"><circle cx="0" cy="-9" r="9"/>
    <path d="M-8 -12 Q0 -2 8 -14 M-6 -3 Q0 -16 7 -4 M-9 -8 Q2 -10 9 -8"/></g>`,
});
const camper = (): Prop => ({
  r: 30, poke: 'hop', fx: 'heart', sfx: 'bark',
  say: ['Road trip! Micah called the window seat.', 'Are we there yet? Micah asks every five minutes.'],
  svg: `${shadow(28, 0.18)}<rect x="-28" y="-30" width="54" height="24" rx="8" fill="#fff4e6" stroke="#8a7a66" stroke-width="1.4"/>
    <rect x="-28" y="-18" width="54" height="12" rx="4" fill="#e8352f"/>
    <rect x="-22" y="-27" width="12" height="8" rx="2" fill="#cfe6f5"/><rect x="-6" y="-27" width="12" height="8" rx="2" fill="#cfe6f5"/><path d="M12 -27 H22 Q26 -27 26 -20 H12 Z" fill="#cfe6f5"/>
    <circle cx="-16" cy="-5" r="5.5" fill="#2b2b2b"/><circle cx="14" cy="-5" r="5.5" fill="#2b2b2b"/><circle cx="-16" cy="-5" r="2" fill="#c9cdd0"/><circle cx="14" cy="-5" r="2" fill="#c9cdd0"/>`,
});

const barn = (): Prop => ({
  r: 38, poke: 'wobble', fx: 'dirt', sfx: 'knock',
  say: ['The big red barn. It smells incredible, says Micah.', 'Moo? Micah isn’t sure what that was.'],
  svg: `${shadow(36, 0.18)}<path d="M-32 0 V-36 L-22 -52 H22 L32 -36 V0 Z" fill="#c42a25" stroke="#8a1c18" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M-32 -36 H32" stroke="#fff" stroke-width="2.6"/><path d="M-22 -52 H22" stroke="#fff" stroke-width="2.6"/>
    <rect x="-12" y="-26" width="24" height="26" fill="#a3201c" stroke="#fff" stroke-width="2.4"/><path d="M-12 -26 L12 0 M12 -26 L-12 0" stroke="#fff" stroke-width="2"/>
    <rect x="-5" y="-46" width="10" height="8" fill="#ffe7a3" stroke="#fff" stroke-width="1.6"/>`,
});
const chicken = (): Prop => ({
  r: 10, poke: 'hop', fx: 'heart', sfx: 'tweet',
  say: ['A chicken. Micah has never been so interested in anything.', 'Bawk!'],
  svg: `${shadow(6, 0.15)}${hit(12, -7)}<g class="peck"><ellipse cx="0" cy="-7" rx="7" ry="6" fill="#fff"/><circle cx="5" cy="-12" r="3.6" fill="#fff"/>
    <path d="M4 -16 q1 -3 2 0 q1 -3 2 0" fill="#e8352f"/><path d="M8.5 -12 L11 -11 L8.5 -10 Z" fill="#ffb02e"/><circle cx="6" cy="-12.5" r=".8" fill="#1b1b1b"/>
    <path d="M-7 -9 L-11 -13 L-9 -7 Z" fill="#fff"/><path d="M-1 -1 V1 M2 -1 V1" stroke="#ffb02e" stroke-width="1"/></g>`,
});
const sheep = (): Prop => ({
  r: 14, poke: 'hop', sfx: 'boing',
  say: ['A sheep. Basically a cloud with legs.', 'Micah tried to herd it. The sheep did not agree.'],
  svg: `${shadow(11, 0.15)}<rect x="-7" y="-7" width="2.4" height="7" fill="#2b2b2b"/><rect x="4" y="-7" width="2.4" height="7" fill="#2b2b2b"/>
    <g fill="#f6f2ea"><circle cx="-6" cy="-11" r="5"/><circle cx="0" cy="-13" r="5.5"/><circle cx="6" cy="-11" r="5"/><circle cx="-2" cy="-8" r="5"/><circle cx="4" cy="-8" r="4.5"/></g>
    <ellipse cx="11" cy="-12" rx="3.6" ry="4.4" fill="#2b2b2b"/><circle cx="12" cy="-13" r=".8" fill="#fff"/>`,
});
const corn = (): Prop => {
  let s = '';
  for (let i = 0; i < 4; i++) s += `<g transform="translate(${-12 + i * 8} 0)"><path d="M0 0 V-30" stroke="#6f9a3a" stroke-width="2.4"/><path d="M0 -12 Q-7 -16 -9 -22 M0 -18 Q7 -22 9 -28" stroke="#7fb04a" stroke-width="2.2" fill="none"/><ellipse cx="2.4" cy="-22" rx="2" ry="5" fill="#ffd23f"/></g>`;
  return { r: 18, poke: 'rustle', fx: 'leaf', sfx: 'rustle', svg: `${shadow(16, 0.12)}<g class="sway">${s}</g>` };
};
const tractor = (): Prop => ({
  r: 24, poke: 'hop', sfx: 'knock',
  svg: `${shadow(22, 0.18)}<rect x="-12" y="-22" width="20" height="12" fill="#23925a"/><path d="M-2 -22 V-34 H10 V-22" fill="#cfe6f5" stroke="#23925a" stroke-width="3"/>
    <rect x="8" y="-18" width="12" height="8" fill="#23925a"/><rect x="14" y="-26" width="2.4" height="8" fill="#2b2b2b"/>
    <circle cx="-8" cy="-8" r="9" fill="#2b2b2b"/><circle cx="-8" cy="-8" r="4" fill="#ffc12e"/><circle cx="15" cy="-5" r="5" fill="#2b2b2b"/><circle cx="15" cy="-5" r="2" fill="#ffc12e"/>`,
});

const coral = (c: string): Prop => ({
  r: 16, poke: 'wobble', fx: 'bubble', sfx: 'pop',
  svg: `${shadow(12, 0.15)}<g class="sway" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round">
    <path d="M0 0 V-18 M0 -12 Q-8 -14 -9 -24 M0 -16 Q7 -18 8 -28 M-9 -24 Q-14 -26 -14 -30 M8 -28 Q12 -30 13 -34"/></g>`,
});
const kelp = (): Prop => ({
  r: 14, poke: 'rustle', fx: 'bubble', sfx: 'rustle',
  svg: `<g class="sway"><path d="M-4 0 Q-10 -14 -3 -26 Q4 -38 -2 -52" stroke="#2f8f5a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M5 0 Q11 -12 5 -24 Q0 -34 6 -44" stroke="#3fa96a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="-8" cy="-20" rx="4" ry="2" fill="#3fa96a"/><ellipse cx="9" cy="-30" rx="4" ry="2" fill="#2f8f5a"/></g>`,
});
const fish = (c: string): Prop => ({
  r: 12, poke: 'flyoff', fx: 'bubble', sfx: 'pop',
  svg: `${hit(13, -20)}<g class="flutter"><g transform="translate(0 -20)"><ellipse rx="8" ry="5" fill="${c}"/><path d="M-7 0 L-13 -5 V5 Z" fill="${c}"/>
    <circle cx="4" cy="-1" r="1.4" fill="#fff"/><circle cx="4.3" cy="-1" r=".7" fill="#111"/><path d="M-1 -4 V4" stroke="#fff" stroke-width="1.2" opacity=".6"/></g></g>`,
});
const chest = (): Prop => ({
  r: 18, poke: 'hop', fx: 'sparkle', sfx: 'chime',
  say: ['Treasure! It’s full of… tennis balls. Perfect.', 'Micah found the treasure. She buried it again.'],
  svg: `${shadow(16, 0.2)}<rect x="-15" y="-16" width="30" height="16" fill="#8a5a26" stroke="#4f3a26" stroke-width="1.4"/>
    <path d="M-15 -16 Q0 -30 15 -16 Z" fill="#a7784a" stroke="#4f3a26" stroke-width="1.4"/>
    <path d="M-15 -10 H15 M-8 -16 V0 M8 -16 V0" stroke="#ffc12e" stroke-width="2"/><rect x="-3" y="-14" width="6" height="6" fill="#ffc12e"/>
    <circle cx="-6" cy="-24" r="3" fill="#cde33b"/><circle cx="3" cy="-25" r="3" fill="#cde33b"/>`,
});
const jelly = (): Prop => ({
  r: 12, poke: 'float', sfx: 'pop',
  svg: `${hit(12, -26)}<g class="bob"><path d="M-8 -26 Q0 -40 8 -26 Z" fill="#ff9cc8" opacity=".85"/>
    <path d="M-6 -26 q1 6 -1 10 M-2 -26 q1 7 -1 12 M2 -26 q1 6 -1 10 M6 -26 q1 7 -1 12" stroke="#ff9cc8" stroke-width="1.4" fill="none"/></g>`,
});

const van = (): Prop => ({
  r: 30, poke: 'hop', sfx: 'knock',
  say: ['The delivery van! Micah’s favourite visitor. Or enemy. Hard to say.', 'Beep beep. Micah has notes for the driver.'],
  svg: `${shadow(28, 0.18)}<path d="M-28 -6 V-34 H14 L26 -22 V-6 Z" fill="#fff" stroke="#8a95a0" stroke-width="1.4"/>
    <path d="M14 -32 L24 -22 H14 Z" fill="#cfe6f5"/><rect x="-28" y="-18" width="42" height="4" fill="#e8352f"/>
    <path d="M-10 -28 l4 -3 l2 3 l-4 3 Z M-2 -28 l4 -3 l2 3 l-4 3 Z" fill="#c98f52"/>
    <circle cx="-16" cy="-5" r="5.5" fill="#2b2b2b"/><circle cx="16" cy="-5" r="5.5" fill="#2b2b2b"/><circle cx="-16" cy="-5" r="2" fill="#c9cdd0"/><circle cx="16" cy="-5" r="2" fill="#c9cdd0"/>`,
});
const pallet = (): Prop => ({
  r: 20, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(20, 0.15)}<rect x="-20" y="-5" width="40" height="5" fill="#c9a66b" stroke="#8a6a3a"/><path d="M-14 -5 V0 M0 -5 V0 M14 -5 V0" stroke="#8a6a3a" stroke-width="3"/>
    <rect x="-16" y="-21" width="16" height="16" fill="#c98f52" stroke="#6e4a26" stroke-width="1.4"/><rect x="0" y="-19" width="16" height="14" fill="#b07a42" stroke="#6e4a26" stroke-width="1.4"/>
    <path d="M-16 -13 H0 M8 -19 V-5" stroke="#e6c08a" stroke-width="2.2"/>`,
});
const cone = (): Prop => ({
  r: 9, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(8, 0.15)}<rect x="-8" y="-2" width="16" height="2.6" fill="#e05a1a"/><path d="M-5 -2 L0 -18 L5 -2 Z" fill="#ff7a1a"/><path d="M-3.4 -7 H3.4 M-2 -12 H2" stroke="#fff" stroke-width="2"/>`,
});
const concreteLines = (w: number, b: Band): string => {
  let s = '';
  for (let y = b.top + 40; y < b.bottom - 10; y += 70) s += `<path d="M0 ${y} H${w}" stroke="#a5aab3" stroke-width="2"/>`;
  for (let x = 30; x < w; x += 90) s += `<path d="M${x} ${b.top} V${b.bottom}" stroke="#a5aab3" stroke-width="1.4" opacity=".7"/>`;
  return s + `<path d="M${w - 30} ${b.top + 20} V${b.bottom - 20}" stroke="#ffc12e" stroke-width="4" stroke-dasharray="18 14" opacity=".8"/>`;
};

const bridge = (): Prop => ({
  r: 34, poke: 'wobble', fx: 'petal', sfx: 'knock',
  say: ['The red bridge. Micah trots over it like a show dog.', 'The fish under the bridge are VERY interested in Micah.'],
  svg: `${shadow(32, 0.1)}<ellipse cx="0" cy="-3" rx="34" ry="8" fill="#5fb8d6"/>
    <path d="M-32 -2 Q0 -30 32 -2" stroke="#c42a25" stroke-width="6" fill="none"/>
    <path d="M-28 -6 Q0 -38 28 -6" stroke="#e8352f" stroke-width="2.6" fill="none"/>
    <path d="M-20 -14 V-22 M-10 -19 V-30 M0 -21 V-32 M10 -19 V-30 M20 -14 V-22" stroke="#e8352f" stroke-width="2.4"/>`,
});
const koiPond = (): Prop => ({
  r: 32, poke: 'splash', fx: 'drop', sfx: 'splash',
  say: ['Big orange fish. Micah would like to be friends. Or eat them.', 'The fish blow bubbles at Micah.'],
  svg: `<ellipse cx="0" cy="-12" rx="32" ry="14" fill="#3f9fd0" stroke="#9ad2ef" stroke-width="3"/>
    <g class="scuttle"><ellipse cx="-10" cy="-12" rx="6" ry="2.6" fill="#ff8a1f"/><path d="M-16 -12 l-4 -3 v6 Z" fill="#ff8a1f"/></g>
    <g class="scuttle" style="animation-delay:-1.5s"><ellipse cx="10" cy="-15" rx="5" ry="2.2" fill="#fff"/><circle cx="11" cy="-15.5" r="1.6" fill="#e8352f"/><path d="M5 -15 l-4 -2.5 v5 Z" fill="#fff"/></g>
    <circle cx="16" cy="-6" r="4" fill="#4fa55a"/><circle cx="-20" cy="-18" r="3.2" fill="#4fa55a"/>`,
});
const petal = (_r: R, x: number, y: number) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.6" ry="1.6" fill="#ffc0d6" transform="rotate(${Math.round((x * 7 + y) % 180)} ${f(x)} ${f(y)})"/>`;

const peak = (): Prop => ({
  r: 44, poke: 'wobble', fx: 'snow', sfx: 'whoosh',
  say: ['The summit! Micah wants to go up. Then down. Then up again.'],
  svg: `<path d="M-46 0 L-12 -60 L2 -44 L14 -66 L46 0 Z" fill="#7b8794"/><path d="M-12 -60 L2 -44 L14 -66 L46 0 H20 Z" fill="#66727f"/>
    <path d="M-20 -46 L-12 -60 L-4 -50 L-8 -46 L-12 -50 Z M6 -54 L14 -66 L24 -48 L18 -50 L14 -46 L10 -52 Z" fill="#fff"/>`,
});
const cairn = (): Prop => ({
  r: 10, poke: 'wobble', sfx: 'knock',
  say: ['Someone stacked these rocks. Micah would like to un-stack them.'],
  svg: `${shadow(9, 0.15)}<ellipse cx="0" cy="-3" rx="9" ry="4" fill="#9aa5ad"/><ellipse cx="0" cy="-9" rx="7" ry="3.4" fill="#b3bdc4"/><ellipse cx="0" cy="-14" rx="5" ry="2.8" fill="#8f9aa0"/><ellipse cx="0" cy="-18.5" rx="3" ry="2" fill="#c4cdd3"/>`,
});
const goat = (): Prop => ({
  r: 14, poke: 'hop', sfx: 'boing',
  say: ['A mountain goat. It climbs better than Micah. She is furious.', 'Baaa. The goat is not scared of Micah at all.'],
  svg: `${shadow(11, 0.15)}<rect x="-7" y="-8" width="2.4" height="8" fill="#5a4b40"/><rect x="5" y="-8" width="2.4" height="8" fill="#5a4b40"/>
    <ellipse cx="0" cy="-12" rx="10" ry="6" fill="#f2ede4"/><circle cx="10" cy="-18" r="4.4" fill="#f2ede4"/>
    <path d="M8 -22 Q6 -28 2 -27 M11 -22 Q11 -28 8 -29" stroke="#8a7a66" stroke-width="1.6" fill="none"/>
    <path d="M12 -14 l1 5 l-2 -1 Z" fill="#f2ede4"/><circle cx="11.5" cy="-19" r=".9" fill="#111"/>`,
});

const ferris = (): Prop => {
  let spokes = '', cars = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * Math.PI / 180;
    spokes += `<path d="M0 0 L${f(Math.cos(a) * 30)} ${f(Math.sin(a) * 30)}" stroke="#fff" stroke-width="1.6"/>`;
    cars += `<rect x="${f(Math.cos(a) * 30 - 4)}" y="${f(Math.sin(a) * 30 - 3)}" width="8" height="7" rx="2" fill="${PARTY[i % 5]}"/>`;
  }
  return {
    r: 36, poke: 'glow', fx: 'confetti', sfx: 'chime',
    say: ['The Ferris wheel! Micah prefers the ground.', 'Round and round. Micah watches every car.'],
    svg: `${shadow(26, 0.15)}<path d="M-20 0 L0 -40 L20 0" stroke="#2d3e4a" stroke-width="3" fill="none"/>
      <g transform="translate(0 -40)"><g class="spin-slow"><circle r="30" fill="none" stroke="#e8352f" stroke-width="3"/>${spokes}${cars}</g><circle r="3" fill="#ffc12e"/></g>`,
  };
};
const bigTop = (): Prop => ({
  r: 32, poke: 'wobble', fx: 'confetti', sfx: 'tap',
  svg: `${shadow(30, 0.16)}<path d="M-30 0 V-20 L0 -46 L30 -20 V0 Z" fill="#fff"/>
    <path d="M-30 -20 L0 -46 L-14 -20 Z M-2 -20 L0 -46 L12 -20 Z M30 -20 L0 -46 L24 -20 Z" fill="#e8352f"/>
    <path d="M-24 0 V-20 M-12 0 V-20 M0 0 V-20 M12 0 V-20 M24 0 V-20" stroke="#e8352f" stroke-width="5"/>
    <path d="M-6 0 V-14 Q0 -18 6 -14 V0 Z" fill="#173a52"/><path d="M0 -46 V-54" stroke="#2d3e4a" stroke-width="1.6"/><path d="M0 -54 L8 -51 L0 -49 Z" fill="#ffc12e"/>`,
});
const cottonCandy = (): Prop => ({
  r: 10, poke: 'bounce', fx: 'heart', sfx: 'pop',
  say: ['Cotton candy. Micah would eat it, stick and all.'],
  svg: `${shadow(5, 0.15)}<path d="M0 0 V-14" stroke="#f6e7c8" stroke-width="2"/><g fill="#ff9cc8"><circle cx="-4" cy="-18" r="5"/><circle cx="4" cy="-19" r="5"/><circle cx="0" cy="-24" r="5"/></g>`,
});
const straw = (_r: R, x: number, y: number) => `<path d="M${f(x - 4)} ${f(y)} l8 -2 M${f(x - 2)} ${f(y + 2)} l7 1" stroke="#c4a54a" stroke-width="1.4" stroke-linecap="round"/>`;

const lake = (w: number, b: Band): string => {
  // The lake fills the right side of the area, with a reedy shore.
  const x0 = w - 70;
  let d = `M${w} ${b.top} L${x0} ${b.top}`;
  for (let y = b.top; y < b.bottom; y += 40) d += ` Q${x0 - 14} ${y + 20} ${x0} ${y + 40}`;
  d += ` L${w} ${b.bottom} Z`;
  return `<path d="${d}" fill="#3a6f8f"/><path d="${d}" fill="#2f5f80" transform="translate(18 0)"/>
    <g class="foam"><path d="M${x0 + 20} ${b.top + 40} h20 M${x0 + 30} ${b.top + 120} h24 M${x0 + 16} ${b.top + 220} h18 M${x0 + 34} ${b.top + 320} h20 M${x0 + 22} ${b.top + 420} h18" stroke="#f2b8a8" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>
    ${[80, 190, 300, 400].filter((dy) => dy < b.bottom - b.top - 20).map((dy, i) => `<ellipse cx="${x0 + 24 + (i % 2) * 18}" cy="${b.top + dy}" rx="8" ry="3.4" fill="#4fa55a"/><circle cx="${x0 + 22 + (i % 2) * 18}" cy="${b.top + dy - 2}" r="2.2" fill="#ff9cc8"/>`).join('')}`;
};
const cabin = (): Prop => ({
  r: 34, poke: 'wobble', fx: 'heart', sfx: 'knock',
  say: ['The cabin. Smells like woodsmoke and adventure.', 'Micah has claimed the rug by the fire.'],
  svg: `${shadow(32, 0.18)}<rect x="-26" y="-32" width="52" height="32" fill="#8a5a26"/>
    <path d="M-26 -26 H26 M-26 -20 H26 M-26 -14 H26 M-26 -8 H26" stroke="#6b4529" stroke-width="1.6"/>
    <path d="M-32 -30 L0 -54 L32 -30 Z" fill="#3f5a4a" stroke="#2b3f33" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="14" y="-56" width="7" height="14" fill="#8f9aa0"/><g class="flicker"><path d="M17 -58 q3 -5 0 -9" stroke="#d6dde2" stroke-width="2" fill="none" opacity=".7"/></g>
    <rect x="-18" y="-26" width="11" height="10" fill="#ffe28a" stroke="#fff" stroke-width="1.6"/><rect x="5" y="-20" width="10" height="20" fill="#e8352f"/>`,
});
const dock = (): Prop => ({
  r: 28, poke: 'wobble', fx: 'drop', sfx: 'knock',
  say: ['The dock. Micah does not jump in. Mostly.'],
  svg: `<ellipse cx="0" cy="-4" rx="30" ry="9" fill="#3a6f8f"/><path d="M-26 -6 H26 L22 -14 H-22 Z" fill="#c9a66b" stroke="#8a6a3a" stroke-width="1.2"/>
    <path d="M-14 -14 V-6 M-2 -14 V-6 M10 -14 V-6" stroke="#8a6a3a" stroke-width="1"/><path d="M-22 -14 V-22 M22 -14 V-22" stroke="#6b4529" stroke-width="3"/>`,
});
const canoe = (): Prop => ({
  r: 22, poke: 'wobble', fx: 'drop', sfx: 'splash',
  svg: `${shadow(20, 0.12)}<path d="M-22 -10 Q0 4 22 -10 Q0 -4 -22 -10 Z" fill="#e8352f" stroke="#a3201c" stroke-width="1.4"/>
    <path d="M-8 -8 L14 -18" stroke="#a7784a" stroke-width="2"/><ellipse cx="15" cy="-18.5" rx="3" ry="1.6" fill="#a7784a" transform="rotate(-24 15 -18.5)"/>`,
});
const loon = (): Prop => ({
  r: 12, poke: 'flyoff', sfx: 'chime',
  say: ['A loon calls across the lake. Micah howls back.'],
  svg: `${hit(13, -6)}<g class="bob"><ellipse cx="0" cy="-5" rx="9" ry="4.5" fill="#1b1b1b"/><path d="M-5 -6 h2 M-1 -7 h2 M3 -6 h2" stroke="#fff" stroke-width="1"/>
    <circle cx="7" cy="-10" r="3.4" fill="#1b1b1b"/><path d="M10 -10 L14 -9 L10 -8.5 Z" fill="#2b2b2b"/><circle cx="8" cy="-10.6" r=".8" fill="#e8352f"/></g>`,
});


// ── Levels 151-200: sunflowers to fireworks ──
const sunflower = (s = 1): Prop => ({
  r: 14 * s, poke: 'rustle', fx: 'petal', sfx: 'rustle',
  svg: `${shadow(8 * s, 0.12)}<g transform="scale(${s})"><path d="M0 0 V-46" stroke="#4f8a3a" stroke-width="3"/>
    <path d="M0 -16 Q-10 -20 -12 -28 Q-4 -24 0 -18 M0 -26 Q10 -30 12 -38 Q4 -34 0 -28" fill="#5fa04a"/>
    <g class="sway"><g transform="translate(0 -52)">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<ellipse cx="0" cy="-9" rx="3.4" ry="7" fill="#ffc12e" transform="rotate(${a})"/>`).join('')}
    <circle r="7" fill="#6b4529"/><circle r="4.4" fill="#4f3220"/></g></g></g>`,
});
const bee = (): Prop => ({
  r: 10, poke: 'flyoff', sfx: 'flutter',
  svg: `${hit(12, -22)}<g class="flutter"><g transform="translate(0 -22)"><ellipse rx="5" ry="3.6" fill="#ffc12e"/><path d="M-1.5 -3.4 V3.4 M1.5 -3.4 V3.4" stroke="#2b2b2b" stroke-width="1.4"/>
    <g class="flap"><ellipse cx="-1" cy="-5" rx="3" ry="2.2" fill="#fff" opacity=".8"/><ellipse cx="2" cy="-5" rx="3" ry="2.2" fill="#fff" opacity=".8"/></g></g></g>`,
});
const scarecrow = (): Prop => ({
  r: 20, poke: 'wobble', fx: 'dirt', sfx: 'knock',
  say: ['A scarecrow. Micah is not scared. Mostly.', 'Micah barked at it for ten minutes. It did not move.'],
  svg: `${shadow(12, 0.15)}<path d="M0 0 V-40 M-18 -30 H18" stroke="#8a5f36" stroke-width="3"/>
    <path d="M-14 -34 H14 L10 -16 H-10 Z" fill="#e8352f"/><path d="M-6 -34 V-16 M6 -34 V-16" stroke="#a3201c" stroke-width="1.4"/>
    <circle cx="0" cy="-42" r="7" fill="#e3bf5c"/><path d="M-11 -46 H11 L6 -52 H-6 Z" fill="#6b4529"/><path d="M-10 -46 h20" stroke="#6b4529" stroke-width="2.4"/>
    <circle cx="-2.5" cy="-42" r="1" fill="#2b2b2b"/><circle cx="2.5" cy="-42" r="1" fill="#2b2b2b"/><path d="M-18 -30 l-3 4 M18 -30 l3 4" stroke="#e3bf5c" stroke-width="2"/>`,
});
const burrBush = (): Prop => ({
  r: 16, poke: 'rustle', fx: 'leaf', sfx: 'rustle',
  say: ['Burrs! They come home in Micah’s fur every time.', 'Micah walked through it. Now she has a new hairstyle.'],
  svg: `${shadow(15, 0.12)}<g class="sway"><circle cx="-8" cy="-10" r="9" fill="#7a8a3a"/><circle cx="8" cy="-11" r="9" fill="#7a8a3a"/><circle cx="0" cy="-17" r="10" fill="#8a9a42"/>
    ${[[-8, -14], [6, -18], [10, -8], [-3, -7], [-1, -22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#9a8a2e" stroke="#6b5a1e" stroke-width="1.2" stroke-dasharray="1 1"/>`).join('')}</g>`,
});

const greenhouse = (): Prop => ({
  r: 40, poke: 'glow', fx: 'drop', sfx: 'splash',
  say: ['The greenhouse. Warm, misty and smells like dirt. Micah loves it.', 'So many plants to sniff. So little time.'],
  svg: `${shadow(38, 0.12)}<path d="M-36 0 V-34 Q0 -64 36 -34 V0 Z" fill="#d8f4ff" fill-opacity=".55" stroke="#fff" stroke-width="2.4"/>
    <path d="M-18 0 V-48 M0 0 V-53 M18 0 V-48 M-36 -17 H36 M-36 -34 Q0 -50 36 -34" stroke="#fff" stroke-width="2" fill="none"/>
    <circle cx="-26" cy="-8" r="7" fill="#3f9a4a"/><circle cx="22" cy="-10" r="8" fill="#4fb35a"/><circle cx="-4" cy="-12" r="6" fill="#ff8fb1"/>`,
});
const monstera = (): Prop => ({
  r: 20, poke: 'rustle', fx: 'leaf', sfx: 'rustle',
  svg: `${shadow(12, 0.15)}<path d="M-8 0 L-6 -10 H6 L8 0 Z" fill="#c96a3a"/><g class="sway">
    <path d="M0 -10 Q-22 -16 -20 -34 Q-6 -36 0 -10 Z M0 -10 Q20 -18 22 -36 Q6 -38 0 -10 Z M0 -10 Q-4 -34 4 -46 Q12 -30 0 -10 Z" fill="#2f8f4a"/>
    <path d="M-12 -24 l4 -2 M12 -26 l-4 -2 M3 -32 l-3 2" stroke="#1f6a35" stroke-width="2"/></g>`,
});
const parrot = (): Prop => ({
  r: 12, poke: 'flyoff', sfx: 'tweet',
  say: ['A parrot. It says “good girl” in a voice that isn’t Micah’s person. Suspicious.'],
  svg: `${hit(13, -10)}<g class="peck"><path d="M-2 -2 L-6 10 L0 4 Z" fill="#2f8fe0"/><ellipse cx="0" cy="-8" rx="6" ry="8" fill="#e8352f"/>
    <circle cx="2" cy="-16" r="4.6" fill="#e8352f"/><path d="M5.6 -17 Q10 -15 6 -12 Z" fill="#ffc12e"/><circle cx="3" cy="-17" r="1" fill="#fff"/>
    <path d="M-6 -10 Q-10 -4 -4 0" fill="#ffc12e"/></g>`,
});
const wateringCan = (): Prop => ({
  r: 12, poke: 'hop', fx: 'drop', sfx: 'splash',
  svg: `${shadow(10, 0.15)}<path d="M-9 0 V-12 H6 V0 Z" fill="#23925a"/><path d="M6 -10 L16 -18" stroke="#23925a" stroke-width="3"/><path d="M-9 -12 Q-2 -22 6 -12" fill="none" stroke="#176a40" stroke-width="2"/>`,
});

const canyonSides = (w: number, b: Band): string => {
  // Red rock walls stepping up on both sides, and the river along the left.
  const step = (x0: number, dir: number) => {
    let d = `M${x0} ${b.top}`;
    for (let y = b.top; y < b.bottom; y += 46) d += ` H${x0 + dir * (20 + ((y / 46) % 3) * 8)} V${y + 46}`;
    return d + ` H${x0} Z`;
  };
  return `<path d="${step(0, 1)}" fill="#a8401a"/><path d="${step(w, -1)}" fill="#a8401a"/>
    <path d="M44 ${b.top} Q30 ${b.top + 120} 52 ${b.top + 240} T44 ${b.bottom}" stroke="#3fa9d8" stroke-width="16" fill="none"/>
    <g class="foam"><path d="M44 ${b.top} Q30 ${b.top + 120} 52 ${b.top + 240} T44 ${b.bottom}" stroke="#bfe8fa" stroke-width="2" stroke-dasharray="8 16" fill="none"/></g>`;
};
const raft = (): Prop => ({
  r: 18, poke: 'wobble', fx: 'drop', sfx: 'splash',
  say: ['A raft. Micah is wearing her life jacket. Very proud.'],
  svg: `${shadow(16, 0.1)}<ellipse cx="0" cy="-6" rx="17" ry="7" fill="#ffc12e" stroke="#c49a1a" stroke-width="2"/><ellipse cx="0" cy="-7" rx="10" ry="3.4" fill="#e0a21a"/>
    <path d="M-4 -8 L12 -22" stroke="#6b4529" stroke-width="2"/><ellipse cx="13" cy="-23" rx="2.4" ry="4" fill="#6b4529" transform="rotate(40 13 -23)"/>`,
});
const eagle = (): Prop => ({
  r: 14, poke: 'flyoff', sfx: 'tweet',
  svg: `${hit(14, -30)}<g class="flutter"><g transform="translate(0 -30)"><path d="M-16 -2 Q-8 -8 0 0 Q8 -8 16 -2 Q8 -4 0 3 Q-8 -4 -16 -2 Z" fill="#5a3a1e"/><circle cx="0" cy="-1" r="3" fill="#fff"/><path d="M2 -1 l3 1 l-3 1 Z" fill="#ffc12e"/></g></g>`,
});

const aurora = (w: number, b: Band): string => {
  const band = (y: number, c: string, o: number) => `<path d="M0 ${y} Q${w * 0.25} ${y - 40} ${w * 0.5} ${y} T${w} ${y} V${y + 26} Q${w * 0.75} ${y - 10} ${w * 0.5} ${y + 26} T0 ${y + 26} Z" fill="${c}" opacity="${o}"/>`;
  return `<g class="foam">${band(b.top + 60, '#5fe0a8', 0.35)}${band(b.top + 260, '#7fd0ec', 0.28)}${band(b.top + 420, '#b38df0', 0.22)}</g>`;
};
const fox = (): Prop => ({
  r: 14, poke: 'hop', fx: 'snow', sfx: 'boing',
  say: ['An arctic fox! Micah wants to be friends. The fox wants to be left alone.', 'The fox pounced into the snow. Micah tried it too.'],
  svg: `${shadow(11, 0.15)}<path d="M-10 -6 Q-22 -10 -18 -20 Q-12 -14 -8 -10" fill="#fff" stroke="#c4d6e2"/>
    <ellipse cx="0" cy="-8" rx="10" ry="6" fill="#fff" stroke="#c4d6e2"/><circle cx="9" cy="-14" r="5" fill="#fff" stroke="#c4d6e2"/>
    <path d="M6 -18 L7 -24 L10 -19 Z M10 -18 L13 -23 L13 -17 Z" fill="#fff" stroke="#c4d6e2"/><circle cx="10" cy="-15" r=".9" fill="#111"/><circle cx="14" cy="-13" r="1" fill="#111"/>`,
});
const iceCrystal = (): Prop => ({
  r: 10, poke: 'spin', fx: 'snow', sfx: 'chime',
  svg: `${hit(12, -10)}<path d="M0 -20 L5 -10 L0 0 L-5 -10 Z" fill="#cfe6f5" stroke="#fff" stroke-width="1.2"/><path d="M6 -14 L9 -8 L6 -2 L3 -8 Z" fill="#9fd8ec"/>`,
});

const checker = (w: number, b: Band, a: string, c: string): string => {
  let s = '';
  const sz = 36;
  for (let y = b.top - (b.top % sz); y < b.bottom; y += sz) for (let x = 0; x < w; x += sz) if (((x + y) / sz) % 2 === 0) s += `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" fill="${a}"/>`;
  return `<g opacity=".55">${s}</g><g fill="${c}"></g>`;
};
const oven = (): Prop => ({
  r: 26, poke: 'glow', fx: 'sparkle', sfx: 'chime',
  say: ['The oven. Something smells AMAZING.', 'Micah is guarding the oven. Nobody asked her to.'],
  svg: `${shadow(24, 0.15)}<rect x="-24" y="-44" width="48" height="44" rx="3" fill="#e8e2d6" stroke="#8f8a7a" stroke-width="2"/>
    <rect x="-18" y="-30" width="36" height="22" rx="3" fill="#3b2a1d"/><rect x="-14" y="-26" width="28" height="14" rx="2" fill="#ff8a1f" class="lamp-glow"/>
    <ellipse cx="-4" cy="-17" rx="7" ry="3" fill="#c9893f"/><rect x="-18" y="-38" width="36" height="3" rx="1.5" fill="#8f8a7a"/>
    ${[-14, -6, 2, 10].map((x) => `<circle cx="${x}" cy="-41" r="1.8" fill="#e8352f"/>`).join('')}`,
});
const flourSack = (): Prop => ({
  r: 14, poke: 'bounce', fx: 'snow', sfx: 'boing',
  say: ['A sack of flour. Micah sat in it. She is now a white dog.'],
  svg: `${shadow(13, 0.15)}<path d="M-12 0 Q-15 -16 -8 -26 Q0 -30 8 -26 Q15 -16 12 0 Z" fill="#f6efe0" stroke="#c9bfa8" stroke-width="1.6"/>
    <path d="M-8 -26 Q0 -22 8 -26" stroke="#c9bfa8" stroke-width="2" fill="none"/><text x="0" y="-10" text-anchor="middle" font-size="6" font-weight="900" fill="#c9893f" font-family="sans-serif">FLOUR</text>`,
});
const breadBasket = (): Prop => ({
  r: 16, poke: 'wobble', fx: 'heart', sfx: 'tap',
  say: ['Fresh bread. Micah would like to “help”.', 'One baguette is mysteriously shorter than the others.'],
  svg: `${shadow(14, 0.15)}<path d="M-6 -10 L-12 -30 M2 -10 L4 -32 M8 -10 L16 -28" stroke="#d9a066" stroke-width="5" stroke-linecap="round"/>
    <path d="M-15 -12 H15 L11 0 H-11 Z" fill="#a7784a" stroke="#6b4529" stroke-width="1.4"/><path d="M-13 -6 H13" stroke="#6b4529" stroke-width="1"/>`,
});

const dinoBones = (): Prop => ({
  r: 46, poke: 'wobble', fx: 'sparkle', sfx: 'bark',
  say: ['THE BIGGEST BONE IN THE WORLD. Micah needs it.', 'Micah has been staring at the dinosaur for twenty minutes.', 'Please do not lick the exhibit.'],
  svg: `${shadow(40, 0.12)}<rect x="-42" y="-4" width="84" height="4" fill="#8f8a7a"/>
    <path d="M-30 -4 V-20 M-14 -4 V-20 M14 -4 V-22 M28 -4 V-22" stroke="#f6efe0" stroke-width="4" stroke-linecap="round"/>
    <path d="M-34 -24 Q0 -36 32 -26" stroke="#f6efe0" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${[-24, -14, -4, 6, 16, 26].map((x) => `<path d="M${x} ${-28 - Math.abs(x) * -0.05} q-2 8 0 10" stroke="#f6efe0" stroke-width="2.6" fill="none"/>`).join('')}
    <path d="M32 -26 Q44 -40 40 -58" stroke="#f6efe0" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M34 -60 L52 -62 L50 -54 L38 -52 Z" fill="#f6efe0"/><circle cx="42" cy="-58" r="1.6" fill="#3b2a1d"/>
    <path d="M-34 -24 Q-48 -22 -54 -10" stroke="#f6efe0" stroke-width="4" fill="none" stroke-linecap="round"/>`,
});
const pillar = (): Prop => ({
  r: 14, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(12, 0.15)}<rect x="-12" y="-4" width="24" height="4" fill="#bdb4a4"/><rect x="-9" y="-50" width="18" height="46" fill="#ece6da"/>
    <path d="M-5 -50 V-4 M0 -50 V-4 M5 -50 V-4" stroke="#cfc6b8" stroke-width="1.2"/><rect x="-12" y="-54" width="24" height="4" fill="#bdb4a4"/>`,
});
const velvetRope = (): Prop => ({
  r: 20, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(18, 0.1)}<path d="M-18 0 V-18 M18 0 V-18" stroke="#c49a1a" stroke-width="3"/><circle cx="-18" cy="-19" r="2.6" fill="#ffc12e"/><circle cx="18" cy="-19" r="2.6" fill="#ffc12e"/>
    <path d="M-18 -16 Q0 -4 18 -16" stroke="#a3201c" stroke-width="3" fill="none"/>`,
});
const fossil = (): Prop => ({
  r: 12, poke: 'spin', fx: 'sparkle', sfx: 'tap',
  svg: `${shadow(10, 0.12)}<ellipse cx="0" cy="-8" rx="11" ry="8" fill="#bdb4a4"/><path d="M0 -8 m-5 0 a5 5 0 1 0 5 -5 a3 3 0 1 0 -3 3" stroke="#8f8a7a" stroke-width="1.6" fill="none"/>`,
});

const digger = (): Prop => ({
  r: 30, poke: 'hop', fx: 'dirt', sfx: 'knock',
  say: ['A digger. Finally, someone who digs as much as Micah.', 'Micah would like to drive. Micah may not drive.'],
  svg: `${shadow(28, 0.18)}<rect x="-26" y="-10" width="34" height="8" rx="4" fill="#2b2b2b"/>${[-20, -11, -2, 6].map((x) => `<circle cx="${x}" cy="-6" r="2.4" fill="#6b6b6b"/>`).join('')}
    <rect x="-24" y="-28" width="28" height="18" rx="2" fill="#ffc12e" stroke="#c49a1a" stroke-width="1.4"/><rect x="-20" y="-40" width="14" height="13" fill="#cfe6f5" stroke="#c49a1a" stroke-width="2"/>
    <path d="M4 -24 L20 -40 L30 -22" stroke="#ffc12e" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M26 -24 L36 -22 L32 -12 L24 -14 Z" fill="#6b6b6b"/>`,
});
const dirtPile = (): Prop => ({
  r: 20, poke: 'bounce', fx: 'dirt', sfx: 'dig',
  say: ['A whole mountain of dirt. Micah’s dream.'],
  svg: `<path d="M-22 0 Q-10 -26 0 -24 Q12 -26 22 0 Z" fill="#8a6239"/><circle cx="-6" cy="-14" r="2" fill="#6b4529"/><circle cx="6" cy="-8" r="2.4" fill="#a77b52"/>`,
});
const girders = (): Prop => ({
  r: 22, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(20, 0.15)}${[0, 6, 12].map((y, i) => `<rect x="${-20 + i * 2}" y="${-6 - y}" width="40" height="5" fill="#e8352f" stroke="#a3201c" stroke-width="1"/>`).join('')}
    <path d="M-16 -18 V-4 M16 -18 V-4" stroke="#a3201c" stroke-width="1"/>`,
});
const hardHat = (): Prop => ({
  r: 10, poke: 'spin', sfx: 'knock',
  say: ['A hard hat. Micah already has one, from Noah’s Ark.'],
  svg: `${shadow(9, 0.15)}<path d="M-10 -2 Q-10 -16 0 -16 Q10 -16 10 -2 Z" fill="#ffc12e" stroke="#c49a1a" stroke-width="1.4"/><rect x="-13" y="-3" width="26" height="3" rx="1.5" fill="#e0a21a"/><path d="M0 -16 V-4" stroke="#e0a21a" stroke-width="2"/>`,
});
const barrier = (): Prop => ({
  r: 18, poke: 'wobble', sfx: 'knock',
  svg: `${shadow(16, 0.12)}<path d="M-14 0 V-14 M14 0 V-14" stroke="#5d6f7c" stroke-width="2.4"/><rect x="-18" y="-20" width="36" height="7" fill="#fff"/>
    <path d="M-14 -20 l-4 7 M-6 -20 l-4 7 M2 -20 l-4 7 M10 -20 l-4 7 M18 -20 l-4 7" stroke="#e8352f" stroke-width="3.4"/>`,
});

const rails = (w: number, b: Band): string => {
  const x = w - 34;
  let ties = '';
  for (let y = b.top; y < b.bottom; y += 14) ties += `<rect x="${x - 14}" y="${y}" width="28" height="5" fill="#7a5233"/>`;
  return `<rect x="${x - 22}" y="${b.top}" width="44" height="${b.bottom - b.top}" fill="#a5a09a"/>${ties}<path d="M${x - 8} ${b.top} V${b.bottom} M${x + 8} ${b.top} V${b.bottom}" stroke="#5d6f7c" stroke-width="3"/>`;
};
const train = (): Prop => ({
  r: 34, poke: 'hop', fx: 'sparkle', sfx: 'chime',
  say: ['Choo choo! Micah has the window seat.', 'All aboard! Micah boarded first, as usual.'],
  svg: `${shadow(32, 0.18)}<rect x="-32" y="-30" width="40" height="24" rx="3" fill="#e8352f" stroke="#a3201c" stroke-width="1.6"/>
    <rect x="8" y="-22" width="22" height="16" rx="2" fill="#173a52"/><rect x="18" y="-34" width="7" height="12" fill="#173a52"/>
    <g class="flicker"><circle cx="21" cy="-40" r="4" fill="#d6dde2" opacity=".8"/><circle cx="26" cy="-46" r="3" fill="#d6dde2" opacity=".6"/></g>
    <rect x="-28" y="-26" width="9" height="8" fill="#ffe7a3"/><rect x="-16" y="-26" width="9" height="8" fill="#ffe7a3"/><rect x="-4" y="-26" width="9" height="8" fill="#ffe7a3"/>
    ${[-24, -8, 8, 22].map((x) => `<circle cx="${x}" cy="-5" r="5" fill="#2b2b2b"/><circle cx="${x}" cy="-5" r="2" fill="#ffc12e"/>`).join('')}`,
});
const stationClock = (): Prop => ({
  r: 14, poke: 'spin', sfx: 'chime',
  svg: `${shadow(6, 0.15)}<rect x="-1.6" y="-40" width="3.2" height="40" fill="#2d3e4a"/><circle cx="0" cy="-44" r="10" fill="#fff" stroke="#2d3e4a" stroke-width="2.4"/>
    <path d="M0 -44 V-51 M0 -44 L5 -41" stroke="#2d3e4a" stroke-width="1.6" stroke-linecap="round"/>`,
});
const suitcase = (c: string): Prop => ({
  r: 12, poke: 'hop', sfx: 'knock',
  svg: `${shadow(10, 0.15)}<rect x="-10" y="-16" width="20" height="16" rx="2" fill="${c}" stroke="#0003" stroke-width="1.4"/><path d="M-4 -16 V-20 H4 V-16" stroke="#2d3e4a" stroke-width="2" fill="none"/>
    <path d="M-10 -9 H10" stroke="#fff" stroke-width="1.4" opacity=".6"/><circle cx="5" cy="-5" r="2" fill="#e8352f"/>`,
});

const kite = (c: string, d: string): Prop => ({
  r: 14, poke: 'flyoff', sfx: 'whoosh',
  say: ['A kite! Micah chases the string. Every. Single. Time.'],
  svg: `${hit(14, -40)}<path d="M0 0 Q8 -20 2 -32" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/>
    <g class="flutter"><g transform="translate(2 -42)"><path d="M0 -12 L9 0 L0 14 L-9 0 Z" fill="${c}"/><path d="M0 -12 V14 M-9 0 H9" stroke="${d}" stroke-width="1.2"/>
    <path d="M0 14 q-4 5 0 8 q4 3 0 7" stroke="${d}" stroke-width="1.2" fill="none"/></g></g>`,
});
const turbine = (): Prop => ({
  r: 20, poke: 'glow', sfx: 'whoosh',
  svg: `${shadow(6, 0.12)}<path d="M-2 0 L-1 -54 H1 L2 0 Z" fill="#fff" stroke="#c9d2d8"/>
    <g transform="translate(0 -56)"><g class="spin-slow">${[0, 120, 240].map((a) => `<path d="M0 0 L-2 -24 Q0 -27 2 -24 Z" fill="#fff" stroke="#c9d2d8" transform="rotate(${a})"/>`).join('')}</g><circle r="2.4" fill="#c9d2d8"/></g>`,
});

const burst = (c: string): Prop => {
  let rays = '';
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; rays += `<path d="M${f(Math.cos(a) * 5)} ${f(Math.sin(a) * 5)} L${f(Math.cos(a) * 16)} ${f(Math.sin(a) * 16)}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`; }
  return { r: 18, poke: 'glow', fx: 'confetti', sfx: 'pop', svg: `${hit(18, -40)}<g transform="translate(0 -40)"><g class="twinkle">${rays}<circle r="3" fill="#fff"/></g></g>` };
};
const sparkler = (): Prop => ({
  r: 10, poke: 'glow', fx: 'sparkle', sfx: 'pop',
  svg: `<path d="M0 0 V-18" stroke="#8f9aa0" stroke-width="1.6"/><g class="flicker"><circle cx="0" cy="-20" r="5" fill="#ffe28a" opacity=".6"/><path d="M0 -20 l-6 -4 M0 -20 l6 -5 M0 -20 l-2 -7 M0 -20 l5 3 M0 -20 l-5 3" stroke="#fff3a0" stroke-width="1.2"/></g>`,
});
const blanket = (a: string, b: string): Prop => ({
  r: 22, poke: 'wobble', fx: 'heart', sfx: 'tap',
  say: ['Micah’s spot for the fireworks. She is very brave. Mostly.'],
  svg: `<path d="M-22 -4 L-14 -14 H18 L24 -4 Z" fill="${a}"/><path d="M-18 -9 H21 M-6 -14 L-8 -4 M6 -14 L7 -4" stroke="${b}" stroke-width="2"/>`,
});
const mixingBowl = (): Prop => ({
  r: 13, poke: 'wobble', fx: 'snow', sfx: 'tap',
  say: ['Cake batter. Micah licked the spoon. And the bowl. And the floor.'],
  svg: `${shadow(12, 0.15)}<path d="M-13 -12 H13 Q12 0 0 0 Q-12 0 -13 -12 Z" fill="#7fc7e8" stroke="#3f8fb8" stroke-width="1.4"/>
    <ellipse cx="0" cy="-12" rx="13" ry="3.5" fill="#f3dca8" stroke="#3f8fb8" stroke-width="1.2"/><path d="M4 -13 L12 -26" stroke="#c9893f" stroke-width="2.4" stroke-linecap="round"/>`,
});

/** Mown show-ring stripes for the Big Dog Show. */
const mownStripes = (w: number, b: Band): string => {
  let s = '';
  for (let y = b.top + 10; y < b.bottom; y += 56) s += `<rect x="0" y="${f(y)}" width="${w}" height="28" fill="#fff" opacity=".13"/>`;
  return s;
};

/**
 * "HAPPY / BIRTHDAY / MICAH!" bunting strung between two poles at the top of the birthday area.
 * It hangs on whichever side of the area's top level has more room, so it never covers the
 * path or a level node, and it is drawn relative to the area (not the whole map), so it stays
 * in the birthday area however many areas come after it.
 */
const birthdayBanner = (w: number, b: Band, nodes: Pt[]): { back: string; keepOut: Box } => {
  const inBand = nodes.filter((n) => n.y >= b.top && n.y <= b.bottom);
  const topNode = inBand.reduce((a, n) => (n.y < a.y ? n : a), inBand[0] ?? { x: 0, y: b.bottom });
  const right = topNode.x < w / 2;
  const x0 = right ? Math.max(topNode.x + 62, w * 0.42) : 10;
  const x1 = right ? w - 10 : Math.min(topNode.x - 62, w * 0.58);
  const colors = ['#e8352f', '#ffc12e', '#2f8fe0', '#8e5bd6', '#23925a'];
  const rows = ['HAPPY', 'BIRTHDAY', 'MICAH!'];
  const step = Math.min(26, (x1 - x0 - 12) / 8);
  const rowGap = step * 1.25 + 14;
  const y0 = b.top + 34;
  let flags = '', ropes = '', k = 0;
  rows.forEach((word, ri) => {
    const y = y0 + ri * rowGap, mid = (x0 + x1) / 2, sx = mid - (word.length * step) / 2;
    ropes += `<path d="M${f(x0 + 4)} ${f(y)} Q${f(mid)} ${f(y + 16)} ${f(x1 - 4)} ${f(y)}" stroke="#7a5233" stroke-width="1.5" fill="none"/>`;
    for (let i = 0; i < word.length; i++) {
      const cx = sx + (i + 0.5) * step, u = (cx - x0) / (x1 - x0), sag = 4 * u * (1 - u) * 8;
      flags += `<g transform="translate(${f(cx)} ${f(y + sag)})"><path d="M${f(-step / 2 + 1)} 0 H${f(step / 2 - 1)} L0 ${f(step * 1.25)} Z" fill="${colors[k++ % colors.length]}"/>
        <text y="${f(step * 0.55)}" text-anchor="middle" font-size="${f(step * 0.62)}" font-weight="900" fill="#fff" font-family="sans-serif">${word[i]}</text></g>`;
    }
  });
  const bottom = y0 + 2 * rowGap + step * 1.25 + 12;
  const pole = (x: number) => `<rect x="${f(x - 2)}" y="${f(y0 - 10)}" width="4" height="${f(bottom - y0 + 10)}" rx="2" fill="#7a5233"/><circle cx="${f(x)}" cy="${f(y0 - 10)}" r="4" fill="#ffc12e"/>`;
  return {
    back: `${pole(x0 + 4)}${pole(x1 - 4)}<g class="sway" style="animation-duration:6s">${ropes}${flags}</g>`,
    keepOut: { x: x0 - 6, y: y0 - 20, w: x1 - x0 + 12, h: bottom - y0 + 20 },
  };
};

// ───────────────────────────── ground textures ─────────────────────────────

interface Theme {
  ground: string; dark: string; light: string;
  path: string; edge: string; dots: string;
  texture: (r: R, x: number, y: number) => string;
  props: (r: R) => [() => Prop, number][];
  sparse?: boolean; // lighter texture for busy ones like confetti
  extras?: (w: number, b: Band, r: R, nodes: Pt[]) => { back: string; keepLeftOf?: number; keepRightOf?: number; keepOut?: Box };
}

const tuft = (c: string) => (_r: R, x: number, y: number) =>
  `<path d="M${f(x - 4)} ${f(y)} q1 -5 -1 -7 M${f(x)} ${f(y)} q0 -6 1.5 -8 M${f(x + 4)} ${f(y)} q0 -4 2 -6" stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
const dot = (c: string, sz = 1.4) => (r: R, x: number, y: number) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(sz * (0.6 + r()))}" fill="${c}"/>`;
const confettiBit = (colors: string[]) => (r: R, x: number, y: number) =>
  `<rect x="${f(x)}" y="${f(y)}" width="5" height="2.4" rx="1" fill="${pick(r, colors)}" transform="rotate(${Math.floor(r() * 180)} ${f(x)} ${f(y)})" opacity=".85"/>`;
const mix = (...fns: ((r: R, x: number, y: number) => string)[]) => (r: R, x: number, y: number) => pick(r, fns)(r, x, y);

const PETALS = ['#fff', '#ffc12e', '#ff8fb1', '#b38df0', '#e8352f'];
const PARTY = ['#e8352f', '#ffc12e', '#2f8fe0', '#8e5bd6', '#23925a', '#fff'];

export const THEMES: Theme[] = [
  // 1 · The Backyard: picket fences, Micah's own kennel, flower beds and fresh holes.
  {
    ground: '#7db86a', dark: '#6eab5c', light: '#8dc679', path: '#dcbf8e', edge: '#b8925a', dots: '#5f9c4f',
    texture: mix(tuft('#5f9c4f'), tuft('#6aa95a'), dot('#ffffff', 1.1)),
    props: (r) => [
      [() => doghouse(), 1], [() => fence(), 3], [() => flowers(r, PETALS), 4], [() => hole(), 2], [() => hose(), 1],
      [() => tree('#5fae4f', '#4a9440'), 2], [() => bush('#5fae4f', '#4a9440', '#e8352f'), 3], [() => bone(), 2],
      [() => ball(), 2], [() => butterfly(pick(r, ['#ffc12e', '#fff', '#ff8fb1'])), 3], [() => bird('#c9733a'), 2],
    ],
  },
  // 2 · Dog Park: shady trees, benches, lamp posts, a duck pond and plenty of new friends.
  {
    ground: '#5c9f5a', dark: '#4f914e', light: '#6aad66', path: '#e6dfcf', edge: '#ada38c', dots: '#3f7f40',
    texture: mix(tuft('#3f7f40'), tuft('#4a8c49'), dot('#7fbd78', 1.6)),
    props: (r) => [
      [() => pond(), 1], [() => yoshi(), 1], [() => tree('#3f8f47', '#2f7a3a', 1.1), 4], [() => bench(), 2], [() => lamp(), 2], [() => hydrant(), 1],
      [() => dog('#c9893f', '#8a5a26'), 1], [() => dog('#f2f2f2', '#2b2b2b', true, '#2b2b2b'), 1], [() => dog('#6b6b6b', '#3d3d3d', true), 1], [() => dog('#e8c38a', '#c9893f'), 1],
      [() => ball(), 4], [() => frisbee(pick(r, ['#e8352f', '#2f8fe0', '#ffc12e'])), 2], [() => bush('#4a9a4a', '#3a823c'), 3],
      [() => bird('#5d6f7c'), 2], [() => butterfly('#fff'), 2], [() => signpost('PARK'), 1],
    ],
  },
  // 3 · Lobster Beach: the sea rolls in on one side; umbrellas, sandcastles and scuttling crabs.
  {
    ground: '#e9cf98', dark: '#dfc184', light: '#f3e0b5', path: '#f8ecd0', edge: '#cfae6c', dots: '#cba762',
    texture: mix(dot('#cba762', 1.2), dot('#fff6e0', 1.3), (_r, x, y) => `<path d="M${f(x - 6)} ${f(y)} q3 -2 6 0 t6 0" stroke="#d6b678" stroke-width="1.2" fill="none"/>`),
    props: (r) => [
      [() => umbrella('#e8352f', '#fff'), 1], [() => umbrella('#2f8fe0', '#fff'), 1], [() => towel('#ffc12e', '#e8352f'), 1], [() => towel('#2f8fe0', '#fff'), 1],
      [() => sandcastle(), 2], [() => palm(), 2], [() => crab(), 3], [() => shell(pick(r, ['#fff3e6', '#ffb7a1', '#f6d2e0'])), 4],
      [() => starfish(), 3], [() => beachball(), 2], [() => bucket(), 1], [() => bird('#fff'), 2],
    ],
    extras: (w, b) => ({ back: sea(w, b.top - 12, b.bottom + 4, w - 34), keepLeftOf: w - 44 }),
  },
  // 4 · Muddy Trails: woodland pines, logs, mushrooms and puddles begging to be jumped in.
  {
    ground: '#9a7a5a', dark: '#8a6b4d', light: '#ab8b69', path: '#c9a679', edge: '#6e5138', dots: '#6f8a3e',
    texture: mix(tuft('#6f8a3e'), dot('#7d6046', 1.8), dot('#b49572', 1.2)),
    props: (r) => [
      [() => pine('#3f7f4a', '#2f6a3c', false, 1.1), 5], [() => puddle(), 4], [() => log(), 2], [() => rock('#8f9aa0'), 3], [() => mushroom(), 3],
      [() => fern('#5e9a45'), 3], [() => pawTrail(r), 3], [() => signpost('TRAIL'), 1], [() => bird('#8a5a26'), 2],
      [() => dog('#5b4330', '#3a2a1c', true), 1], [() => bush('#5e8f45', '#4a7a38', '#8e5bd6'), 2],
    ],
  },
  // 5 · Costume Party: bunting, balloons, gifts, yarn and a disco ball on the dance floor.
  {
    ground: '#d99a8f', dark: '#cd8a7f', light: '#e6ada3', path: '#ffe9a8', edge: '#d1a94a', dots: '#fff',
    texture: confettiBit(PARTY), sparse: true,
    props: (r) => [
      [() => bunting(64, PARTY), 2], [() => balloon(pick(r, PARTY.slice(0, 5))), 6], [() => gift(pick(r, ['#2f8fe0', '#8e5bd6', '#23925a']), '#ffc12e'), 3],
      [() => yarn(pick(r, ['#e8352f', '#8e5bd6', '#2f8fe0']), '#0003'), 3], [() => partyHat(pick(r, ['#2f8fe0', '#8e5bd6', '#e8352f']), '#ffc12e'), 3],
      [() => disco(), 1], [() => dog('#e8c38a', '#c9893f', false, '#e8352f'), 1], [() => cupcake('#f6b8c8'), 2],
    ],
  },
  // 6 · Snow Day: snowy pines, a snowman in Micah's cap, a frozen pond and falling snow.
  {
    ground: '#e4eff6', dark: '#d2e3ee', light: '#f6fbfd', path: '#ffffff', edge: '#a9c4d6', dots: '#b9d3e2',
    texture: mix(dot('#c4dae7', 1.6), dot('#ffffff', 1.4)),
    props: (r) => [
      [() => pine('#3f7f6a', '#2f6a58', true, 1.1), 6], [() => snowman(), 1], [() => icePond(), 1], [() => sled(), 1], [() => drift(), 4],
      [() => rock('#a9b6bf'), 2], [() => bird('#e8352f'), 2], [() => dog('#2b2b2b', '#151515', false), 1], [() => pawTrail(r), 2],
    ],
  },
  // 7 · The Big Dog Show: a striped show ring with jumps, weave poles, tunnels and prizes.
  {
    ground: '#7fa3d4', dark: '#7398cb', light: '#8eb0de', path: '#f4efe2', edge: '#c9b98f', dots: '#ffffff',
    texture: dot('#ffffff', 0.9),
    extras: (w, b) => ({ back: mownStripes(w, b) }),
    props: (r) => [
      [() => jump(), 3], [() => weave(), 2], [() => tunnel(), 1], [() => podium(), 1], [() => rosette(pick(r, ['#2f8fe0', '#e8352f', '#ffc12e'])), 3],
      [() => trophy(), 2], [() => pennants(60), 2], [() => dog('#f2f2f2', '#c9893f', true, '#c9893f'), 1], [() => dog('#c9893f', '#8a5a26'), 1],
      [() => bush('#4a9a4a', '#3a823c'), 2],
    ],
  },
  // 8 · Micah's Birthday: a giant cake, balloons, presents and sprinkles everywhere.
  {
    ground: '#e7a3b8', dark: '#dc93aa', light: '#f1b6c8', path: '#fff3c4', edge: '#e2b84f', dots: '#fff',
    texture: confettiBit(['#fff', '#ffc12e', '#2f8fe0', '#8e5bd6', '#e8352f']), sparse: true,
    extras: (w, b, _r, nodes) => birthdayBanner(w, b, nodes),
    props: (r) => [
      [() => cake(true), 1], [() => cake(), 1], [() => balloon(pick(r, PARTY.slice(0, 5))), 7], [() => gift(pick(r, ['#2f8fe0', '#8e5bd6', '#e8352f', '#23925a']), pick(r, ['#ffc12e', '#fff'])), 4],
      [() => cupcake(pick(r, ['#fff', '#f6b8c8', '#b38df0'])), 3], [() => partyHat(pick(r, ['#2f8fe0', '#8e5bd6', '#ffc12e']), '#fff'), 2],
      [() => bunting(64, PARTY), 2], [() => sparkleStar(), 4], [() => dog('#c9893f', '#8a5a26', true), 1],
    ],
  },
  // 9 · Rainy Walk: wet grass, puddles galore, wellies and a muddy paw trail.
  {
    ground: '#6f8a7a', dark: '#627d6d', light: '#7f9a8a', path: '#b9a888', edge: '#7d6a4f', dots: '#9fc3d6',
    texture: mix(tuft('#55705f'), dot('#9fc3d6', 1.3), dot('#5b4330', 1.6)),
    props: (r) => [
      [() => noahsArk(), 1], [() => puddle(), 7], [() => wellies(pick(r, ['#e8352f', '#ffc12e', '#2f8fe0'])), 3], [() => umbrella('#2f8fe0', '#ffc12e'), 1],
      [() => tree('#4f8f5a', '#3e7a49'), 3], [() => mushroom(), 3], [() => pawTrail(r), 3], [() => bird('#5d6f7c'), 2], [() => rock('#7d8a90'), 2],
    ],
  },
  // 10 · Camping Trip: tents, a crackling campfire, pines and logs to sit on.
  {
    ground: '#4f8a4b', dark: '#457d42', light: '#5e9a59', path: '#d2b98a', edge: '#8f7449', dots: '#3a6e37',
    texture: mix(tuft('#3a6e37'), tuft('#44803f'), dot('#7a5233', 1.2)),
    props: () => [
      [() => tent('#e8352f', '#a3201c'), 1], [() => tent('#2f8fe0', '#1f5f9e'), 1], [() => campfire(), 1], [() => pine('#2f6a3c', '#245a31', false, 1.15), 6],
      [() => log(), 3], [() => rock('#8f9aa0'), 2], [() => fern('#5e9a45'), 3], [() => signpost('CAMP'), 1], [() => bird('#8a5a26'), 2],
      [() => dog('#c9893f', '#8a5a26', true), 1],
    ],
  },
  // 11 · Pumpkin Patch: pumpkins of every size, hay bales and orange autumn trees.
  {
    ground: '#c9884a', dark: '#bd7b3f', light: '#d69a5c', path: '#f1d9a8', edge: '#a8743a', dots: '#e8a23a',
    texture: mix(dot('#e07a1f', 1.6), dot('#a8322a', 1.4), dot('#ffc12e', 1.2)),
    props: () => [
      [() => pumpkin(1.3), 2], [() => pumpkin(), 6], [() => pumpkin(0.7), 4], [() => hay(), 3], [() => tree('#e8892f', '#c96a1f'), 3],
      [() => tree('#d9541f', '#b8401a', 0.9), 2], [() => bush('#c9733a', '#a85a2a'), 2], [() => bird('#2b2b2b'), 2], [() => signpost('PATCH'), 1],
    ],
  },
  // 12 · Starry Sleepover: a twilight meadow with pillows, a tent and a sleepy moon.
  {
    ground: '#5b5a9e', dark: '#514f91', light: '#6866ab', path: '#c7c3f0', edge: '#8e8acb', dots: '#fff',
    texture: dot('#ffffff', 0.9), sparse: true,
    props: (r) => [
      [() => moon(), 1], [() => tent('#8e5bd6', '#5a3392'), 1], [() => pillow(pick(r, ['#f6b8c8', '#fff3c4', '#b38df0'])), 4], [() => lamp(), 2],
      [() => sparkleStar(), 8], [() => pine('#3d4a7a', '#30395f', false), 3], [() => dog('#2b2b2b', '#151515', true), 1],
    ],
  },

  // 13 · Neighbourhood Walk: tidy houses, mailboxes and leaves piling up on every lawn.
  {
    ground: '#8fae5e', dark: '#81a052', light: '#9dbc6b', path: '#d8d2c4', edge: '#a39a86', dots: '#e8892f',
    texture: mix(tuft('#6f8f45'), dot('#e8892f', 1.6), dot('#d9541f', 1.4), dot('#ffc12e', 1.2)),
    props: (r) => [
      [() => house('#fbf4e6', '#5d6f7c'), 1], [() => yoshi(), 1], [() => house('#cfe6f5', '#8a5a26', '#23925a'), 1], [() => mailbox(), 2], [() => leafPile(), 3],
      [() => tree('#e8892f', '#c96a1f'), 3], [() => gnome(), 1], [() => hydrant(), 1], [() => fence(), 2], [() => bird(pick(r, ['#e8352f', '#5d6f7c'])), 2],
      [() => dog('#c9893f', '#8a5a26', true), 1],
    ],
  },
  // 14 · Noah's Ark Lane: the famous falling-down house, the neighbour's cat, and more leaves.
  {
    ground: '#7d8f5a', dark: '#71834f', light: '#8a9c66', path: '#c9bfa8', edge: '#8f8470', dots: '#c96a1f',
    texture: mix(tuft('#5f7040'), dot('#c96a1f', 1.6), dot('#ffc12e', 1.2)),
    props: (r) => [
      [() => noahsArk(), 1], [() => catWindow(), 1], [() => leafPile(), 3], [() => tree('#d9541f', '#b8401a'), 3], [() => bin(), 2],
      [() => mailbox(), 1], [() => lamp(), 2], [() => mushroom(), 2], [() => bird(pick(r, ['#2b2b2b', '#5d6f7c'])), 2],
    ],
  },
  // 15 · The Long Way Home: every hydrant, lamp post and bin gets a good sniff.
  {
    ground: '#a7834e', dark: '#9a7744', light: '#b48f5a', path: '#e3d7bd', edge: '#9e8c6a', dots: '#e8892f',
    texture: mix(dot('#e8892f', 1.6), dot('#d9541f', 1.4), tuft('#7f6a3a')),
    props: (r) => [
      [() => house('#ffe0ea', '#a3201c', '#2f8fe0'), 1], [() => hydrant(), 3], [() => lamp(), 3], [() => bin(), 2], [() => leafPile(), 3],
      [() => tree('#e8892f', '#c96a1f', 1.1), 3], [() => bench(), 1], [() => signpost('HOME →'), 1], [() => pawTrail(r), 2],
    ],
  },
  // 16 · Front Porch: Micah's own house at the very top, leaves on the steps, home at last.
  {
    ground: '#9c6b45', dark: '#8f603c', light: '#a97851', path: '#f1d9a8', edge: '#a8743a', dots: '#ffc12e',
    texture: mix(dot('#ffc12e', 1.4), dot('#d9541f', 1.6), dot('#fff3c4', 1.1)),
    props: () => [
      [() => homePorch(), 1], [() => yoshi(), 1], [() => leafPile(), 4], [() => pumpkin(), 2], [() => tree('#d9541f', '#b8401a', 1.1), 3], [() => mailbox(), 1],
      [() => gnome(), 1], [() => lamp(), 2], [() => bird('#e8352f'), 2],
    ],
  },
  // 17 · Bath Day: a tub full of suds in the backyard, towels on the line and a rubber duck.
  {
    ground: '#8fc9c4', dark: '#82bdb8', light: '#9dd5d0', path: '#eaf6f4', edge: '#9fc3c0', dots: '#ffffff',
    texture: mix(dot('#ffffff', 1.6), dot('#bfeaf7', 1.8), tuft('#6fb3a8')),
    props: (r) => [
      [() => bathtub(), 1], [() => duckToy(), 3], [() => towel('#e8352f', '#fff'), 2], [() => towel('#2f8fe0', '#fff'), 1], [() => hose(), 2],
      [() => bucket(), 2], [() => bush('#6fb36a', '#5a9e57'), 3], [() => flowers(r, PETALS), 2], [() => fence(), 2],
    ],
  },
  // 18 · Backyard Barbecue: the grill, a picnic blanket and a very hopeful dog.
  {
    ground: '#7fb35e', dark: '#72a653', light: '#8cc06a', path: '#e6d6b8', edge: '#b89a6a', dots: '#ffe9a8',
    texture: mix(tuft('#5f9f4e'), tuft('#6aa95a'), dot('#ffe9a8', 1.2)),
    props: (r) => [
      [() => grill(), 1], [() => picnic(), 2], [() => fence(), 3], [() => tree('#5fae4f', '#4a9440'), 3], [() => ball(), 2],
      [() => bone(), 2], [() => bird('#c9733a'), 2], [() => flowers(r, PETALS), 3], [() => doghouse(), 1],
    ],
  },
  // 19 · Sprinkler Party: sprinklers, puddles and a paddling pond.
  {
    ground: '#5fae6a', dark: '#52a05d', light: '#6cbb77', path: '#dff2f8', edge: '#9fc3d6', dots: '#bfeaf7',
    texture: mix(tuft('#3f8f4a'), dot('#bfeaf7', 1.6), dot('#ffffff', 1.1)),
    props: (r) => [
      [() => sprinkler(), 3], [() => pond(true), 1], [() => puddle(), 2], [() => beachball(), 2], [() => umbrella('#ffc12e', '#fff'), 1],
      [() => tree('#4fa55a', '#3f8f4a'), 3], [() => butterfly(pick(r, ['#ffc12e', '#fff', '#ff8fb1'])), 3], [() => frisbee('#e8352f'), 1],
    ],
  },
  // 20 · Moonlight Walk: the quiet street at night, fireflies and the moon.
  {
    ground: '#4f5d8a', dark: '#45527c', light: '#5a6896', path: '#8f97c9', edge: '#6f78a8', dots: '#ffffff',
    texture: mix(dot('#ffffff', 1.1), dot('#fff3a0', 1.3), tuft('#3f4c72')),
    props: () => [
      [() => moon(), 1], [() => firefly(), 4], [() => lamp(), 3], [() => house('#c9cde8', '#3f4c72', '#ffe14d'), 1], [() => homePorch(), 1],
      [() => pine('#2f3d66', '#26325a'), 3], [() => yoshi(), 1], [() => mailbox(), 1],
    ],
  },
  // 21 · Lighthouse Cliffs: a grassy clifftop over the sea, a red-and-white lighthouse, gulls and lobster traps.
  {
    ground: '#8fb07a', dark: '#82a36d', light: '#9dbd88', path: '#ece3cc', edge: '#b4a684', dots: '#ffffff',
    texture: mix(tuft('#6f9060'), tuft('#7a9b6a'), dot('#ffffff', 1.2), dot('#ffc0d6', 1.1)),
    extras: (w, b) => ({ back: cliffEdge(w, b), keepRightOf: 40 }),
    props: (r) => [
      [() => lighthouse(), 1], [() => gull(), 4], [() => lobsterTrap(), 2], [() => buoy(), 2], [() => rock('#9aa5ad'), 4],
      [() => bush('#6f9a5a', '#5a8248'), 2], [() => flowers(r, ['#ff8fb1', '#fff', '#b38df0']), 3], [() => bench(), 1],
    ],
  },
  // 22 · Noah's Ark Yard Sale: patchy lawn, sale tables of junk, raccoon shopkeepers and the Ark itself.
  {
    ground: '#a39a6a', dark: '#958c5e', light: '#b0a776', path: '#d9cfb4', edge: '#8f8470', dots: '#6f6a4a',
    texture: mix(tuft('#7d7650'), dot('#7a6a50', 1.8), dot('#c9bf98', 1.4)),
    props: () => [
      [() => noahsArk(), 1], [() => saleTable(), 3], [() => raccoon(), 3], [() => tire(), 2], [() => parcelStack(), 2],
      [() => bin(), 2], [() => signpost('SALE'), 1], [() => mushroom(), 2], [() => tree('#8f9a5a', '#7a8448', 0.9), 2],
    ],
  },
  // 23 · Desert Road Trip: orange sand, saguaros, red mesas, tumbleweeds and the camper van.
  {
    ground: '#e0a05a', dark: '#d6944e', light: '#eab06c', path: '#f6dfb4', edge: '#c8803c', dots: '#c8572a',
    texture: mix(dot('#c8803c', 1.4), dot('#f6dfb4', 1.2), dot('#a8401a', 1.1)),
    props: () => [
      [() => mesa(), 2], [() => cactus(), 4], [() => cactus(0.7), 3], [() => tumbleweed(), 3], [() => camper(), 1],
      [() => rock('#c8572a'), 3], [() => signpost('ROUTE 66?'), 1], [() => bird('#5a4b40'), 1],
    ],
  },
  // 24 · Farm Visit: a big red barn, hay bales, chickens, sheep and rows of corn.
  {
    ground: '#9cc35a', dark: '#8fb64e', light: '#a9cf68', path: '#e3c993', edge: '#b0904e', dots: '#6f9a3a',
    texture: mix(tuft('#6f9a3a'), tuft('#7fa94a'), dot('#ffd23f', 1.1)),
    props: () => [
      [() => barn(), 1], [() => hay(), 3], [() => chicken(), 4], [() => sheep(), 3], [() => corn(), 4],
      [() => tractor(), 1], [() => fence(), 2], [() => tree('#5fae4f', '#4a9440'), 2],
    ],
  },
  // 25 · Under the Sea: Micah's lobster dream. Deep blue water, coral, kelp, fish and treasure.
  {
    ground: '#1f557a', dark: '#1b4d6f', light: '#255f86', path: '#e9d6a6', edge: '#c4ac72', dots: '#7fd0ec',
    texture: mix(dot('#7fd0ec', 1.2), dot('#2f6f96', 2.2), dot('#e9d6a6', 1)),
    sparse: true,
    props: (r) => [
      [() => coral('#ff8f5a'), 3], [() => coral('#ff9cc8'), 3], [() => kelp(), 5], [() => fish(pick(r, ['#ffc12e', '#ff8a1f', '#5fc7f0', '#fff'])), 6],
      [() => chest(), 1], [() => crab(), 2], [() => starfish(), 3], [() => shell('#ffb7a1'), 2], [() => jelly(), 2],
    ],
  },
  // 26 · Delivery Day: a concrete loading yard with stacks of parcels, pallets, cones and the van.
  {
    ground: '#b8bcc4', dark: '#adb1ba', light: '#c4c8cf', path: '#e8e9ec', edge: '#8a8f99', dots: '#8a8f99',
    texture: mix(dot('#9a9fa8', 1.2), dot('#d4d7dc', 1.4)),
    sparse: true,
    extras: (w, b) => ({ back: concreteLines(w, b) }),
    props: () => [
      [() => van(), 1], [() => parcelStack(), 5], [() => pallet(), 3], [() => cone(), 4], [() => mailbox(), 1],
      [() => hydrant(), 1], [() => bin(), 1], [() => bird('#5d6f7c'), 2],
    ],
  },
  // 27 · Cherry Blossom Park: pink trees, petals on the grass, a red bridge and a koi pond.
  {
    ground: '#a9cf8a', dark: '#9cc37d', light: '#b6da98', path: '#f6e9e0', edge: '#d9b8b0', dots: '#ffc0d6',
    texture: mix(petal, petal, tuft('#86b06a')),
    props: () => [
      [() => tree('#ffc0d6', '#f29ab8', 1.1), 5], [() => tree('#ffd8e6', '#ffb0cc', 0.85), 3], [() => bridge(), 1], [() => koiPond(), 1],
      [() => lamp(), 2], [() => bench(), 1], [() => butterfly('#fff'), 3], [() => bush('#86b06a', '#6f9a58'), 2],
    ],
  },
  // 28 · Mountain Hike: alpine meadow, grey crags, snowy peaks, cairns and a mountain goat.
  {
    ground: '#7f9a6a', dark: '#738e5f', light: '#8ca776', path: '#cfc6b2', edge: '#8f8a7a', dots: '#c4cdd3',
    texture: mix(tuft('#5f7a4f'), dot('#9aa5ad', 2), dot('#ffffff', 1.1), dot('#b38df0', 1)),
    props: (r) => [
      [() => peak(), 2], [() => pine('#2f5f4a', '#244d3c', false, 1.1), 4], [() => cairn(), 3], [() => goat(), 2], [() => rock('#9aa5ad'), 4],
      [() => flowers(r, ['#b38df0', '#fff', '#ffc12e']), 3], [() => signpost('SUMMIT'), 1], [() => bird('#2b2b2b'), 1],
    ],
  },
  // 29 · County Fair: straw underfoot, a Ferris wheel, a striped big top, bunting and cotton candy.
  {
    ground: '#d9c27a', dark: '#cfb76d', light: '#e3cd88', path: '#fff3d6', edge: '#c9a65a', dots: '#e8352f',
    texture: mix(straw, straw, confettiBit(PARTY)),
    sparse: true,
    props: (r) => [
      [() => ferris(), 1], [() => bigTop(), 2], [() => bunting(64, PARTY), 2], [() => cottonCandy(), 3], [() => balloon(pick(r, PARTY.slice(0, 5))), 4],
      [() => rosette('#2f8fe0'), 2], [() => hay(), 2], [() => dog('#c9893f', '#8a5a26', true), 1],
    ],
  },
  // 30 · Lake Cabin: pine shore at dusk, the lake on one side, a dock, a canoe and loons.
  {
    ground: '#4f7a62', dark: '#466f58', light: '#5a866d', path: '#d9c4a8', edge: '#9c8466', dots: '#f2b8a8',
    texture: mix(tuft('#3a6a50'), tuft('#44735a'), dot('#f2b8a8', 1)),
    extras: (w, b) => ({ back: lake(w, b), keepLeftOf: w - 64 }),
    props: () => [
      [() => cabin(), 1], [() => dock(), 1], [() => canoe(), 1], [() => pine('#2f5a46', '#244a39', false, 1.15), 6], [() => campfire(), 1],
      [() => log(), 2], [() => fern('#5e9a45'), 2], [() => firefly(), 3], [() => loon(), 1],
    ],
  },
  // 31 · Sunflower Fields: tall sunflowers, bees, a scarecrow and burr bushes everywhere.
  {
    ground: '#a7b84a', dark: '#9aab40', light: '#b4c456', path: '#e9d9a6', edge: '#b8a060', dots: '#ffc12e',
    texture: mix(tuft('#7f9a3a'), dot('#ffc12e', 1.4), tuft('#8aa540')),
    props: () => [
      [() => sunflower(1.1), 6], [() => sunflower(0.8), 5], [() => bee(), 4], [() => scarecrow(), 1], [() => burrBush(), 4],
      [() => hay(), 2], [() => fence(), 1], [() => bird('#2b2b2b'), 1],
    ],
  },
  // 32 · The Greenhouse: deep green, glass houses, giant leaves, a parrot and misty air.
  {
    ground: '#3f8a5a', dark: '#367d4f', light: '#4a9765', path: '#c9a66b', edge: '#8a6a3a', dots: '#bfeaf7',
    texture: mix(tuft('#2f6a45'), dot('#bfeaf7', 1.2), dot('#5fb37a', 1.8)),
    props: (r) => [
      [() => greenhouse(), 2], [() => monstera(), 5], [() => fern('#5fb37a'), 4], [() => parrot(), 2], [() => wateringCan(), 2],
      [() => flowers(r, ['#ff8fb1', '#ffc12e', '#fff']), 3], [() => butterfly('#5fc7f0'), 3],
    ],
  },
  // 33 · Canyon River: stepped red rock walls, a river, rafts and an eagle overhead.
  {
    ground: '#b5653a', dark: '#a85a32', light: '#c27242', path: '#f0c89a', edge: '#8a4a2a', dots: '#e0a06a',
    texture: mix(dot('#8a4a2a', 1.6), dot('#e0a06a', 1.2)),
    extras: (w, b) => ({ back: canyonSides(w, b), keepRightOf: 66, keepLeftOf: w - 44 }),
    props: () => [
      [() => raft(), 2], [() => eagle(), 2], [() => rock('#c8572a'), 5], [() => cactus(0.6), 3], [() => pine('#3f7f4a', '#2f6a3c', false, 0.9), 3],
      [() => tumbleweed(), 2], [() => signpost('RAPIDS'), 1],
    ],
  },
  // 34 · Northern Lights: night snow under green and violet skies, an arctic fox and ice.
  {
    ground: '#5f7d99', dark: '#55718c', light: '#6a89a5', path: '#dcebf5', edge: '#9fb6ca', dots: '#ffffff',
    texture: mix(dot('#ffffff', 1.1), dot('#9fd8ec', 1.4)),
    sparse: true,
    extras: (w, b) => ({ back: aurora(w, b) }),
    props: () => [
      [() => pine('#2f4d5a', '#243d48', true, 1.1), 6], [() => fox(), 2], [() => iceCrystal(), 4], [() => drift(), 4], [() => icePond(), 1],
      [() => sled(), 1], [() => moon(), 1],
    ],
  },
  // 35 · The Bakery: a checkered kitchen floor, ovens, flour sacks and bread baskets.
  {
    ground: '#e8d6c0', dark: '#e0ccb4', light: '#f0e0cc', path: '#fff4e6', edge: '#c9b28a', dots: '#ffffff',
    texture: dot('#ffffff', 1.4), sparse: true,
    extras: (w, b) => ({ back: checker(w, b, '#d9c2a6', '#fff') }),
    props: (r) => [
      [() => oven(), 2], [() => flourSack(), 3], [() => breadBasket(), 3], [() => cake(), 1], [() => cupcake(pick(r, ['#f6b8c8', '#fff', '#b38df0'])), 4],
      [() => mixingBowl(), 2], [() => dog('#2b2b2b', '#151515', true), 1],
    ],
  },
  // 36 · Dinosaur Museum: marble floor, pillars, velvet ropes, fossils and THE bone.
  {
    ground: '#cfc6b8', dark: '#c6bdae', light: '#d8d0c3', path: '#a3201c', edge: '#7a1814', dots: '#ffffff',
    texture: dot('#bdb4a4', 1.2), sparse: true,
    extras: (w, b) => ({ back: checker(w, b, '#e2dbcf', '#fff') }),
    props: () => [
      [() => dinoBones(), 2], [() => pillar(), 4], [() => velvetRope(), 3], [() => fossil(), 4], [() => bench(), 1], [() => monstera(), 2],
    ],
  },
  // 37 · Construction Site: dirt, a digger, girders, barriers, cones and a hard hat.
  {
    ground: '#b08a5a', dark: '#a37f50', light: '#bd9766', path: '#d9c4a0', edge: '#8a6a3a', dots: '#6b4529',
    texture: mix(dot('#6b4529', 1.8), dot('#d9c4a0', 1.2)),
    props: () => [
      [() => digger(), 2], [() => dirtPile(), 4], [() => girders(), 2], [() => barrier(), 3], [() => cone(), 5], [() => hardHat(), 2], [() => puddle(), 2],
    ],
  },
  // 38 · Train Station: grey platform, a train on the tracks, a big clock and luggage.
  {
    ground: '#8f97a3', dark: '#868e9a', light: '#9aa2ad', path: '#d9dde2', edge: '#6f7782', dots: '#ffc12e',
    texture: dot('#7a828d', 1.2), sparse: true,
    extras: (w, b) => ({ back: rails(w, b), keepLeftOf: w - 64 }),
    props: (r) => [
      [() => train(), 2], [() => stationClock(), 2], [() => bench(), 2], [() => suitcase(pick(r, ['#e8352f', '#2f8fe0', '#ffc12e'])), 4], [() => lamp(), 3], [() => bird('#5d6f7c'), 3],
    ],
  },
  // 39 · Kite Hill: bright rolling green, kites everywhere, wind turbines and a picnic.
  {
    ground: '#6fbf5a', dark: '#62b04e', light: '#7ccb66', path: '#f2ead0', edge: '#bfae7a', dots: '#ffffff',
    texture: mix(tuft('#4f9a3f'), tuft('#5aa84a'), dot('#ffffff', 1.1)),
    props: (r) => [
      [() => kite('#e8352f', '#a3201c'), 2], [() => kite('#2f8fe0', '#1f5f9e'), 2], [() => kite('#ffc12e', '#c49a1a'), 2], [() => turbine(), 3],
      [() => picnic(), 1], [() => flowers(r, PETALS), 3], [() => butterfly('#fff'), 2], [() => ball(), 1],
    ],
  },
  // 40 · Fireworks Night: a dark meadow, fireworks overhead, sparklers and picnic blankets.
  {
    ground: '#3a2f6a', dark: '#33295e', light: '#433776', path: '#9f93d6', edge: '#6f63a8', dots: '#ffffff',
    texture: mix(dot('#ffffff', 0.9), tuft('#2f2558')),
    sparse: true,
    props: (r) => [
      [() => burst(pick(r, ['#e8352f', '#ffc12e', '#5fe0a8', '#ff9cc8', '#7fd0ec'])), 8], [() => sparkler(), 4], [() => blanket('#e8352f', '#fff'), 2],
      [() => blanket('#2f8fe0', '#fff'), 1], [() => lamp(), 2], [() => dog('#2b2b2b', '#151515', true), 1],
    ],
  },
];

// ───────────────────────────── layout ─────────────────────────────

const wrap = (x: number, y: number, p: Prop) =>
  `<g transform="translate(${f(x)} ${f(y)})"><g class="p"${p.poke ? ` data-poke="${p.poke}"` : ''}${p.fx ? ` data-fx="${p.fx}"` : ''}${p.sfx ? ` data-sfx="${p.sfx}"` : ''}${p.say ? ` data-say="${p.say.join('|').replace(/"/g, '&quot;')}"` : ''}>${p.svg}</g></g>`;

function samplePath(nodes: Pt[]): Pt[] {
  const pts: Pt[] = [];
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1], b = nodes[i], my = (a.y + b.y) / 2;
    for (let t = 0; t < 1; t += 0.08) {
      const u = 1 - t;
      pts.push({
        x: u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
        y: u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y,
      });
    }
  }
  return pts;
}

export function pathD(nodes: Pt[]): string {
  let d = '';
  nodes.forEach((p, i) => {
    if (i === 0) d += `M ${f(p.x)} ${f(p.y)}`;
    else {
      const prev = nodes[i - 1], my = f((prev.y + p.y) / 2);
      d += ` C ${f(prev.x)} ${my}, ${f(p.x)} ${my}, ${f(p.x)} ${f(p.y)}`;
    }
  });
  return d;
}

/** One SVG per area (so off-screen areas can pause their animations), stacked so each wavy edge overlaps the area above. */
export function sceneryHTML(s: SceneInput): string {
  const { width: w, nodes, bands } = s;
  const path = samplePath(nodes);
  const clearOf = (x: number, y: number, r: number, placed: { x: number; y: number; r: number }[], keepLeftOf: number, keepRightOf = 0) => {
    if (x < Math.max(r * 0.5, keepRightOf + r * 0.6) || x > Math.min(w - r * 0.5, keepLeftOf)) return false;
    for (const n of nodes) if (Math.hypot(n.x - x, n.y - y + r * 0.5) < 40 + r) return false;
    for (const p of path) if (Math.hypot(p.x - x, p.y - y + r * 0.5) < 20 + r) return false;
    for (const b of s.banners) if (x + r > b.x - 6 && x - r < b.x + b.w + 6 && y > b.y - 6 && y - r * 1.6 < b.y + b.h + 6) return false;
    for (const p of placed) if (Math.hypot(p.x - x, p.y - y) < p.r + r - 4) return false;
    return true;
  };

  const layers: string[] = [];
  bands.forEach((b, zi) => {
    const t = THEMES[zi % THEMES.length];
    const r = rng(1009 * (zi + 1) + Math.round(w));
    const top = b.top - 16;
    const extra = t.extras?.(w, b, r, nodes);
    const keep = extra?.keepLeftOf ?? w;
    const out = extra?.keepOut;

    // Ground with a soft wavy top edge, plus a few lighter and darker patches.
    let ground = `M0 ${b.bottom} V${b.top}`;
    if (zi < bands.length - 1) {
      ground = `M0 ${b.bottom} V${b.top + 4}`;
      for (let x = 0; x < w; x += 40) ground += ` Q${x + 20} ${b.top - 14 + (x / 40) % 2 * 6} ${Math.min(x + 40, w)} ${b.top + 2}`;
    } else ground += ` H${w}`;
    ground += ` V${b.bottom} Z`;
    let svg = `<path d="${ground}" fill="${t.ground}"/>`;
    for (let i = 0; i < 5; i++) {
      const rx = 40 + r() * 70;
      svg += `<ellipse cx="${f(r() * w)}" cy="${f(b.top + 30 + r() * (b.bottom - b.top - 60))}" rx="${f(rx)}" ry="${f(rx * 0.45)}" fill="${i % 2 ? t.light : t.dark}" opacity=".7"/>`;
    }
    if (extra) svg += extra.back;

    // Ground texture: tufts of grass, sand grains, confetti and the like.
    const area = w * (b.bottom - b.top);
    let tex = '';
    for (let i = 0; i < area / (t.sparse ? 3200 : 1500); i++) tex += t.texture(r, r() * w, b.top + 6 + r() * (b.bottom - b.top - 12));
    svg += tex;

    // Props, placed where they never cover the path, a level, or the area name.
    const placed: { x: number; y: number; r: number }[] = [];
    const items: { x: number; y: number; html: string }[] = [];
    for (const [make, count] of t.props(r)) {
      for (let k = 0; k < count; k++) {
        const p = make();
        for (let tries = 0; tries < 60; tries++) {
          const x = r() * w;
          const y = b.top + 16 + p.r * 1.2 + r() * (b.bottom - b.top - 32 - p.r * 1.2);
          if ((out && x + p.r > out.x && x - p.r < out.x + out.w && y > out.y && y - p.r * 1.6 < out.y + out.h) || !clearOf(x, y, p.r, placed, keep, extra?.keepRightOf)) continue;
          placed.push({ x, y, r: p.r });
          items.push({ x, y, html: wrap(x, y, p) });
          break;
        }
      }
    }
    // Draw back to front so lower props overlap higher ones.
    items.sort((a, c) => a.y - c.y);
    svg += items.map((i) => i.html).join('');

    // Ambient extras: falling snow on Snow Day, drifting confetti and sparkles for the parties.
    if (zi === 5) for (let i = 0; i < 22; i++) svg += `<circle class="flake" style="animation-delay:-${f(r() * 7)}s;animation-duration:${f(6 + r() * 4)}s" cx="${f(r() * w)}" cy="${f(b.top + r() * (b.bottom - b.top - 140))}" r="${f(1.4 + r() * 1.8)}" fill="#fff"/>`;
    if (zi >= 12 && zi < 20) for (let i = 0; i < 10; i++) svg += `<ellipse class="flake" style="animation-delay:-${f(r() * 8)}s;animation-duration:${f(7 + r() * 4)}s" cx="${f(r() * w)}" cy="${f(b.top + r() * (b.bottom - b.top - 140))}" rx="3" ry="1.6" fill="${pick(r, ['#e8892f', '#d9541f', '#ffc12e'])}"/>`;
    if (zi === 8) for (let i = 0; i < 26; i++) svg += `<ellipse class="flake" style="animation-delay:-${f(r() * 7)}s;animation-duration:${f(3 + r() * 2)}s" cx="${f(r() * w)}" cy="${f(b.top + r() * (b.bottom - b.top - 140))}" rx="1" ry="3" fill="#cfe6f5" opacity=".8"/>`;
    // Levels 101 on: bubbles rising under the sea, blossom petals drifting, fireflies at the lake.
    if (zi === 24) for (let i = 0; i < 18; i++) svg += `<circle class="rise" style="animation-delay:-${f(r() * 6)}s;animation-duration:${f(5 + r() * 3)}s" cx="${f(r() * w)}" cy="${f(b.top + 140 + r() * (b.bottom - b.top - 150))}" r="${f(1.6 + r() * 2.4)}" fill="none" stroke="#bfeaf7" stroke-width="1.2"/>`;
    if (zi === 26) for (let i = 0; i < 14; i++) svg += `<ellipse class="flake" style="animation-delay:-${f(r() * 8)}s;animation-duration:${f(7 + r() * 4)}s" cx="${f(r() * w)}" cy="${f(b.top + r() * (b.bottom - b.top - 140))}" rx="2.6" ry="1.6" fill="${pick(r, ['#ffc0d6', '#ff9cc8', '#fff'])}"/>`;
    if (zi === 29) for (let i = 0; i < 10; i++) svg += `<circle class="twinkle" style="animation-delay:-${f(r() * 3)}s" cx="${f(r() * w)}" cy="${f(b.top + 20 + r() * (b.bottom - b.top - 40))}" r="2" fill="#ffe14d"/>`;
    // Levels 151 on: snow under the northern lights, mist in the greenhouse, sparks over the fireworks.
    if (zi === 33) for (let i = 0; i < 16; i++) svg += `<circle class="flake" style="animation-delay:-${f(r() * 7)}s;animation-duration:${f(7 + r() * 4)}s" cx="${f(r() * w)}" cy="${f(b.top + r() * (b.bottom - b.top - 140))}" r="${f(1.2 + r() * 1.4)}" fill="#fff"/>`;
    if (zi === 31) for (let i = 0; i < 12; i++) svg += `<circle class="rise" style="animation-delay:-${f(r() * 6)}s;animation-duration:${f(7 + r() * 4)}s" cx="${f(r() * w)}" cy="${f(b.top + 140 + r() * (b.bottom - b.top - 150))}" r="${f(3 + r() * 4)}" fill="#e6f7fc" opacity=".35"/>`;
    if (zi === 39) for (let i = 0; i < 14; i++) svg += `<circle class="twinkle" style="animation-delay:-${f(r() * 3)}s" cx="${f(r() * w)}" cy="${f(b.top + 20 + r() * (b.bottom - b.top - 40))}" r="1.8" fill="${pick(r, ['#ffc12e', '#ff9cc8', '#7fd0ec', '#fff'])}"/>`;
    if (zi === 4 || zi === 7 || zi === 11 || zi === 28) for (let i = 0; i < 8; i++) svg += `<circle class="twinkle" style="animation-delay:-${f(r() * 3)}s" cx="${f(r() * w)}" cy="${f(b.top + 20 + r() * (b.bottom - b.top - 40))}" r="1.6" fill="#fff"/>`;

    layers.unshift(`<svg class="zone-layer" data-zone="${zi}" viewBox="0 ${top} ${w} ${b.bottom - top}" style="top:${top}px;height:${b.bottom - top}px" preserveAspectRatio="none">${svg}</svg>`);
  });

  // The walking path: a trail coloured to match each area, with a dotted centre line.
  const stops = bands.flatMap((b, zi) => {
    const t = THEMES[zi % THEMES.length];
    const a = Math.round((b.bottom / s.height) * 1e4) / 1e4, z = Math.round((b.top / s.height) * 1e4) / 1e4;
    return [[a, t], [z, t]] as const;
  });
  const grad = (id: string, key: 'path' | 'edge') =>
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${s.height}" x2="0" y2="0">${stops
      .map(([o, t]) => `<stop offset="${f(1 - o)}" stop-color="${t[key]}"/>`).join('')}</linearGradient>`;
  const d = pathD(nodes);
  const pathSvg = `<svg class="path-layer" viewBox="0 0 ${w} ${s.height}" style="height:${s.height}px" preserveAspectRatio="none">
    <defs>${grad('trail-fill', 'path')}${grad('trail-edge', 'edge')}</defs>
    <path d="${d}" fill="none" stroke="#0002" stroke-width="32" stroke-linecap="round" transform="translate(0 3)"/>
    <path d="${d}" fill="none" stroke="url(#trail-edge)" stroke-width="30" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#trail-fill)" stroke-width="23" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#trail-edge)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 16" opacity=".55"/>
  </svg>`;

  return layers.join('') + pathSvg;
}

// ───────────────────────────── taps ─────────────────────────────

const FX: Record<string, (i: number) => string> = {
  leaf: (i) => `<ellipse rx="3" ry="1.6" fill="${i % 2 ? '#4a9440' : '#7cc06a'}"/>`,
  petal: (i) => `<circle r="2" fill="${PETALS[i % PETALS.length]}"/>`,
  heart: () => `<path d="M0 3 L-4 -1 A2.4 2.4 0 0 1 0 -4 A2.4 2.4 0 0 1 4 -1 Z" fill="#e8352f"/>`,
  dirt: () => `<circle r="2" fill="#8b6340"/>`,
  sand: () => `<circle r="1.6" fill="#d6b678"/>`,
  mud: () => `<circle r="2.2" fill="#5b4330"/>`,
  drop: () => `<ellipse rx="1.6" ry="2.4" fill="#7cc8ef"/>`,
  snow: () => `<circle r="2" fill="#fff"/>`,
  sparkle: () => `<path d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z" fill="#ffe28a"/>`,
  confetti: (i) => `<rect x="-2.5" y="-1.2" width="5" height="2.4" fill="${PARTY[i % PARTY.length]}"/>`,
  coconut: () => `<circle r="3" fill="#6b4529"/>`,
  bubble: () => `<circle r="2.6" fill="none" stroke="#bfeaf7" stroke-width="1.2"/>`,
};

/**
 * Makes the scenery playful: tapping a prop plays its reaction (balls bounce, bushes rustle,
 * birds fly off, dogs hop) and throws a little burst of leaves, hearts, snow or confetti.
 * Returns a cleanup function.
 */
export function wireScenery(root: HTMLElement, play: (sound: string) => void, onSay?: (text: string) => void): () => void {
  const sayTurn = new Map<string, number>();
  const onTap = (e: Event) => {
    const p = (e.target as Element).closest<SVGGElement>('[data-poke]');
    if (!p || p.classList.contains('poked')) return;
    const kind = p.dataset.poke!;
    p.classList.add('poked', `poke-${kind}`);
    p.addEventListener('animationend', function done(ev) {
      if (ev.target !== p) return;
      p.classList.remove('poked', `poke-${kind}`);
      p.removeEventListener('animationend', done);
    });
    if (p.dataset.sfx) play(p.dataset.sfx);
    if (p.dataset.say && onSay) {
      const lines = p.dataset.say.split('|');
      const n = sayTurn.get(p.dataset.say) ?? 0;
      sayTurn.set(p.dataset.say, n + 1);
      onSay(lines[n % lines.length]);
    }
    const fx = p.dataset.fx && FX[p.dataset.fx];
    if (fx) {
      // The burst starts near the top of the prop and is drawn on top of the whole area,
      // so hearts and friends pop up over Micah and the props instead of hiding behind them.
      const box = p.getBBox();
      const hearts = p.dataset.fx === 'heart';
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height * (hearts ? 0.12 : 0.4);
      let bits = '';
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * (hearts ? 0.3 : 0.45);
        const dist = hearts ? 30 + (i % 3) * 8 : 26;
        bits += `<g class="fx-bit${hearts ? ' fx-float' : ''}" style="--dx:${f(Math.cos(a) * dist)}px;--dy:${f(Math.sin(a) * dist)}px;animation-delay:${i * (hearts ? 60 : 20)}ms"><g transform="translate(${f(cx)} ${f(cy)})${hearts ? ' scale(1.4)' : ''}">${fx(i)}</g></g>`;
      }
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = bits;
      const svg = p.ownerSVGElement;
      const from = p.parentElement instanceof SVGGraphicsElement ? p.parentElement.getCTM() : null;
      const to = svg?.getCTM();
      if (svg && from && to) {
        const m = to.inverse().multiply(from);
        g.setAttribute('transform', `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map((n) => f(n)).join(' ')})`);
        svg.appendChild(g);
      } else p.parentElement!.appendChild(g);
      setTimeout(() => g.remove(), hearts ? 1500 : 900);
    }
  };
  root.addEventListener('click', onTap);

  // Only the areas on screen animate, which keeps long maps light on phones.
  const scroller = root.closest('.map-scroll');
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle('live', en.isIntersecting)),
    { root: scroller, rootMargin: '100px 0px' },
  );
  root.querySelectorAll('.zone-layer').forEach((l) => io.observe(l));
  return () => {
    root.removeEventListener('click', onTap);
    io.disconnect();
  };
}

// ───────────────────────────── level backdrop ─────────────────────────────

/**
 * Props for the animated scene behind a level (src/backdrop.ts): a short row standing
 * behind Micah's running path, and one low thing on the path for her to jump over.
 * Same art as the map, so each area looks like the place you just walked through.
 */
export function backdropProps(zone: number): { back: string[]; hurdle: string } {
  const r = rng(zone + 101);
  const sets: [(() => Prop)[], () => Prop][] = [
    [[() => tree('#5fae4f', '#4a9440'), () => fence(), () => doghouse(), () => flowers(r, PETALS), () => bush('#5fae4f', '#4a9440', '#e8352f')], () => hole()],
    [[() => tree('#3f8f47', '#2f7a3a', 1.1), () => bench(), () => lamp(), () => dog('#c9893f', '#8a5a26'), () => bush('#4a9a4a', '#3a823c')], () => hydrant()],
    [[() => palm(), () => umbrella('#e8352f', '#fff'), () => sandcastle(), () => bucket(), () => umbrella('#2f8fe0', '#fff')], () => starfish()],
    [[() => pine('#3f7f4a', '#2f6a3c', false, 1.1), () => log(), () => mushroom(), () => pine('#3f7f4a', '#2f6a3c'), () => fern('#5e9a45')], () => puddle()],
    [[() => balloon('#e8352f'), () => gift('#2f8fe0', '#ffc12e'), () => cupcake('#f6b8c8'), () => partyHat('#8e5bd6', '#ffc12e'), () => balloon('#ffc12e')], () => yarn('#8e5bd6', '#0003')],
    [[() => pine('#3f7f6a', '#2f6a58', true, 1.1), () => snowman(), () => drift(), () => pine('#3f7f6a', '#2f6a58', true), () => sled()], () => drift()],
    [[() => weave(), () => trophy(), () => podium(), () => rosette('#2f8fe0'), () => bush('#4a9a4a', '#3a823c')], () => jump()],
    [[() => cake(true), () => balloon('#2f8fe0'), () => gift('#8e5bd6', '#fff'), () => cupcake('#b38df0'), () => balloon('#e8352f')], () => gift('#e8352f', '#ffc12e')],
    [[() => tree('#4f8f5a', '#3e7a49'), () => umbrella('#2f8fe0', '#ffc12e'), () => wellies('#e8352f'), () => mushroom(), () => tree('#4f8f5a', '#3e7a49', 0.9)], () => puddle()],
    [[() => pine('#2f6a3c', '#245a31', false, 1.15), () => tent('#e8352f', '#a3201c'), () => campfire(), () => tent('#2f8fe0', '#1f5f9e'), () => pine('#2f6a3c', '#245a31')], () => log()],
    [[() => tree('#e8892f', '#c96a1f'), () => pumpkin(1.3), () => hay(), () => pumpkin(), () => tree('#d9541f', '#b8401a', 0.9)], () => pumpkin(0.8)],
    [[() => tent('#8e5bd6', '#5a3392'), () => pillow('#f6b8c8'), () => lamp(), () => pine('#3d4a7a', '#30395f'), () => pillow('#fff3c4')], () => pillow('#b38df0')],
    [[() => house('#fbf4e6', '#5d6f7c'), () => tree('#e8892f', '#c96a1f'), () => mailbox(), () => house('#cfe6f5', '#8a5a26', '#23925a'), () => fence()], () => leafPile()],
    [[() => tree('#d9541f', '#b8401a'), () => catWindow(), () => noahsArk(), () => bin(), () => lamp()], () => leafPile()],
    [[() => house('#ffe0ea', '#a3201c', '#2f8fe0'), () => lamp(), () => hydrant(), () => tree('#e8892f', '#c96a1f'), () => bin()], () => hydrant()],
    [[() => tree('#d9541f', '#b8401a'), () => pumpkin(), () => homePorch(), () => mailbox(), () => lamp()], () => leafPile()],
    [[() => bathtub(), () => towel('#e8352f', '#fff'), () => bush('#6fb36a', '#5a9e57'), () => hose(), () => fence()], () => duckToy()],
    [[() => tree('#5fae4f', '#4a9440'), () => grill(), () => picnic(), () => fence(), () => doghouse()], () => bone()],
    [[() => tree('#4fa55a', '#3f8f4a'), () => sprinkler(), () => umbrella('#ffc12e', '#fff'), () => pond(false), () => sprinkler()], () => puddle()],
    [[() => pine('#2f3d66', '#26325a'), () => lamp(), () => house('#c9cde8', '#3f4c72', '#ffe14d'), () => firefly(), () => lamp()], () => mailbox()],

    [[() => lighthouse(), () => rock('#9aa5ad'), () => lobsterTrap(), () => gull(), () => bush('#6f9a5a', '#5a8248')], () => buoy()],
    [[() => noahsArk(), () => saleTable(), () => raccoon(), () => parcelStack(), () => saleTable()], () => tire()],
    [[() => mesa(), () => cactus(), () => camper(), () => cactus(0.8), () => mesa()], () => tumbleweed()],
    [[() => barn(), () => sheep(), () => corn(), () => hay(), () => tractor()], () => chicken()],
    [[() => kelp(), () => coral('#ff8f5a'), () => chest(), () => coral('#ff9cc8'), () => kelp()], () => starfish()],
    [[() => van(), () => parcelStack(), () => pallet(), () => cone(), () => parcelStack()], () => cone()],
    [[() => tree('#ffc0d6', '#f29ab8', 1.1), () => bridge(), () => lamp(), () => tree('#ffd8e6', '#ffb0cc'), () => koiPond()], () => bush('#86b06a', '#6f9a58')],
    [[() => peak(), () => pine('#2f5f4a', '#244d3c', false, 1.1), () => goat(), () => cairn(), () => peak()], () => rock('#9aa5ad')],
    [[() => ferris(), () => bigTop(), () => cottonCandy(), () => balloon('#e8352f'), () => bigTop()], () => hay()],
    [[() => pine('#2f5a46', '#244a39', false, 1.15), () => cabin(), () => dock(), () => canoe(), () => pine('#2f5a46', '#244a39')], () => log()],

    [[() => sunflower(1.1), () => scarecrow(), () => burrBush(), () => sunflower(), () => bee()], () => hay()],
    [[() => greenhouse(), () => monstera(), () => parrot(), () => fern('#5fb37a'), () => greenhouse()], () => wateringCan()],
    [[() => cactus(0.8), () => eagle(), () => rock('#c8572a'), () => raft(), () => pine('#3f7f4a', '#2f6a3c')], () => rock('#c8572a')],
    [[() => pine('#2f4d5a', '#243d48', true, 1.1), () => fox(), () => iceCrystal(), () => sled(), () => pine('#2f4d5a', '#243d48', true)], () => drift()],
    [[() => oven(), () => flourSack(), () => cake(), () => breadBasket(), () => oven()], () => mixingBowl()],
    [[() => pillar(), () => dinoBones(), () => velvetRope(), () => fossil(), () => pillar()], () => fossil()],
    [[() => digger(), () => girders(), () => dirtPile(), () => barrier(), () => digger()], () => cone()],
    [[() => stationClock(), () => lamp(), () => suitcase('#e8352f'), () => bench(), () => suitcase('#2f8fe0')], () => suitcase('#ffc12e')],
    [[() => turbine(), () => kite('#e8352f', '#a3201c'), () => picnic(), () => kite('#2f8fe0', '#1f5f9e'), () => turbine()], () => ball()],
    [[() => burst('#e8352f'), () => lamp(), () => burst('#ffc12e'), () => blanket('#e8352f', '#fff'), () => burst('#5fe0a8')], () => sparkler()],
  ];
  const [back, hurdle] = sets[zone % sets.length];
  return { back: back.map((p) => p().svg), hurdle: hurdle().svg };
}
