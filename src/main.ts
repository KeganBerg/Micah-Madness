import './style.css';
import {
  applyClear,
  applyGravity,
  comboClears,
  computeClear,
  createGrid,
  findMove,
  findRuns,
  hasMove,
  isAdjacent,
  isLegalSwap,
  key,
  newTile,
  shuffle,
  swap,
  unkey,
  type ClearResult,
  type Grid,
  type Pos,
  type Special,
  type Tile,
} from './board';
import { BOOSTER_ICONS, KINDS, micahFace, svg } from './art';
import { LEVELS, ZONES, mudCount, type Goal, type Level } from './levels';
import { BOOSTERS, load, persist, unlockedUpTo, type BoosterId, type SaveData } from './save';
import { setSound, sfx } from './sound';

const ROWS = 8;
const COLS = 8;
const app = document.querySelector<HTMLDivElement>('#app')!;
let save: SaveData = load();
setSound(save.sound);

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const h = (html: string): HTMLElement => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};
const icon = (id: string, cls = 'icon') => svg(BOOSTER_ICONS[id], cls);

function goalIcon(goal: Goal): string {
  if (goal.type === 'collect') return svg(KINDS[goal.kind].svg, 'goal-icon');
  if (goal.type === 'mud') return svg(BOOSTER_ICONS.mud, 'goal-icon');
  return `<span class="goal-score">★</span>`;
}
function goalText(goal: Goal): string {
  if (goal.type === 'collect') return `Collect ${goal.count} ${KINDS[goal.kind].plural}`;
  if (goal.type === 'mud') return 'Clean all the mud';
  return `Score ${goal.target.toLocaleString()}`;
}

// ───────────────────────────── Map screen ─────────────────────────────

function showMap(scrollTo?: number): void {
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

  // Zone backgrounds, bottom to top.
  const zoneBands = ZONES.map((z, zi) => {
    const yTop = zi === ZONES.length - 1 ? 0 : nodePos(zi * 5 + 4).y - spacing / 2;
    const yBot = zi === 0 ? height : nodePos(zi * 5).y + spacing / 2;
    return `<rect x="0" y="${yTop}" width="${width}" height="${yBot - yTop}" fill="${z.ground}"/>
      <rect x="0" y="${yTop}" width="${width}" height="6" fill="${z.sky}" opacity=".9"/>`;
  }).join('');

  const decorKinds = [[0, 1, 2], [1, 1, 3], [4, 4, 5], [2, 3, 0], [5, 4, 1]];
  const decor = LEVELS.map((_, i) => {
    const { y } = nodePos(i);
    const z = Math.floor(i / 5);
    const kind = decorKinds[z][i % 3];
    const side = Math.sin(i * 0.95) > 0 ? 40 : width - 70;
    return `<g transform="translate(${side - 10} ${y - 30}) scale(.42)" opacity=".55">${KINDS[kind].svg}</g>`;
  }).join('');

  let path = '';
  LEVELS.forEach((_, i) => {
    const p = nodePos(i);
    if (i === 0) path += `M ${p.x} ${p.y}`;
    else {
      const prev = nodePos(i - 1);
      const my = (prev.y + p.y) / 2;
      path += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
    }
  });

  const screen = h(`
    <div class="screen map-screen">
      <header class="topbar">
        <div class="brand">${svg(micahFace(), 'brand-face')}<span>Micah Madness</span></div>
        <button class="pill biscuits" data-act="shop">${icon('biscuit', 'pill-icon')}<b>${save.biscuits}</b><span class="plus">+</span></button>
        <button class="round-btn" data-act="sound" aria-label="Toggle sound">${save.sound ? '🔊' : '🔇'}</button>
      </header>
      <div class="map-scroll">
        <div class="map" style="height:${height}px">
          <svg class="map-bg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="height:${height}px">
            ${zoneBands}
            ${decor}
            <path d="${path}" fill="none" stroke="#fff8e6" stroke-width="26" stroke-linecap="round" opacity=".9"/>
            <path d="${path}" fill="none" stroke="#e6cfa0" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round"/>
          </svg>
          ${ZONES.map((z, zi) => {
            const y = nodePos(zi * 5).y + 46;
            return `<div class="zone-banner" style="top:${y}px">${z.name}</div>`;
          }).join('')}
          ${LEVELS.map((lv, i) => {
            const p = nodePos(i);
            const stars = save.stars[lv.id] ?? 0;
            const state = lv.id < unlocked || stars > 0 ? 'done' : lv.id === unlocked ? 'current' : 'locked';
            return `<button class="node ${state}" data-level="${lv.id}" style="left:${(p.x / width) * 100}%;top:${p.y}px" ${state === 'locked' ? 'disabled' : ''}>
                <span class="num">${state === 'locked' ? '🔒' : lv.id}</span>
                <span class="node-stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}">★</i>`).join('')}</span>
              </button>`;
          }).join('')}
          ${(() => {
            const p = nodePos(unlocked - 1);
            const lobsterSuit = ZONES[Math.floor((unlocked - 1) / 5)].name === 'Lobster Beach';
            return `<div class="map-micah" style="left:${(p.x / width) * 100}%;top:${p.y - 70}px">${svg(micahFace({ lobster: lobsterSuit }), 'map-micah-face')}</div>`;
          })()}
        </div>
      </div>
    </div>`);

  screen.querySelector('[data-act="shop"]')!.addEventListener('click', () => showShop(() => showMap()));
  screen.querySelector('[data-act="sound"]')!.addEventListener('click', () => {
    save.sound = !save.sound;
    setSound(save.sound);
    persist(save);
    showMap();
  });
  screen.querySelectorAll<HTMLButtonElement>('.node').forEach((n) =>
    n.addEventListener('click', () => showLevelIntro(LEVELS[Number(n.dataset.level) - 1])),
  );

  app.replaceChildren(screen);
  const scroller = screen.querySelector<HTMLElement>('.map-scroll')!;
  const target = nodePos((scrollTo ?? unlocked) - 1).y;
  scroller.scrollTop = target - scroller.clientHeight / 2;
}

// ───────────────────────────── Modals ─────────────────────────────

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
  document.body.append(m);
  return m;
}

function showLevelIntro(level: Level): void {
  const picks: Record<'zoomies' | 'micah', boolean> = { zoomies: false, micah: false };
  const zone = ZONES[level.zone];
  const m = modal(
    `
    <button class="close" aria-label="Close">✕</button>
    <div class="modal-micah">${svg(micahFace({ lobster: zone.name === 'Lobster Beach' }), 'modal-face')}</div>
    <h2>Level ${level.id}</h2>
    <p class="zone-name">${zone.name}</p>
    <ul class="goal-list">${level.goals.map((g) => `<li>${goalIcon(g)}<span>${goalText(g)}</span></li>`).join('')}</ul>
    <p class="moves-note">${level.moves} moves</p>
    <h3>Boosters</h3>
    <div class="pre-boosters">
      ${(['zoomies', 'micah'] as const)
        .map(
          (id) => `<button class="pre-booster" data-id="${id}" ${save.inventory[id] ? '' : 'disabled'}>
            ${icon(id, 'booster-icon')}<span class="count">${save.inventory[id]}</span>
            <span class="label">${BOOSTERS[id].name}</span></button>`,
        )
        .join('')}
    </div>
    <button class="big-btn play">Play!</button>`,
    () => {},
  );
  m.querySelector('.close')!.addEventListener('click', () => m.remove());
  m.querySelectorAll<HTMLButtonElement>('.pre-booster').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.id as 'zoomies' | 'micah';
      picks[id] = !picks[id];
      b.classList.toggle('picked', picks[id]);
    }),
  );
  m.querySelector('.play')!.addEventListener('click', () => {
    for (const id of ['zoomies', 'micah'] as const) if (picks[id]) save.inventory[id]--;
    persist(save);
    m.remove();
    startLevel(level, picks);
  });
}

function showShop(onClose: () => void): void {
  const render = () => `
    <button class="close" aria-label="Close">✕</button>
    <h2>Treat Shop</h2>
    <p class="shop-wallet">${icon('biscuit', 'pill-icon')} <b>${save.biscuits}</b> biscuits</p>
    <p class="hint-text">Earn biscuits by winning levels. More stars, more biscuits.</p>
    <ul class="shop-list">
      ${(Object.keys(BOOSTERS) as BoosterId[])
        .map(
          (id) => `<li>
            ${icon(id, 'booster-icon')}
            <div class="shop-info"><b>${BOOSTERS[id].name}</b> <small>(own ${save.inventory[id]})</small><span>${BOOSTERS[id].desc}</span></div>
            <button class="buy" data-id="${id}" ${save.biscuits < BOOSTERS[id].price ? 'disabled' : ''}>${icon('biscuit', 'buy-icon')}${BOOSTERS[id].price}</button>
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
        persist(save);
        m.querySelector('.modal')!.innerHTML = render();
        wire();
      }),
    );
  };
  wire();
}

// ───────────────────────────── Game screen ─────────────────────────────

const CHEERS = ['Good match!', 'Woof!', 'Treat time!', 'Wag wag!', 'Nice!', 'Bork!'];
const BIG_CHEERS = ['ZOOMIES!', 'Micah Madness!', 'Who’s a good player?', 'Bark-tastic!', 'Pawsome!'];

function startLevel(level: Level, picks: { zoomies: boolean; micah: boolean }): void {
  const kinds = level.kinds;
  let grid: Grid = createGrid(ROWS, COLS, Math.random, kinds);
  const mud: boolean[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => (level.mud?.[r]?.[c] ?? '.') === 'm'),
  );
  let moves = level.moves;
  let score = 0;
  let busy = false;
  let over = false;
  let treatMode = false;
  let selected: Pos | null = null;
  let hintTimer = 0;
  const totalMud = mudCount(level);
  const remaining = level.goals.map((g) => (g.type === 'collect' ? g.count : g.type === 'mud' ? totalMud : g.target));

  // Pre-level boosters: drop specials onto random cells.
  const randomCell = (): Pos => [2 + Math.floor(Math.random() * 4), Math.floor(Math.random() * COLS)];
  if (picks.zoomies) {
    for (let i = 0; i < 2; i++) {
      const [r, c] = randomCell();
      grid[r][c]!.special = i % 2 ? 'zoomCol' : 'zoomRow';
    }
  }
  if (picks.micah) {
    const [r, c] = randomCell();
    grid[r][c] = newTile(-1, 'micah');
  }

  const zone = ZONES[level.zone];
  const screen = h(`
    <div class="screen game-screen" style="--zone-sky:${zone.sky};--zone-ground:${zone.ground}">
      <header class="game-top">
        <button class="round-btn back" aria-label="Back to map">‹</button>
        <div class="stat"><small>Level</small><b>${level.id}</b></div>
        <div class="stat moves"><small>Moves</small><b class="moves-val">${moves}</b></div>
        <div class="stat score"><small>Score</small><b class="score-val">0</b>
          <div class="star-bar"><div class="star-fill"></div>${level.stars
            .map((s, i) => `<i style="left:${(s / level.stars[2]) * 100}%" data-i="${i}">★</i>`)
            .join('')}</div>
        </div>
      </header>
      <div class="goals"></div>
      <div class="mascot">
        <div class="mascot-face">${svg(micahFace({ lobster: zone.name === 'Lobster Beach' }), 'mascot-svg')}</div>
        <div class="bubble">Let's go!</div>
      </div>
      <div class="board-wrap"><div class="board"></div></div>
      <div class="tools"></div>
    </div>`);
  app.replaceChildren(screen);

  const boardEl = screen.querySelector<HTMLDivElement>('.board')!;
  const bubble = screen.querySelector<HTMLDivElement>('.bubble')!;
  const mascot = screen.querySelector<HTMLDivElement>('.mascot-face')!;
  const tileSize = () => boardEl.clientWidth / COLS;

  // Cell backgrounds (including mud layer).
  const cellEls: HTMLDivElement[][] = [];
  for (let r = 0; r < ROWS; r++) {
    cellEls.push([]);
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = `cell ${(r + c) % 2 ? 'alt' : ''} ${mud[r][c] ? 'mud' : ''}`;
      cell.style.left = `${(c / COLS) * 100}%`;
      cell.style.top = `${(r / ROWS) * 100}%`;
      boardEl.append(cell);
      cellEls[r].push(cell);
    }
  }

  const tileEls = new Map<number, HTMLDivElement>();
  const specialClass = (s: Special) => (s === 'none' ? '' : `sp-${s}`);
  const tileInner = (t: Tile) =>
    t.special === 'micah' ? svg(micahFace({ tongue: true }), 'piece') : svg(KINDS[t.kind].svg, 'piece');

  function makeTileEl(t: Tile): HTMLDivElement {
    const el = document.createElement('div');
    el.className = `tile ${specialClass(t.special)}`;
    el.innerHTML = tileInner(t) + (t.special === 'zoomRow' || t.special === 'zoomCol' ? '<span class="streaks"></span>' : '') + (t.special === 'bark' ? '<span class="ring"></span>' : '');
    el.dataset.special = t.special;
    boardEl.append(el);
    tileEls.set(t.id, el);
    return el;
  }
  function placeEl(el: HTMLElement, r: number, c: number) {
    el.style.transform = `translate(${c * 100}%, ${r * 100}%)`;
  }
  function syncTileEl(t: Tile, r: number, c: number) {
    let el = tileEls.get(t.id);
    if (!el || el.dataset.special !== t.special) {
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
    mascot.classList.remove('bounce', 'shake');
    void mascot.offsetWidth;
    mascot.classList.add(mood === 'sad' ? 'shake' : 'bounce');
  }

  function renderHud() {
    screen.querySelector('.moves-val')!.textContent = String(moves);
    screen.querySelector('.moves')!.classList.toggle('low', moves <= 5);
    screen.querySelector('.score-val')!.textContent = score.toLocaleString();
    (screen.querySelector('.star-fill') as HTMLElement).style.width = `${Math.min(100, (score / level.stars[2]) * 100)}%`;
    screen.querySelectorAll<HTMLElement>('.star-bar i').forEach((s, i) => s.classList.toggle('on', score >= level.stars[i]));
    screen.querySelector('.goals')!.innerHTML = level.goals
      .map((g, i) => {
        const left = Math.max(0, g.type === 'score' ? g.target - score : remaining[i]);
        const done = left === 0;
        return `<div class="goal ${done ? 'done' : ''}">${goalIcon(g)}<b>${done ? '✓' : g.type === 'score' ? left.toLocaleString() : left}</b></div>`;
      })
      .join('');
    screen.querySelector('.tools')!.innerHTML = (['treat', 'squirrel', 'leash'] as const)
      .map(
        (id) => `<button class="tool ${id === 'treat' && treatMode ? 'active' : ''}" data-id="${id}" title="${BOOSTERS[id].desc}">
          ${icon(id, 'tool-icon')}<span class="count">${save.inventory[id] || '+'}</span><span class="label">${BOOSTERS[id].name}</span></button>`,
      )
      .join('');
    screen.querySelectorAll<HTMLButtonElement>('.tool').forEach((b) => b.addEventListener('click', () => useTool(b.dataset.id as BoosterId)));
  }

  const goalsMet = () => level.goals.every((g, i) => (g.type === 'score' ? score >= g.target : remaining[i] <= 0));

  function clearHint() {
    window.clearTimeout(hintTimer);
    boardEl.querySelectorAll('.hint').forEach((e) => e.classList.remove('hint'));
  }
  function armHint() {
    clearHint();
    hintTimer = window.setTimeout(() => {
      if (busy || over) return;
      const mv = findMove(grid);
      if (!mv) return;
      for (const [r, c] of mv) tileEls.get(grid[r][c]!.id)?.classList.add('hint');
    }, 6000);
  }

  function flashEffects(res: ClearResult) {
    for (const f of res.fired) {
      const fx = document.createElement('div');
      fx.className = `fx fx-${f.special}`;
      const [r, c] = f.pos;
      fx.style.setProperty('--r', String(r));
      fx.style.setProperty('--c', String(c));
      boardEl.append(fx);
      setTimeout(() => fx.remove(), 500);
      if (f.special === 'bark') sfx.bark();
      else sfx.zoom();
    }
  }

  function floatScore(points: number, cells: Set<number>) {
    if (!cells.size) return;
    let sr = 0, sc = 0;
    for (const k of cells) {
      const [r, c] = unkey(k);
      sr += r;
      sc += c;
    }
    const el = document.createElement('div');
    el.className = 'float-score';
    el.textContent = `+${points}`;
    el.style.left = `${((sc / cells.size + 0.5) / COLS) * 100}%`;
    el.style.top = `${((sr / cells.size + 0.5) / ROWS) * 100}%`;
    boardEl.append(el);
    setTimeout(() => el.remove(), 900);
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
      level.goals.forEach((g, i) => {
        if (g.type === 'collect') remaining[i] -= res.collected[g.kind];
      });
      for (const k of res.cleared) {
        const [r, c] = unkey(k);
        if (mud[r][c]) {
          mud[r][c] = false;
          cellEls[r][c].classList.remove('mud');
          cellEls[r][c].classList.add('cleaned');
          level.goals.forEach((g, i) => g.type === 'mud' && remaining[i]--);
        }
      }
      sfx.pop(chain);
      flashEffects(res);
      floatScore(points, res.cleared);
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
    if (!hasMove(grid)) {
      say('Squirrel! Shuffling the yard…', 'big');
      await wait(400);
      shuffle(grid);
      renderAll();
      await wait(350);
    }
  }

  async function trySwap(a: Pos, b: Pos) {
    if (busy || over || !isAdjacent(a, b)) return;
    busy = true;
    clearHint();
    selectCell(null);
    sfx.swap();
    const legal = isLegalSwap(grid, a, b);
    swap(grid, a, b);
    renderAll();
    await wait(170);
    if (!legal) {
      swap(grid, a, b);
      renderAll();
      sfx.bad();
      say('Hmm… no match there.', 'sad');
      await wait(170);
      busy = false;
      armHint();
      return;
    }
    moves--;
    renderHud();
    const forced = comboClears(grid, a, b) ?? [];
    if (forced.length) renderAll();
    await cascade([b, a], forced);
    busy = false;
    await checkEnd();
    armHint();
  }

  function selectCell(p: Pos | null) {
    boardEl.querySelectorAll('.selected').forEach((e) => e.classList.remove('selected'));
    selected = p;
    if (p) tileEls.get(grid[p[0]][p[1]]!.id)?.classList.add('selected');
  }

  async function useTool(id: BoosterId) {
    if (busy || over) return;
    if (!save.inventory[id]) {
      showShop(() => renderHud());
      return;
    }
    if (id === 'treat') {
      treatMode = !treatMode;
      say(treatMode ? 'Tap a piece and I’ll eat it!' : 'Okay, saving it for later.');
      renderHud();
      return;
    }
    save.inventory[id]--;
    persist(save);
    if (id === 'leash') {
      moves += 5;
      say('Long walk! +5 moves', 'big');
      renderHud();
    }
    if (id === 'squirrel') {
      busy = true;
      say('SQUIRREL!!', 'big');
      shuffle(grid);
      renderAll();
      await wait(350);
      await cascade([]);
      busy = false;
      renderHud();
      await checkEnd();
    }
  }

  async function eatTile(p: Pos) {
    treatMode = false;
    save.inventory.treat--;
    persist(save);
    busy = true;
    say('Nom nom nom!', 'big');
    await cascade([], [key(p[0], p[1])]);
    busy = false;
    renderHud();
    await checkEnd();
  }

  async function checkEnd() {
    if (over) return;
    if (goalsMet()) {
      over = true;
      const bonus = moves * 250;
      score += bonus;
      renderHud();
      sfx.win();
      say(bonus ? `We did it! +${bonus} bonus for spare moves` : 'We did it! Good dog!', 'big');
      await wait(900);
      finish(true);
    } else if (moves <= 0) {
      over = true;
      sfx.lose();
      say('Out of moves… one more try?', 'sad');
      await wait(700);
      finish(false);
    }
  }

  function finish(won: boolean) {
    clearHint();
    if (won) {
      const stars = level.stars.filter((s) => score >= s).length || 1;
      const firstClear = !(save.stars[level.id] > 0);
      const earned = stars * 10 + (firstClear ? 20 : 0);
      save.stars[level.id] = Math.max(save.stars[level.id] ?? 0, stars);
      save.best[level.id] = Math.max(save.best[level.id] ?? 0, score);
      save.biscuits += earned;
      persist(save);
      const m = modal(`
        <div class="modal-micah">${svg(micahFace({ lobster: zone.name === 'Lobster Beach' }), 'modal-face happy')}</div>
        <h2>Level ${level.id} cleared!</h2>
        <div class="result-stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}" style="animation-delay:${s * 0.2}s">★</i>`).join('')}</div>
        <p class="result-score">${score.toLocaleString()} points</p>
        <p class="earned">${icon('biscuit', 'pill-icon')} +${earned} biscuits</p>
        <div class="row">
          <button class="big-btn alt replay">Replay</button>
          <button class="big-btn next">${level.id < LEVELS.length ? 'Next level' : 'Back to map'}</button>
        </div>`);
      m.querySelector('.replay')!.addEventListener('click', () => (m.remove(), showLevelIntro(level)));
      m.querySelector('.next')!.addEventListener('click', () => {
        m.remove();
        showMap(level.id + 1);
        if (level.id < LEVELS.length) showLevelIntro(LEVELS[level.id]);
      });
    } else {
      const m = modal(`
        <div class="modal-micah">${svg(micahFace({ cap: true, tongue: false }), 'modal-face sad')}</div>
        <h2>Out of moves!</h2>
        <ul class="goal-list">${level.goals
          .map((g, i) => {
            const left = g.type === 'score' ? Math.max(0, g.target - score) : Math.max(0, remaining[i]);
            return `<li>${goalIcon(g)}<span>${left === 0 ? 'Done ✓' : `${left.toLocaleString()} to go`}</span></li>`;
          })
          .join('')}</ul>
        <button class="big-btn more" ${save.inventory.leash || save.biscuits >= BOOSTERS.leash.price ? '' : 'disabled'}>
          +5 moves (${save.inventory.leash ? `use Long Leash, own ${save.inventory.leash}` : `${BOOSTERS.leash.price} biscuits`})
        </button>
        <div class="row">
          <button class="big-btn alt quit">Map</button>
          <button class="big-btn retry">Retry</button>
        </div>`);
      m.querySelector('.more')!.addEventListener('click', () => {
        if (save.inventory.leash) save.inventory.leash--;
        else if (save.biscuits >= BOOSTERS.leash.price) save.biscuits -= BOOSTERS.leash.price;
        else return;
        persist(save);
        m.remove();
        moves += 5;
        over = false;
        say('Five more moves, let’s go!', 'big');
        renderHud();
        armHint();
      });
      m.querySelector('.quit')!.addEventListener('click', () => (m.remove(), showMap(level.id)));
      m.querySelector('.retry')!.addEventListener('click', () => (m.remove(), showLevelIntro(level)));
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
  boardEl.addEventListener('pointerdown', (e) => {
    if (busy || over) return;
    const p = cellAt(e);
    if (!p) return;
    if (treatMode) {
      void eatTile(p);
      return;
    }
    dragStart = { p, x: e.clientX, y: e.clientY };
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
    if (to[0] >= 0 && to[1] >= 0 && to[0] < ROWS && to[1] < COLS) void trySwap([r, c], to);
  });
  boardEl.addEventListener('pointerup', () => {
    if (!dragStart) return;
    const p = dragStart.p;
    dragStart = null;
    if (selected && isAdjacent(selected, p)) void trySwap(selected, p);
    else if (selected && selected[0] === p[0] && selected[1] === p[1]) selectCell(null);
    else selectCell(p);
  });

  screen.querySelector('.back')!.addEventListener('click', () => {
    clearHint();
    over = true;
    showMap(level.id);
  });

  renderAll();
  renderHud();
  say(level.goals.map(goalText).join(' + ') + '!');
  armHint();
  // Safety: a fresh board never starts with a match, but boosters could create none anyway.
  if (findRuns(grid).length) void cascade([]);
}

showMap();
