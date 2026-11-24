import { describe, expect, it } from 'vitest';
import { AREAS, DECOR, areaOpen, museum, yardScene, yardTime } from './yard';
import { LEVELS } from './levels';
import { SNACKS } from './snacks';

describe("Micah's Yard", () => {
  it('has unique items that fit inside the scene', () => {
    expect(new Set(DECOR.map((d) => d.id)).size).toBe(DECOR.length);
    for (const d of DECOR) {
      expect(d.x).toBeGreaterThanOrEqual(0);
      expect(d.x + d.w).toBeLessThanOrEqual(360);
      expect(d.y + d.w * 0.9).toBeLessThanOrEqual(300);
    }
  });

  it('keeps stars worth earning: the whole yard costs most, but not all, of the stars on the map', () => {
    const total = DECOR.reduce((n, d) => n + d.cost, 0);
    const max = LEVELS.length * 3;
    expect(total).toBeGreaterThan(max * 0.5);
    expect(total).toBeLessThan(max * 0.8);
  });

  it('opens Yoshi’s Corner, the Garden and the Front Porch as you clear levels further along the map', () => {
    const [back, yoshi, garden, porch] = AREAS;
    expect(areaOpen(back, {})).toBe(true);
    expect(areaOpen(yoshi, { 14: 3 })).toBe(false);
    expect(areaOpen(yoshi, { 15: 1 })).toBe(true);
    expect(areaOpen(garden, { 29: 3 })).toBe(false);
    expect(areaOpen(garden, { 30: 1 })).toBe(true);
    expect(areaOpen(porch, { 30: 3 })).toBe(false);
    expect(areaOpen(porch, { 60: 2 })).toBe(true);
    for (const a of AREAS) expect(DECOR.some((d) => d.area === a.id)).toBe(true);
  });

  it('follows the clock: day, sunset, night', () => {
    const at = (h: number) => yardTime(new Date(2026, 10, 24, h, 30));
    expect(at(6)).toBe('night');
    expect(at(7)).toBe('day');
    expect(at(16)).toBe('day');
    expect(at(17)).toBe('dusk');
    expect(at(19)).toBe('dusk');
    expect(at(20)).toBe('night');
  });

  it('gives Yoshi her own things in her corner, with Grace’s house behind', () => {
    const mine = DECOR.filter((d) => d.area === 'yoshi').map((d) => d.id);
    expect(mine).toEqual(expect.arrayContaining(['hidey', 'hayrack', 'wheel', 'ledges', 'chews', 'blanket']));
    const corner = yardScene(mine, 'm.png', { area: 'yoshi', time: 'day', ate: [] });
    expect(corner).toContain('wheel-spin');
    expect(corner).toContain('data-id="blanket"');
    expect(corner).not.toContain('yard-ark');
    for (const t of ['day', 'dusk', 'night'] as const) expect(yardScene(mine, 'm.png', { area: 'yoshi', time: t, ate: [], snowy: true })).toContain('xmas-lights');
  });

  it('shows Noah’s Ark over the back fence only', () => {
    expect(yardScene([], 'm.png', { area: 'back', time: 'day', ate: [] })).toContain('yard-ark');
    expect(yardScene([], 'm.png', { area: 'garden', time: 'day', ate: [] })).not.toContain('yard-ark');
  });

  it('puts what Micah ate on the shelf, with a ? for the rest', () => {
    const empty = museum([]);
    expect(empty.match(/>\?</g)?.length).toBe(Math.min(10, SNACKS.length));
    const two = museum(['sock', 'duck']);
    expect(two.match(/>\?</g)?.length).toBe(Math.min(10, SNACKS.length) - 2);
  });

  it('draws only the current part of the yard, and fireflies at night', () => {
    const all = DECOR.map((d) => d.id);
    const porch = yardScene(all, 'm.png', { area: 'porch', time: 'night', ate: [] });
    expect(porch).toContain('data-id="swing"');
    expect(porch).not.toContain('data-id="doghouse"');
    expect(porch).toContain('firefly');
    expect(yardScene(all, 'm.png', { area: 'porch', time: 'day', ate: [] })).not.toContain('firefly');
  });

  it('snows in winter: a snowman in the Backyard, snow on things, no fireflies', () => {
    const all = DECOR.map((d) => d.id);
    const winter = yardScene(all, 'm.png', { area: 'back', time: 'night', ate: [], snowy: true });
    expect(winter).toContain('data-id="snowman"');
    expect(winter).toContain('snow-cap');
    expect(winter).not.toContain('firefly');
    expect(winter).toContain('xmas-lights');
    // Off by day, on from sunset.
    const day = yardScene(all, 'm.png', { area: 'back', time: 'day', ate: [], snowy: true });
    expect(day).toContain('bulb off');
    expect(day).not.toContain('xmas-lights lit');
    expect(yardScene(all, 'm.png', { area: 'back', time: 'dusk', ate: [], snowy: true })).toContain('xmas-lights lit');
    expect(winter).toContain('bulb-glow');
    const summer = yardScene(all, 'm.png', { area: 'back', time: 'day', ate: [] });
    expect(summer).not.toContain('snowman');
    expect(summer).not.toContain('snow-cap');
    expect(summer).not.toContain('xmas-lights');
    expect(yardScene(all, 'm.png', { area: 'garden', time: 'day', ate: [], snowy: true })).not.toContain('snowman');
  });
});
