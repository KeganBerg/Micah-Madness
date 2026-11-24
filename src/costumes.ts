// Micah's wardrobe. The lobster suit is the player's own photo; every other outfit
// is drawn over a hand-drawn Micah (a black dog with a grey muzzle) in a 100x100 box.
import micahPhoto from './assets/micah.png';

export type Unlock = { free: true } | { level: number } | { biscuits: number } | { weekly: number } | { winter: number } | { gift: string };

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

// Earned by clearing level 100: star-and-moon pyjamas and a floppy nightcap, for the comfiest nap of all.
const pjSuit = `
  <rect x="0" y="0" width="100" height="100" fill="#4f5fb3"/>
  <path d="M50 58 V98" stroke="#3a478f" stroke-width="2"/>
  <circle cx="46" cy="68" r="1.8" fill="#fff"/><circle cx="46" cy="78" r="1.8" fill="#fff"/><circle cx="46" cy="88" r="1.8" fill="#fff"/>
  <path d="M34 72 a5 5 0 1 0 5 -6 a4 4 0 1 1 -5 6 Z" fill="#ffe14d"/>
  <path d="M62 84 l1.6 3.2 l3.4 .4 l-2.6 2.2 l.8 3.4 l-3.2 -1.8 l-3.2 1.8 l.8 -3.4 l-2.6 -2.2 l3.4 -.4 Z" fill="#ffe14d"/>
  <circle cx="64" cy="66" r="1.6" fill="#fff"/><circle cx="30" cy="88" r="1.4" fill="#fff"/>`;
const nightcap = `
  <path d="M26 26 C28 8 48 0 64 6 C74 10 82 22 84 40 L72 24 Z" fill="#4f5fb3" stroke="#2f3a7a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M44 6 l1.2 2.4 l2.6 .3 l-2 1.7 l.6 2.6 l-2.4 -1.4 l-2.4 1.4 l.6 -2.6 l-2 -1.7 l2.6 -.3 Z M66 12 l1 2 l2.2 .3 l-1.6 1.4 l.5 2.2 l-2.1 -1.2 l-2.1 1.2 l.5 -2.2 l-1.6 -1.4 l2.2 -.3 Z" fill="#ffe14d"/>
  <circle cx="84" cy="41" r="6" fill="#fff" stroke="#d4e6f1" stroke-width="1.5"/>
  <path d="M24 28 Q50 16 76 26 Q78 33 76 34 Q50 24 26 36 Q22 33 24 28 Z" fill="#fff" stroke="#d4e6f1" stroke-width="1.5"/>`;

// Micah's Winter prizes: reindeer antlers (with a glowing nose) and a Santa hat.
const antlers = `
  <path d="M38 22 C34 12 30 8 24 2 M33 14 L24 14 M30 9 L33 1" fill="none" stroke="#8a5a26" stroke-width="4" stroke-linecap="round"/>
  <path d="M62 22 C66 12 70 8 76 2 M67 14 L76 14 M70 9 L67 1" fill="none" stroke="#8a5a26" stroke-width="4" stroke-linecap="round"/>
  <path d="M34 22 Q50 14 66 22" fill="none" stroke="#e8352f" stroke-width="3" stroke-linecap="round"/>
  <circle cx="50" cy="44" r="5.8" fill="#e8352f"/><circle cx="48.2" cy="42.4" r="1.6" fill="#fff" opacity=".7"/>`;
const santaHat = `
  <path d="M28 24 C30 6 50 -2 66 4 C76 8 82 16 86 30 L74 22 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="86" cy="31" r="6" fill="#fff" stroke="#d4e6f1" stroke-width="1.5"/>
  <path d="M24 26 Q50 14 76 24 Q78 31 76 32 Q50 22 26 34 Q22 31 24 26 Z" fill="#fff" stroke="#d4e6f1" stroke-width="1.5"/>`;
const winterScarf = `
  <path d="M30 58 Q50 68 70 58 L70 64 Q50 74 30 64 Z" fill="#e8352f"/>
  <path d="M58 64 L62 84 L54 84 L52 66 Z" fill="#e8352f"/>
  <path d="M34 61 H40 M46 64 H52 M58 62 H64 M55 74 H61" stroke="#fff" stroke-width="2.2"/>`;

// The December gift every player gets when Micah's Winter opens: a knitted bobble hat and scarf.
const bobbleHat = `
  <path d="M27 28 C26 9 74 9 73 28 Z" fill="#e8352f" stroke="#a3201c" stroke-width="2" stroke-linejoin="round"/>
  <path d="M31 19 Q50 13 69 19 M29 24 Q50 18 71 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-dasharray="3 2.4"/>
  <path d="M25 27 Q50 20 75 27 L75 33 Q50 26 25 33 Z" fill="#fff" stroke="#d4e6f1" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M30 29 V32 M36 27.6 V30.6 M42 26.6 V29.6 M48 26.2 V29.2 M54 26.4 V29.4 M60 27 V30 M66 28 V31 M71 29 V32" stroke="#d4e6f1" stroke-width="1.2"/>
  <circle cx="50" cy="9" r="6.5" fill="#fff" stroke="#d4e6f1" stroke-width="1.5"/>
  <path d="M46 7 Q50 4 54 7" fill="none" stroke="#d4e6f1" stroke-width="1.2"/>`;
const knitScarf = `
  <path d="M29 57 Q50 69 71 57 L71 65 Q50 77 29 65 Z" fill="#e8352f"/>
  <path d="M33 60 V67 M41 63 V70 M50 64.5 V71.5 M59 63 V70 M67 60 V67" stroke="#fff" stroke-width="3"/>
  <path d="M56 66 L63 88 L54 89 L50 68 Z" fill="#e8352f"/>
  <path d="M57.4 72 L52.2 73 M59.4 78 L53.4 79 M61.4 84 L54.4 85" stroke="#fff" stroke-width="2.6"/>
  <path d="M54 89 L54 92 M57 88.7 L57.5 91.7 M60 88.3 L61 91.2 M63 88 L64.2 90.8" stroke="#e8352f" stroke-width="1.6" stroke-linecap="round"/>`;

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
  { id: 'antlers', name: 'Reindeer Antlers', desc: 'With a nose so bright she can find her treats in the dark.', unlock: { winter: 8 }, front: antlers },
  { id: 'santa', name: 'Santa Hat', desc: 'For finishing all of Micah\u2019s Winter. Ho ho woof.', unlock: { winter: 15 }, suit: winterScarf, front: santaHat },
  { id: 'scarf', name: 'Holiday Knits', desc: 'A bobble hat and scarf, knitted in lobster red. A December gift for Micah.', unlock: { gift: 'winter' }, suit: knitScarf, front: bobbleHat },
  { id: 'champion', name: 'Champion', desc: 'For walking all the way home, from the backyard to the front porch. The goodest girl.', unlock: { level: 80 }, suit: championSash, front: championMedal },
  { id: 'pjs', name: 'Cozy Pyjamas', desc: 'For clearing level 100. Moons, stars and the comfiest nap of all.', unlock: { level: 100 }, suit: pjSuit, front: nightcap },
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
  if ('level' in c.unlock) return cleared >= c.unlock.level || bought.includes(c.id);
  return bought.includes(c.id);
}

export function unlockText(c: Costume): string {
  if ('free' in c.unlock) return 'Free';
  if ('level' in c.unlock) return `Clear level ${c.unlock.level}`;
  if ('weekly' in c.unlock) return `Win ${c.unlock.weekly} Weekly Walks`;
  if ('gift' in c.unlock) return 'A December gift';
  if ('winter' in c.unlock) return c.unlock.winter >= 15 ? 'Finish Micah\u2019s Winter (December)' : `Win ${c.unlock.winter} levels of Micah\u2019s Winter`;
  return `${c.unlock.biscuits} biscuits`;
}
