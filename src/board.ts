// Pure board logic for Micah Madness. No DOM in here so it can be unit tested.

/** Number of regular piece kinds (bone, ball, paw, bowl, lobster, cap). */
export const KIND_COUNT = 6;
/** Kind value used by the Micah (rainbow) special, which matches nothing. */
export const MICAH_KIND = -1;
/**
 * Kind value for junk the Noah's Ark raccoons throw onto the board (a sock, a boot...).
 * Junk never matches. Micah eats it when it reaches the bottom row, or catches it when
 * a power-up blasts it loose. Which item it is lives in Tile.junk.
 */
export const JUNK_KIND = -2;
/**
 * Kind value for a delivery parcel: a cardboard box that sits on the board like a piece,
 * falls like one, but never matches and can't be swapped. A match right beside it, or a
 * blast through it, tears off one layer (Tile.box: 1 plain, 2 taped up).
 */
export const BOX_KIND = -3;

export type Special = 'none' | 'zoomRow' | 'zoomCol' | 'bark' | 'micah';

export interface Tile {
  id: number;
  kind: number;
  special: Special;
  /** Which piece of junk this is (only when kind is JUNK_KIND). */
  junk?: number;
  /** Layers of cardboard left on a parcel (only when kind is BOX_KIND). */
  box?: number;
}

export type Cell = Tile | null;
export type Grid = Cell[][]; // grid[row][col]
export type Pos = readonly [number, number];
export type Rng = () => number;

let nextId = 1;
export function newTile(kind: number, special: Special = 'none'): Tile {
  return { id: nextId++, kind: special === 'micah' ? MICAH_KIND : kind, special };
}

export function newJunk(item: number): Tile {
  return { id: nextId++, kind: JUNK_KIND, special: 'none', junk: item };
}
export const isJunk = (t: Cell | undefined): boolean => !!t && t.kind === JUNK_KIND;

export function newBox(layers = 1): Tile {
  return { id: nextId++, kind: BOX_KIND, special: 'none', box: layers };
}
export const isBox = (t: Cell | undefined): boolean => !!t && t.kind === BOX_KIND;

/** Put parcels on a new board from an 8-row layout: 'x' a parcel, 'X' a taped parcel (two layers). */
export function placeBoxes(grid: Grid, layout?: string[]): void {
  layout?.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if ((ch === 'x' || ch === 'X') && grid[r]?.[c] !== undefined) grid[r][c] = newBox(ch === 'X' ? 2 : 1);
    }),
  );
}

/** How many parcels are on the board. */
export function boxCount(grid: Grid): number {
  return grid.reduce((n, row) => n + row.filter((t) => isBox(t)).length, 0);
}

/**
 * Parcels caught by a step: every parcel a blast reached (it's in `cleared`) or that sits
 * right beside (up, down, left, right) a cleared piece loses one layer. Each parcel is hit
 * at most once a step. Parcels torn open stay in `cleared` so they are removed; parcels
 * with a layer left are taken out of it. Returns where each kind ended up.
 */
export function hitBoxes(grid: Grid, cleared: Set<number>): { broken: Pos[]; dented: Pos[] } {
  const hit = new Set<number>();
  for (const k of cleared) {
    const [r, c] = unkey(k);
    if (isBox(grid[r]?.[c])) {
      hit.add(k);
      continue;
    }
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      if (inBounds(grid, rr, cc) && isBox(grid[rr][cc])) hit.add(key(rr, cc));
    }
  }
  const broken: Pos[] = [];
  const dented: Pos[] = [];
  for (const k of hit) {
    const [r, c] = unkey(k);
    const t = grid[r][c]!;
    t.box = (t.box ?? 1) - 1;
    if (t.box <= 0) {
      cleared.add(k);
      broken.push([r, c]);
    } else {
      cleared.delete(k);
      dented.push([r, c]);
    }
  }
  return { broken, dented };
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
        const same = cur && prev && cur.kind === prev.kind && cur.kind >= 0;
        if (!same) {
          if (prev && prev.kind >= 0 && i - start >= 3) {
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
  // Micah won't fetch junk: swapping her onto it is just an ordinary swap.
  if ((ta.special === 'micah' && isJunk(tb)) || (tb.special === 'micah' && isJunk(ta))) {
    swap(grid, a, b);
    const ok = findRuns(grid).length > 0;
    swap(grid, a, b);
    return ok;
  }
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

/**
 * Fallen leaves blow in: one new leaf lands next to an existing one, on a cell that
 * has no leaf and isn't blocked (mud or yarn). Returns where it landed, or null.
 */
export function spreadLeaf(leaf: boolean[][], blocked: (r: number, c: number) => boolean = () => false, rng: Rng = Math.random): Pos | null {
  const seen = new Set<number>();
  const options: Pos[] = [];
  for (let r = 0; r < leaf.length; r++) {
    for (let c = 0; c < leaf[0].length; c++) {
      if (!leaf[r][c]) continue;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= leaf.length || cc >= leaf[0].length || leaf[rr][cc] || blocked(rr, cc) || seen.has(key(rr, cc))) continue;
        seen.add(key(rr, cc));
        options.push([rr, cc]);
      }
    }
  }
  if (!options.length) return null;
  const p = options[Math.floor(rng() * options.length)];
  leaf[p[0]][p[1]] = true;
  return p;
}

/**
 * Soap bubbles pop when a match clears their own cell or any cell right beside it
 * (up, down, left or right). Pops them in place and returns where they were.
 */
export function popBubbles(bubble: boolean[][], cleared: Iterable<number>): Pos[] {
  const popped: Pos[] = [];
  for (const k of cleared) {
    const [r, c] = unkey(k);
    for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= bubble.length || cc >= bubble[0].length || !bubble[rr][cc]) continue;
      bubble[rr][cc] = false;
      popped.push([rr, cc]);
    }
  }
  return popped;
}

/** How many of the cleared cells held junk (blasted loose, so Micah catches it). */
export function junkIn(grid: Grid, cleared: Iterable<number>): number {
  let n = 0;
  for (const k of cleared) {
    const [r, c] = unkey(k);
    if (isJunk(grid[r][c])) n++;
  }
  return n;
}

/** How many pieces of junk are on the board. */
export function junkCount(grid: Grid): number {
  return grid.reduce((n, row) => n + row.filter((t) => isJunk(t)).length, 0);
}

/** Junk sitting in the bottom row, ready for Micah to eat. */
export function junkAtBottom(grid: Grid): Pos[] {
  const r = grid.length - 1;
  const out: Pos[] = [];
  grid[r].forEach((t, c) => isJunk(t) && out.push([r, c]));
  return out;
}

/**
 * The raccoons throw more junk: turns freshly fallen pieces (from the top) into junk
 * until `want` pieces are on the board. Returns the tiles it changed.
 */
export function throwJunk(grid: Grid, drops: Drop[], want: number, items: number, rng: Rng = Math.random): Tile[] {
  // The raccoons aim for the deepest gap, so new junk lands as low as a fresh piece can.
  const fresh = drops.filter((d) => d.from[0] < 0 && d.tile.special === 'none' && d.to[0] < grid.length - 1);
  const thrown: Tile[] = [];
  let have = junkCount(grid);
  while (have < want && fresh.length) {
    const low = Math.max(...fresh.map((d) => d.to[0]));
    const deepest = fresh.filter((d) => d.to[0] === low);
    const d = deepest[Math.floor(rng() * deepest.length)];
    fresh.splice(fresh.indexOf(d), 1);
    d.tile.kind = JUNK_KIND;
    d.tile.junk = Math.floor(rng() * items);
    thrown.push(d.tile);
    have++;
  }
  return thrown;
}

/** Put junk on a new board: `count` pieces in the top three rows, on different columns. */
export function placeJunk(grid: Grid, count: number, items: number, rng: Rng = Math.random): void {
  const cols = [...grid[0].keys()];
  for (let i = 0; i < count && cols.length; i++) {
    const c = cols.splice(Math.floor(rng() * cols.length), 1)[0];
    const r = Math.floor(rng() * 3);
    if ((grid[r][c]?.kind ?? 0) < 0) continue; // a parcel is already there
    grid[r][c] = newJunk(Math.floor(rng() * items));
  }
}

/**
 * The hint on a Noah's Ark level: the legal move that drops junk the furthest
 * (each cleared cell under a piece of junk drops it one row), or null if none moves any.
 */
export function junkMove(grid: Grid, locked: Locked = none): [Pos, Pos] | null {
  let best: [Pos, Pos] | null = null;
  let bestDrop = 0;
  const rows = grid.length, cols = grid[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const a: Pos = [r, c], b: Pos = [r + dr, c + dc];
        if (b[0] >= rows || b[1] >= cols || locked(...a) || locked(...b) || !isLegalSwap(grid, a, b)) continue;
        swap(grid, a, b);
        const cleared = new Set<number>();
        for (const run of findRuns(grid)) for (const [rr, cc] of run.cells) cleared.add(key(rr, cc));
        let drop = 0;
        for (let cc = 0; cc < cols; cc++) {
          let below = 0;
          for (let rr = rows - 1; rr >= 0; rr--) {
            if (isJunk(grid[rr][cc])) drop += below;
            if (cleared.has(key(rr, cc))) below++;
          }
        }
        swap(grid, a, b);
        if (drop > bestDrop) {
          bestDrop = drop;
          best = [a, b];
        }
      }
    }
  }
  return best;
}
