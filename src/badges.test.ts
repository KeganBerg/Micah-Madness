import { describe, expect, it } from 'vitest';
import { BADGES, awardBadges, bump } from './badges';
import { freshSave } from './save';

describe('collar tags', () => {
  it('awards nothing on a fresh save', () => {
    expect(awardBadges(freshSave())).toEqual([]);
  });
  it('pays out once when earned', () => {
    const s = freshSave();
    s.stars = { 1: 2 };
    const before = s.biscuits;
    const got = awardBadges(s);
    expect(got.map((b) => b.id)).toEqual(['first']);
    expect(s.biscuits).toBe(before + BADGES[0].reward);
    expect(awardBadges(s)).toEqual([]);
    expect(s.biscuits).toBe(before + BADGES[0].reward);
  });
  it('counts tallies toward progress', () => {
    const s = freshSave();
    for (let i = 0; i < 10; i++) bump(s, 'micah');
    expect(awardBadges(s).map((b) => b.id)).toContain('micah');
  });
  it('has unique ids', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});
