import { describe, expect, it } from 'vitest';
import { freshSave } from './save';
import { LEVELS } from './levels';
import { STICKERS, freshStickers, markStickersSeen, stickersEarned } from './stickers';

describe('sticker book', () => {
  it('earns a sticker only when every level in its area is cleared', () => {
    const s = freshSave();
    for (let i = 1; i <= 4; i++) s.stars[i] = 1;
    expect(stickersEarned(s)).toEqual([]);
    s.stars[5] = 1;
    expect(stickersEarned(s).map((x) => x.id)).toEqual(['morning']);
  });
  it('shows a new sticker once', () => {
    const s = freshSave();
    for (const l of LEVELS) s.stars[l.id] = 3;
    expect(freshStickers(s).length).toBe(STICKERS.length);
    markStickersSeen(s, freshStickers(s));
    expect(freshStickers(s)).toEqual([]);
  });
  it('gives every sticker a different area', () => {
    expect(new Set(STICKERS.map((s) => s.area)).size).toBe(STICKERS.length);
  });
});
