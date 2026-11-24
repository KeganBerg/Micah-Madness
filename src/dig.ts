// Micah's dig spot: every day she buries something in the Backyard. Come back on a later day,
// tap the mound, and she digs it back up. One prize a day at most, picked from the day it is dug.
import { localDay, type BoosterId, type SaveData } from './save';

export type DigPrize =
  | { kind: 'biscuits'; n: number }
  | { kind: 'booster'; id: BoosterId; name: string }
  | { kind: 'find'; text: string; n: number };

/** Odd things Micah buried. Each also comes with a few biscuits she buried next to it. */
export const FINDS = [
  'a sock she buried in the spring. Still damp.',
  'the TV remote. Again.',
  'a tennis ball, very much used.',
  'one of Yoshi’s hay cubes. Yoshi would like it back.',
  'a pinecone she was saving for later.',
  'an acorn a squirrel from Noah’s Ark hid. Finders keepers.',
  'a rubber duck that has seen things.',
  'half a corn cob. The other half is a mystery.',
  'a garden glove. Its partner is still missing.',
  'a biscuit she hid from herself.',
];

const BOOSTERS: { id: BoosterId; name: string }[] = [
  { id: 'treat', name: 'a Treat' },
  { id: 'squirrel', name: 'a Squirrel!' },
  { id: 'leash', name: 'a Long Leash' },
  { id: 'bed', name: 'an Orthopedic Bed' },
];

/** Small stable hash of a string, so the same day always gives the same prize and spot. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function prizeFor(day: string): DigPrize {
  const h = hash(`dig:${day}`);
  const r = h % 100;
  if (r < 55) return { kind: 'biscuits', n: 15 + (Math.floor(h / 100) % 6) * 5 }; // 15 to 40
  if (r < 80) {
    const b = BOOSTERS[Math.floor(h / 100) % BOOSTERS.length];
    return { kind: 'booster', id: b.id, name: b.name };
  }
  return { kind: 'find', text: FINDS[Math.floor(h / 100) % FINDS.length], n: 10 };
}

/** Open grass in the Backyard where a mound fits between the things you can build. */
export const DIG_SPOTS: [number, number][] = [
  [62, 182],
  [318, 220],
  [108, 290],
  [338, 126],
  [98, 170],
];

export const digSpot = (day: string): [number, number] => DIG_SPOTS[hash(`spot:${day}`) % DIG_SPOTS.length];

/** 'none' before Micah has buried anything, 'fresh' on the day she buried it, 'ready' on any later day. */
export function digState(s: SaveData, now = new Date()): 'none' | 'fresh' | 'ready' {
  if (!s.dig) return 'none';
  return s.dig < localDay(now) ? 'ready' : 'fresh';
}

/** The first time anyone visits the yard, Micah buries something for tomorrow. Returns true if she just did. */
export function ensureBuried(s: SaveData, now = new Date()): boolean {
  if (s.dig) return false;
  s.dig = localDay(now);
  return true;
}

/** Digs up a ready mound: pays out today's prize and buries a new one for tomorrow. */
export function claimDig(s: SaveData, now = new Date()): DigPrize | null {
  if (digState(s, now) !== 'ready') return null;
  const today = localDay(now);
  const prize = prizeFor(today);
  if (prize.kind === 'biscuits' || prize.kind === 'find') s.biscuits += prize.n;
  else s.inventory[prize.id] = (s.inventory[prize.id] ?? 0) + 1;
  s.dig = today;
  s.tally.digs = (s.tally.digs ?? 0) + 1;
  return prize;
}

export function prizeText(p: DigPrize): string {
  if (p.kind === 'biscuits') return `Micah dug up ${p.n} biscuits!`;
  if (p.kind === 'booster') return `Micah dug up ${p.name}!`;
  return `Micah dug up ${p.text} +${p.n} biscuits`;
}

/** The mound, drawn with its base centred on (0,0). Ready mounds sparkle; fresh ones are smooth. */
export function moundSVG(ready: boolean): string {
  return `<ellipse cx="0" cy="0" rx="22" ry="6" fill="#000" opacity=".14"/>
    <path d="M-20 0 Q-16 -14 0 -15 Q16 -14 20 0 Z" fill="#8a6239" stroke="#5e3e25" stroke-width="2"/>
    <g fill="#6b4a2b"><circle cx="-8" cy="-7" r="2"/><circle cx="6" cy="-9" r="1.6"/><circle cx="11" cy="-4" r="1.8"/></g>
    <g fill="#8a6239"><circle cx="-24" cy="-1" r="3"/><circle cx="25" cy="0" r="2.4"/></g>
    ${ready
      ? `<g class="dig-sparkle" fill="#ffd23f" stroke="#b58a00" stroke-width=".8">
          <path d="M-12 -24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/><path d="M12 -30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5 Z"/></g>
         <g transform="translate(0 -14) rotate(-20)"><rect x="-1.5" y="-12" width="3" height="10" fill="#7a4f25"/><path d="M-3 -2 h6 v5 q-3 4 -6 0 Z" fill="#9aa5ad" stroke="#5d6f7c" stroke-width="1"/></g>`
      : ''}
    <circle cx="0" cy="-8" r="26" fill="transparent"/>`;
}
