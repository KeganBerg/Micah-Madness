// Move-limit tuner. Run with: TUNE=1 npx vitest run scripts/tune.test.ts (SIM_FROM/SIM_TO/SIM_N as in sim.test.ts).
// For each level it plays the bot with no move limit, then reports the limit that hits targetWin() (clamped 18-45).
// Results go to <tmpdir>/micah-tune.txt. Re-check the chosen limits and star thresholds with sim.test.ts afterwards.
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';
import { LEVELS } from '../src/levels';
import { movesNeeded, targetWin } from './sim';

test.skipIf(!process.env.TUNE)('suggest move limits', () => {
  const out: string[] = [];
  const from = Number(process.env.SIM_FROM ?? 1) - 1;
  const to = Number(process.env.SIM_TO ?? LEVELS.length);
  const N = Number(process.env.SIM_N ?? 300);
  for (let i = from; i < to; i++) {
    const lv = LEVELS[i];
    const need = movesNeeded(lv, N);
    const winAt = (m: number) => Math.round((need.filter((x) => x <= m).length / N) * 100);
    const t = targetWin(lv.id);
    const ideal = need[Math.max(0, Math.ceil((t / 100) * N) - 1)];
    const pick = Math.min(45, Math.max(18, ideal));
    const flag = ideal > 45 ? ' TOO HARD at 45' : ideal < 18 ? ' too easy at 18' : '';
    out.push(`L${lv.id}\tmoves ${lv.moves} -> ${pick}\twin now ${winAt(lv.moves)}%\tat pick ${winAt(pick)}%\ttarget ${t}%\tmedian need ${need[N >> 1]}${flag}`);
  }
  writeFileSync(join(tmpdir(), 'micah-tune.txt'), out.join('\n') + '\n');
}, 3600000);
