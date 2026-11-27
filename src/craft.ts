// Micah's Workshop: a merge-and-craft board, played alongside the match levels.
// Tap a maker (the Toy Box, the Seed Bag...) for a new thing. Drag two of the same
// thing together and they craft into the next one up the chain. The last thing in
// each chain is built in Micah's Yard. Friends drop by with orders that pay biscuits,
// and Micah will eat anything dragged onto her. No energy, no waiting: the only limit
// is room on the board.

import { BOOSTER_ICONS, KINDS } from './art';
import { DECOR } from './yard';
import { JUNK_ITEMS } from './ark';

export type ChainId = 'toy' | 'garden' | 'snack' | 'hay' | 'junk';

export interface CraftItem {
  name: string;
  svg: string; // drawn in a 100x100 box
}

export interface Chain {
  id: ChainId;
  name: string;
  /** The maker: tap it for a tier 1 (sometimes tier 2) thing. */
  maker: CraftItem;
  /** Map level to clear before the maker turns up (0 = from the start). */
  opensAt: number;
  /** Lowest tier first. The last one is built in the Yard (decor id below). */
  items: CraftItem[];
  decor: string;
}

const OUT = 'stroke="#3b2a1e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const decorArt = (id: string) => DECOR.find((d) => d.id === id)!.svg;
const shine = (x: number, y: number, rx = 6, ry = 3, rot = -25) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity=".55"/>`;

// ── Toys ──
const stick = `<g transform="rotate(-35 50 50)">
  <path d="M12 46 Q50 40 88 48 L88 56 Q50 50 12 56 Z" fill="#a8743f" ${OUT}/>
  <path d="M56 46 Q64 34 74 28" fill="none" stroke="#3b2a1e" stroke-width="9" stroke-linecap="round"/>
  <path d="M56 46 Q64 34 74 28" fill="none" stroke="#a8743f" stroke-width="4" stroke-linecap="round"/>
  <path d="M20 52 Q46 48 80 52" fill="none" stroke="#c99560" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="34" cy="51" r="2" fill="#6e4520"/><circle cx="70" cy="52" r="1.6" fill="#6e4520"/>
  <path d="M74 28 l6 -4 M74 28 l2 -7" stroke="#5fae57" stroke-width="3" stroke-linecap="round"/>
</g>`;
const ropeToy = `<g transform="rotate(-20 50 50)">
  <path d="M26 50 Q50 38 74 50 Q50 62 26 50 Z" fill="#2f8fe0" ${OUT}/>
  <path d="M30 50 Q50 42 70 50" fill="none" stroke="#8fd0ff" stroke-width="2.5"/>
  ${[30, 38, 46, 54, 62, 70].map((x, i) => `<path d="M${x} ${44 + (i % 2)} l4 12" stroke="${i % 2 ? '#e8352f' : '#fff4e6'}" stroke-width="3.5" stroke-linecap="round"/>`).join('')}
  <circle cx="20" cy="50" r="10" fill="#e8352f" ${OUT}/><circle cx="80" cy="50" r="10" fill="#e8352f" ${OUT}/>
  <path d="M10 50 l-6 -6 M10 50 l-7 2 M10 52 l-4 7 M90 50 l6 -6 M90 50 l7 2 M90 52 l4 7" stroke="#fff4e6" stroke-width="3" stroke-linecap="round"/>
  ${shine(17, 45, 3.5, 2)}${shine(77, 45, 3.5, 2)}
</g>`;

// ── Garden ──
const seed = `
  <ellipse cx="50" cy="84" rx="26" ry="5" fill="#000" opacity=".12"/>
  <path d="M50 24 C70 30 72 64 50 82 C28 64 30 30 50 24 Z" fill="#b5803c" ${OUT}/>
  <path d="M50 30 C42 44 42 64 50 76" fill="none" stroke="#7a4f25" stroke-width="3" stroke-linecap="round"/>
  ${shine(60, 42, 5, 9, 15)}`;
const sprout = `
  <path d="M22 76 Q50 64 78 76 L74 90 H26 Z" fill="#7a5233" ${OUT}/>
  <path d="M30 80 h6 M50 78 h4 M64 82 h6" stroke="#5e3d24" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M50 72 V44" stroke="#3f8a3a" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 52 C36 54 24 44 22 30 C36 28 48 36 50 52 Z" fill="#7cc86a" ${OUT}/>
  <path d="M50 46 C62 48 76 38 78 22 C62 22 52 30 50 46 Z" fill="#5fae57" ${OUT}/>
  <path d="M28 33 Q40 38 47 49 M72 27 Q62 34 53 43" fill="none" stroke="#c8efb4" stroke-width="2" stroke-linecap="round"/>`;
const daisyHead = (cx: number, cy: number, r: number, petal: string, mid = '#ffc12e') =>
  `${Array.from({ length: 8 }, (_, i) => `<ellipse cx="${cx}" cy="${cy - r * 0.62}" rx="${r * 0.28}" ry="${r * 0.5}" transform="rotate(${i * 45} ${cx} ${cy})" fill="${petal}" stroke="#3b2a1e" stroke-width="2"/>`).join('')}
   <circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${mid}" stroke="#3b2a1e" stroke-width="2"/>`;
const daisy = `
  <path d="M50 92 C48 74 52 62 50 52" fill="none" stroke="#3f8a3a" stroke-width="5" stroke-linecap="round"/>
  <path d="M50 78 C40 76 32 70 30 62 C40 62 48 68 50 78 Z" fill="#5fae57" ${OUT}/>
  ${daisyHead(50, 38, 34, '#ffffff')}
  <circle cx="46" cy="35" r="3" fill="#fff" opacity=".6"/>`;
const tulip = (x: number, y: number, c: string, d: string, rot = 0) => `<g transform="rotate(${rot} ${x} ${y + 30})">
  <path d="M${x} ${y + 14} V${y + 50}" stroke="#3f8a3a" stroke-width="4" stroke-linecap="round"/>
  <path d="M${x - 12} ${y - 6} L${x - 6} ${y + 2} L${x} ${y - 8} L${x + 6} ${y + 2} L${x + 12} ${y - 6} C${x + 14} ${y + 12} ${x + 8} ${y + 18} ${x} ${y + 18} C${x - 8} ${y + 18} ${x - 14} ${y + 12} ${x - 12} ${y - 6} Z" fill="${c}" ${OUT}/>
  <path d="M${x + 6} ${y + 2} C${x + 10} ${y + 10} ${x + 6} ${y + 16} ${x + 2} ${y + 17}" fill="none" stroke="${d}" stroke-width="3" stroke-linecap="round"/></g>`;
const tulips = `
  ${tulip(32, 30, '#ff8fb1', '#e0628a', -14)}${tulip(68, 30, '#ffc12e', '#d99a1a', 14)}${tulip(50, 18, '#e8352f', '#a3201c')}
  <path d="M34 66 L50 92 L66 66 Z" fill="#fff4e6" ${OUT}/>
  <path d="M38 70 L50 88 L62 70" fill="none" stroke="#e8c9a0" stroke-width="2"/>
  <path d="M44 74 Q50 80 56 74" fill="none" stroke="#e8352f" stroke-width="4" stroke-linecap="round"/>`;
const flowerPot = `
  ${daisyHead(32, 30, 22, '#ff8fb1')}${daisyHead(68, 28, 22, '#ffffff')}${daisyHead(50, 20, 24, '#ffc12e', '#e8352f')}
  <path d="M30 40 L44 54 M70 40 L56 54 M50 34 V54" stroke="#3f8a3a" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M20 54 H80 L72 92 H28 Z" fill="#d9643a" ${OUT}/>
  <path d="M16 52 H84 V64 H16 Z" fill="#e8784a" ${OUT}/>
  <path d="M64 66 L60 90 H70 L74 66 Z" fill="#b84e2a"/>
  <path d="M24 58 H40" stroke="#ffb38a" stroke-width="3" stroke-linecap="round"/>`;

// ── Snacks (Micah will eat any of these, and most other things) ──
const crumb = `
  <ellipse cx="50" cy="82" rx="30" ry="5" fill="#000" opacity=".12"/>
  <path d="M26 66 L34 44 L52 38 L70 46 L76 66 L58 76 L38 76 Z" fill="#d99a4e" ${OUT}/>
  <path d="M40 50 L52 46 L62 52" fill="none" stroke="#f2c27a" stroke-width="3" stroke-linecap="round"/>
  <g fill="#a86b35"><circle cx="44" cy="62" r="2.2"/><circle cx="58" cy="60" r="2"/><circle cx="50" cy="68" r="1.8"/></g>
  <path d="M16 74 l5 -4 l3 5 Z M82 72 l4 -5 l4 5 Z" fill="#d99a4e" stroke="#3b2a1e" stroke-width="2" stroke-linejoin="round"/>`;
const kibbleBit = (x: number, y: number, r: number, c: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#3b2a1e" stroke-width="2.5"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity=".35"/>`;
const kibble = `
  <path d="M14 64 Q50 92 86 64 Q84 78 50 86 Q16 78 14 64 Z" fill="#e8352f" ${OUT}/>
  ${kibbleBit(30, 58, 9, '#a86b35')}${kibbleBit(48, 54, 10, '#8a5428')}${kibbleBit(66, 58, 9, '#b87a3e')}${kibbleBit(40, 66, 8, '#94592a')}${kibbleBit(58, 67, 8, '#a86b35')}${kibbleBit(50, 42, 8, '#b87a3e')}
  <path d="M14 64 Q50 76 86 64" fill="none" stroke="#3b2a1e" stroke-width="3"/>`;
const taco = `
  <ellipse cx="50" cy="86" rx="34" ry="5" fill="#000" opacity=".12"/>
  <path d="M14 78 C14 40 86 40 86 78 Z" fill="#ffc94a" ${OUT}/>
  <path d="M20 56 Q30 44 40 50 Q48 40 58 48 Q68 42 76 52 Q82 54 82 60" fill="none" stroke="#5fae57" stroke-width="7" stroke-linecap="round"/>
  <path d="M26 52 h3 M44 46 h3 M62 47 h3" stroke="#e8352f" stroke-width="5" stroke-linecap="round"/>
  <path d="M20 66 C20 50 80 50 80 66" fill="none" stroke="#e0a93a" stroke-width="3"/>
  <path d="M14 78 C14 52 86 52 86 78" fill="#ffd56a" ${OUT}/>
  <g fill="#e0a93a"><circle cx="34" cy="70" r="2"/><circle cx="50" cy="66" r="2"/><circle cx="66" cy="70" r="2"/><circle cx="42" cy="74" r="1.6"/><circle cx="58" cy="74" r="1.6"/></g>
  ${shine(30, 62, 6, 2.5, -20)}`;
/** A box of tacos for taco night, in the purple of the little sign over the back fence. */
const tacoBox = `
  <path d="M18 44 H82 V88 H18 Z" fill="#7a4ab0" ${OUT}/>
  <path d="M66 46 H80 V86 H66 Z" fill="#663c96"/>
  <path d="M12 34 H88 V46 H12 Z" fill="#8e5bd6" ${OUT}/>
  ${[26, 42, 58].map((x) => `<path d="M${x} 34 C${x} 18 ${x + 18} 18 ${x + 18} 34 Z" fill="#ffd56a" ${OUT}/><path d="M${x + 3} 28 Q${x + 9} 22 ${x + 15} 28" fill="none" stroke="#5fae57" stroke-width="4" stroke-linecap="round"/>`).join('')}
  <path d="M50 56 C42 56 40 64 40 70 L36 74 H64 L60 70 C60 64 58 56 50 56 Z" fill="#ff8fb1" stroke="#3b2a1e" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="50" cy="77" r="3" fill="#ff8fb1" stroke="#3b2a1e" stroke-width="2"/>
  <path d="M22 50 V82" stroke="#b38df0" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;

// ── Yoshi's things ──
const hayWisp = `<g fill="none" stroke-linecap="round">
  <path d="M22 76 Q42 50 78 28" stroke="#3b2a1e" stroke-width="8"/><path d="M22 76 Q42 50 78 28" stroke="#e8c45a" stroke-width="4"/>
  <path d="M30 80 Q52 58 82 44" stroke="#3b2a1e" stroke-width="8"/><path d="M30 80 Q52 58 82 44" stroke="#d6ac3a" stroke-width="4"/>
  <path d="M18 64 Q40 46 64 22" stroke="#3b2a1e" stroke-width="8"/><path d="M18 64 Q40 46 64 22" stroke="#f2d77a" stroke-width="4"/>
  <path d="M52 52 l10 2 M44 62 l8 4" stroke="#b58a2a" stroke-width="2.5"/></g>`;
const hayBundle = `
  <ellipse cx="50" cy="88" rx="34" ry="5" fill="#000" opacity=".12"/>
  <path d="M24 86 C20 66 22 40 30 18 L42 24 L50 14 L58 24 L70 18 C78 40 80 66 76 86 Z" fill="#e8c45a" ${OUT}/>
  <path d="M34 82 C32 64 34 44 38 28 M50 84 V24 M66 82 C68 64 66 44 62 28" fill="none" stroke="#c99a2a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M22 56 Q50 64 78 56 V64 Q50 72 22 64 Z" fill="#e8352f" ${OUT}/>
  <path d="M46 60 l-6 14 M54 60 l6 14" stroke="#e8352f" stroke-width="5" stroke-linecap="round"/>
  <path d="M28 30 l-6 -8 M72 30 l6 -8" stroke="#3b2a1e" stroke-width="3" stroke-linecap="round"/>`;
const appleStick = `<g transform="rotate(30 50 50)">
  <rect x="40" y="10" width="20" height="80" rx="9" fill="#b07a48" ${OUT}/>
  <path d="M46 16 V84" stroke="#d6a676" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 34 l10 4 M50 60 l10 4" stroke="#7a4f25" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="50" cy="12" rx="9" ry="4" fill="#e9cfa8" stroke="#3b2a1e" stroke-width="2.5"/>
  <path d="M60 46 C70 42 76 46 76 52 C70 56 64 52 60 50 Z" fill="#7cc86a" stroke="#3b2a1e" stroke-width="2.5" stroke-linejoin="round"/>
</g>`;

// ── Noah's Ark junk ──
const bottleCap = `
  <ellipse cx="50" cy="80" rx="30" ry="6" fill="#000" opacity=".12"/>
  <path d="${Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const r = i % 2 ? 30 : 34;
    return `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(52 + Math.sin(a) * r * 0.9).toFixed(1)}`;
  }).join(' ')} Z" fill="#c9ced3" ${OUT}/>
  <ellipse cx="50" cy="52" rx="22" ry="19" fill="#e8352f" stroke="#3b2a1e" stroke-width="2.5"/>
  <path d="M38 52 Q50 42 62 52" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  ${shine(40, 42, 6, 3)}`;
const oldTire = `
  <ellipse cx="50" cy="88" rx="38" ry="5" fill="#000" opacity=".14"/>
  <ellipse cx="50" cy="56" rx="38" ry="32" fill="#2b2b2b" ${OUT}/>
  <ellipse cx="50" cy="56" rx="18" ry="14" fill="#5f9c55" stroke="#3b2a1e" stroke-width="3"/>
  <path d="M50 70 Q42 66 40 60" fill="none" stroke="#7cc86a" stroke-width="3" stroke-linecap="round"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<path d="M${(50 + Math.cos(a) * 24).toFixed(1)} ${(56 + Math.sin(a) * 20).toFixed(1)} L${(50 + Math.cos(a) * 34).toFixed(1)} ${(56 + Math.sin(a) * 29).toFixed(1)}" stroke="#454545" stroke-width="3"/>`;
  }).join('')}
  <path d="M24 38 Q36 28 52 26" fill="none" stroke="#6a6a6a" stroke-width="3" stroke-linecap="round"/>`;

// ── Makers ──
const toyBox = `
  <ellipse cx="50" cy="92" rx="40" ry="5" fill="#000" opacity=".15"/>
  <g transform="translate(22 6) scale(.34)">${KINDS[1].svg}</g>
  <g transform="translate(46 2) scale(.4) rotate(20 50 50)">${KINDS[0].svg}</g>
  <path d="M12 40 H88 V88 H12 Z" fill="#c98a4b" ${OUT}/>
  <path d="M70 42 H86 V86 H70 Z" fill="#b07638"/>
  <path d="M12 56 H88" stroke="#3b2a1e" stroke-width="3"/>
  <path d="M8 32 H92 L88 44 H12 Z" fill="#e8352f" ${OUT}/>
  <rect x="42" y="50" width="16" height="12" rx="3" fill="#ffc12e" stroke="#3b2a1e" stroke-width="2.5"/>
  <path d="M18 62 V82" stroke="#e3ad73" stroke-width="3" stroke-linecap="round"/>
  <text x="50" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" stroke="#3b2a1e" stroke-width="1.2" paint-order="stroke" font-family="sans-serif">TOYS</text>`;
const seedBag = `
  <ellipse cx="50" cy="92" rx="34" ry="5" fill="#000" opacity=".15"/>
  <path d="M22 26 H78 L82 88 H18 Z" fill="#f6e7c8" ${OUT}/>
  <path d="M22 26 L26 18 H74 L78 26" fill="#e9d4a8" ${OUT}/>
  <path d="M24 34 H76 V70 H24 Z" fill="#7cc3ec" stroke="#3b2a1e" stroke-width="2.5"/>
  <path d="M24 62 Q40 56 50 62 T76 60 V70 H24 Z" fill="#5fae57"/>
  ${daisyHead(50, 46, 20, '#ff8fb1')}
  <path d="M50 54 V64" stroke="#3f8a3a" stroke-width="3"/>
  <text x="50" y="84" text-anchor="middle" font-size="12" font-weight="900" fill="#7a4f25" font-family="sans-serif">SEEDS</text>`;
const snackJar = `
  <ellipse cx="50" cy="92" rx="32" ry="5" fill="#000" opacity=".15"/>
  <path d="M24 30 H76 Q84 30 84 40 V82 Q84 90 74 90 H26 Q16 90 16 82 V40 Q16 30 24 30 Z" fill="#d8eef8" ${OUT}/>
  <g transform="translate(20 46) scale(.32)">${BOOSTER_ICONS.biscuit}</g>
  <g transform="translate(48 50) scale(.3)">${BOOSTER_ICONS.biscuit}</g>
  <g transform="translate(32 62) scale(.3)">${BOOSTER_ICONS.biscuit}</g>
  <path d="M22 16 H78 V30 H22 Z" fill="#e8352f" ${OUT}/>
  <path d="M30 22 H60" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round"/>
  <path d="M24 40 V78" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
const hayBasket = `
  <ellipse cx="50" cy="92" rx="38" ry="5" fill="#000" opacity=".15"/>
  <path d="M14 50 C20 28 40 30 50 24 C60 30 80 28 86 50 Z" fill="#e8c45a" ${OUT}/>
  <path d="M26 46 l-6 -14 M40 44 l-2 -16 M58 44 l4 -16 M74 46 l8 -12" stroke="#3b2a1e" stroke-width="5" stroke-linecap="round"/>
  <path d="M26 46 l-6 -14 M40 44 l-2 -16 M58 44 l4 -16 M74 46 l8 -12" stroke="#f2d77a" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 48 H88 L80 90 H20 Z" fill="#c98a4b" ${OUT}/>
  <path d="M16 62 H84 M18 76 H82" stroke="#8a5a2a" stroke-width="3"/>
  ${[24, 36, 48, 60, 72].map((x) => `<path d="M${x} 50 l2 38" stroke="#a8743f" stroke-width="3"/>`).join('')}
  <path d="M30 56 Q50 50 70 56" fill="none" stroke="#e3ad73" stroke-width="2.5" stroke-linecap="round"/>`;
const junkBin = `
  <ellipse cx="50" cy="92" rx="34" ry="5" fill="#000" opacity=".15"/>
  <g transform="translate(14 0) scale(.42) rotate(-20 50 50)">${JUNK_ITEMS[0].svg}</g>
  <g transform="translate(46 2) scale(.4) rotate(15 50 50)">${JUNK_ITEMS[1].svg}</g>
  <path d="M20 36 H80 L74 90 H26 Z" fill="#8a96a0" ${OUT}/>
  <path d="M34 42 L36 84 M50 42 V84 M66 42 L64 84" stroke="#5d6f7c" stroke-width="3" stroke-linecap="round"/>
  <path d="M14 30 H86 V40 H14 Z" fill="#a8b4bd" ${OUT} transform="rotate(-6 50 35)"/>
  <path d="M60 54 l4 4 M30 70 l3 2" stroke="#b05a2a" stroke-width="3" stroke-linecap="round"/>
  <path d="M24 46 L28 80" stroke="#d6e0e6" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;

export const CHAINS: Chain[] = [
  {
    id: 'toy', name: 'Toys', opensAt: 0, decor: 'ballpit',
    maker: { name: 'Toy Box', svg: toyBox },
    items: [
      { name: 'Stick', svg: stick },
      { name: 'Tennis Ball', svg: KINDS[1].svg },
      { name: 'Squeaky Bone', svg: KINDS[0].svg },
      { name: 'Rope Toy', svg: ropeToy },
      { name: 'Lobster Plush', svg: KINDS[4].svg },
      { name: 'Ball Pit', svg: decorArt('ballpit') },
    ],
  },
  {
    id: 'garden', name: 'Garden', opensAt: 0, decor: 'flowers',
    maker: { name: 'Seed Bag', svg: seedBag },
    items: [
      { name: 'Seed', svg: seed },
      { name: 'Sprout', svg: sprout },
      { name: 'Daisy', svg: daisy },
      { name: 'Tulips', svg: tulips },
      { name: 'Flower Pot', svg: flowerPot },
      { name: 'Flower Bed', svg: decorArt('flowers') },
    ],
  },
  {
    id: 'snack', name: 'Snacks', opensAt: 10, decor: 'bowl',
    maker: { name: 'Treat Jar', svg: snackJar },
    items: [
      { name: 'Crumb', svg: crumb },
      { name: 'Kibble', svg: kibble },
      { name: 'Biscuit', svg: BOOSTER_ICONS.biscuit },
      { name: 'Taco', svg: taco },
      { name: 'Taco Night', svg: tacoBox },
      { name: 'Snack Station', svg: decorArt('bowl') },
    ],
  },
  {
    id: 'hay', name: 'Yoshi', opensAt: 15, decor: 'hidey',
    maker: { name: 'Hay Basket', svg: hayBasket },
    items: [
      { name: 'Hay', svg: hayWisp },
      { name: 'Hay Bundle', svg: hayBundle },
      { name: 'Apple Stick', svg: appleStick },
      { name: 'Chew Pot', svg: decorArt('chews') },
      { name: 'Hay Rack', svg: decorArt('hayrack') },
      { name: 'Hidey House', svg: decorArt('hidey') },
    ],
  },
  {
    id: 'junk', name: 'Ark Junk', opensAt: 41, decor: 'tireswing',
    maker: { name: 'Ark Junk Bin', svg: junkBin },
    items: [
      { name: 'Bottle Cap', svg: bottleCap },
      { name: 'Sock', svg: JUNK_ITEMS[0].svg },
      { name: 'Old Boot', svg: JUNK_ITEMS[1].svg },
      { name: 'Rubber Duck', svg: JUNK_ITEMS[3].svg },
      { name: 'Old Tire', svg: oldTire },
      { name: 'Tire Swing', svg: decorArt('tireswing') },
    ],
  },
];

export const chainOf = (id: string): Chain | undefined => CHAINS.find((c) => c.id === id);
export const ALL_ITEMS = CHAINS.reduce((n, c) => n + c.items.length, 0);

// ── The board ──
export const COLS = 7;
export const ROWS = 9;
export const CELLS = COLS * ROWS;

/** One cell: '' empty, 'm:toy' a maker, 'toy:2' a thing (tier from 1), 'toy:2:b' a thing still in its box. */
export type Cell = string;
export interface Parsed {
  kind: 'empty' | 'maker' | 'item';
  chain?: Chain;
  tier?: number;
  boxed?: boolean;
}

export function parse(c: Cell): Parsed {
  if (!c) return { kind: 'empty' };
  const [a, b, box] = c.split(':');
  if (a === 'm') {
    const chain = chainOf(b);
    return chain ? { kind: 'maker', chain } : { kind: 'empty' };
  }
  const chain = chainOf(a);
  const tier = Number(b);
  if (!chain || !Number.isInteger(tier) || tier < 1 || tier > chain.items.length) return { kind: 'empty' };
  return { kind: 'item', chain, tier, boxed: box === 'b' };
}

export const itemCode = (chain: ChainId, tier: number) => `${chain}:${tier}`;
export const itemOf = (code: string): CraftItem | undefined => {
  const p = parse(code);
  return p.kind === 'item' ? p.chain!.items[p.tier! - 1] : p.kind === 'maker' ? p.chain!.maker : undefined;
};

export type Who = 'micah' | 'yoshi' | 'owl' | 'raccoon';
export interface Order {
  who: Who;
  wants: string[]; // item codes, such as 'toy:3'
  reward: number; // biscuits
}

export interface CraftSave {
  cells: Cell[];
  orders: Order[];
  /** Item codes discovered so far. */
  found: string[];
  /** Merges made, all time. */
  merges: number;
  /** Orders filled, all time. */
  filled: number;
}

const MAKER_SPOTS = [57, 59, 61, 55, 63 - 1, 50, 52];

export function freshCraft(): CraftSave {
  const cells: Cell[] = Array(CELLS).fill('');
  // The top of the board starts packed with boxed things to unbox: drop a match on one to open it.
  const pattern = ['toy:1', 'garden:2', 'toy:2', 'garden:1', 'toy:3', 'garden:1', 'toy:1'];
  for (let i = 0; i < COLS * 4; i++) {
    const p = pattern[(i * 3 + Math.floor(i / COLS)) % pattern.length];
    cells[i] = `${p}:b`;
  }
  cells[57] = 'm:toy';
  cells[59] = 'm:garden';
  cells[49] = 'toy:1';
  cells[50] = 'toy:1';
  cells[52] = 'garden:1';
  cells[53] = 'garden:1';
  return { cells, orders: [], found: ['toy:1', 'garden:1'], merges: 0, filled: 0 };
}

/** Is a chain's maker on offer yet? */
export const chainOpen = (c: Chain, stars: Record<number, number>) => !c.opensAt || (stars[c.opensAt] ?? 0) > 0;

/** Put any newly opened makers on the board. Returns the chains placed (or still waiting for room). */
export function placeMakers(s: CraftSave, stars: Record<number, number>): { placed: Chain[]; waiting: Chain[] } {
  const placed: Chain[] = [];
  const waiting: Chain[] = [];
  for (const c of CHAINS) {
    if (!chainOpen(c, stars) || s.cells.includes(`m:${c.id}`)) continue;
    const spot = [...MAKER_SPOTS, ...nearestEmpty(s.cells, 59)].find((i) => s.cells[i] === '');
    if (spot === undefined) {
      waiting.push(c);
      continue;
    }
    s.cells[spot] = `m:${c.id}`;
    if (!s.found.includes(itemCode(c.id, 1))) s.found.push(itemCode(c.id, 1));
    placed.push(c);
  }
  return { placed, waiting };
}

const rc = (i: number) => [Math.floor(i / COLS), i % COLS] as const;

/** Empty cells, nearest to `from` first. */
export function nearestEmpty(cells: Cell[], from: number): number[] {
  const [r0, c0] = rc(from);
  return cells
    .map((c, i) => [c, i] as const)
    .filter(([c]) => c === '')
    .map(([, i]) => i)
    .sort((a, b) => {
      const [ra, ca] = rc(a);
      const [rb, cb] = rc(b);
      const da = Math.hypot(ra - r0, ca - c0);
      const db = Math.hypot(rb - r0, cb - c0);
      return da - db || a - b;
    });
}

/** Tap a maker: a new tier 1 thing (now and then a tier 2) lands in the nearest empty cell. */
export function spawn(s: CraftSave, makerAt: number, rand = Math.random): { at: number; code: string } | null {
  const p = parse(s.cells[makerAt]);
  if (p.kind !== 'maker') return null;
  const at = nearestEmpty(s.cells, makerAt)[0];
  if (at === undefined) return null;
  const code = itemCode(p.chain!.id, rand() < 0.15 ? 2 : 1);
  s.cells[at] = code;
  return { at, code };
}

export type DropResult =
  | { kind: 'none' }
  | { kind: 'move' }
  | { kind: 'swap' }
  | { kind: 'merge'; code: string; fresh: boolean; unboxed: boolean; finished?: Chain };

/**
 * Drag the thing at `from` onto `to`. Two of the same craft into the next one up (also into a
 * boxed one, which opens it). Onto an empty cell it moves; onto anything else loose they swap.
 * Crafting the last thing in a chain empties the cell: it goes to the Yard (see `finished`).
 */
export function drop(s: CraftSave, from: number, to: number): DropResult {
  if (from === to || from < 0 || to < 0 || from >= CELLS || to >= CELLS) return { kind: 'none' };
  const a = parse(s.cells[from]);
  const b = parse(s.cells[to]);
  if (a.kind === 'empty' || a.boxed) return { kind: 'none' };
  if (a.kind === 'item' && b.kind === 'item' && a.chain === b.chain && a.tier === b.tier && a.tier! < a.chain!.items.length) {
    const tier = a.tier! + 1;
    const code = itemCode(a.chain!.id, tier);
    const fresh = !s.found.includes(code);
    if (fresh) s.found.push(code);
    s.merges++;
    s.cells[from] = '';
    const finished = tier === a.chain!.items.length ? a.chain : undefined;
    s.cells[to] = finished ? '' : code;
    return { kind: 'merge', code, fresh, unboxed: !!b.boxed, finished };
  }
  if (b.kind === 'empty') {
    s.cells[to] = s.cells[from];
    s.cells[from] = '';
    return { kind: 'move' };
  }
  if (b.boxed) return { kind: 'none' };
  [s.cells[from], s.cells[to]] = [s.cells[to], s.cells[from]];
  return { kind: 'swap' };
}

/** Micah eats the thing at `at` (never a maker or a boxed thing). Returns what she ate. */
export function feedMicah(s: CraftSave, at: number): CraftItem | null {
  const p = parse(s.cells[at]);
  if (p.kind !== 'item' || p.boxed) return null;
  s.cells[at] = '';
  return p.chain!.items[p.tier! - 1];
}

export const EAT_LINES: Record<string, string> = {
  Taco: 'Micah ate the taco. Her favourite.',
  'Taco Night': 'Micah ate taco night. All of it.',
  Sock: 'Micah ate a sock. Again.',
  'Old Boot': 'Micah ate a boot. No regrets.',
  'Rubber Duck': 'Micah ate a duck. It squeaked.',
  Hay: 'Micah ate Yoshi’s hay. Rude.',
  'Hay Bundle': 'Micah ate Yoshi’s hay. Rude.',
  'Lobster Plush': 'Micah ate her lobster. She misses it.',
};
export const eatLine = (it: CraftItem) => EAT_LINES[it.name] ?? `Micah ate the ${it.name.toLowerCase()}.`;

// ── Orders ──
const loose = (s: CraftSave) => s.cells.map(parse).filter((p) => p.kind === 'item' && !p.boxed).map((p) => itemCode(p.chain!.id, p.tier!));

/** Which of an order's wants are on the board right now (counting repeats). */
export function orderHave(s: CraftSave, o: Order): boolean[] {
  const pool = loose(s);
  return o.wants.map((w) => {
    const i = pool.indexOf(w);
    if (i < 0) return false;
    pool.splice(i, 1);
    return true;
  });
}
export const orderReady = (s: CraftSave, o: Order) => orderHave(s, o).every(Boolean);

/** Hand over an order's things. Returns the biscuits earned (0 if it can't be filled yet). */
export function fillOrder(s: CraftSave, index: number): number {
  const o = s.orders[index];
  if (!o || !orderReady(s, o)) return 0;
  for (const w of o.wants) {
    const at = s.cells.indexOf(w);
    s.cells[at] = '';
  }
  s.orders.splice(index, 1);
  s.filled++;
  return o.reward;
}

const WHO_FOR: Record<ChainId, Who[]> = {
  toy: ['micah', 'micah', 'owl'],
  garden: ['owl', 'yoshi', 'micah'],
  snack: ['micah', 'raccoon'],
  hay: ['yoshi', 'yoshi'],
  junk: ['raccoon', 'raccoon', 'micah'],
};

export const rewardFor = (wants: string[]) =>
  wants.reduce((sum, w) => sum + Math.round(2 ** (parse(w).tier! - 1) * 1.5), 0) + 2;

/** A new order from a friend, asking for things a little past what has been crafted so far. */
export function makeOrder(s: CraftSave, open: Chain[], rand = Math.random): Order {
  const pick = <T>(xs: T[]) => xs[Math.floor(rand() * xs.length) % xs.length];
  const n = s.filled >= 3 && rand() < 0.4 ? 2 : 1;
  const wants: string[] = [];
  const first = pick(open);
  for (let i = 0; i < n; i++) {
    const c = i === 0 ? first : pick(open);
    const best = Math.max(1, ...s.found.map(parse).filter((p) => p.chain === c).map((p) => p.tier!));
    const top = c.items.length - 1; // the last one goes to the Yard, so nobody orders it
    const lo = Math.min(top, Math.max(2, best - 1));
    const hi = Math.min(top, Math.max(2, best + 1), s.filled < 2 ? 2 : top);
    wants.push(itemCode(c.id, lo + Math.floor(rand() * (hi - lo + 1))));
  }
  return { who: pick(WHO_FOR[first.id]), wants, reward: rewardFor(wants) };
}

/** Keep three orders on the go. */
export function topUpOrders(s: CraftSave, stars: Record<number, number>, rand = Math.random): void {
  const open = CHAINS.filter((c) => chainOpen(c, stars));
  while (s.orders.length < 3) s.orders.push(makeOrder(s, open, rand));
}

/** Biscuits for discovering something new: a little more the higher it is. */
export const findReward = (code: string) => 2 * (parse(code).tier ?? 1);
/** Biscuits for crafting a chain's last thing again when it is already in the Yard. */
export const REBUILD_REWARD = 40;

/** Turn whatever is stored into a valid workshop (or undefined if there was none). */
export function cleanCraft(raw: unknown): CraftSave | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const d = raw as Record<string, unknown>;
  if (!Array.isArray(d.cells)) return undefined;
  const cells: Cell[] = Array.from({ length: CELLS }, (_, i) => {
    const c = d.cells as unknown[];
    const v = typeof c[i] === 'string' ? (c[i] as string) : '';
    return parse(v).kind === 'empty' ? '' : v;
  });
  // Never more than one of each maker.
  const seen = new Set<string>();
  cells.forEach((c, i) => {
    if (!c.startsWith('m:')) return;
    if (seen.has(c)) cells[i] = '';
    seen.add(c);
  });
  const orders = (Array.isArray(d.orders) ? d.orders : [])
    .filter((o): o is Order => !!o && typeof o === 'object' && Array.isArray((o as Order).wants))
    .map((o) => ({
      who: (['micah', 'yoshi', 'owl', 'raccoon'] as Who[]).includes(o.who) ? o.who : 'micah',
      wants: o.wants.filter((w) => typeof w === 'string' && parse(w).kind === 'item').slice(0, 3),
      reward: typeof o.reward === 'number' && Number.isFinite(o.reward) ? Math.max(1, Math.min(500, Math.floor(o.reward))) : 3,
    }))
    .filter((o) => o.wants.length)
    .slice(0, 3);
  const found = Array.isArray(d.found) ? [...new Set(d.found.filter((x): x is string => typeof x === 'string' && parse(x).kind === 'item'))] : [];
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);
  return { cells, orders, found, merges: n(d.merges), filled: n(d.filled) };
}
