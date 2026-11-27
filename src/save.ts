// Player progress, kept in the browser's localStorage.
// The save is versioned so future updates can migrate old saves instead of wiping them.

import type { CraftSave } from './craft';

export type BoosterId = 'treat' | 'squirrel' | 'leash' | 'dust' | 'bed' | 'zoomies' | 'micah';

export interface SaveData {
  version: number;
  stars: Record<number, number>; // level id -> best stars (0-3)
  best: Record<number, number>; // level id -> best score
  biscuits: number;
  inventory: Record<BoosterId, number>;
  sound: boolean;
  /** Background music on or off (separate from sound effects). */
  music: boolean;
  /** Stars spent on yard decorations. */
  spentStars: number;
  /** Decorations bought for Micah's yard. */
  decor: string[];
  /** Daily treat: last claim date (YYYY-MM-DD, local) and the streak day it was. */
  daily: { last: string; day: number };
  /** Levels won in a row (resets when a level is lost). */
  winStreak: number;
  /** Lifetime counters for collar tags (mud washed, Zoomies made, and so on). */
  tally: Record<string, number>;
  /** Collar tags already earned (and paid out). */
  badges: string[];
  /** The outfit Micah wears everywhere (see costumes.ts). */
  costume: string;
  /** Outfits bought with biscuits. */
  wardrobe: string[];
  /** Phone vibration on matches (Android only). */
  haptics: boolean;
  /** One-time notes already shown, such as the add-to-home-screen nudge. */
  seen: string[];
  /** Weekly Walk: the week (its Monday) last won, and paw stamps collected. */
  weekly: { won: string; stamps: number };
  /** Micah's Winter: which winter (its December's year) and the winter levels won in it. */
  winter: { season: number; won: number[] };
  /** Noah's Ark: the Ark levels won (1-based numbers). */
  ark: number[];
  /** The day (YYYY-MM-DD, local) Micah buried the thing in her dig spot ('' before the first one). */
  dig: string;
  /** Micah's Workshop (the merge board), once it has been opened. Checked by cleanCraft in craft.ts. */
  craft?: CraftSave;
  /** Cloud save: the secret code this save syncs under ('' when off). */
  cloud: string;
  /** When this save was last written (ms), to tell which copy is newer. */
  savedAt: number;
}

export const SAVE_VERSION = 8;
const KEY = 'micah-madness-save';
const LEGACY_KEYS = ['micah-madness-save-v1'];
/** A copy of the stored save from before it was upgraded or found damaged, so nothing is ever lost outright. */
export const BACKUP_KEY = 'micah-madness-save-backup';

export const BOOSTERS: Record<BoosterId, { name: string; short?: string; desc: string; price: number; when: 'in-level' | 'pre-level' }> = {
  treat: { name: 'Treat', desc: 'Micah eats any one piece.', price: 30, when: 'in-level' },
  squirrel: { name: 'Squirrel!', desc: 'Shuffles every piece on the board.', price: 20, when: 'in-level' },
  leash: { name: 'Long Leash', short: 'Leash', desc: 'Adds 5 moves to this level.', price: 50, when: 'in-level' },
  dust: { name: 'Magic Dust', short: 'Dust', desc: 'Tap a piece and every piece like it changes into the kind you need.', price: 45, when: 'in-level' },
  bed: { name: 'Orthopedic Bed', short: 'Bed', desc: 'Memory foam remembers the board. Undoes your last move and gives it back.', price: 35, when: 'in-level' },
  zoomies: { name: 'Zoomies Start', desc: 'Starts the level with 2 Zoomies pieces.', price: 40, when: 'pre-level' },
  micah: { name: 'Micah Start', desc: 'Starts the level with a Micah piece.', price: 60, when: 'pre-level' },
};

export function freshSave(): SaveData {
  return {
    version: SAVE_VERSION,
    stars: {},
    best: {},
    biscuits: 100,
    inventory: { treat: 2, squirrel: 2, leash: 1, dust: 1, bed: 1, zoomies: 1, micah: 1 },
    sound: true,
    music: true,
    spentStars: 0,
    decor: [],
    daily: { last: '', day: 0 },
    winStreak: 0,
    tally: {},
    badges: [],
    costume: 'lobster',
    wardrobe: [],
    haptics: true,
    seen: [],
    weekly: { won: '', stamps: 0 },
    winter: { season: 0, won: [] },
    ark: [],
    dig: '',
    cloud: '',
    savedAt: 0,
  };
}

const num = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.floor(v))) : undefined;

function numMap(v: unknown, max: number): Record<number, number> {
  const out: Record<number, number> = {};
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) {
      const id = Number(k);
      const n = num(val, 0, max);
      if (Number.isInteger(id) && id > 0 && n !== undefined) out[id] = n;
    }
  }
  return out;
}

/** Turn whatever is stored (any older version, or a damaged save) into a valid current save. */
export function migrate(raw: unknown): SaveData {
  const base = freshSave();
  if (!raw || typeof raw !== 'object') return base;
  const d = raw as Record<string, unknown>;
  const inv = (d.inventory && typeof d.inventory === 'object' ? d.inventory : {}) as Record<string, unknown>;
  const inventory = { ...base.inventory };
  for (const id of Object.keys(inventory) as BoosterId[]) inventory[id] = num(inv[id]) ?? inventory[id];
  return {
    // Fields this version doesn't know about are kept, so a tab still running an older
    // build (open across an update) can't erase progress that only the newer build tracks.
    ...d,
    version: Math.max(SAVE_VERSION, num(d.version) ?? 0),
    stars: numMap(d.stars, 3),
    best: numMap(d.best, Number.MAX_SAFE_INTEGER),
    biscuits: num(d.biscuits) ?? base.biscuits,
    inventory,
    sound: typeof d.sound === 'boolean' ? d.sound : base.sound,
    music: typeof d.music === 'boolean' ? d.music : base.music,
    spentStars: num(d.spentStars) ?? 0,
    decor: Array.isArray(d.decor) ? d.decor.filter((x): x is string => typeof x === 'string') : [],
    daily: (() => {
      const dd = (d.daily && typeof d.daily === 'object' ? d.daily : {}) as Record<string, unknown>;
      return { last: typeof dd.last === 'string' ? dd.last : '', day: num(dd.day, 0, 7) ?? 0 };
    })(),
    winStreak: num(d.winStreak, 0, 99) ?? 0,
    tally: (() => {
      const out: Record<string, number> = {};
      if (d.tally && typeof d.tally === 'object') {
        for (const [k, v] of Object.entries(d.tally)) {
          const n = num(v);
          if (n !== undefined) out[k] = n;
        }
      }
      return out;
    })(),
    badges: Array.isArray(d.badges) ? [...new Set(d.badges.filter((x): x is string => typeof x === 'string'))] : [],
    costume: typeof d.costume === 'string' ? d.costume : base.costume,
    wardrobe: (() => {
      const w = Array.isArray(d.wardrobe) ? [...new Set(d.wardrobe.filter((x): x is string => typeof x === 'string'))] : [];
      // The Champion outfit moved from level 60 to level 80: anyone who already finished level 60 keeps it.
      const st = (d.stars && typeof d.stars === 'object' ? d.stars : {}) as Record<string, unknown>;
      if ((num(st['60']) ?? 0) > 0 && !w.includes('champion')) w.push('champion');
      return w;
    })(),
    haptics: typeof d.haptics === 'boolean' ? d.haptics : base.haptics,
    seen: Array.isArray(d.seen) ? [...new Set(d.seen.filter((x): x is string => typeof x === 'string'))] : [],
    weekly: (() => {
      const w = (d.weekly && typeof d.weekly === 'object' ? d.weekly : {}) as Record<string, unknown>;
      return { won: typeof w.won === 'string' ? w.won : '', stamps: num(w.stamps, 0, 9999) ?? 0 };
    })(),
    winter: (() => {
      const w = (d.winter && typeof d.winter === 'object' ? d.winter : {}) as Record<string, unknown>;
      const won = Array.isArray(w.won) ? w.won.map((x) => num(x, 1, 99)).filter((x): x is number => x !== undefined) : [];
      return { season: num(w.season, 0, 9999) ?? 0, won: [...new Set(won)].sort((a, b) => a - b) };
    })(),
    ark: Array.isArray(d.ark) ? [...new Set(d.ark.map((x) => num(x, 1, 99)).filter((x): x is number => x !== undefined))].sort((a, b) => a - b) : [],
    dig: typeof d.dig === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.dig) ? d.dig : '',
    cloud: typeof d.cloud === 'string' && /^[A-HJ-NP-Z2-9]{10}$/.test(d.cloud) ? d.cloud : '',
    savedAt: num(d.savedAt) ?? 0,
  };
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function load(): SaveData {
  const ls = storage();
  if (!ls) return freshSave();
  try {
    let raw = ls.getItem(KEY);
    if (!raw) raw = LEGACY_KEYS.map((k) => ls.getItem(k)).find(Boolean) ?? null;
    if (!raw) return freshSave();
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      backup(ls, raw); // damaged: keep the original text before a fresh save replaces it
      return freshSave();
    }
    const old = parsed && typeof parsed === 'object' ? num((parsed as Record<string, unknown>).version) ?? 0 : 0;
    if (old < SAVE_VERSION) backup(ls, raw); // about to upgrade an older save
    const data = migrate(parsed);
    persist(data, false); // writes the migrated save under the current key
    return data;
  } catch {
    return freshSave();
  }
}

function backup(ls: Storage, raw: string): void {
  try {
    ls.setItem(BACKUP_KEY, raw);
  } catch {
    /* storage full: the backup is best effort */
  }
}

/**
 * Calls back with the newer save when another tab or window of the game saves.
 * Without this, a tab left open in the background would later write its stale copy over
 * progress made elsewhere (the last tab to save wins).
 */
export function onSavedElsewhere(cb: (data: SaveData) => void): void {
  try {
    window.addEventListener('storage', (e) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        cb(migrate(JSON.parse(e.newValue)));
      } catch {
        /* ignore a damaged write */
      }
    });
  } catch {
    /* no window (tests) */
  }
}

/** Returns false when the browser refuses to store (private mode, storage full). */
export function persist(data: SaveData, touch = true): boolean {
  const ls = storage();
  if (!ls) return false;
  try {
    if (touch) data.savedAt = Date.now();
    ls.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** Ask the browser to keep this site's storage even when space runs low. */
export function requestDurableStorage(): void {
  try {
    void navigator.storage?.persist?.();
  } catch {
    /* not supported */
  }
}

/** Highest level the player may start (one past the last cleared level). */
export function unlockedUpTo(data: SaveData): number {
  let n = 1;
  while ((data.stars[n] ?? 0) > 0) n++;
  return n;
}

export function totalStars(data: SaveData): number {
  return Object.values(data.stars).reduce((a, b) => a + b, 0);
}

export function starsToSpend(data: SaveData): number {
  return Math.max(0, totalStars(data) - data.spentStars);
}

// ── Daily treat ──
export type DailyReward = { biscuits?: number; booster?: BoosterId; label: string };
export const DAILY_REWARDS: DailyReward[] = [
  { biscuits: 20, label: '20 biscuits' },
  { booster: 'treat', label: '1 Treat' },
  { biscuits: 30, label: '30 biscuits' },
  { booster: 'squirrel', label: '1 Squirrel!' },
  { biscuits: 40, label: '40 biscuits' },
  { booster: 'leash', label: '1 Long Leash' },
  { booster: 'micah', label: '1 Micah Start' },
];

export function localDay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Which streak day (1-7) can be claimed today, or 0 if today's treat is already claimed. */
export function dailyClaimable(data: SaveData, now = new Date()): number {
  const today = localDay(now);
  if (data.daily.last === today) return 0;
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const continues = data.daily.last === localDay(y);
  return continues ? (data.daily.day % 7) + 1 : 1;
}

export function claimDaily(data: SaveData, now = new Date()): DailyReward | null {
  const day = dailyClaimable(data, now);
  if (!day) return null;
  const reward = DAILY_REWARDS[day - 1];
  if (reward.biscuits) data.biscuits += reward.biscuits;
  if (reward.booster) data.inventory[reward.booster]++;
  data.daily = { last: localDay(now), day };
  return reward;
}

// ── Transfer codes: move a save to another browser or device by copy and paste. ──

const CODE_PREFIX = 'MICAH1-';

export function exportCode(data: SaveData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return CODE_PREFIX + btoa(bin);
}

/** Returns the save inside a transfer code, or null if the code isn't one of ours. */
export function importCode(code: string): SaveData | null {
  const trimmed = code.replace(/\s+/g, '');
  if (!trimmed.startsWith(CODE_PREFIX)) return null;
  try {
    const bin = atob(trimmed.slice(CODE_PREFIX.length));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    const raw = JSON.parse(new TextDecoder().decode(bytes));
    if (!raw || typeof raw !== 'object') return null;
    return migrate(raw);
  } catch {
    return null;
  }
}

// ── Cloud merge ──
const maxMap = <K extends string | number>(a: Record<K, number>, b: Record<K, number>): Record<K, number> => {
  const out = { ...a } as Record<K, number>;
  for (const [k, v] of Object.entries(b) as [K, number][]) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const later = (a: string, b: string) => (a >= b ? a : b); // YYYY-MM-DD strings compare in date order

/**
 * Combine two copies of the same player's save (this device and the cloud) so progress made on
 * either one survives: best stars and scores per level, every tag, outfit and decoration, and the
 * larger count of biscuits and boosters. Settings and the current outfit come from the newer copy.
 */
export function mergeSaves(local: SaveData, remote: SaveData): SaveData {
  const [newer, older] = remote.savedAt > local.savedAt ? [remote, local] : [local, remote];
  const winter =
    local.winter.season === remote.winter.season
      ? { season: local.winter.season, won: [...new Set([...local.winter.won, ...remote.winter.won])].sort((a, b) => a - b) }
      : local.winter.season > remote.winter.season ? local.winter : remote.winter;
  return {
    ...older,
    ...newer,
    stars: maxMap(local.stars, remote.stars),
    best: maxMap(local.best, remote.best),
    biscuits: Math.max(local.biscuits, remote.biscuits),
    inventory: maxMap(local.inventory, remote.inventory),
    spentStars: Math.max(local.spentStars, remote.spentStars),
    decor: union(local.decor, remote.decor),
    daily: local.daily.last === later(local.daily.last, remote.daily.last) ? local.daily : remote.daily,
    tally: maxMap(local.tally, remote.tally),
    badges: union(local.badges, remote.badges),
    wardrobe: union(local.wardrobe, remote.wardrobe),
    seen: union(local.seen, remote.seen),
    weekly: { won: later(local.weekly.won, remote.weekly.won), stamps: Math.max(local.weekly.stamps, remote.weekly.stamps) },
    winter,
    ark: [...new Set([...local.ark, ...remote.ark])].sort((a, b) => a - b),
    dig: later(local.dig, remote.dig),
    cloud: local.cloud || remote.cloud,
    // The workshop board can't be merged cell by cell: keep the newer board, and every discovery from both.
    ...(newer.craft || older.craft
      ? { craft: { ...(newer.craft ?? older.craft)!, found: union(newer.craft?.found ?? [], older.craft?.found ?? []) } }
      : {}),
    savedAt: Math.max(local.savedAt, remote.savedAt),
  };
}
