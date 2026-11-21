import { describe, expect, it } from 'vitest';
import { spreadLeaf } from './board';
import { LEVELS, leafCount } from './levels';

const grid = (rows: string[]) => rows.map((r) => [...r].map((ch) => ch === 'l'));

describe('fallen leaves', () => {
  it('spread to a free neighbour of an existing leaf', () => {
    const leaf = grid(['l..', '...', '...']);
    const p = spreadLeaf(leaf, () => false, () => 0)!;
    expect(Math.abs(p[0]) + Math.abs(p[1])).toBe(1);
    expect(leaf[p[0]][p[1]]).toBe(true);
  });
  it('never land on a blocked cell', () => {
    const leaf = grid(['l..', '...', '...']);
    expect(spreadLeaf(leaf, () => true)).toBeNull();
    for (let i = 0; i < 20; i++) spreadLeaf(leaf, (_r, c) => c === 2);
    expect(leaf.every((row) => !row[2])).toBe(true);
  });
  it('do nothing with no leaves left', () => {
    expect(spreadLeaf(grid(['...', '...']))).toBeNull();
  });
  it('every leaf level starts with some leaves', () => {
    for (const lv of LEVELS) if (lv.goals.some((g) => g.type === 'leaves')) expect(leafCount(lv)).toBeGreaterThan(0);
  });
});

describe('leaf layouts', () => {
  it('never start a leaf on top of mud', () => {
    for (const lv of LEVELS) {
      lv.leaves?.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch === 'l' && lv.mud?.[r]?.[c] && lv.mud[r][c] !== '.') throw new Error(`L${lv.id} has a leaf on mud at ${r},${c}`);
      }));
    }
  });
});
