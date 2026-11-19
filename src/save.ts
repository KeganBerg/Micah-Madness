// Player progress, kept in the browser's localStorage.
// The save is versioned so future updates can migrate old saves instead of wiping them.

export type BoosterId = 'treat' | 'squirrel' | 'leash' | 'zoomies' | 'micah';

export interface SaveData {
  version: number;
  stars: Record<number, number>; // level id -> best stars (0-3)
  best: Record<number, number>; // level id -> best score
  biscuits: number;
  inventory: Record<BoosterId, number>;
  sound: boolean;
}

export const SAVE_VERSION = 2;
const KEY = 'micah-madness-save';
const LEGACY_KEYS = ['micah-madness-save-v1'];

export const BOOSTERS: Record<BoosterId, { name: string; desc: string; price: number; when: 'in-level' | 'pre-level' }> = {
  treat: { name: 'Treat', desc: 'Micah eats any one piece.', price: 30, when: 'in-level' },
  squirrel: { name: 'Squirrel!', desc: 'Shuffles every piece on the board.', price: 20, when: 'in-level' },
  leash: { name: 'Long Leash', desc: 'Adds 5 moves to this level.', price: 50, when: 'in-level' },
  zoomies: { name: 'Zoomies Start', desc: 'Starts the level with 2 Zoomies pieces.', price: 40, when: 'pre-level' },
  micah: { name: 'Micah Start', desc: 'Starts the level with a Micah piece.', price: 60, when: 'pre-level' },
};

export function freshSave(): SaveData {
  return {
    version: SAVE_VERSION,
    stars: {},
    best: {},
    biscuits: 100,
    inventory: { treat: 2, squirrel: 2, leash: 1, zoomies: 1, micah: 1 },
    sound: true,
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
    version: SAVE_VERSION,
    stars: numMap(d.stars, 3),
    best: numMap(d.best, Number.MAX_SAFE_INTEGER),
    biscuits: num(d.biscuits) ?? base.biscuits,
    inventory,
    sound: typeof d.sound === 'boolean' ? d.sound : base.sound,
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
    const data = migrate(raw ? JSON.parse(raw) : null);
    persist(data); // writes the migrated save under the current key
    return data;
  } catch {
    return freshSave();
  }
}

/** Returns false when the browser refuses to store (private mode, storage full). */
export function persist(data: SaveData): boolean {
  const ls = storage();
  if (!ls) return false;
  try {
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
