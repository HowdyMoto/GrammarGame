// Tiny synthesized sound effects via the Web Audio API. No assets to bundle,
// and the AudioContext is only created on first sound to satisfy autoplay rules.

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.1,
  delay = 0,
) {
  const audio = ac();
  if (!audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sounds = {
  enable() {
    muted = false;
    ac();
  },
  toggleMute(): boolean {
    muted = !muted;
    if (muted && ctx) void ctx.suspend();
    if (!muted && ctx) void ctx.resume();
    return muted;
  },
  isMuted() {
    return muted;
  },
  correct() {
    tone(880, 0.12, 'triangle', 0.08);
    tone(1320, 0.16, 'triangle', 0.06, 0.05);
  },
  wrong() {
    tone(180, 0.18, 'sawtooth', 0.06);
  },
  complete() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, i * 0.08));
  },
  reveal() {
    tone(440, 0.1, 'sine', 0.05);
    tone(330, 0.18, 'sine', 0.05, 0.06);
  },
  start() {
    tone(660, 0.08, 'triangle', 0.06);
    tone(990, 0.1, 'triangle', 0.06, 0.06);
  },
};
