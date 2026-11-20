// Tap feedback: every button squashes down while pressed and springs back on release.
// Uses the CSS `scale` property so it stacks on top of any existing transform.

const TAPPABLE = 'button, label, .tappable';
let held: HTMLElement | null = null;

/** Restart a one-shot animation class on an element. */
export function replay(el: Element | null | undefined, cls: string): void {
  if (!el) return;
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', function done(e) {
    if (e.target !== el) return;
    el.classList.remove(cls);
    el.removeEventListener('animationend', done);
  });
}

/** Press-in, used for buttons and for board pieces. */
export function pressDown(el: Element | null | undefined): void {
  if (!el) return;
  el.classList.remove('tap-up');
  el.classList.add('tap-down');
}

/** Spring back out after a press. */
export function pressUp(el: Element | null | undefined): void {
  if (!el || !el.classList.contains('tap-down')) return;
  el.classList.remove('tap-down');
  replay(el, 'tap-up');
}

/** A celebratory pop, e.g. on a purchase. */
export const pop = (el: Element | null | undefined) => replay(el, 'tap-pop');

/** A small "nope" shake, e.g. on a button you can't afford. */
export const nope = (el: Element | null | undefined) => replay(el, 'tap-nope');

/** Floats a short label ("+1") up from an element. */
export function floatLabel(from: Element | null | undefined, text: string): void {
  if (!from) return;
  const r = from.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'tap-float';
  f.textContent = text;
  f.style.left = `${r.left + r.width / 2}px`;
  f.style.top = `${r.top}px`;
  document.body.append(f);
  f.addEventListener('animationend', () => f.remove());
  setTimeout(() => f.remove(), 1500);
}

export function installTapFx(): void {
  const release = () => {
    pressUp(held);
    held = null;
  };
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button > 0) return;
      const el = (e.target as Element).closest<HTMLElement>(TAPPABLE);
      if (!el) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') {
        nope(el);
        return;
      }
      release();
      held = el;
      pressDown(el);
    },
    { capture: true, passive: true },
  );
  document.addEventListener('pointerup', release, { capture: true, passive: true });
  document.addEventListener('pointercancel', release, { capture: true, passive: true });
  // Keyboard presses (Enter / Space) get the spring too.
  document.addEventListener(
    'click',
    (e) => {
      if (e.detail !== 0) return;
      const el = (e.target as Element).closest<HTMLElement>(TAPPABLE);
      if (el) replay(el, 'tap-up');
    },
    { capture: true },
  );
}
