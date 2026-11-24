import { describe, expect, it } from 'vitest';
import { JUNK_KIND, junkIn, junkMove, computeClear, createGrid, expandClears, findRuns, isJunk, isLegalSwap, junkAtBottom, junkCount, key, newJunk, newTile, placeJunk, throwJunk, applyGravity, type Grid } from './board';
import { ARK_COUNT, ARK_LEVELS, JUNK_ITEMS, arkNext, arkOpen, claimArk } from './ark';
import { freshSave, mergeSaves, migrate } from './save';
import { COSTUMES } from './costumes';

const rng = (() => { let x = 7; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); })();

describe('junk', () => {
  it('never matches, even three in a row', () => {
    const g: Grid = createGrid(8, 8, rng, 6);
    for (let c = 0; c < 3; c++) g[0][c] = newJunk(c);
    expect(findRuns(g).some((r) => r.cells.some(([rr]) => rr === 0 && r.kind === JUNK_KIND))).toBe(false);
  });

  it('is caught when a power-up blasts it', () => {
    const g: Grid = createGrid(8, 8, rng, 6);
    g[3][3] = newJunk(0);
    g[3][4] = newTile(1, 'zoomRow');
    const { cleared } = expandClears(g, [key(3, 4)]);
    expect(cleared.has(key(3, 3))).toBe(true);
    expect(junkIn(g, cleared)).toBe(1);
    expect(computeClear(g, [], [key(3, 4)]).collected.reduce((a, b) => a + b, 0)).toBe(7);
  });

  it('Micah will not fetch it', () => {
    const g: Grid = createGrid(8, 8, rng, 6);
    g[0][0] = newTile(0, 'micah');
    g[0][1] = newJunk(1);
    g[1][0] = newTile(2); g[1][1] = newTile(3); g[0][2] = newTile(4);
    expect(isLegalSwap(g, [0, 0], [0, 1])).toBe(false);
  });

  it('is found in the bottom row and thrown in from the top', () => {
    const g: Grid = createGrid(8, 8, rng, 6);
    g[7][2] = newJunk(0);
    g[5][5] = newJunk(1);
    expect(junkAtBottom(g)).toEqual([[7, 2]]);
    g[7][2] = null;
    g[0][0] = null; g[0][1] = null;
    const drops = applyGravity(g, rng, 6);
    throwJunk(g, drops, 3, JUNK_ITEMS.length, rng);
    expect(junkCount(g)).toBe(3);
    // Fresh junk never lands straight in the bottom row.
    expect(junkAtBottom(g)).toEqual([]);
  });

  it('hints at a move that drops junk', () => {
    // Junk at the top of column 0; a match in column 0 below it is the only move that drops it.
    const k = [[9, 1, 2, 3, 4, 0, 1, 2], [0, 2, 3, 4, 0, 1, 2, 3], [3, 4, 0, 1, 2, 3, 4, 0], [5, 3, 1, 2, 3, 4, 0, 1], [5, 1, 2, 3, 4, 0, 1, 2], [3, 5, 3, 4, 0, 1, 2, 3], [3, 4, 0, 1, 2, 3, 4, 0], [4, 0, 1, 2, 3, 4, 0, 1]];
    const g: Grid = k.map((row) => row.map((n) => (n === 9 ? newJunk(0) : newTile(n))));
    const mv = junkMove(g);
    expect(mv).not.toBeNull();
    expect(mv!.some(([, c]) => c === 0)).toBe(true);
  });

  it('starts in the top three rows', () => {
    const g: Grid = createGrid(8, 8, rng, 6);
    placeJunk(g, 3, JUNK_ITEMS.length, rng);
    const at = g.flatMap((row, r) => row.map((t, c) => (isJunk(t) ? [r, c] : null)).filter(Boolean));
    expect(at).toHaveLength(3);
    for (const p of at) expect(p![0]).toBeLessThan(3);
  });
});

describe('Noah’s Ark', () => {
  it('has a junk goal on every level and valid boards', () => {
    expect(ARK_LEVELS).toHaveLength(ARK_COUNT);
    for (const lv of ARK_LEVELS) {
      expect(lv.goals.some((g) => g.type === 'junk')).toBe(true);
      expect(lv.moves).toBeGreaterThanOrEqual(18);
      expect(lv.moves).toBeLessThanOrEqual(45);
      for (const rows of [lv.mud, lv.yarn, lv.leaves]) if (rows) expect(rows.every((r) => r.length === 8) && rows.length === 8).toBe(true);
    }
  });

  it('opens after level 41 and pays out the outfits', () => {
    const s = freshSave();
    expect(arkOpen(s)).toBe(false);
    s.stars[41] = 1;
    expect(arkOpen(s)).toBe(true);
    for (let n = 1; n <= 4; n++) expect(claimArk(s, n)?.mask).toBe(false);
    expect(claimArk(s, 5)?.mask).toBe(true);
    expect(claimArk(s, 5)).toBeNull();
    for (let n = 6; n < ARK_COUNT; n++) claimArk(s, n);
    expect(arkNext(s)).toBe(ARK_COUNT);
    expect(claimArk(s, ARK_COUNT)?.hat).toBe(true);
    expect(arkNext(s)).toBe(0);
    expect(s.wardrobe).toEqual(expect.arrayContaining(['bandit', 'hardhat']));
    expect(COSTUMES.some((c) => c.id === 'bandit') && COSTUMES.some((c) => c.id === 'hardhat')).toBe(true);
  });

  it('keeps Ark progress through saves and merges', () => {
    const a = freshSave(); a.ark = [1, 2];
    const b = freshSave(); b.ark = [2, 3];
    expect(mergeSaves(a, b).ark).toEqual([1, 2, 3]);
    expect(migrate(JSON.parse(JSON.stringify({ ...a, ark: [3, 'x', 1, 1] }))).ark).toEqual([1, 3]);
    expect(migrate({}).ark).toEqual([]);
  });
});
