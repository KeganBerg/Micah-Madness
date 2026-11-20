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
/** Every effect goes through whenLive, so nothing is lost while iOS is waking the audio up. */
export const sfx = Object.fromEntries(
  Object.entries(effects).map(([k, fn]) => [k, (...args: unknown[]) => whenLive(() => (fn as (...a: unknown[]) => void)(...args))]),
) as Effects;

// ───────────────────────────── Music ─────────────────────────────
// A tiny step sequencer. Each mood is a chord loop plus a melody that is generated once from a seed,
// so it is the same tune every time you hear it but no two zones sound alike.

export type Mood = 'map' | 'level';

interface Song {
  bpm: number;
  root: number; // MIDI note of the key's tonic
  scale: number[]; // semitone steps of the scale
  chords: number[]; // scale degree of each bar's chord (0 = I)
  lead: OscillatorType;
  swing: number; // 0..0.3 delay on off-beat 16ths
  drums: 'soft' | 'bouncy';
  density: number; // 0..1 chance of a melody note on a free step
  seed: number;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MIXO = [0, 2, 4, 5, 7, 9, 10];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];

/** The map: an easy-going stroll. */
const MAP_SONG: Song = { bpm: 88, root: 65, scale: MAJOR, chords: [0, 5, 3, 4, 0, 5, 1, 4], lead: 'triangle', swing: 0.18, drums: 'soft', density: 0.45, seed: 7 };

/** Levels: a bouncier fetch tune, re-keyed and re-seeded for each zone of the map. */
function levelSong(zone: number): Song {
  const keys = [67, 69, 62, 64, 65, 60, 70, 67];
  const scales = [MAJOR, MIXO, MAJOR, DORIAN, MAJOR, MIXO, DORIAN, MAJOR];
  const progs = [
    [0, 4, 5, 3],
    [0, 6, 3, 0],
    [0, 3, 4, 4],
    [0, 6, 5, 6],
    [5, 3, 0, 4],
    [0, 6, 3, 4],
    [0, 3, 6, 4],
    [0, 4, 5, 3],
  ];
  const z = ((zone % 8) + 8) % 8;
  return { bpm: 112 + (z % 4) * 4, root: keys[z], scale: scales[z], chords: progs[z], lead: z % 2 ? 'square' : 'triangle', swing: 0.08, drums: 'bouncy', density: 0.6, seed: 101 + z * 17 };
}

interface Note {
  step: number; // 16th-note index within the loop
  deg: number; // scale degree (can exceed 7 for upper octave)
  len: number; // in 16ths
}

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compose a melody over the chord loop: chord tones on strong beats, stepwise passing notes between. */
function compose(song: Song): Note[] {
  const r = rng(song.seed);
  const bars = song.chords.length;
  // Write two bars of motif, then reuse it with small changes so the tune is hummable.
  const motif: Note[] = [];
  let deg = 4;
  for (let s = 0; s < 32; ) {
    const strong = s % 4 === 0;
    if (strong || r() < song.density) {
      const len = strong && r() < 0.4 ? 4 : r() < 0.5 ? 2 : 1;
      motif.push({ step: s, deg, len });
      s += len;
      const leap = r() < 0.2 ? (r() < 0.5 ? -3 : 3) : r() < 0.5 ? -1 : 1;
      deg = Math.max(0, Math.min(9, deg + leap));
    } else s += 1;
  }
  const out: Note[] = [];
  for (let b = 0; b < bars; b += 2) {
    const last = b + 2 >= bars;
    for (const n of motif) {
      // Snap strong-beat notes onto the current chord so the melody always fits the harmony.
      const bar = b + Math.floor(n.step / 16);
      const cd = song.chords[bar % bars];
      let d = n.deg;
      if (n.step % 4 === 0) {
        const tones = [cd, cd + 2, cd + 4, cd + 7];
        d = tones.reduce((best, t) => (Math.abs(t - d) < Math.abs(best - d) ? t : best), tones[0]);
      }
      if (last && n.step >= 24) continue; // leave a breath before the loop comes round
      out.push({ step: b * 16 + n.step, deg: d, len: n.len });
    }
    if (last) out.push({ step: b * 16 + 24, deg: 7, len: 6 });
  }
  return out;
}

function midiToHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}
function degToMidi(song: Song, deg: number, octave = 0): number {
  const o = Math.floor(deg / 7);
  const i = ((deg % 7) + 7) % 7;
  return song.root + song.scale[i] + 12 * (o + octave);
}

let wantMood: Mood | null = null;
let wantZone = 0;
let playing: { mood: Mood; zone: number } | null = null;
let song: Song | null = null;
let melody: Note[] = [];
let step = 0;
let nextTime = 0;
let timer: number | undefined;
let delay: { input: GainNode } | null = null;

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
  // Fade the old tune out quickly, then bring the new one in.
  musicBus.gain.cancelScheduledValues(a.currentTime);
  musicBus.gain.setTargetAtTime(0, a.currentTime, 0.08);
  stopScheduler();
  const begin = () => {
    if (!playing || playing.mood !== mood || playing.zone !== zone || !musicOn || !ctx || ctx.state !== 'running') return;
    song = mood === 'map' ? MAP_SONG : levelSong(zone);
    melody = compose(song);
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    musicBus!.gain.cancelScheduledValues(ctx.currentTime);
    musicBus!.gain.setTargetAtTime(MUSIC_VOL, ctx.currentTime, 0.5);
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
  musicBus.gain.setTargetAtTime(MUSIC_VOL * 0.25, t, 0.05);
  musicBus.gain.setTargetAtTime(MUSIC_VOL, t + seconds, 0.6);
}

function echo(a: AudioContext): GainNode {
  if (delay) return delay.input;
  const input = a.createGain();
  const d = a.createDelay(1);
  d.delayTime.value = 0.27;
  const fb = a.createGain();
  fb.gain.value = 0.28;
  const tone = a.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2200;
  const wet = a.createGain();
  wet.gain.value = 0.35;
  input.connect(d).connect(tone).connect(fb).connect(d);
  tone.connect(wet).connect(musicBus!);
  delay = { input };
  return input;
}

function tick(): void {
  const a = ctx;
  if (!a || !song || a.state !== 'running') return;
  const sixteenth = 60 / song.bpm / 4;
  // Don't try to catch up after a long stall (tab throttled): skip ahead instead.
  if (nextTime < a.currentTime - 0.2) nextTime = a.currentTime + 0.05;
  while (nextTime < a.currentTime + 0.15) {
    const swing = step % 2 ? song.swing * sixteenth : 0;
    playStep(a, song, step, nextTime + swing, sixteenth);
    nextTime += sixteenth;
    step = (step + 1) % (song.chords.length * 16);
  }
}

function voice(a: AudioContext, type: OscillatorType, hz: number, t: number, dur: number, gain: number, dest: AudioNode, cutoff = 0): void {
  const o = a.createOscillator();
  o.type = type;
  o.frequency.value = hz;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(gain * 0.4, t + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = o;
  if (cutoff) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    node = o.connect(f);
  }
  node.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function perc(a: AudioContext, t: number, kind: 'kick' | 'hat' | 'shaker'): void {
  const bus = musicBus!;
  if (kind === 'kick') {
    const o = a.createOscillator();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = a.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.18);
    return;
  }
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.loop = true;
  const f = a.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = kind === 'hat' ? 7000 : 4500;
  const g = a.createGain();
  const len = kind === 'hat' ? 0.04 : 0.07;
  g.gain.setValueAtTime(kind === 'hat' ? 0.12 : 0.07, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + len);
  src.connect(f).connect(g).connect(bus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + len + 0.02);
}

function playStep(a: AudioContext, s: Song, i: number, t: number, sixteenth: number): void {
  const bus = musicBus!;
  const bar = Math.floor(i / 16);
  const pos = i % 16;
  const chord = s.chords[bar];

  // Pad-ish chord: soft stabs on beats 1 and 3 (map) or off-beats (levels).
  const stab = s.drums === 'soft' ? pos === 0 || pos === 8 : pos === 2 || pos === 6 || pos === 10 || pos === 14;
  if (stab) {
    const len = s.drums === 'soft' ? sixteenth * 8 : sixteenth * 1.6;
    for (const d of [0, 2, 4]) voice(a, 'sine', midiToHz(degToMidi(s, chord + d, -1)), t, len, s.drums === 'soft' ? 0.06 : 0.05, bus, 0);
  }

  // Bass: root on the beat, fifth on the "and" of beat 3.
  if (pos === 0 || pos === 8 || (s.drums === 'bouncy' && (pos === 4 || pos === 12))) {
    const d = pos === 8 && s.drums === 'soft' ? chord + 4 : chord;
    voice(a, 'triangle', midiToHz(degToMidi(s, d, -2)), t, sixteenth * 3, 0.22, bus, 600);
  }

  // Melody.
  for (const n of melody) {
    if (n.step !== i) continue;
    const dest = echo(a);
    const hz = midiToHz(degToMidi(s, n.deg, 0));
    const dur = Math.max(0.12, n.len * sixteenth * 0.95);
    const g = s.lead === 'square' ? 0.045 : 0.1;
    voice(a, s.lead, hz, t, dur, g, bus, s.lead === 'square' ? 2400 : 0);
    voice(a, s.lead, hz, t, dur, g * 0.6, dest, s.lead === 'square' ? 2400 : 0);
  }

  // Drums.
  if (s.drums === 'soft') {
    if (pos === 0) perc(a, t, 'kick');
    if (pos % 4 === 2) perc(a, t, 'shaker');
  } else {
    if (pos % 4 === 0) perc(a, t, 'kick');
    if (pos % 2 === 1) perc(a, t, 'hat');
  }
}
