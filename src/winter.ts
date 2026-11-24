// Micah's Winter: a December event of snowy levels. Snow drifts (mud) need shovelling,
// scarves (yarn) need untangling. Each first win pays biscuits; 8 wins earn the
// Reindeer Antlers and all 15 earn the Santa Hat. Progress resets each winter; outfits stay.
import type { Goal, Level } from './levels';
import type { SaveData } from './save';

export const WINTER_BASE = 1000; // winter level n has id WINTER_BASE + n
export const WINTER_UNLOCK = 10; // clear this many levels first
export const WINTER_BISCUITS = 25;
export const ANTLERS_AT = 8;

const BONE = 0, BALL = 1, PAW = 2, BOWL = 3, LOBSTER = 4, CAP = 5;
const M: Goal = { type: 'mud' };
const Y: Goal = { type: 'yarn' };
const C = (kind: number, count: number): Goal => ({ type: 'collect', kind, count });
const P = (power: 'zoomies' | 'bark' | 'micah', count: number): Goal => ({ type: 'power', power, count });
const S = (target: number): Goal => ({ type: 'score', target });

const DRIFT = ['........', '........', '..mmmm..', '..mmmm..', '..mmmm..', '..mmmm..', '........', '........'];
const HILLS = ['........', '........', '........', '........', 'm......m', 'mm....mm', 'mmm..mmm', 'mmmmmmmm'];
const SNOWMAN = ['...mm...', '..mmmm..', '...mm...', '..mmmm..', '.mmmmmm.', '.mmmmmm.', '..mmmm..', '........'];
const DEEP_DRIFT = ['........', '........', '..mmmm..', '..mMMm..', '..mMMm..', '..mmmm..', '........', '........'];
const TREE = ['...mm...', '..mmmm..', '.mmMMmm.', '..mmmm..', '.mMMMMm.', 'mmmmmmmm', '...mm...', '...mm...'];
const ROOF = ['mmmmmmmm', 'MMMMMMMM', 'mmmmmmmm', '........', '........', '........', '........', '........'];
const BLIZZARD = ['mmmmmmmm', 'mmmmmmmm', 'mmMMMMmm', 'mmMMMMmm', 'mmMMMMmm', 'mmMMMMmm', 'mmmmmmmm', 'mmmmmmmm'];
const SCARF = ['........', '........', 'yyyyyyyy', '........', '........', 'yyyyyyyy', '........', '........'];
const MITTENS = ['........', '.yy..yy.', '.yy..yy.', '........', '........', '.yy..yy.', '.yy..yy.', '........'];
const GARLAND = ['y......y', '.y....y.', '..yyyy..', '........', '........', '..yyyy..', '.y....y.', 'y......y'];
const STAR = ['...yy...', '..yyyy..', 'yyyyyyyy', '.yyyyyy.', '..y..y..', '........', '........', '........'];

const W = (n: number, moves: number, kinds: number, goals: Goal[], stars: [number, number, number], mud?: string[], yarn?: string[]): Level =>
  ({ id: WINTER_BASE + n, zone: 5, moves, kinds, goals, stars, mud, yarn, snow: true });

export const WINTER_LEVELS: Level[] = [
  W(1, 22, 5, [M], [2500, 4500, 6500], DRIFT),
  W(2, 18, 5, [C(BALL, 22)], [2500, 4500, 6500]),
  W(3, 34, 6, [M], [3000, 5500, 7500], HILLS),
  W(4, 30, 6, [Y, C(BONE, 20)], [3500, 6000, 8000], undefined, MITTENS),
  W(5, 26, 6, [S(6000)], [6000, 7000, 8000]),
  W(6, 20, 6, [M], [3500, 6000, 8000], DEEP_DRIFT),
  W(7, 17, 6, [P('zoomies', 4)], [3500, 6000, 8000]),
  W(8, 36, 6, [M, Y], [5000, 8500, 10500], SNOWMAN, SCARF),
  W(9, 30, 6, [M], [4500, 7500, 9500], TREE),
  W(10, 24, 6, [C(CAP, 24), C(LOBSTER, 24)], [4000, 6500, 8000]),
  W(11, 36, 6, [M, P('bark', 2)], [5500, 9000, 11000], ROOF),
  W(12, 40, 6, [Y, C(PAW, 22)], [5000, 8500, 10500], undefined, GARLAND),
  W(13, 45, 6, [M, C(BOWL, 20)], [6000, 10000, 12500], BLIZZARD),
  W(14, 34, 6, [S(8000), P('micah', 1)], [8000, 9500, 11000]),
  W(15, 40, 6, [M, Y, P('micah', 1)], [6500, 10500, 13000], TREE, STAR),
];
export const WINTER_COUNT = WINTER_LEVELS.length;

export const isWinterLevel = (lv: Level) => lv.id > WINTER_BASE && lv.id <= WINTER_BASE + WINTER_COUNT;
export const winterNumber = (lv: Level) => lv.id - WINTER_BASE;

/** The winter this date belongs to (the year its December falls in), or null outside 1 December to 6 January. */
export function winterSeason(now = new Date()): number | null {
  const m = now.getMonth();
  if (m === 11) return now.getFullYear();
  if (m === 0 && now.getDate() <= 6) return now.getFullYear() - 1;
  return null;
}

const cleared = (s: SaveData) => Object.values(s.stars).filter((v) => v > 0).length;
/** Open in season (or when previewing with ?winter in the address) once enough levels are cleared. */
export function winterOpen(s: SaveData, now = new Date(), preview = false): boolean {
  return (preview || winterSeason(now) !== null) && cleared(s) >= WINTER_UNLOCK;
}

/** Levels won this winter (1-based numbers). */
export function winterWon(s: SaveData, now = new Date()): number[] {
  const season = winterSeason(now) ?? s.winter.season;
  return s.winter.season === season ? s.winter.won : [];
}

/** The next winter level to play: the lowest not yet won, or 0 once all are done. */
export function winterNext(s: SaveData, now = new Date()): number {
  const won = winterWon(s, now);
  for (let n = 1; n <= WINTER_COUNT; n++) if (!won.includes(n)) return n;
  return 0;
}

/** Records a win. Returns what it paid, or null if this level was already won this winter. */
export function claimWinter(s: SaveData, n: number, now = new Date()): { biscuits: number; won: number; antlers: boolean; hat: boolean } | null {
  const season = winterSeason(now) ?? s.winter.season ?? now.getFullYear();
  if (s.winter.season !== season) s.winter = { season, won: [] };
  if (s.winter.won.includes(n)) return null;
  s.winter.won = [...s.winter.won, n].sort((a, b) => a - b);
  s.biscuits += WINTER_BISCUITS;
  const won = s.winter.won.length;
  const antlers = won >= ANTLERS_AT && !s.wardrobe.includes('antlers');
  if (antlers) s.wardrobe.push('antlers');
  const hat = won >= WINTER_COUNT && !s.wardrobe.includes('santa');
  if (hat) s.wardrobe.push('santa');
  return { biscuits: WINTER_BISCUITS, won, antlers, hat };
}

/** The outfit every player is given when Micah's Winter opens. */
export const WINTER_GIFT = 'scarf';

/** Snow falls on the map from 1 December to 6 January (or when previewing). */
export const winterSnowing = (now = new Date(), preview = false) => preview || winterSeason(now) !== null;

/**
 * The once-a-winter hello: the seen key to record if it hasn't been shown this season, otherwise null.
 * Waits until the player has cleared a level, so it never sits on top of the welcome card.
 */
export function winterHello(s: SaveData, now = new Date(), preview = false): string | null {
  const season = winterSeason(now) ?? (preview ? now.getFullYear() : null);
  if (season === null || cleared(s) === 0) return null;
  const key = `winter-hello:${season}`;
  return s.seen.includes(key) ? null : key;
}

/** Hands over the winter gift outfit. Returns false if Micah already has it. */
export function giveWinterGift(s: SaveData): boolean {
  if (s.wardrobe.includes(WINTER_GIFT)) return false;
  s.wardrobe.push(WINTER_GIFT);
  return true;
}
