import { describe, expect, it } from 'vitest';
import { sceneryHTML, THEMES } from './scenery';
import { ZONES, LEVELS } from './levels';

// Same map geometry as showMap() in main.ts.
const spacing = 112, top = 120, height = top + LEVELS.length * spacing + 140;
const nodePos = (i: number) => ({ x: 180 + Math.sin(i * 0.95) * 105, y: height - 110 - i * spacing });
const bands = ZONES.map((_, zi) => ({
  top: zi === ZONES.length - 1 ? 0 : nodePos(zi * 5 + 4).y - spacing / 2,
  bottom: zi === 0 ? height : nodePos(zi * 5).y + spacing / 2,
}));

describe('map scenery', () => {
  it('has a theme for every area', () => {
    expect(THEMES.length).toBe(ZONES.length);
  });

  for (const w of [320, 360, 390, 430]) {
    it(`puts the birthday banner only in Micah's Birthday, clear of levels (width ${w})`, () => {
      const nodes = LEVELS.map((_, i) => { const p = nodePos(i); return { x: (p.x * w) / 360, y: p.y }; });
      const html = sceneryHTML({ width: w, height, bands, banners: [], nodes });
      const birthday = ZONES.findIndex((z) => z.name.includes('Birthday'));
      const layers = html.split('<svg class="zone-layer"').slice(1);
      expect(layers.length).toBe(ZONES.length);
      const b = bands[birthday];
      for (const layer of layers) {
        const zi = Number(layer.match(/data-zone="(\d+)"/)![1]);
        // Each flag: <g transform="translate(x y)"><path .../><text ...>L</text></g>
        const flags = [...layer.matchAll(/translate\(([\d.]+) ([\d.]+)\)"><path[^>]*\/>\s*<text[^>]*>(.)<\/text>/g)];
        const word = flags.map((m) => m[3]).join('');
        expect(word, `area ${zi + 1}`).toBe(zi === birthday ? 'HAPPYBIRTHDAYMICAH!' : '');
        for (const m of flags) {
          const x = Number(m[1]), y = Number(m[2]);
          expect(y).toBeGreaterThan(b.top);
          expect(y).toBeLessThan(b.bottom);
          for (const n of nodes) expect(Math.hypot(n.x - x, n.y - y), `flag near level at ${n.x},${n.y}`).toBeGreaterThan(40);
        }
      }
    });
  }
});
