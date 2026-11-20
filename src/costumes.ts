// Micah's wardrobe. The lobster suit is the player's own photo; every other outfit
// is drawn over a hand-drawn Micah (a black dog with a grey muzzle) in a 100x100 box.
import micahPhoto from './assets/micah.png';

export type Unlock = { free: true } | { level: number } | { biscuits: number } | { weekly: number };

export interface Costume {
  id: string;
  name: string;
  desc: string;
  unlock: Unlock;
  /** Drawn behind Micah (wings, capes). */
  back?: string;
  /** Drawn over Micah's body, clipped to it (suits, stripes). */
  suit?: string;
  /** Drawn on top (hats, glasses). */
  front?: string;
}

const FUR = '#22252b';
const FUR_LIGHT = '#33373f';
const MUZZLE = '#8c9198';

/** Micah sitting, facing you. Body path is reused as the clip for suits. */
const BODY = 'M28 96 C24 76 30 60 50 58 C70 60 76 76 72 96 Z';

function dog(suit = ''): string {
  return `
  <path d="M70 88 C84 86 90 74 86 64" fill="none" stroke="${FUR}" stroke-width="7" stroke-linecap="round"/>
  <path d="${BODY}" fill="${FUR}"/>
  ${suit ? `<clipPath id="body"><path d="${BODY}"/></clipPath><g clip-path="url(#body)">${suit}</g>` : ''}
  <path d="M44 64 Q50 70 56 64" fill="none" stroke="${FUR_LIGHT}" stroke-width="3" stroke-linecap="round" opacity="${suit ? 0 : 1}"/>
  <rect x="37" y="76" width="10" height="20" rx="5" fill="${FUR}"/>
  <rect x="53" y="76" width="10" height="20" rx="5" fill="${FUR}"/>
  <ellipse cx="42" cy="95" rx="6.5" ry="3.5" fill="${FUR_LIGHT}"/>
  <ellipse cx="58" cy="95" rx="6.5" ry="3.5" fill="${FUR_LIGHT}"/>
  <ellipse cx="50" cy="38" rx="23" ry="21" fill="${FUR}"/>
  <path d="M30 26 C17 26 13 46 20 58 C27 59 32 47 33 34 Z" fill="${FUR}" stroke="#15171b" stroke-width="1.5"/>
  <path d="M70 26 C83 26 87 46 80 58 C73 59 68 47 67 34 Z" fill="${FUR}" stroke="#15171b" stroke-width="1.5"/>
  <ellipse cx="50" cy="49" rx="13.5" ry="10.5" fill="${MUZZLE}"/>
  <ellipse cx="50" cy="44" rx="9" ry="4" fill="#a7acb2" opacity=".6"/>
  <ellipse cx="50" cy="44" rx="5.6" ry="4" fill="#0d0e10"/>
  <ellipse cx="48.4" cy="42.8" rx="1.6" ry="1" fill="#fff" opacity=".55"/>
  <path d="M50 48 V52 M44 52 Q50 57 56 52" fill="none" stroke="#0d0e10" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M47 54.5 Q50 61 53 54.5 Z" fill="#e8687a"/>
  <circle cx="40.5" cy="35" r="4.2" fill="#4a2b16"/><circle cx="59.5" cy="35" r="4.2" fill="#4a2b16"/>
  <circle cx="40.5" cy="35" r="2.6" fill="#0d0e10"/><circle cx="59.5" cy="35" r="2.6" fill="#0d0e10"/>
  <circle cx="41.6" cy="33.8" r="1.2" fill="#fff"/><circle cx="60.6" cy="33.8" r="1.2" fill="#fff"/>
  <path d="M36 29 Q40 27 44 29 M56 29 Q60 27 64 29" fill="none" stroke="${MUZZLE}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
}

const cap = `<g transform="translate(0 -3)">
  <path d="M27 27 C27 7 73 7 73 27 Z" fill="#ff7a1a" stroke="#b54d00" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 10 V27" stroke="#b54d00" stroke-width="2" opacity=".55"/>
  <circle cx="50" cy="9.5" r="3" fill="#ff9a4d" stroke="#b54d00" stroke-width="1.5"/>
  <path d="M26 26 Q50 22 74 26 Q76 34 50 34 Q24 34 26 26 Z" fill="#ff8f3d" stroke="#b54d00" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M35 17 Q41 12 47 13" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/></g>`;

const beeSuit = `
  <rect x="0" y="0" width="100" height="100" fill="#ffc12e"/>
  <path d="M0 68 H100 V76 H0 Z M0 84 H100 V92 H0 Z" fill="#1a1a1a"/>`;
const beeWings = `
  <ellipse cx="22" cy="62" rx="16" ry="10" transform="rotate(-30 22 62)" fill="#d9f1ff" stroke="#7fb6d6" stroke-width="2" opacity=".9"/>
  <ellipse cx="78" cy="62" rx="16" ry="10" transform="rotate(30 78 62)" fill="#d9f1ff" stroke="#7fb6d6" stroke-width="2" opacity=".9"/>`;
const beeHead = `
  <path d="M30 24 Q50 14 70 24" fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>
  <path d="M40 18 Q36 8 30 4 M60 18 Q64 8 70 4" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="30" cy="4.5" r="4.5" fill="#ffc12e" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="70" cy="4.5" r="4.5" fill="#ffc12e" stroke="#1a1a1a" stroke-width="2"/>`;

const partyHat = `
  <g transform="rotate(14 56 22)">
    <path d="M44 24 L58 -4 L72 24 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="54" cy="14" r="2.4" fill="#ffc12e"/><circle cx="62" cy="9" r="2.2" fill="#e8352f"/><circle cx="64" cy="19" r="2.4" fill="#fff"/><circle cx="52" cy="21" r="2" fill="#e8352f"/>
    <circle cx="58" cy="-4" r="4.5" fill="#ffc12e"/>
    <path d="M42 24 Q58 28 74 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </g>`;

const pirate = `
  <path d="M18 24 C26 14 38 20 50 10 C62 20 74 14 82 24 C70 30 30 30 18 24 Z" fill="#1d1d24" stroke="#000" stroke-width="2" stroke-linejoin="round"/>
  <path d="M22 25 C34 29 66 29 78 25" fill="none" stroke="#ffc12e" stroke-width="2"/>
  <circle cx="50" cy="19" r="3.6" fill="#fff"/><path d="M46 24 L54 22 M46 22 L54 24" stroke="#fff" stroke-width="1.5"/>
  <path d="M28 30 L72 40" stroke="#000" stroke-width="2"/>
  <ellipse cx="59.5" cy="36" rx="6.5" ry="6" fill="#000"/>`;

const crown = `
  <path d="M33 26 L32 8 L41 16 L50 4 L59 16 L68 8 L67 26 Z" fill="#ffc12e" stroke="#b58a00" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="33" y="22" width="34" height="6" rx="2" fill="#f0a800" stroke="#b58a00" stroke-width="2"/>
  <circle cx="50" cy="16" r="3" fill="#e8352f"/><circle cx="40" cy="20" r="2.2" fill="#2f8fe0"/><circle cx="60" cy="20" r="2.2" fill="#2f8fe0"/>`;

const capeBack = `<path d="M32 58 C24 72 22 86 20 98 H80 C78 86 76 72 68 58 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2.5" stroke-linejoin="round"/>`;
const capeFront = `
  <path d="M34 59 Q50 66 66 59" fill="none" stroke="#e8352f" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="64" r="5" fill="#ffc12e" stroke="#b58a00" stroke-width="2"/>
  <path d="M30 40 Q40 32 50 37 Q60 32 70 40 Q60 44 50 40 Q40 44 30 40 Z" fill="#e8352f" stroke="#a3201c" stroke-width="1.5"/>
  <circle cx="40.5" cy="38" r="2.4" fill="#fff"/><circle cx="59.5" cy="38" r="2.4" fill="#fff"/>`;

const bandana = `
  <path d="M30 58 Q50 66 70 58 L50 80 Z" fill="#2f8fe0" stroke="#17599a" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="44" cy="64" r="1.8" fill="#fff"/><circle cx="55" cy="63" r="1.8" fill="#fff"/><circle cx="50" cy="71" r="1.8" fill="#fff"/>`;

const sunnies = `
  <path d="M28 33 H72" stroke="#111" stroke-width="2.5"/>
  <rect x="31" y="29" width="17" height="11" rx="5" fill="#111"/><rect x="52" y="29" width="17" height="11" rx="5" fill="#111"/>
  <path d="M34 32 L39 31" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M55 32 L60 31" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;

const pumpkinSuit = `
  <rect x="0" y="0" width="100" height="100" fill="#ff8a1f"/>
  <path d="M38 58 Q34 78 38 98 M50 58 V98 M62 58 Q66 78 62 98" fill="none" stroke="#c45f00" stroke-width="2"/>
  <path d="M40 64 L44 61 L46 66 Z M60 64 L56 61 L54 66 Z M42 70 L46 73 L50 70 L54 73 L58 70 L54 76 L50 74 L46 76 Z" fill="#1a1a1a"/>`;
const pumpkinHat = `<path d="M47 18 Q46 10 52 6" stroke="#3f8a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M52 10 Q60 6 64 12 Q58 14 52 10 Z" fill="#5fae57"/>`;

// Earned by winning Weekly Walks: a yellow raincoat with a hood, for walks in any weather.
const raincoatSuit = `
  <rect x="0" y="0" width="100" height="100" fill="#ffc12e"/>
  <path d="M50 58 V98" stroke="#d99a1a" stroke-width="2"/>
  <circle cx="46" cy="70" r="1.8" fill="#d99a1a"/><circle cx="46" cy="80" r="1.8" fill="#d99a1a"/><circle cx="46" cy="90" r="1.8" fill="#d99a1a"/>
  <path d="M28 96 H72" stroke="#d99a1a" stroke-width="3"/>`;
const raincoatHood = `
  <path d="M24 40 C22 14 78 14 76 40 L72 30 C66 18 34 18 28 30 Z" fill="#ffc12e" stroke="#b58a00" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M30 22 Q36 16 44 15" stroke="#fff3c8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

// Earned by clearing the very last level: a gold medal on a red ribbon, and a sash.
const championSash = `
  <path d="M30 56 L74 100 L62 100 L26 64 Z" fill="#e8352f"/>
  <path d="M30 56 L74 100" stroke="#ffd23f" stroke-width="2"/>`;
const championMedal = `
  <path d="M40 56 L48 70 M60 56 L52 70" stroke="#e8352f" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="75" r="9" fill="#ffd23f" stroke="#b58a00" stroke-width="2.5"/>
  <path d="M50 69.5 L51.8 73.2 L55.8 73.6 L52.8 76.3 L53.6 80.2 L50 78.2 L46.4 80.2 L47.2 76.3 L44.2 73.6 L48.2 73.2 Z" fill="#fff4c2"/>`;

export const COSTUMES: Costume[] = [
  { id: 'lobster', name: 'Lobster Suit', desc: 'The classic. Claws and all.', unlock: { free: true } },
  { id: 'cap', name: 'Orange Cap', desc: 'Her everyday look.', unlock: { free: true }, front: cap },
  { id: 'none', name: 'Just Micah', desc: 'Nothing but fur and a grey muzzle.', unlock: { free: true } },
  { id: 'bee', name: 'Bumblebee', desc: 'Buzzes from match to match.', unlock: { level: 5 }, back: beeWings, suit: beeSuit, front: beeHead },
  { id: 'bandana', name: 'Blue Bandana', desc: 'Ready for a hike.', unlock: { biscuits: 80 }, front: bandana },
  { id: 'party', name: 'Party Hat', desc: 'Every day is Micah’s birthday.', unlock: { level: 10 }, front: partyHat },
  { id: 'sunnies', name: 'Cool Shades', desc: 'Too cool for the sprinkler.', unlock: { biscuits: 120 }, front: sunnies },
  { id: 'hero', name: 'Super Micah', desc: 'Cape, mask, and a good girl’s sense of justice.', unlock: { level: 15 }, back: capeBack, front: capeFront },
  { id: 'pumpkin', name: 'Pumpkin', desc: 'Round, orange and very huggable.', unlock: { biscuits: 160 }, suit: pumpkinSuit, front: pumpkinHat },
  { id: 'pirate', name: 'Pirate Captain', desc: 'Arr. Mostly hunts for biscuits.', unlock: { level: 25 }, front: pirate },
  { id: 'crown', name: 'Royal Crown', desc: 'Queen of the yard.', unlock: { level: 40 }, front: crown },
  { id: 'raincoat', name: 'Rain Slicker', desc: 'For the walker who goes out every week, rain or shine.', unlock: { weekly: 4 }, suit: raincoatSuit, front: raincoatHood },
  { id: 'champion', name: 'Champion', desc: 'For finishing every last level. The goodest girl.', unlock: { level: 60 }, suit: championSash, front: championMedal },
];

export const DEFAULT_COSTUME = 'lobster';

export function costumeById(id: string): Costume {
  return COSTUMES.find((c) => c.id === id) ?? COSTUMES[0];
}

/** The outfit as a standalone SVG document (no shared ids with the page). */
export function costumeSvg(c: Costume): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -6 106 106">${c.back ?? ''}${dog(c.suit)}${c.front ?? ''}</svg>`;
}

const urls = new Map<string, string>();
/** An image URL for Micah in this outfit, usable in <img src> and SVG <image href>. */
export function costumeUrl(id: string): string {
  const c = costumeById(id);
  if (c.id === 'lobster') return micahPhoto;
  let u = urls.get(c.id);
  if (!u) {
    u = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(costumeSvg(c))}`;
    urls.set(c.id, u);
  }
  return u;
}

/** Whether the player can wear it now. `cleared` is the highest level cleared. */
export function isUnlocked(c: Costume, cleared: number, bought: string[]): boolean {
  if ('free' in c.unlock) return true;
  if ('level' in c.unlock) return cleared >= c.unlock.level;
  return bought.includes(c.id);
}

export function unlockText(c: Costume): string {
  if ('free' in c.unlock) return 'Free';
  if ('level' in c.unlock) return `Clear level ${c.unlock.level}`;
  if ('weekly' in c.unlock) return `Win ${c.unlock.weekly} Weekly Walks`;
  return `${c.unlock.biscuits} biscuits`;
}
