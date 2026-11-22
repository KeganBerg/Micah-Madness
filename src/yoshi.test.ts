import { describe, expect, it } from 'vitest';
import { sceneryHTML } from './scenery';
import { ZONES, LEVELS } from './levels';
import { BADGES } from './badges';
import { yardScene } from './yard';

const spacing = 112, top = 120, height = top + LEVELS.length * spacing + 140;
const nodePos = (i: number) => ({ x: 180 + Math.sin(i * 0.95) * 105, y: height - 110 - i * spacing });
const bands = ZONES.map((_, zi) => ({
  top: zi === ZONES.length - 1 ? 0 : nodePos(zi * 5 + 4).y - spacing / 2,
  bottom: zi === 0 ? height : nodePos(zi * 5).y + spacing / 2,
}));

describe('Yoshi the chinchilla', () => {
  for (const w of [320, 390, 430]) {
    it(`shows up on the map in the Dog Park and on the walk home (width ${w})`, () => {
      const nodes = LEVELS.map((_, i) => { const p = nodePos(i); return { x: (p.x * w) / 360, y: p.y }; });
      const html = sceneryHTML({ width: w, height, bands, banners: [], nodes });
      const layers = html.split('<svg class="zone-layer"').slice(1);
      const withYoshi = layers.filter((l) => l.includes('Grace’s chinchilla')).map((l) => Number(l.match(/data-zone="(\d+)"/)![1]));
      const park = ZONES.findIndex((z) => z.name.includes('Dog Park'));
      expect(withYoshi).toContain(park);
      expect(withYoshi.length).toBeGreaterThanOrEqual(2);
    });
  }

  it('visits the yard even before anything is built', () => {
    expect(yardScene([], 'm.png')).toContain('aria-label="Yoshi the chinchilla"');
  });

  it('has a collar tag for visiting her', () => {
    const b = BADGES.find((x) => x.id === 'yoshi')!;
    expect(b.progress({ tally: { yoshi: 10 } } as never)).toEqual([10, 10]);
  });
});
