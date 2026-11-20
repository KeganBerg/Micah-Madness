import { beforeEach, describe, expect, it } from 'vitest';
import { BACKUP_KEY, SAVE_VERSION, claimDaily, dailyClaimable, exportCode, freshSave, importCode, load, migrate, persist, starsToSpend, unlockedUpTo } from './save';

class MemoryStorage {
  store = new Map<string, string>();
  getItem(k: string) {
    return this.store.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
}

let mem: MemoryStorage;
beforeEach(() => {
  mem = new MemoryStorage();
  (globalThis as { localStorage?: unknown }).localStorage = mem;
});

describe('saving progress', () => {
  it('starts a new player with a fresh save', () => {
    expect(load()).toEqual(freshSave());
  });

  it('keeps stars, scores, biscuits, boosters, sound and music across reloads', () => {
    const s = load();
    s.stars[1] = 3;
    s.stars[2] = 1;
    s.best[1] = 5400;
    s.biscuits = 175;
    s.inventory.treat = 7;
    s.sound = false;
    s.music = false;
    persist(s);
    const again = load();
    expect(again).toEqual(s);
    expect(unlockedUpTo(again)).toBe(3);
  });

  it('upgrades a save from the first version without losing progress', () => {
    mem.setItem('micah-madness-save-v1', JSON.stringify({ stars: { 1: 2 }, best: { 1: 3000 }, biscuits: 140, inventory: { treat: 4 }, sound: true }));
    const s = load();
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.music).toBe(true);
    expect(s.stars[1]).toBe(2);
    expect(s.biscuits).toBe(140);
    expect(s.inventory.treat).toBe(4);
    expect(s.inventory.leash).toBe(1); // new fields get defaults
    expect(mem.getItem('micah-madness-save')).not.toBeNull();
  });

  it('repairs a damaged save instead of crashing', () => {
    mem.setItem('micah-madness-save', '{not json');
    expect(load()).toEqual(freshSave());
    expect(migrate({ stars: { 1: 9, x: 2 }, biscuits: -5 })).toMatchObject({ stars: { 1: 3 }, biscuits: 0 });
  });

  it('keeps a backup of a damaged save instead of silently replacing it', () => {
    mem.setItem('micah-madness-save', '{"stars":{"1":3},"biscu');
    load();
    expect(mem.getItem(BACKUP_KEY)).toBe('{"stars":{"1":3},"biscu');
  });

  it('backs up an older save before upgrading it, but not a current one', () => {
    const old = JSON.stringify({ version: 3, stars: { 1: 2 }, biscuits: 90 });
    mem.setItem('micah-madness-save', old);
    load();
    expect(mem.getItem(BACKUP_KEY)).toBe(old);
    mem.store.delete(BACKUP_KEY);
    load();
    expect(mem.getItem(BACKUP_KEY)).toBeNull();
  });

  it('keeps fields from a newer version, so an older open tab cannot erase them', () => {
    const newer = { ...freshSave(), version: SAVE_VERSION + 1, pets: ['cat'], biscuits: 321 };
    const s = migrate(newer);
    expect(s.version).toBe(SAVE_VERSION + 1);
    expect((s as unknown as { pets: string[] }).pets).toEqual(['cat']);
    expect(s.biscuits).toBe(321);
  });

  it('keeps coins, costumes, Magic Dust, beds, yard and collar through a save and load', () => {
    const s = load();
    s.biscuits = 999;
    s.costume = 'cap';
    s.wardrobe = ['cap', 'raincoat'];
    s.inventory.dust = 4;
    s.inventory.bed = 3;
    s.decor = ['bowl'];
    s.spentStars = 5;
    s.badges = ['first-win'];
    s.tally = { mud: 40, wins: 6 };
    s.daily = { last: '2026-11-19', day: 3 };
    s.winStreak = 2;
    persist(s);
    expect(load()).toEqual(s);
    expect(importCode(exportCode(s))).toEqual(s);
  });

  it('still runs when the browser blocks storage', () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    };
    expect(load()).toEqual(freshSave());
    expect(persist(freshSave())).toBe(false);
  });
});

describe('daily treat', () => {
  it('can be claimed once a day and builds a streak on consecutive days', () => {
    const s = freshSave();
    const d1 = new Date(2026, 10, 19, 9);
    expect(dailyClaimable(s, d1)).toBe(1);
    expect(claimDaily(s, d1)?.biscuits).toBe(20);
    expect(s.biscuits).toBe(120);
    expect(dailyClaimable(s, new Date(2026, 10, 19, 22))).toBe(0);
    const d2 = new Date(2026, 10, 20, 8);
    expect(dailyClaimable(s, d2)).toBe(2);
    claimDaily(s, d2);
    expect(s.inventory.treat).toBe(3);
  });

  it('restarts the streak after a missed day and loops after day 7', () => {
    const s = freshSave();
    s.daily = { last: '2026-11-17', day: 4 };
    expect(dailyClaimable(s, new Date(2026, 10, 19))).toBe(1);
    s.daily = { last: '2026-11-18', day: 7 };
    expect(dailyClaimable(s, new Date(2026, 10, 19))).toBe(1);
  });
});

describe('yard stars', () => {
  it('counts earned stars minus the ones spent', () => {
    const s = freshSave();
    s.stars = { 1: 3, 2: 2 };
    s.spentStars = 4;
    expect(starsToSpend(s)).toBe(1);
  });
});

describe('transfer codes', () => {
  it('round-trips a save', () => {
    const s = freshSave();
    s.stars = { 1: 3, 2: 2 };
    s.biscuits = 321;
    s.decor = ['bed'];
    const back = importCode(exportCode(s))!;
    expect(back.stars).toEqual({ 1: 3, 2: 2 });
    expect(back.biscuits).toBe(321);
    expect(back.decor).toEqual(['bed']);
  });
  it('tolerates spaces and line breaks from pasting', () => {
    const code = exportCode(freshSave());
    expect(importCode(` ${code.slice(0, 10)}\n${code.slice(10)} `)).not.toBeNull();
  });
  it('rejects anything else', () => {
    expect(importCode('hello')).toBeNull();
    expect(importCode('MICAH1-!!!')).toBeNull();
    expect(importCode('MICAH1-' + btoa('[1,2]'))).not.toBeNull(); // migrate repairs odd shapes
  });
});
