// Greedy-player win-rate simulator for tuning levels. Run with: SIM=1 npx vitest run scripts/sim.test.ts
// Results go to <tmpdir>/micah-sim.txt. A greedy bot with no boosters is much weaker than a person.
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';
import { LEVELS, mudCount, yarnCount } from '../src/levels';
import { applyClear, applyGravity, comboClears, computeClear, createGrid, hasMove, isLegalSwap, key, shuffle, swap, unkey, type Grid, type Pos } from '../src/board';

function play(levelIdx: number): boolean {
  const lv = LEVELS[levelIdx];
  let grid: Grid = createGrid(8, 8, Math.random, lv.kinds);
  const mud = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.mud?.[r]?.[c] === 'm'));
  const yarn = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => lv.yarn?.[r]?.[c] === 'y'));
  const locked = (r: number, c: number) => yarn[r][c];
  const rem = lv.goals.map((g) => (g.type === 'collect' ? g.count : g.type === 'mud' ? mudCount(lv) : g.type === 'yarn' ? yarnCount(lv) : g.target));
  let score = 0;
  const done = () => lv.goals.every((g, i) => (g.type === 'score' ? score >= g.target : rem[i] <= 0));
  for (let m = 0; m < lv.moves; m++) {
    // greedy: pick the legal move with the most goal progress in its first clear
    let best: [Pos, Pos] | null = null; let bestV = -1;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const b: Pos = [r + dr, c + dc]; const a: Pos = [r, c];
      if (b[0] > 7 || b[1] > 7 || locked(r, c) || locked(b[0], b[1]) || !isLegalSwap(grid, a, b)) continue;
      swap(grid, a, b);
      const res = computeClear(grid, [b, a], []);
      swap(grid, a, b);
      let v = res.cleared.size + res.created.length * 3 + Math.random();
      for (const k of res.cleared) { const [rr, cc] = unkey(k); if (mud[rr][cc] || yarn[rr][cc]) v += 3; }
      lv.goals.forEach((g, i) => { if (g.type === 'collect' && rem[i] > 0) v += res.collected[g.kind] * 1.5; });
      if (v > bestV) { bestV = v; best = [a, b]; }
    }
    if (!best) { shuffle(grid); continue; }
    const [a, b] = best;
    const forced0 = comboClears(grid, a, b) ?? [];
    swap(grid, a, b);
    let pref: Pos[] = [b, a]; let forced: number[] = forced0; let chain = 1;
    for (;;) {
      const res = computeClear(grid, pref, forced);
      if (res.cleared.size === 0) break;
      score += res.cleared.size * 20 * chain + res.created.length * 100;
      lv.goals.forEach((g, i) => { if (g.type === 'collect') rem[i] -= res.collected[g.kind]; });
      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        if (mud[r][c]) { mud[r][c] = false; lv.goals.forEach((g, i) => g.type === 'mud' && rem[i]--); }
        if (yarn[r][c]) { yarn[r][c] = false; lv.goals.forEach((g, i) => g.type === 'yarn' && rem[i]--); }
      }
      applyClear(grid, res); applyGravity(grid, Math.random, lv.kinds);
      chain++; pref = []; forced = [];
    }
    if (done()) return true;
    let n = 0; while (!hasMove(grid, locked) && n++ < 20) shuffle(grid);
  }
  void key;
  return done();
}

test.skipIf(!process.env.SIM)('simulate win rates', () => {
  const out: string[] = [];
  for (let i = 0; i < LEVELS.length; i++) {
    let w = 0; const N = 60;
    for (let t = 0; t < N; t++) if (play(i)) w++;
    out.push(`L${i + 1}: ${Math.round((w / N) * 100)}%`);
  }
  writeFileSync(join(tmpdir(), 'micah-sim.txt'), out.join('\n'));
}, 600000);
