// Micah's Sticker Book: real photos of Micah, one earned for clearing an area of the map.
// Photos are Micah-only, cropped to squares and stripped of camera data (src/assets/stickers).
// To add one: drop a 560px square JPEG in src/assets/stickers and give it an area below.
import bedhog from './assets/stickers/bedhog.jpg';
import morning from './assets/stickers/morning.jpg';
import snooze from './assets/stickers/snooze.jpg';
import { LEVELS, ZONES } from './levels';
import type { SaveData } from './save';

export interface Sticker {
  id: string;
  /** Zone index whose levels must all be cleared. */
  area: number;
  title: string;
  caption: string;
  photo: string;
  tilt: number;
}

export const STICKERS: Sticker[] = [
  { id: 'morning', area: 0, title: 'Morning check-in', caption: 'Are we getting up? No? Perfect.', photo: morning, tilt: -3 },
  { id: 'snooze', area: 4, title: 'Sunday snooze', caption: 'Do not disturb. She means it.', photo: snooze, tilt: 2.5 },
  { id: 'bedhog', area: 9, title: 'Bed hog', caption: 'She has the whole side of the bed. Again.', photo: bedhog, tilt: -2 },
];

export function areaCleared(s: SaveData, zone: number): boolean {
  const lv = LEVELS.filter((l) => l.zone === zone);
  return lv.length > 0 && lv.every((l) => (s.stars[l.id] ?? 0) > 0);
}

export const stickerEarned = (s: SaveData, st: Sticker) => areaCleared(s, st.area);
export const stickersEarned = (s: SaveData) => STICKERS.filter((st) => stickerEarned(s, st));
const seenKey = (st: Sticker) => `sticker:${st.id}`;
/** Earned stickers not shown off yet. */
export const freshStickers = (s: SaveData) => stickersEarned(s).filter((st) => !s.seen.includes(seenKey(st)));
export function markStickersSeen(s: SaveData, list: Sticker[]): void {
  for (const st of list) if (!s.seen.includes(seenKey(st))) s.seen.push(seenKey(st));
}
export const stickerHint = (st: Sticker) => `Clear Area ${st.area + 1}: ${ZONES[st.area].name}`;
