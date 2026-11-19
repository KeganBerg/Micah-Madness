// Tiny synthesized sound effects (no audio files needed).

let ctx: AudioContext | null = null;
let enabled = true;

export function setSound(on: boolean): void {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, slideTo?: number): void {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

/** A short burst of filtered noise: crunches, splashes, whooshes. */
function noise(dur: number, gain = 0.12, filter: BiquadFilterType = 'bandpass', freq = 1200, sweepTo?: number): void {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, a.currentTime);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, a.currentTime + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

const later = (ms: number, fn: () => void) => setTimeout(fn, ms);

export const sfx = {
  /** Any menu button. */
  tap() {
    tone(660, 0.05, 'sine', 0.05, 520);
  },
  /** Picking up a piece. */
  select() {
    tone(520, 0.06, 'triangle', 0.06, 700);
  },
  /** A new power-up piece appears. */
  powerUp() {
    [784, 988, 1318].forEach((f, i) => later(i * 55, () => tone(f, 0.12, 'triangle', 0.07)));
  },
  /** Mud washed off a square. */
  splash() {
    noise(0.22, 0.09, 'bandpass', 1800, 500);
  },
  /** One of the level's goals is complete. */
  goal() {
    tone(1046, 0.12, 'triangle', 0.09);
    later(100, () => tone(1568, 0.22, 'triangle', 0.09));
  },
  /** Spending or receiving biscuits. */
  coin() {
    tone(988, 0.07, 'square', 0.05);
    later(70, () => tone(1318, 0.16, 'square', 0.05));
  },
  /** Building something in the yard. */
  build() {
    noise(0.06, 0.12, 'lowpass', 900);
    later(120, () => noise(0.06, 0.12, 'lowpass', 900));
    later(260, () => [523, 659, 784].forEach((f, i) => later(i * 70, () => tone(f, 0.18, 'triangle', 0.08))));
  },
  /** Each star landing on the win screen. */
  star(n: number) {
    tone(784 * Math.pow(1.26, n), 0.25, 'triangle', 0.09);
  },
  /** Moves are running low. */
  warn() {
    tone(440, 0.08, 'square', 0.04);
    later(110, () => tone(440, 0.08, 'square', 0.04));
  },
  /** Micah eating a treat. */
  crunch() {
    [0, 90, 180].forEach((ms) => later(ms, () => noise(0.07, 0.14, 'highpass', 2500)));
  },
  /** The squirrel shuffle. */
  squirrel() {
    [0, 80, 160, 240].forEach((ms, i) => later(ms, () => tone(1400 + i * 120, 0.05, 'square', 0.04, 1800)));
    later(120, () => noise(0.35, 0.06, 'bandpass', 600, 2400));
  },
  /** Extra moves from the Long Leash. */
  whoosh() {
    noise(0.3, 0.08, 'bandpass', 400, 3000);
  },
  /** A level begins. */
  start() {
    [392, 523, 659].forEach((f, i) => later(i * 90, () => tone(f, 0.14, 'triangle', 0.07)));
  },
  /** Yarn snipped loose. */
  snip() {
    noise(0.05, 0.1, 'highpass', 4000);
    later(60, () => tone(1200, 0.08, 'triangle', 0.05, 1600));
  },
  /** Micah's paws on the map path. */
  step() {
    noise(0.04, 0.06, 'lowpass', 500);
  },

  pop(chain: number) {
    tone(440 * Math.pow(1.12, Math.min(chain, 10)), 0.12, 'triangle');
  },
  swap() {
    tone(300, 0.06, 'sine', 0.06);
  },
  bad() {
    tone(200, 0.15, 'square', 0.05, 140);
  },
  bark() {
    tone(320, 0.09, 'sawtooth', 0.1, 160);
    setTimeout(() => tone(300, 0.1, 'sawtooth', 0.1, 150), 110);
  },
  zoom() {
    tone(500, 0.25, 'triangle', 0.08, 1400);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.1), i * 120));
  },
  lose() {
    [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'triangle', 0.08), i * 160));
  },
};
