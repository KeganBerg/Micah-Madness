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
  if (!/iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document)) return;
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
  playing = null;
  unlocked = false;
  stale = false;
  if (old) void old.close().catch(() => {});
}

/** Runs on taps until audio is running: create/resume the context and play a silent blip. */
function unlock(inGesture = false): void {
  if (!gestured || (!sfxOn && !musicOn)) return;
  preferPlayback();
  if (inGesture) {
    mediaChannelFallback();
    if (stale && !document.hidden) rebuild();
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
  // that, so the next tap rebuilds it from scratch.
  const away = () => {
    if (!ctx) return;
    if (TOUCH) stale = true;
    stopScheduler();
    void ctx.suspend().catch(() => {});
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) away();
    else if (ctx) {
      void ctx.resume().then(() => {
        if (musicOn && wantMood) startMusic(wantMood);
      }, () => {});
    }
  });
  window.addEventListener('pagehide', away);
}

// Effects asked for while audio is still waking up wait a moment instead of being dropped.
const pending: { run: () => void; at: number }[] = [];
function flushPending(): void {
  const now = performance.now();
  const due = pending.splice(0);
  for (const p of due) if (now - p.at < 600) p.run();
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
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
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
  musicBus.gain.setTargetAtTime(0, a.currentTime, 0.08);
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
    musicBus!.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, 0.4);
    timer = window.setInterval(tick, 25);
    tick();
  };
  if (fresh) begin();
  else later(350, begin);
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
  musicBus.gain.setTargetAtTime(MUSIC_VOL * 0.2, t, 0.05);
  musicBus.gain.setTargetAtTime(MUSIC_VOL, t + seconds, 0.6);
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
  if (nextTime < a.currentTime - 0.2) nextTime = a.currentTime + 0.05;
  while (nextTime < a.currentTime + 0.15) {
    // Swing pushes every off-beat eighth (and the 16th after it) later.
    const pos = step % 4;
    const swing = pos === 2 ? tune.swing * sixteenth : pos === 3 ? tune.swing * sixteenth * 0.5 : 0;
    playStep(a, tune, sc, step, nextTime + swing, sixteenth);
    nextTime += sixteenth;
    step = (step + 1) % (sc.bars * 16);
  }
}

/** One plucked/blown note with a few harmonics: the heart of each instrument. */
function pluck(a: AudioContext, hz: number, t: number, dur: number, gain: number, dest: AudioNode, partials: [number, number][], opts: { attack?: number; vibrato?: number; type?: OscillatorType; cutoff?: number } = {}): void {
  const g = a.createGain();
  const attack = opts.attack ?? 0.004;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  let out: AudioNode = g;
  if (opts.cutoff) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = opts.cutoff;
    g.connect(f);
    out = f;
  }
  out.connect(dest);
  let lfo: OscillatorNode | null = null;
  if (opts.vibrato) {
    lfo = a.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = a.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(hz * opts.vibrato, t + Math.min(0.25, dur * 0.5));
    lfo.connect(lg);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
    (lfo as unknown as { _g: GainNode })._g = lg;
  }
  for (const [mult, amp] of partials) {
    const o = a.createOscillator();
    o.type = opts.type ?? 'sine';
    o.frequency.value = hz * mult;
    if (lfo) (lfo as unknown as { _g: GainNode })._g.connect(o.frequency);
    const pg = a.createGain();
    pg.gain.value = amp;
    o.connect(pg).connect(g);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

function leadNote(a: AudioContext, t: Tune, midi: number, when: number, len: number, sixteenth: number): void {
  const hz = midiToHz(midi);
  const fx = echo(a, sixteenth);
  const held = len * sixteenth;
  const send = (dest: AudioNode, k: number) => {
    if (t.lead === 'musicbox') pluck(a, hz, when, Math.max(0.5, held * 1.6), 0.13 * k, dest, [[1, 1], [2, 0.32], [3, 0.12], [4.2, 0.05]]);
    else if (t.lead === 'toypiano') pluck(a, hz, when, Math.max(0.3, held * 1.1), 0.13 * k, dest, [[1, 1], [2, 0.25], [3.98, 0.12]], { type: 'triangle' });
    else pluck(a, hz, when, Math.max(0.22, held * 0.98), 0.12 * k, dest, [[1, 1], [2, 0.08]], { attack: 0.04, vibrato: 0.006, type: 'sine' });
  };
  send(musicBus!, 1);
  send(fx, 0.5);
}

function perc(a: AudioContext, t: number, kind: 'kick' | 'shaker' | 'tick' | 'clap', vel = 1): void {
  const bus = musicBus!;
  if (kind === 'kick') {
    const o = a.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    const g = a.createGain();
    g.gain.setValueAtTime(0.42 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.17);
    return;
  }
  if (kind === 'tick') {
    // A little wood block.
    pluck(a, 1760, t, 0.05, 0.05 * vel, bus, [[1, 1], [2.7, 0.4]]);
    return;
  }
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = kind === 'clap' ? 'bandpass' : 'highpass';
  f.frequency.value = kind === 'clap' ? 1300 : 5500;
  const g = a.createGain();
  const len = kind === 'clap' ? 0.11 : 0.05;
  const peak = (kind === 'clap' ? 0.14 : 0.04) * vel;
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  src.connect(f).connect(g).connect(bus);
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

function playStep(a: AudioContext, t: Tune, s: Score, i: number, when: number, sixteenth: number): void {
  const bus = musicBus!;
  const k = shift(t);
  const bar = Math.floor(i / 16);
  const pos = i % 16;
  const half = s.harmony[bar * 2 + (pos >= 8 ? 1 : 0)];
  const inB = bar >= 8;
  const lastBar = bar % 8 === 7;

  // Lead melody.
  for (const h of byStep.get(i) ?? []) leadNote(a, t, h.midi + k, when, h.len, sixteenth);

  // Strummed chord: "oom-pah" on 2 and 4 for the stroll, off-beat skanks for the bouncy tunes.
  const strum = t.feel === 'stroll' ? pos === 4 || pos === 12 : pos % 4 === 2;
  if (strum) {
    voicing(half.root, half.tones, k).forEach((m, n) =>
      pluck(a, midiToHz(m), when + n * 0.012, sixteenth * (t.feel === 'stroll' ? 3 : 1.6), 0.035, bus, [[1, 1], [2, 0.2]], { type: 'triangle', cutoff: 1800 }),
    );
  }

  // Bass: root on 1, fifth on 3, and a step that walks into the next chord.
  const root = 36 + ((half.root + k + 120) % 12);
  if (pos === 0) pluck(a, midiToHz(root), when, sixteenth * 5, 0.24, bus, [[1, 1], [2, 0.15]], { type: 'triangle', cutoff: 700 });
  if (pos === 8) pluck(a, midiToHz(root + (half === s.harmony[bar * 2] ? 7 : 0)), when, sixteenth * 5, 0.2, bus, [[1, 1], [2, 0.15]], { type: 'triangle', cutoff: 700 });
  if (t.feel === 'bounce' && (pos === 6 || pos === 14)) pluck(a, midiToHz(root + 12), when, sixteenth * 1.5, 0.12, bus, [[1, 1]], { type: 'triangle', cutoff: 900 });
  if (pos === 14 && t.feel === 'stroll') {
    const nextRoot = s.harmony[((bar + 1) % s.bars) * 2].root;
    const target = 36 + ((nextRoot + k + 120) % 12);
    pluck(a, midiToHz(target + (target > root ? -1 : 1)), when, sixteenth * 2, 0.16, bus, [[1, 1]], { type: 'triangle', cutoff: 700 });
  }

  // Marimba counter-line in the B half: a broken chord in eighths, an octave under the lead.
  if (inB && pos % 2 === 0 && !lastBar) {
    const v = voicing(half.root, half.tones, k);
    const order = [0, 1, 2, 1];
    const m = v[order[(pos / 2) % 4] % v.length] + 12;
    pluck(a, midiToHz(m), when, 0.18, 0.035, bus, [[1, 1], [4, 0.08]]);
  }

  // Percussion.
  if (t.feel === 'stroll') {
    if (pos === 0 || (pos === 8 && inB)) perc(a, when, 'kick', 0.8);
    if (pos % 4 === 2) perc(a, when, 'shaker', 0.9);
    if (pos === 4 || pos === 12) perc(a, when, 'tick', 0.6);
  } else {
    if (pos === 0 || pos === 8) perc(a, when, 'kick');
    if (pos % 2 === 0) perc(a, when, 'shaker', pos % 4 === 2 ? 1 : 0.5);
    if ((pos === 4 || pos === 12) && inB) perc(a, when, 'clap', 0.8);
    if ((pos === 4 || pos === 12) && !inB) perc(a, when, 'tick', 0.7);
  }
  // A woodblock fill at the end of each half.
  if (lastBar && pos >= 12 && pos !== 15) perc(a, when, 'tick', 0.5 + (pos - 12) * 0.2);
}
