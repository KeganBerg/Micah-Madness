import { describe, expect, it } from 'vitest';
import { chordTones, score, tuneFor } from './sound';

const tunes = [tuneFor('map'), ...[0, 1, 2, 3].map((z) => tuneFor('level', z))];

describe('music', () => {
  it('every bar of every tune adds up and chords match the melody length', () => {
    for (const t of tunes) expect(() => score(t)).not.toThrow();
  });

  it('melody notes on beats 1 and 3 belong to the chord underneath', () => {
    for (const t of tunes) {
      const s = score(t);
      const clashes: string[] = [];
      for (const h of s.melody) {
        if (h.step % 8 !== 0) continue;
        const c = s.harmony[Math.floor(h.step / 8)];
        const pcs = c.tones.map((iv) => (c.root + iv) % 12);
        if (!pcs.includes(h.midi % 12)) clashes.push(`${t.name} bar ${Math.floor(h.step / 16) + 1} beat ${(h.step % 16) / 4 + 1}`);
      }
      expect(clashes).toEqual([]);
    }
  });

  it('the A half ends home or on V, and the loop ends on V to turn back round', () => {
    for (const t of tunes) {
      expect([0, 9, 7, 4]).toContain(chordTones(t.chords[7].split(' ').pop()!).root);
      const last = chordTones(t.chords[15].split(' ').pop()!);
      expect([7, 4]).toContain(last.root); // G (V) or E (V of A minor)
    }
  });

  it('zones 5-8 replay the themes a step higher and quicker', () => {
    expect(tuneFor('level', 4).key).toBe(tuneFor('level', 0).key + 2);
    expect(tuneFor('level', 4).bpm).toBeGreaterThan(tuneFor('level', 0).bpm);
  });
});
