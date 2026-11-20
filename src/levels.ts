// Level definitions for the Micah Madness map.

export type Goal =
  | { type: 'collect'; kind: number; count: number }
  | { type: 'mud' } // clean every muddy cell
  | { type: 'yarn' } // untangle every yarn-wrapped cell
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
  { name: 'Starry Sleepover', blurb: 'One last big adventure, then the comfiest nap.', sky: '#c7c3f0', ground: '#5b5a9e' },
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

const L = (
  id: number,
  moves: number,
  kinds: number,
  goals: Goal[],
  stars: [number, number, number],
  mud?: string[],
  yarn?: string[],
): Level => ({
  id,
  zone: Math.floor((id - 1) / 5),
  moves,
  kinds,
  goals,
  stars,
  mud,
  yarn,
});
const Y: Goal = { type: 'yarn' };
const M: Goal = { type: 'mud' };
const C = (kind: number, count: number): Goal => ({ type: 'collect', kind, count });
const P = (power: Power, count: number): Goal => ({ type: 'power', power, count });
const S = (target: number): Goal => ({ type: 'score', target });

export const LEVELS: Level[] = [
  L(1, 20, 5, [{ type: 'collect', kind: BONE, count: 15 }], [1500, 3000, 4500]),
  L(2, 20, 5, [{ type: 'score', target: 3000 }], [3000, 5000, 7000]),
  L(3, 22, 5, [{ type: 'collect', kind: BALL, count: 18 }, { type: 'collect', kind: PAW, count: 18 }], [2500, 4500, 6500]),
  L(4, 20, 5, [{ type: 'mud' }], [2500, 4500, 6500], MUD_CENTER),
  L(5, 25, 6, [{ type: 'collect', kind: BOWL, count: 25 }, { type: 'score', target: 4000 }], [4000, 6500, 9000]),

  L(6, 22, 6, [{ type: 'collect', kind: BALL, count: 30 }], [3000, 5500, 8000]),
  L(7, 26, 6, [{ type: 'mud' }], [3500, 6000, 8500], MUD_BOTTOM),
  L(8, 22, 6, [{ type: 'score', target: 6000 }], [6000, 8500, 11000]),
  L(9, 25, 6, [{ type: 'collect', kind: BALL, count: 25 }, { type: 'collect', kind: BONE, count: 25 }], [4000, 7000, 10000]),
  L(10, 28, 6, [{ type: 'mud' }, { type: 'collect', kind: PAW, count: 20 }], [4500, 7500, 10500], MUD_X),

  L(11, 22, 6, [{ type: 'collect', kind: LOBSTER, count: 30 }], [3500, 6500, 9500]),
  L(12, 33, 6, [{ type: 'mud' }], [4500, 7500, 10500], MUD_FRAME),
  L(13, 22, 6, [{ type: 'collect', kind: LOBSTER, count: 25 }, { type: 'collect', kind: CAP, count: 25 }], [4500, 7500, 10500]),
  L(14, 24, 6, [{ type: 'score', target: 7000 }], [7000, 10000, 13000]),
  L(15, 28, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }], [6000, 9500, 13000], MUD_PAW),

  L(16, 36, 6, [{ type: 'mud' }], [5000, 8500, 12000], MUD_ALL),
  L(17, 25, 6, [{ type: 'collect', kind: BOWL, count: 30 }, { type: 'collect', kind: PAW, count: 30 }], [5000, 8500, 12000]),
  L(18, 32, 6, [{ type: 'mud' }, { type: 'score', target: 7000 }], [7000, 10500, 14000], MUD_X),
  L(19, 27, 6, [{ type: 'collect', kind: CAP, count: 35 }, { type: 'collect', kind: BONE, count: 30 }], [6000, 9500, 13000]),
  L(20, 36, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }, { type: 'collect', kind: CAP, count: 30 }], [8000, 12000, 16000], MUD_ALL),

  // Costume Party: yarn arrives from the knitting basket.
  L(21, 20, 5, [Y], [2500, 4500, 6500], undefined, YARN_PAIR),
  L(22, 22, 6, [Y, { type: 'collect', kind: BONE, count: 20 }], [3500, 6000, 8500], undefined, YARN_ROW),
  L(23, 28, 6, [Y], [4000, 7000, 10000], undefined, YARN_POSTS),
  L(24, 24, 6, [Y, M], [5000, 8500, 12000], MUD_CENTER, YARN_ROW),
  L(25, 34, 6, [Y, { type: 'collect', kind: PAW, count: 20 }], [6000, 9500, 13000], undefined, YARN_CROSS),

  // Snow Day: big sweeps, more mud (slush).
  L(26, 24, 6, [{ type: 'score', target: 6000 }], [6000, 9000, 12000]),
  L(27, 25, 6, [M], [5500, 9000, 12500], MUD_TOP),
  L(28, 30, 6, [Y, { type: 'collect', kind: BALL, count: 20 }], [6000, 9500, 13000], undefined, YARN_RING),
  L(29, 33, 6, [M, { type: 'collect', kind: BOWL, count: 18 }], [6500, 10000, 14000], MUD_SIDES),
  L(30, 40, 6, [Y, M], [7000, 11000, 15000], MUD_FRAME, YARN_CROSS),

  // The Big Dog Show: everything is judged.
  L(31, 24, 6, [{ type: 'collect', kind: CAP, count: 25 }, { type: 'collect', kind: LOBSTER, count: 25 }], [6000, 9500, 13000]),
  L(32, 36, 6, [Y], [5500, 9000, 12500], undefined, YARN_CHECK),
  L(33, 26, 6, [{ type: 'score', target: 7000 }], [7000, 10000, 13000]),
  L(34, 36, 6, [M, Y], [7000, 11000, 15000], MUD_PAW, YARN_CORNERS),
  L(35, 30, 6, [Y, { type: 'collect', kind: BONE, count: 28 }, { type: 'collect', kind: BALL, count: 28 }], [8000, 12000, 16000], undefined, YARN_DIAMOND),

  // Micah's Birthday: everything at once.
  L(36, 38, 6, [M, { type: 'score', target: 6500 }], [6500, 10000, 13500], MUD_ALL),
  L(37, 33, 6, [Y, { type: 'collect', kind: LOBSTER, count: 28 }], [8000, 12000, 16000], undefined, YARN_RING),
  L(38, 36, 6, [Y, M], [8500, 12500, 16500], MUD_BOTTOM, YARN_DIAMOND),
  L(39, 30, 6, [{ type: 'collect', kind: CAP, count: 26 }, { type: 'collect', kind: PAW, count: 26 }, { type: 'score', target: 7000 }], [7000, 10500, 14000]),
  L(40, 36, 6, [Y, M, { type: 'collect', kind: LOBSTER, count: 30 }], [10000, 14000, 18000], MUD_TOP, YARN_CAKE),

  // Rainy Walk: deep mud takes two washes.
  L(41, 22, 5, [M], [3000, 5500, 8000], DEEP_PUDDLE),
  L(42, 24, 6, [C(BALL, 24), C(BOWL, 24)], [4500, 7500, 10500]),
  L(43, 28, 6, [M], [5000, 8500, 12000], DEEP_RIVER),
  L(44, 38, 6, [M, Y], [6000, 9500, 13000], DEEP_PUDDLES, YARN_BAND),
  L(45, 26, 6, [M, C(PAW, 24)], [7000, 10500, 14000], DEEP_BOTTOM),

  // Camping Trip: goals that ask for power-ups.
  L(46, 22, 5, [P('zoomies', 4)], [3500, 6000, 8500]),
  L(47, 30, 6, [P('bark', 3), C(BONE, 20)], [5000, 8000, 11000]),
  L(48, 30, 6, [Y, P('zoomies', 4)], [6000, 9500, 13000], undefined, YARN_TENT),
  L(49, 44, 6, [M, P('bark', 2)], [6500, 10000, 13500], DEEP_SIDES),
  L(50, 42, 6, [P('micah', 1), Y, M], [8000, 12000, 16000], MUD_LEAVES, YARN_VINES),

  // Pumpkin Patch: leaves everywhere and bigger mixes.
  L(51, 26, 6, [M, C(CAP, 20)], [5500, 9000, 12500], MUD_LEAVES),
  L(52, 30, 6, [P('zoomies', 3), P('bark', 2), S(7000)], [7000, 10500, 14000]),
  L(53, 28, 6, [M], [6500, 10000, 13500], DEEP_PUMPKIN),
  L(54, 42, 6, [Y, C(LOBSTER, 22), C(BALL, 22)], [7500, 11000, 14500], undefined, YARN_VINES),
  L(55, 40, 6, [M, Y, P('bark', 3)], [9000, 13000, 17000], DEEP_PUMPKIN, YARN_BAND),

  // Starry Sleepover: the grand finale.
  L(56, 28, 6, [P('micah', 1), C(BOWL, 22)], [6500, 10000, 13500]),
  L(57, 38, 6, [Y, M], [7500, 11500, 15500], DEEP_MOON, YARN_STARS),
  L(58, 30, 6, [S(8000), P('zoomies', 4)], [8000, 12500, 16000]),
  L(59, 40, 6, [M, C(CAP, 26), C(PAW, 26)], [9000, 13000, 17000], DEEP_ALL),
  L(60, 42, 6, [M, Y, P('micah', 1), C(LOBSTER, 26)], [11000, 15000, 19000], DEEP_MOON, YARN_STARS),
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

export function yarnCount(level: Level): number {
  return (level.yarn ?? []).join('').split('').filter((ch) => ch === 'y').length;
}
