// Micah's Yard: a long-term goal. Stars earned in levels are spent on things to build.
// The yard has three parts that open as you get further along the map: the Backyard,
// the Garden and the Front Porch. It follows the real clock: day, sunset and night.
import { KINDS, ORTHO_BED } from './art';
import { YOSHI } from './yoshi';
import { noahsArk } from './scenery';
import { SNACKS } from './snacks';
import { moundSVG } from './dig';
import { presentSVG } from './advent';

export type YardArea = 'back' | 'yoshi' | 'garden' | 'porch' | 'lake' | 'treehouse';
export type YardTime = 'day' | 'dusk' | 'night';

export interface Decor {
  id: string;
  name: string;
  desc: string;
  cost: number; // stars
  area: YardArea;
  /** Where it sits in the 360x300 yard scene. */
  x: number;
  y: number;
  w: number;
  svg: string; // drawn in a 100x100 box
}

export interface AreaInfo {
  id: YardArea;
  name: string;
  /** The map level that has to be cleared before this part of the yard opens (0 = open from the start). */
  opensAt: number;
}

export const AREAS: AreaInfo[] = [
  { id: 'back', name: 'Backyard', opensAt: 0 },
  { id: 'yoshi', name: 'Yoshi’s Corner', opensAt: 15 },
  { id: 'garden', name: 'Garden', opensAt: 30 },
  { id: 'porch', name: 'Front Porch', opensAt: 60 },
  { id: 'lake', name: 'Lakeside', opensAt: 150 },
  { id: 'treehouse', name: 'Treehouse', opensAt: 200 },
];

export const areaOpen = (a: AreaInfo, stars: Record<number, number>): boolean => !a.opensAt || (stars[a.opensAt] ?? 0) > 0;

/** Day from 7 AM, sunset from 5 PM, night from 8 PM (the player's own clock). */
export function yardTime(d: Date = new Date()): YardTime {
  const h = d.getHours();
  if (h >= 20 || h < 7) return 'night';
  if (h >= 17) return 'dusk';
  return 'day';
}

// ───────────────────────────── Backyard ─────────────────────────────

const doghouse = `
<path d="M18 44 H82 V90 H18 Z" fill="#c98a4b" stroke="#7a4f25" stroke-width="3"/>
<path d="M66 46 H80 V88 H66 Z" fill="#b07638"/>
<path d="M18 58 H82 M18 72 H82" stroke="#7a4f25" stroke-width="2" opacity=".5"/>
<path d="M30 52 v4 M58 64 v5 M26 80 v5 M72 78 v5" stroke="#7a4f25" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>
<circle cx="24" cy="66" r="1.3" fill="#7a4f25" opacity=".6"/><circle cx="76" cy="54" r="1.3" fill="#7a4f25" opacity=".6"/>
<path d="M38 90 V68 A12 12 0 0 1 62 68 V90 Z" fill="#3b2a1d" stroke="#7a4f25" stroke-width="2.5"/>
<path d="M41 90 V69 A9 9 0 0 1 50 59.5" fill="none" stroke="#000" stroke-width="3" opacity=".25"/>
<path d="M14 90 H86" stroke="#7a4f25" stroke-width="3" stroke-linecap="round"/>
<path d="M10 46 L50 12 L90 46 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 12 L90 46 H70 Z" fill="#c92a25"/>
<path d="M22 40 L50 17 M30 42 L50 25" stroke="#ff8a7a" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
<path d="M10 46 L50 12 L90 46" fill="none" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<rect x="34" y="48" width="32" height="10" rx="2" fill="#fff" stroke="#7a4f25" stroke-width="1"/>
<text x="50" y="56" text-anchor="middle" font-size="8" font-weight="900" fill="#173a52" font-family="sans-serif">MICAH</text>
<g transform="translate(70 84)"><path d="M-6 2 L-4 -3 h12 L10 2 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="1.5" stroke-linejoin="round"/><path d="M-3 -3.5 q5 -2 10 0" fill="none" stroke="#a86b35" stroke-width="2"/></g>`;

const tree = `
<path d="M44 94 L45 58 H55 L56 94 Q60 95 63 97 H37 Q40 95 44 94 Z" fill="#7a4f25"/>
<path d="M51 58 H55 L56 94 Q60 95 63 97 H52 Z" fill="#5e3a1a"/>
<path d="M48 66 v6 M47 80 v5 M53 74 v4" stroke="#5e3a1a" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="50" cy="38" r="30" fill="#4f9a4a"/>
<path d="M80 40 A30 30 0 0 1 30 61 Q58 64 80 40 Z" fill="#3f8040"/>
<circle cx="34" cy="48" r="18" fill="#5fae57"/><circle cx="66" cy="46" r="18" fill="#5fae57"/>
<circle cx="46" cy="24" r="12" fill="#5fae57"/>
<path d="M78 50 A14 14 0 0 1 62 61 M46 60 A14 14 0 0 1 28 62 M56 28 A10 10 0 0 1 48 35" fill="none" stroke="#3f8040" stroke-width="2.2" stroke-linecap="round"/>
<ellipse cx="40" cy="18" rx="6" ry="3.6" fill="#fff" opacity=".22"/><ellipse cx="27" cy="40" rx="5" ry="3" fill="#fff" opacity=".18"/>
<g stroke="#a3201c" stroke-width="1.2"><circle cx="40" cy="30" r="5" fill="#e8352f"/><circle cx="62" cy="26" r="5" fill="#e8352f"/><circle cx="56" cy="50" r="5" fill="#e8352f"/><circle cx="24" cy="54" r="4.5" fill="#e8352f"/></g>
<g fill="#fff" opacity=".7"><circle cx="38.4" cy="28.4" r="1.4"/><circle cx="60.4" cy="24.4" r="1.4"/><circle cx="54.4" cy="48.4" r="1.4"/><circle cx="22.6" cy="52.6" r="1.2"/></g>
<path d="M40 25 q1 -3 3 -4 M62 21 q1 -3 3 -4" stroke="#4f3a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
<g transform="translate(72 92)"><circle r="4.5" fill="#e8352f" stroke="#a3201c" stroke-width="1.2"/><path d="M-1 -4 q1 -3 3 -3" stroke="#4f3a1a" stroke-width="1.3" fill="none"/><path d="M1 -1.5 l2.5 2 l-1 2 Z" fill="#f6e7c8"/></g>`;

const ballPit = `
<g transform="translate(10 18) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(34 12) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(58 18) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(22 30) scale(.32)">${KINDS[1].svg}</g>
<g transform="translate(48 30) scale(.32)">${KINDS[1].svg}</g>
<path d="M8 50 H92 L84 90 H16 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="3" stroke-linejoin="round"/>
<path d="M74 52 H90 L83 88 H70 Z" fill="#2274c2"/>
<path d="M6 50 H94" stroke="#8fd0ff" stroke-width="5" stroke-linecap="round"/>
<path d="M6 50 H94" stroke="#17599a" stroke-width="1.5" stroke-linecap="round" transform="translate(0 3)" opacity=".6"/>
<path d="M20 58 L24 82" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
<g fill="#fff" opacity=".9"><ellipse cx="50" cy="73" rx="5" ry="4"/><circle cx="44" cy="67" r="2"/><circle cx="48" cy="64" r="2"/><circle cx="53" cy="64" r="2"/><circle cx="57" cy="67" r="2"/></g>`;

const sprinkler = `
<rect x="44" y="60" width="12" height="30" rx="3" fill="#8a96a0"/>
<circle cx="50" cy="58" r="9" fill="#5d6f7c"/>
<path d="M50 50 Q30 20 10 30 M50 50 Q50 14 50 8 M50 50 Q70 20 90 30" stroke="#6fc3f0" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="2 7"/>`;

const hydrant = `
<ellipse cx="50" cy="94" rx="26" ry="4" fill="#000" opacity=".15"/>
<rect x="28" y="86" width="44" height="8" rx="3" fill="#a3201c"/>
<rect x="34" y="34" width="32" height="54" rx="6" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<path d="M56 36 H63 Q65 36 65 40 V84 Q65 87 62 87 H56 Z" fill="#c92a25"/>
<path d="M40 40 V82" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round" opacity=".75"/>
<rect x="31" y="44" width="38" height="6" rx="2" fill="#c92a25" stroke="#a3201c" stroke-width="2"/>
<path d="M30 34 H70 A20 16 0 0 0 30 34 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<path d="M38 28 Q44 22 52 21" stroke="#ff8a7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<rect x="46" y="12" width="8" height="7" rx="1.5" fill="#a3201c"/>
<rect x="20" y="52" width="14" height="12" rx="3" fill="#a3201c"/><rect x="66" y="52" width="14" height="12" rx="3" fill="#a3201c"/>
<circle cx="18" cy="58" r="3.5" fill="#c92a25" stroke="#7d1512" stroke-width="1.5"/><circle cx="82" cy="58" r="3.5" fill="#c92a25" stroke="#7d1512" stroke-width="1.5"/>
<circle cx="50" cy="66" r="7" fill="#c92a25" stroke="#a3201c" stroke-width="2"/><path d="M47 66 h6 M50 63 v6" stroke="#7d1512" stroke-width="1.6"/>
<g fill="#7d1512"><circle cx="36" cy="88" r="1.2"/><circle cx="64" cy="88" r="1.2"/></g>`;

const flowers = `
<ellipse cx="50" cy="80" rx="44" ry="14" fill="#7a5233"/>
${[18, 36, 54, 72].map((x, i) => `<path d="M${x + 4} 78 V52" stroke="#3f8a3a" stroke-width="3"/><circle cx="${x + 4}" cy="48" r="9" fill="${['#ffc12e', '#e8352f', '#ffffff', '#ff8fb1'][i]}"/><circle cx="${x + 4}" cy="48" r="3.5" fill="#7a4f25"/>`).join('')}`;

const dustBath = `
<ellipse cx="50" cy="78" rx="44" ry="16" fill="#2f8fe0" stroke="#17599a" stroke-width="3"/>
<ellipse cx="50" cy="74" rx="36" ry="10" fill="#e9dcc0"/>
<path d="M26 74 q6 -4 12 0 M56 72 q6 -4 12 0" stroke="#cdbb95" stroke-width="2" fill="none" stroke-linecap="round"/>
<g fill="#f4ead6" opacity=".9"><circle cx="30" cy="56" r="6"/><circle cx="40" cy="48" r="4"/><circle cx="70" cy="54" r="7"/><circle cx="62" cy="44" r="3.5"/></g>
<rect x="38" y="84" width="24" height="7" rx="2" fill="#fff"/><text x="50" y="90" text-anchor="middle" font-size="6" font-weight="900" fill="#173a52" font-family="sans-serif">YOSHI</text>`;

/** The shelf of things Micah has eaten out of the sky. Empty spots show a "?". */
export function museum(ate: string[] | null): string {
  const slots = SNACKS.slice(0, 10).map((s, i) => {
    const cx = 16 + (i % 5) * 17;
    const cy = i < 5 ? 42 : 72;
    const has = ate === null ? i < 4 : ate.includes(s.id);
    return has
      ? `<g transform="translate(${cx} ${cy}) scale(.58)">${s.svg}</g>`
      : `<g opacity=".5"><circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="2.5 2.5"/><text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="8" font-weight="900" fill="#fff" font-family="sans-serif">?</text></g>`;
  }).join('');
  return `
<rect x="4" y="22" width="92" height="70" rx="4" fill="#7a4f25" stroke="#4a2f14" stroke-width="3"/>
<rect x="9" y="28" width="82" height="27" fill="#3b2a1d"/><rect x="9" y="59" width="82" height="27" fill="#3b2a1d"/>
<rect x="4" y="5" width="92" height="16" rx="3" fill="#e8352f" stroke="#a3201c" stroke-width="2.5"/>
<text x="50" y="16.5" text-anchor="middle" font-size="8.6" font-weight="900" fill="#fff" font-family="sans-serif">THINGS MICAH ATE</text>
${slots}
<rect x="14" y="92" width="8" height="6" fill="#4a2f14"/><rect x="78" y="92" width="8" height="6" fill="#4a2f14"/>`;
}

// ───────────────────────────── Yoshi's Corner ─────────────────────────────

const hidey = `
<path d="M10 90 L50 30 L90 90 Z" fill="#c8a57a" stroke="#8a6a45" stroke-width="3" stroke-linejoin="round"/>
<path d="M24 69 H76 M17 80 H83 M31 58 H69 M38 47 H62" stroke="#a3845c" stroke-width="2"/>
<path d="M6 92 L50 24 L94 92" fill="none" stroke="#7a4f25" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 90 V76 A14 14 0 0 1 64 76 V90 Z" fill="#3b2a1d"/>
<rect x="40" y="40" width="20" height="9" rx="2" fill="#fff"/><text x="50" y="47" text-anchor="middle" font-size="6.4" font-weight="900" fill="#173a52" font-family="sans-serif">YOSHI</text>`;

const hayRack = `
<rect x="16" y="20" width="68" height="8" rx="3" fill="#7a4f25"/>
<path d="M22 28 L30 70 H70 L78 28" fill="#e6c766" stroke="#7a4f25" stroke-width="3" stroke-linejoin="round"/>
<path d="M30 28 L36 70 M42 28 L44 70 M54 28 L52 70 M66 28 L62 70" stroke="#7a4f25" stroke-width="2.4"/>
<g stroke="#c9a640" stroke-width="2" stroke-linecap="round"><path d="M26 22 l-6 -12 M34 20 l-2 -14 M46 20 l2 -15 M58 21 l5 -13 M70 22 l8 -11"/><path d="M34 72 l-4 10 M48 72 l1 12 M62 72 l5 9"/></g>
<rect x="46" y="70" width="8" height="24" fill="#7a4f25"/><rect x="34" y="90" width="32" height="6" rx="2" fill="#5e3e25"/>`;

const runWheel = `
<path d="M50 50 L30 94 M50 50 L70 94" stroke="#5d6f7c" stroke-width="5" stroke-linecap="round"/>
<rect x="22" y="90" width="56" height="6" rx="3" fill="#5d6f7c"/>
<g class="wheel-spin"><circle cx="50" cy="50" r="40" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<circle cx="50" cy="50" r="33" fill="#ffd5cf"/>
<path d="M50 17 V83 M17 50 H83 M27 27 L73 73 M73 27 L27 73" stroke="#e8352f" stroke-width="2.5" opacity=".55"/>
<circle cx="50" cy="50" r="7" fill="#a3201c"/></g>`;

const ledges = `
<rect x="46" y="8" width="8" height="86" rx="2" fill="#7a4f25"/>
<rect x="14" y="68" width="40" height="7" rx="2" fill="#c8a57a" stroke="#8a6a45" stroke-width="2"/>
<rect x="46" y="44" width="40" height="7" rx="2" fill="#c8a57a" stroke="#8a6a45" stroke-width="2"/>
<rect x="14" y="20" width="40" height="7" rx="2" fill="#c8a57a" stroke="#8a6a45" stroke-width="2"/>
<rect x="34" y="90" width="32" height="6" rx="2" fill="#5e3e25"/>`;

const chewPot = `
<path d="M28 9 L40 60 M42 6 L46 60 M58 7 L54 60 M72 12 L60 60" stroke="#8a5a33" stroke-width="5" stroke-linecap="round"/>
<path d="M28 9 l-3 -4 M58 7 l3 -4" stroke="#6b4528" stroke-width="3" stroke-linecap="round"/>
<path d="M22 54 H78 L70 94 H30 Z" fill="#c96a3c" stroke="#8f4320" stroke-width="3" stroke-linejoin="round"/>
<rect x="18" y="50" width="64" height="10" rx="3" fill="#d97b4c" stroke="#8f4320" stroke-width="3"/>
<circle cx="50" cy="76" r="7" fill="#e8352f"/><path d="M50 69 q2 -4 5 -4" stroke="#4f9a4a" stroke-width="2" fill="none"/>`;

const napBlanket = `
<path d="M6 66 Q50 54 94 66 L90 92 Q50 84 10 92 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M28 62 L26 89 M50 59 L50 86 M72 62 L74 89" stroke="#ffffff" stroke-width="3" opacity=".75"/>
<path d="M8 74 Q50 64 92 74 M9 83 Q50 74 91 83" stroke="#173a52" stroke-width="2.4" fill="none" opacity=".5"/>
<ellipse cx="22" cy="70" rx="10" ry="5" fill="#fff" stroke="#c9d3da" stroke-width="1.5"/>`;

// ───────────────────────────── Garden ─────────────────────────────

const veggies = `
<rect x="4" y="54" width="92" height="36" rx="6" fill="#7a5233" stroke="#4f3520" stroke-width="3"/>
<path d="M10 66 H90 M10 78 H90" stroke="#5e3e25" stroke-width="2"/>
${[16, 32, 48, 64, 80].map((x) => `<path d="M${x} 64 l-4 -10 M${x} 64 l0 -12 M${x} 64 l4 -10 M${x + 6} 76 l-4 -9 M${x + 6} 76 l0 -11 M${x + 6} 76 l4 -9" stroke="#4f9a4a" stroke-width="3" stroke-linecap="round"/>`).join('')}
<g transform="translate(62 92) rotate(-12)"><path d="M0 -4 L26 -1 L0 4 Z" fill="#f08a24" stroke="#b85f12" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 -3 l-6 -5 M0 0 l-8 0 M0 3 l-6 5" stroke="#4f9a4a" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="0" r="4" fill="#7db86a"/></g>`;

const birdbath = `
<path d="M42 90 L46 48 H54 L58 90 Z" fill="#b7c0c7" stroke="#6f7c86" stroke-width="2.5"/>
<rect x="32" y="86" width="36" height="8" rx="3" fill="#9aa5ad" stroke="#6f7c86" stroke-width="2"/>
<path d="M14 40 H86 Q80 54 50 54 Q20 54 14 40 Z" fill="#b7c0c7" stroke="#6f7c86" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="50" cy="41" rx="33" ry="4" fill="#6fc3f0"/>
<g transform="translate(70 32)"><ellipse cx="0" cy="0" rx="8" ry="6" fill="#2f8fe0"/><circle cx="-6" cy="-5" r="4.5" fill="#2f8fe0"/><path d="M-10 -5 l-4 1 4 1.5 Z" fill="#ffc12e"/><circle cx="-7" cy="-6" r="1" fill="#111"/><path d="M6 -2 l7 -3 -2 5 Z" fill="#17599a"/></g>`;

const wheelbarrow = `
<path d="M6 44 H76 L66 74 H20 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<path d="M12 44 Q40 30 72 44 Z" fill="#7a5233"/>
<g transform="translate(46 34) scale(.3)">${KINDS[1].svg}</g>
<path d="M66 60 L96 52 M64 68 L94 62" stroke="#7a4f25" stroke-width="4" stroke-linecap="round"/>
<path d="M26 74 L22 92 M58 74 L60 92" stroke="#5d6f7c" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="42" cy="84" r="10" fill="#3b3f46"/><circle cx="42" cy="84" r="4" fill="#9aa5ad"/>`;

const compost = `
<rect x="10" y="36" width="80" height="56" fill="#8b5a2b" stroke="#5a3a1a" stroke-width="3"/>
<path d="M10 50 H90 M10 64 H90 M10 78 H90" stroke="#5a3a1a" stroke-width="2"/>
<path d="M12 38 Q26 22 40 34 Q52 20 64 32 Q78 22 88 38 Z" fill="#5e3e25"/>
<path d="M30 30 q6 -10 12 -2 q-2 4 -6 4 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="1.5"/>
<path d="M58 28 l8 -6 3 4 -8 5 Z" fill="#f08a24"/><circle cx="74" cy="30" r="4" fill="#e8352f"/>
<rect x="30" y="56" width="40" height="13" rx="2" fill="#fff"/><text x="50" y="65.5" text-anchor="middle" font-size="7" font-weight="900" fill="#173a52" font-family="sans-serif">BUFFET</text>`;

const gnome = `
<ellipse cx="50" cy="90" rx="22" ry="5" fill="#5e3e25" opacity=".5"/>
<path d="M30 90 Q30 56 50 54 Q70 56 70 90 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="2.5"/>
<path d="M34 54 Q50 82 66 54 Q58 48 50 50 Q42 48 34 54 Z" fill="#ffffff" stroke="#c9d3da" stroke-width="2"/>
<circle cx="50" cy="48" r="9" fill="#f2c7a5" stroke="#c99a74" stroke-width="1.5"/>
<circle cx="46" cy="47" r="1.5" fill="#173a52"/><circle cx="54" cy="47" r="1.5" fill="#173a52"/><circle cx="50" cy="51" r="3" fill="#e89a86"/>
<path d="M36 42 Q44 6 64 10 Q58 20 62 26 Q56 28 60 34 L64 42 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M64 10 q-4 4 0 6 q-4 2 -1 5" stroke="#a3201c" stroke-width="1.5" fill="none"/>`;

const hammock = `
<rect x="6" y="20" width="7" height="74" rx="2" fill="#7a4f25"/><rect x="87" y="20" width="7" height="74" rx="2" fill="#7a4f25"/>
<path d="M12 30 Q50 78 88 30" stroke="#c9d3da" stroke-width="2" fill="none"/>
<path d="M12 30 Q50 70 88 30 L88 36 Q50 84 12 36 Z" fill="#ffffff" stroke="#17599a" stroke-width="2.5"/>
<path d="M28 44 Q30 60 34 62 M46 50 Q48 66 50 68 M64 48 Q66 62 68 62" stroke="#e8352f" stroke-width="5" fill="none"/>`;

const pond = `
<ellipse cx="50" cy="70" rx="48" ry="22" fill="#5e3e25" opacity=".35"/>
<ellipse cx="50" cy="68" rx="44" ry="18" fill="#2f8fe0" stroke="#17599a" stroke-width="3"/>
<path d="M22 66 q8 -4 16 0 M54 76 q8 -4 16 0" stroke="#9fd8f7" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M60 60 A10 6 0 1 1 72 66 L66 62 Z" fill="#4f9a4a"/>
<g transform="translate(66 58)"><ellipse cx="0" cy="0" rx="7" ry="5" fill="#5fae57" stroke="#2f6a3c" stroke-width="1.4"/><circle cx="-3" cy="-5" r="2.6" fill="#5fae57" stroke="#2f6a3c" stroke-width="1.2"/><circle cx="3" cy="-5" r="2.6" fill="#5fae57" stroke="#2f6a3c" stroke-width="1.2"/><circle cx="-3" cy="-5" r="1" fill="#111"/><circle cx="3" cy="-5" r="1" fill="#111"/></g>
<path d="M10 58 V30 M16 56 V36 M88 60 V34" stroke="#3f8a3a" stroke-width="2.5"/><ellipse cx="10" cy="30" rx="2.6" ry="7" fill="#7a4f25"/><ellipse cx="88" cy="34" rx="2.6" ry="7" fill="#7a4f25"/>`;

// ───────────────────────────── Front Porch ─────────────────────────────

const mat = `
<rect x="4" y="62" width="92" height="26" rx="4" fill="#b88a4c" stroke="#7a5233" stroke-width="2.5"/>
<rect x="9" y="66" width="82" height="18" rx="2" fill="none" stroke="#7a5233" stroke-width="1.4" stroke-dasharray="3 2"/>
<text x="50" y="73.5" text-anchor="middle" font-size="6.6" font-weight="900" fill="#5e3e25" font-family="sans-serif">BEWARE OF</text>
<text x="50" y="81.5" text-anchor="middle" font-size="7.6" font-weight="900" fill="#e8352f" font-family="sans-serif">LOBSTER</text>`;

const rocker = `
<path d="M10 90 Q50 100 90 90" stroke="#7a4f25" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M24 92 L28 60 M72 92 L68 60" stroke="#8b5a2b" stroke-width="5" stroke-linecap="round"/>
<rect x="22" y="54" width="54" height="10" rx="3" fill="#e8352f" stroke="#a3201c" stroke-width="2"/>
<path d="M26 56 L32 10 M70 56 L64 10" stroke="#8b5a2b" stroke-width="5" stroke-linecap="round"/>
<path d="M30 18 H66 M30 30 H66 M29 42 H67" stroke="#8b5a2b" stroke-width="4"/>
<path d="M16 46 H30 M66 46 H82" stroke="#7a4f25" stroke-width="5" stroke-linecap="round"/>`;

const swing = `
<path d="M14 0 L20 52 M86 0 L80 52" stroke="#5d6f7c" stroke-width="2" stroke-dasharray="3 2"/>
<rect x="10" y="30" width="80" height="22" rx="3" fill="#ffffff" stroke="#8a96a0" stroke-width="2.5"/>
<path d="M22 30 V52 M34 30 V52 M46 30 V52 M58 30 V52 M70 30 V52" stroke="#c9d3da" stroke-width="2"/>
<rect x="6" y="52" width="88" height="10" rx="3" fill="#ffffff" stroke="#8a96a0" stroke-width="2.5"/>
<rect x="18" y="42" width="24" height="12" rx="5" fill="#2f8fe0"/><rect x="58" y="42" width="24" height="12" rx="5" fill="#e8352f"/>`;

const mailbox = `
<ellipse cx="50" cy="94" rx="18" ry="3" fill="#000" opacity=".15"/>
<rect x="45" y="46" width="10" height="48" fill="#7a4f25"/>
<rect x="51" y="46" width="4" height="48" fill="#5e3a1a"/>
<path d="M18 48 V30 A16 16 0 0 1 50 30 V48 Z" fill="#173a52" stroke="#0e2536" stroke-width="2.5"/>
<path d="M50 48 H82 V30 A16 16 0 0 0 50 30" fill="#2b5a78" stroke="#0e2536" stroke-width="2.5"/>
<path d="M58 26 Q64 18 74 20" stroke="#6f9fc4" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M22 46 V32 A12 12 0 0 1 34 20" fill="none" stroke="#2b5a78" stroke-width="2"/>
<circle cx="34" cy="36" r="2.5" fill="#ffc12e" stroke="#0e2536" stroke-width="1"/>
<path d="M20 44 l10 -10" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/><path d="M19 41 l8 -8" stroke="#e8352f" stroke-width="1.2" opacity=".9"/>
<rect x="76" y="14" width="5" height="24" fill="#5d6f7c"/><rect x="76" y="14" width="14" height="9" fill="#e8352f"/>
<circle cx="78.5" cy="36" r="1.8" fill="#9fb0bd"/>
<text x="66" y="42" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="sans-serif">MAIL</text>`;

const pumpkin = `
<ellipse cx="50" cy="93" rx="36" ry="4" fill="#000" opacity=".15"/>
<ellipse cx="50" cy="66" rx="40" ry="28" fill="#f08a24" stroke="#b85f12" stroke-width="3"/>
<path d="M72 46 Q82 66 72 88 Q86 82 89 66 Q88 50 72 46 Z" fill="#d97316"/>
<path d="M28 46 Q18 66 28 88 Q14 82 11 66 Q12 50 28 46 Z" fill="#f59a3a"/>
<path d="M50 40 Q36 66 50 94 M50 40 Q64 66 50 94 M28 46 Q18 66 28 88 M72 46 Q82 66 72 88" stroke="#b85f12" stroke-width="2" fill="none"/>
<path d="M36 50 Q32 62 35 74" stroke="#ffc27a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M48 40 Q46 26 56 22" stroke="#4f8a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M47 36 Q42 32 34 34 Q38 40 46 39" fill="#5fae57" stroke="#3f7f40" stroke-width="1.5"/>
<path d="M56 24 q6 -4 8 2 q-4 4 -2 8" stroke="#4f8a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M78 50 a9 9 0 0 1 9 14 a6 6 0 0 0 -9 -14 Z" fill="#173a52"/>
<path d="M80 52 l2 2 M84 56 l2 1 M85 61 l2 0" stroke="#fff2d6" stroke-width="1.6" stroke-linecap="round"/>`;

const chimes = `
<path d="M50 0 V14" stroke="#5d6f7c" stroke-width="2"/>
<ellipse cx="50" cy="16" rx="26" ry="5" fill="#8b5a2b"/>
${[30, 40, 50, 60, 70].map((x, i) => `<path d="M${x} 18 V28" stroke="#5d6f7c" stroke-width="1"/><rect x="${x - 2.5}" y="28" width="5" height="${30 + (i % 3) * 10}" rx="2" fill="#c9d3da" stroke="#8a96a0" stroke-width="1"/>`).join('')}
<path d="M50 18 V82" stroke="#5d6f7c" stroke-width="1"/>
<g transform="translate(50 90) scale(.22)"><g transform="translate(-50 -50)">${KINDS[4].svg}</g></g>`;

const lamp = `
<rect x="46" y="36" width="8" height="58" fill="#3b3f46"/>
<rect x="36" y="88" width="28" height="6" rx="2" fill="#3b3f46"/>
<path d="M36 14 H64 L60 38 H40 Z" fill="#ffe27a" stroke="#3b3f46" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 14 V38 M38 26 H62" stroke="#3b3f46" stroke-width="2"/>
<path d="M32 14 L50 2 L68 14 Z" fill="#3b3f46"/>`;

// ───────────────────────────── Treehouse (opens after level 200) ─────────────────────────────

const fortArt = `
<path d="M22 100 V62 M78 100 V62" stroke="#6b4529" stroke-width="6" stroke-linecap="round"/>
<path d="M8 60 H92 V68 H8 Z" fill="#a7784a" stroke="#6b4529" stroke-width="2.4"/>
<path d="M14 60 V30 H86 V60 Z" fill="#c9893f" stroke="#6b4529" stroke-width="2.4"/>
<path d="M14 38 H86 M14 46 H86 M14 54 H86" stroke="#a7784a" stroke-width="1.4"/>
<path d="M6 32 L50 6 L94 32 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2.4" stroke-linejoin="round"/>
<rect x="24" y="36" width="18" height="16" fill="#bfe6ff" stroke="#fff" stroke-width="2.4"/><path d="M33 36 V52" stroke="#fff" stroke-width="1.6"/>
<path d="M56 60 V40 Q66 32 76 40 V60 Z" fill="#4a3220"/>
<text x="50" y="66.5" text-anchor="middle" font-size="5.5" font-weight="900" fill="#fff4e0" font-family="sans-serif">NO CATS</text>`;

const ladderArt = `
<path d="M30 0 Q26 50 32 100 M70 0 Q74 50 68 100" stroke="#c9a066" stroke-width="3.4" fill="none"/>
${[14, 32, 50, 68, 86].map((y) => `<rect x="28" y="${y}" width="44" height="6" rx="2" fill="#a7784a" stroke="#6b4529" stroke-width="1.4"/>`).join('')}`;

const slideArt = `
<path d="M10 20 Q46 30 66 70 Q76 90 96 92" stroke="#e8352f" stroke-width="16" fill="none" stroke-linecap="round"/>
<path d="M10 20 Q46 30 66 70 Q76 90 96 92" stroke="#ff8a7a" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
<path d="M44 34 V96 M74 82 V98" stroke="#5d6f7c" stroke-width="4" stroke-linecap="round"/>`;

const pulleyArt = `
<path d="M50 0 V58" stroke="#c9a066" stroke-width="2"/><circle cx="50" cy="4" r="5" fill="#5d6f7c"/>
<path d="M30 58 H70 L64 92 H36 Z" fill="#2f8fe0" stroke="#1f5f9e" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M30 58 Q50 44 70 58" stroke="#5d6f7c" stroke-width="2" fill="none"/>
<circle cx="42" cy="56" r="5" fill="#c9893f"/><circle cx="54" cy="54" r="5" fill="#a7784a"/><circle cx="62" cy="57" r="4" fill="#c9893f"/>
<text x="50" y="80" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="sans-serif">SNACKS</text>`;

const tireSwingArt = `
<path d="M0 6 Q50 -2 100 8" stroke="#6b4529" stroke-width="9" fill="none" stroke-linecap="round"/>
<g class="yard-sway"><path d="M50 4 V56" stroke="#c9a066" stroke-width="2.6"/><ellipse cx="50" cy="72" rx="24" ry="18" fill="#2b2b2b"/><ellipse cx="50" cy="72" rx="12" ry="8" fill="none" stroke="#454545" stroke-width="2"/><ellipse cx="50" cy="72" rx="9" ry="5" fill="#5f9c55" opacity=".8"/></g>`;

const birdhouseArt = `
<path d="M50 40 V100" stroke="#6b4529" stroke-width="6" stroke-linecap="round"/>
<path d="M28 40 V16 L50 2 L72 16 V40 Z" fill="#ffc12e" stroke="#c49a1a" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M22 18 L50 -2 L78 18" stroke="#e8352f" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="50" cy="24" r="6" fill="#4a3220"/><path d="M44 34 H56" stroke="#6b4529" stroke-width="2.4"/>`;

const telescopeArt = `
<path d="M50 60 L30 98 M50 60 L70 98 M50 60 V98" stroke="#5d6f7c" stroke-width="3.4" stroke-linecap="round"/>
<g transform="rotate(-28 50 56)"><rect x="14" y="48" width="64" height="16" rx="4" fill="#e8352f" stroke="#a3201c" stroke-width="2.4"/><rect x="76" y="45" width="12" height="22" rx="3" fill="#ffc12e" stroke="#c49a1a" stroke-width="2"/><rect x="6" y="51" width="10" height="10" rx="2" fill="#3b3f46"/></g>`;

const beanbagArt = `
<ellipse cx="50" cy="93" rx="40" ry="4" fill="#000" opacity=".15"/>
<path d="M10 88 Q4 52 30 42 Q52 34 72 42 Q96 52 90 88 Q50 100 10 88 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<path d="M72 44 Q94 54 89 87 Q72 93 60 93 Q80 80 72 44 Z" fill="#c92a25"/>
<path d="M26 60 Q50 72 76 60" stroke="#a3201c" stroke-width="2.4" fill="none"/>
<path d="M30 62 Q34 78 22 88 M66 64 Q64 80 74 90" stroke="#a3201c" stroke-width="2" fill="none" opacity=".6"/>
<path d="M50 38 V46" stroke="#a3201c" stroke-width="1.6" stroke-dasharray="2 2"/>
<ellipse cx="38" cy="52" rx="10" ry="4" fill="#ff8a7a" opacity=".6"/>
<path d="M16 76 Q16 64 22 58" stroke="#ff8a7a" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>
<rect x="44" y="80" width="12" height="7" rx="1.5" fill="#fff" opacity=".85"/><path d="M47 83.5 h6" stroke="#a3201c" stroke-width="1"/>`;


// ───────────────────────────── Lakeside (opens after level 150) ─────────────────────────────

const dockArt = `
<path d="M6 40 L94 40 L86 70 L14 70 Z" fill="#c9a66b" stroke="#8a6a3a" stroke-width="3" stroke-linejoin="round"/>
<path d="M28 40 L24 70 M50 40 V70 M72 40 L76 70" stroke="#8a6a3a" stroke-width="2"/>
<path d="M16 70 V92 M84 70 V92 M16 40 V22 M84 40 V22" stroke="#6b4529" stroke-width="6" stroke-linecap="round"/>
<path d="M12 90 h8 M80 90 h8" stroke="#bfe2f2" stroke-width="3" stroke-linecap="round"/>`;

const chairArt = `
<path d="M24 92 L40 52 M76 92 L60 52 M24 52 L76 92 M76 52 L24 92" stroke="#3b3f46" stroke-width="4" stroke-linecap="round"/>
<path d="M28 20 H72 V58 H28 Z" fill="#2f8fe0" stroke="#1f5f9e" stroke-width="3" stroke-linejoin="round"/>
<path d="M22 56 H78 V66 H22 Z" fill="#2f8fe0" stroke="#1f5f9e" stroke-width="3"/>
<path d="M28 36 H72" stroke="#fff" stroke-width="3" opacity=".6"/>
<rect x="62" y="64" width="12" height="14" rx="3" fill="#e8352f"/>`;

const canoeArt = `
<ellipse cx="50" cy="80" rx="42" ry="4" fill="#173a52" opacity=".18"/>
<path d="M4 58 Q50 92 96 58 Q50 70 4 58 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<path d="M20 70 Q50 86 82 70 Q66 84 50 85 Q32 84 20 70 Z" fill="#c92a25"/>
<path d="M4 58 Q50 70 96 58" stroke="#ffd2cc" stroke-width="2.4" fill="none"/>
<path d="M14 64 Q50 76 86 64" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/>
<path d="M30 66 H40 M60 66 H70" stroke="#a7784a" stroke-width="4"/>
<path d="M58 30 L36 80" stroke="#a7784a" stroke-width="3.4" stroke-linecap="round"/><path d="M57 32 L46 57" stroke="#d9b07a" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="34" cy="84" rx="5" ry="9" fill="#a7784a" transform="rotate(24 34 84)"/>`;

const tentArt = `
<ellipse cx="50" cy="91" rx="46" ry="4" fill="#000" opacity=".15"/>
<path d="M2 92 L12 88 M98 92 L88 88" stroke="#6b4529" stroke-width="2" stroke-linecap="round"/>
<path d="M6 90 L50 14 L94 90 Z" fill="#23925a" stroke="#176a40" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 14 L94 90 H74 Z" fill="#1d7f4e"/>
<path d="M50 14 L36 90 H64 Z" fill="#176a40"/>
<path d="M20 70 L44 26" stroke="#5cc28a" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
<path d="M50 14 L50 6" stroke="#6b4529" stroke-width="3"/><path d="M50 6 L62 10 L50 13 Z" fill="#e8352f"/>
<path d="M40 90 Q50 60 60 90" fill="#0e3d24"/>
<path d="M36 90 Q40 70 46 62" stroke="#2fa86a" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M14 88 L50 22 M86 88 L50 22" stroke="#0e3d24" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>
<text x="50" y="84" text-anchor="middle" font-size="7" font-weight="900" fill="#ffc12e" font-family="sans-serif">MICAH</text>`;

const firepitArt = `
<ellipse cx="50" cy="78" rx="40" ry="14" fill="#5d6f7c"/>
<g fill="#8f9aa0" stroke="#5d6f7c" stroke-width="2">${[14, 30, 50, 70, 86].map((x, i) => `<ellipse cx="${x}" cy="${74 + (i % 2) * 6}" rx="10" ry="7"/>`).join('')}</g>
<path d="M28 74 L72 62 M28 62 L72 74" stroke="#7a5233" stroke-width="7" stroke-linecap="round"/>
<g class="yard-flame"><path d="M50 18 Q70 44 62 64 H38 Q30 44 50 18 Z" fill="#ff8a1f"/><path d="M50 36 Q60 50 56 64 H44 Q40 50 50 36 Z" fill="#ffd23f"/></g>`;

const floatyArt = `
<ellipse cx="50" cy="66" rx="44" ry="22" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<ellipse cx="50" cy="64" rx="24" ry="10" fill="#bfe2f2"/>
<circle cx="18" cy="44" r="9" fill="#e8352f" stroke="#a3201c" stroke-width="3"/><circle cx="82" cy="44" r="9" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<circle cx="40" cy="46" r="4" fill="#fff"/><circle cx="60" cy="46" r="4" fill="#fff"/><circle cx="40" cy="46" r="2" fill="#111"/><circle cx="60" cy="46" r="2" fill="#111"/>
<path d="M40 40 Q34 24 26 20 M60 40 Q66 24 74 20" stroke="#a3201c" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const lanternArt = `
<path d="M50 4 V14" stroke="#3b3f46" stroke-width="3"/><path d="M38 14 H62 L58 20 H42 Z" fill="#3b3f46"/>
<rect x="36" y="20" width="28" height="44" rx="6" fill="#ffe27a" stroke="#3b3f46" stroke-width="3"/>
<path d="M50 20 V64 M36 42 H64" stroke="#3b3f46" stroke-width="2"/>
<rect x="32" y="64" width="36" height="8" rx="2" fill="#3b3f46"/>
<path d="M50 72 V96" stroke="#6b4529" stroke-width="4"/>`;

export const DECOR: Decor[] = [
  // Backyard (open from the start)
  { id: 'doghouse', area: 'back', name: 'Doghouse', desc: 'With her name on it.', cost: 1, x: 10, y: 56, w: 110, svg: doghouse },
  { id: 'bed', area: 'back', name: 'Orthopedic Bed', desc: 'Memory foam for naps.', cost: 2, x: 262, y: 200, w: 96, svg: ORTHO_BED },
  { id: 'tree', area: 'back', name: 'Shade Tree', desc: 'Shade for hot days.', cost: 2, x: 268, y: 24, w: 90, svg: tree },
  { id: 'bowl', area: 'back', name: 'Snack Station', desc: 'Never empty.', cost: 3, x: 112, y: 212, w: 64, svg: KINDS[3].svg },
  { id: 'lobster', area: 'back', name: 'Lobster Plush', desc: 'Her favourite squeaky toy.', cost: 3, x: 300, y: 140, w: 50, svg: KINDS[4].svg },
  { id: 'hydrant', area: 'back', name: 'Fire Hydrant', desc: 'Every yard needs one.', cost: 4, x: 126, y: 98, w: 52, svg: hydrant },
  { id: 'ballpit', area: 'back', name: 'Ball Pit', desc: 'A tub of tennis balls.', cost: 4, x: 6, y: 186, w: 100, svg: ballPit },
  { id: 'flowers', area: 'back', name: 'Flower Bed', desc: 'Freshly dug. Not by Micah.', cost: 5, x: 180, y: 196, w: 88, svg: flowers },
  { id: 'sprinkler', area: 'back', name: 'Sprinkler', desc: 'Zoomies through the water.', cost: 5, x: 124, y: 146, w: 54, svg: sprinkler },
  { id: 'dustbath', area: 'back', name: 'Yoshi’s Dust Bath', desc: 'Yoshi rolls. Micah sneezes.', cost: 5, x: 188, y: 130, w: 76, svg: dustBath },
  { id: 'shelf', area: 'back', name: 'Things Micah Ate', desc: 'Fills up with what she swallows.', cost: 6, x: 188, y: 82, w: 68, svg: museum(null) },
  // Garden (opens after level 30)
  { id: 'hidey', area: 'yoshi', name: 'Hidey House', desc: 'Her quiet spot.', cost: 3, x: 24, y: 96, w: 82, svg: hidey },
  { id: 'hayrack', area: 'yoshi', name: 'Hay Rack', desc: 'Bottomless hay.', cost: 4, x: 212, y: 66, w: 60, svg: hayRack },
  { id: 'chews', area: 'yoshi', name: 'Apple Sticks', desc: 'For chewing. Not Micah.', cost: 4, x: 144, y: 190, w: 50, svg: chewPot },
  { id: 'ledges', area: 'yoshi', name: 'Climbing Ledges', desc: 'Up, up, up.', cost: 5, x: 128, y: 62, w: 76, svg: ledges },
  { id: 'wheel', area: 'yoshi', name: 'Running Wheel', desc: 'Zoomies, Yoshi-sized.', cost: 6, x: 262, y: 110, w: 86, svg: runWheel },
  { id: 'blanket', area: 'yoshi', name: 'Nap Blanket', desc: 'Room for two.', cost: 7, x: 14, y: 164, w: 130, svg: napBlanket },
  { id: 'veggies', area: 'garden', name: 'Veggie Patch', desc: 'One carrot is already missing.', cost: 8, x: 14, y: 58, w: 108, svg: veggies },
  { id: 'birdbath', area: 'garden', name: 'Birdbath', desc: 'Micah drinks from it anyway.', cost: 8, x: 150, y: 70, w: 64, svg: birdbath },
  { id: 'barrow', area: 'garden', name: 'Wheelbarrow', desc: 'Micah rides. Nobody pushes.', cost: 9, x: 196, y: 126, w: 80, svg: wheelbarrow },
  { id: 'compost', area: 'garden', name: 'Compost Heap', desc: 'To Micah, a buffet.', cost: 10, x: 268, y: 48, w: 84, svg: compost },
  { id: 'gnome', area: 'garden', name: 'Garden Gnome', desc: 'He had a whole hat once.', cost: 10, x: 126, y: 150, w: 50, svg: gnome },
  { id: 'hammock', area: 'garden', name: 'Hammock', desc: 'Built for one. Micah fills it.', cost: 12, x: 8, y: 168, w: 118, svg: hammock },
  { id: 'pond', area: 'garden', name: 'Frog Pond', desc: 'Home to one patient frog.', cost: 14, x: 220, y: 180, w: 128, svg: pond },
  // Front Porch (opens after level 60)
  { id: 'mat', area: 'porch', name: 'Welcome Mat', desc: 'A fair warning.', cost: 10, x: 136, y: 58, w: 88, svg: mat },
  { id: 'pumpkin', area: 'porch', name: 'Big Pumpkin', desc: 'Someone took a bite.', cost: 10, x: 212, y: 146, w: 52, svg: pumpkin },
  { id: 'chimes', area: 'porch', name: 'Wind Chimes', desc: 'Micah barks back.', cost: 11, x: 112, y: 14, w: 40, svg: chimes },
  { id: 'mailbox', area: 'porch', name: 'Mailbox', desc: 'Daily outrage, delivered.', cost: 12, x: 286, y: 180, w: 64, svg: mailbox },
  { id: 'lamp', area: 'porch', name: 'Porch Lamp', desc: 'Lights the way home.', cost: 12, x: 8, y: 156, w: 64, svg: lamp },
  { id: 'rocker', area: 'porch', name: 'Rocking Chair', desc: 'Micah claimed it.', cost: 14, x: 22, y: 64, w: 92, svg: rocker },
  { id: 'swing', area: 'porch', name: 'Porch Swing', desc: 'Best seat on the street.', cost: 16, x: 236, y: 52, w: 116, svg: swing },
  // Lakeside (opens after level 150)
  { id: 'lantern', area: 'lake', name: 'Lantern Post', desc: 'For the loons.', cost: 12, x: 18, y: 120, w: 44, svg: lanternArt },
  { id: 'dock', area: 'lake', name: 'Little Dock', desc: 'Micah does not jump. Usually.', cost: 14, x: 128, y: 70, w: 100, svg: dockArt },
  { id: 'chair', area: 'lake', name: 'Camp Chair', desc: 'Saved for Micah.', cost: 14, x: 72, y: 150, w: 64, svg: chairArt },
  { id: 'canoe', area: 'lake', name: 'Red Canoe', desc: 'Micah steers. Badly.', cost: 15, x: 252, y: 118, w: 100, svg: canoeArt },
  { id: 'tent', area: 'lake', name: 'Camping Tent', desc: 'Her name is on the door.', cost: 16, x: 8, y: 186, w: 96, svg: tentArt },
  { id: 'firepit', area: 'lake', name: 'Fire Pit', desc: 'No marshmallow is safe.', cost: 16, x: 156, y: 176, w: 74, svg: firepitArt },
  { id: 'floaty', area: 'lake', name: 'Lobster Floaty', desc: 'She naps on it. On land.', cost: 18, x: 250, y: 200, w: 104, svg: floatyArt },
  // Treehouse (opens after level 200)
  { id: 'fort', area: 'treehouse', name: 'The Treehouse', desc: 'A sign on the door: NO CATS.', cost: 20, x: 14, y: 6, w: 132, svg: fortArt },
  { id: 'ladder', area: 'treehouse', name: 'Rope Ladder', desc: 'Micah takes the slide down.', cost: 14, x: 104, y: 92, w: 52, svg: ladderArt },
  { id: 'slide', area: 'treehouse', name: 'Red Slide', desc: 'Up the ladder, down the slide, again.', cost: 17, x: 140, y: 70, w: 96, svg: slideArt },
  { id: 'pulley', area: 'treehouse', name: 'Snack Pulley', desc: 'Snacks go up. Micah goes up faster.', cost: 16, x: 2, y: 104, w: 56, svg: pulleyArt },
  { id: 'tireswing', area: 'treehouse', name: 'Tire Swing', desc: 'Whee! Micah is not a fan.', cost: 15, x: 262, y: 34, w: 92, svg: tireSwingArt },
  { id: 'birdhouse', area: 'treehouse', name: 'Bird House', desc: 'Tenants: two sparrows, one squirrel.', cost: 13, x: 234, y: 112, w: 52, svg: birdhouseArt },
  { id: 'telescope', area: 'treehouse', name: 'Telescope', desc: 'For spotting the Ark from up high.', cost: 16, x: 40, y: 194, w: 66, svg: telescopeArt },
  { id: 'beanbag', area: 'treehouse', name: 'Bean Bag', desc: 'It used to be round.', cost: 17, x: 206, y: 204, w: 92, svg: beanbagArt },
];

// ───────────────────────────── the scene ─────────────────────────────

const sky = (time: YardTime): string => {
  if (time === 'night')
    return `<rect width="360" height="96" fill="#0f2537"/><rect y="46" width="360" height="50" fill="#14324a"/>
      ${Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 67) % 355 + 4}" cy="${(i * 29) % 52 + 4}" r="${i % 4 ? 1 : 1.7}" fill="#fff" opacity=".8"/>`).join('')}
      <circle cx="60" cy="24" r="14" fill="#f6efd8"/><circle cx="66" cy="19" r="12" fill="#0f2537"/>`;
  if (time === 'dusk')
    return `<rect width="360" height="96" fill="#173a52"/><rect y="20" width="360" height="76" fill="#2b5a78"/><rect y="40" width="360" height="56" fill="#e98a6a"/><rect y="56" width="360" height="40" fill="#f4b07c"/>
      <circle cx="150" cy="58" r="17" fill="#e8352f"/>
      <g fill="#ffffff" opacity=".18"><rect x="20" y="14" width="70" height="7" rx="3.5"/><rect x="226" y="30" width="90" height="7" rx="3.5"/></g>`;
  return `<rect width="360" height="96" fill="#7cc3ec"/><rect y="40" width="360" height="56" fill="#a6daf6"/>
    <circle cx="150" cy="26" r="13" fill="#ffd23f"/>
    <g fill="#ffffff" opacity=".85"><rect x="20" y="16" width="64" height="10" rx="5"/><rect x="36" y="10" width="30" height="10" rx="5"/><rect x="220" y="28" width="80" height="10" rx="5"/></g>`;
};

const grass = (y0: number, time: YardTime, snowy = false) => {
  const [a, b] = snowy
    ? time === 'night' ? ['#b9cad9', '#c2d2e0'] : ['#e6f0f8', '#eff5fb']
    : time === 'night' ? ['#3c6d48', '#42764e'] : ['#5f9c55', '#68a75d'];
  let s = `<rect y="${y0}" width="360" height="${300 - y0}" fill="${a}"/>`;
  for (let i = 0; i < 9; i += 2) s += `<rect x="${i * 40}" y="${y0}" width="40" height="${300 - y0}" fill="${b}"/>`;
  return s;
};

/** A worn wooden fence with one loose plank, and the hole Micah dug under it. */
const fence = (snowy = false) => {
  let s = '';
  for (let i = 0; i < 19; i++) {
    const x = i * 19 + 1;
    if (i === 7) {
      s += `<rect x="${x + 2}" y="62" width="13" height="22" rx="2" fill="#c8a57a" stroke="#8a6a45" stroke-width="1.4" transform="rotate(16 ${x + 8} 84)"/>`;
      continue;
    }
    const h = 22 + ((i * 7) % 4);
    s += `<rect x="${x}" y="${84 - h}" width="15" height="${h}" fill="#c8a57a" stroke="#8a6a45" stroke-width="1.4"/><path d="M${x + 3} ${88 - h} v8 M${x + 10} ${92 - h} v10" stroke="#a3845c" stroke-width="1"/>`;
    if (snowy) s += `<rect x="${x - 1.5}" y="${81 - h}" width="18" height="6" rx="3" fill="#ffffff"/>`;
  }
  const hx = 142;
  return `<rect x="0" y="66" width="360" height="4" fill="#a3845c"/><rect x="0" y="74" width="360" height="5" fill="#a3845c"/>${s}
    ${snowy ? '<rect x="0" y="80" width="360" height="8" rx="4" fill="#ffffff"/>' : ''}
    <ellipse cx="${hx}" cy="86" rx="14" ry="5" fill="#4a3220"/><g fill="#8a6239"><circle cx="${hx - 18}" cy="88" r="3.5"/><circle cx="${hx + 18}" cy="87" r="4.5"/><circle cx="${hx + 24}" cy="90" r="2.6"/></g>`;
};

/** Lakeside: far pines, the lake, and a sandy shore that turns to grass. */
const lakeShore = (time: YardTime, snowy = false) => {
  const pine = time === 'night' ? '#173a2c' : '#2f5a46';
  const water = snowy ? (time === 'night' ? '#9fb3c4' : '#d9e8f2') : time === 'night' ? '#1d4560' : time === 'dusk' ? '#4a6f8f' : '#3a8fc0';
  let trees = '';
  for (let i = 0; i < 16; i++) {
    const x = i * 24 + ((i * 7) % 9), h = 22 + ((i * 13) % 14);
    trees += `<path d="M${x} 84 L${x + 10} ${84 - h} L${x + 20} 84 Z" fill="${pine}"/>${snowy ? `<path d="M${x + 6} ${84 - h * 0.6} L${x + 10} ${84 - h} L${x + 14} ${84 - h * 0.6} Z" fill="#fff"/>` : ''}`;
  }
  return `${trees}<rect y="82" width="360" height="72" fill="${water}"/>
    <g opacity=".5" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M30 100 h24 M120 112 h30 M240 98 h20 M300 120 h26 M70 132 h18"/></g>
    ${grass(150, time, snowy)}
    <path d="M0 150 Q90 140 180 152 T360 146 V164 Q270 172 180 164 T0 166 Z" fill="${snowy ? '#f4f8fb' : time === 'night' ? '#8f8466' : '#e6d3a0'}"/>`;
};

/** Treehouse: a giant oak on the left, its canopy across the top, and open lawn. */
const bigOak = (time: YardTime, snowy = false) => {
  const leaf = snowy ? '#e6f0f8' : time === 'night' ? '#244a32' : '#3f7d4a';
  const leaf2 = snowy ? '#f4f8fb' : time === 'night' ? '#2c5a3a' : '#4a8d55';
  const bark = time === 'night' ? '#4a3220' : '#6b4529';
  return `<path d="M56 300 Q64 200 66 120 Q60 70 40 40 H110 Q96 80 100 120 Q104 200 118 300 Z" fill="${bark}"/>
    <path d="M78 290 Q82 200 80 130 M96 260 Q94 210 92 160" stroke="#4a3220" stroke-width="3" fill="none" opacity=".5"/>
    <path d="M100 74 Q180 60 300 44" stroke="${bark}" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${[[30, 18, 50], [90, 6, 56], [160, 14, 46], [230, 6, 44], [300, 18, 46], [10, 60, 34], [130, 44, 30], [350, 46, 30]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? leaf2 : leaf}"/>`).join('')}`;
};

const trail = (d: string, snowy = false) => `<path d="${d}" stroke="${snowy ? '#9fb6ca' : '#a57c52'}" stroke-width="12" fill="none" stroke-linecap="round" opacity="${snowy ? '.35' : '.38'}"/>`;

/** A trimmed hedge with a rose arch for the Garden. */
const hedge = (time: YardTime, snowy = false) => {
  const g = time === 'night' ? '#2c5a3a' : '#3f7d4a';
  const l = time === 'night' ? '#35694a' : '#4a8d55';
  let s = `<rect x="0" y="58" width="360" height="34" fill="${g}"/>`;
  for (let x = 0; x <= 360; x += 24) s += `<circle cx="${x}" cy="60" r="14" fill="${g}"/><circle cx="${x + 8}" cy="66" r="6" fill="${l}"/>`;
  if (snowy) for (let x = 0; x <= 360; x += 24) s += `<ellipse cx="${x}" cy="49" rx="12" ry="5" fill="#ffffff"/>`;
  s += `<path d="M232 92 V54 A26 26 0 0 1 284 54 V92" stroke="#ffffff" stroke-width="5" fill="none"/>
    <path d="M232 92 V54 A26 26 0 0 1 284 54 V92" stroke="#c9d3da" stroke-width="5" fill="none" stroke-dasharray="1 8"/>
    ${[[234, 60], [240, 44], [252, 34], [266, 34], [278, 44], [283, 62], [234, 78], [283, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#e8352f"/><circle cx="${x}" cy="${y}" r="1.6" fill="#a3201c"/>`).join('')}`;
  return s;
};

/** The front of the house: siding, two windows, a lobster-red door and porch boards. */
const house = (time: YardTime, snowy = false) => {
  const lit = time === 'night';
  const win = (x: number) => `<rect x="${x}" y="28" width="56" height="52" fill="${lit ? '#ffd56a' : '#bfe6ff'}" stroke="#ffffff" stroke-width="5"/>
    <path d="M${x + 28} 28 V80 M${x} 54 H${x + 56}" stroke="#ffffff" stroke-width="3"/>
    <rect x="${x - 8}" y="26" width="8" height="56" fill="#173a52"/><rect x="${x + 56}" y="26" width="8" height="56" fill="#173a52"/>`;
  let siding = '';
  for (let y = 14; y < 112; y += 10) siding += `<path d="M0 ${y} H360" stroke="#4f7590" stroke-width="1.5"/>`;
  let boards = '';
  for (let y = 120; y < 206; y += 12) boards += `<path d="M0 ${y} H360" stroke="#a87b4f" stroke-width="1.5"/>`;
  return `<rect width="360" height="112" fill="#5b8aa8"/>${siding}
    <rect width="360" height="12" fill="#173a52"/>
    ${win(40)}${win(264)}
    <rect x="156" y="22" width="48" height="90" rx="2" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
    <rect x="164" y="32" width="32" height="30" rx="2" fill="none" stroke="#a3201c" stroke-width="2"/><rect x="164" y="70" width="32" height="30" rx="2" fill="none" stroke="#a3201c" stroke-width="2"/>
    <circle cx="196" cy="68" r="2.6" fill="#ffd23f"/>
    <rect x="0" y="108" width="360" height="98" fill="#c79a66"/>${boards}
    <rect x="0" y="108" width="360" height="5" fill="#a87b4f"/>
    <rect x="142" y="200" width="76" height="10" fill="#b5884f"/><rect x="134" y="208" width="92" height="10" fill="#a87b4f"/>
    ${snowy ? `<rect width="360" height="7" fill="#ffffff"/>${Array.from({ length: 18 }, (_, i) => `<path d="M${i * 20 + 8} 11 l3 ${6 + (i % 3) * 3} l3 ${-6 - (i % 3) * 3} Z" fill="#dff1fb"/>`).join('')}
      <rect x="134" y="206" width="92" height="4" rx="2" fill="#ffffff"/>` : ''}`;
};

/**
 * Yoshi's Corner: Grace's house behind her. A beige three-decker with white trim: stacked porches on the
 * left (a narrower balcony up top, dark railings, white posts, brick steps with rails, lattice skirt),
 * a three-sided bay on the right with an air conditioner in one window, a white cornice and the lamp post.
 */
const graceHouse = (time: YardTime, snowy = false) => {
  const night = time === 'night';
  const wall = night ? '#8f8673' : '#dccfb2';
  const line = night ? '#7f7766' : '#c9bb9c';
  const deep = night ? '#6f6858' : '#c4b597';
  const side = night ? '#7a7262' : '#cbbd9f';
  const trim = night ? '#dad6cc' : '#ffffff';
  const iron = '#24221f';
  // Which windows are lit at night (by floor, left to right), so the house looks lived in.
  const lit = [
    [1, 0, 1, 1, 0, 1, 0],
    [0, 1, 1, 0, 1, 1, 1],
    [1, 1, 0, 1, 1, 0, 1],
  ];
  const glassFor = (f: number, i: number) => (night ? (lit[f][i] ? '#ffd56a' : '#3d4f5d') : i % 2 ? '#6d8ea4' : '#5b7c93');
  /** A one-over-one sash window with white trim, a sill and a lighter top pane. */
  const win = (x: number, y: number, w: number, h: number, f: number, i: number) => {
    const g = glassFor(f, i);
    return `<rect x="${x - 1.5}" y="${y - 1.5}" width="${w + 3}" height="${h + 3}" fill="${trim}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${g}"/>
      ${night ? '' : `<path d="M${x + 1} ${y + h * 0.42} L${x + w * 0.6} ${y + 1} H${x + w - 1} L${x + 1} ${y + h * 0.9} Z" fill="#ffffff" opacity=".12"/>`}
      <rect x="${x - 1}" y="${y + h / 2 - 0.8}" width="${w + 2}" height="1.6" fill="${trim}"/>
      <rect x="${x - 2.5}" y="${y + h + 1}" width="${w + 5}" height="2" fill="${trim}"/>`;
  };
  const rail = (y: number, x0: number, x1: number) => {
    let bars = '';
    for (let x = x0 + 3; x < x1 - 1; x += 3) bars += `M${x} ${y + 1} V${y + 8} `;
    return `<path d="${bars}" stroke="${iron}" stroke-width=".9"/><rect x="${x0}" y="${y - 0.5}" width="${x1 - x0}" height="2" fill="${iron}"/><rect x="${x0}" y="${y + 7.5}" width="${x1 - x0}" height="1.2" fill="${iron}"/>`;
  };
  const post = (x: number, y0: number, y1: number) => `<rect x="${x}" y="${y0}" width="3.2" height="${y1 - y0}" fill="${trim}"/><rect x="${x - 0.8}" y="${y1 - 2}" width="4.8" height="2" fill="${trim}"/>`;
  // Floors: tops of the window rows.
  const F = [14, 42, 70];
  let siding = '';
  for (let y = 13; y < 92; y += 4.5) siding += `M4 ${y.toFixed(1)} H250 `;
  let lattice = '';
  for (let x = 24; x < 106; x += 5) lattice += `M${x} 89 l5 6 M${x + 5} 89 l-5 6 `;
  return `<g class="grace-house">
    <rect x="4" y="10" width="246" height="84" fill="${wall}"/>
    <path d="${siding}" stroke="${line}" stroke-width=".9"/>
    <rect x="24" y="12" width="82" height="78" fill="${deep}"/>
    <path d="M24 12 H106 M24 38 H106 M24 66 H106" stroke="#000" stroke-width="3" opacity=".08"/>
    ${F.map((y, f) => win(8, y + 2, 11, 18, f, 0)).join('')}
    ${win(28, 16, 11, 16, 0, 1)}
    <rect x="62" y="14" width="13" height="22" fill="${trim}"/><rect x="64" y="16" width="9" height="20" fill="${glassFor(0, 2)}"/>
    <rect x="44" y="42" width="13" height="22" fill="${trim}"/><rect x="46" y="44" width="9" height="20" fill="${glassFor(1, 2)}"/><path d="M46 54 H55" stroke="${trim}" stroke-width="1"/>
    ${win(30, 46, 9, 14, 1, 0)}${win(84, 46, 11, 16, 1, 3)}
    <rect x="58" y="69" width="16" height="21" fill="${trim}"/><rect x="60" y="71" width="12" height="19" fill="#1a1b1f"/>
    <path d="M61.5 73 h9 v6 h-9 Z M61.5 81 h9 v7 h-9 Z" fill="none" stroke="#33353b" stroke-width=".8"/><circle cx="70" cy="81" r=".9" fill="#c9a640"/>
    <rect x="77" y="74" width="5" height="7" fill="#f2efe6" stroke="#b9b2a2" stroke-width=".5"/>
    ${win(32, 72, 10, 14, 2, 1)}${win(88, 72, 9, 14, 2, 2)}
    <g fill="${trim}"><rect x="22" y="37" width="86" height="4"/><rect x="22" y="65" width="86" height="4"/><rect x="22" y="86.5" width="86" height="3"/></g>
    ${rail(29, 44, 106)}${rail(57, 25, 106)}${rail(78, 25, 54)}${rail(78, 76, 106)}
    ${post(24, 12, 37)}${post(44, 12, 37)}${post(103, 12, 37)}
    ${post(24, 41, 65)}${post(103, 41, 65)}
    ${post(24, 69, 87)}${post(53, 69, 87)}${post(75, 69, 87)}${post(103, 69, 87)}
    <path d="${lattice}" stroke="${trim}" stroke-width=".9"/><rect x="22" y="89" width="86" height="6" fill="none" stroke="${trim}" stroke-width="1"/>
    <g fill="#a0533f"><rect x="55" y="89" width="22" height="2.6"/><rect x="54" y="91.6" width="24" height="2.6"/><rect x="53" y="94.2" width="26" height="2.4"/></g>
    <path d="M55 88 V96 M77 88 V96 M54 81 L54 89 M78 81 L78 89" stroke="${trim}" stroke-width="1.1"/>
    ${F.map((y, f) => win(116, y + 2, 13, 19, f, 3) + win(138, y + 2, 13, 19, f, 4)).join('')}
    <path d="M160 10 L172 6 H212 L224 10 V94 H160 Z" fill="${wall}"/>
    <path d="M160 10 L172 6 V94 H160 Z" fill="${side}"/><path d="M212 6 L224 10 V94 H212 Z" fill="${deep}"/>
    ${F.map((y, f) => `<path d="M162 ${y + 3} L170 ${y + 1.5} V${y + 21} L162 ${y + 22} Z" fill="${trim}"/><path d="M163.4 ${y + 4.6} L168.6 ${y + 3.4} V${y + 19.6} L163.4 ${y + 20.4} Z" fill="${glassFor(f, 4)}"/>
      ${win(184, y + 1, 16, 20, f, 5)}
      <path d="M214 ${y + 1.5} L222 ${y + 3} V${y + 22} L214 ${y + 21} Z" fill="${trim}"/><path d="M215.4 ${y + 3.4} L220.6 ${y + 4.6} V${y + 20.4} L215.4 ${y + 19.6} Z" fill="${glassFor(f, 6)}"/>`).join('')}
    ${F.map((y, f) => win(232, y + 2, 12, 19, f, 6)).join('')}
    <rect x="230.5" y="57" width="15" height="7" rx="1" fill="#e9ebec" stroke="#9aa3a8" stroke-width=".8"/><path d="M233 59 h10 M233 61 h10" stroke="#9aa3a8" stroke-width=".6"/>
    <rect x="2" y="3" width="250" height="8" fill="${trim}"/><path d="M158 3 L171 -1 H213 L226 3 Z" fill="${trim}"/>
    <path d="M2 11 H252" stroke="#000" stroke-width="2" opacity=".1"/><path d="M2 3 H252" stroke="#c9c4b8" stroke-width="1"/>
    <rect x="4" y="10" width="2.5" height="84" fill="${trim}"/><rect x="247.5" y="10" width="2.5" height="84" fill="${trim}"/>
    <rect x="4" y="92" width="246" height="3" fill="${night ? '#6d6a63' : '#a9a298'}"/>
    <g fill="${night ? '#2c5a3a' : '#3f7d4a'}"><ellipse cx="14" cy="93" rx="12" ry="5"/><ellipse cx="42" cy="94" rx="10" ry="4"/><ellipse cx="94" cy="94" rx="9" ry="4"/><ellipse cx="176" cy="94" rx="18" ry="5"/><ellipse cx="208" cy="93" rx="12" ry="6"/><ellipse cx="238" cy="94" rx="10" ry="4"/></g>
    <g fill="${night ? '#356b46' : '#4f9a58'}"><ellipse cx="12" cy="91" rx="6" ry="2.4"/><ellipse cx="172" cy="92" rx="8" ry="2.4"/><ellipse cx="206" cy="90" rx="5" ry="2"/></g>
    ${snowy ? `<g fill="#ffffff"><rect x="0" y="0" width="254" height="5" rx="2.5"/><path d="M156 1 L171 -3 H213 L228 1 Z"/><rect x="20" y="35.5" width="90" height="2.6" rx="1.3"/><rect x="20" y="63.5" width="90" height="2.6" rx="1.3"/><rect x="43" y="27.6" width="64" height="1.8" rx=".9"/><rect x="24" y="55.6" width="83" height="1.8" rx=".9"/>${F.map((y) => `<rect x="6" y="${y + 22}" width="15" height="1.8" rx=".9"/><rect x="114" y="${y + 23}" width="17" height="1.8" rx=".9"/><rect x="136" y="${y + 23}" width="17" height="1.8" rx=".9"/><rect x="182" y="${y + 22}" width="20" height="1.8" rx=".9"/>`).join('')}<ellipse cx="14" cy="89" rx="10" ry="2.6"/><ellipse cx="176" cy="90" rx="16" ry="2.6"/><ellipse cx="208" cy="88" rx="10" ry="2.6"/><ellipse cx="94" cy="91" rx="8" ry="2"/></g>` : ''}
    </g>
    <g class="lamp-post">
      ${night ? '<circle cx="268" cy="22" r="20" fill="#ffe27a" opacity=".22"/><circle cx="268" cy="22" r="10" fill="#fff3c4" opacity=".35"/>' : ''}
      <path d="M266 36 H270 L271 92 H265 Z" fill="${iron}"/>
      <path d="M263 92 H273 L275 97 H261 Z" fill="${iron}"/><rect x="264.5" y="58" width="7" height="2.4" rx="1" fill="${iron}"/>
      <path d="M264 36 h8 l-1 -3 h-6 Z" fill="${iron}"/>
      <ellipse cx="268" cy="24" rx="6.5" ry="9" fill="${night ? '#fff6d0' : '#f4f6f6'}" stroke="${iron}" stroke-width="1.2"/>
      <path d="M262.6 18 Q268 14.5 273.4 18" fill="none" stroke="${iron}" stroke-width="1"/>
      <path d="M263.5 15.5 Q268 11 272.5 15.5 Z" fill="${iron}"/><path d="M268 11.5 V8" stroke="${iron}" stroke-width="1.3" stroke-linecap="round"/><circle cx="268" cy="7.4" r="1.3" fill="${iron}"/>
      ${night ? '' : '<path d="M265 21 q1 -3 3 -4" stroke="#ffffff" stroke-width="1.4" fill="none" stroke-linecap="round"/>'}
      ${snowy ? '<path d="M263.2 15.4 Q268 10.6 272.8 15.4 Q268 13.4 263.2 15.4 Z" fill="#ffffff"/>' : ''}
    </g>`;
};

/** Snow that settles on things in winter, in each item's 100x100 box. */
const SNOW_CAPS: Record<string, string> = {
  doghouse: '<path d="M10 44 L50 10 L90 44 Q86 49 82 44 L50 17 L18 44 Q14 49 10 44 Z" fill="#fff"/>',
  tree: '<ellipse cx="50" cy="11" rx="20" ry="6"/><ellipse cx="28" cy="33" rx="11" ry="5"/><ellipse cx="72" cy="31" rx="11" ry="5"/>',
  hydrant: '<ellipse cx="50" cy="20" rx="17" ry="6"/>',
  hidey: '<path d="M8 92 L50 26 L92 92 L86 90 L50 34 L14 90 Z"/>',
  hayrack: '<rect x="14" y="16" width="72" height="6" rx="3"/>',
  ledges: '<rect x="13" y="16" width="42" height="5" rx="2.5"/><rect x="45" y="40" width="42" height="5" rx="2.5"/><rect x="13" y="64" width="42" height="5" rx="2.5"/>',
  ballpit: '<ellipse cx="38" cy="14" rx="16" ry="4"/><ellipse cx="66" cy="18" rx="12" ry="3.5"/>',
  sprinkler: '<ellipse cx="50" cy="52" rx="10" ry="4"/>',
  shelf: '<rect x="4" y="2" width="92" height="6" rx="3"/>',
  barrow: '<ellipse cx="40" cy="40" rx="30" ry="7"/>',
  compost: '<ellipse cx="50" cy="27" rx="38" ry="7"/>',
  birdbath: '<ellipse cx="50" cy="41" rx="33" ry="4" fill="#dff1fb"/>',
  hammock: '<ellipse cx="50" cy="54" rx="22" ry="5"/>',
  pumpkin: '<ellipse cx="50" cy="41" rx="22" ry="5"/>',
  mailbox: '<ellipse cx="50" cy="16" rx="34" ry="6"/>',
  lamp: '<ellipse cx="50" cy="4" rx="18" ry="4"/>',
  veggies: '<rect x="4" y="52" width="92" height="8" rx="4"/>',
};

// ───────────────────────────── Christmas lights ─────────────────────────────

const BULBS = ['#e8352f', '#ffd23f', '#3fae5a', '#2f8fe0', '#ffffff'];

/** Off in daylight, on (and twinkling) from sunset, glowing at night. */
export type Lamp = 'off' | 'on' | 'glow';
export const lampFor = (time: YardTime): Lamp => (time === 'day' ? 'off' : time === 'dusk' ? 'on' : 'glow');

/** One bulb hanging at (x, y). Lit bulbs twinkle in three groups; at night they glow. */
const bulb = (x: number, y: number, i: number, lamp: Lamp, s = 1) => {
  const c = BULBS[i % BULBS.length];
  return `<g class="bulb${lamp === 'off' ? ' off' : ` t${i % 3}`}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})">
    ${lamp === 'glow' ? `<circle class="bulb-glow" cy="3.5" r="6" fill="${c}" opacity=".4"/>` : ''}
    <rect x="-1.2" y="-.6" width="2.4" height="2" fill="#2d3b45"/><ellipse cy="3.6" rx="1.9" ry="2.8" fill="${c}" opacity="${lamp === 'off' ? '.4' : '1'}" stroke="#00000033" stroke-width=".5"/></g>`;
};

/** A string of lights sagging between the given points, with `per` bulbs on each span.
 * Lit strings switch on in turn, left to right (`delay` seconds after the yard opens). */
export function festoon(pts: [number, number][], sag: number, per: number, lamp: Lamp, s = 1, start = 0, delay = 0): string {
  let wire = `M${pts[0][0]} ${pts[0][1]}`;
  let bulbs = '';
  let n = start;
  for (let k = 0; k < pts.length - 1; k++) {
    const [ax, ay] = pts[k];
    const [bx, by] = pts[k + 1];
    const cx = (ax + bx) / 2;
    const cy = (ay + by) / 2 + sag;
    wire += ` Q${cx} ${cy} ${bx} ${by}`;
    for (let j = 1; j <= per; j++) {
      const t = j / (per + 1);
      const x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cx + t * t * bx;
      const yy = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cy + t * t * by;
      bulbs += bulb(x, yy, n++, lamp, s);
    }
  }
  return `<g class="xmas-lights${lamp === 'off' ? '' : ' lit'}" style="--on:${delay.toFixed(2)}s" pointer-events="none"><path d="${wire}" stroke="#2d3b45" stroke-width="${(1.1 * s).toFixed(2)}" fill="none"/>${bulbs}</g>`;
}

const spans = (x0: number, x1: number, y: number, step: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let x = x0; x <= x1 + 0.1; x += step) out.push([x, y]);
  return out;
};

/** The long strings, one span at a time so each switches on a beat after the last. */
const runOfLights = (x0: number, x1: number, y: number, step: number, sag: number, lamp: Lamp, t0 = 0.3): string => {
  const pts = spans(x0, x1, y, step);
  let out = '';
  for (let k = 0; k < pts.length - 1; k++) out += festoon([pts[k], pts[k + 1]], sag, 3, lamp, 1, k * 3, t0 + k * 0.12);
  return out;
};

/** Lights on built things, in each item's 100x100 box. They come on after the big strings. */
const ITEM_LIGHTS: Record<string, (l: Lamp) => string> = {
  doghouse: (l) => festoon([[12, 46], [50, 13], [88, 46]], 6, 4, l, 2.2, 0, 1.5),
  tree: (l) => festoon([[24, 22], [76, 30]], 10, 4, l, 2.4, 0, 1.7) + festoon([[18, 46], [82, 52]], 10, 5, l, 2.4, 2, 1.85),
  mailbox: (l) => festoon([[18, 30], [82, 30]], 8, 4, l, 1.8, 0, 1.6),
  lamp: (l) => festoon([[50, 40], [50, 92]], 0, 4, l, 1.8, 0, 1.5),
  rocker: (l) => festoon([[30, 12], [66, 12]], 6, 3, l, 1.6, 0, 1.7),
  swing: (l) => festoon([[10, 31], [90, 31]], 6, 6, l, 1.6, 0, 1.8),
  barrow: (l) => festoon([[66, 60], [96, 52]], 4, 2, l, 1.6, 0, 1.6),
};

/** Per part of the yard: the big strings along the fence, the hedge or the porch eaves. */
function sceneLights(area: YardArea, lamp: Lamp): string {
  if (area === 'back')
    return runOfLights(0, 360, 60, 40, 7, lamp)
      // On Noah's Ark someone gave up halfway: the string droops off the roof and dangles (and comes on last).
      + `<g class="ark-lights">${festoon([[170, 54], [200, 34], [226, 50]], 6, 3, lamp, 0.9, 0, 2.2)}${festoon([[226, 50], [232, 70]], 2, 2, lamp, 0.9, 6, 2.6)}</g>`;
  if (area === 'yoshi')
    return runOfLights(2, 252, 10, 36, 5, lamp) + festoon([[44, 29], [106, 29]], 3, 6, lamp, 1, 0, 1) + festoon([[25, 57], [106, 57]], 3, 7, lamp, 1, 3, 1.2);
  if (area === 'garden')
    return runOfLights(0, 360, 50, 36, 6, lamp) + festoon([[232, 92], [236, 54], [258, 30], [280, 54], [284, 92]], 3, 2, lamp, 1, 4, 1.6);
  return runOfLights(0, 360, 14, 30, 6, lamp) + festoon([[156, 22], [180, 18], [204, 22]], 3, 3, lamp, 1, 1, 1.8);
}

/** A snowman for Micah's Winter, missing his carrot nose. Base centred on (0,0). */
export const SNOWMAN = `<ellipse cx="0" cy="0" rx="18" ry="4" fill="#000" opacity=".12"/>
  <circle cx="0" cy="-14" r="15" fill="#ffffff" stroke="#b7cbdc" stroke-width="2"/>
  <circle cx="0" cy="-35" r="11" fill="#ffffff" stroke="#b7cbdc" stroke-width="2"/>
  <circle cx="0" cy="-52" r="8" fill="#ffffff" stroke="#b7cbdc" stroke-width="2"/>
  <path d="M-10 -42 Q0 -38 10 -42 L11 -38 Q0 -34 -11 -38 Z" fill="#e8352f"/><path d="M6 -39 l4 10 l-5 1 Z" fill="#e8352f"/>
  <circle cx="-3" cy="-54" r="1.4" fill="#173a52"/><circle cx="3" cy="-54" r="1.4" fill="#173a52"/>
  <circle cx="0" cy="-50" r="1.6" fill="#c9d6e2"/>
  <circle cx="0" cy="-32" r="1.4" fill="#173a52"/><circle cx="0" cy="-26" r="1.4" fill="#173a52"/>
  <path d="M-10 -36 L-24 -46 M-20 -43 l-3 -5 M10 -36 L24 -44 M20 -41 l2 -6" stroke="#7a4f25" stroke-width="2" stroke-linecap="round"/>
  <circle cx="0" cy="-30" r="22" fill="transparent"/>`;

const fireflies = (n: number) =>
  `<g class="fireflies" pointer-events="none">${Array.from({ length: n }, (_, i) => {
    const x = (i * 83) % 330 + 14;
    const y = 110 + ((i * 47) % 160);
    return `<g class="firefly" style="animation-delay:${(i * 0.37) % 3}s"><circle cx="${x}" cy="${y}" r="4" fill="#ffe27a" opacity=".35"/><circle cx="${x}" cy="${y}" r="1.6" fill="#fff6c4"/></g>`;
  }).join('')}</g>`;

export const GROUND: Record<YardArea, { x0: number; x1: number; y0: number; y1: number }> = {
  back: { x0: 24, x1: 336, y0: 100, y1: 292 },
  yoshi: { x0: 24, x1: 336, y0: 100, y1: 292 },
  garden: { x0: 24, x1: 336, y0: 104, y1: 292 },
  porch: { x0: 24, x1: 336, y0: 128, y1: 292 },
  lake: { x0: 24, x1: 336, y0: 140, y1: 292 },
  treehouse: { x0: 24, x1: 336, y0: 150, y1: 292 },
};

/** Where Micah and Yoshi start in each part of the yard. */
export const START: Record<YardArea, { micah: [number, number]; yoshi: [number, number] }> = {
  back: { micah: [228, 196], yoshi: [96, 270] },
  yoshi: { micah: [230, 250], yoshi: [176, 170] },
  garden: { micah: [180, 250], yoshi: [150, 284] },
  porch: { micah: [180, 190], yoshi: [110, 270] },
  lake: { micah: [200, 230], yoshi: [130, 276] },
  treehouse: { micah: [180, 250], yoshi: [130, 280] },
};

/** Where the advent present sits in the Backyard, by the snowman. */
export const GIFT_AT: [number, number] = [320, 138];

export interface SceneOptions {
  area: YardArea;
  time: YardTime;
  /** Snack ids Micah has eaten, for the shelf. */
  ate: string[];
  /** Micah's dig mound (Backyard only): where it is and whether it is ready to dig up. */
  dig?: { x: number; y: number; ready: boolean };
  /** Advent calendar (Backyard, 1 to 24 December): today's unopened present and its day. */
  gift?: number | null;
  /** Micah's Winter: snow on the ground and on things, and a snowman in the Backyard. */
  snowy?: boolean;
}

/** One part of the yard, with bought items drawn and the rest shown as empty spots.
 * Built items are tappable groups; roam.ts moves Micah (the .ym group) between them. */
export function yardScene(owned: string[], micahUrl: string, opts: SceneOptions = { area: 'back', time: 'day', ate: [] }): string {
  const { area, time } = opts;
  const snowy = !!opts.snowy;
  const here = DECOR.filter((d) => d.area === area);
  const items = here.map((d) => {
    const has = owned.includes(d.id);
    const s = d.w / 100;
    const art = d.id === 'shelf' ? museum(opts.ate) : d.svg;
    if (has)
      return `<g class="yard-item" data-id="${d.id}" data-bottom="${d.y + d.w * 0.9}" role="button" aria-label="${d.name}"><g transform="translate(${d.x} ${d.y}) scale(${s})"><g class="yard-item-art">${art}${snowy && SNOW_CAPS[d.id] ? `<g class="snow-cap" fill="#fff">${SNOW_CAPS[d.id]}</g>` : ''}${snowy && ITEM_LIGHTS[d.id] ? ITEM_LIGHTS[d.id](lampFor(time)) : ''}</g></g></g>`;
    const cx = d.x + d.w / 2;
    const cy = d.y + d.w / 2;
    return `<g opacity=".7"><circle cx="${cx}" cy="${cy}" r="${Math.min(22, d.w / 3)}" fill="#00000014" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff" font-family="Nunito, sans-serif">${d.cost}★</text></g>`;
  }).join('');
  let back = '';
  if (area === 'back') {
    back = `${sky(time)}
      <g class="yard-ark live" role="button" aria-label="Noah's Ark, over the back fence" transform="translate(214 84) scale(.7)">${noahsArk().svg}</g>
      ${time === 'night' ? '<rect x="189" y="34" width="6" height="6" fill="#ffd56a" opacity=".9"/>' : ''}
      ${grass(80, time, snowy)}${fence(snowy)}
      ${trail('M70 170 C100 200 160 186 190 214 S 250 258 300 252 M190 214 C 210 194 236 196 258 212 M70 170 C 76 206 66 228 60 248', snowy)}`;
  } else if (area === 'yoshi') {
    back = `${sky(time)}${grass(92, time, snowy)}${graceHouse(time, snowy)}
      ${trail('M60 190 C100 170 160 200 200 186 S 270 170 300 214', snowy)}`;
  } else if (area === 'garden') {
    back = `${sky(time)}${grass(88, time, snowy)}${hedge(time, snowy)}
      ${trail('M60 160 C110 150 150 220 200 220 S 280 180 330 196 M200 220 C 196 250 210 270 230 290', snowy)}`;
  } else if (area === 'treehouse') {
    back = `${sky(time)}${grass(104, time, snowy)}${bigOak(time, snowy)}
      ${trail('M40 290 C90 260 150 250 190 230 S 260 200 310 190', snowy)}`;
  } else if (area === 'lake') {
    back = `${sky(time)}${lakeShore(time, snowy)}
      ${trail('M40 290 C80 250 140 250 180 236 S 260 220 300 196', snowy)}`;
  } else {
    back = `${house(time, snowy)}${grass(206, time, snowy)}`;
  }
  const [mx, my] = START[area].micah;
  const [yx, yy] = START[area].yoshi;
  const label = AREAS.find((a) => a.id === area)!.name;
  const built = here.filter((d) => owned.includes(d.id)).length;
  return `<svg viewBox="0 0 360 300" class="yard-scene yard-${area} yard-${time}" role="img" aria-label="Micah's ${label} with ${built} of ${here.length} things built">
    ${back}
    ${snowy ? sceneLights(area, lampFor(time)) : ''}
    <g class="paws"></g>
    <g class="yard-layer">
      ${snowy && area === 'back' ? `<g class="yard-item snowman" data-id="snowman" data-bottom="146" role="button" aria-label="Snowman"><g transform="translate(282 146)"><g class="yard-item-art">${SNOWMAN}</g></g></g>` : ''}
      ${opts.dig && area === 'back' ? `<g class="dig-mound${opts.dig.ready ? ' ready' : ''}" transform="translate(${opts.dig.x} ${opts.dig.y})" role="button" aria-label="${opts.dig.ready ? 'Micah’s dig spot: something is buried here, tap to dig it up' : 'Micah’s dig spot: freshly buried, come back tomorrow'}">${moundSVG(opts.dig.ready)}</g>` : ''}
      ${opts.gift && area === 'back' ? `<g class="advent-gift" transform="translate(${GIFT_AT[0]} ${GIFT_AT[1]})" role="button" aria-label="A present for Micah, day ${opts.gift}. Tap to open">${presentSVG(opts.gift)}</g>` : ''}
      ${items}
      <g class="yy" transform="translate(${yx} ${yy})" role="button" aria-label="Yoshi the chinchilla">
        <ellipse cx="0" cy="0" rx="14" ry="4" fill="#000" opacity=".16"/>
        <g class="yy-flip"><g class="yy-pose">${YOSHI}</g></g>
        <g class="yy-dust"></g>
        <text class="ym-emote yy-emote" x="0" y="-54" text-anchor="middle"></text>
        <circle cx="0" cy="-22" r="26" fill="transparent"/>
      </g>
      <g class="ym" transform="translate(${mx} ${my})" role="button" aria-label="Micah">
        <ellipse class="ym-shadow" cx="0" cy="-2" rx="20" ry="5" fill="#000" opacity=".18"/>
        <g class="ym-flip"><g class="ym-pose"><image href="${micahUrl}" x="-40" y="-78" width="80" height="80"/></g></g>
        <text class="ym-emote" x="0" y="-82" text-anchor="middle"></text>
      </g>
    </g>
    ${time === 'night' ? `<rect class="yard-dark" width="360" height="300" fill="#081826" opacity=".26" pointer-events="none"/>${owned.includes('lamp') && area === 'porch' ? '<circle cx="40" cy="176" r="44" fill="#ffe27a" opacity=".22" pointer-events="none"/>' : ''}${snowy ? '' : fireflies(12)}` : time === 'dusk' ? `<rect width="360" height="300" fill="#ff8a5c" opacity=".07" pointer-events="none"/>${snowy ? '' : fireflies(4)}` : ''}
  </svg>`;
}
