// Micah's Yard: a long-term goal. Stars earned in levels are spent on things to build.
// The yard has three parts that open as you get further along the map: the Backyard,
// the Garden and the Front Porch. It follows the real clock: day, sunset and night.
import { KINDS, ORTHO_BED } from './art';
import { YOSHI } from './yoshi';
import { noahsArk } from './scenery';
import { SNACKS } from './snacks';
import { moundSVG } from './dig';

export type YardArea = 'back' | 'garden' | 'porch';
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
  { id: 'garden', name: 'Garden', opensAt: 30 },
  { id: 'porch', name: 'Front Porch', opensAt: 60 },
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
<path d="M10 46 L50 12 L90 46 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3" stroke-linejoin="round"/>
<rect x="18" y="44" width="64" height="46" fill="#c98a4b" stroke="#7a4f25" stroke-width="3"/>
<path d="M18 58 H82 M18 72 H82" stroke="#7a4f25" stroke-width="2" opacity=".5"/>
<path d="M38 90 V68 A12 12 0 0 1 62 68 V90 Z" fill="#3b2a1d"/>
<rect x="34" y="48" width="32" height="10" rx="2" fill="#fff"/>
<text x="50" y="56" text-anchor="middle" font-size="8" font-weight="900" fill="#173a52" font-family="sans-serif">MICAH</text>`;

const tree = `
<rect x="44" y="56" width="12" height="38" rx="3" fill="#7a4f25"/>
<circle cx="50" cy="38" r="30" fill="#4f9a4a"/>
<circle cx="34" cy="48" r="18" fill="#5fae57"/><circle cx="66" cy="46" r="18" fill="#5fae57"/>
<circle cx="40" cy="30" r="5" fill="#e8352f"/><circle cx="62" cy="26" r="5" fill="#e8352f"/><circle cx="56" cy="50" r="5" fill="#e8352f"/>`;

const ballPit = `
<path d="M8 50 H92 L84 90 H16 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="3" stroke-linejoin="round"/>
<g transform="translate(10 18) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(34 12) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(58 18) scale(.36)">${KINDS[1].svg}</g>
<g transform="translate(22 30) scale(.32)">${KINDS[1].svg}</g>
<g transform="translate(48 30) scale(.32)">${KINDS[1].svg}</g>`;

const sprinkler = `
<rect x="44" y="60" width="12" height="30" rx="3" fill="#8a96a0"/>
<circle cx="50" cy="58" r="9" fill="#5d6f7c"/>
<path d="M50 50 Q30 20 10 30 M50 50 Q50 14 50 8 M50 50 Q70 20 90 30" stroke="#6fc3f0" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="2 7"/>`;

const hydrant = `
<rect x="34" y="34" width="32" height="54" rx="6" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<path d="M30 34 H70 A20 16 0 0 0 30 34 Z" fill="#e8352f" stroke="#a3201c" stroke-width="3"/>
<rect x="20" y="52" width="14" height="12" rx="3" fill="#a3201c"/><rect x="66" y="52" width="14" height="12" rx="3" fill="#a3201c"/>
<rect x="28" y="86" width="44" height="8" rx="3" fill="#a3201c"/>`;

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
<rect x="45" y="46" width="10" height="48" fill="#7a4f25"/>
<path d="M18 48 V30 A16 16 0 0 1 50 30 V48 Z" fill="#173a52" stroke="#0e2536" stroke-width="2.5"/>
<path d="M50 48 V30 A16 16 0 0 0 18 30" fill="none"/>
<path d="M50 48 H82 V30 A16 16 0 0 0 50 30" fill="#2b5a78" stroke="#0e2536" stroke-width="2.5"/>
<rect x="76" y="14" width="5" height="24" fill="#5d6f7c"/><rect x="76" y="14" width="14" height="9" fill="#e8352f"/>
<text x="66" y="42" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="sans-serif">MAIL</text>`;

const pumpkin = `
<ellipse cx="50" cy="66" rx="40" ry="28" fill="#f08a24" stroke="#b85f12" stroke-width="3"/>
<path d="M50 40 Q36 66 50 94 M50 40 Q64 66 50 94 M28 46 Q18 66 28 88 M72 46 Q82 66 72 88" stroke="#b85f12" stroke-width="2" fill="none"/>
<path d="M48 40 Q46 26 56 22" stroke="#4f8a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M78 50 a9 9 0 0 1 9 14 a6 6 0 0 0 -9 -14 Z" fill="#173a52"/>`;

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

/** Snow that settles on things in winter, in each item's 100x100 box. */
const SNOW_CAPS: Record<string, string> = {
  doghouse: '<path d="M10 44 L50 10 L90 44 Q86 49 82 44 L50 17 L18 44 Q14 49 10 44 Z" fill="#fff"/>',
  tree: '<ellipse cx="50" cy="11" rx="20" ry="6"/><ellipse cx="28" cy="33" rx="11" ry="5"/><ellipse cx="72" cy="31" rx="11" ry="5"/>',
  hydrant: '<ellipse cx="50" cy="20" rx="17" ry="6"/>',
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
  garden: { x0: 24, x1: 336, y0: 104, y1: 292 },
  porch: { x0: 24, x1: 336, y0: 128, y1: 292 },
};

/** Where Micah and Yoshi start in each part of the yard. */
export const START: Record<YardArea, { micah: [number, number]; yoshi: [number, number] }> = {
  back: { micah: [228, 196], yoshi: [96, 270] },
  garden: { micah: [180, 250], yoshi: [150, 284] },
  porch: { micah: [180, 190], yoshi: [110, 270] },
};

export interface SceneOptions {
  area: YardArea;
  time: YardTime;
  /** Snack ids Micah has eaten, for the shelf. */
  ate: string[];
  /** Micah's dig mound (Backyard only): where it is and whether it is ready to dig up. */
  dig?: { x: number; y: number; ready: boolean };
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
  } else if (area === 'garden') {
    back = `${sky(time)}${grass(88, time, snowy)}${hedge(time, snowy)}
      ${trail('M60 160 C110 150 150 220 200 220 S 280 180 330 196 M200 220 C 196 250 210 270 230 290', snowy)}`;
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
