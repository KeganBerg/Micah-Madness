// Level definitions for the Micah Madness map.

export type Goal =
  | { type: 'collect'; kind: number; count: number }
  | { type: 'mud' } // clean every muddy cell
  | { type: 'yarn' } // untangle every yarn-wrapped cell
  | { type: 'leaves' } // rake every fallen leaf (they spread on any move that rakes none)
  | { type: 'score'; target: number }
  | { type: 'power'; power: Power; count: number }; // make this many power-ups of one kind

export type Power = 'zoomies' | 'bark' | 'micah';

export interface Level {
  id: number;
  zone: number;
  moves: number;
  kinds: number; // how many piece kinds appear (fewer = easier)
  goals: Goal[];
  stars: [number, number, number]; // score thresholds
  mud?: string[]; // 8 rows, 'm' marks a muddy cell, 'M' deep mud that takes two washes
  yarn?: string[]; // 8 rows, 'y' marks a cell wrapped in yarn (its piece can't be swapped)
  leaves?: string[]; // 8 rows, 'l' marks a cell under fallen leaves
  /** Micah's Winter: mud is drawn as snow drifts to shovel. */
  snow?: boolean;
}

export interface Zone {
  name: string;
  blurb: string;
  sky: string;
  ground: string;
}

export const ZONES: Zone[] = [
  { name: 'The Backyard', blurb: 'Where it all begins: sniff, dig, nap.', sky: '#bfe6ff', ground: '#7db86a' },
  { name: 'Dog Park', blurb: 'Tennis balls everywhere. Pure chaos.', sky: '#ffe2b8', ground: '#5c9f5a' },
  { name: 'Lobster Beach', blurb: 'Micah suits up in the lobster costume.', sky: '#9fdcf5', ground: '#e4c98f' },
  { name: 'Muddy Trails', blurb: 'Every walk ends with a bath.', sky: '#d7e8c8', ground: '#9a7a5a' },
  { name: 'Costume Party', blurb: 'Caps, claws and a basket of knitting yarn.', sky: '#e8d4ff', ground: '#d99a8f' },
  { name: 'Snow Day', blurb: 'Zoomies in the snow, then a towel.', sky: '#eef6fb', ground: '#b9d3e2' },
  { name: 'The Big Dog Show', blurb: 'Brushed, bowed and ready to strut.', sky: '#dbe7ff', ground: '#86a9d6' },
  { name: 'Micah’s Birthday', blurb: 'Cake, candles and every toy she owns.', sky: '#ffe0ea', ground: '#e7a3b8' },
  { name: 'Rainy Walk', blurb: 'Puddles, wellies and mud so deep it takes two washes.', sky: '#c9d6e3', ground: '#6f8a7a' },
  { name: 'Camping Trip', blurb: 'Tents, campfire snacks and a tree to sniff for every power-up.', sky: '#ffd9a8', ground: '#4f8a4b' },
  { name: 'Pumpkin Patch', blurb: 'Crunchy leaves and pumpkins bigger than Micah.', sky: '#ffe6c2', ground: '#d9884a' },
  { name: 'Starry Sleepover', blurb: 'A big night under the stars, then the comfiest nap.', sky: '#c7c3f0', ground: '#5b5a9e' },
  { name: 'Neighbourhood Walk', blurb: 'Leaves on every lawn, and they spread if you leave them.', sky: '#ffe3c4', ground: '#8fae5e' },
  { name: 'Noah\u2019s Arc Lane', blurb: 'The falling-down house is still standing. The raccoons say hi.', sky: '#d9d2c4', ground: '#7d8f5a' },
  { name: 'The Long Way Home', blurb: 'Every hydrant, every mailbox, every single sniff.', sky: '#f7c9a0', ground: '#a7834e' },
  { name: 'Front Porch', blurb: 'Almost home. One last pile of leaves, then dinner.', sky: '#f2b48a', ground: '#9c6b45' },
];

const BONE = 0, BALL = 1, PAW = 2, BOWL = 3, LOBSTER = 4, CAP = 5;

const MUD_CENTER = ['........', '........', '..mmmm..', '..mmmm..', '..mmmm..', '..mmmm..', '........', '........'];
const MUD_BOTTOM = ['........', '........', '........', '........', '........', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm'];
const MUD_X = ['m......m', '.m....m.', '..m..m..', '...mm...', '...mm...', '..m..m..', '.m....m.', 'm......m'];
const MUD_FRAME = ['mmmmmmmm', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'mmmmmmmm'];
const MUD_PAW = ['.mm..mm.', '.mm..mm.', '........', 'mm.mm.mm', '...mm...', '..mmmm..', '..mmmm..', '...mm...'];
const MUD_ALL = Array(8).fill('mmmmmmmm');
const MUD_TOP = ['mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', '........', '........', '........', '........', '........'];
const MUD_SIDES = ['mm....mm', 'mm....mm', 'mm....mm', 'mm....mm', 'mm....mm', 'mm....mm', 'mm....mm', 'mm....mm'];

const YARN_PAIR = ['........', '........', '........', '...yy...', '...yy...', '........', '........', '........'];
const YARN_ROW = ['........', '........', '........', 'yyyyyyyy', '........', '........', '........', '........'];
const YARN_POSTS = ['........', '........', '..y..y..', '..y..y..', '..y..y..', '..y..y..', '........', '........'];
const YARN_CORNERS = ['yy....yy', 'y......y', '........', '........', '........', '........', 'y......y', 'yy....yy'];
const YARN_CROSS = ['...yy...', '...yy...', '...yy...', 'yyyyyyyy', 'yyyyyyyy', '...yy...', '...yy...', '...yy...'];
const YARN_RING = ['........', '.yyyyyy.', '.y....y.', '.y....y.', '.y....y.', '.y....y.', '.yyyyyy.', '........'];
const YARN_CHECK = ['y.y.y.y.', '.y.y.y.y', '........', '........', '........', '........', 'y.y.y.y.', '.y.y.y.y'];
const YARN_DIAMOND = ['...yy...', '..y..y..', '.y....y.', 'y......y', 'y......y', '.y....y.', '..y..y..', '...yy...'];
const YARN_CAKE = ['........', '........', '..yyyy..', '.yyyyyy.', '.yyyyyy.', 'yyyyyyyy', '........', '........'];

// Deep mud ('M') takes two washes: the first turns it into ordinary mud.
const DEEP_PUDDLE = ['........', '........', '..mmmm..', '..mMMm..', '..mMMm..', '..mmmm..', '........', '........'];
const DEEP_PUDDLES = ['........', '.MM..MM.', '.MM..MM.', '........', '........', '.MM..MM.', '.MM..MM.', '........'];
const DEEP_RIVER = ['........', '........', '........', 'mmmmmmmm', 'MMMMMMMM', 'mmmmmmmm', '........', '........'];
const DEEP_BOTTOM = ['........', '........', '........', '........', 'mmmmmmmm', 'mMMMMMMm', 'mmmmmmmm', '........'];
const DEEP_SIDES = ['m......m', 'mM....Mm', 'mM....Mm', 'mM....Mm', 'mM....Mm', 'mM....Mm', 'mM....Mm', 'm......m'];
const DEEP_PUMPKIN = ['...mm...', '..mMMm..', '.mMMMMm.', 'mMMMMMMm', 'mMMMMMMm', '.mMMMMm.', '..mmmm..', '........'];
const DEEP_MOON = ['...mm...', '..mMm...', '.mMm....', '.mMm....', '.mMm....', '.mMm....', '..mMm...', '...mm...'];
const DEEP_ALL = ['mmmmmmmm', 'mmmmmmmm', 'mmMMMMmm', 'mmMMMMmm', 'mmMMMMmm', 'mmMMMMmm', 'mmmmmmmm', 'mmmmmmmm'];
const MUD_LEAVES = ['m.m.m.m.', '........', '.m.m.m.m', '........', 'm.m.m.m.', '........', '.m.m.m.m', '........'];

const YARN_TENT = ['...yy...', '..y..y..', '.y....y.', 'yyyyyyyy', '........', '........', '........', '........'];
const YARN_VINES = ['y......y', '.y....y.', '..y..y..', '........', '........', '..y..y..', '.y....y.', 'y......y'];
const YARN_STARS = ['.y....y.', 'yyy..yyy', '.y....y.', '........', '........', '.y....y.', 'yyy..yyy', '.y....y.'];
const YARN_BAND = ['........', '........', 'yyyyyyyy', '........', '........', 'yyyyyyyy', '........', '........'];

// Fallen leaves ('l'): rake them with a match on top. Any move that rakes none blows one more in.
const LEAF_CORNER = ['ll......', 'll......', 'l.......', '........', '........', '........', '........', '........'];
const LEAF_TWO = ['........', '.ll.....', '.ll.....', '........', '........', '.....ll.', '.....ll.', '........'];
const LEAF_STRIP = ['........', '........', '........', '........', '........', '........', 'llllllll', '........'];
const LEAF_PILE = ['........', '........', '...ll...', '..llll..', '..llll..', '...ll...', '........', '........'];
const LEAF_EDGES = ['l......l', 'l......l', '........', '........', '........', '........', 'l......l', 'l......l'];
const LEAF_TOP = ['llllllll', '.llllll.', '........', '........', '........', '........', '........', '........'];
const LEAF_SCATTER = ['l...l...', '........', '..l...l.', '........', 'l...l...', '........', '..l...l.', '........'];
const LEAF_GATE = ['........', '........', '........', '........', '........', '........', '........', 'llllllll'];
const LEAF_DUSK = ['........', '.....ll.', '.....ll.', '........', '........', '.....ll.', '.....ll.', '........'];

const MUD_DRIVE = ['........', '........', '........', '...mm...', '...mm...', '...mm...', '...mm...', '...mm...'];
const DEEP_GUTTER = ['M......M', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'M......M'];
const YARN_FENCE = ['........', '........', '........', '........', 'y.y.y.y.', 'yyyyyyyy', '........', '........'];
const YARN_ARC = ['...yy...', '..yyyy..', '.y....y.', '.y.yy.y.', '.y.yy.y.', '........', '........', '........'];
const YARN_DOOR = ['........', '........', '........', '...yy...', '..y..y..', '..y..y..', '..y..y..', '........'];

const L = (
  id: number,
  moves: number,
  kinds: number,
  goals: Goal[],
  stars: [number, number, number],
  mud?: string[],
  yarn?: string[],
  leaves?: string[],
): Level => ({
  id,
  zone: Math.floor((id - 1) / 5),
  moves,
  kinds,
  goals,
  stars,
  mud,
  yarn,
  leaves,
});
const Y: Goal = { type: 'yarn' };
const M: Goal = { type: 'mud' };
const C = (kind: number, count: number): Goal => ({ type: 'collect', kind, count });
const P = (power: Power, count: number): Goal => ({ type: 'power', power, count });
const S = (target: number): Goal => ({ type: 'score', target });
const F: Goal = { type: 'leaves' };

export const LEVELS: Level[] = [
  L(1, 20, 5, [{ type: 'collect', kind: BONE, count: 15 }], [1500, 3000, 4500]),
  L(2, 20, 5, [{ type: 'score', target: 3000 }], [3000, 5000, 7000]),
  L(3, 22, 5, [{ type: 'collect', kind: BALL, count: 18 }, { type: 'collect', kind: PAW, count: 18 }], [2500, 4500, 6500]),
  L(4, 20, 5, [{ type: 'mud' }], [2500, 4500, 6500], MUD_CENTER),
  L(5, 25, 6, [{ type: 'collect', kind: BOWL, count: 25 }, { type: 'score', target: 4000 }], [4000, 6000, 7500]),

  L(6, 26, 6, [{ type: 'collect', kind: BALL, count: 30 }], [3000, 5500, 8000]),
  L(7, 34, 6, [{ type: 'mud' }], [3500, 6000, 8500], MUD_BOTTOM),
  L(8, 25, 6, [{ type: 'score', target: 6000 }], [6000, 7000, 8000]),
  L(9, 22, 6, [{ type: 'collect', kind: BALL, count: 25 }, { type: 'collect', kind: BONE, count: 25 }], [3500, 6000, 7500]),
  L(10, 32, 6, [{ type: 'mud' }, { type: 'collect', kind: PAW, count: 20 }], [4500, 7500, 9500], MUD_X),

  L(11, 27, 6, [{ type: 'collect', kind: LOBSTER, count: 30 }], [3500, 6500, 8000]),
  L(12, 42, 6, [{ type: 'mud' }], [4500, 7500, 10500], MUD_FRAME),
  L(13, 22, 6, [{ type: 'collect', kind: LOBSTER, count: 25 }, { type: 'collect', kind: CAP, count: 25 }], [3500, 6000, 7500]),
  L(14, 28, 6, [{ type: 'score', target: 7000 }], [7000, 8000, 9000]),
  L(15, 27, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }], [4000, 6500, 8500], MUD_PAW),

  L(16, 28, 5, [{ type: 'mud' }], [5000, 8500, 12000], MUD_ALL),
  L(17, 27, 6, [{ type: 'collect', kind: BOWL, count: 30 }, { type: 'collect', kind: PAW, count: 30 }], [4500, 7500, 9000]),
  L(18, 40, 6, [{ type: 'mud' }, { type: 'score', target: 7000 }], [7000, 9000, 11000], MUD_X),
  L(19, 29, 6, [{ type: 'collect', kind: CAP, count: 35 }, { type: 'collect', kind: BONE, count: 30 }], [4500, 8000, 9500]),
  L(20, 43, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }, { type: 'collect', kind: CAP, count: 30 }], [6000, 10000, 11500], MUD_ALL),

  // Costume Party: yarn arrives from the knitting basket.
  L(21, 20, 5, [Y], [2500, 4500, 6500], undefined, YARN_PAIR),
  L(22, 23, 6, [Y, { type: 'collect', kind: BONE, count: 20 }], [3000, 5000, 7000], undefined, YARN_ROW),
  L(23, 18, 6, [Y], [2500, 4000, 5500], undefined, YARN_POSTS),
  L(24, 21, 6, [Y, M], [3000, 5000, 6500], MUD_CENTER, YARN_ROW),
  L(25, 35, 6, [Y, { type: 'collect', kind: PAW, count: 20 }], [4500, 8000, 9500], undefined, YARN_CROSS),

  // Snow Day: big sweeps, more mud (slush).
  L(26, 27, 6, [{ type: 'score', target: 6000 }], [6000, 7000, 8000]),
  L(27, 25, 6, [M], [3000, 4500, 6500], MUD_TOP),
  L(28, 33, 6, [Y, { type: 'collect', kind: BALL, count: 20 }], [4500, 7000, 9000], undefined, YARN_RING),
  L(29, 41, 6, [M, { type: 'collect', kind: BOWL, count: 18 }], [5000, 8500, 10500], MUD_SIDES),
  L(30, 45, 6, [Y, M], [6000, 9500, 12000], MUD_FRAME, YARN_CROSS),

  // The Big Dog Show: everything is judged.
  L(31, 24, 6, [{ type: 'collect', kind: CAP, count: 25 }, { type: 'collect', kind: LOBSTER, count: 25 }], [4000, 6500, 8000]),
  L(32, 45, 6, [Y], [5500, 9000, 12500], undefined, YARN_CHECK),
  L(33, 28, 6, [{ type: 'score', target: 7000 }], [7000, 8000, 9000]),
  L(34, 45, 6, [M, Y], [6000, 10000, 12000], MUD_PAW, YARN_CORNERS),
  L(35, 35, 6, [Y, { type: 'collect', kind: BONE, count: 28 }, { type: 'collect', kind: BALL, count: 28 }], [5000, 8500, 10500], undefined, YARN_DIAMOND),

  // Micah's Birthday: everything at once.
  L(36, 45, 6, [M, { type: 'score', target: 6500 }], [6500, 10000, 12000], MUD_ALL),
  L(37, 37, 6, [Y, { type: 'collect', kind: LOBSTER, count: 28 }], [5000, 8000, 10000], undefined, YARN_RING),
  L(38, 45, 6, [Y, M], [6000, 10000, 12500], MUD_BOTTOM, YARN_DIAMOND),
  L(39, 30, 6, [{ type: 'collect', kind: CAP, count: 26 }, { type: 'collect', kind: PAW, count: 26 }, { type: 'score', target: 7000 }], [7000, 8000, 9000]),
  L(40, 39, 6, [Y, M, { type: 'collect', kind: LOBSTER, count: 30 }], [5000, 8500, 10500], MUD_TOP, YARN_CAKE),

  // Rainy Walk: deep mud takes two washes.
  L(41, 18, 6, [M], [3000, 5500, 8000], DEEP_PUDDLE),
  L(42, 22, 6, [C(BALL, 24), C(BOWL, 24)], [3500, 6000, 7000]),
  L(43, 25, 6, [M], [3500, 5500, 7500], DEEP_RIVER),
  L(44, 38, 6, [M, Y], [5000, 8500, 10000], DEEP_PUDDLES, YARN_BAND),
  L(45, 25, 6, [M, C(PAW, 24)], [3500, 6000, 7500], DEEP_BOTTOM),

  // Camping Trip: goals that ask for power-ups.
  L(46, 18, 6, [P('zoomies', 5)], [3000, 5500, 7500]),
  L(47, 39, 6, [P('bark', 3), C(BONE, 20)], [5000, 8000, 11000]),
  L(48, 24, 6, [Y, P('zoomies', 4)], [3500, 5500, 7000], undefined, YARN_TENT),
  L(49, 45, 6, [M, P('bark', 2)], [6000, 10000, 12500], DEEP_SIDES),
  L(50, 44, 6, [P('micah', 1), Y, M], [6000, 10000, 12000], MUD_LEAVES, YARN_VINES),

  // Pumpkin Patch: leaves everywhere and bigger mixes.
  L(51, 30, 6, [M, C(CAP, 20)], [4000, 6500, 8000], MUD_LEAVES),
  L(52, 31, 6, [P('zoomies', 3), P('bark', 2), S(7000)], [7000, 8500, 9500]),
  L(53, 28, 6, [M], [4000, 6500, 8000], DEEP_PUMPKIN),
  L(54, 42, 6, [Y, C(LOBSTER, 22), C(BALL, 22)], [5500, 9000, 11500], undefined, YARN_VINES),
  L(55, 43, 6, [M, Y, P('bark', 3)], [6000, 10000, 12000], DEEP_PUMPKIN, YARN_BAND),

  // Starry Sleepover: the grand finale.
  L(56, 42, 6, [P('micah', 1), C(BOWL, 22)], [5000, 8000, 10500]),
  L(57, 45, 6, [Y, M], [6000, 10000, 12500], DEEP_MOON, YARN_STARS),
  L(58, 31, 6, [S(8000), P('zoomies', 4)], [8000, 9000, 10000]),
  L(59, 45, 6, [M, C(CAP, 26), C(PAW, 26)], [6000, 10000, 12500], DEEP_ALL),
  L(60, 45, 6, [M, Y, P('micah', 1), C(LOBSTER, 26)], [6000, 10500, 13000], DEEP_MOON, YARN_STARS),

  // Neighbourhood Walk: fallen leaves, which spread if a move rakes none.
  L(61, 22, 5, [F], [2500, 4500, 6500], undefined, undefined, LEAF_CORNER),
  L(62, 24, 6, [F, C(BONE, 20)], [3000, 5500, 7000], undefined, undefined, LEAF_TWO),
  L(63, 28, 6, [F], [3500, 6000, 8000], undefined, undefined, LEAF_STRIP),
  L(64, 40, 6, [F, M], [4000, 6500, 8500], MUD_DRIVE, undefined, LEAF_EDGES),
  L(65, 26, 6, [F, P('zoomies', 3)], [4000, 6500, 8500], undefined, undefined, LEAF_PILE),

  // Noah's Arc Lane: leaves, yarn and the deep puddles out front.
  L(66, 37, 6, [F, Y], [4000, 6500, 8500], undefined, YARN_ARC, LEAF_TWO),
  L(67, 40, 6, [F, C(BALL, 22), C(PAW, 22)], [4000, 6500, 8000], undefined, undefined, LEAF_EDGES),
  L(68, 45, 6, [F, M], [5000, 8000, 10000], DEEP_GUTTER, undefined, LEAF_PILE),
  L(69, 35, 6, [S(7500), F], [7500, 9000, 10500], undefined, undefined, LEAF_SCATTER),
  L(70, 43, 6, [F, Y, P('bark', 2)], [5500, 9000, 11000], undefined, YARN_FENCE, LEAF_TOP),

  // The Long Way Home: everything Micah has met so far, all on one street.
  L(71, 37, 6, [F, C(BOWL, 24)], [4500, 7000, 9000], undefined, undefined, LEAF_STRIP),
  L(72, 45, 6, [M, F], [5000, 8500, 10500], DEEP_PUDDLES, undefined, LEAF_EDGES),
  L(73, 42, 6, [P('micah', 1), F], [5000, 8000, 10000], undefined, undefined, LEAF_SCATTER),
  L(74, 40, 6, [Y, F, C(CAP, 22)], [5500, 9000, 11000], undefined, YARN_BAND, LEAF_SCATTER),
  L(75, 45, 6, [M, Y, F], [6000, 9500, 12000], DEEP_SIDES, YARN_DOOR, LEAF_PILE),

  // Front Porch: the last stretch home.
  L(76, 35, 6, [F, P('zoomies', 3), P('bark', 2)], [5500, 8500, 10500], undefined, undefined, LEAF_PILE),
  L(77, 45, 6, [M, F, C(LOBSTER, 24)], [6000, 9500, 12000], DEEP_PUMPKIN, undefined, LEAF_GATE),
  L(78, 45, 6, [Y, F], [5500, 9000, 11500], undefined, YARN_DIAMOND, LEAF_EDGES),
  L(79, 39, 6, [S(9000), F, P('micah', 1)], [9000, 10500, 12000], undefined, undefined, LEAF_PILE),
  L(80, 45, 6, [M, Y, F, P('micah', 1)], [6500, 10500, 13000], DEEP_MOON, YARN_DOOR, LEAF_DUSK),
];

/** Washes needed at one cell: 0, 1 for mud, 2 for deep mud. */
export function mudDepth(level: Level, r: number, c: number): number {
  const ch = level.mud?.[r]?.[c];
  return ch === 'M' ? 2 : ch === 'm' ? 1 : 0;
}

/** Total washes the level needs (deep mud counts twice). */
export function mudCount(level: Level): number {
  return (level.mud ?? []).join('').split('').reduce((n, ch) => n + (ch === 'M' ? 2 : ch === 'm' ? 1 : 0), 0);
}

export function leafCount(level: Level): number {
  return (level.leaves ?? []).join('').split('').filter((ch) => ch === 'l').length;
}

export function yarnCount(level: Level): number {
  return (level.yarn ?? []).join('').split('').filter((ch) => ch === 'y').length;
}
