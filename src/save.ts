// Player progress, kept in localStorage (safe if storage is unavailable).

export type BoosterId = 'treat' | 'squirrel' | 'leash' | 'zoomies' | 'micah';

export interface SaveData {
  stars: Record<number, number>; // level id -> best stars (0-3)
  best: Record<number, number>; // level id -> best score
  biscuits: number;
  inventory: Record<BoosterId, number>;
  sound: boolean;
}

const KEY = 'micah-madness-save-v1';

export const BOOSTERS: Record<BoosterId, { name: string; desc: string; price: number; when: 'in-level' | 'pre-level' }> = {
  treat: { name: 'Treat', desc: 'Micah gobbles any one piece.', price: 30, when: 'in-level' },
  squirrel: { name: 'Squirrel!', desc: 'Startle the board into a shuffle.', price: 20, when: 'in-level' },
  leash: { name: 'Long Leash', desc: '+5 moves for this level.', price: 50, when: 'in-level' },
  zoomies: { name: 'Zoomies Start', desc: 'Begin the level with 2 Zoomies pieces.', price: 40, when: 'pre-level' },
  micah: { name: 'Micah Start', desc: 'Begin the level with a Micah piece.', price: 60, when: 'pre-level' },
};

function fresh(): SaveData {
  return {
    stars: {},
    best: {},
    biscuits: 100,
    inventory: { treat: 2, squirrel: 2, leash: 1, zoomies: 1, micah: 1 },
    sound: true,
  };
}

export function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const data = JSON.parse(raw) as Partial<SaveData>;
    const base = fresh();
    return { ...base, ...data, inventory: { ...base.inventory, ...(data.inventory ?? {}) } };
  } catch {
    return fresh();
  }
}

export function persist(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable: progress lasts for this session only */
  }
}

/** Highest level the player may start (one past the last cleared level). */
export function unlockedUpTo(data: SaveData): number {
  let n = 1;
  while ((data.stars[n] ?? 0) > 0) n++;
  return n;
}
