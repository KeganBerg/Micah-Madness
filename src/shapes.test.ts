import { describe, expect, test } from 'vitest';
import {
  applyGravity,
  bossDamage,
  createGrid,
  expandClears,
  isFixed,
  isHole,
  isLegalSwap,
  junkAtBottom,
  key,
  newJunk,
  placeBoss,
  placeHoles,
  removeBoss,
  shuffle,
  isBossCell,
} from './board';
import { LEVELS, SHAPES, isBossId, isShapedId } from './levels';

const DONUT = SHAPES.donut;

describe('shaped boards', () => {
  test('holes never move, and pieces fall straight past them', () => {
    const g = createGrid(8, 8, Math.random, 5);
    placeHoles(g, DONUT);
    // Empty the cell above the hole and the one below it in column 3.
    g[2][3] = null;
    g[5][3] = null;
    applyGravity(g, Math.random, 5);
    expect(isHole(g[3][3]) && isHole(g[4][3])).toBe(true);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) expect(g[r][c]).not.toBeNull();
  });

  test('a hole can not be swapped, blasted or shuffled away', () => {
    const g = createGrid(8, 8, Math.random, 5);
    placeHoles(g, DONUT);
    expect(isLegalSwap(g, [2, 3], [3, 3])).toBe(false);
    const all = g.flatMap((row, r) => row.map((_, c) => key(r, c)));
    expect(expandClears(g, all).cleared.has(key(3, 3))).toBe(false);
    shuffle(g);
    expect(isHole(g[3][3]) && isHole(g[4][4])).toBe(true);
  });

  test('Micah eats junk at the bottom of its own column, even above a cut-out', () => {
    const g = createGrid(8, 8, Math.random, 5);
    placeHoles(g, SHAPES.doghouse); // the door cuts rows 6-7 out of columns 3 and 4
    g[5][3] = newJunk(0);
    expect(junkAtBottom(g)).toEqual([[5, 3]]);
  });

  test('every shaped level keeps all its mud, yarn, leaves and the rest on the board', () => {
    const shaped = LEVELS.filter((l) => l.shape);
    expect(shaped.length).toBeGreaterThan(60);
    for (const lv of shaped) {
      expect(isShapedId(lv.id)).toBe(true);
      for (const layer of [lv.mud, lv.yarn, lv.leaves, lv.bubbles, lv.boxes, lv.burrs])
        layer?.forEach((row, r) => [...row].forEach((ch, c) => ch !== '.' && expect(lv.shape![r][c], `L${lv.id} ${r},${c}`).toBe('#')));
    }
  });
});

describe('area bosses', () => {
  test('the last level of every area is a boss level', () => {
    for (const lv of LEVELS.filter((l) => isBossId(l.id))) {
      expect(lv.boss, `L${lv.id}`).toBeDefined();
      expect(lv.goals[0].type).toBe('boss');
      expect(lv.shape).toBeUndefined();
    }
  });

  test('a boss never throws the same thing a goal is counting', () => {
    const clash = { raccoon: 'junk', squirrel: 'junk', tub: 'bubbles', postbox: 'boxes' } as const;
    for (const lv of LEVELS.filter((l) => l.boss)) expect(lv.goals.some((g) => g.type === clash[lv.boss!.who]), `L${lv.id}`).toBe(false);
  });

  test('only mud can sit under a boss (it washes once the boss has gone)', () => {
    for (const lv of LEVELS.filter((l) => l.boss)) {
      const [br, bc] = lv.boss!.at;
      for (let r = br; r < br + 2; r++)
        for (let c = bc; c < bc + 2; c++)
          for (const layer of [lv.yarn, lv.leaves, lv.bubbles, lv.boxes, lv.burrs]) expect(layer?.[r]?.[c] ?? '.', `L${lv.id}`).toBe('.');
    }
  });

  test('matches beside the boss hurt it, power-ups that reach it hurt it more', () => {
    const g = createGrid(8, 8, Math.random, 5);
    placeBoss(g, [1, 3]);
    expect(isFixed(g[1][3]) && isFixed(g[2][4])).toBe(true);
    expect(isLegalSwap(g, [1, 2], [1, 3])).toBe(false);
    // Three cells: two beside the boss, one not.
    expect(bossDamage(g, new Set([key(1, 2), key(3, 3), key(6, 6)]), [])).toBe(2);
    expect(bossDamage(g, new Set(), [{ pos: [2, 7], special: 'zoomRow' }])).toBe(3);
    expect(bossDamage(g, new Set(), [{ pos: [6, 7], special: 'zoomRow' }])).toBe(0);
    removeBoss(g);
    expect(g.flat().some((t) => isBossCell(t))).toBe(false);
    applyGravity(g, Math.random, 5);
    expect(g.flat().every((t) => t !== null)).toBe(true);
  });
});
