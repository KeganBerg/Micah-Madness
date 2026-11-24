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

  it('opens the Garden and Front Porch as you clear levels further along the map', () => {
    const [back, garden, porch] = AREAS;
    expect(areaOpen(back, {})).toBe(true);
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
});
