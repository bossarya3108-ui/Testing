/* ============================================================
   audio.js — synthesizes the 30s soundtrack as a stereo WAV.
   Uplifting cinematic electronic: pads → pulse → full drive →
   riser → logo impact → airy outro. UI/notification SFX inline.
   Usage: node audio.js [out.wav]
   ============================================================ */
'use strict';
const fs = require('fs');

const SR = 44100;
const DUR = 30;
const N = SR * DUR;
const L = new Float64Array(N);
const R = new Float64Array(N);

const TAU = Math.PI * 2;
const sec = s => Math.round(s * SR);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function addMono(buf, i0, v) {
  if (i0 >= 0 && i0 < N) buf[i0] += v;
}

/* sine tone with attack/decay envelope */
function tone(start, dur, freq, gain, { attack = 0.01, decay = 0.3, curve = 3, pan = 0, detune = 0 } = {}) {
  const i0 = sec(start), n = sec(dur);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / Math.max(attack, 1e-4)) * Math.exp(-curve * t / dur);
    const w = Math.sin(TAU * freq * (1 + detune) * t) + (detune ? Math.sin(TAU * freq * (1 - detune) * t) * 0.8 : 0);
    const v = w * env * gain * (detune ? 0.6 : 1);
    const gl = 1 - Math.max(0, pan), gr = 1 + Math.min(0, pan);
    addMono(L, i0 + i, v * gl);
    addMono(R, i0 + i, v * gr);
  }
}

/* band-limited-ish noise burst with decaying envelope */
function noiseBurst(start, dur, gain, { decay = 6, pan = 0, bright = 1 } = {}) {
  const i0 = sec(start), n = sec(dur);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.exp(-decay * t / dur * 6) ;
    const raw = Math.random() * 2 - 1;
    const hp = raw - prev * 0.95 * (2 - bright); // crude highpass tilt
    prev = raw;
    const v = hp * env * gain;
    addMono(L, i0 + i, v * (1 - Math.max(0, pan)));
    addMono(R, i0 + i, v * (1 + Math.min(0, pan)));
  }
}

/* sidechained sub bass following chord roots */
const BASS = [55.0, 43.65, 65.41, 49.0]; // A1 F1 C2 G1
function bassLine() {
  const segLen = 7.5;
  for (let c = 0; c < 4; c++) {
    const t0 = c * segLen;
    const f = BASS[c];
    // pulse with the beat from 8s, drone before
    const i0 = sec(t0), n = sec(segLen);
    for (let i = 0; i < n; i++) {
      const t = t0 + i / SR;
      if (t >= 29.6) break;
      const beat = t >= 8 ? (t - 8) % 0.5 : t % 1;
      const duck = t >= 8 ? Math.exp(-beat * 7) * 0.75 + 0.25 : 1;
      const fade = Math.min(1, (t - t0) / 0.4) * (t > 25.4 ? Math.max(0, 1 - (t - 25.4) / 0.8) : 1);
      addMono(L, i0 + i, Math.sin(TAU * f * (t - t0)) * 0.16 * duck * fade);
      addMono(R, i0 + i, Math.sin(TAU * f * (t - t0)) * 0.16 * duck * fade);
    }
  }
}

/* warm evolving pad */
const CHORDS = [
  [110.00, 164.81, 220.00, 329.63],  // Am
  [ 87.31, 130.81, 174.61, 349.23],  // F
  [130.81, 196.00, 261.63, 392.00],  // C
  [ 98.00, 146.83, 196.00, 392.00],  // G
];
function pad() {
  const segLen = 7.6; // slight overlap for smooth chord changes
  for (let c = 0; c < 4; c++) {
    const t0 = c * 7.5;
    const i0 = sec(t0), n = sec(segLen);
    const notes = CHORDS[c];
    const energy = [0.5, 0.65, 0.85, 1.0][c];
    for (let i = 0; i < n; i++) {
      const t = t0 + i / SR;
      const local = t - t0;
      const env = Math.min(1, local / 1.6) * (local > segLen - 1.2 ? Math.max(0, (segLen - local) / 1.2) : 1);
      if (t > 29.2) break;
      let v = 0;
      for (let k = 0; k < notes.length; k++) {
        const f = notes[k];
        v += Math.sin(TAU * f * 0.999 * local + k) * 0.5
           + Math.sin(TAU * f * 1.001 * local + k * 2.3) * 0.5
           + Math.sin(TAU * f * 2 * local) * 0.12 * energy;
      }
      v *= 0.055 * energy * env;
      // slow stereo shimmer
      addMono(L, i0 + i, v * (1 + 0.18 * Math.sin(TAU * 0.13 * t)));
      addMono(R, i0 + i, v * (1 + 0.18 * Math.sin(TAU * 0.13 * t + 1.6)));
    }
  }
}

/* arpeggio plucks, 16ths, building from 9s */
function arp() {
  const step = 0.125; // 120 bpm 16ths
  for (let s = 0; ; s++) {
    const t = 9.0 + s * step;
    if (t > 25.3) break;
    const c = Math.floor(t / 7.5) % 4;
    const notes = CHORDS[c];
    const idx = [0, 1, 2, 3, 2, 1, 3, 2][s % 8];
    const f = notes[idx] * (s % 16 < 8 ? 2 : 4);
    const rise = clamp((t - 9) / 12, 0, 1);
    const g = 0.028 + 0.05 * rise;
    const pan = (s % 2 ? 0.25 : -0.25);
    tone(t, 0.22, f, g, { attack: 0.004, decay: 0.2, curve: 5, pan });
  }
}

/* kick: enters 8s soft, full from 14s, out at 25.4 */
function kick() {
  for (let b = 0; ; b++) {
    const t = 8 + b * 0.5;
    if (t > 25.3) break;
    const strong = t >= 13.9;
    const i0 = sec(t), n = sec(0.3);
    for (let i = 0; i < n; i++) {
      const tt = i / SR;
      const f = 42 + 78 * Math.exp(-tt * 38);
      const env = Math.exp(-tt * (strong ? 16 : 22));
      const v = Math.sin(TAU * f * tt) * env * (strong ? 0.5 : 0.3);
      addMono(L, i0 + i, v); addMono(R, i0 + i, v);
    }
  }
}

/* offbeat hats from 14s */
function hats() {
  for (let b = 0; ; b++) {
    const t = 14.25 + b * 0.25;
    if (t > 25.2) break;
    if (b % 2 === 0) continue; // offbeats only
    noiseBurst(t, 0.05, 0.05, { decay: 9, bright: 1.6, pan: (b % 4 ? 0.3 : -0.3) });
  }
}

/* transition whooshes */
function whoosh(t) {
  noiseBurst(t - 0.35, 0.7, 0.22, { decay: 2.2, bright: 1.2 });
  // tonal sweep
  const i0 = sec(t - 0.3), n = sec(0.6);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const f = 300 + 1400 * (tt / 0.6);
    const env = Math.sin(Math.PI * tt / 0.6) ** 2;
    const v = Math.sin(TAU * f * tt) * env * 0.05;
    addMono(L, i0 + i, v); addMono(R, i0 + i, v);
  }
}

/* riser into the logo reveal (24.2 → 26.0) */
function riser() {
  const t0 = 24.2, dur = 1.8;
  const i0 = sec(t0), n = sec(dur);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const tt = i / SR;
    const raw = Math.random() * 2 - 1;
    const hp = raw - prev; prev = raw;
    const env = p * p * 0.4;
    addMono(L, i0 + i, hp * env * 0.55);
    addMono(R, i0 + i, hp * env * 0.55);
    // rising tonal sheen
    const f = 220 * Math.pow(2, p * 2.5);
    const v = Math.sin(TAU * f * tt) * p * p * 0.06;
    addMono(L, i0 + i, v); addMono(R, i0 + i, v);
  }
}

/* impact at logo reveal (26.0) + shimmer */
function impact() {
  const i0 = sec(26.0), n = sec(2.2);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const f = 48 + 40 * Math.exp(-tt * 9);
    const env = Math.exp(-tt * 2.6);
    const v = Math.sin(TAU * f * tt) * env * 0.5;
    addMono(L, i0 + i, v); addMono(R, i0 + i, v);
  }
  // shimmer cluster
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
    tone(26.05 + i * 0.06, 1.8, f, 0.035, { attack: 0.01, decay: 1.4, curve: 2, pan: (i % 2 ? 0.3 : -0.3) });
  });
}

/* notification pop */
function pop(t, f) {
  tone(t, 0.14, f, 0.12, { attack: 0.004, decay: 0.35, curve: 4, pan: 0.2 });
  tone(t, 0.1, f * 1.5, 0.05, { attack: 0.004, decay: 0.5, curve: 5, pan: -0.2 });
}

/* UI tick */
function tick(t) {
  noiseBurst(t, 0.03, 0.1, { decay: 10, bright: 1.8 });
}

/* ---------- arrange ---------- */
pad();
bassLine();
arp();
kick();
hats();

whoosh(4); whoosh(8); whoosh(14); whoosh(21);
riser();
impact();

// scene 2: accumulating DMs
pop(5.25, 1318.5); pop(5.95, 1174.7); pop(6.55, 1396.9); pop(7.15, 1568);
// scene 4: UI interactions
tick(14.45); tick(15.05);
tick(15.95); tick(16.05); tick(16.15); tick(16.25);           // AI typing
tone(17.55, 0.5, 1318.5, 0.09, { attack: 0.005, decay: 0.5, curve: 4, pan: 0.15 }); // confirm
tone(17.7, 0.6, 1760, 0.09, { attack: 0.005, decay: 0.5, curve: 4, pan: -0.15 });
pop(19.45, 1568);                                              // reminder
// scene 5: soft node pulses
pop(21.6, 987.8); pop(22.6, 1174.7); pop(23.6, 987.8);
// outro pad swell (A minor add9 over the final chord region)
[220, 261.63, 329.63, 493.88].forEach((f, i) => {
  tone(26.2, 3.6, f, 0.05, { attack: 1.2, decay: 0.35, curve: 1, pan: (i % 2 ? 0.3 : -0.3) });
});
tone(27.6, 2.2, 880, 0.05, { attack: 0.02, decay: 0.5, curve: 2, pan: 0.1 }); // final chime

/* ---------- master: soft clip + normalize ---------- */
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.4);
  R[i] = Math.tanh(R[i] * 1.4);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.85 / peak;
for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }

/* ---------- write WAV ---------- */
const out = process.argv[2] || '/tmp/reel-audio.wav';
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(clamp(L[i], -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(clamp(R[i], -1, 1) * 32767), 46 + i * 4);
}
fs.writeFileSync(out, buf);
console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + 'MB');
