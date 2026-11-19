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

export const sfx = {
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
