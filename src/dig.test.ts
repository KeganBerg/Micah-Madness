import { describe, expect, it } from 'vitest';
import { claimDig, digSpot, digState, DIG_SPOTS, ensureBuried, prizeFor } from './dig';
import { freshSave, mergeSaves, migrate } from './save';

const at = (d: number, h = 10) => new Date(2026, 10, d, h);

describe("Micah's dig spot", () => {
  it('buries something on the first visit, ready from the next day', () => {
    const s = freshSave();
    expect(digState(s, at(24))).toBe('none');
    expect(ensureBuried(s, at(24))).toBe(true);
    expect(ensureBuried(s, at(24))).toBe(false);
    expect(digState(s, at(24, 23))).toBe('fresh');
    expect(claimDig(s, at(24, 23))).toBeNull();
    expect(digState(s, at(25, 7))).toBe('ready');
  });

  it('pays one prize a day, then buries the next one', () => {
    const s = freshSave();
    ensureBuried(s, at(20));
    const before = s.biscuits + Object.values(s.inventory).reduce((a, b) => a + b, 0);
    expect(claimDig(s, at(23))).not.toBeNull();
    const after = s.biscuits + Object.values(s.inventory).reduce((a, b) => a + b, 0);
    expect(after).toBeGreaterThan(before);
    expect(claimDig(s, at(23, 22))).toBeNull();
    expect(s.tally.digs).toBe(1);
    expect(digState(s, at(24))).toBe('ready');
  });

  it('gives the same prize and spot for the same day', () => {
    expect(prizeFor('2026-11-24')).toEqual(prizeFor('2026-11-24'));
    expect(digSpot('2026-11-24')).toEqual(digSpot('2026-11-24'));
    const kinds = new Set(Array.from({ length: 60 }, (_, i) => prizeFor(`2026-01-${i}`).kind));
    expect(kinds).toEqual(new Set(['biscuits', 'booster', 'find']));
    for (const [x, y] of DIG_SPOTS) {
      expect(x).toBeGreaterThan(20);
      expect(x).toBeLessThan(340);
      expect(y).toBeLessThanOrEqual(292);
    }
  });

  it('keeps the dig day through migrate and takes the later one when merging', () => {
    const a = freshSave();
    a.dig = '2026-11-20';
    expect(migrate(JSON.parse(JSON.stringify(a))).dig).toBe('2026-11-20');
    expect(migrate({ dig: 'nonsense' }).dig).toBe('');
    const b = freshSave();
    b.dig = '2026-11-24';
    expect(mergeSaves(a, b).dig).toBe('2026-11-24');
  });
});
