import { describe, expect, it } from 'vitest';
import {
  ALL_ITEMS,
  CELLS,
  CHAINS,
  cleanCraft,
  drop,
  feedMicah,
  fillOrder,
  freshCraft,
  makeOrder,
  orderReady,
  parse,
  placeMakers,
  spawn,
  topUpOrders,
} from './craft';
import { DECOR } from './yard';
import { freshSave, mergeSaves, migrate } from './save';

const empty = () => {
  const s = freshCraft();
  s.cells = Array(CELLS).fill('');
  return s;
};

describe('craft chains', () => {
  it('every chain ends in a real Yard item, and every item has art', () => {
    for (const c of CHAINS) {
      expect(DECOR.some((d) => d.id === c.decor)).toBe(true);
      for (const it of [c.maker, ...c.items]) expect(it.svg.length).toBeGreaterThan(20);
    }
    expect(ALL_ITEMS).toBe(30);
  });
});

describe('the board', () => {
  it('starts with two makers, boxed things up top and a few loose ones', () => {
    const s = freshCraft();
    expect(s.cells.filter((c) => c.startsWith('m:'))).toEqual(['m:toy', 'm:garden']);
    expect(s.cells.slice(0, 28).every((c) => c.endsWith(':b'))).toBe(true);
    expect(s.cells.filter((c) => /^(toy|garden):1$/.test(c)).length).toBe(4);
  });

  it('two of the same craft into the next one', () => {
    const s = empty();
    s.cells[0] = 'toy:1';
    s.cells[1] = 'toy:1';
    const r = drop(s, 0, 1);
    expect(r).toMatchObject({ kind: 'merge', code: 'toy:2', fresh: true, unboxed: false });
    expect(s.cells[0]).toBe('');
    expect(s.cells[1]).toBe('toy:2');
    expect(s.merges).toBe(1);
    expect(s.found).toContain('toy:2');
  });

  it('a match dropped on a boxed thing opens it; a boxed thing cannot be dragged or swapped', () => {
    const s = empty();
    s.cells[0] = 'garden:2';
    s.cells[1] = 'garden:2:b';
    s.cells[2] = 'toy:1';
    expect(drop(s, 1, 0).kind).toBe('none');
    expect(drop(s, 2, 1).kind).toBe('none');
    expect(drop(s, 0, 1)).toMatchObject({ kind: 'merge', code: 'garden:3', unboxed: true });
    expect(s.cells[1]).toBe('garden:3');
  });

  it('moves onto empty cells and swaps different things', () => {
    const s = empty();
    s.cells[0] = 'toy:1';
    s.cells[1] = 'garden:1';
    expect(drop(s, 0, 5).kind).toBe('move');
    expect(s.cells[5]).toBe('toy:1');
    expect(drop(s, 5, 1).kind).toBe('swap');
    expect([s.cells[1], s.cells[5]]).toEqual(['toy:1', 'garden:1']);
  });

  it('the last thing in a chain leaves the board for the Yard', () => {
    const s = empty();
    s.cells[3] = 'junk:5';
    s.cells[4] = 'junk:5';
    const r = drop(s, 3, 4);
    expect(r.kind === 'merge' && r.finished?.decor).toBe('tireswing');
    expect(s.cells[4]).toBe('');
  });

  it('makers fill the nearest empty cell, and say so when the board is full', () => {
    const s = empty();
    s.cells[57] = 'm:toy';
    const got = spawn(s, 57, () => 0.9);
    expect(got).toEqual({ at: 50, code: 'toy:1' }); // straight above the maker
    expect(spawn(s, 57, () => 0.01)?.code).toBe('toy:2');
    s.cells = s.cells.map((c) => c || 'garden:1');
    expect(spawn(s, 57)).toBeNull();
  });

  it('Micah eats loose things, never makers or boxes', () => {
    const s = empty();
    s.cells[0] = 'snack:4';
    s.cells[1] = 'm:snack';
    s.cells[2] = 'toy:1:b';
    expect(feedMicah(s, 0)?.name).toBe('Taco');
    expect(feedMicah(s, 1)).toBeNull();
    expect(feedMicah(s, 2)).toBeNull();
    expect(s.cells.slice(0, 3)).toEqual(['', 'm:snack', 'toy:1:b']);
  });

  it('makers open with map progress', () => {
    const s = freshCraft();
    expect(placeMakers(s, {}).placed).toEqual([]);
    const stars: Record<number, number> = {};
    for (let i = 1; i <= 41; i++) stars[i] = 1;
    const { placed } = placeMakers(s, stars);
    expect(placed.map((c) => c.id)).toEqual(['snack', 'hay', 'junk']);
    expect(s.cells.filter((c) => c.startsWith('m:')).length).toBe(5);
    expect(placeMakers(s, stars).placed).toEqual([]);
  });
});

describe('orders', () => {
  it('keeps three on the go, never asks for a Yard item, and pays when filled', () => {
    const s = empty();
    topUpOrders(s, {});
    expect(s.orders.length).toBe(3);
    for (const o of s.orders) for (const w of o.wants) {
      const p = parse(w);
      expect(['toy', 'garden']).toContain(p.chain!.id);
      expect(p.tier).toBeLessThan(p.chain!.items.length);
    }
    const o = s.orders[0];
    expect(orderReady(s, o)).toBe(false);
    o.wants.forEach((w, i) => (s.cells[10 + i] = w));
    expect(orderReady(s, o)).toBe(true);
    expect(fillOrder(s, 0)).toBe(o.reward);
    expect(s.orders.length).toBe(2);
    expect(s.cells.slice(10, 13).every((c) => c === '')).toBe(true);
  });

  it('boxed things do not count toward an order', () => {
    const s = empty();
    s.orders = [{ who: 'micah', wants: ['toy:2'], reward: 5 }];
    s.cells[0] = 'toy:2:b';
    expect(orderReady(s, s.orders[0])).toBe(false);
    expect(fillOrder(s, 0)).toBe(0);
  });

  it('asks a little past what has been found', () => {
    const s = empty();
    s.filled = 10;
    s.found = ['toy:1', 'toy:2', 'toy:3', 'toy:4'];
    const toys = [CHAINS[0]];
    for (let k = 0; k < 40; k++) {
      const o = makeOrder(s, toys, Math.random);
      for (const w of o.wants) expect(parse(w).tier).toBeGreaterThanOrEqual(3);
      for (const w of o.wants) expect(parse(w).tier).toBeLessThanOrEqual(5);
    }
  });
});

describe('saving', () => {
  it('cleans damaged boards and keeps one of each maker', () => {
    const c = cleanCraft({ cells: ['toy:1', 'm:toy', 'm:toy', 'nope:3', 'toy:99', 5], orders: [{ who: 'x', wants: ['toy:2', 'bad'], reward: 1e9 }], found: ['toy:1', 'toy:1', 'x'] })!;
    expect(c.cells.length).toBe(CELLS);
    expect(c.cells.slice(0, 6)).toEqual(['toy:1', 'm:toy', '', '', '', '']);
    expect(c.orders).toEqual([{ who: 'micah', wants: ['toy:2'], reward: 500 }]);
    expect(c.found).toEqual(['toy:1']);
    expect(cleanCraft(null)).toBeUndefined();
  });

  it('a save keeps its workshop through migrate, and a cloud merge keeps every discovery', () => {
    const a = freshSave();
    a.craft = freshCraft();
    a.craft.found.push('toy:3');
    a.savedAt = 10;
    const b = freshSave();
    b.craft = freshCraft();
    b.craft.found.push('garden:4');
    b.savedAt = 20;
    expect(migrate(JSON.parse(JSON.stringify(a))).craft?.found).toContain('toy:3');
    const m = mergeSaves(a, b);
    expect(m.craft!.found).toEqual(expect.arrayContaining(['toy:3', 'garden:4']));
    expect(mergeSaves(freshSave(), freshSave()).craft).toBeUndefined();
  });
});
