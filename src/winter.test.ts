import { describe, expect, it } from 'vitest';
import { freshSave } from './save';
import { ANTLERS_AT, WINTER_COUNT, WINTER_LEVELS, claimWinter, winterNext, winterOpen, winterSeason, winterWon } from './winter';

const dec = new Date(2026, 11, 10);
const jan = new Date(2027, 0, 3);
const july = new Date(2027, 6, 1);
const ready = () => {
  const s = freshSave();
  for (let i = 1; i <= 10; i++) s.stars[i] = 3;
  return s;
};

describe("Micah's Winter", () => {
  it('runs from December to early January', () => {
    expect(winterSeason(dec)).toBe(2026);
    expect(winterSeason(jan)).toBe(2026);
    expect(winterSeason(new Date(2027, 0, 7))).toBeNull();
    expect(winterSeason(july)).toBeNull();
  });
  it('opens in season once ten levels are cleared, or early as a preview', () => {
    expect(winterOpen(freshSave(), dec)).toBe(false);
    expect(winterOpen(ready(), dec)).toBe(true);
    expect(winterOpen(ready(), july)).toBe(false);
    expect(winterOpen(ready(), july, true)).toBe(true);
  });
  it('has fifteen snowy levels with unique ids', () => {
    expect(WINTER_COUNT).toBe(15);
    expect(new Set(WINTER_LEVELS.map((l) => l.id)).size).toBe(15);
    expect(WINTER_LEVELS.every((l) => l.snow)).toBe(true);
  });
  it('pays once per level and hands out antlers and the hat', () => {
    const s = ready();
    const b = s.biscuits;
    expect(claimWinter(s, 1, dec)?.biscuits).toBe(25);
    expect(claimWinter(s, 1, dec)).toBeNull();
    expect(s.biscuits).toBe(b + 25);
    expect(winterNext(s, dec)).toBe(2);
    let antlers = false, hat = false;
    for (let n = 2; n <= WINTER_COUNT; n++) {
      const p = claimWinter(s, n, dec)!;
      if (p.antlers) { antlers = true; expect(p.won).toBe(ANTLERS_AT); }
      if (p.hat) hat = true;
    }
    expect(antlers && hat).toBe(true);
    expect(s.wardrobe).toEqual(expect.arrayContaining(['antlers', 'santa']));
    expect(winterNext(s, dec)).toBe(0);
  });
  it('starts fresh next winter but keeps the outfits', () => {
    const s = ready();
    for (let n = 1; n <= WINTER_COUNT; n++) claimWinter(s, n, dec);
    const next = new Date(2027, 11, 2);
    expect(winterWon(s, next)).toEqual([]);
    expect(winterNext(s, next)).toBe(1);
    expect(s.wardrobe).toContain('santa');
  });
});
