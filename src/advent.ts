// Micah's advent calendar: from 1 to 24 December a present waits in the Backyard each day.
// Tap it and Micah tears it open. Opened days are kept as seen keys ('advent:YYYY-MM-DD').
import { localDay, type BoosterId, type SaveData } from './save';

export const ADVENT_GIFT = 'elf';

export type AdventPrize =
  | { kind: 'biscuits'; n: number; text?: string }
  | { kind: 'booster'; id: BoosterId; name: string }
  | { kind: 'outfit'; id: string; name: string; n: number };

const B = (n: number, text?: string): AdventPrize => ({ kind: 'biscuits', n, text });
const T = (id: BoosterId, name: string): AdventPrize => ({ kind: 'booster', id, name });

/** One present per day, 1 to 24 December. */
export const ADVENT: AdventPrize[] = [
  B(20),
  T('treat', 'a Treat'),
  B(15, 'A squeaky candy cane'),
  B(25),
  T('squirrel', 'a Squirrel!'),
  B(15, 'She ate the wrapping paper'),
  B(30),
  T('leash', 'a Long Leash'),
  B(15, 'A tennis ball with a bow'),
  B(25),
  T('bed', 'an Orthopedic Bed'),
  B(20, 'A chew toy shaped like Yoshi'),
  B(30),
  T('treat', 'a Treat'),
  B(20, 'A tin of cookies. Was.'),
  B(35),
  T('squirrel', 'a Squirrel!'),
  B(20, 'A tiny stocking, pre-chewed'),
  B(35),
  T('leash', 'a Long Leash'),
  B(20, 'Ribbon. She ate it.'),
  B(40),
  T('bed', 'an Orthopedic Bed'),
  { kind: 'outfit', id: ADVENT_GIFT, name: 'an Elf Hat', n: 100 },
];

/**
 * Today's calendar day (1 to 24), or null outside 1 to 24 December.
 * `preview` (from ?winter or ?advent=N) opens it early: a number picks the day, true uses today's date.
 */
export function adventDay(now = new Date(), preview: number | boolean = false): number | null {
  if (typeof preview === 'number' && preview >= 1 && preview <= 24) return Math.floor(preview);
  if (now.getMonth() === 11 && now.getDate() <= 24) return now.getDate();
  if (preview) return Math.min(24, now.getDate());
  return null;
}

const key = (now: Date) => `advent:${localDay(now)}`;

/** The day of the present waiting today, or null if there is none or it is already open. */
export function adventReady(s: SaveData, now = new Date(), preview: number | boolean = false): number | null {
  const day = adventDay(now, preview);
  if (day === null || s.seen.includes(key(now))) return null;
  return day;
}

/** Opens today's present and pays it out. Returns null if there is nothing to open. */
export function openAdvent(s: SaveData, now = new Date(), preview: number | boolean = false): { day: number; prize: AdventPrize } | null {
  const day = adventReady(s, now, preview);
  if (day === null) return null;
  const prize = ADVENT[day - 1];
  if (prize.kind === 'booster') s.inventory[prize.id] = (s.inventory[prize.id] ?? 0) + 1;
  else s.biscuits += prize.n;
  if (prize.kind === 'outfit' && !s.wardrobe.includes(prize.id)) s.wardrobe.push(prize.id);
  s.seen.push(key(now));
  return { day, prize };
}

export function adventText(p: AdventPrize): string {
  if (p.kind === 'booster') return `It’s ${p.name}!`;
  if (p.kind === 'outfit') return `An Elf Hat! +${p.n}`;
  return p.text ? `${p.text}! +${p.n}` : `${p.n} biscuits!`;
}

/** The present, base centred on (0,0), with the day on its tag. */
export function presentSVG(day: number): string {
  return `<ellipse cx="0" cy="0" rx="17" ry="4.5" fill="#000" opacity=".16"/>
    <g class="present-art">
      <rect x="-14" y="-24" width="28" height="24" rx="2" fill="#e8352f" stroke="#a3201c" stroke-width="2"/>
      <rect x="-16" y="-30" width="32" height="8" rx="2" fill="#ef4b45" stroke="#a3201c" stroke-width="2"/>
      <rect x="-3" y="-30" width="6" height="30" fill="#ffd23f"/>
      <path d="M0 -30 C-10 -42 -18 -32 -8 -30 Z M0 -30 C10 -42 18 -32 8 -30 Z" fill="#ffd23f" stroke="#b58a00" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="0" cy="-30" r="2.6" fill="#ffd23f" stroke="#b58a00" stroke-width="1.2"/>
      <g transform="translate(11 -12) rotate(10)"><rect x="-7" y="-6" width="14" height="12" rx="2" fill="#fff" stroke="#b58a00" stroke-width="1"/>
        <text x="0" y="3.6" text-anchor="middle" font-size="9" font-weight="900" fill="#173a52" font-family="Nunito, sans-serif">${day}</text></g>
    </g>
    <circle cx="0" cy="-16" r="24" fill="transparent"/>`;
}
