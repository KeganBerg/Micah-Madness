import { describe, expect, test } from 'vitest';
import { LEVELS, ZONES, boxTotal, mudCount, yarnCount } from './levels';

describe('levels', () => {
  test('ids run 1..N and every zone has exactly five levels', () => {
    LEVELS.forEach((lv, i) => expect(lv.id).toBe(i + 1));
    expect(LEVELS.length).toBe(ZONES.length * 5);
  });

  test('every level is well formed', () => {
    for (const lv of LEVELS) {
      for (const layer of [lv.mud, lv.yarn]) {
        if (!layer) continue;
        expect(layer).toHaveLength(8);
        for (const row of layer) expect(row).toMatch(/^[.mMy]{8}$/);
      }
      for (const g of lv.goals) {
        if (g.type === 'collect') expect(g.kind).toBeLessThan(lv.kinds);
        if (g.type === 'mud') expect(mudCount(lv)).toBeGreaterThan(0);
        if (g.type === 'yarn') expect(yarnCount(lv)).toBeGreaterThan(0);
        if (g.type === 'power') expect(g.count).toBeGreaterThan(0);
      }
      expect(lv.stars[0]).toBeLessThan(lv.stars[1]);
      expect(lv.stars[1]).toBeLessThan(lv.stars[2]);
    }
  });

  test('parcels sit on a clean cell of their own, and only where a parcel goal counts them', () => {
    for (const lv of LEVELS.filter((l) => l.boxes)) {
      expect(lv.boxes).toHaveLength(8);
      for (const row of lv.boxes!) expect(row).toMatch(/^[.xX]{8}$/);
      expect(boxTotal(lv)).toBeGreaterThan(0);
      expect(lv.goals.some((g) => g.type === 'boxes')).toBe(true);
      lv.boxes!.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch === '.') return;
        for (const layer of [lv.mud, lv.yarn, lv.leaves, lv.bubbles]) expect(layer?.[r]?.[c] ?? '.', `L${lv.id} ${r},${c}`).toBe('.');
      }));
    }
  });

  test('burrs sit on a piece nothing else pins down', () => {
    for (const lv of LEVELS.filter((l) => l.burrs)) {
      expect(lv.goals.some((g) => g.type === 'burrs')).toBe(true);
      lv.burrs!.forEach((row, r) => [...row].forEach((ch, c) => {
        if (ch !== 'r') return;
        for (const layer of [lv.yarn, lv.bubbles, lv.boxes]) expect(layer?.[r]?.[c] ?? '.', `L${lv.id} ${r},${c}`).toBe('.');
      }));
    }
  });

  test('a junk goal on the map always has raccoons to throw it', () => {
    for (const lv of LEVELS.filter((l) => l.goals.some((g) => g.type === 'junk'))) expect(lv.junk, `L${lv.id}`).toBeGreaterThan(0);
  });

  test('move limits stay in a playable range', () => {
    // Tuned with scripts/sim.test.ts. Over 45 moves a level drags; under 18 there is no room to plan.
    for (const lv of LEVELS) {
      expect(lv.moves).toBeGreaterThanOrEqual(18);
      expect(lv.moves).toBeLessThanOrEqual(45);
    }
  });

  test('deep mud counts as two washes', () => {
    const lv = LEVELS.find((l) => l.mud?.some((r) => r.includes('M')))!;
    const m = lv.mud!.join('');
    expect(mudCount(lv)).toBe([...m].filter((c) => c === 'm').length + 2 * [...m].filter((c) => c === 'M').length);
  });
});
