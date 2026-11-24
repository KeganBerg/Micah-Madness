// Noah's Ark: the falling-down house on Micah's walk. The raccoons living in it throw
// junk out of the windows onto the board (socks, boots, pinecones...). Junk can't be
// matched or blasted. Get it down to the bottom row and Micah eats it, because Micah
// will eat anything. Ten levels, opened once Micah has walked past the house (level 41).
// Each first win pays biscuits; 5 wins earn the Bandit Mask, all 10 the Hard Hat.
import type { Goal, Level } from './levels';
import type { SaveData } from './save';

export const ARK_BASE = 2000; // Ark level n has id ARK_BASE + n
export const ARK_UNLOCK_LEVEL = 41; // the first level that walks past Noah's Ark
export const ARK_BISCUITS = 30;
export const MASK_AT = 5;

export interface JunkItem {
  name: string;
  /** What gets said when Micah eats one. */
  line: string;
  svg: string;
}

const OUT = 'stroke="#3b2a1e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

export const JUNK_ITEMS: JunkItem[] = [
  {
    name: 'Sock',
    line: 'Micah ate a sock. Again.',
    svg: `<g transform="rotate(-12 50 50)">
      <path d="M38 14 H62 V58 C62 66 66 70 74 72 C84 75 84 90 72 90 H44 C34 90 30 82 32 72 L38 58 Z" fill="#fff4e6" ${OUT}/>
      <path d="M38 14 H62 V24 H38 Z" fill="#e8352f" ${OUT}/>
      <path d="M38 34 H62 M38 44 H62" stroke="#e8352f" stroke-width="5"/>
      <path d="M66 74 C76 76 80 82 78 88" fill="none" stroke="#e8352f" stroke-width="5" stroke-linecap="round"/>
    </g>`,
  },
  {
    name: 'Old boot',
    line: 'Micah ate a whole boot. She regrets nothing.',
    svg: `<path d="M30 16 H54 V56 L78 64 C88 67 90 76 88 84 H24 C22 70 26 40 30 16 Z" fill="#8a5a33" ${OUT}/>
      <path d="M24 84 H88 V90 H24 Z" fill="#3b2a1e"/>
      <path d="M32 26 H52 M33 36 H52 M34 46 H53" stroke="#d9b68a" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 60 L72 64" stroke="#d9b68a" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,
  },
  {
    name: 'Pinecone',
    line: 'Micah ate a pinecone. Crunchy.',
    svg: `<path d="M50 12 C70 20 76 44 72 62 C68 80 58 90 50 90 C42 90 32 80 28 62 C24 44 30 20 50 12 Z" fill="#9a6232" ${OUT}/>
      <path d="M34 36 Q50 44 66 36 M30 50 Q50 60 70 50 M31 64 Q50 74 69 64 M38 78 Q50 86 62 78" fill="none" stroke="#5e3518" stroke-width="3"/>
      <path d="M42 22 Q50 30 58 22" fill="none" stroke="#5e3518" stroke-width="3"/>
      <path d="M50 12 Q52 6 58 4" fill="none" stroke="#4f7a3a" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: 'Rubber duck',
    line: 'Micah ate a rubber duck. It squeaked the whole way down.',
    svg: `<path d="M22 60 C22 50 32 46 42 50 C38 40 40 22 56 20 C70 18 76 34 68 44 L80 46 C82 52 76 56 70 54 C80 60 80 82 56 86 C36 88 22 78 22 60 Z" fill="#ffc12e" ${OUT}/>
      <path d="M70 44 L84 42 C88 46 86 52 80 52 L70 50 Z" fill="#ff7a1a" ${OUT}/>
      <circle cx="60" cy="33" r="4" fill="#3b2a1e"/><circle cx="61.5" cy="31.5" r="1.4" fill="#fff"/>
      <path d="M34 64 Q46 74 58 64" fill="none" stroke="#d99a00" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    name: 'Hot dog',
    line: 'Micah ate a hot dog. Honestly, fair enough.',
    svg: `<g transform="rotate(-20 50 50)">
      <rect x="14" y="40" width="72" height="22" rx="11" fill="#c8553d" ${OUT}/>
      <path d="M12 50 C12 70 88 70 88 50 L88 58 C88 80 12 80 12 58 Z" fill="#f2c27a" ${OUT}/>
      <path d="M12 52 C12 34 88 34 88 52" fill="none" stroke="#3b2a1e" stroke-width="3"/>
      <path d="M22 46 Q30 40 38 46 T54 46 T70 46 T80 44" fill="none" stroke="#ffc12e" stroke-width="4" stroke-linecap="round"/>
    </g>`,
  },
  {
    name: 'Garden glove',
    line: 'Micah ate a garden glove. Just the one, so far.',
    svg: `<path d="M30 88 V50 L22 36 C20 30 28 26 32 32 L36 40 V18 C36 12 44 12 44 18 V36 V12 C44 6 52 6 52 12 V36 V14 C52 8 60 8 60 14 V38 V22 C60 16 68 16 68 22 V60 C68 72 64 80 64 88 Z" fill="#5fae57" ${OUT}/>
      <path d="M30 80 H64 V90 H30 Z" fill="#f0e4c8" ${OUT}/>
      <circle cx="42" cy="58" r="3" fill="#2f7a3a"/><circle cx="54" cy="52" r="3" fill="#2f7a3a"/><circle cx="56" cy="66" r="3" fill="#2f7a3a"/>`,
  },
  {
    name: 'Mystery sandwich',
    line: 'Micah ate a sandwich from Noah’s Ark. Nobody knows how old it was.',
    svg: `<path d="M14 66 L50 22 L86 66 Z" fill="#f2c27a" ${OUT}/>
      <path d="M20 66 L50 30 L80 66" fill="#fff4dc"/>
      <path d="M14 66 C24 74 34 62 44 72 C54 62 64 74 74 64 C80 70 84 68 86 66" fill="none" stroke="#5fae57" stroke-width="6" stroke-linecap="round"/>
      <path d="M14 70 H86 L82 80 H18 Z" fill="#f2c27a" ${OUT}/>
      <circle cx="42" cy="50" r="3.5" fill="#8fae5e" opacity=".8"/><circle cx="56" cy="44" r="2.5" fill="#8fae5e" opacity=".8"/>`,
  },
];

const J = (count: number): Goal => ({ type: 'junk', count });
const BONE = 0, LOBSTER = 4;
const C = (kind: number, count: number): Goal => ({ type: 'collect', kind, count });
const P = (power: 'zoomies' | 'bark' | 'micah', count: number): Goal => ({ type: 'power', power, count });
const M: Goal = { type: 'mud' };
const Y: Goal = { type: 'yarn' };
const F: Goal = { type: 'leaves' };

// The puddles out front, the boarded-up windows, the overgrown yard.
const PUDDLES = ['........', '........', '........', '........', '........', '........', '.mm..mm.', 'mmmmmmmm'];
const DEEP_PUDDLES = ['........', '........', '........', '........', '........', 'm......m', 'mMm..mMm', 'mmmmmmmm'];
const BOARDS = ['........', '.yy..yy.', '........', '........', '........', '........', '.yy..yy.', '........'];
const PLANKS = ['........', '........', 'yyy..yyy', '........', '........', 'yyy..yyy', '........', '........'];
const LEAF_PORCH = ['........', '........', '........', '...ll...', '..llll..', '.llllll.', '........', '........'];

const A = (n: number, moves: number, kinds: number, goals: Goal[], stars: [number, number, number], junk: number, extra: Partial<Level> = {}): Level =>
  ({ id: ARK_BASE + n, zone: 13, moves, kinds, goals, stars, junk, ...extra });

export const ARK_LEVELS: Level[] = [
  A(1, 26, 5, [J(2)], [3000, 7400, 10600], 2),
  A(2, 23, 5, [J(3), C(BONE, 18)], [3300, 8200, 11600], 2),
  A(3, 25, 5, [J(3), M], [3900, 9700, 13300], 2, { mud: PUDDLES }),
  A(4, 23, 5, [J(3), Y], [3500, 8700, 12400], 2, { yarn: BOARDS }),
  A(5, 27, 5, [J(4), F], [4200, 10600, 14200], 2, { leaves: LEAF_PORCH }),
  A(6, 26, 5, [J(4), C(LOBSTER, 20)], [3800, 9500, 12900], 3),
  A(7, 29, 5, [J(4), M], [4800, 11900, 14900], 2, { mud: DEEP_PUDDLES }),
  A(8, 21, 5, [J(4), P('bark', 2)], [3300, 8200, 12100], 3),
  A(9, 31, 5, [J(5), Y, F], [4700, 11800, 16500], 3, { yarn: PLANKS, leaves: LEAF_PORCH }),
  A(10, 30, 5, [J(5), M, P('micah', 1)], [4800, 11900, 15000], 3, { mud: DEEP_PUDDLES }),
];
export const ARK_COUNT = ARK_LEVELS.length;

/** The story line each Ark level opens with. */
export const ARK_TIPS: Record<number, string> = {
  2001: 'The raccoons in Noah’s Ark are throwing junk out the windows! Junk can’t be matched. Clear the pieces under it so it drops to the bottom row, and Micah will eat it.',
  2002: 'A sock came flying out of the attic. Micah has opinions about socks. Mostly that they are food.',
  2003: 'The puddles out front never dry. Wash them while the junk drops.',
  2004: 'The windows are boarded up, so the pieces behind them are stuck. Match through the boards to pull them off.',
  2005: 'Leaves are piling up on the porch. Nobody has raked this porch in years.',
  2006: 'The raccoons found the good stuff. Three pieces of junk at once now.',
  2007: 'The deep puddles by the garage. Wash them twice.',
  2008: 'Something rustled in the chimney. Make Big Barks to scare it back in.',
  2009: 'The planks are loose and the yard is overgrown. Micah is not scared. Micah is hungry.',
  2010: 'The last level at Noah’s Ark. Everything the raccoons own is coming out the window.',
};

export const isArkLevel = (lv: Level) => lv.id > ARK_BASE && lv.id <= ARK_BASE + ARK_COUNT;
export const arkNumber = (lv: Level) => lv.id - ARK_BASE;

/** Open once Micah has walked past the house. */
export const arkOpen = (s: SaveData) => (s.stars[ARK_UNLOCK_LEVEL] ?? 0) > 0;

/** The next Ark level to play: the lowest not yet won, or 0 once all are done. */
export function arkNext(s: SaveData): number {
  for (let n = 1; n <= ARK_COUNT; n++) if (!s.ark.includes(n)) return n;
  return 0;
}

/** Records a win. Returns what it paid, or null if this level was already won. */
export function claimArk(s: SaveData, n: number): { biscuits: number; won: number; mask: boolean; hat: boolean } | null {
  if (s.ark.includes(n)) return null;
  s.ark = [...s.ark, n].sort((a, b) => a - b);
  s.biscuits += ARK_BISCUITS;
  const won = s.ark.length;
  const mask = won >= MASK_AT && !s.wardrobe.includes('bandit');
  if (mask) s.wardrobe.push('bandit');
  const hat = won >= ARK_COUNT && !s.wardrobe.includes('hardhat');
  if (hat) s.wardrobe.push('hardhat');
  return { biscuits: ARK_BISCUITS, won, mask, hat };
}
