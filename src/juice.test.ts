import { describe, expect, it } from 'vitest';
import { hype } from './juice';

describe('hype', () => {
  it('stays quiet for a plain match', () => {
    expect(hype(1, 3, false, false).tier).toBe(0);
  });
  it('gets louder with every link of a cascade', () => {
    const tiers = [2, 3, 4, 5, 6, 9].map((c) => hype(c, 3, false, false).tier);
    expect(tiers).toEqual([1, 2, 3, 4, 5, 5]);
    expect(hype(6, 3, false, false).text).toBe('Micah Madness!');
  });
  it('always celebrates Micah going off and big clears', () => {
    expect(hype(1, 30, true, true)).toEqual({ tier: 4, text: 'Micah Madness!' });
    expect(hype(1, 16, false, true).tier).toBe(3);
    expect(hype(1, 10, false, false).tier).toBe(1);
    expect(hype(1, 8, false, true).text).toBe('Zoom zoom!');
  });
  it('never lowers a combo that is already bigger', () => {
    expect(hype(6, 30, true, true).tier).toBe(5);
  });
});
