// The Workshop screen: the merge board from craft.ts, drawn and played.
// main.ts hands in its helpers (pop-ups, toasts, saving) so this file only deals with the board.

import { BOOSTER_ICONS, UI, svg } from './art';
import { YOSHI } from './yoshi';
import { owlSVG, raccoonBit } from './scenery';
import { AREAS, DECOR, areaOpen, type YardArea } from './yard';
import {
  CELLS,
  CHAINS,
  COLS,
  REBUILD_REWARD,
  ROWS,
  cleanCraft,
  drop,
  eatLine,
  feedMicah,
  fillOrder,
  findReward,
  freshCraft,
  itemOf,
  orderHave,
  orderReady,
  parse,
  placeMakers,
  spawn,
  topUpOrders,
  type Chain,
  type CraftSave,
  type Who,
} from './craft';
import type { SaveData } from './save';
import { sfx } from './sound';
import { haptic } from './haptics';
import { floatLabel, pop } from './tap';
import { confettiRain } from './juice';

export interface WorkshopKit {
  save: () => SaveData;
  persist: () => void;
  h: (html: string) => HTMLElement;
  mount: (screen: HTMLElement, onLeave?: () => void) => void;
  modal: (inner: string, onClose?: () => void) => HTMLElement;
  toast: (html: string) => void;
  micahImg: (cls: string, alt?: string) => string;
  /** Pays collar tags earned since the last check, with their card. */
  tags: () => void;
  back: () => void;
  toYard: (area: YardArea) => void;
}

const BOOK = `<svg viewBox="0 0 24 24" class="ui-icon" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg>`;
const biscuit = () => svg(BOOSTER_ICONS.biscuit, 'biscuit-icon');
const art = (code: string, cls = 'ci-art') => svg(itemOf(code)?.svg ?? '', cls);

const WHO_NAME: Record<Who, string> = { micah: 'Micah', yoshi: 'Yoshi', owl: 'The owl', raccoon: 'A raccoon' };
function face(who: Who, micah: string): string {
  if (who === 'micah') return micah;
  if (who === 'yoshi') return `<svg viewBox="-27 -54 54 56" class="who-face" aria-hidden="true">${YOSHI}</svg>`;
  if (who === 'owl') return `<svg viewBox="-9 -19 18 20" class="who-face" aria-hidden="true">${owlSVG()}</svg>`;
  return `<svg viewBox="-9 -17 23 23" class="who-face" aria-hidden="true">${raccoonBit()}</svg>`;
}

/** Load (or start) the workshop on the save, with makers and orders brought up to date. */
export function workshopState(save: SaveData): { craft: CraftSave; placed: Chain[]; waiting: Chain[] } {
  const craft = cleanCraft(save.craft) ?? freshCraft();
  save.craft = craft;
  const { placed, waiting } = placeMakers(craft, save.stars);
  topUpOrders(craft, save.stars);
  return { craft, placed, waiting };
}

export function showWorkshop(kit: WorkshopKit): void {
  const save = kit.save();
  const { craft, placed, waiting } = workshopState(save);
  kit.persist();
  let selected = -1;

  const screen = kit.h(`
    <div class="screen craft-screen">
      <header class="topbar">
        <button class="round-btn" data-act="back" aria-label="Back to map">${UI.back}</button>
        <div class="brand"><span>Micah's Workshop</span></div>
        <div class="wallet craft-wallet" aria-live="polite">${biscuit()}<b>${save.biscuits}</b></div>
      </header>
      <div class="craft-orders" aria-label="Orders"></div>
      <div class="craft-wrap"><div class="craft-board" role="grid" aria-label="Workshop board"></div></div>
      <div class="craft-bar">
        <button class="craft-book round-btn" data-act="book" aria-label="Craft book">${BOOK}</button>
        <p class="craft-info" aria-live="polite"></p>
        <button class="craft-micah" data-act="micah" aria-label="Micah. Drag something here and she eats it">${kit.micahImg('craft-micah-img')}<span>Feed</span></button>
      </div>
    </div>`);
  const boardEl = screen.querySelector<HTMLElement>('.craft-board')!;
  const ordersEl = screen.querySelector<HTMLElement>('.craft-orders')!;
  const infoEl = screen.querySelector<HTMLElement>('.craft-info')!;
  const micahEl = screen.querySelector<HTMLElement>('.craft-micah')!;
  const walletEl = screen.querySelector<HTMLElement>('.craft-wallet b')!;

  const wrap = screen.querySelector<HTMLElement>('.craft-wrap')!;
  const fit = () => {
    // Inside the padding, leaving room for the board's 6px outline.
    const cs = getComputedStyle(wrap);
    const w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 12;
    const hh = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 12;
    const cell = Math.floor(Math.min(w / COLS, hh / ROWS));
    boardEl.style.width = `${cell * COLS}px`;
    boardEl.style.height = `${cell * ROWS}px`;
  };
  const ro = new ResizeObserver(fit);
  ro.observe(wrap);

  const pay = (n: number) => {
    save.biscuits += n;
    walletEl.textContent = String(save.biscuits);
    pop(walletEl.parentElement);
  };

  // ── drawing ──
  function cellHtml(i: number): string {
    const c = craft.cells[i];
    const p = parse(c);
    const alt = (Math.floor(i / COLS) + (i % COLS)) % 2 ? ' alt' : '';
    if (p.kind === 'empty') return `<div class="cc${alt}" data-i="${i}" role="gridcell" aria-label="Empty"></div>`;
    const name = p.kind === 'maker' ? p.chain!.maker.name : p.chain!.items[p.tier! - 1].name;
    const cls = p.kind === 'maker' ? 'maker' : p.boxed ? 'boxed' : '';
    return `<div class="cc${alt}" data-i="${i}" role="gridcell" aria-label="${p.boxed ? `${name}, in a box` : name}">
      <div class="ci ${cls}" data-i="${i}">${art(c)}${p.kind === 'item' && !p.boxed ? `<i class="tier">${p.tier}</i>` : ''}</div></div>`;
  }
  function renderBoard() {
    boardEl.innerHTML = craft.cells.map((_, i) => cellHtml(i)).join('');
    markSame();
  }
  function markSame() {
    const code = selected >= 0 ? craft.cells[selected].replace(/:b$/, '') : '';
    boardEl.querySelectorAll<HTMLElement>('.cc').forEach((el) => {
      const i = Number(el.dataset.i);
      el.classList.toggle('sel', i === selected);
      el.classList.toggle('same', !!code && i !== selected && parse(code).kind === 'item' && craft.cells[i].replace(/:b$/, '') === code);
    });
  }
  function renderOrders() {
    ordersEl.innerHTML = craft.orders
      .map((o, i) => {
        const have = orderHave(craft, o);
        const ready = have.every(Boolean);
        const wants = o.wants.map((w, k) => `<span class="want ${have[k] ? 'have' : ''}">${art(w, 'want-art')}${have[k] ? `<i>${UI.check}</i>` : ''}</span>`).join('');
        const label = `${WHO_NAME[o.who]} wants ${o.wants.map((w) => itemOf(w)!.name).join(' and ')}. Pays ${o.reward} biscuits.${ready ? ' Ready: tap to hand it over.' : ''}`;
        return `<button class="order ${ready ? 'ready' : ''}" data-i="${i}" aria-label="${label}">
          <span class="who">${face(o.who, kit.micahImg('who-face'))}</span>
          <span class="wants">${wants}</span>
          <span class="pay">${ready ? '<b>Give</b>' : ''}${o.reward}${biscuit()}</span>
        </button>`;
      })
      .join('');
    ordersEl.querySelectorAll<HTMLButtonElement>('.order').forEach((b) => b.addEventListener('click', () => giveOrder(Number(b.dataset.i), b)));
  }
  function renderInfo() {
    const p = selected >= 0 ? parse(craft.cells[selected]) : { kind: 'empty' as const };
    if (p.kind === 'maker') {
      infoEl.innerHTML = `<b>${p.chain!.maker.name}</b><span>Tap it for a ${p.chain!.items[0].name.toLowerCase()}.</span>`;
    } else if (p.kind === 'item') {
      const c = p.chain!;
      const it = c.items[p.tier! - 1];
      const next = c.items[p.tier!];
      const nextName = next ? (craft.found.includes(`${c.id}:${p.tier! + 1}`) ? next.name : '???') : '';
      const dots = c.items.map((_, k) => `<i class="${k < p.tier! ? 'on' : ''}"></i>`).join('');
      infoEl.innerHTML = `<b>${it.name}${p.boxed ? ' (boxed)' : ''}</b><span class="dots" aria-hidden="true">${dots}</span><span>${
        p.boxed ? 'Drop a match on it to open.' : next ? `Two make ${p.tier! + 1 === c.items.length ? `the Yard’s ${nextName}` : nextName}.` : ''
      }</span>`;
    } else {
      infoEl.innerHTML = '<b>Drag two alike together</b><span>Tap a box of toys or seeds to start.</span>';
    }
  }
  const renderAll = () => (renderBoard(), renderOrders(), renderInfo());

  // ── actions ──
  function select(i: number) {
    selected = i;
    markSame();
    renderInfo();
  }
  const ciAt = (i: number) => boardEl.querySelector<HTMLElement>(`.ci[data-i="${i}"]`);
  const cellAt = (i: number) => boardEl.querySelector<HTMLElement>(`.cc[data-i="${i}"]`);

  function tapMaker(i: number) {
    const made = spawn(craft, i);
    const makerEl = ciAt(i);
    if (!made) {
      sfx.bad();
      haptic.bad();
      makerEl?.classList.remove('nope');
      void makerEl?.offsetWidth;
      makerEl?.classList.add('nope');
      kit.toast('No room! Feed Micah something.');
      return;
    }
    sfx.pop(1);
    haptic.pop();
    selected = i;
    renderBoard();
    renderOrders();
    renderInfo();
    const el = ciAt(made.at);
    if (el) {
      const dx = (i % COLS) - (made.at % COLS);
      const dy = Math.floor(i / COLS) - Math.floor(made.at / COLS);
      el.style.setProperty('--fx', `${dx * 100}%`);
      el.style.setProperty('--fy', `${dy * 100}%`);
      el.classList.add('spawn');
    }
    ciAt(i)?.classList.add('squish');
    kit.persist();
  }

  function finish(chain: Chain) {
    const d = DECOR.find((x) => x.id === chain.decor)!;
    const top = chain.items[chain.items.length - 1];
    sfx.win();
    confettiRain(40);
    if (save.decor.includes(d.id)) {
      pay(REBUILD_REWARD);
      kit.toast(`${biscuit()} ${top.name} sold! +${REBUILD_REWARD}`);
      return;
    }
    save.decor.push(d.id);
    kit.persist();
    const area = AREAS.find((a) => a.id === d.area)!;
    const open = areaOpen(area, save.stars);
    const m = kit.modal(`
      <div class="craft-built">
        <p class="eyebrow">Crafted for the Yard</p>
        <h2>${top.name}</h2>
        ${svg(top.svg, 'craft-built-art')}
        <p class="body">${open ? d.desc : `It waits for the ${area.name} (level ${area.opensAt}).`}</p>
        ${open ? '<button class="btn" data-act="yard">See it in the Yard</button>' : ''}
        <button class="btn secondary" data-act="stay">Keep crafting</button>
      </div>`, () => {});
    m.querySelector('[data-act="yard"]')?.addEventListener('click', () => (m.remove(), kit.toYard(d.area)));
    m.querySelector('[data-act="stay"]')!.addEventListener('click', () => m.remove());
  }

  function dropOn(from: number, to: number) {
    const res = drop(craft, from, to);
    if (res.kind === 'none') {
      sfx.bad();
      select(from);
      return;
    }
    if (res.kind === 'merge') {
      selected = res.finished ? -1 : to;
      renderAll();
      const el = ciAt(to);
      el?.classList.add('merged');
      cellAt(to)?.classList.add('burst');
      sfx.combo(Math.min(5, parse(res.code).tier!));
      haptic.power();
      if (res.fresh) {
        const n = findReward(res.code);
        pay(n);
        floatLabel(cellAt(to), `New! +${n}`);
      }
      if (res.unboxed) sfx.snip();
      if (res.finished) finish(res.finished);
    } else {
      selected = to;
      renderAll();
      sfx.swap();
    }
    kit.persist();
    kit.tags();
  }

  function eat(i: number) {
    const it = feedMicah(craft, i);
    if (!it) {
      sfx.bad();
      return;
    }
    selected = -1;
    renderAll();
    sfx.crunch();
    haptic.pop();
    micahEl.classList.remove('chomp');
    void micahEl.offsetWidth;
    micahEl.classList.add('chomp');
    kit.toast(eatLine(it));
    kit.persist();
  }

  function giveOrder(i: number, btn: HTMLElement) {
    const o = craft.orders[i];
    if (!o) return;
    if (!orderReady(craft, o)) {
      btn.classList.remove('nope');
      void btn.offsetWidth;
      btn.classList.add('nope');
      kit.toast(`${WHO_NAME[o.who]} is waiting for these.`);
      return;
    }
    const earned = fillOrder(craft, i);
    topUpOrders(craft, save.stars);
    selected = -1;
    renderAll();
    pay(earned);
    sfx.coin();
    floatLabel(ordersEl.children[i] ?? ordersEl, `+${earned}`);
    ordersEl.children[i]?.classList.add('fresh');
    kit.persist();
    kit.tags();
  }

  // ── dragging ──
  let drag: { from: number; x: number; y: number; ghost?: HTMLElement; id: number } | null = null;
  const targetAt = (x: number, y: number): number | 'micah' | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    if (el.closest('.craft-micah')) return 'micah';
    const cc = el.closest<HTMLElement>('.cc');
    return cc && boardEl.contains(cc) ? Number(cc.dataset.i) : null;
  };
  boardEl.addEventListener('pointerdown', (e) => {
    const cc = (e.target as HTMLElement).closest<HTMLElement>('.cc');
    if (!cc || drag) return;
    const i = Number(cc.dataset.i);
    const p = parse(craft.cells[i]);
    if (p.kind === 'empty' || p.boxed) {
      select(p.boxed ? i : -1);
      return;
    }
    drag = { from: i, x: e.clientX, y: e.clientY, id: e.pointerId };
    e.preventDefault();
  });
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
      const src = ciAt(drag.from);
      if (!src) return;
      const r = src.getBoundingClientRect();
      const g = src.cloneNode(true) as HTMLElement;
      g.className = 'ci craft-ghost';
      g.style.width = `${r.width}px`;
      g.style.height = `${r.height}px`;
      document.body.append(g);
      drag.ghost = g;
      src.classList.add('lifted');
      selected = drag.from;
      markSame();
      renderInfo();
      micahEl.classList.toggle('hungry', parse(craft.cells[drag.from]).kind === 'item');
    }
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
    const t = targetAt(e.clientX, e.clientY);
    boardEl.querySelectorAll('.cc.over').forEach((el) => el.classList.remove('over'));
    if (typeof t === 'number') cellAt(t)?.classList.add('over');
    micahEl.classList.toggle('over', t === 'micah');
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    micahEl.classList.remove('hungry', 'over');
    if (!d.ghost) {
      // A tap: makers make things, anything else is selected.
      if (parse(craft.cells[d.from]).kind === 'maker') tapMaker(d.from);
      else {
        select(d.from);
        sfx.select();
        ciAt(d.from)?.classList.add('wiggle');
      }
      return;
    }
    d.ghost.remove();
    ciAt(d.from)?.classList.remove('lifted');
    boardEl.querySelectorAll('.cc.over').forEach((el) => el.classList.remove('over'));
    const t = e.type === 'pointercancel' ? null : targetAt(e.clientX, e.clientY);
    if (t === 'micah') eat(d.from);
    else if (t === null || t === d.from) select(d.from);
    else dropOn(d.from, t);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // Keyboard: arrow keys move a cursor, Enter taps or picks up and puts down, M feeds Micah.
  let held = -1;
  boardEl.tabIndex = 0;
  boardEl.addEventListener('keydown', (e) => {
    const cur = selected < 0 ? 0 : selected;
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -COLS, ArrowDown: COLS };
    if (moves[e.key] !== undefined) {
      e.preventDefault();
      const n = cur + moves[e.key];
      if (n >= 0 && n < CELLS) select(n);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (held >= 0) {
        const from = held;
        held = -1;
        if (from !== cur) dropOn(from, cur);
        return;
      }
      const p = parse(craft.cells[cur]);
      if (p.kind === 'maker') tapMaker(cur);
      else if (p.kind === 'item' && !p.boxed) {
        held = cur;
        kit.toast(`Picked up. Move and press Enter.`);
      }
    }
    if (e.key === 'm' && selected >= 0) eat(selected);
  });

  screen.querySelector('[data-act="back"]')!.addEventListener('click', () => kit.back());
  screen.querySelector('[data-act="book"]')!.addEventListener('click', () => showBook(kit, craft));
  micahEl.addEventListener('click', () => {
    if (selected >= 0 && parse(craft.cells[selected]).kind === 'item' && !parse(craft.cells[selected]).boxed) eat(selected);
    else kit.toast('Drag something to Micah. She eats anything.');
  });

  kit.mount(screen, () => {
    ro.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    drag?.ghost?.remove();
  });
  fit();
  renderAll();
  if (placed.length) {
    window.setTimeout(() => kit.toast(`New maker: ${placed.map((c) => c.maker.name).join(', ')}!`), 400);
    placed.forEach((c) => ciAt(craft.cells.indexOf(`m:${c.id}`))?.classList.add('merged'));
  } else if (waiting.length) window.setTimeout(() => kit.toast(`Make room for the ${waiting[0].maker.name}.`), 400);
}

/** Every chain with what has been found so far; the rest are dark shapes to discover. */
function showBook(kit: WorkshopKit, craft: CraftSave): void {
  const save = kit.save();
  const total = CHAINS.reduce((n, c) => n + c.items.length, 0);
  const m = kit.modal(`
    <div class="modal-head">
      <span class="book-icon">${BOOK}</span>
      <div><p class="eyebrow">${craft.found.length} of ${total} found</p><h2>Craft Book</h2></div>
      <button class="close" aria-label="Close">${UI.close}</button>
    </div>
    ${CHAINS.map((c) => {
      const open = !c.opensAt || (save.stars[c.opensAt] ?? 0) > 0;
      return `<section class="book-chain ${open ? '' : 'locked'}">
        <h3>${svg(c.maker.svg, 'book-maker')}<span>${c.name}</span>${open ? '' : `<small>Level ${c.opensAt}</small>`}</h3>
        <ol>${c.items.map((it, k) => {
          const got = craft.found.includes(`${c.id}:${k + 1}`);
          return `<li class="${got ? 'got' : ''}" aria-label="${got ? it.name : 'Not found yet'}">${svg(it.svg, 'book-art')}<span>${got ? it.name : '?'}</span></li>`;
        }).join('')}</ol>
      </section>`;
    }).join('')}`, () => {});
  m.querySelector('.modal')!.classList.add('book-modal');
  m.querySelector('.close')!.addEventListener('click', () => m.remove());
}
