// The Weekly Walk: one special remix of a level you've already cleared, new every Monday.
// The first win each week pays biscuits and a paw stamp; four stamps earn the Rain Slicker.
import { LEVELS, type Goal, type Level } from './levels';
import type { SaveData } from './save';

export const WEEKLY_ID = 999;
export const WEEKLY_UNLOCK = 10; // clear this many levels first
export const WEEKLY_BISCUITS = 60;
export const STAMPS_FOR_COAT = 4;

/** The Monday that starts this week, as YYYY-MM-DD in local time. */
export function weekKey(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const cleared = (s: SaveData) => Object.keys(s.stars).filter((k) => (s.stars[Number(k)] ?? 0) > 0).length;
export const weeklyOpen = (s: SaveData): boolean => cleared(s) >= WEEKLY_UNLOCK;
export const weeklyWonThisWeek = (s: SaveData, now = new Date()): boolean => s.weekly.won === weekKey(now);

/** This week's level: a mirrored remix of a level the player has already beaten, with new pieces to collect. */
export function weeklyLevel(s: SaveData, now = new Date()): Level & { baseId: number } {
  const h = hash(weekKey(now));
  const pool = LEVELS.filter((l) => l.id >= 6 && (s.stars[l.id] ?? 0) > 0);
  const base = pool.length ? pool[h % pool.length] : LEVELS[5];
  const shift = 1 + (h % (base.kinds - 1));
  const goals: Goal[] = base.goals.map((g) => (g.type === 'collect' ? { ...g, kind: (g.kind + shift) % base.kinds } : g));
  const mirror = (rows?: string[]) => rows?.map((r) => [...r].reverse().join(''));
  return { ...base, id: WEEKLY_ID, baseId: base.id, goals, mud: mirror(base.mud), yarn: mirror(base.yarn), leaves: mirror(base.leaves), bubbles: mirror(base.bubbles) };
}

/** Records a win. Returns what it paid, or null if this week's prize was already claimed. */
export function claimWeekly(s: SaveData, now = new Date()): { biscuits: number; stamps: number; coat: boolean } | null {
  if (weeklyWonThisWeek(s, now)) return null;
  s.weekly = { won: weekKey(now), stamps: s.weekly.stamps + 1 };
  s.biscuits += WEEKLY_BISCUITS;
  const coat = s.weekly.stamps >= STAMPS_FOR_COAT && !s.wardrobe.includes('raincoat');
  if (coat) s.wardrobe.push('raincoat');
  return { biscuits: WEEKLY_BISCUITS, stamps: s.weekly.stamps, coat };
}
