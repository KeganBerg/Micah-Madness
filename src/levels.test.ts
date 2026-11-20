import { describe, expect, test } from 'vitest';
import { LEVELS, ZONES, mudCount, yarnCount } from './levels';

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

  test('deep mud counts as two washes', () => {
    const lv = LEVELS.find((l) => l.mud?.some((r) => r.includes('M')))!;
    const m = lv.mud!.join('');
    expect(mudCount(lv)).toBe([...m].filter((c) => c === 'm').length + 2 * [...m].filter((c) => c === 'M').length);
  });
});
