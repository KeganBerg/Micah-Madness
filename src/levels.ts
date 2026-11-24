// Level definitions for the Micah Madness map.

export type Goal =
  | { type: 'collect'; kind: number; count: number }
  | { type: 'mud' } // clean every muddy cell
  | { type: 'yarn' } // untangle every yarn-wrapped cell
  | { type: 'leaves' } // rake every fallen leaf (they spread on any move that rakes none)
  | { type: 'bubbles' } // pop every soap bubble (a match on it or right next to it pops it)
  | { type: 'junk'; count: number } // let Micah eat this much junk (it has to reach the bottom row)
  | { type: 'burrs' } // pick out every burr (they pin a piece down, and spread to the next piece if a move picks none)
  | { type: 'boxes' } // tear open every parcel (a match right beside it, or a blast, tears off a layer)
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
  bubbles?: string[]; // 8 rows, 'b' marks a soapy cell (its piece can't be swapped; a match beside it pops it)
  /** Noah's Ark: most pieces of junk on the board at once (the raccoons throw more as Micah eats). */
  junk?: number;
  /** 8 rows, 'x' marks a parcel, 'X' a taped parcel that takes two tears. Parcels fall like pieces. */
  boxes?: string[];
  /** 8 rows, 'r' marks a burr stuck to that piece. */
  burrs?: string[];
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
  { name: 'Noah\u2019s Ark Lane', blurb: 'The falling-down house is still standing. The raccoons say hi.', sky: '#d9d2c4', ground: '#7d8f5a' },
  { name: 'The Long Way Home', blurb: 'Every hydrant, every mailbox, every single sniff.', sky: '#f7c9a0', ground: '#a7834e' },
  { name: 'Front Porch', blurb: 'Almost home. One last pile of leaves, then dinner.', sky: '#f2b48a', ground: '#9c6b45' },
  { name: 'Bath Day', blurb: 'Suds everywhere. Pop the bubbles with a match right beside them.', sky: '#c8ecf5', ground: '#8fc9c4' },
  { name: 'Backyard Barbecue', blurb: 'Micah will eat anything. Keep an eye on the hot dogs.', sky: '#ffd8a8', ground: '#7fb35e' },
  { name: 'Sprinkler Party', blurb: 'Run through, shake off, run through again.', sky: '#a8e0f5', ground: '#5fae6a' },
  { name: 'Moonlight Walk', blurb: 'One last stroll under the moon, then the comfiest nap of all.', sky: '#9fa6d9', ground: '#4f5d8a' },
  // Levels 101-150
  { name: 'Lighthouse Cliffs', blurb: 'Sea spray, seagulls and a lighthouse in lobster red.', sky: '#b9dcef', ground: '#8fb07a' },
  { name: 'Noah\u2019s Ark Yard Sale', blurb: 'The raccoons are selling junk. Micah wants all of it.', sky: '#e6dcc8', ground: '#a39a6a' },
  { name: 'Desert Road Trip', blurb: 'Cactus, red rocks and one very long road.', sky: '#ffd9a0', ground: '#e0a05a' },
  { name: 'Farm Visit', blurb: 'A red barn, nosy goats and hay in her ears.', sky: '#cfeaff', ground: '#9cc35a' },
  { name: 'Under the Sea', blurb: 'Micah dreams she\u2019s a real lobster.', sky: '#2c6f96', ground: '#1f557a' },
  { name: 'Delivery Day', blurb: 'Parcels on every step. Micah signs for all of them.', sky: '#d8e4ee', ground: '#b8bcc4' },
  { name: 'Cherry Blossom Park', blurb: 'Pink petals, a red bridge and very fat fish.', sky: '#ffe4ee', ground: '#a9cf8a' },
  { name: 'Mountain Hike', blurb: 'Rocky trails, wildflowers and snow on the peaks.', sky: '#a8d4f0', ground: '#7f9a6a' },
  { name: 'County Fair', blurb: 'A Ferris wheel, corn dogs and a prize ribbon.', sky: '#ffe8b0', ground: '#d9c27a' },
  { name: 'Lake Cabin', blurb: 'A dock, a canoe and loons calling at dusk.', sky: '#f2b8a8', ground: '#4f7a62' },
  // Levels 151-200
  { name: 'Sunflower Fields', blurb: 'Flowers taller than Micah, and burrs in her fur.', sky: '#bfe4ff', ground: '#a7b84a' },
  { name: 'The Greenhouse', blurb: 'Warm, misty and full of leaves bigger than her head.', sky: '#d8f0e4', ground: '#3f8a5a' },
  { name: 'Canyon River', blurb: 'Red rock walls and a very cold river.', sky: '#ffcf9a', ground: '#b5653a' },
  { name: 'Northern Lights', blurb: 'Green skies, crunchy snow and one curious fox.', sky: '#1d2f4f', ground: '#5f7d99' },
  { name: 'The Bakery', blurb: 'Flour on the floor. Micah will eat anything.', sky: '#ffe9d0', ground: '#e8d6c0' },
  { name: 'Dinosaur Museum', blurb: 'The biggest bone Micah has ever seen.', sky: '#e8e2d6', ground: '#cfc6b8' },
  { name: 'Construction Site', blurb: 'Diggers, dirt piles and a hard hat that fits.', sky: '#cfe4f2', ground: '#b08a5a' },
  { name: 'Train Station', blurb: 'All aboard. Micah has the window seat.', sky: '#c9d8e8', ground: '#8f97a3' },
  { name: 'Kite Hill', blurb: 'Windy, green and full of kites to chase.', sky: '#a8dcff', ground: '#6fbf5a' },
  { name: 'Fireworks Night', blurb: 'Big bangs, bright sparks, one brave dog.', sky: '#1a1440', ground: '#3a2f6a' },
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
const LEAF_TOP = ['llllllll', '.llllll.', '........', '........', '........', '........', '........', '........'];
const LEAF_SCATTER = ['l...l...', '........', '..l...l.', '........', 'l...l...', '........', '..l...l.', '........'];
const LEAF_GATE = ['........', '........', '........', '........', '........', '........', '........', 'llllllll'];
const LEAF_DUSK = ['........', '.....ll.', '.....ll.', '........', '........', '.....ll.', '.....ll.', '........'];

// Soap bubbles ('b'): the piece inside is too slippery to swap. A match on it or right beside it pops it.
const BUB_FEW = ['........', '........', '..b..b..', '........', '........', '..b..b..', '........', '........'];
const BUB_ROW = ['........', '........', '........', 'bbbbbbbb', '........', '........', '........', '........'];
const BUB_CORNERS = ['bb....bb', 'b......b', '........', '........', '........', '........', 'b......b', 'bb....bb'];
const BUB_TUB = ['........', '........', '.bbbbbb.', '.b....b.', '.b....b.', '.bbbbbb.', '........', '........'];
const BUB_DOTS = ['b.b.b.b.', '........', '.b.b.b.b', '........', 'b.b.b.b.', '........', '.b.b.b.b', '........'];
const BUB_GRILL = ['........', 'b.b.b.b.', '........', '.b.b.b.b', '........', '........', '........', '........'];
const BUB_COLS = ['.b....b.', '.b....b.', '.b....b.', '.b....b.', '.b....b.', '.b....b.', '.b....b.', '.b....b.'];
const BUB_FOAM = ['bbbbbbbb', 'bbbbbbbb', 'b.b..b.b', '........', '........', '........', '........', '........'];
const BUB_HEART = ['........', '.bb..bb.', 'bbbbbbbb', 'bbbbbbbb', '.bbbbbb.', '..bbbb..', '...bb...', '........'];
const BUB_SIDES = ['........', 'b......b', 'b......b', 'b......b', 'b......b', 'b......b', 'b......b', '........'];
const BUB_INSIDE = ['........', '........', '...bb...', '..bbbb..', '..bbbb..', '...bb...', '........', '........'];
const BUB_LEFT = ['........', '........', 'bb......', 'bb......', 'bb......', 'bb......', '........', '........'];
const BUB_MOON = ['....bb..', '.....bb.', '......b.', '......b.', '......b.', '......b.', '.....bb.', '....bb..'];

const MUD_DRIVE = ['........', '........', '........', '...mm...', '...mm...', '...mm...', '...mm...', '...mm...'];
const MUD_GUTTER = ['........', '........', '........', '........', 'm......m', 'm......m', 'm......m', 'm......m'];
const YARN_FENCE = ['........', '........', '........', '........', 'y.y.y.y.', 'yyyyyyyy', '........', '........'];
const YARN_ARC = ['...yy...', '..yyyy..', '.y....y.', '.y.yy.y.', '.y.yy.y.', '........', '........', '........'];
const YARN_DOOR = ['........', '........', '........', '...yy...', '..y..y..', '..y..y..', '..y..y..', '........'];

// Parcels ('x', or 'X' taped up twice): too heavy to swap, they fall like pieces. A match beside one tears it.
const BOX_FEW = ['........', '........', '........', '..x..x..', '..x..x..', '........', '........', '........'];
const BOX_PAIRS = ['........', '.xx..xx.', '........', '........', '........', '........', '.xx..xx.', '........'];
const BOX_ROW = ['........', '........', '........', '........', 'xxxxxxxx', '........', '........', '........'];
const BOX_STACKS = ['........', '...xx...', '...xx...', '...xx...', '........', '........', '........', '........'];
const BOX_TOP = ['xxxxxxxx', 'x......x', '........', '........', '........', '........', '........', '........'];
const BOX_CENTER = ['........', '........', '...xx...', '..xxxx..', '..xxxx..', '...xx...', '........', '........'];
const BOX_PORCH = ['........', '........', '........', '........', '........', '........', 'x.x..x.x', 'xxxxxxxx'];
const TAPE_MIX = ['........', '.X....X.', '........', '...xx...', '...xx...', '........', '.X....X.', '........'];
const TAPE_ROW = ['........', '........', 'XxXxXxXx', '........', '........', '........', '........', '........'];
const TAPE_CORNERS = ['XX....XX', 'X......X', '........', '........', '........', '........', 'X......X', 'XX....XX'];
const TAPE_LOW = ['........', '........', '........', '........', '........', '........', '.XxXXxX.', '........'];
// Burrs ('r'): pin a piece down like yarn, and stick to the next piece over if a move picks none.
const BURR_TWO = ['........', '........', '..r.....', '........', '........', '.....r..', '........', '........'];
const BURR_CORNERS = ['r......r', '........', '........', '........', '........', '........', '........', 'r......r'];
const BURR_CENTER = ['........', '........', '........', '...rr...', '...rr...', '........', '........', '........'];
const BURR_ROW = ['........', '........', '........', '........', '........', '........', 'r.r.r.r.', '........'];
const BURR_SCATTER = ['...r....', '......r.', '.r......', '........', '......r.', '........', '...r....', 'r.......'];
const TAPE_CENTER = ['........', '........', '...XX...', '..xXXx..', '..xXXx..', '...XX...', '........', '........'];

const L = (
  id: number,
  moves: number,
  kinds: number,
  goals: Goal[],
  stars: [number, number, number],
  mud?: string[],
  yarn?: string[],
  leaves?: string[],
  bubbles?: string[],
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
  bubbles,
});
const Y: Goal = { type: 'yarn' };
const M: Goal = { type: 'mud' };
const C = (kind: number, count: number): Goal => ({ type: 'collect', kind, count });
const P = (power: Power, count: number): Goal => ({ type: 'power', power, count });
const S = (target: number): Goal => ({ type: 'score', target });
const F: Goal = { type: 'leaves' };
const B: Goal = { type: 'bubbles' };
const _ = undefined;
const X: Goal = { type: 'boxes' };
const R: Goal = { type: 'burrs' };
const J = (count: number): Goal => ({ type: 'junk', count });
interface Extra { mud?: string[]; yarn?: string[]; leaves?: string[]; bubbles?: string[]; boxes?: string[]; burrs?: string[]; junk?: number }
/** Levels 101 on: the same as L, with the board layouts named. */
const N = (id: number, moves: number, kinds: number, goals: Goal[], stars: [number, number, number], o: Extra = {}): Level => ({
  ...L(id, moves, kinds, goals, stars, o.mud, o.yarn, o.leaves, o.bubbles),
  ...(o.boxes ? { boxes: o.boxes } : {}),
  ...(o.burrs ? { burrs: o.burrs } : {}),
  ...(o.junk ? { junk: o.junk } : {}),
});

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
  L(18, 37, 6, [{ type: 'mud' }, { type: 'score', target: 7000 }], [7000, 9000, 10600], MUD_X),
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
  L(36, 30, 5, [M, { type: 'score', target: 6500 }], [6500, 11400, 15000], MUD_ALL),
  L(37, 37, 6, [Y, { type: 'collect', kind: LOBSTER, count: 28 }], [5000, 8000, 10000], undefined, YARN_RING),
  L(38, 45, 6, [Y, M], [6000, 10000, 12500], MUD_BOTTOM, YARN_DIAMOND),
  L(39, 30, 6, [{ type: 'collect', kind: CAP, count: 26 }, { type: 'collect', kind: PAW, count: 26 }, { type: 'score', target: 7000 }], [7000, 8000, 9000]),
  L(40, 39, 6, [Y, M, { type: 'collect', kind: LOBSTER, count: 30 }], [5000, 8500, 10500], MUD_TOP, YARN_CAKE),

  // Rainy Walk: deep mud takes two washes.
  L(41, 22, 5, [M], [3000, 5500, 8000], DEEP_PUDDLE),
  L(42, 22, 6, [C(BALL, 24), C(BOWL, 24)], [3500, 6000, 7000]),
  L(43, 25, 6, [M], [3500, 5500, 7500], DEEP_RIVER),
  L(44, 36, 6, [M, Y], [5000, 7900, 10500], DEEP_PUDDLES, YARN_BAND),
  L(45, 24, 6, [M, C(PAW, 24)], [3500, 6100, 7900], DEEP_BOTTOM),

  // Camping Trip: goals that ask for power-ups.
  L(46, 22, 5, [P('zoomies', 4)], [3000, 5500, 7500]),
  L(47, 39, 6, [P('bark', 3), C(BONE, 20)], [5000, 8000, 11000]),
  L(48, 24, 6, [Y, P('zoomies', 4)], [3500, 5500, 7000], undefined, YARN_TENT),
  L(49, 45, 6, [M, P('bark', 2)], [6000, 10000, 12500], DEEP_SIDES),
  L(50, 44, 6, [P('micah', 1), Y, M], [6000, 10000, 12000], MUD_LEAVES, YARN_VINES),

  // Pumpkin Patch: leaves everywhere and bigger mixes.
  L(51, 30, 6, [M, C(CAP, 20)], [4000, 6500, 8000], MUD_LEAVES),
  L(52, 31, 6, [P('zoomies', 3), P('bark', 2), S(7000)], [7000, 8500, 9500]),
  L(53, 27, 6, [M], [4000, 6600, 8300], DEEP_PUMPKIN),
  L(54, 42, 6, [Y, C(LOBSTER, 22), C(BALL, 22)], [5500, 9000, 11500], undefined, YARN_VINES),
  L(55, 43, 6, [M, Y, P('bark', 3)], [6000, 10000, 12000], DEEP_PUMPKIN, YARN_BAND),

  // Starry Sleepover: the grand finale.
  L(56, 45, 6, [P('micah', 1), C(BOWL, 22)], [5000, 8200, 10700]),
  L(57, 45, 6, [Y, M], [6000, 10000, 12500], DEEP_MOON, YARN_STARS),
  L(58, 31, 6, [S(8000), P('zoomies', 4)], [8000, 9000, 10000]),
  L(59, 45, 6, [M, C(CAP, 26), C(PAW, 26)], [6000, 10000, 12500], DEEP_ALL),
  L(60, 45, 6, [M, Y, P('micah', 1), C(LOBSTER, 26)], [6000, 10500, 13000], DEEP_MOON, YARN_STARS),

  // Neighbourhood Walk: fallen leaves, which spread if a move rakes none.
  L(61, 22, 5, [F], [2500, 4500, 6500], undefined, undefined, LEAF_CORNER),
  L(62, 22, 6, [F, C(BONE, 20)], [3000, 5000, 6100], undefined, undefined, LEAF_TWO),
  L(63, 26, 6, [F], [3500, 4900, 6900], undefined, undefined, LEAF_STRIP),
  L(64, 24, 6, [F, M], [4000, 5200, 6700], MUD_DRIVE, undefined, LEAF_TWO),
  L(65, 23, 6, [F, P('zoomies', 5), C(BOWL, 30)], [4000, 6600, 8100], undefined, undefined, LEAF_PILE),

  // Noah's Ark Lane: leaves, yarn and the deep puddles out front.
  L(66, 37, 6, [F, Y], [4000, 6500, 8500], undefined, YARN_ARC, LEAF_TWO),
  L(67, 25, 6, [F, C(BALL, 22), C(PAW, 22)], [4000, 5800, 7400], undefined, undefined, LEAF_CORNER),
  L(68, 32, 6, [F, M], [5000, 6900, 9400], MUD_GUTTER, undefined, LEAF_PILE),
  L(69, 35, 6, [S(7500), F], [7500, 9000, 10500], undefined, undefined, LEAF_SCATTER),
  L(70, 41, 6, [F, Y, P('bark', 2)], [5500, 8800, 11000], undefined, YARN_FENCE, LEAF_TOP),

  // The Long Way Home: everything Micah has met so far, all on one street.
  L(71, 42, 6, [F, C(BOWL, 24)], [4500, 8100, 10100], undefined, undefined, LEAF_STRIP),
  L(72, 45, 6, [M, F], [5000, 9700, 12400], DEEP_BOTTOM, undefined, LEAF_GATE),
  L(73, 44, 6, [P('micah', 1), F], [5000, 8600, 11500], undefined, undefined, LEAF_SCATTER),
  L(74, 44, 6, [Y, F, C(CAP, 22)], [5500, 9000, 10900], undefined, YARN_BAND, LEAF_SCATTER),
  L(75, 44, 6, [M, Y, F], [6000, 9300, 11800], DEEP_SIDES, YARN_DOOR, LEAF_PILE),

  // Front Porch: the last stretch home.
  L(76, 34, 6, [F, P('zoomies', 3), P('bark', 2)], [5500, 7300, 9600], undefined, undefined, LEAF_PILE),
  L(77, 45, 6, [M, F, C(LOBSTER, 20)], [6000, 9400, 12400], DEEP_PUDDLE, undefined, LEAF_GATE),
  L(78, 35, 6, [Y, F], [5500, 8200, 9800], undefined, YARN_DIAMOND, LEAF_PILE),
  L(79, 42, 6, [S(9000), F, P('micah', 1)], [9000, 11100, 11900], undefined, undefined, LEAF_PILE),
  L(80, 41, 6, [M, Y, F, P('micah', 1)], [6500, 8900, 11500], DEEP_MOON, YARN_DOOR, LEAF_DUSK),

  // Bath Day: soap bubbles arrive.
  L(81, 22, 5, [B], [2000, 3900, 5300], _, _, _, BUB_FEW),
  L(82, 25, 6, [B, C(BONE, 32)], [2500, 6800, 8200], _, _, _, BUB_ROW),
  L(83, 23, 6, [B, C(BOWL, 28)], [2000, 5900, 7100], _, _, _, BUB_CORNERS),
  L(84, 21, 6, [B, M, C(PAW, 26)], [2000, 5400, 6900], DEEP_PUDDLE, _, _, BUB_TUB),
  L(85, 21, 6, [B, P('zoomies', 5), C(BALL, 28)], [2000, 6100, 7400], _, _, _, BUB_DOTS),

  // Backyard Barbecue: Micah will eat anything.
  L(86, 23, 6, [B, C(LOBSTER, 28)], [2500, 5900, 7500], _, _, _, BUB_GRILL),
  L(87, 23, 6, [B, Y], [3000, 5100, 6800], _, YARN_DOOR, _, BUB_CORNERS),
  L(88, 23, 6, [B, P('bark', 2)], [3500, 5200, 6600], _, _, _, BUB_COLS),
  L(89, 21, 6, [B, F, C(PAW, 24)], [2500, 5300, 6600], _, _, LEAF_PILE, BUB_COLS),
  L(90, 28, 6, [B, M, P('bark', 3)], [2500, 7100, 9200], DEEP_PUDDLE, _, _, BUB_TUB),

  // Sprinkler Party: everything gets wet, then sudsy.
  L(91, 27, 6, [B, C(BALL, 30)], [2500, 6500, 8300], _, _, _, BUB_FOAM),
  L(92, 45, 6, [B, F], [5000, 9000, 11300], _, _, LEAF_GATE, BUB_DOTS),
  L(93, 32, 6, [P('micah', 1), B], [3500, 6000, 7900], _, _, _, BUB_HEART),
  L(94, 26, 6, [B, Y, C(PAW, 28)], [3000, 6200, 7900], _, YARN_DOOR, _, BUB_SIDES),
  L(95, 45, 6, [M, B, F], [5000, 9600, 11600], DEEP_PUDDLES, _, LEAF_GATE, BUB_ROW),

  // Moonlight Walk: the last stroll of the night.
  L(96, 34, 6, [B, P('zoomies', 3), P('bark', 2)], [3500, 7000, 9000], _, _, _, BUB_MOON),
  L(97, 27, 6, [B, C(CAP, 32)], [2500, 6900, 8500], _, _, _, BUB_HEART),
  L(98, 33, 6, [Y, B], [4000, 7400, 9700], _, YARN_DIAMOND, _, BUB_INSIDE),
  L(99, 31, 6, [B, P('micah', 1), C(LOBSTER, 26)], [5000, 6900, 8600], _, _, _, BUB_DOTS),
  L(100, 45, 6, [M, Y, F, B], [5500, 10300, 13300], MUD_DRIVE, YARN_CORNERS, LEAF_DUSK, BUB_LEFT),

  // Lighthouse Cliffs: sea foam, fishing nets and sandy puddles.
  N(101, 26, 6, [C(LOBSTER, 32)], [3100, 6800, 8200]),
  N(102, 25, 6, [B, C(BALL, 30)], [2900, 6400, 8200], { bubbles: BUB_CORNERS }),
  N(103, 44, 6, [Y, F], [3800, 8500, 10800], { yarn: YARN_RING, leaves: LEAF_CORNER }),
  N(104, 22, 6, [M, P('zoomies', 3)], [2500, 5600, 7500], { mud: DEEP_RIVER }),
  N(105, 27, 6, [M, B, C(CAP, 26)], [2800, 6300, 7700], { mud: DEEP_PUDDLES, bubbles: BUB_ROW }),

  // Noah's Ark Yard Sale: the raccoons' junk comes to the main map.
  N(106, 38, 5, [J(4)], [5600, 12500, 17100], { junk: 2 }),
  N(107, 28, 5, [J(5), C(BONE, 22)], [5100, 11200, 14200], { junk: 2 }),
  N(108, 27, 5, [J(5), Y], [5000, 11000, 14000], { junk: 2, yarn: YARN_POSTS }),
  N(109, 34, 5, [J(6), M], [6200, 13900, 17500], { junk: 2, mud: MUD_BOTTOM }),
  N(110, 33, 5, [J(6), F, P('bark', 2)], [6000, 13300, 16800], { junk: 2, leaves: LEAF_TOP }),

  // Desert Road Trip: dusty mud, cactus yarn and tumbleweeds.
  N(111, 24, 6, [C(PAW, 26), C(BOWL, 26)], [2900, 6300, 7800]),
  N(112, 27, 5, [M, J(4)], [5000, 11100, 14900], { mud: DEEP_BOTTOM, junk: 2 }),
  N(113, 33, 6, [Y, C(CAP, 24)], [3400, 7700, 9700], { yarn: YARN_DIAMOND }),
  N(114, 30, 5, [F, J(5)], [5400, 12100, 16700], { leaves: LEAF_SCATTER, junk: 2 }),
  N(115, 43, 6, [M, Y, P('micah', 1)], [4100, 9200, 11300], { mud: DEEP_SIDES, yarn: YARN_PAIR }),

  // Farm Visit
  N(116, 27, 5, [J(4), C(BONE, 24)], [4500, 10100, 13400], { junk: 2 }),
  N(117, 24, 6, [M, C(BALL, 24)], [2600, 5800, 7700], { mud: MUD_PAW }),
  N(118, 29, 6, [F, Y], [3000, 6600, 8400], { leaves: LEAF_PILE, yarn: YARN_FENCE }),
  N(119, 27, 5, [B, J(5)], [5300, 11700, 14700], { bubbles: BUB_DOTS, junk: 2 }),
  N(120, 28, 5, [M, F, J(5), P('bark', 2)], [5000, 11000, 14600], { mud: MUD_DRIVE, leaves: LEAF_CORNER, junk: 2 }),

  // Under the Sea: bubbles everywhere, and junk sinking to the sea floor.
  N(121, 26, 6, [B, C(LOBSTER, 30)], [2900, 6400, 8200], { bubbles: BUB_HEART }),
  N(122, 22, 6, [B, C(LOBSTER, 28)], [2600, 5700, 7200], { bubbles: BUB_COLS }),
  N(123, 31, 5, [J(6), B], [5500, 12300, 16700], { bubbles: BUB_GRILL, junk: 2 }),
  N(124, 42, 6, [Y, B, P('zoomies', 4)], [4200, 9300, 12100], { yarn: YARN_CORNERS, bubbles: BUB_INSIDE }),
  N(125, 28, 5, [M, B, J(6)], [5700, 12700, 16100], { mud: DEEP_PUDDLE, bubbles: BUB_SIDES, junk: 2 }),

  // Delivery Day: parcels arrive.
  N(126, 22, 5, [X, C(PAW, 20)], [2800, 6300, 8400], { boxes: BOX_PAIRS }),
  N(127, 22, 6, [X, C(BOWL, 26)], [2700, 5900, 7300], { boxes: BOX_CENTER }),
  N(128, 42, 6, [X, Y], [4100, 9100, 11500], { boxes: BOX_ROW, yarn: YARN_CORNERS }),
  N(129, 29, 6, [X, M], [3000, 6700, 8600], { boxes: BOX_STACKS, mud: MUD_BOTTOM }),
  N(130, 36, 6, [X, F, P('bark', 2)], [3800, 8400, 10800], { boxes: BOX_PORCH, leaves: LEAF_TOP }),

  // Cherry Blossom Park
  N(131, 26, 6, [F, C(PAW, 30)], [3000, 6700, 8300], { leaves: LEAF_PILE }),
  N(132, 23, 6, [X, B, C(BONE, 24)], [2600, 5700, 7300], { boxes: BOX_CENTER, bubbles: BUB_CORNERS }),
  N(133, 25, 5, [J(5), X], [4900, 10800, 15300], { boxes: BOX_FEW, junk: 2 }),
  N(134, 30, 6, [Y, X, C(CAP, 22)], [3300, 7300, 9200], { yarn: YARN_BAND, boxes: BOX_PAIRS }),
  N(135, 29, 6, [M, X, P('micah', 1)], [3100, 6900, 8700], { mud: DEEP_PUDDLES, boxes: BOX_ROW }),

  // Mountain Hike
  N(136, 33, 6, [X, S(8000)], [8000, 9200, 10100], { boxes: BOX_PAIRS }),
  N(137, 26, 6, [M, X], [2600, 5800, 7600], { mud: DEEP_RIVER, boxes: BOX_TOP }),
  N(138, 24, 6, [F, X, C(BALL, 26)], [2600, 5900, 7500], { leaves: LEAF_TWO, boxes: BOX_ROW }),
  N(139, 33, 5, [J(6), X, Y], [6200, 13800, 18600], { junk: 2, boxes: BOX_PAIRS, yarn: YARN_POSTS }),
  N(140, 38, 6, [M, Y, F, X], [3900, 8700, 10500], { mud: DEEP_RIVER, yarn: YARN_TENT, leaves: LEAF_CORNER, boxes: BOX_PORCH }),

  // County Fair: taped-up parcels take two tears.
  N(141, 26, 6, [X, C(BALL, 20)], [2500, 5500, 6900], { boxes: TAPE_MIX }),
  N(142, 22, 6, [X, C(CAP, 26)], [2600, 5900, 7500], { boxes: TAPE_ROW }),
  N(143, 21, 6, [X, B], [2100, 4700, 6100], { boxes: TAPE_CENTER, bubbles: BUB_CORNERS }),
  N(144, 33, 5, [X, J(5)], [5800, 12900, 17500], { boxes: TAPE_CORNERS, junk: 2 }),
  N(145, 33, 6, [X, P('zoomies', 4), P('bark', 3)], [3700, 8300, 10000], { boxes: TAPE_ROW }),

  // Lake Cabin: the last stop of the trip.
  N(146, 28, 6, [B, F, C(CAP, 22)], [2600, 5800, 7600], { bubbles: BUB_MOON, leaves: LEAF_CORNER }),
  N(147, 26, 6, [X, M], [2800, 6200, 8000], { boxes: TAPE_ROW, mud: DEEP_BOTTOM }),
  N(148, 35, 5, [J(6), B, Y], [6400, 14300, 18900], { junk: 2, bubbles: BUB_FEW, yarn: YARN_CORNERS }),
  N(149, 42, 6, [S(10000), X], [10000, 11400, 12800], { boxes: TAPE_CORNERS }),
  N(150, 44, 6, [M, Y, B, X], [4600, 10200, 12500], { mud: DEEP_RIVER, yarn: YARN_CORNERS, bubbles: BUB_FEW, boxes: TAPE_LOW }),

  // Sunflower Fields: burrs arrive.
  N(151, 21, 6, [R, C(BONE, 20)], [2200, 4800, 6200], { burrs: BURR_TWO }),
  N(152, 22, 6, [R, C(BALL, 26)], [2400, 5300, 6800], { burrs: BURR_CORNERS }),
  N(153, 30, 6, [R, M], [3000, 6700, 8900], { burrs: BURR_CENTER, mud: MUD_BOTTOM }),
  N(154, 41, 6, [R, Y], [4100, 9200, 11100], { burrs: BURR_TWO, yarn: YARN_CORNERS }),
  N(155, 31, 6, [R, F, P('bark', 2)], [3300, 7200, 8300], { burrs: BURR_ROW, leaves: LEAF_TOP }),

  // The Greenhouse
  N(156, 26, 6, [B, C(PAW, 30)], [2900, 6400, 7700], { bubbles: BUB_DOTS }),
  N(157, 25, 6, [R, B, C(PAW, 30)], [2900, 6400, 7800], { burrs: BURR_CENTER, bubbles: BUB_CORNERS }),
  N(158, 26, 6, [M, R], [2700, 6000, 7300], { mud: DEEP_PUDDLES, burrs: BURR_ROW }),
  N(159, 31, 6, [Y, R, C(LOBSTER, 24)], [2900, 6500, 8700], { yarn: YARN_BAND, burrs: BURR_CORNERS }),
  N(160, 35, 6, [B, R, F], [3400, 7600, 10100], { bubbles: BUB_SIDES, burrs: BURR_CENTER, leaves: LEAF_GATE }),

  // Canyon River
  N(161, 30, 6, [M, C(CAP, 26)], [3200, 7100, 8500], { mud: DEEP_RIVER }),
  N(162, 27, 5, [J(5), R], [4700, 10500, 15300], { junk: 2, burrs: BURR_TWO }),
  N(163, 25, 6, [X, R, C(BALL, 30)], [3000, 6700, 7900], { boxes: BOX_ROW, burrs: BURR_CORNERS }),
  N(164, 27, 6, [M, X, C(BOWL, 24)], [2700, 6100, 8600], { mud: MUD_TOP, boxes: TAPE_LOW }),
  N(165, 32, 5, [R, J(6), Y], [6300, 14000, 18000], { burrs: BURR_CENTER, junk: 2, yarn: YARN_CORNERS }),

  // Northern Lights
  N(166, 34, 6, [R, S(8000)], [8000, 9200, 10200], { burrs: BURR_TWO }),
  N(167, 45, 6, [M, R], [4700, 10400, 12400], { mud: DEEP_ALL, burrs: BURR_CENTER }),
  N(168, 25, 6, [B, X, C(BONE, 32)], [3000, 6600, 8000], { bubbles: BUB_ROW, boxes: TAPE_ROW }),
  N(169, 31, 6, [R, P('micah', 1)], [2500, 5600, 7800], { burrs: BURR_SCATTER }),
  N(170, 36, 6, [M, R, B, Y], [3800, 8500, 10600], { mud: DEEP_SIDES, burrs: BURR_ROW, bubbles: BUB_FEW, yarn: YARN_PAIR }),

  // The Bakery: Micah will eat anything.
  N(171, 30, 5, [J(5), C(BONE, 22)], [5000, 11200, 15400], { junk: 2 }),
  N(172, 28, 5, [X, J(5)], [4700, 10400, 14400], { boxes: BOX_PAIRS, junk: 2 }),
  N(173, 25, 6, [R, X, C(LOBSTER, 30)], [2800, 6300, 7600], { burrs: BURR_SCATTER, boxes: BOX_CENTER }),
  N(174, 30, 5, [B, J(6), R], [5500, 12200, 16100], { bubbles: BUB_CORNERS, junk: 2, burrs: BURR_CENTER }),
  N(175, 34, 6, [M, X, R, P('bark', 2)], [3800, 8400, 10500], { mud: MUD_BOTTOM, boxes: BOX_TOP, burrs: BURR_CENTER }),

  // Dinosaur Museum
  N(176, 27, 6, [R, C(BONE, 34)], [3200, 7000, 8700], { burrs: BURR_TWO }),
  N(177, 32, 6, [Y, X], [3400, 7600, 9200], { yarn: YARN_DIAMOND, boxes: BOX_CENTER }),
  N(178, 27, 6, [M, R, C(CAP, 24)], [3200, 7100, 8500], { mud: DEEP_PUMPKIN, burrs: BURR_CORNERS }),
  N(179, 41, 6, [S(11000), R], [11000, 12100, 13100], { burrs: BURR_ROW }),
  N(180, 42, 6, [M, Y, R, X], [4400, 9700, 12800], { mud: DEEP_RIVER, yarn: YARN_CORNERS, burrs: BURR_TWO, boxes: TAPE_LOW }),

  // Construction Site
  N(181, 45, 6, [M, C(BALL, 28)], [4100, 9200, 12200], { mud: MUD_FRAME }),
  N(182, 43, 6, [X, M], [4200, 9300, 11600], { boxes: TAPE_CENTER, mud: MUD_FRAME }),
  N(183, 34, 5, [J(6), M], [6100, 13600, 18100], { junk: 2, mud: MUD_BOTTOM }),
  N(184, 27, 6, [R, X, F], [2600, 5700, 7100], { burrs: BURR_CORNERS, boxes: BOX_ROW, leaves: LEAF_TOP }),
  N(185, 30, 5, [M, X, R, J(6)], [5800, 12900, 17100], { mud: MUD_GUTTER, boxes: BOX_PAIRS, burrs: BURR_CENTER, junk: 2 }),

  // Train Station
  N(186, 25, 6, [Y, C(CAP, 26)], [2800, 6100, 7500], { yarn: YARN_ROW }),
  N(187, 28, 6, [R, B, C(CAP, 34)], [3200, 7100, 8700], { burrs: BURR_SCATTER, bubbles: BUB_ROW }),
  N(188, 35, 6, [X, Y, R], [3600, 8000, 10400], { boxes: TAPE_CORNERS, yarn: YARN_PAIR, burrs: BURR_TWO }),
  N(189, 31, 5, [J(6), X, B], [5800, 13000, 17800], { junk: 2, boxes: BOX_PAIRS, bubbles: BUB_INSIDE }),
  N(190, 23, 6, [M, R, X, C(LOBSTER, 26)], [2800, 6300, 7700], { mud: DEEP_PUDDLE, burrs: BURR_CORNERS, boxes: TAPE_LOW }),

  // Kite Hill
  N(191, 29, 6, [F, C(BOWL, 28)], [3000, 6600, 8300], { leaves: LEAF_TWO }),
  N(192, 27, 6, [R, F, C(BALL, 30)], [2800, 6200, 7700], { burrs: BURR_CENTER, leaves: LEAF_CORNER }),
  N(193, 22, 6, [X, P('zoomies', 7)], [2700, 6000, 7300], { boxes: TAPE_MIX }),
  N(194, 33, 5, [R, Y, J(6)], [6000, 13300, 16700], { burrs: BURR_TWO, yarn: YARN_TENT, junk: 2 }),
  N(195, 33, 6, [M, R, F, B], [3300, 7200, 9000], { mud: DEEP_BOTTOM, burrs: BURR_CORNERS, leaves: LEAF_TOP, bubbles: BUB_FEW }),

  // Fireworks Night: the end of the second trip.
  N(196, 37, 6, [S(9000), C(LOBSTER, 26)], [9000, 10500, 11400]),
  N(197, 21, 6, [R, X, C(PAW, 24)], [2400, 5300, 6600], { burrs: BURR_CENTER, boxes: TAPE_ROW }),
  N(198, 40, 6, [M, Y, B], [4000, 9000, 10700], { mud: DEEP_MOON, yarn: YARN_STARS, bubbles: BUB_INSIDE }),
  N(199, 30, 5, [J(6), R, P('micah', 1)], [5800, 13000, 17000], { junk: 2, burrs: BURR_CENTER }),
  N(200, 23, 6, [M, B, X, R], [2300, 5100, 7300], { mud: MUD_TOP, bubbles: BUB_FEW, boxes: TAPE_LOW, burrs: BURR_CENTER }),
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

export function bubbleCount(level: Level): number {
  return (level.bubbles ?? []).join('').split('').filter((ch) => ch === 'b').length;
}

export function burrCount(level: Level): number {
  return (level.burrs ?? []).join('').split('').filter((ch) => ch === 'r').length;
}

/** Parcels on the board at the start (a taped parcel counts once). */
export function boxTotal(level: Level): number {
  return (level.boxes ?? []).join('').split('').filter((ch) => ch === 'x' || ch === 'X').length;
}

export function yarnCount(level: Level): number {
  return (level.yarn ?? []).join('').split('').filter((ch) => ch === 'y').length;
}
