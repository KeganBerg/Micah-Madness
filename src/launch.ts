// Launch screen: shown every time the game opens or reloads, while fonts and art load.
import { micahUrl } from './art';

const STEPS = ['Fetching the toys…', 'Fluffing Micah’s bed…', 'Hiding the squirrels…', 'Polishing the lobster suit…', 'Ready!'];

export function launchMarkup(): string {
  return `
  <div class="launch" role="status" aria-live="polite">
    <div class="launch-center">
      <div class="launch-stage">
        <span class="launch-shadow"></span>
        <img class="launch-micah" src="${micahUrl}" alt="Micah in her lobster costume" draggable="false">
      </div>
      <h1 class="launch-title"><span>Micah</span><span>Madness</span></h1>
      <p class="launch-tag">A match-3 puzzle for dog lovers</p>
    </div>
    <div class="launch-foot">
      <div class="launch-bar" aria-hidden="true"><i></i></div>
      <p class="launch-step">${STEPS[0]}</p>
    </div>
  </div>`;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function decode(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
    img.decode?.().then(resolve, resolve);
  });
}

/** Show the launch screen in `root`, wait for real loading plus a short minimum, then fade it out. */
export async function runLaunch(root: HTMLElement, minMs = 1800): Promise<void> {
  if (!root.querySelector('.launch')) root.innerHTML = launchMarkup();
  const el = root.querySelector<HTMLElement>('.launch')!;
  const bar = el.querySelector<HTMLElement>('.launch-bar i')!;
  const step = el.querySelector<HTMLElement>('.launch-step')!;
  const start = performance.now();
  let shown = 0;
  const advance = (i: number) => {
    shown = Math.max(shown, i);
    bar.style.width = `${Math.round((shown / (STEPS.length - 1)) * 100)}%`;
    step.textContent = STEPS[shown];
  };
  advance(0);

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  const tasks: Promise<unknown>[] = [
    decode(micahUrl),
    Promise.race([fonts?.ready ?? Promise.resolve(), wait(2500)]), // never hang on a slow font host
  ];
  // Step the bar along at a steady pace while the real work finishes.
  const pace = (minMs - 300) / (STEPS.length - 1);
  for (let i = 1; i < STEPS.length - 1; i++) setTimeout(() => advance(i), pace * i);
  await Promise.all(tasks);
  const elapsed = performance.now() - start;
  if (elapsed < minMs - 300) await wait(minMs - 300 - elapsed);
  advance(STEPS.length - 1);
  await wait(300);
  el.classList.add('done');
  await wait(380);
}
