// Collar tags: achievements that reward biscuits. Each one is a pure check on the save,
// so they also unlock for older saves that already did the work.

import { LEVELS } from './levels';
import { DECOR } from './yard';
import type { SaveData } from './save';

export type TallyKey = 'mud' | 'yarn' | 'zoomies' | 'bark' | 'micah' | 'treats' | 'wins' | 'bestStreak' | 'saves' | 'gulps';

export interface Badge {
  id: string;
  name: string;
  desc: string;
  reward: number;
  /** Progress toward the badge as [current, target]. */
  progress: (s: SaveData) => [number, number];
  /** Colour of the tag on the collar. */
  color: string;
}

const t = (s: SaveData, k: TallyKey) => s.tally[k] ?? 0;
const cleared = (s: SaveData) => Object.values(s.stars).filter((n) => n > 0).length;
const threeStars = (s: SaveData) => Object.values(s.stars).filter((n) => n >= 3).length;
const stars = (s: SaveData) => Object.values(s.stars).reduce((a, b) => a + b, 0);

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Fetch', desc: 'Clear your first level.', reward: 25, color: '#e8352f', progress: (s) => [cleared(s), 1] },
  { id: 'half', name: 'Halfway Home', desc: 'Clear 20 levels.', reward: 50, color: '#f08a24', progress: (s) => [cleared(s), 20] },
  { id: 'top', name: 'Top Dog', desc: `Clear all ${LEVELS.length} levels.`, reward: 150, color: '#ffc12e', progress: (s) => [cleared(s), LEVELS.length] },
  { id: 'pupil', name: 'Star Pupil', desc: 'Get 3 stars on 10 levels.', reward: 50, color: '#7a5af5', progress: (s) => [threeStars(s), 10] },
  { id: 'gazer', name: 'Stargazer', desc: 'Earn 75 stars.', reward: 75, color: '#3f7be0', progress: (s) => [stars(s), 75] },
  { id: 'bath', name: 'Bath Time', desc: 'Wash 100 mud patches.', reward: 40, color: '#7a5233', progress: (s) => [t(s, 'mud'), 100] },
  { id: 'knot', name: 'Untangler', desc: 'Untangle 50 balls of yarn.', reward: 40, color: '#e86aa6', progress: (s) => [t(s, 'yarn'), 50] },
  { id: 'zoom', name: 'Zoomies Champ', desc: 'Make 40 Zoomies.', reward: 40, color: '#23925a', progress: (s) => [t(s, 'zoomies'), 40] },
  { id: 'bark', name: 'Big Barker', desc: 'Make 25 Big Barks.', reward: 40, color: '#173a52', progress: (s) => [t(s, 'bark'), 25] },
  { id: 'micah', name: 'Micah Mania', desc: 'Make 10 Micah pieces.', reward: 60, color: '#a3201c', progress: (s) => [t(s, 'micah'), 10] },
  { id: 'streak', name: 'Hot Streak', desc: 'Win 5 levels in a row.', reward: 50, color: '#ff6a3d', progress: (s) => [Math.max(t(s, 'bestStreak'), s.winStreak), 5] },
  { id: 'snack', name: 'Snack Attack', desc: 'Feed Micah 10 treats.', reward: 30, color: '#e3a64e', progress: (s) => [t(s, 'treats'), 10] },
  { id: 'loyal', name: 'Loyal Friend', desc: 'Claim all 7 daily treats in a row.', reward: 50, color: '#5c9f5a', progress: (s) => [s.daily.day, 7] },
  { id: 'drop', name: 'Drop It!', desc: 'Grab 25 falling things before Micah eats them.', reward: 40, color: '#2f8fe0', progress: (s) => [t(s, 'saves'), 25] },
  { id: 'gulp', name: 'Bottomless Pit', desc: 'Let Micah eat 10 things she shouldn\u2019t.', reward: 20, color: '#8a5a26', progress: (s) => [t(s, 'gulps'), 10] },
  { id: 'yard', name: 'Dream Yard', desc: 'Build everything in Micah’s Yard.', reward: 75, color: '#86a9d6', progress: (s) => [s.decor.length, DECOR.length] },
];

export function isEarned(b: Badge, s: SaveData): boolean {
  const [cur, target] = b.progress(s);
  return cur >= target;
}

/** Marks newly earned badges as owned, pays their biscuits, and returns them. */
export function awardBadges(s: SaveData): Badge[] {
  const fresh = BADGES.filter((b) => !s.badges.includes(b.id) && isEarned(b, s));
  for (const b of fresh) {
    s.badges.push(b.id);
    s.biscuits += b.reward;
  }
  return fresh;
}

export function bump(s: SaveData, k: TallyKey, by = 1): void {
  s.tally[k] = (s.tally[k] ?? 0) + by;
}
