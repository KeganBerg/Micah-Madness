import { describe, expect, it } from 'vitest';
import { key, popBubbles } from './board';
import { LEVELS, bubbleCount } from './levels';

const grid = (rows: string[]) => rows.map((r) => [...r].map((ch) => ch === 'b'));

describe('soap bubbles', () => {
  it('pop on the cleared cell and the four cells beside it', () => {
    const b = grid(['bbb', 'bbb', 'bbb']);
    const popped = popBubbles(b, [key(1, 1)]);
    expect(popped).toHaveLength(5);
    expect(b.map((r) => r.map((on) => (on ? 'b' : '.')).join(''))).toEqual(['b.b', '...', 'b.b']);
  });
  it('do not pop diagonally, and each bubble pops once', () => {
    const b = grid(['b..', '...', '..b']);
    expect(popBubbles(b, [key(1, 1)])).toHaveLength(0);
    const c = grid(['.b.', '...', '...']);
    expect(popBubbles(c, [key(0, 0), key(0, 2), key(1, 1)])).toHaveLength(1);
  });
  it('every bubble level starts with some bubbles', () => {
    for (const lv of LEVELS) if (lv.goals.some((g) => g.type === 'bubbles')) expect(bubbleCount(lv)).toBeGreaterThan(0);
  });
});

describe('layer layouts', () => {
  const at = (rows: string[] | undefined, r: number, c: number) => rows?.[r]?.[c] ?? '.';
  it('never stack a bubble on yarn or under a leaf', () => {
    for (const lv of LEVELS) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const where = `level ${lv.id} row ${r} col ${c}`;
          if (at(lv.bubbles, r, c) === 'b') expect(at(lv.yarn, r, c), where).toBe('.');
          if (at(lv.leaves, r, c) === 'l') expect(at(lv.bubbles, r, c), where).toBe('.');
        }
      }
    }
  });
  it('bubble layouts have 8 rows of 8', () => {
    for (const lv of LEVELS) if (lv.bubbles) expect(lv.bubbles.every((row) => row.length === 8) && lv.bubbles.length === 8).toBe(true);
  });
});
