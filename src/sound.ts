// All of the game's audio, synthesized with Web Audio (no audio files, nothing copyrighted).
// Sound effects and background music have their own on/off switches and their own volume bus.

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxOn = true;
let musicOn = true;

const SFX_VOL = 0.9;
const MUSIC_VOL = 0.45;

/** Create the audio graph. Only safe to call once the player has tapped (browser autoplay rules). */
function graph(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  comp.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = sfxOn ? SFX_VOL : 0;
  sfxBus.connect(comp);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(comp);
  return ctx;
}

// iPhones play Web Audio through the ringer channel, so the silent switch mutes the game.
// Asking for the "playback" session (Safari 17+) makes it behave like a music app instead.
function preferPlayback(): void {
  try {
    const nav = navigator as unknown as { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = 'playback';
  } catch {
    /* not supported */
  }
}

let unlocked = false;
let gestured = false;
/** Set when iOS may have quietly broken the context (app backgrounded, call, audio route change). */
let stale = false;
let lastRebuild = -Infinity;

// iOS before 17 has no audioSession: a looping silent <audio> element started in a tap
// moves the page onto the media channel so the silent switch doesn't mute Web Audio.
let silentEl: HTMLAudioElement | null = null;
function silentWav(): string {
  const n = 800; // 0.1 s of silence at 8 kHz, 8-bit mono
  const b = new Uint8Array(44 + n);
  const v = new DataView(b.buffer);
  const w = (o: number, t: string) => [...t].forEach((c, i) => (b[o + i] = c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true);
  v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  b.fill(128, 44);
  let bin = '';
  b.forEach((x) => (bin += String.fromCharCode(x)));
  return 'data:audio/wav;base64,' + btoa(bin);
}
function mediaChannelFallback(): void {
  if ((navigator as unknown as { audioSession?: unknown }).audioSession) return;
  if (!IOS) return;
  try {
    if (!silentEl) {
      silentEl = document.createElement('audio');
      silentEl.setAttribute('playsinline', '');
      silentEl.setAttribute('x-webkit-airplay', 'deny');
      silentEl.loop = true;
      silentEl.preload = 'auto';
      silentEl.src = silentWav();
    }
    if (silentEl.paused) void silentEl.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Throw away a context iOS may have broken and build a fresh one (inside a tap, so it can start). */
function rebuild(): void {
  stopScheduler();
  const old = ctx;
  ctx = null;
  sfxBus = null;
  musicBus = null;
  delay = null;
  mix = null;
  playing = null;
  unlocked = false;
  stale = false;
  noiseBuf = null;
  clockAt = -1;
  if (old) void old.close().catch(() => {});
}

/** Runs on taps until audio is running: create/resume the context and play a silent blip. */
function unlock(inGesture = false): void {
  if (!gestured || (!sfxOn && !musicOn)) return;
  preferPlayback();
  if (inGesture) {
    mediaChannelFallback();
    // At most one rebuild every few seconds, so a device whose clock really is stuck doesn't
    // restart the music on every tap.
    if (stale && !document.hidden && performance.now() - lastRebuild > 4000) {
      lastRebuild = performance.now();
      rebuild();
    }
  }
  const fresh = !ctx;
  const a = graph();
  if (!a) return;
  if (fresh) {
    a.addEventListener('statechange', () => {
      if (a !== ctx) return;
      if (a.state === 'running') onRunning();
      else if ((a.state as string) === 'interrupted') stale = true;
    });
  }
  if (a.state !== 'running') void a.resume().then(onRunning, () => {});
  else onRunning();
  if (!unlocked) {
    // A silent buffer started inside the gesture is what finally wakes older iOS Safari.
    const src = a.createBufferSource();
    src.buffer = a.createBuffer(1, 1, 22050);
    src.connect(a.destination);
    src.start(0);
  }
}
function onRunning(): void {
  flushPending();
  if (unlocked) return;
  unlocked = true;
  if (musicOn && wantMood) startMusic(wantMood);
}

const TOUCH = typeof document !== 'undefined' && 'ontouchend' in document;
/** iPhone, iPod, or an iPad (which reports itself as a Mac but has touch). */
const IOS = typeof navigator !== 'undefined' && TOUCH && /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent);

// A context that says "running" but whose clock has stopped makes no sound. iOS does this after
// calls, Siri, headphone changes and the lock screen. A watchdog notices and the next tap rebuilds it.
let clockAt = -1;
function watchClock(): void {
  const a = ctx;
  if (!a || a.state !== 'running' || document.hidden) {
    clockAt = -1;
    return;
  }
  if (clockAt >= 0 && a.currentTime === clockAt) stale = true;
  clockAt = a.currentTime;
}

if (typeof window !== 'undefined') {
  // Every kind of tap counts: iOS only lets audio start on touchend/click, and dragging a piece
  // on the board never produces a click, so touchend is what wakes audio during a level.
  for (const ev of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown'] as const) {
    window.addEventListener(ev, () => {
      gestured = true;
      if (!ctx || ctx.state !== 'running' || stale) {
        unlocked = false;
        unlock(true);
      }
    }, { capture: true, passive: true });
  }
  // Pause the music when the app is hidden. iOS can leave the context "running" but silent after
  // that, so on iPhone/iPad the next tap rebuilds it from scratch. Android and desktop resume fine.
  const away = () => {
    clockAt = -1;
    if (!ctx) return;
    if (IOS) stale = true;
    stopScheduler();
    void ctx.suspend().catch(() => {});
  };
  const back = () => {
    if (document.hidden || !ctx || stale) return;
    // Coming back doesn't need a tap on Android/desktop. On iOS the first tap rebuilds instead.
    void ctx.resume().then(() => {
      if (musicOn && wantMood) startMusic(wantMood);
    }, () => {});
  };
  document.addEventListener('visibilitychange', () => (document.hidden ? away() : back()));
  window.addEventListener('pagehide', away);
  window.addEventListener('pageshow', back);
  window.setInterval(watchClock, 1500);
}

// Effects asked for while audio is still waking up wait a moment instead of being dropped.
const pending: { run: () => void; at: number }[] = [];
function flushPending(): void {
  const now = performance.now();
  const due = pending.splice(0);
  for (const p of due) if (now - p.at < 900) p.run();
}
function whenLive(run: () => void): void {
  if (!sfxOn) return;
  if (ctx && ctx.state === 'running') return run();
  if (!gestured) return;
  pending.push({ run, at: performance.now() });
  if (pending.length > 24) pending.shift();
  unlock();
}

export function setSound(on: boolean): void {
  sfxOn = on;
  if (on) unlock();
  if (ctx && sfxBus) sfxBus.gain.setTargetAtTime(on ? SFX_VOL : 0, ctx.currentTime, 0.02);
}

export function setMusic(on: boolean): void {
  musicOn = on;
  if (on) {
    unlock();
    if (wantMood) startMusic(wantMood);
  } else stopMusic();
}

/** The context, only when it is running and effects are on. */
function live(): AudioContext | null {
  if (!sfxOn || !ctx || ctx.state !== 'running' || !sfxBus) return null;
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, slideTo?: number): void {
  const a = live();
  if (!a) return;
  const t = a.currentTime + 0.005;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  // A hair of random pitch and level, like a real instrument never hitting the same note twice.
  const wobble = 1 + (Math.random() - 0.5) * 0.02;
  osc.frequency.setValueAtTime(freq * wobble, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo * wobble, t + dur);
  gain *= 0.9 + Math.random() * 0.2;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g).connect(sfxBus!);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

let noiseBuf: AudioBuffer | null = null;
function noiseBuffer(a: AudioContext): AudioBuffer {
  if (noiseBuf && noiseBuf.sampleRate === a.sampleRate) return noiseBuf;
  const len = a.sampleRate; // one second, looped
  noiseBuf = a.createBuffer(1, len, a.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

/** A short burst of filtered noise: crunches, splashes, whooshes. */
function noise(dur: number, gain = 0.12, filter: BiquadFilterType = 'bandpass', freq = 1200, sweepTo?: number): void {
  const a = live();
  if (!a) return;
  const t = a.currentTime + 0.005;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(sfxBus!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

const later = (ms: number, fn: () => void) => setTimeout(fn, ms);

/** A little "woof": a pitched sawtooth through a vowel-ish filter with a breathy edge. */
function woof(pitch: number, gain = 0.16): void {
  const a = live();
  if (!a) return;
  const t = a.currentTime + 0.005;
  const osc = a.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(pitch * 0.8, t);
  osc.frequency.linearRampToValueAtTime(pitch * 1.25, t + 0.03);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, t + 0.16);
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 2.5;
  f.frequency.setValueAtTime(700, t);
  f.frequency.exponentialRampToValueAtTime(450, t + 0.16);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  osc.connect(f).connect(g).connect(sfxBus!);
  osc.start(t);
  osc.stop(t + 0.2);
  noise(0.07, gain * 0.35, 'bandpass', 1500);
}

const effects = {
  /** Any menu button. */
  tap() {
    tone(660, 0.05, 'sine', 0.07, 520);
  },
  /** Picking up a piece. */
  select() {
    tone(520, 0.06, 'triangle', 0.08, 700);
  },
  /** A new power-up piece appears. */
  powerUp() {
    [784, 988, 1318].forEach((f, i) => later(i * 55, () => tone(f, 0.14, 'triangle', 0.09)));
  },
  /** Mud washed off a square. */
  splash() {
    noise(0.22, 0.11, 'bandpass', 1800, 500);
  },
  /** One of the level's goals is complete. */
  goal() {
    tone(1046, 0.12, 'triangle', 0.1);
    later(100, () => tone(1568, 0.24, 'triangle', 0.1));
  },
  /** Spending or receiving biscuits. */
  coin() {
    tone(988, 0.07, 'square', 0.05);
    later(70, () => tone(1318, 0.18, 'square', 0.05));
  },
  /** Building something in the yard. */
  build() {
    noise(0.06, 0.14, 'lowpass', 900);
    later(120, () => noise(0.06, 0.14, 'lowpass', 900));
    later(260, () => [523, 659, 784].forEach((f, i) => later(i * 70, () => tone(f, 0.18, 'triangle', 0.09))));
  },
  /** Each star landing on the win screen. */
  star(n: number) {
    tone(784 * Math.pow(1.26, n), 0.28, 'triangle', 0.11);
    later(40, () => tone(784 * Math.pow(1.26, n) * 2, 0.2, 'sine', 0.04));
  },
  /** Moves are running low. */
  warn() {
    tone(440, 0.08, 'square', 0.05);
    later(110, () => tone(440, 0.08, 'square', 0.05));
  },
  /** Micah eating a treat. */
  crunch() {
    [0, 90, 180].forEach((ms) => later(ms, () => noise(0.07, 0.16, 'highpass', 2500)));
  },
  /** The squirrel shuffle. */
  squirrel() {
    [0, 80, 160, 240].forEach((ms, i) => later(ms, () => tone(1400 + i * 120, 0.05, 'square', 0.05, 1800)));
    later(120, () => noise(0.35, 0.08, 'bandpass', 600, 2400));
  },
  /** The owl over Noah's Ark garage: a soft "hoo-hoo". */
  hoot() {
    tone(440, 0.22, 'sine', 0.08, 392);
    later(300, () => tone(415, 0.34, 'sine', 0.08, 349));
  },
  /** Extra moves from the Long Leash. */
  whoosh() {
    noise(0.3, 0.1, 'bandpass', 400, 3000);
  },
  /** A level begins. */
  start() {
    [392, 523, 659].forEach((f, i) => later(i * 90, () => tone(f, 0.16, 'triangle', 0.09)));
  },
  /** Yarn snipped loose. */
  snip() {
    noise(0.05, 0.12, 'highpass', 4000);
    later(60, () => tone(1200, 0.08, 'triangle', 0.06, 1600));
  },
  /** Soap bubbles popping: quick little blips that rise. */
  bubble() {
    [0, 45, 95].forEach((ms, i) => later(ms, () => tone(700 + i * 260, 0.05, 'sine', 0.05, 1100 + i * 300)));
  },
  /** Leaves raked up: a dry crunchy rustle. */
  rustle() {
    [0, 50, 110].forEach((ms) => later(ms, () => noise(0.06, 0.07, 'bandpass', 2200, 5000)));
  },
  /** Micah's paws on the map path. */
  step() {
    noise(0.04, 0.08, 'lowpass', 500);
  },

  /** A match clears; higher and brighter as the cascade grows. */
  pop(chain: number) {
    const f = 440 * Math.pow(1.12, Math.min(chain, 10));
    tone(f, 0.12, 'triangle', 0.12);
    noise(0.05, 0.05, 'bandpass', 2200 + chain * 200);
    if (chain >= 3) later(50, () => tone(f * 1.5, 0.1, 'sine', 0.05));
  },
  /** A combo callout: a quick rising run that climbs higher for bigger combos, with a happy woof at the top. */
  combo(tier: number) {
    const steps = [523, 659, 784, 1046, 1318, 1568, 2093];
    const n = Math.min(steps.length, 2 + tier);
    const lift = Math.max(0, Math.min(tier, 3) - 1); // bigger combos start higher up the run
    const note = (i: number) => steps[Math.min(steps.length - 1, i + lift)];
    for (let i = 0; i < n; i++) later(i * 45, () => tone(note(i), 0.16, 'triangle', 0.08));
    later(n * 45, () => tone(note(n), 0.35, 'sine', 0.06));
    noise(0.25 + tier * 0.05, 0.035, 'highpass', 5000);
    if (tier >= 4) later(n * 45 + 60, () => woof(380, 0.13));
  },
  /** A party popper, for a level win and big moments. */
  popper() {
    noise(0.09, 0.16, 'highpass', 1800);
    later(30, () => noise(0.5, 0.05, 'highpass', 6000, 9000));
  },
  swap() {
    tone(300, 0.07, 'sine', 0.08, 380);
  },
  bad() {
    tone(200, 0.15, 'square', 0.06, 140);
  },
  bark() {
    woof(330);
    later(130, () => woof(300));
  },
  zoom() {
    tone(500, 0.25, 'triangle', 0.1, 1400);
    noise(0.25, 0.06, 'bandpass', 800, 4000);
  },
  win() {
    duck(3.2);
    [523, 659, 784, 1046].forEach((f, i) => later(i * 120, () => tone(f, 0.22, 'triangle', 0.12)));
    later(520, () => [1046, 1318].forEach((f) => tone(f, 0.5, 'sine', 0.05)));
  },
  lose() {
    duck(2.5);
    [392, 330, 262].forEach((f, i) => later(i * 160, () => tone(f, 0.28, 'triangle', 0.1)));
  },
};

type Effects = typeof effects;
/** Sound must never break the game: any Web Audio error is logged and swallowed. */
function safely(run: () => void): void {
  try {
    run();
  } catch (err) {
    console.warn('sound failed', err);
  }
}
/** Every effect goes through whenLive, so nothing is lost while iOS is waking the audio up. */
export const sfx = Object.fromEntries(
  Object.entries(effects).map(([k, fn]) => [
    k,
    (...args: unknown[]) => safely(() => whenLive(() => safely(() => (fn as (...a: unknown[]) => void)(...args)))),
  ]),
) as Effects;

// ───────────────────────────── Music ─────────────────────────────
// Hand-written, original tunes played by a small synthesized "toy band": a music-box or toy-piano
// lead, a strummed ukulele-ish chord, a marimba counter-line, a round bass and soft percussion.
//
// Each tune is a 16-bar loop in two halves: A (8 bars: a 4-bar question, a 4-bar answer that
// lands home) and B (8 bars that move to the IV/vi chords for contrast and end on V to turn back).
// Melodies are written in C and moved to the tune's key. Strong beats sit on chord tones; passing
// notes fill the weak beats. The B half adds the marimba and claps so the loop builds and relaxes.

export type Mood = 'map' | 'level';

type Lead = 'musicbox' | 'toypiano' | 'ocarina';
interface Tune {
  name: string;
  bpm: number;
  /** Semitones from C. */
  key: number;
  /** Delay of each off-beat eighth, in sixteenths (0 = straight, ~0.6 = lazy triplet swing). */
  swing: number;
  lead: Lead;
  feel: 'stroll' | 'bounce';
  /** One entry per bar; two chords in a bar are split by a space. */
  chords: string[];
  /** One entry per bar: notes as name+octave:eighths, "r:n" for a rest. Each bar adds up to 8. */
  melody: string[];
}

/** Map: an easy-going swung stroll. */
const STROLL: Tune = {
  name: 'Stroll with Micah', bpm: 94, key: 5, swing: 0.6, lead: 'musicbox', feel: 'stroll',
  chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm G', 'C', 'F', 'G', 'Em', 'Am', 'F', 'G', 'Dm', 'G7'],
  melody: [
    'G4:1 C5:1 E5:2 G5:1 E5:1 D5:2', 'E5:2 C5:2 A4:4', 'A4:1 C5:1 F5:2 A5:1 G5:1 F5:2', 'D5:2 B4:2 G4:4',
    'G4:1 C5:1 E5:2 G5:2 E5:2', 'A5:2 G5:1 E5:1 C5:4', 'D5:2 F5:2 B4:2 D5:2', 'C5:4 r:2 G4:2',
    'A4:1 C5:1 F5:3 E5:1 F5:2', 'G5:2 F5:1 E5:1 D5:4', 'E5:1 G5:1 B5:3 A5:1 G5:2', 'A5:2 E5:2 C5:4',
    'F5:2 A5:2 C6:2 A5:2', 'G5:3 A5:1 B5:2 G5:2', 'F5:2 E5:1 D5:1 A4:2 C5:2', 'B4:2 D5:2 F5:2 D5:1 B4:1',
  ],
};

/** Levels: four bouncier themes, one per zone (zones 5-8 replay them a step higher and quicker). */
const FETCH: Tune = {
  name: 'Fetch!', bpm: 120, key: 7, swing: 0.12, lead: 'toypiano', feel: 'bounce',
  chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F G', 'C', 'Am', 'Em', 'F', 'C', 'Dm', 'G', 'Em Am', 'Dm G'],
  melody: [
    'C5:1 E5:1 G5:1 E5:1 C6:2 G5:2', 'B5:1 A5:1 G5:1 D5:1 G5:4', 'A5:1 G5:1 E5:1 C5:1 E5:2 A5:2', 'A5:1 G5:1 F5:1 E5:1 C5:4',
    'C5:1 E5:1 G5:1 E5:1 C6:2 D6:2', 'D6:1 C6:1 B5:1 A5:1 G5:4', 'C6:1 A5:1 F5:2 B5:1 G5:1 D5:2', 'C5:2 G5:1 E5:1 C5:2 r:2',
    'r:1 E5:1 A5:1 B5:1 C6:2 B5:1 A5:1', 'G5:2 E5:2 B4:4', 'r:1 F5:1 A5:1 B5:1 C6:2 A5:1 F5:1', 'G5:2 E5:2 C5:4',
    'D5:1 F5:1 A5:1 C6:1 D6:2 A5:2', 'B5:1 D6:1 G6:2 D6:1 B5:1 G5:2', 'G5:2 B5:2 A5:2 E5:2', 'F5:2 A5:1 F5:1 D5:2 B4:2',
  ],
};

const PUDDLES: Tune = {
  name: 'Puddle Hop', bpm: 112, key: 9, swing: 0.45, lead: 'ocarina', feel: 'bounce',
  chords: ['C', 'Bb', 'F', 'C', 'C', 'Bb', 'F', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'Dm', 'G7'],
  melody: [
    'E5:2 G5:1 A5:1 G5:2 E5:2', 'D5:2 F5:1 G5:1 F5:2 D5:2', 'C5:1 D5:1 F5:1 G5:1 A5:2 F5:2', 'E5:4 r:2 C5:1 D5:1',
    'E5:2 G5:1 A5:1 C6:2 A5:2', 'Bb5:2 A5:1 G5:1 F5:2 D5:2', 'F5:1 G5:1 A5:1 C6:1 A5:2 F5:2', 'G5:4 D5:2 B4:2',
    'A4:1 C5:1 E5:1 G5:1 A5:2 E5:2', 'F5:1 A5:1 C6:2 A5:2 F5:2', 'E5:1 G5:1 C6:2 G5:2 E5:2', 'D5:2 G5:2 B5:4',
    'C6:2 B5:1 A5:1 E5:2 A5:2', 'A5:2 G5:1 F5:1 C5:2 F5:2', 'D5:1 E5:1 F5:1 A5:1 D6:2 C6:2', 'B5:2 G5:2 F5:2 D5:2',
  ],
};

const RAINY: Tune = {
  name: 'Rainy Day Sniffs', bpm: 104, key: 2, swing: 0.5, lead: 'musicbox', feel: 'bounce',
  chords: ['Am', 'D', 'Am', 'D', 'F', 'G', 'Am', 'E', 'F', 'G', 'C', 'Am', 'F', 'G', 'E', 'E7'],
  melody: [
    'A4:1 C5:1 E5:2 A5:1 G5:1 E5:2', 'F#5:2 E5:1 D5:1 A4:4', 'C5:1 E5:1 A5:1 B5:1 C6:2 A5:2', 'F#5:1 G5:1 A5:2 F#5:4',
    'A5:2 G5:1 F5:1 C5:2 F5:2', 'G5:2 F5:1 E5:1 D5:2 B4:2', 'C5:1 E5:1 A5:2 E5:1 D5:1 C5:2', 'B4:2 G#4:2 E4:2 G#4:2',
    'C5:1 F5:1 A5:3 G5:1 F5:2', 'D5:1 G5:1 B5:3 A5:1 G5:2', 'E5:2 G5:2 C6:2 B5:1 C6:1', 'A5:4 E5:4',
    'F5:1 A5:1 C6:2 A5:1 F5:1 C5:2', 'D5:1 G5:1 B5:2 G5:1 D5:1 B4:2', 'G#5:2 B5:2 E5:2 G#5:2', 'B5:2 G#5:1 E5:1 B4:2 G#4:2',
  ],
};

const PARTY: Tune = {
  name: 'Birthday Zoomies', bpm: 128, key: 2, swing: 0.1, lead: 'toypiano', feel: 'bounce',
  chords: ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm G', 'C', 'F', 'Fm', 'C', 'A7', 'Dm', 'G7', 'C', 'G7'],
  melody: [
    'E5:1 F5:1 G5:2 C6:1 G5:1 E5:2', 'A5:1 G5:1 E5:2 C5:2 E5:2', 'F5:1 E5:1 D5:1 F5:1 A5:2 F5:2', 'G5:2 B5:2 D6:4',
    'E6:1 D6:1 C6:1 G5:1 E5:2 G5:2', 'A5:1 C6:1 E6:2 C6:1 B5:1 A5:2', 'F5:2 A5:2 G5:1 F5:1 D5:2', 'C5:2 E5:1 G5:1 C6:4',
    'A5:2 C6:1 A5:1 F5:4', 'Ab5:2 C6:1 Ab5:1 F5:4', 'G5:1 E5:1 C5:1 E5:1 G5:2 C6:2', 'C#6:2 A5:1 G5:1 E5:2 C#5:2',
    'F5:1 E5:1 D5:1 F5:1 A5:2 D6:2', 'B5:1 D6:1 B5:1 G5:1 F5:2 D5:2', 'E5:1 G5:1 C6:2 E6:1 D6:1 C6:2', 'B5:2 D6:2 G5:4',
  ],
};

const LEVEL_TUNES = [FETCH, PUDDLES, RAINY, PARTY];

/** Which tune a mood/zone plays (exported for tests). */
export function tuneFor(mood: Mood, zone = 0): Tune {
  if (mood === 'map') return STROLL;
  const z = ((zone % 8) + 8) % 8;
  const base = LEVEL_TUNES[z % 4];
  if (z < 4) return base;
  // The second lap of zones: same melody, a step higher, a touch quicker, a different lead.
  const leads: Lead[] = ['ocarina', 'musicbox', 'toypiano', 'ocarina'];
  return { ...base, key: base.key + 2, bpm: base.bpm + 6, lead: leads[z % 4] };
}

// ── Score: turn a tune into timed events on a 16th-note grid ──

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function noteToMidi(n: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
  if (!m) throw new Error(`bad note ${n}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const QUALITY: Record<string, number[]> = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11] };
export function chordTones(c: string): { root: number; tones: number[] } {
  const m = /^([A-G])(#|b)?(m7|maj7|m|7)?$/.exec(c);
  if (!m) throw new Error(`bad chord ${c}`);
  const root = PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return { root: (root + 12) % 12, tones: QUALITY[m[3] ?? ''] };
}

interface Hit { step: number; midi: number; len: number }
interface Score {
  bars: number;
  melody: Hit[];
  /** Chord per half bar: [root pitch class, intervals]. */
  harmony: { root: number; tones: number[] }[];
}

/** Lay a tune out on the grid. Throws if a bar doesn't add up, so a typo can't ship. */
export function score(t: Tune): Score {
  const melody: Hit[] = [];
  t.melody.forEach((bar, b) => {
    let pos = 0;
    for (const tok of bar.trim().split(/\s+/)) {
      const [n, d] = tok.split(':');
      const len = Number(d) * 2;
      if (n !== 'r') melody.push({ step: b * 16 + pos, midi: noteToMidi(n), len });
      pos += len;
    }
    if (pos !== 16) throw new Error(`${t.name} bar ${b + 1} has ${pos / 2} eighths`);
  });
  const harmony = t.chords.flatMap((bar) => {
    const cs = bar.split(' ').map(chordTones);
    return cs.length === 1 ? [cs[0], cs[0]] : cs;
  });
  if (harmony.length !== t.melody.length * 2) throw new Error(`${t.name} chords and melody differ in length`);
  return { bars: t.melody.length, melody, harmony };
}

/** Move into the tune's key, keeping the lead in a sweet, bright register. */
function shift(t: Tune): number {
  return t.key > 7 ? t.key - 12 : t.key;
}

// ── Playback ──

function midiToHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

let wantMood: Mood | null = null;
let wantZone = 0;
let playing: { mood: Mood; zone: number } | null = null;
let tune: Tune | null = null;
let sc: Score | null = null;
let byStep: Map<number, Hit[]> = new Map();
let step = 0;
let nextTime = 0;
let timer: number | undefined;
let delay: { input: GainNode; d: DelayNode } | null = null;

/** Choose which tune should be playing. It starts on the first tap if audio isn't unlocked yet. */
export function playMusic(mood: Mood, zone = 0): void {
  wantMood = mood;
  wantZone = zone;
  if (musicOn) startMusic(mood);
}

function startMusic(mood: Mood): void {
  const a = ctx;
  if (!a || a.state !== 'running' || !musicBus) return;
  const zone = mood === 'level' ? wantZone : 0;
  if (playing && playing.mood === mood && playing.zone === zone && timer !== undefined) {
    musicBus.gain.setTargetAtTime(MUSIC_VOL, a.currentTime, 0.3);
    return;
  }
  const fresh = !playing;
  playing = { mood, zone };
  musicBus.gain.cancelScheduledValues(a.currentTime);
  musicBus.gain.setTargetAtTime(0, a.currentTime, fresh ? 0.01 : 0.22);
  stopScheduler();
  const begin = () => {
    if (!playing || playing.mood !== mood || playing.zone !== zone || !musicOn || !ctx || ctx.state !== 'running') return;
    tune = tuneFor(mood, zone);
    sc = score(tune);
    byStep = new Map();
    for (const h of sc.melody) byStep.set(h.step, [...(byStep.get(h.step) ?? []), h]);
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    musicBus!.gain.cancelScheduledValues(ctx.currentTime);
    musicBus!.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, fresh ? 1.2 : 0.7);
    timer = window.setInterval(tick, 25);
    tick();
  };
  if (fresh) begin();
  else later(800, begin);
}

function stopScheduler(): void {
  if (timer !== undefined) window.clearInterval(timer);
  timer = undefined;
}

function stopMusic(): void {
  stopScheduler();
  playing = null;
  if (ctx && musicBus) {
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
  }
}

/** Dip the music under a fanfare, then bring it back. */
function duck(seconds: number): void {
  if (!ctx || !musicBus || !playing) return;
  const t = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setTargetAtTime(MUSIC_VOL * 0.2, t, 0.12);
  musicBus.gain.setTargetAtTime(MUSIC_VOL, t + seconds, 1.1);
}

/** A soft dotted-eighth echo that makes the lead sparkle. */
function echo(a: AudioContext, sixteenth: number): GainNode {
  if (delay) {
    delay.d.delayTime.value = sixteenth * 3;
    return delay.input;
  }
  const input = a.createGain();
  const d = a.createDelay(2);
  d.delayTime.value = sixteenth * 3;
  const fb = a.createGain();
  fb.gain.value = 0.3;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  const wet = a.createGain();
  wet.gain.value = 0.3;
  input.connect(d).connect(lp).connect(fb).connect(d);
  lp.connect(wet).connect(musicBus!);
  delay = { input, d };
  return input;
}

function tick(): void {
  const a = ctx;
  if (!a || !tune || !sc || a.state !== 'running') return;
  const sixteenth = 60 / tune.bpm / 4;
  if (nextTime < a.currentTime - 0.25) nextTime = a.currentTime + 0.05;
  // Look 0.3 s ahead so a busy phone (cascades, scenery) can miss a few timer ticks without gaps.
  while (nextTime < a.currentTime + 0.3) {
    // Swing pushes every off-beat eighth (and the 16th after it) later.
    const pos = step % 4;
    const swing = pos === 2 ? tune.swing * sixteenth : pos === 3 ? tune.swing * sixteenth * 0.5 : 0;
    // A player breathes at the end of the loop: the last two beats ease back a little.
    const last = sc.bars * 16;
    const ease = step >= last - 8 ? 1 + ((step - (last - 8)) / 8) * 0.12 : 1;
    playStep(a, tune, sc, step, nextTime + swing, sixteenth);
    nextTime += sixteenth * ease;
    step = (step + 1) % (sc.bars * 16);
  }
}

// ── The mixer: a little room, some stereo width and a warm top end ──

interface Mix { verb: GainNode; warm: BiquadFilterNode }
let mix: Mix | null = null;

/** A soft, short "room" reverb from a generated impulse (decaying, slightly filtered noise). */
function mixer(a: AudioContext): Mix {
  if (mix) return mix;
  const warm = a.createBiquadFilter();
  warm.type = 'highshelf';
  warm.frequency.value = 6000;
  warm.gain.value = -5; // round off the digital fizz
  warm.connect(musicBus!);
  const len = Math.floor(a.sampleRate * 1.9);
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len;
      lp += ((Math.random() * 2 - 1) - lp) * (0.55 - 0.4 * x); // darker as it fades, like a real room
      d[i] = lp * Math.pow(1 - x, 3.2) * (i < a.sampleRate * 0.012 ? i / (a.sampleRate * 0.012) : 1);
    }
  }
  const verb = a.createGain();
  verb.gain.value = 0.55;
  if (typeof a.createConvolver === 'function') {
    const conv = a.createConvolver();
    conv.buffer = ir;
    const back = a.createGain();
    back.gain.value = 0.5;
    verb.connect(conv).connect(back).connect(warm);
  }
  mix = { verb, warm };
  return mix;
}

/** A tiny random nudge, in seconds, so the band never plays like a metronome. */
const loose = (ms: number) => ((Math.random() + Math.random() - 1) * ms) / 1000;
/** A gentle random level change around 1. */
const touch = (amount: number) => 1 + (Math.random() * 2 - 1) * amount;

function panner(a: AudioContext, pan: number, dest: AudioNode): AudioNode {
  if (!pan || typeof a.createStereoPanner !== 'function') return dest;
  const p = a.createStereoPanner();
  p.pan.value = pan;
  p.connect(dest);
  return p;
}

interface PluckOpts {
  attack?: number;
  vibrato?: number;
  type?: OscillatorType;
  /** Lowpass cutoff; with `bloom` the filter starts brighter and mellows as the note rings. */
  cutoff?: number;
  bloom?: number;
  /** Second voice detuned by this many cents for a warm chorus. */
  detune?: number;
  pan?: number;
  /** How much goes to the room reverb (0..1). */
  verb?: number;
}

/** One plucked/blown note with a few harmonics: the heart of each instrument. */
function pluck(a: AudioContext, hz: number, t: number, dur: number, gain: number, dest: AudioNode, partials: [number, number][], opts: PluckOpts = {}): void {
  const g = a.createGain();
  const attack = opts.attack ?? 0.008;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  // Two-stage decay: a quick settle after the strike, then a long natural ring-out.
  g.gain.setTargetAtTime(gain * 0.55, t + attack, Math.max(0.03, dur * 0.12));
  g.gain.setTargetAtTime(0.0001, t + attack + dur * 0.25, dur * 0.28);
  let out: AudioNode = g;
  if (opts.cutoff) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 0.5;
    const open = opts.cutoff * (opts.bloom ?? 1);
    f.frequency.setValueAtTime(open, t);
    if (opts.bloom) f.frequency.setTargetAtTime(opts.cutoff, t + attack, dur * 0.3);
    g.connect(f);
    out = f;
  }
  out.connect(panner(a, opts.pan ?? 0, dest));
  if (opts.verb && mix) {
    const send = a.createGain();
    send.gain.value = opts.verb;
    out.connect(send).connect(mix.verb);
  }
  let lg: GainNode | null = null;
  if (opts.vibrato) {
    const lfo = a.createOscillator();
    lfo.frequency.value = 4.6 + Math.random() * 1.2;
    lg = a.createGain();
    // Vibrato blooms in after the note starts, the way a singer or wind player does it.
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(hz * opts.vibrato, t + Math.min(0.35, dur * 0.6));
    lfo.connect(lg);
    lfo.start(t);
    lfo.stop(t + dur * 1.6 + 0.05);
  }
  const voices = opts.detune ? [-opts.detune / 2, opts.detune / 2] : [0];
  for (const cents of voices) {
    for (const [mult, amp] of partials) {
      const o = a.createOscillator();
      o.type = opts.type ?? 'sine';
      o.frequency.value = hz * mult;
      o.detune.value = cents;
      if (lg) lg.connect(o.frequency);
      const pg = a.createGain();
      pg.gain.value = amp / voices.length;
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + dur * 1.6 + 0.05);
    }
  }
}

/** A breathy puff at the start of an ocarina note. */
function breath(a: AudioContext, t: number, gain: number): void {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 2400;
  f.Q.value = 1.2;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.12);
  src.connect(f).connect(g).connect(musicBus!);
  src.start(t, Math.random() * 0.5);
  src.stop(t + 0.15);
}

/**
 * How hard a melody note is played: phrases swell toward their middle and relax at the end,
 * downbeats lean a little, long notes sing out, and every note varies slightly.
 */
function expression(i: number, len: number): number {
  const inPhrase = (i % 64) / 64; // 4-bar phrase
  const arch = 0.82 + 0.26 * Math.sin(Math.PI * inPhrase);
  const pos = i % 16;
  const beat = pos === 0 ? 1.1 : pos === 8 ? 1.04 : pos % 4 === 0 ? 1 : 0.88;
  const sing = len >= 8 ? 1.06 : 1;
  return arch * beat * sing * touch(0.08);
}

function leadNote(a: AudioContext, t: Tune, midi: number, when: number, len: number, sixteenth: number, vel: number): void {
  const hz = midiToHz(midi);
  const fx = echo(a, sixteenth);
  const held = len * sixteenth;
  // One voice, split to the dry mix and the echo, so each note costs half the oscillators.
  const split = a.createGain();
  split.connect(mix ? mix.warm : musicBus!);
  const wet = a.createGain();
  wet.gain.value = 0.45;
  split.connect(wet).connect(fx);
  const verb = 0.35;
  if (t.lead === 'musicbox')
    pluck(a, hz, when, Math.max(0.6, held * 1.8), 0.12 * vel, split, [[1, 1], [2, 0.3], [3, 0.1], [4.2, 0.04]], { cutoff: 3200, bloom: 1.8, detune: 6, verb });
  else if (t.lead === 'toypiano')
    pluck(a, hz, when, Math.max(0.35, held * 1.2), 0.12 * vel, split, [[1, 1], [2, 0.22], [3.98, 0.1]], { type: 'triangle', cutoff: 2800, bloom: 2, detune: 5, verb });
  else
    pluck(a, hz, when, Math.max(0.25, held * 1.05), 0.11 * vel, split, [[1, 1], [2, 0.07], [3, 0.02]], { attack: 0.045, vibrato: 0.0055, cutoff: 2400, verb });
  if (t.lead === 'ocarina') breath(a, when, 0.018 * vel);
}

function perc(a: AudioContext, t: number, kind: 'kick' | 'shaker' | 'tick' | 'clap', vel = 1): void {
  const bus = musicBus!;
  vel *= touch(0.15);
  if (kind === 'kick') {
    // A soft, round kick: more "thump" than "boom".
    const o = a.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.34 * vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.22);
    return;
  }
  if (kind === 'tick') {
    // A little wood block, never quite the same pitch twice.
    pluck(a, 1650 * touch(0.03), t, 0.06, 0.04 * vel, bus, [[1, 1], [2.7, 0.35]], { pan: 0.25, verb: 0.3 });
    return;
  }
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = kind === 'clap' ? 'bandpass' : 'highpass';
  f.frequency.value = kind === 'clap' ? 1200 * touch(0.06) : 6000 * touch(0.1);
  const g = a.createGain();
  // A shaker is a swish (soft in, soft out); a clap is a few hands landing at once.
  const len = kind === 'clap' ? 0.12 : 0.07;
  const peak = (kind === 'clap' ? 0.1 : 0.03) * vel;
  g.gain.setValueAtTime(0.0001, t);
  if (kind === 'clap') {
    for (let n = 0; n < 3; n++) {
      g.gain.linearRampToValueAtTime(peak, t + n * 0.009 + 0.002);
      g.gain.linearRampToValueAtTime(peak * 0.3, t + n * 0.009 + 0.008);
    }
    g.gain.linearRampToValueAtTime(peak, t + 0.03);
  } else g.gain.linearRampToValueAtTime(peak, t + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0005, t + len);
  const dest = panner(a, kind === 'shaker' ? 0.35 : -0.15, bus);
  src.connect(f).connect(g).connect(dest);
  if (kind === 'clap' && mix) {
    const s = a.createGain();
    s.gain.value = 0.4;
    g.connect(s).connect(mix.verb);
  }
  src.start(t, Math.random() * 0.5);
  src.stop(t + len + 0.02);
}

/** Put chord tones into a comfortable mid register (around G3 to G4). */
function voicing(root: number, tones: number[], k: number): number[] {
  return tones.map((iv) => {
    let m = 48 + ((root + iv + k + 120) % 12);
    if (m < 53) m += 12;
    return m;
  }).sort((x, y) => x - y);
}

let strumDown = true;

function playStep(a: AudioContext, t: Tune, s: Score, i: number, when: number, sixteenth: number): void {
  mixer(a);
  const bus = mix!.warm;
  const k = shift(t);
  const bar = Math.floor(i / 16);
  const pos = i % 16;
  const half = s.harmony[bar * 2 + (pos >= 8 ? 1 : 0)];
  const inB = bar >= 8;
  const lastBar = bar % 8 === 7;
  // Each player sits slightly differently against the beat: the lead a touch ahead and loose,
  // the bass steady and a hair behind, the strummer in between.
  const lead = when + loose(9) - 0.004;
  const bassT = when + 0.006 + loose(4);
  const strumT = when + loose(7);

  // Lead melody, with a grace note now and then on a long note, like a player decorating it.
  for (const h of byStep.get(i) ?? []) {
    const vel = expression(i, h.len);
    if (h.len >= 6 && Math.random() < 0.18 && lead - sixteenth * 0.35 > a.currentTime) {
      // The scale step above: a half step above E, B and the raised notes, a whole step otherwise.
      const up = [1, 4, 6, 8, 11].includes(h.midi % 12) ? 1 : 2;
      leadNote(a, t, h.midi + k + up, lead - sixteenth * 0.3, 1, sixteenth, vel * 0.5);
    }
    leadNote(a, t, h.midi + k, lead, h.len, sixteenth, vel);
  }

  // Strummed chord: "oom-pah" on 2 and 4 for the stroll, off-beat skanks for the bouncy tunes.
  // Strums alternate down and up, and the top note of an up-strum is lighter, as on a real uke.
  const strum = t.feel === 'stroll' ? pos === 4 || pos === 12 : pos % 4 === 2;
  if (strum) {
    const notes = voicing(half.root, half.tones, k);
    const order = strumDown ? notes : [...notes].reverse();
    const spread = (strumDown ? 0.014 : 0.009) * touch(0.25);
    const sv = (strumDown ? 1 : 0.75) * touch(0.12) * (inB ? 1.05 : 0.95);
    order.forEach((m, n) =>
      pluck(a, midiToHz(m), strumT + n * spread, sixteenth * (t.feel === 'stroll' ? 3.4 : 1.8), 0.032 * sv * (1 - n * 0.06), bus,
        [[1, 1], [2, 0.18], [3, 0.05]], { type: 'triangle', cutoff: 1500, bloom: 1.6, pan: -0.3, verb: 0.25 }),
    );
    strumDown = !strumDown;
  }

  // Bass: root on 1, fifth on 3, and a step that walks into the next chord.
  const root = 36 + ((half.root + k + 120) % 12);
  const bassOpts: PluckOpts = { type: 'triangle', cutoff: 650, bloom: 1.5 };
  if (pos === 0) pluck(a, midiToHz(root), bassT, sixteenth * 6, 0.22 * touch(0.06), bus, [[1, 1], [2, 0.14]], bassOpts);
  if (pos === 8) pluck(a, midiToHz(root + (half === s.harmony[bar * 2] ? 7 : 0)), bassT, sixteenth * 6, 0.18 * touch(0.06), bus, [[1, 1], [2, 0.14]], bassOpts);
  if (t.feel === 'bounce' && (pos === 6 || pos === 14)) pluck(a, midiToHz(root + 12), bassT, sixteenth * 1.6, 0.1 * touch(0.1), bus, [[1, 1]], { type: 'triangle', cutoff: 850 });
  if (pos === 14 && t.feel === 'stroll') {
    const nextRoot = s.harmony[((bar + 1) % s.bars) * 2].root;
    const target = 36 + ((nextRoot + k + 120) % 12);
    pluck(a, midiToHz(target + (target > root ? -1 : 1)), bassT, sixteenth * 2, 0.14 * touch(0.08), bus, [[1, 1]], bassOpts);
  }

  // Marimba counter-line in the B half: a broken chord in eighths, an octave under the lead,
  // swelling into the middle of each bar.
  if (inB && pos % 2 === 0 && !lastBar) {
    const v = voicing(half.root, half.tones, k);
    const order = [0, 1, 2, 1];
    const m = v[order[(pos / 2) % 4] % v.length] + 12;
    const sw = 0.85 + 0.25 * Math.sin((Math.PI * pos) / 16);
    pluck(a, midiToHz(m), when + loose(8), 0.22, 0.03 * sw * touch(0.15), bus, [[1, 1], [4, 0.07]], { pan: 0.35, verb: 0.3 });
  }

  // Percussion: quiet, with ghost notes that come and go.
  if (t.feel === 'stroll') {
    if (pos === 0 || (pos === 8 && inB)) perc(a, when, 'kick', 0.75);
    if (pos % 4 === 2) perc(a, when + loose(6), 'shaker', 0.9);
    else if (pos % 4 === 0 && Math.random() < 0.35) perc(a, when + loose(6), 'shaker', 0.35);
    if (pos === 4 || pos === 12) perc(a, when + loose(5), 'tick', 0.55);
  } else {
    if (pos === 0 || pos === 8) perc(a, when, 'kick', 0.9);
    if (pos === 14 && Math.random() < 0.25) perc(a, when, 'kick', 0.4);
    if (pos % 2 === 0) perc(a, when + loose(5), 'shaker', pos % 4 === 2 ? 1 : 0.45);
    if ((pos === 4 || pos === 12) && inB) perc(a, when + loose(4), 'clap', 0.75);
    if ((pos === 4 || pos === 12) && !inB) perc(a, when + loose(5), 'tick', 0.6);
  }
  // A woodblock fill at the end of each half that builds into the next.
  if (lastBar && pos >= 12 && pos !== 15) perc(a, when + loose(6), 'tick', 0.45 + (pos - 12) * 0.2);
}
