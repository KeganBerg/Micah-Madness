import { describe, expect, it } from 'vitest';
import {
  applyClear,
  applyGravity,
  comboClears,
  computeClear,
  createGrid,
  findMove,
  findRuns,
  hasMove,
  isLegalSwap,
  key,
  newTile,
  shuffle,
  type Grid,
} from './board';

/** Build a grid from rows of digits; '.' is empty, 'M' is a Micah piece. */
function grid(rows: string[]): Grid {
  return rows.map((row) =>
    row.split('').map((ch) => (ch === '.' ? null : ch === 'M' ? newTile(-1, 'micah') : newTile(Number(ch)))),
  );
}

// Seeded RNG so tests are repeatable.
function rng(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe('createGrid', () => {
  it('starts with no matches and at least one move', () => {
    for (let s = 1; s < 30; s++) {
      const g = createGrid(8, 8, rng(s));
      expect(findRuns(g)).toHaveLength(0);
      expect(hasMove(g)).toBe(true);
    }
  });
});

describe('matching', () => {
  it('finds horizontal and vertical runs', () => {
    const g = grid(['0001', '1232', '1345', '1450']);
    const runs = findRuns(g);
    expect(runs.map((r) => [r.dir, r.cells.length])).toEqual([
      ['h', 3],
      ['v', 3],
    ]);
  });

  it('only allows swaps that make a match', () => {
    const g = grid(['0102', '1213', '2324', '3435']);
    expect(isLegalSwap(g, [0, 0], [0, 1])).toBe(false);
    const g2 = grid(['0012', '1201', '2323', '3434']);
    expect(isLegalSwap(g2, [0, 2], [1, 2])).toBe(true);
  });

  it('a Micah piece can always be swapped', () => {
    const g = grid(['M102', '1213', '2324', '3435']);
    expect(isLegalSwap(g, [0, 0], [0, 1])).toBe(true);
  });
});

describe('power-ups', () => {
  it('4 in a row makes a Zoomies piece', () => {
    const g = grid(['00001', '12312', '23423', '34534', '45145']);
    const res = computeClear(g, [[0, 1]]);
    expect(res.created).toHaveLength(1);
    expect(res.created[0].tile.special).toBe('zoomRow');
    expect(res.created[0].pos).toEqual([0, 1]);
  });

  it('5 in a row makes Micah', () => {
    const g = grid(['00000', '12312', '23423', '34534', '45145']);
    const res = computeClear(g);
    expect(res.created[0].tile.special).toBe('micah');
  });

  it('an L shape makes a Bark piece at the corner', () => {
    const g = grid(['00012', '01234', '02345', '13451', '24512']);
    const res = computeClear(g);
    expect(res.created[0].tile.special).toBe('bark');
    expect(res.created[0].pos).toEqual([0, 0]);
  });

  it('Zoomies clears its whole row when matched', () => {
    const g = grid(['11123', '23451', '34512', '45123', '51234']);
    g[0][0]!.special = 'zoomRow';
    // Put the zoomies on row 1 so its blast is visible beyond the match.
    const res = computeClear(g);
    expect(res.cleared.size).toBe(5);
    expect(res.fired.map((f) => f.special)).toContain('zoomRow');
  });

  it('Bark clears a 3x3 area', () => {
    const g = grid(['12345', '23451', '31112', '45123', '51234']);
    g[2][2]!.special = 'bark';
    const res = computeClear(g);
    // 3 matched + the 3x3 around (2,2) = 9 cells total (match row is inside it).
    expect(res.cleared.size).toBe(9);
  });

  it('Micah swapped with a piece clears every piece of that kind', () => {
    const g = grid(['M1201', '23401', '34512', '15123', '51234']);
    const extra = comboClears(g, [0, 0], [0, 1])!;
    const ones = g.flat().filter((t) => t && t.kind === 1).length;
    expect(extra.length).toBe(ones + 1);
  });

  it('collects counts by kind', () => {
    const g = grid(['00012', '12345', '23451']);
    const res = computeClear(g);
    expect(res.collected[0]).toBe(3);
    expect(res.cleared.has(key(0, 0))).toBe(true);
  });
});

describe('gravity', () => {
  it('drops tiles down and refills from the top', () => {
    const g = grid(['01', '.2', '3.']);
    const drops = applyGravity(g, rng(3));
    expect(g.flat().every(Boolean)).toBe(true);
    expect(g[2][1]!.kind).toBe(2);
    expect(g[2][0]!.kind).toBe(3);
    expect(g[1][0]!.kind).toBe(0);
    expect(drops.some((d) => d.from[0] < 0)).toBe(true);
  });

  it('applyClear removes cleared tiles and places new specials', () => {
    const g = grid(['00001', '12312', '23423']);
    const res = computeClear(g, [[0, 2]]);
    applyClear(g, res);
    expect(g[0][2]!.special).toBe('zoomRow');
    expect(g[0][0]).toBeNull();
  });
});

describe('shuffle', () => {
  it('leaves a playable board with no matches', () => {
    const g = createGrid(8, 8, rng(7));
    shuffle(g, rng(9));
    expect(findRuns(g)).toHaveLength(0);
    expect(hasMove(g)).toBe(true);
  });
});

describe('locked cells (yarn)', () => {
  // The only move is swapping (0,2) with (1,2) to make 000 along the top row.
  const g = () => grid(['0012', '3404', '5252', '4343']);
  it('finds the move when nothing is locked', () => {
    expect(findMove(g())).toEqual([[0, 2], [1, 2]]);
  });
  it('ignores swaps that touch a locked cell', () => {
    expect(hasMove(g(), (r, c) => r === 1 && c === 2)).toBe(false);
    expect(hasMove(g(), (r, c) => r === 3 && c === 3)).toBe(true);
  });
});
