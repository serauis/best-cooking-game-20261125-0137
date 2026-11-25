// Dapur Ibu: tiny synthesized sound effects (WebAudio, no audio files).
// Every sound is built from oscillators and filtered noise in code.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol, filterFreq, when = 0) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + when;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq || 3000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt).connect(gain).connect(ctx.destination);
    src.start(t0);
  }

  pickup() { this.tone(520, 0.08, 'triangle', 0.12, 0, 760); }
  place() { this.tone(340, 0.08, 'triangle', 0.12, 0, 260); }
  chop() { this.noise(0.07, 0.22, 1800); this.tone(180, 0.06, 'square', 0.08); }
  chopDone() { this.tone(660, 0.1, 'triangle', 0.14); this.tone(880, 0.14, 'triangle', 0.14, 0.09); }
  sizzle() { this.noise(0.5, 0.1, 5200); }
  cookDone() { this.tone(740, 0.12, 'sine', 0.16); this.tone(988, 0.18, 'sine', 0.16, 0.11); }
  serve() {
    this.tone(523, 0.12, 'triangle', 0.16);
    this.tone(659, 0.12, 'triangle', 0.16, 0.1);
    this.tone(784, 0.22, 'triangle', 0.18, 0.2);
  }
  bell() { this.tone(1175, 0.35, 'sine', 0.14); this.tone(1568, 0.4, 'sine', 0.08, 0.02); }
  fail() { this.tone(220, 0.25, 'sawtooth', 0.1, 0, 140); }
  click() { this.tone(900, 0.05, 'square', 0.07); }
  rush() {
    this.tone(392, 0.15, 'triangle', 0.14);
    this.tone(523, 0.15, 'triangle', 0.14, 0.13);
    this.tone(659, 0.25, 'triangle', 0.16, 0.26);
  }

  // Gentle gamelan-flavoured pentatonic loop, synthesized, no files.
  startMusic() {
    if (this.musicTimer || !this.ensure()) return;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    let step = 0;
    const pattern = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 3, 2, 4, 2, 1, 0];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const n = pattern[step % pattern.length];
      this.tone(notes[n], 0.5, 'sine', 0.045);
      if (step % 4 === 0) this.tone(notes[n] / 2, 0.9, 'sine', 0.05);
      step++;
    }, 420);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
