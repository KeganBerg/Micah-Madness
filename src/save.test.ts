import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_VERSION, claimDaily, dailyClaimable, freshSave, load, migrate, persist, starsToSpend, unlockedUpTo } from './save';

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

  it('keeps stars, scores, biscuits, boosters and sound across reloads', () => {
    const s = load();
    s.stars[1] = 3;
    s.stars[2] = 1;
    s.best[1] = 5400;
    s.biscuits = 175;
    s.inventory.treat = 7;
    s.sound = false;
    persist(s);
    const again = load();
    expect(again).toEqual(s);
    expect(unlockedUpTo(again)).toBe(3);
  });

  it('upgrades a save from the first version without losing progress', () => {
    mem.setItem('micah-madness-save-v1', JSON.stringify({ stars: { 1: 2 }, best: { 1: 3000 }, biscuits: 140, inventory: { treat: 4 }, sound: true }));
    const s = load();
    expect(s.version).toBe(SAVE_VERSION);
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
