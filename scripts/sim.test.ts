// Level-balance simulator. Run with: SIM=1 npx vitest run scripts/sim.test.ts
// SIM_WINTER=1 or SIM_ARK=1 runs Micah's Winter or Noah's Ark instead of the map.
// Optional: SIM_FROM=41 / SIM_TO=45 pick levels, SIM_N=200 sets runs per level, SIM_BOT=greedy uses the old weaker bot.
// Results go to <tmpdir>/micah-sim.txt: win rate, spare moves on a win, median winning score (victory lap included),
// how often each star threshold is reached by a win, and how often each goal was left unfinished.
// The bot looks one step ahead and never uses boosters or streak Zoomies, so a person does noticeably better.
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'vitest';
import { LEVELS } from '../src/levels';
import { WINTER_LEVELS } from '../src/winter';
import { ARK_LEVELS } from '../src/ark';
import { play, summarize } from './sim';

test.skipIf(!process.env.SIM)('simulate win rates', () => {
  const out: string[] = [];
  const tag = process.env.SIM_WINTER ? 'W' : process.env.SIM_ARK ? 'A' : 'L';
  const set = process.env.SIM_WINTER ? WINTER_LEVELS : process.env.SIM_ARK ? ARK_LEVELS : LEVELS;
  const from = Number(process.env.SIM_FROM ?? 1) - 1;
  const to = Number(process.env.SIM_TO ?? set.length);
  const N = Number(process.env.SIM_N ?? 100);
  const smart = process.env.SIM_BOT !== 'greedy';
  for (let i = from; i < to; i++) {
    const s = summarize(set[i], N, smart);
    out.push(`${tag}${i + 1}\twin ${s.win}%\tspare ${s.spare}\tmedian ${s.p50}\tp85 ${s.p85}\tstars ${s.stars.join('/')}%\tstuck ${s.stuck.join('/')}%`);
  }
  writeFileSync(join(tmpdir(), 'micah-sim.txt'), out.join('\n') + '\n');
}, 3600000);

// Catches a level change that makes a level unwinnable: even the bot wins every level well over a third of the time.
test('the bot can win every level', () => {
  for (const lv of [...LEVELS, ...WINTER_LEVELS, ...ARK_LEVELS]) {
    let won = false;
    for (let t = 0; t < 25 && !won; t++) won = play(lv).won;
    if (!won) throw new Error(`L${lv.id} was not won in 25 bot runs`);
  }
}, 120000);
