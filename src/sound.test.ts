import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A pretend browser audio stack: enough of Web Audio, window and document for src/sound.ts to run,
// with switches for the things that go wrong on real phones (autoplay rules, iOS suspending or
// freezing the context, tab switches).

type State = 'suspended' | 'running' | 'closed' | 'interrupted';
let contexts: FakeContext[] = [];
let inGesture = false;
let allowResumeOutsideGesture = true;

function param() {
  return { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} };
}
function node(ctx: FakeContext, kind: string) {
  const n: Record<string, unknown> = {
    gain: param(), frequency: param(), Q: param(), threshold: param(), ratio: param(), delayTime: param(), detune: param(), pan: param(),
    connect: (x: unknown) => x,
    disconnect() {},
    start() {
      if (ctx.state === 'running' && !ctx.frozen) ctx.started[kind] = (ctx.started[kind] ?? 0) + 1;
    },
    stop() {},
    addEventListener() {},
  };
  return n;
}

class FakeContext {
  state: State = 'suspended';
  currentTime = 0;
  frozen = false;
  sampleRate = 44100;
  destination = {};
  started: Record<string, number> = {};
  private listeners: (() => void)[] = [];
  constructor() {
    contexts.push(this);
    if (inGesture) this.state = 'running';
  }
  addEventListener(_: string, fn: () => void) {
    this.listeners.push(fn);
  }
  set(state: State) {
    this.state = state;
    this.listeners.forEach((f) => f());
  }
  resume() {
    if (this.state === 'closed') return Promise.reject(new Error('closed'));
    if (this.state === 'interrupted') return Promise.reject(new Error('interrupted'));
    if (!inGesture && !allowResumeOutsideGesture) return Promise.reject(new Error('not allowed'));
    this.set('running');
    return Promise.resolve();
  }
  suspend() {
    this.set('suspended');
    return Promise.resolve();
  }
  close() {
    this.set('closed');
    return Promise.resolve();
  }
  createGain() { return node(this, 'gain'); }
  createOscillator() { return node(this, 'osc'); }
  createBiquadFilter() { return node(this, 'filter'); }
  createDynamicsCompressor() { return node(this, 'comp'); }
  createDelay() { return node(this, 'delay'); }
  createConvolver() { return node(this, 'conv'); }
  createStereoPanner() { return node(this, 'pan'); }
  createBufferSource() { return node(this, 'src'); }
  createBuffer(_c: number, len: number) {
    return { sampleRate: this.sampleRate, getChannelData: () => new Float32Array(len) };
  }
}

/** Fake window/document event plumbing. */
function target() {
  const map = new Map<string, ((e: unknown) => void)[]>();
  return {
    addEventListener(t: string, f: (e: unknown) => void) {
      map.set(t, [...(map.get(t) ?? []), f]);
    },
    fire(t: string) {
      for (const f of map.get(t) ?? []) f({ type: t });
    },
  };
}
let win: ReturnType<typeof target>;
let doc: ReturnType<typeof target> & { hidden: boolean; ontouchend?: null };

async function boot(opts: { ios?: boolean } = {}) {
  vi.resetModules();
  contexts = [];
  inGesture = false;
  allowResumeOutsideGesture = !opts.ios;
  win = target();
  doc = Object.assign(target(), { hidden: false }) as typeof doc;
  if (opts.ios || opts.ios === false) doc.ontouchend = null; // a touch device either way
  const w = Object.assign(win, {
    AudioContext: FakeContext,
    setInterval: (f: () => void, ms: number) => setInterval(f, ms),
    clearInterval: (id: number) => clearInterval(id),
  });
  vi.stubGlobal('window', w);
  vi.stubGlobal('document', doc);
  vi.stubGlobal('navigator', {
    userAgent: opts.ios ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)' : 'Mozilla/5.0 (Linux; Android 14) Chrome/130',
    audioSession: { type: 'auto' },
  });
  return import('./sound');
}

/** A tap: iOS only lets audio start during touchend/click, so only those count as gestures here. */
async function tap(kinds = ['pointerdown', 'touchstart', 'pointerup', 'touchend', 'click']) {
  for (const k of kinds) {
    inGesture = k === 'touchend' || k === 'click';
    win.fire(k);
    inGesture = false;
  }
  await flush();
}
async function flush() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
function live() {
  return contexts.filter((c) => c.state !== 'closed');
}
function sounds(c = contexts[contexts.length - 1]) {
  return c.started.osc ?? 0;
}
async function hide() {
  doc.hidden = true;
  doc.fire('visibilitychange');
  await flush();
}
async function show() {
  doc.hidden = false;
  doc.fire('visibilitychange');
  await flush();
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('sound', () => {
  it('makes no audio context before the first tap', async () => {
    const s = await boot({ ios: true });
    s.setSound(true);
    s.setMusic(true);
    s.playMusic('map');
    s.sfx.pop(1);
    expect(contexts.length).toBe(0);
  });

  it('starts on the first tap and plays the effect that tap asked for', async () => {
    const s = await boot({ ios: true });
    s.setSound(true);
    s.setMusic(true);
    s.playMusic('map');
    await tap(['pointerdown']);
    s.sfx.tap(); // the button's sound, asked for before audio is running
    await tap(['touchstart', 'pointerup', 'touchend']);
    expect(contexts[0].state).toBe('running');
    expect(sounds()).toBeGreaterThan(0);
    expect((navigator as unknown as { audioSession: { type: string } }).audioSession.type).toBe('playback');
  });

  it('plays effects during a level and keeps the music going', async () => {
    const s = await boot();
    s.setSound(true);
    s.setMusic(true);
    s.playMusic('level', 2);
    await tap();
    const before = sounds();
    for (let i = 0; i < 20; i++) s.sfx.pop(i % 5);
    expect(sounds()).toBeGreaterThanOrEqual(before + 20);
    const mid = sounds();
    contexts[0].currentTime += 2;
    vi.advanceTimersByTime(100);
    expect(sounds()).toBeGreaterThan(mid); // the music scheduler is placing notes
  });

  it('Android and desktop: comes back after a tab switch without needing a tap', async () => {
    const s = await boot({ ios: false });
    s.setMusic(true);
    s.playMusic('map');
    await tap();
    await hide();
    expect(contexts[0].state).toBe('suspended');
    await show();
    expect(contexts[0].state).toBe('running');
    expect(contexts.length).toBe(1);
    await tap();
    expect(contexts.length).toBe(1); // not rebuilt, so the music doesn't restart
    s.sfx.coin();
    expect(sounds()).toBeGreaterThan(0);
  });

  it('iPhone: the first tap after the lock screen builds a fresh context that plays', async () => {
    const s = await boot({ ios: true });
    s.setMusic(true);
    s.playMusic('level', 0);
    await tap();
    await hide();
    await show();
    // Even a drag on the board (no click) wakes audio, via touchend.
    await tap(['pointerdown', 'touchstart', 'pointerup', 'touchend']);
    expect(live().length).toBe(1);
    expect(contexts.length).toBe(2);
    const now = contexts[1];
    expect(now.state).toBe('running');
    s.sfx.swap();
    expect(sounds(now)).toBeGreaterThan(0);
  });

  it('iPhone: recovers after a phone call interrupts audio', async () => {
    const s = await boot({ ios: true });
    s.setMusic(false);
    await tap();
    contexts[0].set('interrupted');
    await tap();
    expect(contexts[contexts.length - 1].state).toBe('running');
    s.sfx.goal();
    expect(sounds()).toBeGreaterThan(0);
  });

  it('notices a context whose clock froze and rebuilds it on the next tap', async () => {
    const s = await boot({ ios: false });
    s.setMusic(false);
    await tap();
    contexts[0].frozen = true; // "running" but silent, clock stuck
    vi.advanceTimersByTime(3100);
    vi.advanceTimersByTime(5000);
    await tap();
    expect(contexts.length).toBe(2);
    s.sfx.bark();
    expect(sounds(contexts[1])).toBeGreaterThan(0);
  });

  it('the Sound and Music switches turn each part off and back on', async () => {
    const s = await boot();
    s.setSound(true);
    s.setMusic(true);
    s.playMusic('map');
    await tap();
    s.setSound(false);
    const off = sounds();
    s.sfx.pop(1);
    expect(sounds()).toBe(off);
    s.setSound(true);
    s.sfx.pop(1);
    expect(sounds()).toBeGreaterThan(off);

    s.setMusic(false);
    vi.advanceTimersByTime(1000);
    const quiet = sounds();
    contexts[0].currentTime += 2;
    vi.advanceTimersByTime(200);
    expect(sounds()).toBe(quiet);
    s.setMusic(true);
    contexts[0].currentTime += 1;
    vi.advanceTimersByTime(600);
    expect(sounds()).toBeGreaterThan(quiet);
  });

  it('with both switches off, a tap never creates audio', async () => {
    const s = await boot();
    s.setSound(false);
    s.setMusic(false);
    await tap();
    expect(contexts.length).toBe(0);
  });

  describe('recorded music', () => {
    function withRecordings(ok: boolean) {
      const urls: string[] = [];
      vi.stubGlobal('fetch', (u: string) => {
        urls.push(u);
        return Promise.resolve({ ok, status: ok ? 200 : 404, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      });
      (FakeContext.prototype as unknown as Record<string, unknown>).decodeAudioData = (_b: ArrayBuffer, res: (x: unknown) => void) =>
        res({ duration: 60 });
      return urls;
    }
    afterEach(() => {
      delete (FakeContext.prototype as unknown as Record<string, unknown>).decodeAudioData;
    });

    it('plays the real track for the map and each zone, looping, instead of the synth', async () => {
      const urls = withRecordings(true);
      const s = await boot();
      s.setMusic(true);
      s.playMusic('map');
      await tap();
      await flush();
      await flush();
      expect(urls).toEqual([s.trackFor('map')]);
      expect(contexts[0].started.src ?? 0).toBeGreaterThanOrEqual(1);
      const osc = sounds();
      contexts[0].currentTime += 2;
      vi.advanceTimersByTime(200);
      expect(sounds()).toBe(osc); // no synth notes
      s.playMusic('level', 2);
      vi.advanceTimersByTime(900);
      await flush();
      await flush();
      expect(urls[1]).toBe(s.trackFor('level', 2));
      expect(s.trackFor('level', 6)).toBe(s.trackFor('level', 2));
      expect(new Set([0, 1, 2, 3].map((z) => s.trackFor('level', z))).size).toBe(4);
    });

    it('plays the holiday track on the map in winter, and leaves the levels alone', async () => {
      const s = await boot();
      const normal = s.trackFor('map');
      const level = s.trackFor('level', 1);
      s.setHolidayMusic(true);
      expect(s.trackFor('map')).not.toBe(normal);
      expect(s.trackFor('map')).toContain('holiday');
      expect(s.trackFor('level', 1)).toBe(level);
      s.setHolidayMusic(false);
      expect(s.trackFor('map')).toBe(normal);
    });

    it('falls back to the synth tunes when a track will not load', async () => {
      withRecordings(false);
      const s = await boot();
      s.setMusic(true);
      s.playMusic('map');
      await tap();
      await flush();
      await flush();
      const before = sounds();
      contexts[0].currentTime += 2;
      vi.advanceTimersByTime(200);
      expect(sounds()).toBeGreaterThan(before);
    });
  });
});
