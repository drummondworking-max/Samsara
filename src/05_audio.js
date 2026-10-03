/* ================= audio: everything synthesized ================= */
const AU = {
  ctx: null, master: null, music: null, sfx: null, rev: null, last: {}, mode: null, timer: null, nextT: 0, voices: [],
  vol: { master: 0.8, music: 0.55, sfx: 0.8 },
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC(); } catch (e) { return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = this.vol.master;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    this.master.connect(comp); comp.connect(c.destination);
    this.music = c.createGain(); this.music.gain.value = this.vol.music; this.music.connect(this.master);
    this.sfx = c.createGain(); this.sfx.gain.value = this.vol.sfx; this.sfx.connect(this.master);
    // reverb
    this.rev = c.createConvolver(); const len = c.sampleRate * 3.2; const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.rev.buffer = buf; this.revIn = c.createGain(); this.revIn.gain.value = 0.35; this.revIn.connect(this.rev); this.rev.connect(this.master);
    // noise buffer
    const nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; this.noiseBuf = nb;
    // distortion curve
    const curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3); } this.curve = curve;
    if (this.pendingMode) { const m = this.pendingMode; this.pendingMode = null; this.setMusic(m); }
  },
  setVol() { if (!this.ctx) return; this.master.gain.value = this.vol.master; this.music.gain.value = this.vol.music; this.sfx.gain.value = this.vol.sfx; },
  t() { return this.ctx ? this.ctx.currentTime : 0; },
  noise(dur) { const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true; s.loopStart = Math.random(); return s; },
  env(g, t, a, peak, d, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d); },
  tone(type, f, t, dur, vol, dest, opts = {}) {
    const c = this.ctx; const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.glide || dur));
    if (opts.detune) o.detune.value = opts.detune;
    const g = c.createGain(); this.env(g, t, opts.a || 0.005, vol, dur);
    let node = o;
    if (opts.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = opts.lp; f2.Q.value = opts.q || 0.7; node.connect(f2); node = f2; }
    node.connect(g); g.connect(dest || this.sfx); if (opts.rev) g.connect(this.revIn);
    o.start(t); o.stop(t + (opts.a || 0.005) + dur + 0.05); return o;
  },
  nz(t, dur, vol, type, freq, q, dest, opts = {}) {
    const c = this.ctx; const s = this.noise(); const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q || 1;
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    const g = c.createGain(); this.env(g, t, opts.a || 0.003, vol, dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); if (opts.rev) g.connect(this.revIn);
    s.start(t); s.stop(t + dur + (opts.a || 0.003) + 0.05);
  },
  bowl(f, t, vol, dest, dur = 7) {
    const parts = [1, 2.76, 5.4, 8.93]; const amps = [1, 0.5, 0.25, 0.12];
    parts.forEach((p, i) => { this.tone('sine', f * p, t, dur / (1 + i * 0.6), vol * amps[i], dest, { a: 0.01, rev: 1 }); this.tone('sine', f * p * 1.004, t, dur / (1 + i * 0.6), vol * amps[i] * 0.6, dest, { a: 0.01 }); });
  },
  gong(f, t, vol, dest) {
    const parts = [1, 1.47, 2.09, 2.56, 3.3, 4.1]; parts.forEach((p, i) => this.tone('sine', f * p, t, 4.5 / (1 + i * 0.4), vol / (1 + i * 0.7), dest, { a: 0.004, rev: 1 }));
    this.nz(t, 0.25, vol * 0.3, 'bandpass', 400, 1, dest);
  },
  om(t, dur, vol, dest, base = 98) {
    const c = this.ctx; [1, 1.5, 2, 0.5].forEach((m, i) => {
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = base * m; o.detune.value = (i - 1.5) * 6;
      const lfo = c.createOscillator(); lfo.frequency.value = 4.5 + i * 0.3; const lg = c.createGain(); lg.gain.value = 3; lfo.connect(lg); lg.connect(o.detune);
      const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6; f1.frequency.setValueAtTime(520, t); f1.frequency.linearRampToValueAtTime(420, t + dur * 0.55); f1.frequency.linearRampToValueAtTime(260, t + dur);
      const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8; f2.frequency.setValueAtTime(820, t); f2.frequency.linearRampToValueAtTime(700, t + dur * 0.5);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol / (i + 1.2), t + dur * 0.25); g.gain.linearRampToValueAtTime(vol / (i + 1.5) * 0.7, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      const g2 = c.createGain(); g2.gain.value = 0.5; o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g2); g2.connect(g); g.connect(dest); g.connect(this.revIn);
      o.start(t); lfo.start(t); o.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
    });
  },
  drum(t, vol, dest, f = 90) {
    this.tone('sine', f * 1.6, t, 0.5, vol, dest, { to: f * 0.5, glide: 0.35 });
    this.nz(t, 0.06, vol * 0.5, 'lowpass', 900, 1, dest);
  },
  play(name, vol = 1, pitch = 1) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.t(); const minGap = { hit: 0.035, orb: 0.05, coin: 0.05, die: 0.04, arrow: 0.04, bolt: 0.05, fire: 0.06, lightning: 0.07, cold: 0.07, void: 0.08, swing: 0.05, ehit: 0.08, eshot: 0.07, hurt: 0.12, block: 0.1 }[name] || 0.02;
    if (this.last[name] && now - this.last[name] < minGap) return; this.last[name] = now;
    const t = now + 0.005, v = vol, p = pitch, S = this.sfx;
    switch (name) {
      case 'hit': this.nz(t, 0.07, 0.22 * v, 'bandpass', 700 * p, 1.2); this.tone('sine', 140 * p, t, 0.08, 0.2 * v, S, { to: 70 }); break;
      case 'crit': this.nz(t, 0.1, 0.3 * v, 'bandpass', 1400, 2); this.tone('triangle', 520, t, 0.12, 0.15 * v, S, { to: 260 }); break;
      case 'swing': this.nz(t, 0.16, 0.18 * v, 'bandpass', 600, 0.8, S, { to: 2200, a: 0.03 }); break;
      case 'arrow': this.tone('triangle', 700 * p, t, 0.1, 0.12 * v, S, { to: 330 }); this.nz(t, 0.08, 0.08 * v, 'highpass', 3000, 1); break;
      case 'bolt': this.tone('sine', 880 * p, t, 0.18, 0.12 * v, S, { to: 1500, glide: 0.08, rev: 1 }); this.tone('sine', 1320 * p, t + 0.02, 0.2, 0.06 * v, S, { rev: 1 }); break;
      case 'fire': this.nz(t, 0.35, 0.22 * v, 'lowpass', 400, 1, S, { to: 2400, a: 0.05 }); break;
      case 'cold': [1760, 2637, 3520].forEach((f, i) => this.tone('sine', f * p, t + i * 0.03, 0.4, 0.06 * v, S, { rev: 1 })); break;
      case 'lightning': for (let i = 0; i < 4; i++) this.nz(t + i * 0.035, 0.05, 0.22 * v, 'highpass', 1800 + Math.random() * 2000, 1); this.tone('square', 90, t, 0.12, 0.05 * v, S, { to: 40 }); break;
      case 'void': this.tone('sine', 320 * p, t, 0.4, 0.18 * v, S, { to: 70 }); this.tone('sine', 336 * p, t, 0.4, 0.1 * v, S, { to: 74 }); break;
      case 'nova': this.tone('sine', 110, t, 0.5, 0.35 * v, S, { to: 40 }); this.nz(t, 0.5, 0.2 * v, 'bandpass', 300, 0.7, S, { to: 3000, a: 0.02 }); break;
      case 'boom': this.tone('sine', 90, t, 0.7, 0.45 * v, S, { to: 30 }); this.nz(t, 0.4, 0.3 * v, 'lowpass', 1200, 0.7, S, { to: 200 }); break;
      case 'summon': [392, 494, 587, 784].forEach((f, i) => this.tone('triangle', f, t + i * 0.06, 0.6, 0.07 * v, S, { rev: 1 })); break;
      case 'heal': [523, 659, 784, 1047].forEach((f, i) => this.tone('sine', f, t + i * 0.07, 0.7, 0.08 * v, S, { rev: 1 })); break;
      case 'coin': this.tone('sine', 2093 * p, t, 0.08, 0.07 * v); this.tone('sine', 2637 * p, t + 0.05, 0.12, 0.06 * v); break;
      case 'orb': { const sc = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2]; this.tone('sine', 1046 * pick(sc) * p, t, 0.12, 0.035 * v, S, { rev: 1 }); break; }
      case 'pickup': this.tone('triangle', 660, t, 0.08, 0.1 * v); this.tone('triangle', 990, t + 0.04, 0.08, 0.08 * v); break;
      case 'drop': this.nz(t, 0.08, 0.2 * v, 'lowpass', 600, 1); this.tone('sine', 180, t, 0.1, 0.12 * v, S, { to: 90 }); break;
      case 'drop_magic': this.tone('sine', 880, t, 0.3, 0.08 * v, S, { rev: 1 }); break;
      case 'drop_rare': this.tone('sine', 1175, t, 0.5, 0.1 * v, S, { rev: 1 }); this.tone('sine', 1568, t + 0.08, 0.5, 0.07 * v, S, { rev: 1 }); break;
      case 'drop_unique': this.bowl(392, t, 0.12 * v, S, 4); this.tone('sine', 1568, t + 0.12, 1.2, 0.08 * v, S, { rev: 1 }); this.tone('sine', 2093, t + 0.22, 1.2, 0.06 * v, S, { rev: 1 }); break;
      case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone('sine', f, t + i * 0.09, 1.4, 0.09 * v, S, { rev: 1 })); this.bowl(261, t, 0.1 * v, S, 5); break;
      case 'potion': for (let i = 0; i < 3; i++) this.tone('sine', 300 + i * 90, t + i * 0.08, 0.08, 0.1 * v, S, { to: 500 + i * 100 }); break;
      case 'hurt': this.nz(t, 0.12, 0.25 * v, 'lowpass', 500, 1); this.tone('sawtooth', 160, t, 0.12, 0.06 * v, S, { to: 90, lp: 600 }); break;
      case 'block': this.tone('triangle', 1400, t, 0.12, 0.1 * v, S, { to: 900 }); this.nz(t, 0.05, 0.1 * v, 'highpass', 3000, 1); break;
      case 'die': this.nz(t, 0.18, 0.12 * v, 'bandpass', 900 * p, 0.8, S, { to: 300 }); this.tone('sine', 700 * p, t, 0.25, 0.04 * v, S, { to: 1400, rev: 1 }); break;
      case 'die_big': this.tone('sine', 120, t, 0.9, 0.35 * v, S, { to: 40 }); this.nz(t, 0.8, 0.25 * v, 'lowpass', 900, 0.8, S, { to: 100 }); this.bowl(196, t + 0.1, 0.1 * v, S, 4); break;
      case 'roar': { const c = this.ctx; const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 1.2);
        const ws = c.createWaveShaper(); ws.curve = this.curve; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; const g = c.createGain(); this.env(g, t, 0.08, 0.28 * v, 1.2);
        o.connect(ws); ws.connect(f); f.connect(g); g.connect(S); g.connect(this.revIn); o.start(t); o.stop(t + 1.5); this.nz(t, 1.1, 0.18 * v, 'bandpass', 300, 0.6, S, { to: 120, a: 0.05 }); break; }
      case 'portal': this.nz(t, 1.0, 0.18 * v, 'bandpass', 300, 3, S, { to: 2400, a: 0.2 }); this.tone('sine', 220, t, 1.0, 0.08 * v, S, { to: 880, glide: 0.9, rev: 1 }); break;
      case 'click': this.tone('triangle', 900, t, 0.03, 0.08 * v); this.nz(t, 0.02, 0.06 * v, 'bandpass', 2400, 2); break;
      case 'open': this.tone('sine', 220, t, 0.12, 0.12 * v, S, { to: 160 }); this.nz(t, 0.08, 0.08 * v, 'lowpass', 800, 1); break;
      case 'close': this.tone('sine', 180, t, 0.1, 0.1 * v, S, { to: 230 }); break;
      case 'error': this.tone('square', 180, t, 0.12, 0.05 * v, S, { lp: 900 }); this.tone('square', 150, t + 0.1, 0.14, 0.05 * v, S, { lp: 900 }); break;
      case 'mantra': this.om(t, 2.6, 0.2 * v, S, 98); this.gong(110, t, 0.25 * v, S); break;
      case 'gong': this.gong(98, t, 0.3 * v, S); break;
      case 'bell': this.bowl(523 * p, t, 0.12 * v, S, 4); break;
      case 'quest': [587, 784, 988, 1175].forEach((f, i) => this.tone('triangle', f, t + i * 0.11, 0.7, 0.08 * v, S, { rev: 1 })); this.gong(147, t, 0.12 * v, S); break;
      case 'shrine': for (let i = 0; i < 6; i++) this.tone('sine', 1046 * Math.pow(2, i / 5), t + i * 0.05, 0.8, 0.05 * v, S, { rev: 1 }); break;
      case 'eshot': this.tone('triangle', 500 * p, t, 0.12, 0.05 * v, S, { to: 300 }); break;
      case 'ehit': this.nz(t, 0.05, 0.12 * v, 'bandpass', 1200, 1.5); break;
      case 'warn': this.tone('sawtooth', 220, t, 0.25, 0.06 * v, S, { lp: 800 }); this.tone('sawtooth', 233, t, 0.25, 0.06 * v, S, { lp: 800 }); break;
      case 'explode': this.tone('sine', 140, t, 0.4, 0.3 * v, S, { to: 40 }); this.nz(t, 0.35, 0.25 * v, 'lowpass', 2000, 0.8, S, { to: 200 }); break;
    }
  },
  /* ---------- generative music ---------- */
  MODES: {
    title: { root: 49, scale: [0, 3, 5, 7, 10], drone: 'deep', bowl: [8, 14], mel: 0.25, om: 1, pace: 1.3 },
    cine: { root: 49, scale: [0, 3, 5, 7, 10], drone: 'deep', bowl: [5, 9], mel: 0, om: 0, pace: 1 },
    town: { root: 55, scale: [0, 2, 4, 7, 9], drone: 'warm', bowl: [9, 16], mel: 0.35, pace: 1.1 },
    deva: { root: 62, scale: [0, 2, 4, 7, 9], drone: 'bright', bowl: [7, 12], mel: 0.45, shimmer: 1, pace: 0.9 },
    human: { root: 50, scale: [0, 1, 4, 5, 7, 8, 11], drone: 'tanpura', bowl: [10, 18], mel: 0.35, pace: 1 },
    asura: { root: 45, scale: [0, 1, 3, 5, 7, 8, 10], drone: 'war', bowl: [12, 20], mel: 0.25, drums: 1, pace: 0.8 },
    animal: { root: 47, scale: [0, 3, 5, 7, 10], drone: 'deep', bowl: [10, 18], mel: 0.3, insects: 1, pace: 1 },
    preta: { root: 44, scale: [0, 1, 5, 6, 8], drone: 'hollow', bowl: [8, 16], mel: 0.2, wind: 1, pace: 1.2 },
    naraka: { root: 38, scale: [0, 1, 4, 6, 7, 10], drone: 'hell', bowl: [9, 16], mel: 0.2, drums: 1, rumble: 1, pace: 0.9 },
    boss: { root: 41, scale: [0, 1, 3, 6, 7, 8], drone: 'war', bowl: [6, 10], mel: 0.3, drums: 2, pace: 0.7 },
    end: { root: 55, scale: [0, 2, 4, 7, 9], drone: 'bright', bowl: [4, 8], mel: 0.5, om: 1, shimmer: 1, pace: 1.2 }
  },
  midi(n) { return 440 * Math.pow(2, (n - 69) / 12); },
  setMusic(mode) {
    if (!this.ctx) { this.pendingMode = mode; return; }
    if (this.mode === mode) return; this.mode = mode;
    // fade out current voices
    const t = this.t();
    for (const v of this.voices) { try { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0.0001, t + 2); v.stop(t + 2.2); } catch (e) { } }
    this.voices = [];
    if (!mode) return;
    const M = this.MODES[mode]; if (!M) return; this.M = M;
    this.startDrone(M, t + 0.1);
    this.nextT = t + 0.5; this.bowlT = t + 1.5; this.omT = t + 3; this.beat = 0;
    if (!this.timer) this.timer = setInterval(() => this.tick(), 200);
  },
  startDrone(M, t) {
    const c = this.ctx; const f = this.midi(M.root - 12);
    const mk = (type, freq, vol, lp, det) => {
      const o = c.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = det || 0;
      const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; fl.Q.value = 1.5;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.08; const lg = c.createGain(); lg.gain.value = lp * 0.45; lfo.connect(lg); lg.connect(fl.frequency);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 3);
      o.connect(fl); fl.connect(g); g.connect(this.music); g.connect(this.revIn);
      o.start(t); lfo.start(t);
      this.voices.push({ g, stop: (tt) => { o.stop(tt); lfo.stop(tt); } });
    };
    const d = M.drone;
    if (d === 'deep') { mk('sawtooth', f, 0.05, 260); mk('sawtooth', f * 1.5, 0.025, 300, 4); mk('sine', f / 2, 0.08, 200); }
    else if (d === 'warm') { mk('triangle', f, 0.07, 500); mk('triangle', f * 1.5, 0.035, 600, 3); mk('sine', f * 2, 0.02, 900); }
    else if (d === 'bright') { mk('triangle', f * 2, 0.045, 1200); mk('sine', f * 3, 0.025, 2000, 5); mk('sine', f, 0.05, 600); }
    else if (d === 'tanpura') { mk('sawtooth', f, 0.035, 700); mk('sawtooth', f * 1.5, 0.02, 800, -5); mk('sawtooth', f * 2, 0.02, 900, 6); }
    else if (d === 'war') { mk('sawtooth', f, 0.05, 350); mk('sawtooth', f * 1.06, 0.02, 350); mk('sine', f / 2, 0.08, 150); }
    else if (d === 'hollow') { mk('sine', f, 0.07, 400); mk('triangle', f * 1.414, 0.02, 500, 8); }
    else if (d === 'hell') { mk('sawtooth', f / 2, 0.07, 220); mk('sawtooth', f * 0.707, 0.035, 260, 9); mk('sine', f / 4, 0.1, 120); }
  },
  tick() {
    if (!this.ctx || !this.M) return; const M = this.M; const now = this.t(); const S = this.music;
    while (this.nextT < now + 0.6) {
      const t = this.nextT; this.beat++;
      if (M.mel && Math.random() < M.mel) {
        const deg = pick(M.scale); const oct = pick([0, 0, 12, 12, 24]); const n = M.root + deg + oct;
        const inst = M.drone === 'hell' || M.drone === 'war' ? 'sawtooth' : 'triangle';
        this.tone(inst, this.midi(n), t, 1.4 * M.pace, 0.035, S, { a: 0.01, lp: inst === 'sawtooth' ? 1200 : 3000, rev: 1 });
        if (Math.random() < 0.3) this.tone('sine', this.midi(n + 12), t + 0.02, 1.6, 0.015, S, { rev: 1 });
      }
      if (M.shimmer && Math.random() < 0.25) this.tone('sine', this.midi(M.root + 36 + pick(M.scale)), t, 2.4, 0.012, S, { a: 0.4, rev: 1 });
      if (M.drums) {
        const pat = M.drums === 2 ? [1, 0, 1, 0, 1, 1, 0, 1] : [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0];
        if (pat[this.beat % pat.length]) this.drum(t, M.drums === 2 ? 0.2 : 0.14, S, M.drums === 2 ? 70 : 80);
      }
      if (M.insects && Math.random() < 0.2) for (let i = 0; i < 6; i++) this.nz(t + i * 0.04, 0.02, 0.012, 'bandpass', 5200 + Math.random() * 800, 12, S);
      if (M.wind && Math.random() < 0.08) this.nz(t, 3, 0.03, 'bandpass', 500, 4, S, { to: 1400, a: 1.2 });
      if (M.rumble && Math.random() < 0.06) this.nz(t, 2.5, 0.08, 'lowpass', 120, 1, S, { a: 0.8 });
      this.nextT += 0.45 * M.pace;
    }
    if (now > this.bowlT) { this.bowl(this.midi(M.root + pick([0, 7, 12])), now + 0.05, 0.05, S, 8); this.bowlT = now + rand(M.bowl[0], M.bowl[1]); }
    if (M.om && now > this.omT) { this.om(now + 0.05, 6, 0.08, S, this.midi(M.root - 12)); this.omT = now + rand(14, 22); }
  }
};
