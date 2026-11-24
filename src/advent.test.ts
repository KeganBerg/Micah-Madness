import { describe, expect, it } from 'vitest';
import { ADVENT, ADVENT_GIFT, adventDay, adventReady, adventText, openAdvent } from './advent';
import { COSTUMES } from './costumes';
import { freshSave, mergeSaves } from './save';
import { GIFT_AT, yardScene } from './yard';

const dec = (d: number, h = 10) => new Date(2026, 11, d, h);

describe("Micah's advent calendar", () => {
  it('has a present for each of 1 to 24 December and nothing else', () => {
    expect(ADVENT).toHaveLength(24);
    expect(adventDay(new Date(2026, 10, 30))).toBeNull();
    expect(adventDay(dec(1))).toBe(1);
    expect(adventDay(dec(24))).toBe(24);
    expect(adventDay(dec(25))).toBeNull();
    expect(adventDay(new Date(2026, 10, 24), true)).toBe(24);
    expect(adventDay(new Date(2026, 10, 3), 7)).toBe(7);
  });

  it('opens one present a day and pays it out', () => {
    const s = freshSave();
    const before = s.biscuits;
    expect(adventReady(s, dec(1))).toBe(1);
    expect(openAdvent(s, dec(1))?.day).toBe(1);
    expect(s.biscuits).toBe(before + 20);
    expect(adventReady(s, dec(1, 22))).toBeNull();
    expect(openAdvent(s, dec(1, 22))).toBeNull();
    expect(openAdvent(s, dec(2))?.prize).toMatchObject({ kind: 'booster', id: 'treat' });
    expect(s.inventory.treat).toBeGreaterThanOrEqual(1);
  });

  it('gives the Elf Hat on Christmas Eve, and opened days survive a cloud merge', () => {
    const s = freshSave();
    const got = openAdvent(s, dec(24));
    expect(got?.prize.kind).toBe('outfit');
    expect(s.wardrobe).toContain(ADVENT_GIFT);
    expect(COSTUMES.some((c) => c.id === ADVENT_GIFT)).toBe(true);
    const merged = mergeSaves(freshSave(), s);
    expect(adventReady(merged, dec(24, 20))).toBeNull();
  });

  it('keeps every line short', () => {
    for (const p of ADVENT) expect(adventText(p).length).toBeLessThanOrEqual(34);
  });

  it('draws the present in the Backyard only, inside the scene', () => {
    const opts = { time: 'day' as const, ate: [], gift: 5, snowy: true };
    expect(yardScene([], '', { ...opts, area: 'back' })).toContain('advent-gift');
    expect(yardScene([], '', { ...opts, area: 'garden' })).not.toContain('advent-gift');
    expect(yardScene([], '', { ...opts, area: 'back', gift: null })).not.toContain('advent-gift');
    expect(GIFT_AT[0]).toBeGreaterThan(20);
    expect(GIFT_AT[0]).toBeLessThan(340);
  });
});
