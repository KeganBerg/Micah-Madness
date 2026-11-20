// Pure board logic for Micah Madness. No DOM in here so it can be unit tested.

/** Number of regular piece kinds (bone, ball, paw, bowl, lobster, cap). */
export const KIND_COUNT = 6;
/** Kind value used by the Micah (rainbow) special, which matches nothing. */
export const MICAH_KIND = -1;

export type Special = 'none' | 'zoomRow' | 'zoomCol' | 'bark' | 'micah';

export interface Tile {
  id: number;
  kind: number;
  special: Special;
}

export type Cell = Tile | null;
export type Grid = Cell[][]; // grid[row][col]
export type Pos = readonly [number, number];
export type Rng = () => number;

let nextId = 1;
export function newTile(kind: number, special: Special = 'none'): Tile {
  return { id: nextId++, kind: special === 'micah' ? MICAH_KIND : kind, special };
}

export function randomKind(rng: Rng, kinds = KIND_COUNT): number {
  return Math.floor(rng() * kinds);
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((t) => (t ? { ...t } : null)));
}

export const key = (r: number, c: number) => r * 100 + c;
export const unkey = (k: number): Pos => [Math.floor(k / 100), k % 100];

export function inBounds(grid: Grid, r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}

export function isAdjacent(a: Pos, b: Pos): boolean {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

/** Build a board with no starting matches and at least one legal move. */
export function createGrid(rows: number, cols: number, rng: Rng = Math.random, kinds = KIND_COUNT): Grid {
  for (;;) {
    const grid: Grid = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      grid.push(row);
      for (let c = 0; c < cols; c++) {
        let kind: number;
        do {
          kind = randomKind(rng, kinds);
        } while (
          (c >= 2 && row[c - 1]!.kind === kind && row[c - 2]!.kind === kind) ||
          (r >= 2 && grid[r - 1][c]!.kind === kind && grid[r - 2][c]!.kind === kind)
        );
        row.push(newTile(kind));
      }
    }
    if (hasMove(grid)) return grid;
  }
}

export interface Run {
  dir: 'h' | 'v';
  cells: Pos[];
  kind: number;
}

/** Every straight line of 3+ same-kind tiles. */
export function findRuns(grid: Grid): Run[] {
  const runs: Run[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const scan = (dir: 'h' | 'v') => {
    const outer = dir === 'h' ? rows : cols;
    const inner = dir === 'h' ? cols : rows;
    for (let o = 0; o < outer; o++) {
      let start = 0;
      for (let i = 1; i <= inner; i++) {
        const at = (j: number) => (dir === 'h' ? grid[o][j] : grid[j][o]);
        const prev = at(start);
        const cur = i < inner ? at(i) : null;
        const same = cur && prev && cur.kind === prev.kind && cur.kind !== MICAH_KIND;
        if (!same) {
          if (prev && prev.kind !== MICAH_KIND && i - start >= 3) {
            const cells: Pos[] = [];
            for (let j = start; j < i; j++) cells.push(dir === 'h' ? [o, j] : [j, o]);
            runs.push({ dir, cells, kind: prev.kind });
          }
          start = i;
        }
      }
    }
  };
  scan('h');
  scan('v');
  return runs;
}

export function swap(grid: Grid, a: Pos, b: Pos): void {
  const t = grid[a[0]][a[1]];
  grid[a[0]][a[1]] = grid[b[0]][b[1]];
  grid[b[0]][b[1]] = t;
}

const isPowered = (t: Cell) => !!t && t.special !== 'none';

/** True if swapping a and b is a legal move (makes a match or combines specials). */
export function isLegalSwap(grid: Grid, a: Pos, b: Pos): boolean {
  if (!isAdjacent(a, b)) return false;
  const ta = grid[a[0]][a[1]];
  const tb = grid[b[0]][b[1]];
  if (!ta || !tb) return false;
  if (ta.special === 'micah' || tb.special === 'micah') return true;
  if (isPowered(ta) && isPowered(tb)) return true;
  swap(grid, a, b);
  const ok = findRuns(grid).length > 0;
  swap(grid, a, b);
  return ok;
}

/** Cells whose piece can't be moved (yarn). */
export type Locked = (r: number, c: number) => boolean;
const none: Locked = () => false;

export function hasMove(grid: Grid, locked: Locked = none): boolean {
  return findMove(grid, locked) !== null;
}

/** First legal move found, used for hints and dead-board detection. Swaps touching a locked cell don't count. */
export function findMove(grid: Grid, locked: Locked = none): [Pos, Pos] | null {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (locked(r, c)) continue;
      if (c + 1 < grid[0].length && !locked(r, c + 1) && isLegalSwap(grid, [r, c], [r, c + 1])) return [[r, c], [r, c + 1]];
      if (r + 1 < grid.length && !locked(r + 1, c) && isLegalSwap(grid, [r, c], [r + 1, c])) return [[r, c], [r + 1, c]];
    }
  }
  return null;
}

export interface Creation {
  pos: Pos;
  tile: Tile;
}

export interface ClearResult {
  /** Cells whose tiles get removed this step. */
  cleared: Set<number>;
  /** Special tiles placed after clearing. */
  created: Creation[];
  /** Specials that fired this step, for effects. */
  fired: { pos: Pos; special: Special }[];
  /** Number of tiles of each kind removed (index = kind). */
  collected: number[];
}

/**
 * Work out what a step removes. `preferred` are the cells the player just
 * swapped, so a new special lands where the player made the move.
 * `forced` are extra cells to clear (from special combos).
 */
export function computeClear(grid: Grid, preferred: Pos[] = [], forced: Iterable<number> = [], rng: Rng = Math.random): ClearResult {
  const runs = findRuns(grid);
  const created: Creation[] = [];
  const seed = new Set<number>(forced);
  const reserved = new Set<number>();

  const pickCell = (cells: Pos[]): Pos => {
    for (const p of preferred) {
      if (cells.some((c) => c[0] === p[0] && c[1] === p[1]) && !reserved.has(key(p[0], p[1]))) return p;
    }
    const free = cells.filter((c) => !reserved.has(key(c[0], c[1])));
    return free[Math.floor((free.length - 1) / 2)] ?? cells[0];
  };
  const place = (pos: Pos, kind: number, special: Special) => {
    reserved.add(key(pos[0], pos[1]));
    created.push({ pos, tile: newTile(kind, special) });
  };

  const used = new Set<Run>();
  // 5 in a row: Micah herself.
  for (const run of runs) {
    if (run.cells.length >= 5) {
      place(pickCell(run.cells), MICAH_KIND, 'micah');
      used.add(run);
    }
  }
  // L / T shapes: a big bark that clears a 3x3 area.
  for (const h of runs) {
    if (h.dir !== 'h' || used.has(h)) continue;
    for (const v of runs) {
      if (v.dir !== 'v' || used.has(v) || v.kind !== h.kind) continue;
      const cross = h.cells.find((a) => v.cells.some((b) => a[0] === b[0] && a[1] === b[1]));
      if (cross) {
        place(cross, h.kind, 'bark');
        used.add(h);
        used.add(v);
        break;
      }
    }
  }
  // 4 in a row: zoomies that clear the whole row or column.
  for (const run of runs) {
    if (used.has(run) || run.cells.length !== 4) continue;
    place(pickCell(run.cells), run.kind, run.dir === 'h' ? 'zoomRow' : 'zoomCol');
  }

  for (const run of runs) for (const [r, c] of run.cells) seed.add(key(r, c));

  const { cleared, fired } = expandClears(grid, seed, rng);
  // Cells that receive a new special are not emptied (unless a blast hits them later).
  const collected = new Array(KIND_COUNT).fill(0);
  for (const k of cleared) {
    const [r, c] = unkey(k);
    const t = grid[r][c];
    if (t && t.kind >= 0) collected[t.kind]++;
  }
  return { cleared, created, fired, collected };
}

/** Grow a set of cleared cells by firing any specials caught inside it. */
export function expandClears(grid: Grid, seed: Iterable<number>, rng: Rng = Math.random): { cleared: Set<number>; fired: { pos: Pos; special: Special }[] } {
  const cleared = new Set<number>();
  const fired: { pos: Pos; special: Special }[] = [];
  const queue = [...seed];
  const rows = grid.length;
  const cols = grid[0].length;
  while (queue.length) {
    const k = queue.pop()!;
    if (cleared.has(k)) continue;
    const [r, c] = unkey(k);
    const t = grid[r]?.[c];
    if (!t) continue;
    cleared.add(k);
    if (t.special === 'none') continue;
    fired.push({ pos: [r, c], special: t.special });
    if (t.special === 'zoomRow') for (let j = 0; j < cols; j++) queue.push(key(r, j));
    if (t.special === 'zoomCol') for (let i = 0; i < rows; i++) queue.push(key(i, c));
    if (t.special === 'bark') {
      for (let i = r - 1; i <= r + 1; i++) for (let j = c - 1; j <= c + 1; j++) if (inBounds(grid, i, j)) queue.push(key(i, j));
    }
    if (t.special === 'micah') {
      // Caught in a blast: Micah fetches every tile of a random kind.
      const kind = mostCommonKind(grid, rng);
      for (const kk of cellsOfKind(grid, kind)) queue.push(kk);
    }
  }
  return { cleared, fired };
}

export function cellsOfKind(grid: Grid, kind: number): number[] {
  const out: number[] = [];
  grid.forEach((row, r) => row.forEach((t, c) => t && t.kind === kind && out.push(key(r, c))));
  return out;
}

function mostCommonKind(grid: Grid, rng: Rng): number {
  const counts = new Array(KIND_COUNT).fill(0);
  for (const row of grid) for (const t of row) if (t && t.kind >= 0) counts[t.kind]++;
  const max = Math.max(...counts);
  const best = counts.map((n, i) => (n === max ? i : -1)).filter((i) => i >= 0);
  return best[Math.floor(rng() * best.length)];
}

/** Extra cells cleared when the swap itself is a special combo. */
export function comboClears(grid: Grid, a: Pos, b: Pos): number[] | null {
  const ta = grid[a[0]][a[1]]!;
  const tb = grid[b[0]][b[1]]!;
  if (ta.special === 'micah' && tb.special === 'micah') {
    const all: number[] = [];
    grid.forEach((row, r) => row.forEach((_, c) => all.push(key(r, c))));
    return all;
  }
  if (ta.special === 'micah' || tb.special === 'micah') {
    const [m, other] = ta.special === 'micah' ? [a, tb] : [b, ta];
    const cells = cellsOfKind(grid, other.kind);
    // Micah + a powered piece turns every match of that kind into that power.
    if (other.special !== 'none') {
      for (const k of cells) {
        const [r, c] = unkey(k);
        grid[r][c]!.special = other.special === 'bark' ? 'bark' : Math.random() < 0.5 ? 'zoomRow' : 'zoomCol';
      }
    }
    // Micah's own power is spent by the combo, so she is cleared plainly.
    grid[m[0]][m[1]]!.special = 'none';
    return [key(m[0], m[1]), ...cells];
  }
  if (isPowered(ta) && isPowered(tb)) return [key(a[0], a[1]), key(b[0], b[1])];
  return null;
}

/** Remove cleared tiles and place created specials. */
export function applyClear(grid: Grid, result: ClearResult): void {
  for (const k of result.cleared) {
    const [r, c] = unkey(k);
    grid[r][c] = null;
  }
  for (const { pos, tile } of result.created) grid[pos[0]][pos[1]] = tile;
}

export interface Drop {
  tile: Tile;
  from: Pos; // may have a negative row for freshly spawned tiles
  to: Pos;
}

/** Let tiles fall and fill the gaps from the top. */
export function applyGravity(grid: Grid, rng: Rng = Math.random, kinds = KIND_COUNT): Drop[] {
  const drops: Drop[] = [];
  const rows = grid.length;
  for (let c = 0; c < grid[0].length; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      const t = grid[r][c];
      if (!t) continue;
      if (write !== r) {
        grid[write][c] = t;
        grid[r][c] = null;
        drops.push({ tile: t, from: [r, c], to: [write, c] });
      }
      write--;
    }
    const spawnCount = write + 1;
    for (let r = write; r >= 0; r--) {
      const t = newTile(randomKind(rng, kinds));
      grid[r][c] = t;
      drops.push({ tile: t, from: [r - spawnCount, c], to: [r, c] });
    }
  }
  return drops;
}

/** Shuffle regular tiles in place until the board has a move and no matches. */
export function shuffle(grid: Grid, rng: Rng = Math.random): void {
  const tiles = grid.flat().filter((t): t is Tile => !!t);
  for (let tries = 0; tries < 200; tries++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    let n = 0;
    for (const row of grid) for (let c = 0; c < row.length; c++) row[c] = tiles[n++];
    if (findRuns(grid).length === 0 && hasMove(grid)) return;
  }
}

/**
 * Magic Dust: which kind the tapped kind should turn into.
 * A kind the level still asks you to collect wins (most still needed first),
 * otherwise the most common other kind on the board, so the new pieces line up into matches.
 */
export function dustTarget(grid: Grid, from: number, kinds = KIND_COUNT, wanted: { kind: number; left: number }[] = []): number {
  const need = wanted.filter((w) => w.kind !== from && w.kind >= 0 && w.kind < kinds && w.left > 0).sort((a, b) => b.left - a.left);
  if (need.length) return need[0].kind;
  const counts = new Array(kinds).fill(0);
  for (const row of grid) for (const t of row) if (t && t.kind >= 0 && t.kind < kinds) counts[t.kind]++;
  let best = from === 0 ? 1 : 0;
  for (let k = 0; k < kinds; k++) if (k !== from && counts[k] > counts[best]) best = k;
  return best;
}

/** Turn every piece of one kind into another (specials keep their power). Returns the cells changed. */
export function transformKind(grid: Grid, from: number, to: number): number[] {
  const changed: number[] = [];
  if (from < 0 || from === to) return changed;
  grid.forEach((row, r) =>
    row.forEach((t, c) => {
      if (t && t.kind === from && t.special !== 'micah') {
        t.kind = to;
        changed.push(key(r, c));
      }
    }),
  );
  return changed;
}
