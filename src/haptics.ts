// Phone vibration for matches and power-ups. Android browsers support it; iPhones ignore it.

let on = true;

export const canVibrate = (): boolean => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export function setHaptics(enabled: boolean): void {
  on = enabled;
}

function buzz(pattern: number | number[]): void {
  if (!on || !canVibrate()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some browsers throw before the first tap */
  }
}

export const haptic = {
  /** A match clearing; bigger chains buzz a little longer. */
  pop: (chain = 1) => buzz(Math.min(10 + chain * 6, 40)),
  /** A power-up being made. */
  power: () => buzz([18, 40, 28]),
  /** A power-up going off. */
  blast: () => buzz(45),
  /** A swap that doesn't make a match. */
  bad: () => buzz([12, 50, 12]),
  win: () => buzz([30, 60, 30, 60, 80]),
  /** A light tick for catching things in the yard. */
  tick: () => buzz(12),
};
