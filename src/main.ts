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
import { BOOSTER_ICONS, KINDS, UI, micahUrl, svg } from './art';
import { LEVELS, ZONES, mudCount, type Goal, type Level } from './levels';
import { BOOSTERS, load, persist, requestDurableStorage, unlockedUpTo, type BoosterId, type SaveData } from './save';
import { setSound, sfx } from './sound';

const ROWS = 8;
const COLS = 8;
const app = document.querySelector<HTMLDivElement>('#app')!;
let save: SaveData = load();
const canSave = persist(save);
requestDurableStorage();
window.addEventListener('pagehide', () => persist(save));
setSound(save.sound);

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const h = (html: string): HTMLElement => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild as HTMLElement;
};
const icon = (id: string, cls = 'icon') => svg(BOOSTER_ICONS[id], cls);
const micahImg = (cls: string, alt = '') => `<img src="${micahUrl}" class="${cls}" alt="${alt}" draggable="false">`;
const stars3 = (n: number) => [1, 2, 3].map((s) => `<i class="${s <= n ? 'on' : ''}">${UI.star}</i>`).join('');

function goalIcon(goal: Goal): string {
  if (goal.type === 'collect') return svg(KINDS[goal.kind].svg, 'goal-icon');
  if (goal.type === 'mud') return svg(BOOSTER_ICONS.mud, 'goal-icon');
  return `<span class="goal-score">${UI.star}</span>`;
}
function goalText(goal: Goal): string {
  if (goal.type === 'collect') return `Collect ${goal.count} ${KINDS[goal.kind].plural.toLowerCase()}`;
  if (goal.type === 'mud') return 'Wash away every mud patch';
  return `Score ${goal.target.toLocaleString()} points`;
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
    return `<rect x="0" y="${yTop}" width="${width}" height="${yBot - yTop}" fill="${z.ground}"/>`;
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
        <div class="brand">${micahImg('brand-face')}<span>Micah Madness</span></div>
        <button class="wallet" data-act="shop" aria-label="${save.biscuits} biscuits. Open the Treat Shop">${icon('biscuit', 'biscuit-icon')}<b>${save.biscuits}</b><span class="add">${UI.plus}</span></button>
        <button class="round-btn" data-act="sound" aria-label="${save.sound ? 'Mute sound' : 'Turn sound on'}">${save.sound ? UI.soundOn : UI.soundOff}</button>
      </header>
      <div class="map-scroll ${Object.keys(save.stars).length === 0 ? 'has-welcome' : ''}">
        <div class="map" style="height:${height}px">
          <svg class="map-bg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="height:${height}px">
            ${zoneBands}
            ${decor}
            <path d="${path}" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" opacity=".55"/>
            
          </svg>
          ${ZONES.map((z, zi) => {
            const first = nodePos(zi * 5);
            const side = first.x < width / 2 ? 'right:16px' : 'left:16px';
            return `<div class="zone-banner" style="top:${first.y + 8}px;${side}"><small>Area ${zi + 1}</small><b>${z.name}</b></div>`;
          }).join('')}
          ${LEVELS.map((lv, i) => {
            const p = nodePos(i);
            const stars = save.stars[lv.id] ?? 0;
            const state = lv.id < unlocked || stars > 0 ? 'done' : lv.id === unlocked ? 'current' : 'locked';
            return `<button class="node ${state}" data-level="${lv.id}" style="left:${(p.x / width) * 100}%;top:${p.y}px" ${state === 'locked' ? 'disabled' : ''}>
                <span class="num">${state === 'locked' ? UI.lock : lv.id}</span>
                ${state === 'locked' ? '' : `<span class="node-stars">${stars3(stars)}</span>`}
              </button>`;
          }).join('')}
          ${(() => {
            const p = nodePos(unlocked - 1);
            return `<div class="map-micah" style="left:${(p.x / width) * 100}%;top:${p.y - 104}px">${micahImg('map-micah-face')}</div>`;
          })()}
        </div>
      </div>
      ${canSave ? '' : '<p class="save-warning">This browser isn\u2019t saving progress, so it resets when you close the page. Private browsing usually causes this.</p>'}
      ${Object.keys(save.stars).length === 0
        ? `<div class="welcome">
            ${micahImg('', 'Micah in his lobster costume')}
            <div><h2>Help Micah fetch his toys</h2>
            <p>Swap two neighbouring pieces to line up three of a kind. Each level has a goal and a move limit.</p></div>
            <button class="btn" data-act="start">Start level 1</button>
          </div>`
        : ''}
    </div>`);

  screen.querySelector('[data-act="shop"]')!.addEventListener('click', () => showShop(() => showMap()));
  screen.querySelector('[data-act="sound"]')!.addEventListener('click', () => {
    save.sound = !save.sound;
    setSound(save.sound);
    persist(save);
    showMap();
  });
  screen.querySelector('[data-act="start"]')?.addEventListener('click', () => showLevelIntro(LEVELS[0]));
  screen.querySelectorAll<HTMLButtonElement>('.node').forEach((n) =>
    n.addEventListener('click', () => showLevelIntro(LEVELS[Number(n.dataset.level) - 1])),
  );

  app.replaceChildren(screen);
  const scroller = screen.querySelector<HTMLElement>('.map-scroll')!;
  const target = nodePos((scrollTo ?? unlocked) - 1).y;
  scroller.scrollTop = scroller.classList.contains('has-welcome') ? scroller.scrollHeight : target - scroller.clientHeight / 2;
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
    <header class="modal-head">
      ${micahImg('modal-avatar')}
      <div><p class="eyebrow">${zone.name}</p><h2>Level ${level.id}</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </header>
    <section>
      <h3>Goal</h3>
      <ul class="goal-list">${level.goals.map((g) => `<li>${goalIcon(g)}<span>${goalText(g)}</span></li>`).join('')}</ul>
      <p class="meta-row">You have <b>${level.moves} moves</b>${save.best[level.id] ? ` · Best score <b>${save.best[level.id].toLocaleString()}</b>` : ''}</p>
    </section>
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
    <button class="btn play">Start level ${level.id}</button>`,
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
    startLevel(level, picks);
  });
}

function showShop(onClose: () => void): void {
  const render = () => `
    <header class="modal-head">
      ${icon('biscuit', 'modal-avatar')}
      <div><p class="eyebrow">Spend biscuits</p><h2>Treat Shop</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </header>
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
const BIG_CHEERS = ['ZOOMIES!', 'Micah Madness!', 'Who\u2019s a good player?', 'Bark-tastic!', 'Pawsome!'];

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
  let bonusPts = 0;
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
    <div class="screen game-screen">
      <header class="hud">
        <button class="round-btn back" aria-label="Back to map">${UI.back}</button>
        <div class="stat"><small>Level</small><b>${level.id}</b></div>
        <div class="stat moves"><small>Moves</small><b class="moves-val">${moves}</b></div>
        <div class="stat score"><div class="score-line"><small>Score</small><b class="score-val">0</b></div>
          <div class="star-bar"><div class="star-fill"></div>${level.stars
            .map((s, i) => `<i style="left:${(s / level.stars[2]) * 100}%" data-i="${i}">${UI.star}</i>`)
            .join('')}</div>
        </div>
      </header>
      <div class="info-row">
        <div class="mascot">
          <div class="mascot-face">${micahImg('mascot-img')}</div>
          <div class="bubble"></div>
        </div>
        <div class="goals"></div>
      </div>
      <div class="board-wrap"><div class="board"></div></div>
      <div class="tools"></div>
    </div>`);
  app.replaceChildren(screen);

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
    t.special === 'micah' ? micahImg('piece') : svg(KINDS[t.kind].svg, 'piece');

  function makeTileEl(t: Tile): HTMLDivElement {
    const el = document.createElement('div');
    el.className = `tile ${specialClass(t.special)}`;
    el.innerHTML = tileInner(t) + (t.special === 'zoomRow' || t.special === 'zoomCol' ? '<span class="streaks"></span>' : '');
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
        return `<div class="goal ${done ? 'done' : ''}">${goalIcon(g)}<b>${done ? UI.check : g.type === 'score' ? left.toLocaleString() : left}</b></div>`;
      })
      .join('');
    screen.querySelector('.tools')!.innerHTML = (['treat', 'squirrel', 'leash'] as const)
      .map(
        (id) => `<button class="tool ${id === 'treat' && treatMode ? 'active' : ''}" data-id="${id}" aria-label="${BOOSTERS[id].name}: ${BOOSTERS[id].desc} ${save.inventory[id] ? `${save.inventory[id]} left` : 'None left, tap to buy'}">
          ${icon(id, 'tool-icon')}<span class="label">${BOOSTERS[id].name}</span><span class="count ${save.inventory[id] ? '' : 'empty'}">${save.inventory[id] || UI.plus}</span></button>`,
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
      say('No moves left, so Micah shuffled the board.', 'big');
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
      say('That swap doesn\u2019t make a match.', 'sad');
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
      say(treatMode ? 'Tap any piece and Micah will eat it.' : 'Treat put away.');
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
      bonusPts = bonus;
      say(bonus ? `Level cleared. ${moves} spare moves add ${bonus} points.` : 'Level cleared. Good dog!', 'big');
      await wait(900);
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
    if (won) {
      const stars = level.stars.filter((s) => score >= s).length || 1;
      const firstClear = !(save.stars[level.id] > 0);
      const earned = stars * 10 + (firstClear ? 20 : 0);
      save.stars[level.id] = Math.max(save.stars[level.id] ?? 0, stars);
      save.best[level.id] = Math.max(save.best[level.id] ?? 0, score);
      save.biscuits += earned;
      persist(save);
      const m = modal(`
        <header class="modal-head">
          ${micahImg('modal-avatar')}
          <div><p class="eyebrow">${zone.name}</p><h2>Level ${level.id} cleared</h2></div>
          <span></span>
        </header>
        <div class="result-stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}" style="animation-delay:${s * 0.2}s">${UI.star}</i>`).join('')}</div>
        <dl class="stat-rows">
          <dt>Score</dt><dd>${score.toLocaleString()}</dd>
          ${bonusPts ? `<dt>Spare-move bonus</dt><dd>${bonusPts.toLocaleString()}</dd>` : ''}
          <dt>Biscuits earned</dt><dd>${icon('biscuit', 'biscuit-icon')}${earned}</dd>
        </dl>
        <div class="actions">
          <button class="btn next">${level.id < LEVELS.length ? `Play level ${level.id + 1}` : 'Back to map'}</button>
          <button class="btn secondary replay">Play level ${level.id} again</button>
        </div>`);
      m.querySelector('.replay')!.addEventListener('click', () => (m.remove(), showLevelIntro(level)));
      m.querySelector('.next')!.addEventListener('click', () => {
        m.remove();
        showMap(level.id + 1);
        if (level.id < LEVELS.length) showLevelIntro(LEVELS[level.id]);
      });
    } else {
      const m = modal(`
        <header class="modal-head">
          ${micahImg('modal-avatar sad')}
          <div><p class="eyebrow">Level ${level.id}</p><h2>Out of moves</h2></div>
          <span></span>
        </header>
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
        over = false;
        say('Five more moves. Make them count.', 'big');
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
    ro.disconnect();
    over = true;
    showMap(level.id);
  });

  renderAll();
  renderHud();
  say(level.goals.map(goalText).join(', then ') + '.');
  armHint();
  // Safety: a fresh board never starts with a match, but boosters could create none anyway.
  if (findRuns(grid).length) void cascade([]);
}

showMap();
