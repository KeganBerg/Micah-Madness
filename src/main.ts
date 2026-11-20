import './style.css';
import {
  applyClear,
  applyGravity,
  cloneGrid,
  comboClears,
  computeClear,
  createGrid,
  dustTarget,
  findMove,
  findRuns,
  hasMove,
  isAdjacent,
  isLegalSwap,
  key,
  newTile,
  shuffle,
  swap,
  transformKind,
  unkey,
  type ClearResult,
  type Grid,
  type Pos,
  type Special,
  type Tile,
} from './board';
import { BOOSTER_ICONS, KINDS, UI, YARN_OVERLAY, svg } from './art';
import { COSTUMES, costumeById, costumeUrl, isUnlocked, unlockText, type Costume } from './costumes';
import { startYard } from './roam';
import { sceneryHTML, wireScenery } from './scenery';
import { LEVELS, ZONES, mudCount, mudDepth, yarnCount, type Goal, type Level, type Power } from './levels';
import {
  BOOSTERS,
  DAILY_REWARDS,
  claimDaily,
  dailyClaimable,
  exportCode,
  freshSave,
  importCode,
  load,
  onSavedElsewhere,
  persist,
  requestDurableStorage,
  starsToSpend,
  totalStars,
  unlockedUpTo,
  type BoosterId,
  type SaveData,
} from './save';
import { DECOR, yardScene } from './yard';
import { runLaunch } from './launch';
import { floatLabel, installTapFx, pop, pressDown, pressUp, replay } from './tap';
import { BADGES, awardBadges, bump, isEarned, type Badge } from './badges';
import { playMusic, setMusic, setSound, sfx } from './sound';
import { callout, confetti, confettiRain, countUp, glow, hearts, hype, ring, shakeBoard } from './juice';
import { canVibrate, haptic, setHaptics } from './haptics';
import { shareCard } from './share';
import { STAMPS_FOR_COAT, WEEKLY_BISCUITS, WEEKLY_ID, claimWeekly, weeklyLevel, weeklyOpen, weeklyWonThisWeek } from './weekly';
import { canPrompt, installSteps, isInstalled, promptInstall, setupInstall } from './install';

const ROWS = 8;
const COLS = 8;
const app = document.querySelector<HTMLDivElement>('#app')!;
let save: SaveData = load();
// Every button gives a soft tap; the board and Micah have their own sounds.
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button');
  if (b && !b.disabled && !b.matches('.map-micah, .buy, .claim, .play, .tool')) sfx.tap();
});
const canSave = persist(save);
requestDurableStorage();
setupInstall();
window.addEventListener('pagehide', () => persist(save));
// Phones often close a backgrounded app without a pagehide, so save whenever the game is hidden.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persist(save);
});
// Another tab saved: adopt its save so this tab never writes stale progress back over it.
onSavedElsewhere((data) => {
  save = data;
  setSound(save.sound);
  setMusic(save.music);
});
setSound(save.sound);
setMusic(save.music);
setHaptics(save.haptics);
installTapFx();

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const h = (html: string): HTMLElement => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};
/** Clean-up for whatever screen is showing (timers, observers), run before the next one replaces it. */
let leaveScreen: (() => void) | null = null;
function mount(screen: HTMLElement, onLeave?: () => void): void {
  leaveScreen?.();
  leaveScreen = onLeave ?? null;
  app.replaceChildren(screen);
}
const icon = (id: string, cls = 'icon') => svg(BOOSTER_ICONS[id], cls);
/** Micah, in whatever she's wearing today. */
const micahImg = (cls: string, alt = '') =>
  `<img src="${costumeUrl(save.costume)}" class="${cls}" alt="${alt}" draggable="false">`;
const micahAlt = () => `Micah in her ${costumeById(save.costume).name.toLowerCase()}`;
const stars3 = (n: number) => [1, 2, 3].map((s) => `<i class="${s <= n ? 'on' : ''}">${UI.star}</i>`).join('');

function goalIcon(goal: Goal): string {
  if (goal.type === 'collect') return svg(KINDS[goal.kind].svg, 'goal-icon');
  if (goal.type === 'mud') return svg(BOOSTER_ICONS.mud, 'goal-icon');
  if (goal.type === 'yarn') return svg(BOOSTER_ICONS.yarn, 'goal-icon');
  if (goal.type === 'power') return svg(BOOSTER_ICONS[goal.power], 'goal-icon');
  return `<span class="goal-score">${UI.star}</span>`;
}
const POWER_NAMES: Record<Power, [string, string]> = {
  zoomies: ['Zoomies', 'Zoomies'],
  bark: ['Big Bark', 'Big Barks'],
  micah: ['Micah piece', 'Micah pieces'],
};
const powerOf = (s: Special): Power => (s === 'bark' ? 'bark' : s === 'micah' ? 'micah' : 'zoomies');
function goalText(goal: Goal): string {
  if (goal.type === 'collect') return `Collect ${goal.count} ${KINDS[goal.kind].plural.toLowerCase()}`;
  if (goal.type === 'mud') return 'Wash away every mud patch';
  if (goal.type === 'yarn') return 'Untangle every ball of yarn';
  if (goal.type === 'power') return `Make ${goal.count} ${POWER_NAMES[goal.power][goal.count === 1 ? 0 : 1]}`;
  return `Score ${goal.target.toLocaleString()} points`;
}

const PAW_POINTER = `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="62" rx="20" ry="17" fill="#fff" stroke="#173a52" stroke-width="5"/><ellipse cx="24" cy="40" rx="9" ry="11" fill="#fff" stroke="#173a52" stroke-width="5"/><ellipse cx="40" cy="25" rx="9" ry="11" fill="#fff" stroke="#173a52" stroke-width="5"/><ellipse cx="60" cy="25" rx="9" ry="11" fill="#fff" stroke="#173a52" stroke-width="5"/><ellipse cx="76" cy="40" rx="9" ry="11" fill="#fff" stroke="#173a52" stroke-width="5"/></svg>`;

/** One tip the first time a mechanic appears, so the difficulty ramps with the teaching. */
const TIPS: Record<number, string> = {
  1: 'Drag a piece onto a neighbour to swap them. Three or more in a line clears them.',
  2: 'Line up four in a row to make Zoomies, which clears its whole row or column.',
  3: 'Make an L or T shape to get a Big Bark, which clears the 3×3 area around it.',
  4: 'Mud sits under pieces. Make a match on top of a muddy square to wash it.',
  5: 'Five in a row makes a Micah piece. Swap her with any piece to clear every one of that kind.',
  6: 'Swap two power-ups into each other for a bigger blast.',
  21: 'Yarn ties a piece down so you can\u2019t swap it. Make a match through it, or blast it, to untangle it.',
  26: 'Big score goals: chain power-ups together and let the cascades do the work.',
  31: 'Fewer moves from here on. Save your power-ups for the hardest corner.',
  36: 'Micah\u2019s birthday! Every trick you\u2019ve learned comes together.',
  41: 'Dark mud is deep mud. Wash it once to make it ordinary mud, then once more to clean it.',
  46: 'New goal: make power-ups! Four in a row makes Zoomies, an L or T makes a Big Bark, five makes Micah.',
  56: 'The last stretch. Look for five in a row: some goals need a Micah piece.',
};
const streakZoomies = () => Math.min(3, save.winStreak);

/** In-level tools arrive one at a time, so level 1 is just the board. */
const TOOL_UNLOCK: Record<'treat' | 'squirrel' | 'leash' | 'dust' | 'bed', number> = { treat: 3, squirrel: 5, leash: 7, dust: 9, bed: 11 };
const TOOL_ORDER = ['treat', 'squirrel', 'leash', 'dust', 'bed'] as const;
/** A tool is available from its level on, or anywhere once the player has got that far. */
const toolOpen = (id: keyof typeof TOOL_UNLOCK, levelId: number) => Math.max(levelId, unlockedUpTo(save)) >= TOOL_UNLOCK[id];

// ───────────────────────────── Map screen ─────────────────────────────

function showMap(scrollTo?: number, walkFrom?: number, after?: () => void): void {
  playMusic('map');
  const unlocked = Math.min(unlockedUpTo(save), LEVELS.length);
  const spacing = 112;
  const width = 360;
  const top = 120;
  const height = top + LEVELS.length * spacing + 140;
  const nodePos = (i: number) => {
    const y = height - 110 - i * spacing;
    const x = width / 2 + Math.sin(i * 0.95) * 105;
    return { x, y };
  };

  // Area bands, bottom to top (Area 1 at the bottom of the map).
  const bands = ZONES.map((_, zi) => ({
    top: zi === ZONES.length - 1 ? 0 : nodePos(zi * 5 + 4).y - spacing / 2,
    bottom: zi === 0 ? height : nodePos(zi * 5).y + spacing / 2,
  }));

  const screen = h(`
    <div class="screen map-screen">
      <header class="topbar">
        <div class="brand">${micahImg('brand-face')}<span>Micah Madness</span></div>
        <button class="wallet" data-act="shop" aria-label="${save.biscuits} biscuits. Open the Treat Shop">${icon('biscuit', 'biscuit-icon')}<b>${save.biscuits}</b><span class="add">${UI.plus}</span></button>
        <button class="round-btn" data-act="settings" aria-label="Settings and how to play">${UI.settings}</button>
      </header>
      <div class="map-scroll ${Object.keys(save.stars).length === 0 ? 'has-welcome' : ''}">
        <div class="map" style="height:${height}px">
          <div class="scenery" aria-hidden="true"></div>
          ${ZONES.map((z, zi) => {
            const first = nodePos(zi * 5);
            const side = first.x < width / 2 ? 'right:16px' : 'left:16px';
            return `<div class="zone-banner" style="top:${first.y + 8}px;${side}"><small>Area ${zi + 1}</small><b>${z.name}</b></div>`;
          }).join('')}
          ${LEVELS.map((lv, i) => {
            const p = nodePos(i);
            const stars = save.stars[lv.id] ?? 0;
            const state = lv.id < unlocked || stars > 0 ? 'done' : lv.id === unlocked ? 'current' : 'locked';
            return `<button class="node ${state}" data-level="${lv.id}" aria-label="Level ${lv.id}, ${state === 'locked' ? 'locked' : `${stars} of 3 stars`}" style="left:${(p.x / width) * 100}%;top:${p.y}px" ${state === 'locked' ? 'disabled' : ''}>
                <span class="num">${state === 'locked' ? UI.lock : lv.id}</span>
                ${state === 'locked' ? '' : `<span class="node-stars">${stars3(stars)}</span>`}
              </button>`;
          }).join('')}
          <div class="map-end" style="top:${nodePos(LEVELS.length - 1).y - 196}px">
            ${save.stars[LEVELS.length] ? `<button class="map-end-sign done" data-act="finale"><b>You finished!</b><small>Tap to see Micah\u2019s big finish</small></button>` : `<div class="map-end-sign"><b>More adventures</b><small>coming soon</small></div>`}
          </div>
          <button class="map-micah" aria-label="Micah">${micahImg('micah-idle')}</button>
        </div>
      </div>
      ${canSave ? '' : '<p class="save-warning">This browser isn\u2019t saving progress, so it resets when you close the page. Private browsing usually causes this.</p>'}
      ${Object.keys(save.stars).length === 0
        ? `<div class="welcome">
            ${micahImg('micah-idle', micahAlt())}
            <div><h2>Help Micah fetch her toys</h2>
            <p>Swap two neighbouring pieces to line up three of a kind. Each level has a goal and a move limit.</p></div>
            <button class="btn" data-act="start">Start level 1</button>
          </div>`
        : ''}
      ${weeklyOpen(save) && Object.keys(save.stars).length > 0
        ? `<button class="weekly-chip ${weeklyWonThisWeek(save) ? 'done' : ''}" data-act="weekly">${UI.paw}<span><b>Weekly Walk</b><small>${weeklyWonThisWeek(save) ? 'Done. New one Monday' : 'New this week'}</small></span></button>`
        : ''}
      <nav class="dock" aria-label="Main">
        <button class="dock-btn" data-act="yard">${UI.home}<span>Yard</span>${starsToSpend(save) ? `<em class="count">${starsToSpend(save)}</em>` : ''}</button>
        <button class="dock-btn" data-act="daily">${UI.gift}<span>Daily</span>${dailyClaimable(save) ? '<em class="count dot">1</em>' : ''}</button>
        <button class="dock-btn" data-act="collar">${UI.award}<span>Collar</span><em class="tally">${save.badges.length}/${BADGES.length}</em></button>
        <button class="dock-btn" data-act="closet">${UI.shirt}<span>Closet</span></button>
        <button class="dock-btn" data-act="shop2">${UI.bag}<span>Shop</span></button>
      </nav>
    </div>`);

  screen.querySelector('[data-act="yard"]')!.addEventListener('click', () => showYard());
  screen.querySelector('[data-act="finale"]')?.addEventListener('click', () => showFinale());
  screen.querySelector('[data-act="weekly"]')?.addEventListener('click', () => showWeekly());
  screen.querySelector('[data-act="daily"]')!.addEventListener('click', () => showDaily());
  screen.querySelector('[data-act="collar"]')!.addEventListener('click', () => showCollar());
  screen.querySelector('[data-act="closet"]')!.addEventListener('click', () => showWardrobe(() => showMap()));
  screen.querySelector('[data-act="shop2"]')!.addEventListener('click', () => showShop(() => showMap()));
  screen.querySelector('[data-act="shop"]')!.addEventListener('click', () => showShop(() => showMap()));
  screen.querySelector('[data-act="settings"]')!.addEventListener('click', () => showSettings());
  screen.querySelector('[data-act="start"]')?.addEventListener('click', () => showLevelIntro(LEVELS[0]));
  screen.querySelectorAll<HTMLButtonElement>('.node').forEach((n) =>
    n.addEventListener('click', () => showLevelIntro(LEVELS[Number(n.dataset.level) - 1])),
  );

  // Scenery is drawn at the map's real pixel width so props keep their shape on any phone,
  // and redrawn if that width changes.
  const mapEl = screen.querySelector<HTMLElement>('.map')!;
  const sceneEl = screen.querySelector<HTMLElement>('.scenery')!;
  let unwire = () => {};
  let drawnWidth = 0;
  const paintScenery = () => {
    const w = Math.round(mapEl.clientWidth);
    if (!w || w === drawnWidth) return;
    drawnWidth = w;
    unwire();
    const sx = w / width;
    const banners = ZONES.map((_, zi) => {
      const first = nodePos(zi * 5);
      const bw = 150;
      return { x: first.x < width / 2 ? w - 16 - bw : 16, y: first.y + 8, w: bw, h: 60 };
    });
    sceneEl.innerHTML = sceneryHTML({
      width: w, height, bands, banners,
      nodes: LEVELS.map((_, i) => { const p = nodePos(i); return { x: p.x * sx, y: p.y }; }),
    });
    unwire = wireScenery(sceneEl, playScenerySound, (text) => toast(text));
  };
  const resizeWatch = new ResizeObserver(paintScenery);
  // While you decide, Micah potters about beside her level: sniffs, scratches, paces a step or two.
  let idleTimer = 0;
  mount(screen, () => (clearTimeout(idleTimer), resizeWatch.disconnect(), unwire()));
  paintScenery();
  resizeWatch.observe(mapEl);

  // Micah stands just beside the node she is on, on the side away from the path's next bend.
  const micahEl = screen.querySelector<HTMLButtonElement>('.map-micah')!;
  const placeMicah = (lv: number) => {
    const p = nodePos(lv - 1);
    const next = nodePos(Math.min(lv, LEVELS.length - 1));
    const side = next.x >= p.x ? -1 : 1; // stand opposite the direction the path goes
    micahEl.style.left = `${((p.x + side * 52) / width) * 100}%`;
    micahEl.style.top = `${p.y - 56}px`;
    micahEl.classList.toggle('facing-left', side > 0);
    micahEl.style.translate = '';
  };
  const fidget = () => {
    idleTimer = window.setTimeout(() => {
      if (!micahEl.isConnected) return;
      if (!micahEl.matches('.walking, .pace')) {
        micahEl.classList.remove('sniff', 'scratch', 'tilt');
        void micahEl.offsetWidth;
        const r = Math.random();
        if (r < 0.4) micahEl.classList.add('sniff');
        else if (r < 0.6) micahEl.classList.add('scratch');
        else {
          // Trot a few steps away and back. She moves with `translate`, not `left`, so the
          // phone slides her on the GPU without re-laying-out the whole map every frame.
          const away = !micahEl.style.translate;
          const dx = (Math.random() < 0.5 ? -1 : 1) * 18;
          micahEl.classList.add('pace');
          micahEl.classList.toggle('facing-left', away ? dx < 0 : !micahEl.classList.contains('facing-left'));
          micahEl.style.translate = away ? `${dx}px 0` : '';
          setTimeout(() => micahEl.classList.remove('pace'), 1250);
        }
      }
      fidget();
    }, 2500 + Math.random() * 3500);
  };
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) fidget();
  micahEl.addEventListener('click', () => {
    sfx.bark();
    micahEl.classList.remove('tilt');
    void micahEl.offsetWidth;
    micahEl.classList.add('tilt');
  });
  if (walkFrom && walkFrom !== unlocked) {
    placeMicah(walkFrom);
    void micahEl.offsetWidth;
    requestAnimationFrame(() => {
      micahEl.classList.add('walking');
      placeMicah(unlocked);
      for (let i = 0; i < 4; i++) setTimeout(() => sfx.step(), 120 + i * 250);
      setTimeout(() => {
        micahEl.classList.remove('walking');
        after?.();
      }, 1100);
    });
  } else {
    placeMicah(unlocked);
    if (after) setTimeout(after, 0);
  }
  if (!after) maybeNudgeInstall();

  const scroller = screen.querySelector<HTMLElement>('.map-scroll')!;
  const target = nodePos((walkFrom ?? scrollTo ?? unlocked) - 1).y;
  scroller.scrollTop = scroller.classList.contains('has-welcome') ? scroller.scrollHeight : target - scroller.clientHeight / 2;
}

/** Once a player is hooked (3 levels in), suggest the Home Screen so the phone doesn't clear their save. */
function maybeNudgeInstall(): void {
  if (isInstalled() || save.seen.includes('install') || Object.keys(save.stars).length < 3) return;
  window.setTimeout(() => {
    if (document.querySelector('.modal-wrap') || !document.querySelector('.map-screen')) return;
    save.seen.push('install');
    persist(save);
    const m = modal(`
      <header class="modal-head">
        ${micahImg('modal-avatar cheer')}
        <div><p class="eyebrow">Keep your progress safe</p><h2>Put Micah on your Home Screen</h2></div>
        <button class="close" aria-label="Close">${UI.close}</button>
      </header>
      <p class="body">Phones sometimes tidy away saved games for websites you haven\u2019t opened in a while. Add Micah to your Home Screen and she stays put, opens like an app and works offline.</p>
      ${installSteps()}
      ${canPrompt() ? '<button class="btn" data-act="install">Add to Home Screen</button>' : '<button class="btn" data-act="ok">Got it</button>'}`, () => {});
    m.querySelector('.close')!.addEventListener('click', () => m.remove());
    m.querySelector('[data-act="ok"]')?.addEventListener('click', () => m.remove());
    m.querySelector('[data-act="install"]')?.addEventListener('click', async () => {
      m.remove();
      if (await promptInstall()) toast('Micah is on your Home Screen.');
    });
  }, 900);
}

/** What happens when Micah wins the race to the thing that fell. */
const GULPS = [
  'Micah ate {x}. She regrets nothing.',
  'Gulp. That was {x}. Micah would like seconds.',
  'Too slow! Micah swallowed {x} whole.',
  'Micah ate {x}. Delicious, apparently.',
  '{x}? Gone. Micah is very proud of herself.',
];

const SCENERY_SOUNDS: Record<string, () => void> = {
  boing: () => sfx.pop(2),
  pop: () => sfx.pop(6),
  rustle: () => sfx.whoosh(),
  whoosh: () => sfx.whoosh(),
  flutter: () => sfx.select(),
  tweet: () => sfx.squirrel(),
  bark: () => sfx.bark(),
  woof: () => sfx.bark(),
  knock: () => sfx.step(),
  dig: () => sfx.step(),
  scuttle: () => sfx.step(),
  splash: () => sfx.splash(),
  chime: () => sfx.coin(),
  tap: () => sfx.tap(),
};
const playScenerySound = (name: string) => SCENERY_SOUNDS[name]?.();

// ───────────────────────────── Micah's Yard ─────────────────────────────

function showYard(): void {
  playMusic('map');
  const owned = save.decor;
  const left = starsToSpend(save);
  const done = owned.length === DECOR.length;
  const screen = h(`
    <div class="screen yard-screen">
      <header class="topbar">
        <button class="round-btn" data-act="back" aria-label="Back to map">${UI.back}</button>
        <div class="brand"><span>Micah's Yard</span></div>
        <div class="wallet star-wallet" aria-label="${left} stars to spend"><span class="star-pill">${UI.star}</span><b>${left}</b></div>
      </header>
      <div class="yard-body">
        <div class="yard-frame">${yardScene(owned, costumeUrl(save.costume))}</div>
        <p class="yard-hint">${owned.length ? 'Tap anything Micah owns and she\u2019ll go play with it. Tap the grass to call her over.' : 'Tap the grass to call Micah over. Build things below and she\u2019ll play with them.'} <b>Watch the sky:</b> if something falls, tap it before Micah eats it. She will eat anything.</p>
        <div class="yard-actions">
          <button class="btn secondary" data-act="closet">${micahImg('')}Dress up Micah</button>
        </div>
        <div class="yard-progress">
          <p><b>${owned.length} of ${DECOR.length}</b> built</p>
          <div class="bar"><i style="width:${(owned.length / DECOR.length) * 100}%"></i></div>
        </div>
        <p class="notice">${
          done
            ? 'Micah\u2019s yard is finished. Every star you earn from now on is a bragging right.'
            : left
              ? 'Spend the stars you earn in levels to build Micah\u2019s yard.'
              : 'You have no stars to spend yet. Win levels to earn up to three stars each.'
        }</p>
        <ul class="shop-list">
          ${DECOR.map((d) => {
            const has = owned.includes(d.id);
            return `<li class="${has ? 'owned' : ''}" data-id="${d.id}">
              ${svg(d.svg, 'booster-icon')}
              <div class="shop-info"><b>${d.name}</b><span>${d.desc}</span></div>
              ${has
                ? `<span class="built">${UI.check}Built</span>`
                : `<button class="buy" data-id="${d.id}" aria-label="Build ${d.name} for ${d.cost} stars" ${left < d.cost ? 'disabled' : ''}><span class="star-pill">${UI.star}</span>${d.cost}</button>`}
            </li>`;
          }).join('')}
        </ul>
      </div>
    </div>`);
  screen.querySelector('[data-act="back"]')!.addEventListener('click', () => showMap());
  screen.querySelector('[data-act="closet"]')!.addEventListener('click', () => showWardrobe(() => showYard()));
  screen.querySelectorAll<HTMLButtonElement>('.buy').forEach((b) =>
    b.addEventListener('click', () => {
      const d = DECOR.find((x) => x.id === b.dataset.id)!;
      if (starsToSpend(save) < d.cost || save.decor.includes(d.id)) return;
      save.spentStars += d.cost;
      save.decor.push(d.id);
      const tags = awardBadges(save);
      persist(save);
      sfx.build();
      showYard();
      const row = app.querySelector(`.shop-list li[data-id="${d.id}"]`);
      pop(row?.querySelector('.booster-icon'));
      pop(row?.querySelector('.built'));
      celebrate(tags);
    }),
  );
  let stopRoam: (() => void) | null = null;
  mount(screen, () => stopRoam?.());
  stopRoam = startYard(screen.querySelector<SVGSVGElement>('.yard-scene')!, owned, sfx, {
    onSnack: (snack, saved) => {
      bump(save, saved ? 'saves' : 'gulps');
      if (saved) save.biscuits += 2;
      const tags = awardBadges(save);
      persist(save);
      haptic.tick();
      if (saved) toast(`${icon('biscuit', 'biscuit-icon')} Saved ${snack.name}! +2 biscuits`);
      else {
        const line = GULPS[(save.tally.gulps ?? 1) % GULPS.length].replace('{x}', snack.name);
        toast(line[0].toUpperCase() + line.slice(1));
      }
      if (tags.length) window.setTimeout(() => celebrate(tags), 1200);
    },
  });
}

// ───────────────────────────── Wardrobe ─────────────────────────────

/** Highest level cleared so far (costumes unlock as you go). */
const clearedUpTo = () => unlockedUpTo(save) - 1;

function showWardrobe(onClose: () => void): void {
  const card = (c: Costume) => {
    const open = isUnlocked(c, clearedUpTo(), save.wardrobe);
    const wearing = save.costume === c.id;
    const price = 'biscuits' in c.unlock ? c.unlock.biscuits : 0;
    const state = wearing ? 'wearing' : open ? 'open' : price && save.biscuits >= price ? 'locked affordable' : 'locked';
    const label = wearing
      ? 'Wearing'
      : open
        ? 'Wear'
        : price
          ? `${icon('biscuit', 'biscuit-icon')}${price}`
          : `${UI.lock}${unlockText(c)}`;
    return `<li><button class="${state}" data-id="${c.id}" aria-pressed="${wearing}" aria-label="${c.name}: ${open ? (wearing ? 'wearing' : 'wear') : unlockText(c)}">
      <img src="${costumeUrl(c.id)}" alt="" draggable="false"><b>${c.name}</b><small>${label}</small></button></li>`;
  };
  const render = () => {
    const c = costumeById(save.costume);
    return `
    <div class="modal-head">
      ${micahImg('modal-avatar micah-idle')}
      <div><p class="eyebrow">Micah\u2019s closet</p><h2>${c.name}</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <p class="body">${c.desc} Clear levels to unlock more outfits, or buy some with biscuits. You have ${save.biscuits}.</p>
    <ul class="wardrobe">${COSTUMES.map(card).join('')}</ul>`;
  };
  const m = modal(render(), onClose);
  const close = () => (m.remove(), onClose());
  const wire = () => {
    m.querySelector('.close')!.addEventListener('click', close);
    m.querySelectorAll<HTMLButtonElement>('.wardrobe button').forEach((b) =>
      b.addEventListener('click', () => {
        const c = costumeById(b.dataset.id!);
        if (!isUnlocked(c, clearedUpTo(), save.wardrobe)) {
          if (!('biscuits' in c.unlock)) {
            sfx.warn();
            toast(`<span><b>${c.name}</b> unlocks when you clear level ${'level' in c.unlock ? c.unlock.level : ''}.</span>`);
            return;
          }
          if (save.biscuits < c.unlock.biscuits) {
            sfx.warn();
            toast(`<span>You need ${c.unlock.biscuits - save.biscuits} more biscuits for <b>${c.name}</b>.</span>`);
            return;
          }
          save.biscuits -= c.unlock.biscuits;
          save.wardrobe.push(c.id);
          sfx.coin();
        } else {
          sfx.select();
        }
        save.costume = c.id;
        persist(save);
        m.querySelector('.modal')!.innerHTML = render();
        wire();
        pop(m.querySelector('.modal-head .modal-avatar'));
      }),
    );
  };
  wire();
}

// ───────────────────────────── Daily treat ─────────────────────────────

function showDaily(): void {
  const day = dailyClaimable(save);
  const current = day || save.daily.day;
  const m = modal(`
    <div class="modal-head">
      ${icon('treat', 'modal-avatar')}
      <div><p class="eyebrow">Come back every day</p><h2>Daily treat</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <p class="body">Claim a treat once a day. Come back on consecutive days for bigger rewards. Missing a day starts you back at day 1.</p>
    <ol class="daily-grid">
      ${DAILY_REWARDS.map((r, i) => {
        const n = i + 1;
        const state = n < current || (!day && n === current) ? 'claimed' : n === current ? 'today' : '';
        return `<li class="${state}"><small>Day ${n}</small>${r.booster ? icon(r.booster, 'booster-icon') : icon('biscuit', 'booster-icon')}<span>${r.label}</span></li>`;
      }).join('')}
    </ol>
    ${day
      ? `<button class="btn claim">Claim day ${day}: ${DAILY_REWARDS[day - 1].label}</button>`
      : `<p class="notice">Today's treat is claimed. Come back tomorrow for day ${(save.daily.day % 7) + 1}.</p>`}`,
    () => showMap(),
  );
  m.querySelector('.close')!.addEventListener('click', () => (m.remove(), showMap()));
  m.querySelector('.claim')?.addEventListener('click', () => {
    claimDaily(save);
    const tags = awardBadges(save);
    persist(save);
    sfx.coin();
    m.remove();
    showDaily();
    const li = document.querySelectorAll('.daily-grid li')[save.daily.day - 1];
    pop(li?.querySelector('.booster-icon'));
    floatLabel(li, '+1');
    celebrate(tags);
  });
}

// ───────────────────────────── Modals ─────────────────────────────

// The visible height on iPhone Safari changes as its toolbars show and hide; pop-ups size to it.
const syncViewportHeight = () =>
  document.documentElement.style.setProperty('--vvh', `${Math.round(window.visualViewport ? window.visualViewport.height * window.visualViewport.scale : window.innerHeight)}px`);
syncViewportHeight();
window.visualViewport?.addEventListener('resize', syncViewportHeight);
window.addEventListener('resize', syncViewportHeight);

let dialogCount = 0;
function modal(inner: string, onClose?: () => void): HTMLElement {
  const m = h(`<div class="modal-wrap"><div class="modal">${inner}</div></div>`);
  if (onClose) {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        m.remove();
        onClose();
      }
    });
  }
  // A lone main button at the end becomes a sticky footer, so it never scrolls out of view.
  const last = m.querySelector('.modal')!.lastElementChild;
  if (last?.classList.contains('btn')) {
    const foot = document.createElement('div');
    foot.className = 'actions';
    last.replaceWith(foot);
    foot.append(last);
  }
  const box = m.querySelector<HTMLElement>('.modal')!;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  // Screen readers announce the pop-up by its heading.
  const title = box.querySelector('h2');
  if (title) {
    title.id ||= `dlg-${++dialogCount}`;
    box.setAttribute('aria-labelledby', title.id);
  }
  // Everything behind the pop-up is out of reach (tab, screen reader) until it closes,
  // then focus goes back to whatever opened it.
  const opener = document.activeElement as HTMLElement | null;
  // The screen behind may be redrawn while the pop-up is open, so remember how to find the opener again.
  const openerSel = opener?.dataset.act ? `[data-act="${opener.dataset.act}"]` : opener?.dataset.level ? `[data-level="${opener.dataset.level}"]` : '';
  const behind = [...document.body.children].filter((el): el is HTMLElement => el instanceof HTMLElement && !el.inert);
  behind.forEach((el) => (el.inert = true));
  new MutationObserver((_, obs) => {
    if (m.isConnected) return;
    obs.disconnect();
    behind.forEach((el) => (el.inert = false));
    if (document.activeElement && document.activeElement !== document.body) return;
    const back = opener?.isConnected ? opener : openerSel ? document.querySelector<HTMLElement>(`#app ${openerSel}`) : null;
    back?.focus({ preventScroll: true });
  }).observe(document.body, { childList: true });
  document.body.append(m);
  // Keyboard: focus starts inside the pop-up, Escape closes it the same way the close button does.
  // Focus starts on the main action when there is one (Enter plays), otherwise on Close.
  requestAnimationFrame(() =>
    (box.querySelector<HTMLElement>('.modal > .actions:last-child .btn:not(.danger)') ?? box.querySelector<HTMLElement>('.close, button'))?.focus({ preventScroll: true }),
  );
  const onKey = (e: KeyboardEvent) => {
    if (!m.isConnected) return document.removeEventListener('keydown', onKey);
    if (e.key !== 'Escape' || document.querySelector('.modal-wrap:last-of-type') !== m) return;
    const close = m.querySelector<HTMLButtonElement>('.close');
    if (close) close.click();
    else if (onClose) (m.remove(), onClose());
  };
  document.addEventListener('keydown', onKey);
  return m;
}

function showLevelIntro(level: Level): void {
  const picks: Record<'zoomies' | 'micah', boolean> = { zoomies: false, micah: false };
  const zone = ZONES[level.zone];
  const m = modal(
    `
    <div class="modal-head">
      ${micahImg('modal-avatar micah-idle')}
      <div><p class="eyebrow">${zone.name}</p><h2>${level.id === WEEKLY_ID ? 'Weekly Walk' : `Level ${level.id}`}</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <section>
      <h3>Goal</h3>
      <ul class="goal-list">${level.goals.map((g) => `<li>${goalIcon(g)}<span>${goalText(g)}</span></li>`).join('')}</ul>
      <p class="meta-row">You have <b>${level.moves} moves</b>${save.best[level.id] ? ` · Best score <b>${save.best[level.id].toLocaleString()}</b>` : ''}</p>
    </section>
    ${TIPS[level.id] ? `<p class="tip"><b>Tip</b>${TIPS[level.id]}</p>` : ''}
    ${streakZoomies()
      ? `<p class="streak">${icon('zoomies', 'booster-icon')}<span><b>${save.winStreak} win streak.</b> You start with ${streakZoomies()} free Zoomies. Lose or leave a level and the streak resets.</span></p>`
      : ''}
    <section>
      <h3>Bring a booster</h3>
      <div class="booster-grid">
      ${(['zoomies', 'micah'] as const)
        .map(
          (id) => `<button class="pre-booster" data-id="${id}" ${save.inventory[id] ? '' : 'disabled'}>
            ${icon(id, 'booster-icon')}<b>${BOOSTERS[id].name}</b><small>${save.inventory[id] ? `${save.inventory[id]} left` : 'None left'}</small></button>`,
        )
        .join('')}
      </div>
    </section>
    <button class="btn play">${level.id === WEEKLY_ID ? 'Start the walk' : `Start level ${level.id}`}</button>`,
    () => {},
  );
  m.querySelector('.close')!.addEventListener('click', () => m.remove());
  m.querySelectorAll<HTMLButtonElement>('.pre-booster').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.id as 'zoomies' | 'micah';
      picks[id] = !picks[id];
      b.classList.toggle('picked', picks[id]);
      b.querySelector('small')!.textContent = picks[id] ? 'Bringing it' : `${save.inventory[id]} left`;
    }),
  );
  m.querySelector('.play')!.addEventListener('click', () => {
    for (const id of ['zoomies', 'micah'] as const) if (picks[id]) save.inventory[id]--;
    persist(save);
    m.remove();
    sfx.start();
    startLevel(level, picks);
  });
}

function showShop(onClose: () => void): void {
  const render = () => `
    <div class="modal-head">
      ${icon('biscuit', 'modal-avatar')}
      <div><p class="eyebrow">Spend biscuits</p><h2>Treat Shop</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <p class="wallet-row">${icon('biscuit', 'biscuit-icon')}${save.biscuits} biscuits</p>
    ${save.biscuits < Math.min(...Object.values(BOOSTERS).map((b) => b.price))
      ? '<p class="notice">You need more biscuits for anything here. Win a level to earn them: 10 per star, plus 20 the first time you clear it.</p>'
      : '<p class="notice">Win levels to earn biscuits: 10 per star, plus 20 the first time you clear a level.</p>'}
    <ul class="shop-list">
      ${(Object.keys(BOOSTERS) as BoosterId[])
        .map(
          (id) => `<li>
            ${icon(id, 'booster-icon')}
            <div class="shop-info"><b>${BOOSTERS[id].name}</b><span>${BOOSTERS[id].desc}</span><small>You have ${save.inventory[id]}</small></div>
            <button class="buy" data-id="${id}" aria-label="Buy ${BOOSTERS[id].name} for ${BOOSTERS[id].price} biscuits" ${save.biscuits < BOOSTERS[id].price ? 'disabled' : ''}>${icon('biscuit', 'biscuit-icon')}${BOOSTERS[id].price}</button>
          </li>`,
        )
        .join('')}
    </ul>`;
  const m = modal(render(), onClose);
  const wire = () => {
    m.querySelector('.close')!.addEventListener('click', () => {
      m.remove();
      onClose();
    });
    m.querySelectorAll<HTMLButtonElement>('.buy').forEach((b) =>
      b.addEventListener('click', () => {
        const id = b.dataset.id as BoosterId;
        if (save.biscuits < BOOSTERS[id].price) return;
        save.biscuits -= BOOSTERS[id].price;
        save.inventory[id]++;
        sfx.coin();
        persist(save);
        m.querySelector('.modal')!.innerHTML = render();
        wire();
        const row = m.querySelector(`.buy[data-id="${id}"]`)?.closest('li');
        pop(row?.querySelector('.booster-icon'));
        pop(row?.querySelector('.shop-info small'));
        pop(m.querySelector('.wallet-row .biscuit-icon'));
        floatLabel(row?.querySelector('.booster-icon'), '+1');
      }),
    );
  };
  wire();
}

// ───────────────────────────── Collar tags ─────────────────────────────

const tagSvg = (b: Badge, on: boolean) => `<svg viewBox="0 0 48 48" class="tag-icon" aria-hidden="true">
  <path d="M24 3 L41 13 V35 L24 45 L7 35 V13 Z" fill="${on ? b.color : '#d6e0e6'}" stroke="${on ? '#0f2a3d' : '#b6c3cc'}" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="24" cy="11" r="3" fill="#fff" stroke="${on ? '#0f2a3d' : '#b6c3cc'}" stroke-width="2"/>
  ${on ? '<path d="M17 26 l5 5 9-10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
</svg>`;

function showCollar(): void {
  const owned = save.badges.length;
  const m = modal(`
    <div class="modal-head">
      ${micahImg('modal-avatar micah-idle')}
      <div><p class="eyebrow">${owned} of ${BADGES.length} earned</p><h2>Micah\u2019s Collar</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <p class="body">Every tag on Micah\u2019s collar pays out biscuits the moment you earn it.</p>
    <ul class="tag-list">
      ${BADGES.map((b) => {
        const on = save.badges.includes(b.id) || isEarned(b, save);
        const [cur, target] = b.progress(save);
        const pct = Math.min(100, Math.round((cur / target) * 100));
        return `<li class="${on ? 'on' : ''}">
          ${tagSvg(b, on)}
          <div class="tag-info"><b>${b.name}</b><span>${b.desc}</span>
            ${on ? '' : `<span class="tag-bar" role="progressbar" aria-label="${b.name} progress" aria-valuenow="${Math.min(cur, target)}" aria-valuemax="${target}"><i style="width:${pct}%"></i></span><small>${Math.min(cur, target)} / ${target}</small>`}
          </div>
          <span class="tag-reward">${on ? UI.check : `${icon('biscuit', 'biscuit-icon')}${b.reward}`}</span>
        </li>`;
      }).join('')}
    </ul>`, () => showMap());
  m.querySelector('.close')!.addEventListener('click', () => (m.remove(), showMap()));
}

/** Announce newly earned tags one after another. */
function celebrate(tags: Badge[]): void {
  tags.forEach((b, i) =>
    window.setTimeout(() => {
      sfx.goal();
      toast(`${tagSvg(b, true)}<span><b>New collar tag: ${b.name}</b> +${b.reward} biscuits</span>`, 'tag-toast');
    }, i * 3400),
  );
}

// ───────────────────────────── Settings ─────────────────────────────

const HOW_TO: [string, string][] = [
  ['Swap', 'Drag a piece onto a neighbour. Three or more in a line clears them.'],
  ['Zoomies', 'Four in a row. Clears its whole row or column.'],
  ['Big Bark', 'An L or T shape. Clears the 3×3 area around it.'],
  ['Micah', 'Five in a row. Swap her with any piece to clear every one of that kind.'],
  ['Mud', 'Make a match on a muddy square to wash it.'],
  ['Deep mud', 'Darker mud takes two washes: the first turns it into ordinary mud.'],
  ['Power-up goals', 'Some levels ask you to make Zoomies, Big Barks or Micah pieces.'],
  ['Yarn', 'A tangled piece can\u2019t be swapped. Match through it to untangle it.'],
  ['Stars', 'Spend them in Micah\u2019s Yard. Biscuits buy treats in the shop.'],
];

function showSettings(): void {
  const cleared = Object.keys(save.stars).length;
  const m = modal(`
    <div class="modal-head">
      ${micahImg('modal-avatar micah-idle')}
      <div><p class="eyebrow">Micah Madness</p><h2>Settings</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <section>
      <button class="setting-row" data-act="sound" role="switch" aria-checked="${save.sound}">
        <span>${save.sound ? UI.soundOn : UI.soundOff}</span><b>Sound effects</b><i class="switch"></i>
      </button>
      <button class="setting-row" data-act="music" role="switch" aria-checked="${save.music}">
        <span>${save.music ? UI.musicOn : UI.musicOff}</span><b>Music</b><i class="switch"></i>
      </button>
      ${canVibrate() ? `<button class="setting-row" data-act="haptics" role="switch" aria-checked="${save.haptics}">
        <span>${UI.vibrate}</span><b>Vibration</b><i class="switch"></i>
      </button>` : ''}
      <p class="body setting-hint">No sound on iPhone? Check the volume and that the side switch isn\u2019t on silent.</p>
    </section>
    <section>
      <h3>Your progress</h3>
      <dl class="stat-rows">
        <dt>Levels cleared</dt><dd>${cleared} of ${LEVELS.length}</dd>
        <dt>Stars earned</dt><dd><span class="star-pill">${UI.star}</span>${totalStars(save)}</dd>
        <dt>Biscuits</dt><dd>${icon('biscuit', 'biscuit-icon')}${save.biscuits}</dd>
      </dl>
    </section>
    <section>
      <h3>How to play</h3>
      <dl class="how-to">${HOW_TO.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>
    </section>
    ${isInstalled() ? '' : `<section>
      <h3>Keep Micah on your phone</h3>
      <p class="body">Add Micah Madness to your Home Screen. It opens like an app, works offline, and your phone won\u2019t clear your progress.</p>
      ${canPrompt() ? '<button class="btn secondary" data-act="install">Add to Home Screen</button>' : installSteps()}
    </section>`}
    <section>
      <h3>Play on another device</h3>
      <p class="body">Progress is saved in this browser only. Copy your transfer code here, then paste it on the other device.</p>
      <button class="btn secondary" data-act="copy">${UI.copy}Copy transfer code</button>
      <textarea class="code-box" rows="3" placeholder="Paste a transfer code" aria-label="Transfer code" spellcheck="false" autocomplete="off"></textarea>
      <button class="btn secondary" data-act="load">Load this code</button>
      <p class="code-msg body" role="status"></p>
    </section>
    <section>
      <h3>Start over</h3>
      <button class="btn secondary danger" data-act="reset">Erase all progress</button>
    </section>`, () => showMap());
  const msg = m.querySelector<HTMLElement>('.code-msg')!;
  const box = m.querySelector<HTMLTextAreaElement>('.code-box')!;
  m.querySelector('.close')!.addEventListener('click', () => (m.remove(), showMap()));

  const soundBtn = m.querySelector<HTMLButtonElement>('[data-act="sound"]')!;
  soundBtn.addEventListener('click', () => {
    save.sound = !save.sound;
    setSound(save.sound);
    persist(save);
    soundBtn.setAttribute('aria-checked', String(save.sound));
    soundBtn.querySelector('span')!.innerHTML = save.sound ? UI.soundOn : UI.soundOff;
    // The page-wide button listener plays the tap that confirms sound is back on.
  });
  const hapticBtn = m.querySelector<HTMLButtonElement>('[data-act="haptics"]');
  hapticBtn?.addEventListener('click', () => {
    save.haptics = !save.haptics;
    setHaptics(save.haptics);
    persist(save);
    hapticBtn.setAttribute('aria-checked', String(save.haptics));
    haptic.power();
  });
  m.querySelector('[data-act="install"]')?.addEventListener('click', async () => {
    if (await promptInstall()) toast('Micah is on your Home Screen.');
  });
  const musicBtn = m.querySelector<HTMLButtonElement>('[data-act="music"]')!;
  musicBtn.addEventListener('click', () => {
    save.music = !save.music;
    setMusic(save.music);
    persist(save);
    musicBtn.setAttribute('aria-checked', String(save.music));
    musicBtn.querySelector('span')!.innerHTML = save.music ? UI.musicOn : UI.musicOff;
  });

  m.querySelector('[data-act="copy"]')!.addEventListener('click', async () => {
    const code = exportCode(save);
    box.value = code;
    try {
      await navigator.clipboard.writeText(code);
      msg.textContent = 'Copied. Paste it into Settings on your other device.';
    } catch {
      box.select();
      msg.textContent = 'Your code is in the box above. Select it and copy it.';
    }
  });

  m.querySelector('[data-act="load"]')!.addEventListener('click', () => {
    const incoming = importCode(box.value);
    if (!incoming) {
      msg.textContent = box.value.trim() ? 'That code didn\u2019t work. Check you copied all of it.' : 'Paste a transfer code first.';
      sfx.bad();
      haptic.bad();
      return;
    }
    const n = Object.keys(incoming.stars).length;
    save = incoming;
    setSound(save.sound);
    setMusic(save.music);
    persist(save);
    sfx.coin();
    m.remove();
    showMap();
    toast(`Progress loaded: ${n} level${n === 1 ? '' : 's'} cleared.`);
  });

  const reset = m.querySelector<HTMLButtonElement>('[data-act="reset"]')!;
  let armed = false;
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Tap again to erase everything';
      reset.classList.add('armed');
      window.setTimeout(() => {
        armed = false;
        reset.textContent = 'Erase all progress';
        reset.classList.remove('armed');
      }, 4000);
      return;
    }
    save = freshSave();
    setSound(save.sound);
    setMusic(save.music);
    persist(save);
    m.remove();
    showMap();
    toast('Progress erased. Micah is ready to start again.');
  });
}

function toast(html: string, cls = ''): void {
  document.querySelectorAll('.toast').forEach((old) => old.remove());
  const t = h(`<div class="toast ${cls}" role="status">${html}</div>`);
  document.body.append(t);
  window.setTimeout(() => t.remove(), 3200);
}

// ───────────────────────────── Weekly Walk ─────────────────────────────

/** Paw stamps toward the Rain Slicker; the newest one thumps down when just earned. */
function stampRow(stamps: number, fresh = false): string {
  const shown = Math.min(stamps, STAMPS_FOR_COAT);
  return Array.from({ length: STAMPS_FOR_COAT }, (_, i) => `<i class="stamp ${i < shown ? 'on' : ''} ${fresh && i === shown - 1 ? 'fresh' : ''}">${UI.paw}</i>`).join('');
}

function showWeekly(): void {
  const lv = weeklyLevel(save);
  const won = weeklyWonThisWeek(save);
  const coat = save.wardrobe.includes('raincoat');
  const m = modal(`
    <div class="modal-head">
      ${micahImg('modal-avatar micah-idle')}
      <div><p class="eyebrow">New every Monday</p><h2>Weekly Walk</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    <p class="body">A remix of level ${lv.baseId}: the board is flipped and Micah wants different toys. Win it once this week for <b>${WEEKLY_BISCUITS} biscuits</b> and a paw stamp.</p>
    <section>
      <h3>Paw stamps</h3>
      <div class="stamp-row">${stampRow(save.weekly.stamps)}</div>
      <p class="body setting-hint">${coat ? 'You\u2019ve earned the Rain Slicker. Stamps keep counting for bragging rights.' : `Collect ${STAMPS_FOR_COAT} to win the <b>Rain Slicker</b> outfit.`}</p>
    </section>
    ${won ? '<p class="notice">This week\u2019s prize is claimed. You can still walk it again for fun.</p>' : ''}
    <button class="btn" data-act="go">${won ? 'Walk it again' : 'Let\u2019s go'}</button>`, () => {});
  m.querySelector('.close')!.addEventListener('click', () => m.remove());
  m.querySelector('[data-act="go"]')!.addEventListener('click', () => (m.remove(), showLevelIntro(lv)));
}

// ───────────────────────────── Sharing and the finale ─────────────────────────────

async function shareWin(card: { title: string; subtitle: string; stars: number; lines: [string, string][] }): Promise<void> {
  toast('Drawing your card\u2026');
  const result = await shareCard({ ...card, micah: costumeUrl(save.costume) });
  if (result === 'saved') toast('Saved your card. Send it to a friend!');
  else if (result === 'failed') toast('Couldn\u2019t make the card on this browser.');
}

const FINALE_BISCUITS = 300;

/** The end of the road (for now): every level done. */
function showFinale(): void {
  const firstTime = !save.seen.includes('finale');
  if (firstTime) {
    save.seen.push('finale');
    save.biscuits += FINALE_BISCUITS;
    persist(save);
  }
  sfx.win();
  haptic.win();
  playMusic('map');
  const stars = totalStars(save);
  const confetti = Array.from({ length: 40 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.35}s;--c:${['#e8352f', '#ffd23f', '#5fc7f0', '#7ed36f', '#ff9cc8'][i % 5]}"></i>`).join('');
  const m = modal(`
    <div class="finale-top">
      <div class="finale-confetti" aria-hidden="true">${confetti}</div>
      <div class="finale-hero">
        <img class="finale-micah cheer" src="${costumeUrl('champion')}" alt="Micah wearing her champion medal" />
      </div>
    </div>
    <p class="eyebrow center">All ${ZONES.length} adventures done</p>
    <h2 class="center">Micah\u2019s big finish!</h2>
    <p class="body center">From the backyard to the starry sleepover, you helped Micah fetch every toy, wash every muddy paw and untangle every bit of yarn. She\u2019s had the best day ever, and now she\u2019s off for the comfiest nap.</p>
    <dl class="stat-rows">
      <dt>Levels cleared</dt><dd>${LEVELS.length} of ${LEVELS.length}</dd>
      <dt>Stars earned</dt><dd><span class="star-pill">${UI.star}</span>${stars} of ${LEVELS.length * 3}</dd>
      ${firstTime ? `<dt>Champion prize</dt><dd>${icon('biscuit', 'biscuit-icon')}${FINALE_BISCUITS}</dd>` : ''}
    </dl>
    <p class="notice">New outfit unlocked in the Closet: <b>Champion</b>. More adventures are on their way, and you can replay any level for three stars.</p>
    <div class="actions">
      <button class="btn" data-act="map">Back to the map</button>
      <button class="btn secondary" data-act="share">${UI.share}Share Micah\u2019s big finish</button>
    </div>`, () => showMap(LEVELS.length));
  m.classList.add('finale-wrap');
  m.querySelector('[data-act="map"]')!.addEventListener('click', () => (m.remove(), showMap(LEVELS.length)));
  m.querySelector('[data-act="share"]')!.addEventListener('click', () =>
    shareWin({
      title: 'Every level cleared!',
      subtitle: 'Micah\u2019s big finish',
      stars: 3,
      lines: [
        ['Levels', `${LEVELS.length} of ${LEVELS.length}`],
        ['Stars', `${stars} of ${LEVELS.length * 3}`],
        ['Outfit earned', 'Champion'],
      ],
    }),
  );
}

// ───────────────────────────── Game screen ─────────────────────────────

const CHEERS = ['Good match!', 'Woof!', 'Treat time!', 'Wag wag!', 'Nice!', 'Bork!'];
const BIG_CHEERS = ['ZOOMIES!', 'Micah Madness!', 'Who\u2019s a good player?', 'Bark-tastic!', 'Pawsome!'];

function startLevel(level: Level, picks: { zoomies: boolean; micah: boolean }): void {
  const kinds = level.kinds;
  let grid: Grid = createGrid(ROWS, COLS, Math.random, kinds);
  // Washes left at each cell: 0 clean, 1 mud, 2 deep mud.
  const mud: number[][] = Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => mudDepth(level, r, c)));
  const yarn: boolean[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (level.yarn?.[r]?.[c] ?? '.') === 'y'),
  );
  const locked = (r: number, c: number) => yarn[r][c];
  let moves = level.moves;
  let score = 0;
  let busy = false;
  let over = false;
  let treatMode = false;
  let dustMode = false;
  /** The board just before the last swap, for the Orthopedic Bed's undo. */
  type Snap = { grid: Grid; mud: number[][]; yarn: boolean[][]; remaining: number[]; moves: number; score: number; goalsDone: number };
  let undoSnap: Snap | null = null;
  let selected: Pos | null = null;
  let bonusPts = 0;
  let goalsDone = 0;
  let starsLit = 0;
  let bestChain = 1;
  let lastGoalsHtml = '';
  let lastToolsHtml = '';
  let hintTimer = 0;
  // A level counts as lost until it is won, so quitting or closing the tab ends the streak too.
  const streakAtStart = save.winStreak;
  const freeZoomies = streakZoomies();
  save.winStreak = 0;
  persist(save);
  const totalMud = mudCount(level);
  const totalYarn = yarnCount(level);
  const remaining = level.goals.map((g) =>
    g.type === 'collect' || g.type === 'power' ? g.count : g.type === 'mud' ? totalMud : g.type === 'yarn' ? totalYarn : g.target,
  );

  // Pre-level boosters: drop specials onto random cells.
  const randomCell = (): Pos => [2 + Math.floor(Math.random() * 4), Math.floor(Math.random() * COLS)];
  if (picks.zoomies) {
    for (let i = 0; i < 2; i++) {
      const [r, c] = randomCell();
      grid[r][c]!.special = i % 2 ? 'zoomCol' : 'zoomRow';
    }
  }
  for (let i = 0; i < freeZoomies; i++) {
    const [r, c] = randomCell();
    grid[r][c]!.special = i % 2 ? 'zoomCol' : 'zoomRow';
  }
  if (picks.micah) {
    const [r, c] = randomCell();
    grid[r][c] = newTile(-1, 'micah');
  }

  playMusic('level', level.zone);
  const zone = ZONES[level.zone];
  const screen = h(`
    <div class="screen game-screen">
      <header class="hud">
        <button class="round-btn back" aria-label="Back to map">${UI.back}</button>
        <div class="stat"><small>${level.id === WEEKLY_ID ? 'Weekly' : 'Level'}</small><b>${level.id === WEEKLY_ID ? UI.paw : level.id}</b></div>
        <div class="stat moves"><small>Moves</small><b class="moves-val">${moves}</b></div>
        <div class="stat score"><div class="score-line"><small>Score</small><b class="score-val">0</b></div>
          <div class="star-bar"><div class="star-fill"></div>${level.stars
            .map((s, i) => `<i style="left:${(s / level.stars[2]) * 100}%" data-i="${i}">${UI.star}</i>`)
            .join('')}</div>
        </div>
      </header>
      <div class="info-row">
        <div class="mascot">
          <div class="mascot-face">${micahImg('mascot-img micah-idle')}</div>
          <div class="bubble" aria-live="polite"></div>
        </div>
        <div class="goals"></div>
      </div>
      <div class="board-wrap"><div class="board"></div></div>
      <p class="sr-only board-status" aria-live="polite"></p>
      <div class="tools"></div>
    </div>`);
  // Leaving the level (back arrow, map, replay) stops its timers and resize watching.
  mount(screen, () => {
    over = true;
    clearHint();
    ro.disconnect();
  });
  const boardEl = screen.querySelector<HTMLDivElement>('.board')!;
  const bubble = screen.querySelector<HTMLDivElement>('.bubble')!;
  const mascot = screen.querySelector<HTMLDivElement>('.mascot-face')!;
  const tileSize = () => boardEl.clientWidth / COLS;
  const boardWrap = screen.querySelector<HTMLDivElement>('.board-wrap')!;
  // Size the square board to the space the HUD, goals and item bar leave free.
  const fitBoard = () => {
    const cs = getComputedStyle(screen);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.rowGap) || 0;
    const others = ['.hud', '.info-row', '.tools'].reduce((sum, sel) => sum + screen.querySelector<HTMLElement>(sel)!.offsetHeight, 0);
    const outline = 12;
    const freeH = screen.clientHeight - padY - others - gap * 3 - outline;
    const freeW = screen.clientWidth - padX - outline;
    const size = Math.max(200, Math.floor(Math.min(freeW, freeH)));
    boardEl.style.width = `${size}px`;
    boardWrap.style.height = `${size + outline}px`;
  };
  fitBoard();
  const ro = new ResizeObserver(fitBoard);
  ro.observe(screen);

  // Cell backgrounds (including mud layer).
  const cellEls: HTMLDivElement[][] = [];
  for (let r = 0; r < ROWS; r++) {
    cellEls.push([]);
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = `cell ${(r + c) % 2 ? 'alt' : ''} ${mud[r][c] ? 'mud' : ''} ${mud[r][c] > 1 ? 'deep' : ''}`;
      cell.style.left = `${(c / COLS) * 100}%`;
      cell.style.top = `${(r / ROWS) * 100}%`;
      boardEl.append(cell);
      cellEls[r].push(cell);
    }
  }
  // Yarn sits above the pieces, so it gets its own layer.
  const makeYarnEl = (r: number, c: number) => {
    const el = document.createElement('div');
    el.className = 'yarn';
    el.style.left = `${(c / COLS) * 100}%`;
    el.style.top = `${(r / ROWS) * 100}%`;
    el.innerHTML = YARN_OVERLAY;
    boardEl.append(el);
    return el;
  };
  const yarnEls: (HTMLDivElement | null)[][] = yarn.map((row, r) => row.map((on, c) => (on ? makeYarnEl(r, c) : null)));

  const tileEls = new Map<number, HTMLDivElement>();
  const specialClass = (s: Special) => (s === 'none' ? '' : `sp-${s}`);
  // Micah keeps her picture even after a combo spends her power (kind -1 has no regular art).
  const tileInner = (t: Tile) =>
    t.special === 'micah' || !KINDS[t.kind] ? micahImg('piece') : svg(KINDS[t.kind].svg, 'piece');

  function makeTileEl(t: Tile): HTMLDivElement {
    const el = document.createElement('div');
    el.className = `tile ${specialClass(t.special)}`;
    el.innerHTML = tileInner(t) + (t.special === 'zoomRow' || t.special === 'zoomCol' ? '<span class="streaks"></span>' : '');
    el.dataset.special = t.special;
    el.dataset.kind = String(t.kind);
    boardEl.append(el);
    tileEls.set(t.id, el);
    return el;
  }
  function placeEl(el: HTMLElement, r: number, c: number) {
    el.style.transform = `translate(${c * 100}%, ${r * 100}%)`;
  }
  function syncTileEl(t: Tile, r: number, c: number) {
    let el = tileEls.get(t.id);
    if (!el || el.dataset.special !== t.special || el.dataset.kind !== String(t.kind)) {
      el?.remove();
      el = makeTileEl(t);
    }
    placeEl(el, r, c);
  }
  function renderAll() {
    const live = new Set<number>();
    grid.forEach((row, r) =>
      row.forEach((t, c) => {
        if (!t) return;
        live.add(t.id);
        syncTileEl(t, r, c);
      }),
    );
    for (const [id, el] of tileEls) if (!live.has(id)) (el.remove(), tileEls.delete(id));
  }

  function say(text: string, mood: 'happy' | 'big' | 'sad' = 'happy') {
    bubble.textContent = text;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
    mascot.classList.remove('bounce', 'shake', 'cheer', 'sleepy');
    void mascot.offsetWidth;
    mascot.classList.add(mood === 'sad' ? 'shake' : mood === 'big' ? 'cheer' : 'bounce');
  }

  // The tool that first appears on this level gets a "New" badge and a word from Micah.
  const newTool = TOOL_ORDER.find((id) => TOOL_UNLOCK[id] === level.id && !save.seen.includes(`tool-${id}`));
  if (newTool) {
    save.seen.push(`tool-${newTool}`);
    persist(save);
  }

  // Level 1, first visit: a paw shows the very first swap until the player makes it.
  let guideEl: HTMLElement | null = null;
  function showGuide() {
    if (over || busy || guideEl) return;
    const mv = findMove(grid, locked);
    if (!mv) return;
    const [a, b] = mv;
    guideEl = h(`<div class="guide-paw" aria-hidden="true"><span>${PAW_POINTER}</span></div>`);
    guideEl.style.setProperty('--dx', String(b[1] - a[1]));
    guideEl.style.setProperty('--dy', String(b[0] - a[0]));
    placeEl(guideEl, a[0], a[1]);
    boardEl.append(guideEl);
    for (const [r, c] of mv) tileEls.get(grid[r][c]!.id)?.classList.add('guided');
    say('Drag the wiggly piece the way the paw goes to make three in a row.');
  }
  function endGuide() {
    if (!guideEl) return;
    guideEl.remove();
    guideEl = null;
    boardEl.querySelectorAll('.guided').forEach((e) => e.classList.remove('guided'));
    save.seen.push('guide');
    persist(save);
  }

  function renderHud() {
    screen.querySelector('.moves-val')!.textContent = String(moves);
    screen.querySelector('.moves')!.classList.toggle('low', moves <= 5);
    countUp(screen.querySelector<HTMLElement>('.score-val')!, score);
    (screen.querySelector('.star-fill') as HTMLElement).style.width = `${Math.min(100, (score / level.stars[2]) * 100)}%`;
    screen.querySelectorAll<HTMLElement>('.star-bar i').forEach((s, i) => s.classList.toggle('on', score >= level.stars[i]));
    // A star on the score bar lights up: it pops, chimes, and Micah says so.
    const starsNow = level.stars.filter((s) => score >= s).length;
    if (starsNow > starsLit) {
      for (let i = starsLit; i < starsNow; i++) {
        const st = screen.querySelectorAll<HTMLElement>('.star-bar i')[i];
        replay(st, 'star-hit');
        setTimeout(() => sfx.star(i + 1), 150 + (i - starsLit) * 180);
      }
      starsLit = starsNow;
      if (!over) say(starsNow === 3 ? 'Three stars! Best girl!' : `${starsNow === 1 ? 'First' : 'Second'} star!`, 'big');
    }
    // Only rebuild the goal chips and item bar when something on them changed, so their
    // animations (a goal ticking off) can play out and phones skip needless redraws.
    const goalsHtml = level.goals
      .map((g, i) => {
        const left = Math.max(0, g.type === 'score' ? g.target - score : remaining[i]);
        const done = left === 0;
        const what = g.type === 'score' ? 'points to go' : g.type === 'collect' ? `${KINDS[g.kind].plural.toLowerCase()} to go` : g.type === 'mud' ? 'mud patches left' : g.type === 'yarn' ? 'yarn balls left' : `${POWER_NAMES[g.power][1]} to make`;
        return `<div class="goal ${done ? 'done' : ''}" role="img" aria-label="${done ? `${goalText(g)}: done` : `${left.toLocaleString()} ${what}`}">${goalIcon(g)}<b>${done ? UI.check : g.type === 'score' ? left.toLocaleString() : left}</b></div>`;
      })
      .join('');
    if (goalsHtml !== lastGoalsHtml) {
      const goalsEl = screen.querySelector('.goals')!;
      const wasDone = [...goalsEl.children].map((g) => g.classList.contains('done'));
      goalsEl.innerHTML = lastGoalsHtml = goalsHtml;
      [...goalsEl.children].forEach((g, i) => {
        if (g.classList.contains('done') && wasDone.length && !wasDone[i]) replay(g, 'goal-pop');
      });
    }
    const toolsHtml = TOOL_ORDER
      .map((id) =>
        !toolOpen(id, level.id)
          ? `<div class="tool locked" aria-label="${BOOSTERS[id].name} unlocks at level ${TOOL_UNLOCK[id]}">${UI.lock}<span class="label">Level ${TOOL_UNLOCK[id]}</span></div>`
          : `<button class="tool ${newTool === id ? 'spotlight' : ''} ${(id === 'treat' && treatMode) || (id === 'dust' && dustMode) ? 'active' : ''}" data-id="${id}" aria-label="${BOOSTERS[id].name}: ${BOOSTERS[id].desc} ${save.inventory[id] ? `${save.inventory[id]} left` : 'None left, tap to buy'}">
          ${icon(id, 'tool-icon')}<span class="label">${BOOSTERS[id].short ?? BOOSTERS[id].name}</span><span class="count ${save.inventory[id] ? '' : 'empty'}">${save.inventory[id] || UI.plus}</span>${newTool === id ? '<em class="new-badge">New</em>' : ''}</button>`,
      )
      .join('');
    if (toolsHtml === lastToolsHtml) return;
    screen.querySelector('.tools')!.innerHTML = lastToolsHtml = toolsHtml;
    screen.querySelectorAll<HTMLButtonElement>('.tool').forEach((b) => b.addEventListener('click', () => useTool(b.dataset.id as BoosterId)));
  }

  const goalsMet = () => level.goals.every((g, i) => (g.type === 'score' ? score >= g.target : remaining[i] <= 0));

  function clearHint() {
    window.clearTimeout(hintTimer);
    mascot.classList.remove('sleepy');
    boardEl.querySelectorAll('.hint').forEach((e) => e.classList.remove('hint'));
  }
  function armHint() {
    clearHint();
    hintTimer = window.setTimeout(() => {
      if (busy || over) return;
      const mv = findMove(grid, locked);
      if (!mv) return;
      for (const [r, c] of mv) tileEls.get(grid[r][c]!.id)?.classList.add('hint');
      // Left alone a while longer, Micah dozes off.
      hintTimer = window.setTimeout(() => {
        if (busy || over) return;
        mascot.classList.remove('bounce', 'shake', 'cheer');
        mascot.classList.add('sleepy');
        bubble.textContent = 'Zzz… psst, try the wiggling pieces.';
      }, 8000);
    }, 6000);
  }

  const shake = (strength = 2) => shakeBoard(boardEl, strength);
  /** Centre of a set of cells, in % of the board. */
  function centre(cells: Iterable<number>): [number, number] {
    let sr = 0, sc = 0, n = 0;
    for (const k of cells) {
      const [r, c] = unkey(k);
      sr += r;
      sc += c;
      n++;
    }
    return n ? [((sc / n + 0.5) / COLS) * 100, ((sr / n + 0.5) / ROWS) * 100] : [50, 50];
  }

  /** A few coloured crumbs burst from every cleared piece. */
  function burst(cells: Set<number>) {
    const frag = document.createDocumentFragment();
    let n = 0;
    for (const k of cells) {
      const [r, c] = unkey(k);
      const t = grid[r][c];
      if (!t || n > 120) continue;
      const color = t.kind >= 0 ? KINDS[t.kind].color : '#ffc12e';
      for (let i = 0; i < 3; i++, n++) {
        const p = document.createElement('i');
        p.className = 'crumb';
        const a = Math.random() * Math.PI * 2;
        const d = 18 + Math.random() * 26;
        p.style.cssText = `left:${((c + 0.5) / COLS) * 100}%;top:${((r + 0.5) / ROWS) * 100}%;background:${color};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
        frag.append(p);
      }
    }
    boardEl.append(frag);
    setTimeout(() => boardEl.querySelectorAll('.crumb').forEach((e) => e.remove()), 600);
  }

  function flashEffects(res: ClearResult) {
    burst(res.cleared);
    for (const f of res.fired) {
      const fx = document.createElement('div');
      fx.className = `fx fx-${f.special}`;
      const [r, c] = f.pos;
      fx.style.setProperty('--r', String(r));
      fx.style.setProperty('--c', String(c));
      boardEl.append(fx);
      setTimeout(() => fx.remove(), 500);
      const x = ((c + 0.5) / COLS) * 100;
      const y = ((r + 0.5) / ROWS) * 100;
      if (f.special === 'micah') {
        shake(4);
        ring(boardEl, x, y, '#ffc12e', 3);
        confetti(boardEl, x, y, 40, 1.2);
      } else if (f.special === 'bark') {
        shake(2);
        ring(boardEl, x, y, '#e8352f', 1.6);
      } else ring(boardEl, x, y, '#ffffff', 1.2);
      if (f.special === 'bark') sfx.bark();
      else sfx.zoom();
      haptic.blast();
    }
  }

  /** The points for a wave float up from where it happened, bigger and golder as the combo grows. */
  function floatScore(points: number, cells: Set<number>, chain: number) {
    if (!cells.size) return;
    const [x, y] = centre(cells);
    const el = document.createElement('div');
    el.className = `float-score ${chain >= 3 || points >= 600 ? 'hot' : chain >= 2 || points >= 300 ? 'warm' : ''}`;
    el.textContent = `+${points.toLocaleString()}`;
    if (chain >= 2) {
      const x2 = document.createElement('small');
      x2.textContent = ` x${chain}`;
      el.append(x2);
    }
    el.style.left = `${Math.min(86, Math.max(14, x))}%`;
    el.style.top = `${Math.min(90, Math.max(10, y))}%`;
    boardEl.append(el);
    setTimeout(() => el.remove(), 1000);
  }

  async function cascade(preferred: Pos[], forced: number[] = []) {
    let chain = 1;
    let preferredNow = preferred;
    let forcedNow = forced;
    for (;;) {
      const res = computeClear(grid, preferredNow, forcedNow);
      if (res.cleared.size === 0) break;
      const points = res.cleared.size * 20 * chain + res.created.length * 100;
      score += points;
      let washed = false;
      let untangled = false;
      level.goals.forEach((g, i) => {
        if (g.type === 'collect') remaining[i] -= res.collected[g.kind];
        if (g.type === 'power') remaining[i] -= res.created.filter((cr) => powerOf(cr.tile.special) === g.power).length;
      });
      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        if (mud[r][c]) {
          mud[r][c]--;
          cellEls[r][c].classList.remove('deep');
          if (!mud[r][c]) {
            cellEls[r][c].classList.remove('mud');
            cellEls[r][c].classList.add('cleaned');
          }
          washed = true;
          bump(save, 'mud');
          level.goals.forEach((g, i) => g.type === 'mud' && remaining[i]--);
        }
        if (yarn[r][c]) {
          yarn[r][c] = false;
          const y = yarnEls[r][c];
          y?.classList.add('snip');
          setTimeout(() => y?.remove(), 360);
          untangled = true;
          bump(save, 'yarn');
          level.goals.forEach((g, i) => g.type === 'yarn' && remaining[i]--);
        }
      }
      sfx.pop(chain);
      haptic.pop(chain);
      if (washed) sfx.splash();
      if (untangled) sfx.snip();
      if (res.created.length) setTimeout(() => (sfx.powerUp(), haptic.power()), 120);
      const doneNow = level.goals.filter((g, i) => (g.type === 'score' ? score >= g.target : remaining[i] <= 0)).length;
      if (doneNow > goalsDone) {
        goalsDone = doneNow;
        setTimeout(() => sfx.goal(), 200);
      }
      flashEffects(res);
      floatScore(points, res.cleared, chain);
      for (const { pos } of res.created) ring(boardEl, ((pos[1] + 0.5) / COLS) * 100, ((pos[0] + 0.5) / ROWS) * 100, '#ffc12e', 1);
      // The bigger the moment, the louder the party: words, confetti, a gold flash and Micah's hearts.
      const hy = hype(chain, res.cleared.size, res.fired.some((f) => f.special === 'micah'), res.fired.length > 0);
      if (hy.tier > 0) {
        callout(boardEl, hy.text, hy.tier, chain >= 2 ? `${chain}x combo` : '');
        setTimeout(() => sfx.combo(hy.tier), 60);
        glow(boardEl, hy.tier);
        if (hy.tier >= 2) {
          const [x, y] = centre(res.cleared);
          confetti(boardEl, x, y, 8 + hy.tier * 7);
          shake(hy.tier);
        }
        hearts(mascot, hy.tier + 1);
        bestChain = Math.max(bestChain, chain);
      }
      if (res.fired.some((f) => f.special === 'micah') || res.cleared.size >= 12) say(BIG_CHEERS[Math.floor(Math.random() * BIG_CHEERS.length)], 'big');
      else if (chain >= 2) say(chain >= 3 ? `${chain}x combo! ${BIG_CHEERS[chain % BIG_CHEERS.length]}` : `Combo! ${CHEERS[Math.floor(Math.random() * CHEERS.length)]}`, 'big');
      else if (Math.random() < 0.3) say(CHEERS[Math.floor(Math.random() * CHEERS.length)]);

      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        const t = grid[r][c];
        if (t) tileEls.get(t.id)?.classList.add('pop');
      }
      renderHud();
      await wait(230);
      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        const t = grid[r][c];
        if (t) {
          tileEls.get(t.id)?.remove();
          tileEls.delete(t.id);
        }
      }
      applyClear(grid, res);
      for (const { tile } of res.created) {
        bump(save, tile.special === 'bark' ? 'bark' : tile.special === 'micah' ? 'micah' : 'zoomies');
      }
      for (const { pos, tile } of res.created) {
        const el = makeTileEl(tile);
        placeEl(el, pos[0], pos[1]);
        el.classList.add('born');
      }

      const drops = applyGravity(grid, Math.random, kinds);
      for (const d of drops) {
        let el = tileEls.get(d.tile.id);
        if (!el) {
          el = makeTileEl(d.tile);
          el.classList.add('no-anim');
          placeEl(el, d.from[0], d.from[1]);
        }
      }
      void boardEl.offsetWidth;
      for (const d of drops) {
        const el = tileEls.get(d.tile.id)!;
        el.classList.remove('no-anim');
        placeEl(el, d.to[0], d.to[1]);
      }
      await wait(300);
      chain++;
      preferredNow = [];
      forcedNow = [];
    }
    if (!hasMove(grid, locked)) {
      say('No moves left, so Micah shuffled the board.', 'big');
      await wait(400);
      shuffle(grid);
      renderAll();
      await wait(350);
    }
  }

  /** Put the board back in a playable state: fill any holes and redraw every piece. */
  function heal() {
    if (grid.some((row) => row.some((t) => !t))) applyGravity(grid, Math.random, kinds);
    boardEl.querySelectorAll('.tile.pop, .dusted').forEach((e) => e.classList.remove('pop', 'dusted'));
    renderAll();
    renderHud();
  }
  /**
   * Runs a board action with input locked. Whatever happens inside (a bug, a sound
   * that fails to play), the lock is always released and the board is repaired,
   * so the game can never freeze with a hole in it.
   */
  async function runLocked(fn: () => Promise<void>) {
    busy = true;
    try {
      await fn();
    } catch (err) {
      console.error('Board action failed, repairing the board', err);
      try {
        heal();
      } catch (e2) {
        console.error(e2);
      }
    } finally {
      busy = false;
    }
  }

  async function trySwap(a: Pos, b: Pos) {
    if (busy || over || !isAdjacent(a, b)) return;
    if (locked(...a) || locked(...b)) {
      selectCell(null);
      sfx.bad();
      haptic.bad();
      const y = yarnEls[a[0]][a[1]] ?? yarnEls[b[0]][b[1]];
      y?.classList.remove('tug');
      void y?.offsetWidth;
      y?.classList.add('tug');
      say('That piece is tangled in yarn. Match through it to free it.', 'sad');
      return;
    }
    clearHint();
    selectCell(null);
    let legal = false;
    await runLocked(async () => {
      sfx.swap();
      legal = isLegalSwap(grid, a, b);
      const before: Snap = {
        grid: cloneGrid(grid),
        mud: mud.map((row) => [...row]),
        yarn: yarn.map((row) => [...row]),
        remaining: [...remaining],
        moves,
        score,
        goalsDone,
      };
      swap(grid, a, b);
      renderAll();
      await wait(170);
      if (!legal) {
        swap(grid, a, b);
        renderAll();
        sfx.bad();
        haptic.bad();
        say('That swap doesn\u2019t make a match.', 'sad');
        await wait(170);
        return;
      }
      undoSnap = before;
      endGuide();
      moves--;
      if (moves === 5) sfx.warn();
      renderHud();
      const forced = comboClears(grid, a, b) ?? [];
      if (forced.length) renderAll();
      await cascade([b, a], forced);
    });
    if (legal) await checkEnd();
    armHint();
  }

  function selectCell(p: Pos | null) {
    boardEl.querySelectorAll('.selected').forEach((e) => e.classList.remove('selected'));
    selected = p;
    if (p) {
      tileEls.get(grid[p[0]][p[1]]!.id)?.classList.add('selected');
      sfx.select();
    }
  }

  async function useTool(id: BoosterId) {
    if (busy || over) return;
    if (!save.inventory[id]) {
      showShop(() => renderHud());
      return;
    }
    if (id === 'treat') {
      treatMode = !treatMode;
      dustMode = false;
      say(treatMode ? 'Tap any piece and Micah will eat it.' : 'Treat put away.');
      renderHud();
      return;
    }
    if (id === 'dust') {
      dustMode = !dustMode;
      treatMode = false;
      say(dustMode ? 'Tap a piece. Every piece like it turns into the kind you need.' : 'Magic Dust put away.');
      renderHud();
      return;
    }
    if (id === 'bed') {
      if (!undoSnap) {
        say('Make a move first. The bed remembers your last one.', 'sad');
        return;
      }
      save.inventory.bed--;
      persist(save);
      const snap = undoSnap;
      undoSnap = null;
      await runLocked(async () => {
        treatMode = dustMode = false;
        restore(snap);
        sfx.whoosh();
        say('Micah had a nap on her memory foam. Last move undone!', 'big');
        await wait(350);
      });
      armHint();
      return;
    }
    undoSnap = null;
    save.inventory[id]--;
    persist(save);
    if (id === 'leash') {
      moves += 5;
      sfx.whoosh();
      say('Long walk! +5 moves', 'big');
      renderHud();
    }
    if (id === 'squirrel') {
      await runLocked(async () => {
        sfx.squirrel();
        say('SQUIRREL!!', 'big');
        shuffle(grid);
        renderAll();
        await wait(350);
        await cascade([]);
      });
      renderHud();
      await checkEnd();
    }
  }

  /** Put the board back exactly as it was in a snapshot (Orthopedic Bed). */
  function restore(snap: Snap) {
    clearHint();
    selectCell(null);
    grid = cloneGrid(snap.grid);
    moves = snap.moves;
    score = snap.score;
    goalsDone = snap.goalsDone;
    starsLit = level.stars.filter((st) => score >= st).length;
    snap.remaining.forEach((v, i) => (remaining[i] = v));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        mud[r][c] = snap.mud[r][c];
        cellEls[r][c].classList.toggle('mud', mud[r][c] > 0);
        cellEls[r][c].classList.toggle('deep', mud[r][c] > 1);
        cellEls[r][c].classList.remove('cleaned');
        yarn[r][c] = snap.yarn[r][c];
        if (yarn[r][c] && !yarnEls[r][c]?.isConnected) yarnEls[r][c] = makeYarnEl(r, c);
        else if (!yarn[r][c] && yarnEls[r][c]) {
          yarnEls[r][c]!.remove();
          yarnEls[r][c] = null;
        }
      }
    }
    for (const el of tileEls.values()) el.remove();
    tileEls.clear();
    renderAll();
    for (const el of tileEls.values()) el.classList.add('born');
    renderHud();
  }

  async function dustTile(p: Pos) {
    const t = grid[p[0]][p[1]];
    if (!t || t.kind < 0) {
      say('Sprinkle the dust on a regular piece, not Micah.', 'sad');
      return;
    }
    dustMode = false;
    undoSnap = null;
    save.inventory.dust--;
    persist(save);
    clearHint();
    selectCell(null);
    await runLocked(async () => {
      const from = t.kind;
      const wanted = level.goals.flatMap((g, i) => (g.type === 'collect' ? [{ kind: g.kind, left: remaining[i] }] : []));
      const to = dustTarget(grid, from, kinds, wanted);
      const changed = transformKind(grid, from, to);
      sfx.powerUp();
      say(`Sparkle! Every ${KINDS[from].name.toLowerCase()} became a ${KINDS[to].name.toLowerCase()}.`, 'big');
      renderAll();
      for (const k of changed) {
        const [r, c] = unkey(k);
        tileEls.get(grid[r][c]!.id)?.classList.add('born', 'dusted');
      }
      renderHud();
      await wait(450);
      boardEl.querySelectorAll('.dusted').forEach((e) => e.classList.remove('dusted'));
      await cascade([]);
    });
    renderHud();
    await checkEnd();
    armHint();
  }

  async function eatTile(p: Pos) {
    undoSnap = null;
    treatMode = false;
    save.inventory.treat--;
    bump(save, 'treats');
    persist(save);
    await runLocked(async () => {
      sfx.crunch();
      say('Nom nom nom!', 'big');
      await cascade([], [key(p[0], p[1])]);
    });
    renderHud();
    await checkEnd();
  }

  async function checkEnd() {
    if (over) return;
    if (goalsMet()) {
      over = true;
      sfx.win();
      haptic.win();
      sfx.popper();
      callout(boardEl, 'Level clear!', 5, moves > 0 ? 'Victory lap!' : '');
      confetti(boardEl, 50, 60, 50, 1.3);
      hearts(mascot, 5);
      await wait(900);
      if (moves > 0) {
        // Victory lap: each spare move turns a random piece into Zoomies, then they all go off.
        say(`Level cleared. Victory lap with ${moves} spare moves!`, 'big');
        const before = score;
        const laps = Math.min(moves, 12);
        const forced: number[] = [];
        for (let i = 0; i < laps; i++) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          const t = grid[r][c];
          if (!t || t.special !== 'none') continue;
          t.special = Math.random() < 0.5 ? 'zoomRow' : 'zoomCol';
          forced.push(key(r, c));
          moves--;
          renderAll();
          renderHud();
          sfx.swap();
          await wait(120);
        }
        score += moves * 100; // any moves that couldn't become Zoomies still count
        moves = 0;
        try {
          await cascade([], forced);
        } catch (err) {
          // The level is already won: never let a hiccup here stop the win screen.
          console.error(err);
        }
        bonusPts = score - before;
        renderHud();
      } else {
        say('Level cleared. Good dog!', 'big');
      }
      await wait(700);
      finish(true);
    } else if (moves <= 0) {
      over = true;
      sfx.lose();
      say('Out of moves.', 'sad');
      await wait(700);
      finish(false);
    }
  }

  function finish(won: boolean) {
    clearHint();
    if (won && level.id === WEEKLY_ID) {
      const stars = level.stars.filter((s) => score >= s).length || 1;
      save.winStreak = streakAtStart + 1;
      bump(save, 'wins');
      save.tally.bestStreak = Math.max(save.tally.bestStreak ?? 0, save.winStreak);
      const prize = claimWeekly(save);
      const tags = awardBadges(save);
      persist(save);
      setTimeout(() => celebrate(tags), 1400);
      for (let s = 1; s <= stars; s++) setTimeout(() => sfx.star(s), 300 + s * 200);
      const m = modal(`
        <div class="modal-head">
          ${micahImg('modal-avatar cheer')}
          <div><p class="eyebrow">Weekly Walk</p><h2>Walk complete!</h2></div>
          <button class="round-btn share-btn" aria-label="Share this win">${UI.share}</button>
        </div>
        <div class="result-stars" role="img" aria-label="${stars} of 3 stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}" style="animation-delay:${s * 0.2}s">${UI.star}</i>`).join('')}</div>
        ${prize ? `<div class="stamp-row" aria-label="${Math.min(prize.stamps, STAMPS_FOR_COAT)} of ${STAMPS_FOR_COAT} paw stamps">${stampRow(prize.stamps, true)}</div>` : ''}
        <dl class="stat-rows">
          <dt>Score</dt><dd>${score.toLocaleString()}</dd>
          ${prize ? `<dt>Weekly prize</dt><dd>${icon('biscuit', 'biscuit-icon')}${prize.biscuits}</dd>` : ''}
          <dt>Win streak</dt><dd>${save.winStreak}</dd>
        </dl>
        <p class="notice">${prize?.coat ? 'Four paw stamps! The <b>Rain Slicker</b> is waiting in Micah\u2019s Closet.' : prize ? 'Paw stamp collected. A new walk starts every Monday.' : 'You\u2019ve already won this week\u2019s prize. A new walk starts on Monday.'}</p>
        <div class="actions">
          <button class="btn to-map">Back to map</button>
          <button class="btn secondary replay">Walk it again</button>
        </div>`);
      m.querySelector('.replay')!.addEventListener('click', () => (m.remove(), showLevelIntro(level)));
      m.querySelector('.to-map')!.addEventListener('click', () => (m.remove(), showMap()));
      m.querySelector('.share-btn')!.addEventListener('click', () =>
        shareWin({ title: 'Weekly Walk done', subtitle: ZONES[level.zone].name, stars, lines: [['Score', score.toLocaleString()], ['Paw stamps', String(save.weekly.stamps)], ['Win streak', String(save.winStreak)]] }),
      );
      return;
    }
    if (won) {
      const stars = level.stars.filter((s) => score >= s).length || 1;
      const firstClear = !(save.stars[level.id] > 0);
      const earned = stars * 10 + (firstClear ? 20 : 0);
      const newStars = Math.max(0, stars - (save.stars[level.id] ?? 0));
      save.stars[level.id] = Math.max(save.stars[level.id] ?? 0, stars);
      save.winStreak = streakAtStart + 1;
      bump(save, 'wins');
      save.tally.bestStreak = Math.max(save.tally.bestStreak ?? 0, save.winStreak);
      save.best[level.id] = Math.max(save.best[level.id] ?? 0, score);
      save.biscuits += earned;
      const tags = awardBadges(save);
      persist(save);
      setTimeout(() => celebrate(tags), 1400);
      confettiRain(stars * 18 + 10);
      setTimeout(() => sfx.popper(), 250);
      for (let s = 1; s <= stars; s++) setTimeout(() => sfx.star(s), 300 + s * 200);
      const m = modal(`
        <div class="modal-head">
          ${micahImg('modal-avatar cheer')}
          <div><p class="eyebrow">${zone.name}</p><h2>Level ${level.id} cleared</h2></div>
          <button class="round-btn share-btn" aria-label="Share this win">${UI.share}</button>
        </div>
        <div class="result-stars" role="img" aria-label="${stars} of 3 stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}" style="animation-delay:${s * 0.2}s">${UI.star}</i>`).join('')}</div>
        <dl class="stat-rows">
          <dt>Score</dt><dd>${score.toLocaleString()}</dd>
          ${bestChain >= 2 ? `<dt>Biggest combo</dt><dd>x${bestChain}</dd>` : ''}
          ${bonusPts ? `<dt>Victory lap</dt><dd>${bonusPts.toLocaleString()}</dd>` : ''}
          ${newStars ? `<dt>New stars for Micah's Yard</dt><dd><span class="star-pill">${UI.star}</span>${newStars}</dd>` : ''}
          <dt>Win streak</dt><dd>${save.winStreak}</dd>
          <dt>Biscuits earned</dt><dd>${icon('biscuit', 'biscuit-icon')}${earned}</dd>
        </dl>
        <div class="actions">
          ${level.id < LEVELS.length ? `<button class="btn next">Play level ${level.id + 1}</button>` : `<button class="btn finale">See Micah\u2019s big finish</button>`}
          <div class="pair">
            <button class="btn secondary to-map">Back to map</button>
            <button class="btn secondary replay">Play again</button>
          </div>
        </div>`);
      // Each star bursts with a little confetti as it lands.
      m.querySelectorAll<HTMLElement>('.result-stars i.on').forEach((st, i) => setTimeout(() => confetti(st, 50, 50, 14, 2.5), 380 + i * 200));
      m.querySelector('.replay')!.addEventListener('click', () => (m.remove(), showLevelIntro(level)));
      // Going back to the map shows Micah walking on to the newly unlocked level.
      // Only a first clear unlocks a new level, so replays don't send her walking.
      const walkFrom = firstClear ? level.id : undefined;
      m.querySelector('.to-map')!.addEventListener('click', () => (m.remove(), showMap(level.id, walkFrom)));
      m.querySelector('.finale')?.addEventListener('click', () => (m.remove(), showFinale()));
      m.querySelector('.share-btn')!.addEventListener('click', () =>
        shareWin({
          title: `Level ${level.id} cleared`,
          subtitle: zone.name,
          stars,
          lines: [
            ['Score', score.toLocaleString()],
            ['Win streak', String(save.winStreak)],
            ['Stars so far', String(totalStars(save))],
          ],
        }),
      );
      m.querySelector('.next')?.addEventListener('click', () => {
        m.remove();
        showMap(level.id + 1, walkFrom, () => showLevelIntro(LEVELS[level.id]));
      });
    } else {
      const m = modal(`
        <div class="modal-head">
          ${micahImg('modal-avatar sad')}
          <div><p class="eyebrow">${level.id === WEEKLY_ID ? 'Weekly Walk' : `Level ${level.id}`}</p><h2>Out of moves</h2></div>
          <span></span>
        </div>
        <section>
          <h3>Still to do</h3>
          <ul class="goal-list">${level.goals
            .map((g, i) => {
              const left = g.type === 'score' ? Math.max(0, g.target - score) : Math.max(0, remaining[i]);
              return `<li class="${left === 0 ? 'done' : ''}">${goalIcon(g)}<span>${goalText(g)}</span><em>${left === 0 ? 'Done' : `${left.toLocaleString()} left`}</em></li>`;
            })
            .join('')}</ul>
        </section>
        <div class="actions">
          <button class="btn more" ${save.inventory.leash || save.biscuits >= BOOSTERS.leash.price ? '' : 'disabled'}>
            ${save.inventory.leash ? 'Add 5 moves (uses 1 Long Leash)' : `Add 5 moves for ${BOOSTERS.leash.price} biscuits`}
          </button>
          <div class="pair">
            <button class="btn secondary quit">Back to map</button>
            <button class="btn secondary retry">Start over</button>
          </div>
        </div>`);
      m.querySelector('.more')!.addEventListener('click', () => {
        if (save.inventory.leash) save.inventory.leash--;
        else if (save.biscuits >= BOOSTERS.leash.price) save.biscuits -= BOOSTERS.leash.price;
        else return;
        persist(save);
        m.remove();
        moves += 5;
        sfx.whoosh();
        over = false;
        say('Five more moves. Make them count.', 'big');
        renderHud();
        armHint();
      });
      const endStreak = () => {
        save.winStreak = 0;
        persist(save);
      };
      m.querySelector('.quit')!.addEventListener('click', () => (endStreak(), m.remove(), showMap(level.id === WEEKLY_ID ? undefined : level.id)));
      m.querySelector('.retry')!.addEventListener('click', () => (endStreak(), m.remove(), showLevelIntro(level)));
    }
  }

  // ── Input: drag to swap, or tap one piece then a neighbour ──
  let dragStart: { p: Pos; x: number; y: number } | null = null;
  const cellAt = (e: PointerEvent): Pos | null => {
    const rect = boardEl.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / tileSize());
    const r = Math.floor((e.clientY - rect.top) / tileSize());
    return r >= 0 && c >= 0 && r < ROWS && c < COLS ? [r, c] : null;
  };
  let pressedPiece: Element | null = null;
  const releasePiece = () => (pressUp(pressedPiece), (pressedPiece = null));
  boardEl.addEventListener('pointerdown', (e) => {
    if (busy || over) return;
    const p = cellAt(e);
    if (!p) return;
    if (treatMode) {
      void eatTile(p);
      return;
    }
    if (dustMode) {
      void dustTile(p);
      return;
    }
    dragStart = { p, x: e.clientX, y: e.clientY };
    pressedPiece = tileEls.get(grid[p[0]][p[1]]?.id ?? -1)?.querySelector('.piece') ?? null;
    pressDown(pressedPiece);
    boardEl.setPointerCapture(e.pointerId);
  });
  boardEl.addEventListener('pointermove', (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const th = tileSize() * 0.35;
    if (Math.abs(dx) < th && Math.abs(dy) < th) return;
    const [r, c] = dragStart.p;
    const to: Pos = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c];
    dragStart = null;
    releasePiece();
    if (to[0] >= 0 && to[1] >= 0 && to[0] < ROWS && to[1] < COLS) void trySwap([r, c], to);
  });
  boardEl.addEventListener('pointerup', () => {
    releasePiece();
    if (!dragStart) return;
    const p = dragStart.p;
    dragStart = null;
    if (selected && isAdjacent(selected, p)) void trySwap(selected, p);
    else if (selected && selected[0] === p[0] && selected[1] === p[1]) selectCell(null);
    else selectCell(p);
  });

  boardEl.addEventListener('pointercancel', () => (releasePiece(), (dragStart = null)));

  // ── Keyboard and screen reader play ──
  // Arrow keys move a cursor. Enter or Space picks up the piece (or uses the chosen item on it),
  // then an arrow key swaps it with that neighbour. Escape puts it back down.
  const status = screen.querySelector<HTMLParagraphElement>('.board-status')!;
  const cursorEl = document.createElement('div');
  cursorEl.className = 'kb-cursor';
  cursorEl.hidden = true;
  boardEl.append(cursorEl);
  boardEl.tabIndex = 0;
  boardEl.setAttribute('role', 'application');
  boardEl.setAttribute('aria-roledescription', 'game board');
  boardEl.setAttribute('aria-label', `Game board, ${ROWS} by ${COLS}. Arrow keys move. Enter picks up a piece, then an arrow key swaps it.`);
  let cursor: Pos = [Math.floor(ROWS / 2) - 1, Math.floor(COLS / 2) - 1];
  const SPECIAL_NAMES: Record<Special, string> = { none: '', zoomRow: ' Zoomies, clears its row', zoomCol: ' Zoomies, clears its column', bark: ' Big Bark', micah: '' };
  const describe = ([r, c]: Pos) => {
    const t = grid[r][c];
    const what = !t ? 'empty' : t.special === 'micah' || !KINDS[t.kind] ? 'Micah piece' : KINDS[t.kind].name + SPECIAL_NAMES[t.special];
    const extra = [mud[r][c] > 1 ? 'deep mud' : mud[r][c] ? 'mud' : '', yarn[r][c] ? 'tangled in yarn' : ''].filter(Boolean).join(', ');
    return `Row ${r + 1}, column ${c + 1}: ${what}${extra ? `, ${extra}` : ''}`;
  };
  const announce = (text: string) => {
    status.textContent = '';
    requestAnimationFrame(() => (status.textContent = text));
  };
  const showCursor = () => {
    cursorEl.hidden = false;
    placeEl(cursorEl, cursor[0], cursor[1]);
  };
  boardEl.addEventListener('focus', () => {
    if (!boardEl.matches(':focus-visible')) return;
    showCursor();
    announce(describe(cursor));
  });
  boardEl.addEventListener('blur', () => (cursorEl.hidden = true));
  boardEl.addEventListener('pointerdown', () => (cursorEl.hidden = true));
  const STEPS: Record<string, Pos> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  boardEl.addEventListener('keydown', (e) => {
    const step = STEPS[e.key];
    if (step) {
      e.preventDefault();
      const to: Pos = [Math.min(ROWS - 1, Math.max(0, cursor[0] + step[0])), Math.min(COLS - 1, Math.max(0, cursor[1] + step[1]))];
      const from = selected;
      cursor = to;
      showCursor();
      if (from && !busy && !over && isAdjacent(from, to)) {
        void trySwap(from, to).then(() => {
          if (!over) announce(`${moves} moves left. ${describe(cursor)}`);
        });
      } else {
        if (from) selectCell(null);
        announce(describe(cursor));
      }
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (busy || over) return;
      showCursor();
      if (treatMode) return void eatTile(cursor);
      if (dustMode) return void dustTile(cursor);
      if (selected && selected[0] === cursor[0] && selected[1] === cursor[1]) {
        selectCell(null);
        announce('Put down.');
      } else {
        selectCell(cursor);
        announce(`Picked up. ${describe(cursor)}. Press an arrow key to swap.`);
      }
      return;
    }
    if (e.key === 'Escape' && selected) {
      e.stopPropagation();
      selectCell(null);
      announce('Put down.');
    }
  });

  screen.querySelector('.back')!.addEventListener('click', () => showMap(level.id === WEEKLY_ID ? undefined : level.id));

  renderAll();
  renderHud();
  say(level.goals.map(goalText).join(', then ') + '.');
  armHint();
  if (level.id === 1 && !save.seen.includes('guide')) window.setTimeout(showGuide, 700);
  else if (newTool) {
    window.setTimeout(() => {
      if (over) return;
      say(`New tool: ${BOOSTERS[newTool].name}! ${BOOSTERS[newTool].desc}`, 'big');
    }, 2200);
  }
  // Safety: a fresh board never starts with a match, but boosters could create none anyway.
  if (findRuns(grid).length) void runLocked(() => cascade([]));
}

async function boot() {
  app.querySelector('.launch-micah')?.setAttribute('src', costumeUrl(save.costume));
  await runLaunch(app);
  // Tags earned before they existed (or on another device) pay out now.
  const tags = awardBadges(save);
  if (tags.length) persist(save);
  showMap();
  if (tags.length) window.setTimeout(() => celebrate(tags), 600);
  // Returning players get their daily treat offered once, when they open the game.
  if (dailyClaimable(save) && Object.keys(save.stars).length > 0) showDaily();
}
void boot();
