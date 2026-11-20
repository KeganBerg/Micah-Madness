// Micah's Yard: a long-term goal. Stars earned in levels are spent on decorations.
import { KINDS, ORTHO_BED } from './art';

export interface Decor {
  id: string;
  name: string;
  desc: string;
  cost: number; // stars
  /** Where it sits in the 360x300 yard scene. */
  x: number;
  y: number;
  w: number;
  svg: string; // drawn in a 100x100 box
}

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

export const DECOR: Decor[] = [
  { id: 'doghouse', name: 'Doghouse', desc: 'A red-roofed home with Micah’s name on it.', cost: 1, x: 10, y: 56, w: 110, svg: doghouse },
  { id: 'bed', name: 'Orthopedic Bed', desc: 'Light blue, with memory foam for Micah’s naps.', cost: 2, x: 262, y: 200, w: 96, svg: ORTHO_BED },
  { id: 'tree', name: 'Shade Tree', desc: 'Perfect for hiding from the sun.', cost: 2, x: 268, y: 24, w: 90, svg: tree },
  { id: 'bowl', name: 'Snack Station', desc: 'A bowl that is never empty.', cost: 3, x: 112, y: 212, w: 64, svg: KINDS[3].svg },
  { id: 'lobster', name: 'Lobster Plush', desc: 'Micah’s favourite squeaky toy.', cost: 3, x: 300, y: 140, w: 50, svg: KINDS[4].svg },
  { id: 'hydrant', name: 'Fire Hydrant', desc: 'Every yard needs one.', cost: 4, x: 130, y: 98, w: 56, svg: hydrant },
  { id: 'ballpit', name: 'Ball Pit', desc: 'A tub full of tennis balls.', cost: 4, x: 6, y: 186, w: 100, svg: ballPit },
  { id: 'flowers', name: 'Flower Bed', desc: 'Freshly dug. Micah swears it wasn’t her.', cost: 5, x: 180, y: 196, w: 88, svg: flowers },
  { id: 'sprinkler', name: 'Sprinkler', desc: 'Zoomies through the water.', cost: 5, x: 130, y: 150, w: 54, svg: sprinkler },
];

/** The whole yard scene, with bought items drawn and the rest shown as empty spots.
 * Built items are tappable groups; roam.ts moves Micah (the .ym group) between them. */
export function yardScene(owned: string[], micahUrl: string): string {
  const items = DECOR.map((d) => {
    const has = owned.includes(d.id);
    const s = d.w / 100;
    if (has)
      return `<g class="yard-item" data-id="${d.id}" data-bottom="${d.y + d.w * 0.9}" role="button" aria-label="${d.name}"><g transform="translate(${d.x} ${d.y}) scale(${s})"><g class="yard-item-art">${d.svg}</g></g></g>`;
    const cx = d.x + d.w / 2;
    const cy = d.y + d.w / 2;
    return `<g opacity=".7"><circle cx="${cx}" cy="${cy}" r="${Math.min(26, d.w / 3)}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff" font-family="Nunito, sans-serif">${d.cost}★</text></g>`;
  }).join('');
  return `<svg viewBox="0 0 360 300" class="yard-scene" role="img" aria-label="Micah's yard with ${owned.length} of ${DECOR.length} decorations">
    <rect width="360" height="300" fill="#7db86a"/>
    <rect width="360" height="64" fill="#bfe6ff"/>
    <g fill="#ffffff" opacity=".9">${Array.from({ length: 19 }, (_, i) => `<rect x="${i * 20 + 2}" y="40" width="12" height="34" rx="3"/>`).join('')}<rect x="0" y="52" width="360" height="6"/></g>
    <g class="yard-layer">
      ${items}
      <g class="ym" transform="translate(228 168)" role="button" aria-label="Micah">
        <ellipse class="ym-shadow" cx="0" cy="-2" rx="20" ry="5" fill="#000" opacity=".18"/>
        <g class="ym-flip"><g class="ym-pose"><image href="${micahUrl}" x="-40" y="-78" width="80" height="80"/></g></g>
        <text class="ym-emote" x="0" y="-82" text-anchor="middle"></text>
      </g>
    </g>
  </svg>`;
}
