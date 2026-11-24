// Level-balance bot used by scripts/sim.test.ts. Pure logic, no DOM.
import { bubbleCount, leafCount, mudCount, mudDepth, yarnCount, type Level, type Power } from '../src/levels';
import { JUNK_ITEMS } from '../src/ark';
import { applyClear, applyGravity, isJunk, junkAtBottom, junkIn, placeJunk, throwJunk, cloneGrid, comboClears, computeClear, createGrid, hasMove, isLegalSwap, key, popBubbles, shuffle, spreadLeaf, swap, unkey, type Grid, type Pos } from '../src/board';

export interface Outcome { won: boolean; movesLeft: number; score: number; left: number[] }

const powerOf = (sp: string): Power | null => (sp === 'bark' ? 'bark' : sp === 'micah' ? 'micah' : sp === 'zoomRow' || sp === 'zoomCol' ? 'zoomies' : null);

export function play(lv: Level, smart = true): Outcome {
  const grid: Grid = createGrid(8, 8, Math.random, lv.kinds);
  const junkGoal = lv.goals.findIndex((g) => g.type === 'junk');
  const junkWant = () => (junkGoal < 0 ? 0 : Math.min(lv.junk ?? 2, Math.max(0, rem[junkGoal])));
  const mud = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => mudDepth(lv, r, c)));
  const yarn = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.yarn?.[r]?.[c] === 'y'));
  const leaf = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.leaves?.[r]?.[c] === 'l'));
  const bubble = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.bubbles?.[r]?.[c] === 'b'));
  const locked = (r: number, c: number) => yarn[r][c] || bubble[r][c];
  const total = (g: Level['goals'][number]) => (g.type === 'mud' ? mudCount(lv) : g.type === 'yarn' ? yarnCount(lv) : g.type === 'leaves' ? leafCount(lv) : g.type === 'bubbles' ? bubbleCount(lv) : 0);
  const leavesLeft = () => leaf.flat().filter(Boolean).length;
  let raked = false;
  const rem = lv.goals.map((g) => (g.type === 'collect' || g.type === 'power' || g.type === 'junk' ? g.count : g.type === 'score' ? g.target : total(g)));
  const syncLeaves = () => lv.goals.forEach((g, i) => g.type === 'leaves' && (rem[i] = leavesLeft()));
  if (junkGoal >= 0) placeJunk(grid, junkWant(), JUNK_ITEMS.length);
  const fall = () => { const drops = applyGravity(grid, Math.random, lv.kinds); throwJunk(grid, drops, junkWant(), JUNK_ITEMS.length); };
  let score = 0;
  const done = () => lv.goals.every((g, i) => (g.type === 'score' ? score >= g.target : rem[i] <= 0));

  const cascade = (pref: Pos[], forced: number[]) => {
    let chain = 1;
    for (;;) {
      const res = computeClear(grid, pref, forced);
      if (res.cleared.size === 0) {
        // Micah eats any junk that reached the bottom row, and more falls in.
        const eat = junkAtBottom(grid);
        if (!eat.length) break;
        for (const [r, c] of eat) grid[r][c] = null;
        rem[junkGoal] -= eat.length;
        fall();
        continue;
      }
      score += res.cleared.size * 20 * chain + res.created.length * 100;
      if (junkGoal >= 0) rem[junkGoal] -= junkIn(grid, res.cleared);
      lv.goals.forEach((g, i) => {
        if (g.type === 'collect') rem[i] -= res.collected[g.kind];
        if (g.type === 'power') rem[i] -= res.created.filter((cr) => powerOf(cr.tile.special) === g.power).length;
      });
      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        if (mud[r][c]) { mud[r][c]--; lv.goals.forEach((g, i) => g.type === 'mud' && rem[i]--); }
        if (yarn[r][c]) { yarn[r][c] = false; lv.goals.forEach((g, i) => g.type === 'yarn' && rem[i]--); }
        if (leaf[r][c]) { leaf[r][c] = false; raked = true; }
      }
      const popped = popBubbles(bubble, res.cleared).length;
      lv.goals.forEach((g, i) => g.type === 'bubbles' && (rem[i] -= popped));
      syncLeaves();
      applyClear(grid, res); fall();
      chain++; pref = []; forced = [];
    }
  };

  // Value of a move's first clear, the way a player reads the board.
  const value = (a: Pos, b: Pos): number => {
    const g2 = smart ? cloneGrid(grid) : grid;
    const forced = smart ? comboClears(g2, a, b) ?? [] : [];
    swap(g2, a, b);
    const res = computeClear(g2, [b, a], forced);
    if (!smart) swap(g2, a, b);
    const scoreLeft = lv.goals.some((g) => g.type === 'score' && score < g.target);
    let v = res.cleared.size * (scoreLeft ? 1.5 : 1) + res.created.length * 3 + Math.random();
    if (smart) v += res.fired.length * 2 + (a[0] + b[0]) * 0.1; // low moves shake loose more cascades
    for (const k of res.cleared) {
      const [rr, cc] = unkey(k);
      if (lv.goals.some((g, i) => g.type === 'mud' && rem[i] > 0) && mud[rr][cc]) v += smart ? 5 + mud[rr][cc] : 3;
      if (lv.goals.some((g, i) => g.type === 'yarn' && rem[i] > 0) && yarn[rr][cc]) v += smart ? 5 : 3;
      if (leaf[rr][cc]) v += smart ? 6 : 3;
    }
    if (junkGoal >= 0 && rem[junkGoal] > 0) {
      v += junkIn(g2, res.cleared) * (smart ? 10 : 5);
      // Junk drops one row for every cell cleared below it; the lower it ends up the better.
      for (let c = 0; c < 8; c++) {
        let below = 0;
        for (let r = 7; r >= 0; r--) {
          if (isJunk(g2[r][c])) v += below * (smart ? 2 + r * 0.6 : 1);
          if (res.cleared.has(key(r, c))) below++;
        }
      }
    }
    if (lv.goals.some((g, i) => g.type === 'bubbles' && rem[i] > 0)) v += popBubbles(bubble.map((row) => [...row]), res.cleared).length * (smart ? 5 : 3);
    for (const cr of res.created) lv.goals.forEach((g, i) => { if (g.type === 'power' && rem[i] > 0 && g.power === powerOf(cr.tile.special)) v += smart ? 8 : 4; });
    lv.goals.forEach((g, i) => { if (g.type === 'collect' && rem[i] > 0) v += res.collected[g.kind] * 1.5; });
    return v;
  };

  let moves = lv.moves;
  while (moves > 0 && !done()) {
    let best: [Pos, Pos] | null = null; let bestV = -1;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const b: Pos = [r + dr, c + dc]; const a: Pos = [r, c];
      if (b[0] > 7 || b[1] > 7 || locked(r, c) || locked(b[0], b[1]) || !isLegalSwap(grid, a, b)) continue;
      let v = value(a, b);
      // Swapping junk itself one row down.
      if (junkGoal >= 0 && dr === 1 && isJunk(grid[r][c])) v += smart ? 4 + r : 2;
      if (v > bestV) { bestV = v; best = [a, b]; }
    }
    if (!best) { shuffle(grid); continue; }
    const [a, b] = best;
    const forced = comboClears(grid, a, b) ?? [];
    swap(grid, a, b);
    moves--;
    raked = false;
    cascade([b, a], forced);
    if (!raked && leavesLeft() > 0) { spreadLeaf(leaf, (r, c) => mud[r][c] > 0 || yarn[r][c] || bubble[r][c]); syncLeaves(); }
    let n = 0; while (!hasMove(grid, locked) && n++ < 20) shuffle(grid);
  }
  const won = done();
  const movesLeft = won ? moves : 0;
  if (won && moves > 0) {
    // Victory lap, as in main.ts.
    const forced: number[] = [];
    for (let i = 0; i < Math.min(moves, 12); i++) {
      const r = Math.floor(Math.random() * 8); const c = Math.floor(Math.random() * 8);
      const t = grid[r][c];
      if (!t || t.special !== 'none' || t.kind < 0) continue;
      t.special = Math.random() < 0.5 ? 'zoomRow' : 'zoomCol';
      forced.push(key(r, c)); moves--;
    }
    score += moves * 100;
    cascade([], forced);
  }
  const left = lv.goals.map((g, i) => (g.type === 'score' ? Math.max(0, g.target - score) / g.target : Math.max(0, rem[i]) / (g.type === 'collect' || g.type === 'power' || g.type === 'junk' ? g.count : Math.max(1, total(g)))));
  return { won, movesLeft, score, left };
}

export function summarize(lv: Level, n: number, smart = true) {
  const runs = Array.from({ length: n }, () => play(lv, smart));
  const wins = runs.filter((o) => o.won);
  const pct = (x: number) => Math.round((x / n) * 100);
  const scores = wins.map((o) => o.score).sort((a, b) => a - b);
  const q = (p: number) => scores[Math.floor(p * (scores.length - 1))] ?? 0;
  const p85 = q(0.85);
  const stuck = lv.goals.map((_, i) => runs.filter((o) => !o.won && o.left[i] > 0).length);
  return {
    win: pct(wins.length),
    spare: wins.length ? +(wins.reduce((s, o) => s + o.movesLeft, 0) / wins.length).toFixed(1) : 0,
    p50: q(0.5),
    p85,
    stars: lv.stars.map((s) => (wins.length ? Math.round((wins.filter((o) => o.score >= s).length / wins.length) * 100) : 0)),
    stuck: stuck.map((s) => pct(s)),
  };
}


/** Moves the bot needed to finish each run when given plenty (Infinity = never finished). The bot ignores the move
 * limit, so the win rate at any limit M is the share of runs that needed M or fewer. */
export function movesNeeded(lv: Level, n: number, smart = true): number[] {
  const roomy = { ...lv, moves: 150 };
  return Array.from({ length: n }, () => { const o = play(roomy, smart); return o.won ? roomy.moves - o.movesLeft : Infinity; }).sort((a, b) => a - b);
}

/** Target bot win rate (%) for a level: a five-level saw (breather first, area finale last) that slowly drops. */
export function targetWin(id: number): number {
  const pos = (id - 1) % 5, area = Math.floor((id - 1) / 5);
  const off = area < 4 ? 0 : area < 8 ? 3 : area < 12 ? 6 : area < 16 ? 8 : 10;
  return [75, 65, 60, 60, 50][pos] - off;
}
