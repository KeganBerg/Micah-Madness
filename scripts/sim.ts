// Level-balance bot used by scripts/sim.test.ts. Pure logic, no DOM.
import { bubbleCount, leafCount, mudCount, mudDepth, yarnCount, type Level, type Power } from '../src/levels';
import { applyClear, applyGravity, cloneGrid, comboClears, computeClear, createGrid, hasMove, isLegalSwap, key, popBubbles, shuffle, spreadLeaf, swap, unkey, type Grid, type Pos } from '../src/board';

export interface Outcome { won: boolean; movesLeft: number; score: number; left: number[] }

const powerOf = (sp: string): Power | null => (sp === 'bark' ? 'bark' : sp === 'micah' ? 'micah' : sp === 'zoomRow' || sp === 'zoomCol' ? 'zoomies' : null);

export function play(lv: Level, smart = true): Outcome {
  const grid: Grid = createGrid(8, 8, Math.random, lv.kinds);
  const mud = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => mudDepth(lv, r, c)));
  const yarn = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.yarn?.[r]?.[c] === 'y'));
  const leaf = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.leaves?.[r]?.[c] === 'l'));
  const bubble = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.bubbles?.[r]?.[c] === 'b'));
  const locked = (r: number, c: number) => yarn[r][c] || bubble[r][c];
  const total = (g: Level['goals'][number]) => (g.type === 'mud' ? mudCount(lv) : g.type === 'yarn' ? yarnCount(lv) : g.type === 'leaves' ? leafCount(lv) : g.type === 'bubbles' ? bubbleCount(lv) : 0);
  const leavesLeft = () => leaf.flat().filter(Boolean).length;
  let raked = false;
  const rem = lv.goals.map((g) => (g.type === 'collect' || g.type === 'power' ? g.count : g.type === 'score' ? g.target : total(g)));
  const syncLeaves = () => lv.goals.forEach((g, i) => g.type === 'leaves' && (rem[i] = leavesLeft()));
  let score = 0;
  const done = () => lv.goals.every((g, i) => (g.type === 'score' ? score >= g.target : rem[i] <= 0));

  const cascade = (pref: Pos[], forced: number[]) => {
    let chain = 1;
    for (;;) {
      const res = computeClear(grid, pref, forced);
      if (res.cleared.size === 0) break;
      score += res.cleared.size * 20 * chain + res.created.length * 100;
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
      applyClear(grid, res); applyGravity(grid, Math.random, lv.kinds);
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
      const v = value(a, b);
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
      if (!t || t.special !== 'none') continue;
      t.special = Math.random() < 0.5 ? 'zoomRow' : 'zoomCol';
      forced.push(key(r, c)); moves--;
    }
    score += moves * 100;
    cascade([], forced);
  }
  const left = lv.goals.map((g, i) => (g.type === 'score' ? Math.max(0, g.target - score) / g.target : Math.max(0, rem[i]) / (g.type === 'collect' || g.type === 'power' ? g.count : Math.max(1, total(g)))));
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

