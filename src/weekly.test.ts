import { describe, expect, it } from 'vitest';
import { freshSave, migrate } from './save';
import { STAMPS_FOR_COAT, WEEKLY_ID, claimWeekly, weekKey, weeklyLevel, weeklyOpen, weeklyWonThisWeek } from './weekly';

const cleared = (n: number) => {
  const s = freshSave();
  for (let i = 1; i <= n; i++) s.stars[i] = 2;
  return s;
};

describe('Weekly Walk', () => {
  it('weeks start on Monday', () => {
    expect(weekKey(new Date(2026, 10, 20))).toBe('2026-11-16'); // a Friday
    expect(weekKey(new Date(2026, 10, 16))).toBe('2026-11-16'); // the Monday
    expect(weekKey(new Date(2026, 10, 22))).toBe('2026-11-16'); // the Sunday
    expect(weekKey(new Date(2026, 10, 23))).toBe('2026-11-23');
  });

  it('opens after level 10 and remixes a cleared level', () => {
    expect(weeklyOpen(cleared(9))).toBe(false);
    const s = cleared(12);
    expect(weeklyOpen(s)).toBe(true);
    const lv = weeklyLevel(s, new Date(2026, 10, 20));
    expect(lv.id).toBe(WEEKLY_ID);
    expect(lv.baseId).toBeGreaterThanOrEqual(6);
    expect(lv.baseId).toBeLessThanOrEqual(12);
    for (const g of lv.goals) if (g.type === 'collect') expect(g.kind).toBeLessThan(lv.kinds);
    // Same week, same level.
    expect(weeklyLevel(s, new Date(2026, 10, 17)).baseId).toBe(lv.baseId);
  });

  it('pays once a week and gives the coat at four stamps', () => {
    const s = cleared(12);
    const start = s.biscuits;
    expect(claimWeekly(s, new Date(2026, 10, 20))).not.toBeNull();
    expect(claimWeekly(s, new Date(2026, 10, 21))).toBeNull();
    expect(weeklyWonThisWeek(s, new Date(2026, 10, 21))).toBe(true);
    expect(s.biscuits).toBeGreaterThan(start);
    for (let w = 1; w < STAMPS_FOR_COAT; w++) claimWeekly(s, new Date(2026, 10, 20 + w * 7));
    expect(s.weekly.stamps).toBe(STAMPS_FOR_COAT);
    expect(s.wardrobe).toContain('raincoat');
  });

  it('old saves get an empty weekly record', () => {
    expect(migrate({ stars: { 1: 3 } }).weekly).toEqual({ won: '', stamps: 0 });
  });
});
