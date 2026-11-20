import { describe, expect, it } from 'vitest';
import { COSTUMES, costumeById, costumeUrl, isUnlocked } from './costumes';
import { freshSave, migrate } from './save';

describe('costumes', () => {
  it('has unique ids and starts Micah in her lobster suit', () => {
    expect(new Set(COSTUMES.map((c) => c.id)).size).toBe(COSTUMES.length);
    expect(freshSave().costume).toBe('lobster');
  });
  it('unlocks by level, by purchase, or for free', () => {
    const bee = costumeById('bee');
    expect(isUnlocked(bee, 4, [])).toBe(false);
    expect(isUnlocked(bee, 5, [])).toBe(true);
    const shades = costumeById('sunnies');
    expect(isUnlocked(shades, 40, [])).toBe(false);
    expect(isUnlocked(shades, 0, ['sunnies'])).toBe(true);
    expect(isUnlocked(costumeById('cap'), 0, [])).toBe(true);
  });
  it('falls back to the lobster suit for an unknown outfit', () => {
    expect(costumeById('nope').id).toBe('lobster');
    expect(costumeUrl('bee')).toMatch(/^data:image\/svg\+xml/);
  });
  it('keeps the outfit and wardrobe through a save round trip, and fills them in for old saves', () => {
    const s = migrate({ ...freshSave(), costume: 'bee', wardrobe: ['sunnies', 'sunnies', 3] });
    expect(s.costume).toBe('bee');
    expect(s.wardrobe).toEqual(['sunnies']);
    const old = migrate({ version: 4, stars: { 1: 3 } });
    expect(old.costume).toBe('lobster');
    expect(old.wardrobe).toEqual([]);
  });
});
