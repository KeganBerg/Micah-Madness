import { describe, expect, it } from 'vitest';
import { LOOKS, backdropHTML } from './backdrop';
import { ZONES } from './levels';

describe('level backdrop', () => {
  it('has a look for every area', () => {
    expect(LOOKS.length).toBe(ZONES.length);
  });

  it('draws Micah, something to chase and a hurdle in every area', () => {
    ZONES.forEach((_, z) => {
      const html = backdropHTML(z);
      expect(html).toContain('bd-runner');
      expect(html).toContain('bd-chase');
      expect(html).toContain('bd-hurdle');
      expect(html.match(/class="bd-prop"/g)).toHaveLength(5);
      // Texture tiles live in double-quoted style attributes: each url() must close inside its attribute.
      for (const m of html.matchAll(/style="([^"]*)"/g)) {
        expect(m[1].split('url(&quot;').length).toBe(m[1].split('&quot;)').length);
      }
    });
  });

  it('is hidden from screen readers', () => {
    expect(backdropHTML(0)).toMatch(/^<div class="backdrop" aria-hidden="true"/);
  });
});
