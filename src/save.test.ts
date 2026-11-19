import { beforeEach, describe, expect, it } from 'vitest';
import { SAVE_VERSION, freshSave, load, migrate, persist, unlockedUpTo } from './save';

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
