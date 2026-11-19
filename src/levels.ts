// Level definitions for the Micah Madness map.

export type Goal =
  | { type: 'collect'; kind: number; count: number }
  | { type: 'mud' } // clean every muddy cell
  | { type: 'score'; target: number };

export interface Level {
  id: number;
  zone: number;
  moves: number;
  kinds: number; // how many piece kinds appear (fewer = easier)
  goals: Goal[];
  stars: [number, number, number]; // score thresholds
  mud?: string[]; // 8 rows, 'm' marks a muddy cell
}

export interface Zone {
  name: string;
  blurb: string;
  sky: string;
  ground: string;
}

export const ZONES: Zone[] = [
  { name: 'The Backyard', blurb: 'Where it all begins: sniff, dig, nap.', sky: '#bfe6ff', ground: '#8fd16a' },
  { name: 'Dog Park', blurb: 'Tennis balls everywhere. Pure chaos.', sky: '#ffe2b8', ground: '#6fbf5a' },
  { name: 'Lobster Beach', blurb: 'Micah suits up in the lobster costume.', sky: '#9fdcf5', ground: '#f3d9a0' },
  { name: 'Muddy Trails', blurb: 'Every walk ends with a bath.', sky: '#d7e8c8', ground: '#a07a52' },
  { name: 'Costume Party', blurb: 'Caps, claws and treats for everyone.', sky: '#e8d4ff', ground: '#c99ae8' },
];

const BONE = 0, BALL = 1, PAW = 2, BOWL = 3, LOBSTER = 4, CAP = 5;

const MUD_CENTER = ['........', '........', '..mmmm..', '..mmmm..', '..mmmm..', '..mmmm..', '........', '........'];
const MUD_BOTTOM = ['........', '........', '........', '........', '........', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm'];
const MUD_X = ['m......m', '.m....m.', '..m..m..', '...mm...', '...mm...', '..m..m..', '.m....m.', 'm......m'];
const MUD_FRAME = ['mmmmmmmm', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'm......m', 'mmmmmmmm'];
const MUD_PAW = ['.mm..mm.', '.mm..mm.', '........', 'mm.mm.mm', '...mm...', '..mmmm..', '..mmmm..', '...mm...'];
const MUD_ALL = Array(8).fill('mmmmmmmm');

const L = (id: number, moves: number, kinds: number, goals: Goal[], stars: [number, number, number], mud?: string[]): Level => ({
  id,
  zone: Math.floor((id - 1) / 5),
  moves,
  kinds,
  goals,
  stars,
  mud,
});

export const LEVELS: Level[] = [
  L(1, 20, 5, [{ type: 'collect', kind: BONE, count: 15 }], [1500, 3000, 4500]),
  L(2, 20, 5, [{ type: 'score', target: 3000 }], [3000, 5000, 7000]),
  L(3, 22, 5, [{ type: 'collect', kind: BALL, count: 18 }, { type: 'collect', kind: PAW, count: 18 }], [2500, 4500, 6500]),
  L(4, 20, 5, [{ type: 'mud' }], [2500, 4500, 6500], MUD_CENTER),
  L(5, 25, 6, [{ type: 'collect', kind: BOWL, count: 25 }, { type: 'score', target: 4000 }], [4000, 6500, 9000]),

  L(6, 22, 6, [{ type: 'collect', kind: BALL, count: 30 }], [3000, 5500, 8000]),
  L(7, 24, 6, [{ type: 'mud' }], [3500, 6000, 8500], MUD_BOTTOM),
  L(8, 20, 6, [{ type: 'score', target: 6000 }], [6000, 8500, 11000]),
  L(9, 25, 6, [{ type: 'collect', kind: BALL, count: 25 }, { type: 'collect', kind: BONE, count: 25 }], [4000, 7000, 10000]),
  L(10, 24, 6, [{ type: 'mud' }, { type: 'collect', kind: PAW, count: 20 }], [4500, 7500, 10500], MUD_X),

  L(11, 22, 6, [{ type: 'collect', kind: LOBSTER, count: 30 }], [3500, 6500, 9500]),
  L(12, 25, 6, [{ type: 'mud' }], [4500, 7500, 10500], MUD_FRAME),
  L(13, 22, 6, [{ type: 'collect', kind: LOBSTER, count: 25 }, { type: 'collect', kind: CAP, count: 25 }], [4500, 7500, 10500]),
  L(14, 20, 6, [{ type: 'score', target: 8000 }], [8000, 11000, 14000]),
  L(15, 28, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }], [6000, 9500, 13000], MUD_PAW),

  L(16, 24, 6, [{ type: 'mud' }], [5000, 8500, 12000], MUD_ALL),
  L(17, 22, 6, [{ type: 'collect', kind: BOWL, count: 30 }, { type: 'collect', kind: PAW, count: 30 }], [5000, 8500, 12000]),
  L(18, 26, 6, [{ type: 'mud' }, { type: 'score', target: 9000 }], [9000, 12000, 15000], MUD_X),
  L(19, 24, 6, [{ type: 'collect', kind: CAP, count: 35 }, { type: 'collect', kind: BONE, count: 30 }], [6000, 9500, 13000]),
  L(20, 30, 6, [{ type: 'mud' }, { type: 'collect', kind: LOBSTER, count: 30 }, { type: 'collect', kind: CAP, count: 30 }], [8000, 12000, 16000], MUD_ALL),
];

export function mudCount(level: Level): number {
  return (level.mud ?? []).join('').split('').filter((ch) => ch === 'm').length;
}
