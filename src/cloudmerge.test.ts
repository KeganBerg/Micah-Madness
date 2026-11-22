import { describe, expect, it } from 'vitest';
import { freshSave, mergeSaves } from './save';

describe('mergeSaves', () => {
  it('keeps progress made on either device', () => {
    const phone = freshSave();
    phone.stars = { 1: 3, 2: 1 };
    phone.best = { 1: 9000, 2: 2000 };
    phone.badges = ['mud'];
    phone.biscuits = 80;
    phone.savedAt = 100;
    const ipad = freshSave();
    ipad.stars = { 1: 2, 2: 3, 3: 2 };
    ipad.best = { 1: 5000, 2: 7000, 3: 4000 };
    ipad.badges = ['zoom'];
    ipad.decor = ['doghouse'];
    ipad.biscuits = 150;
    ipad.music = false;
    ipad.savedAt = 200;
    const m = mergeSaves(phone, ipad);
    expect(m.stars).toEqual({ 1: 3, 2: 3, 3: 2 });
    expect(m.best).toEqual({ 1: 9000, 2: 7000, 3: 4000 });
    expect(m.badges.sort()).toEqual(['mud', 'zoom']);
    expect(m.decor).toEqual(['doghouse']);
    expect(m.biscuits).toBe(150);
    expect(m.music).toBe(false); // settings come from the newer copy
    expect(m.savedAt).toBe(200);
  });

  it('combines winter wins in the same season and takes the newer season otherwise', () => {
    const a = freshSave();
    const b = freshSave();
    a.winter = { season: 2026, won: [1, 2] };
    b.winter = { season: 2026, won: [2, 5] };
    expect(mergeSaves(a, b).winter).toEqual({ season: 2026, won: [1, 2, 5] });
    b.winter = { season: 2027, won: [1] };
    expect(mergeSaves(a, b).winter).toEqual({ season: 2027, won: [1] });
  });

  it('keeps the later daily claim and weekly win', () => {
    const a = freshSave();
    const b = freshSave();
    a.daily = { last: '2026-11-20', day: 3 };
    b.daily = { last: '2026-11-21', day: 4 };
    a.weekly = { won: '2026-11-16', stamps: 2 };
    b.weekly = { won: '2026-11-09', stamps: 1 };
    const m = mergeSaves(a, b);
    expect(m.daily).toEqual({ last: '2026-11-21', day: 4 });
    expect(m.weekly).toEqual({ won: '2026-11-16', stamps: 2 });
  });
});
