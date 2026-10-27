// Procedural electronic score for the reel. Pure JavaScript (no Web Audio), so
// the browser preview and the offline WAV/MP4 export render the same audio.
//
// Structure (120 BPM, 2s bars):
//   0.0 –  5.6  intriguing rhythmic intro
//   5.6 – 17.2  groove enters, energy builds with the website
//  17.2 – 35.2  main groove under the product demo
//  35.2 – 47.6  lift and snare roll into the drop
//  47.6 – 52.6  drop: the complete digital experience
//  52.6 – 58.0  stripped outro, logo accent and hold
import { DURATION, BEAT, BAR, CUES, SFX } from '../timeline.js';

const DEFAULT_SR = 44100;
const TWO_PI = Math.PI * 2;

const midi = (note) => 440 * Math.pow(2, (note - 69) / 12);

function seeded(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function panGains(pan) {
  const angle = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
}

const CHORDS = {
  Am: { root: 45, notes: [57, 60, 64, 69] },
  F: { root: 41, notes: [53, 57, 60, 65] },
  C: { root: 48, notes: [55, 60, 64, 67] },
  G: { root: 43, notes: [55, 59, 62, 67] }
};

const PROGRESSION = ['Am', 'F', 'C', 'G'];

function chordAt(bar) {
  if (bar < 3) return CHORDS[bar === 0 ? 'Am' : 'F'];
  if (bar >= 23 && bar <= 26) {
    // The drop lifts through F – C – G – Am.
    return CHORDS[['F', 'C', 'G', 'Am'][(bar - 23) % 4]];
  }
  return CHORDS[PROGRESSION[(bar - 3) % 4]];
}

export function renderScore(options = {}) {
  const sampleRate = options.sampleRate || DEFAULT_SR;
  const duration = options.duration || DURATION;
  const total = Math.ceil(duration * sampleRate);

  const ctx = {
    sampleRate,
    total,
    duration,
    left: new Float32Array(total),
    right: new Float32Array(total),
    sendLeft: new Float32Array(total),
    sendRight: new Float32Array(total),
    rand: seeded(20260314)
  };

  compose(ctx);
  reverb(ctx);
  return finalize(ctx);
}

function write(ctx, index, value, pan = 0, send = 0.12) {
  if (index < 0 || index >= ctx.total) return;
  const [lg, rg] = panGains(pan);
  ctx.left[index] += value * lg;
  ctx.right[index] += value * rg;
  if (send > 0) {
    ctx.sendLeft[index] += value * lg * send;
    ctx.sendRight[index] += value * rg * send;
  }
}

function sectionAt(t) {
  if (t < 5.6) return 'intro';
  if (t < 17.2) return 'groove';
  if (t < 35.2) return 'main';
  if (t < 47.3) return 'lift';
  if (t < 52.6) return 'drop';
  return 'outro';
}

const PAD_GAIN = { intro: 0.07, groove: 0.075, main: 0.095, lift: 0.1, drop: 0.135, outro: 0.105 };
const PAD_CUTOFF = { intro: 650, groove: 1000, main: 1600, lift: 2200, drop: 3000, outro: 850 };
const ARP_GAIN = { intro: 0.045, groove: 0.048, main: 0.058, lift: 0.07, drop: 0.088, outro: 0.035 };

function compose(ctx) {
  const { duration } = ctx;

  // ---- Pads, bass and arpeggios, bar by bar -------------------------------
  const bars = Math.ceil(duration / BAR);
  for (let bar = 0; bar < bars; bar += 1) {
    const t0 = bar * BAR;
    if (t0 >= duration) break;
    const section = sectionAt(t0);
    const chord = chordAt(bar);
    const padDur = Math.min(BAR * 1.02, duration - t0);
    pad(ctx, t0, padDur, chord.notes, PAD_GAIN[section], PAD_CUTOFF[section]);

    if (t0 >= 5.4 && t0 < 52.6) {
      const bassGain = { groove: 0.15, main: 0.19, lift: 0.2, drop: 0.27 }[section] || 0.16;
      bassBar(ctx, t0, chord.root, bassGain, section === 'drop');
    }
    if (section === 'drop') {
      subNote(ctx, t0, midi(chord.root - 12), BAR, 0.16);
    }
    if (section === 'outro' && t0 < 57.2) {
      subNote(ctx, t0, midi(chord.root - 12), BAR, 0.06);
    }

    // Arpeggio pattern: spare in the intro and outro, dense in the drop.
    const dense = section === 'drop' || section === 'lift' || section === 'main';
    const steps = dense ? 16 : 8;
    const stepDur = BAR / steps;
    const gain = ARP_GAIN[section];
    if (section === 'outro' && t0 > 57) continue;
    for (let step = 0; step < steps; step += 1) {
      const order = [0, 2, 1, 3, 2, 1, 3, 0];
      const degree = order[step % order.length];
      const octave = step % 8 >= 4 ? 12 : 0;
      const note = chord.notes[degree] + octave + (section === 'drop' ? 12 : 0);
      const t = t0 + step * stepDur;
      if (t > duration) break;
      pluck(ctx, t, midi(note), gain * (step % 4 === 0 ? 1.15 : 0.82), 0.2, step % 2 ? 0.35 : -0.35, section === 'drop' ? 0.45 : 0.3);
    }
  }

  // ---- Drums -------------------------------------------------------------
  for (let beat = 0; beat * BEAT < duration; beat += 1) {
    const t = beat * BEAT;
    const section = sectionAt(t);
    const inBar = beat % 4;

    if (section === 'outro') continue;
    if (t > 47.3 && t < 47.62) continue; // breath before the drop

    if (section === 'intro') {
      if (t >= 2.0 && (inBar === 0 || inBar === 2)) kick(ctx, t, 0.42);
      if (t >= 3.2) hat(ctx, t, 0.045, false);
      continue;
    }

    const kickGain = { groove: 0.7, main: 0.82, lift: 0.9, drop: 1.0 }[section] || 0.8;
    kick(ctx, t, kickGain);

    if (inBar === 1 || inBar === 3) {
      clap(ctx, t, { groove: 0.16, main: 0.2, lift: 0.23, drop: 0.3 }[section] || 0.2);
    }

    const hatGain = { groove: 0.06, main: 0.08, lift: 0.09, drop: 0.12 }[section] || 0.08;
    hat(ctx, t, hatGain, false);
    hat(ctx, t + BEAT / 2, hatGain * 0.65, true);
    if (section === 'lift' || section === 'drop') {
      hat(ctx, t + BEAT / 4, 0.045, false);
      hat(ctx, t + (BEAT * 3) / 4, 0.045, false);
    }
  }

  // Snare roll into the drop.
  for (let t = 45.7; t < 47.35; t += t < 46.6 ? 0.25 : 0.125) {
    snare(ctx, t, 0.06 + (t - 45.7) * 0.1, 0.2);
  }

  // ---- Hook --------------------------------------------------------------
  const hook = [
    { beat: 1, note: 69, len: 0.45 },
    { beat: 1.5, note: 72, len: 0.4 },
    { beat: 2, note: 76, len: 0.7 },
    { beat: 3, note: 74, len: 0.45 },
    { beat: 3.5, note: 72, len: 0.6 }
  ];
  hook.forEach(({ beat, note, len }) => {
    pluck(ctx, beat * BEAT, midi(note), 0.1, len, -0.2, 0.35);
  });
  hook.forEach(({ beat, note, len }) => {
    const t = CUES.drop + 1.0 + beat * BEAT;
    if (t < 52.4) pluck(ctx, t, midi(note + 12), 0.1, len, 0.25, 0.45);
  });
  // A last, answering phrase over the logo.
  [69, 72, 76].forEach((note, index) => {
    pluck(ctx, CUES.logo + 0.55 + index * 0.24, midi(note), 0.075, 0.5, index % 2 ? 0.2 : -0.2, 0.5);
  });

  // ---- Transitions -------------------------------------------------------
  riser(ctx, 0.1, 2.4, 0.16);
  riser(ctx, 11.3, 5.6, 0.16);
  riser(ctx, 44.9, 2.55, 0.13);
  riser(ctx, 52.55, 0.75, 0.1);

  crash(ctx, 5.6, 0.14);
  crash(ctx, 17.2, 0.1);
  crash(ctx, CUES.drop, 0.2);
  crash(ctx, CUES.logo, 0.06);

  impact(ctx, CUES.drop, 0.55);
  impact(ctx, CUES.logo, 0.24);

  // ---- Interface sound design -------------------------------------------
  SFX.forEach((event) => {
    switch (event.kind) {
      case 'tap':
        tap(ctx, event.t, event.gain);
        break;
      case 'swipe':
        swipe(ctx, event.t, event.gain);
        break;
      case 'whoosh':
        whoosh(ctx, event.t, event.gain);
        break;
      case 'chime':
        chime(ctx, event.t, event.gain);
        break;
      case 'notify':
        notify(ctx, event.t, event.gain);
        break;
      case 'pop':
        pop(ctx, event.t, event.gain);
        break;
      case 'riser':
        riser(ctx, event.t, event.length || 1.6, event.gain);
        break;
      case 'impact':
        impact(ctx, event.t, event.gain);
        break;
      default:
        break;
    }
  });
}

// ---- Instruments ---------------------------------------------------------

function pad(ctx, t0, dur, notes, gain, cutoff) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(dur * sr);
  const attack = 0.3 * sr;
  const release = 0.5 * sr;
  const voices = [];
  notes.forEach((note, index) => {
    [-0.004, 0, 0.004].forEach((detune, d) => {
      voices.push({ phase: (index * 0.13 + d * 0.31) % 1, inc: (midi(note) * (1 + detune)) / sr, pan: (index / notes.length - 0.5) * 0.7 });
    });
  });
  const a = 1 - Math.exp((-TWO_PI * cutoff) / sr);
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    if (start + i >= ctx.total) break;
    const attackGain = Math.min(1, i / attack);
    const releaseGain = Math.min(1, (length - i) / release);
    const env = Math.min(attackGain, releaseGain);
    const clock = (start + i) / sr;
    const duck = 1 - 0.42 * Math.exp(-((clock % BEAT) * 7));
    let sum = 0;
    for (let v = 0; v < voices.length; v += 1) {
      const voice = voices[v];
      voice.phase += voice.inc;
      if (voice.phase > 1) voice.phase -= 1;
      sum += (voice.phase * 2 - 1) * 0.33;
    }
    lp += (sum - lp) * a;
    const value = lp * env * gain * duck;
    write(ctx, start + i, value, 0, 0.35);
  }
}

function bassBar(ctx, t0, root, gain, drop) {
  const pattern = drop
    ? [0, 0, 12, 0, 0, 12, 0, 7, 0, 0, 12, 0, 0, 12, 0, 7]
    : [0, 0, 12, 0, 7, 0, 12, 0];
  const step = (drop ? BAR : BAR) / pattern.length;
  pattern.forEach((offset, index) => {
    const t = t0 + index * step;
    if (t >= 52.6) return;
    bassNote(ctx, t, midi(root + offset), drop ? 0.13 : 0.2, gain);
  });
}

function bassNote(ctx, t0, freq, dur, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(dur * sr);
  let phase = 0;
  let phase2 = 0;
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const env = Math.exp(-tt * 6) * Math.min(1, i / (0.004 * sr));
    phase += (freq * (1 + 0.006 * Math.sin(tt * 6))) / sr;
    phase2 += freq / 2 / sr;
    if (phase > 1) phase -= 1;
    if (phase2 > 1) phase2 -= 1;
    const saw = phase * 2 - 1;
    const sub = Math.sin(phase2 * TWO_PI);
    const cutoff = 220 + 1200 * Math.exp(-tt * 10);
    const a = 1 - Math.exp((-TWO_PI * cutoff) / sr);
    lp += (saw - lp) * a;
    write(ctx, start + i, (lp * 0.7 + sub * 0.5) * env * gain, 0, 0.05);
  }
}

function subNote(ctx, t0, freq, dur, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(dur * sr);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    phase += freq / sr;
    if (phase > 1) phase -= 1;
    const env = Math.min(1, i / (0.03 * sr)) * Math.min(1, (length - i) / (0.12 * sr));
    write(ctx, start + i, Math.sin(phase * TWO_PI) * env * gain, 0, 0.03);
  }
}

function pluck(ctx, t0, freq, gain, decay = 0.25, pan = 0, send = 0.3) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(Math.min(1.4, decay * 4) * sr);
  let phase = 0;
  let phase2 = 0;
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const env = Math.exp(-tt / decay) * Math.min(1, i / (0.002 * sr));
    phase += freq / sr;
    phase2 += (freq * 2.002) / sr;
    if (phase > 1) phase -= 1;
    if (phase2 > 1) phase2 -= 1;
    const tri = 1 - 4 * Math.abs(phase - 0.5);
    const square = phase2 < 0.5 ? 1 : -1;
    const a = 1 - Math.exp((-TWO_PI * (900 + 3000 * Math.exp(-tt * 8))) / sr);
    lp += (tri * 0.7 + square * 0.18 - lp) * a;
    write(ctx, start + i, lp * env * gain, pan, send);
  }
}

function kick(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.36 * sr);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const freq = 44 + 120 * Math.exp(-tt * 26);
    phase += freq / sr;
    if (phase > 1) phase -= 1;
    let value = Math.sin(phase * TWO_PI) * Math.exp(-tt * 7.5);
    if (tt < 0.007) value += (ctx.rand() * 2 - 1) * 0.35 * (1 - tt / 0.007);
    write(ctx, start + i, value * gain, 0, 0.02);
  }
}

function clap(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.22 * sr);
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const envelope =
      Math.exp(-tt * 26) +
      0.6 * Math.exp(-Math.abs(tt - 0.012) * 220) +
      0.4 * Math.exp(-Math.abs(tt - 0.024) * 220);
    const noise = ctx.rand() * 2 - 1;
    lp += (noise - lp) * 0.35;
    const band = noise - lp * 0.6;
    write(ctx, start + i, band * envelope * gain, 0.08, 0.35);
  }
}

function hat(ctx, t0, gain, open) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor((open ? 0.12 : 0.045) * sr);
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const noise = ctx.rand() * 2 - 1;
    const high = noise - previous;
    previous = noise;
    write(ctx, start + i, high * Math.exp(-tt * (open ? 40 : 110)) * gain, 0.18, 0.04);
  }
}

function snare(ctx, t0, gain, toneAmount = 0.3) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.18 * sr);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    phase += 185 / sr;
    const noise = ctx.rand() * 2 - 1;
    const value = (noise * 0.8 + Math.sin(phase * TWO_PI) * toneAmount) * Math.exp(-tt * 22);
    write(ctx, start + i, value * gain, -0.05, 0.3);
  }
}

function crash(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(1.6 * sr);
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const noise = ctx.rand() * 2 - 1;
    lp += (noise - lp) * 0.6;
    const high = noise - lp;
    write(ctx, start + i, high * Math.exp(-tt * 3.2) * gain, 0, 0.5);
  }
}

function riser(ctx, t0, dur, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(dur * sr);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const p = tt / dur;
    const noise = ctx.rand() * 2 - 1;
    const cutoff = 300 + p * p * 7000;
    const a = 1 - Math.exp((-TWO_PI * cutoff) / sr);
    lp += (noise - lp) * a;
    phase += (180 + p * p * 900) / sr;
    if (phase > 1) phase -= 1;
    const env = Math.pow(p, 1.4) * (1 - Math.pow(p, 8));
    write(ctx, start + i, (lp * 0.55 + Math.sin(phase * TWO_PI) * 0.12) * env * gain, 0, 0.4);
  }
}

function impact(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(1.4 * sr);
  let phase = 0;
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    phase += (36 + 90 * Math.exp(-tt * 5)) / sr;
    if (phase > 1) phase -= 1;
    const noise = ctx.rand() * 2 - 1;
    lp += (noise - lp) * 0.08;
    const value = Math.sin(phase * TWO_PI) * Math.exp(-tt * 2.4) + lp * Math.exp(-tt * 9) * 0.5;
    write(ctx, start + i, value * gain, 0, 0.55);
  }
}

// ---- Interface sounds ----------------------------------------------------

function tap(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.05 * sr);
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const env = Math.exp(-tt * 90);
    const value = Math.sin(TWO_PI * 1760 * tt) * 0.6 + Math.sin(TWO_PI * 2640 * tt) * 0.25;
    write(ctx, start + i, value * env * gain, 0.1, 0.05);
  }
}

function swipe(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.26 * sr);
  let lp = 0;
  let lp2 = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const p = tt / 0.26;
    const noise = ctx.rand() * 2 - 1;
    const cutoff = 900 + Math.sin(p * Math.PI) * 2600;
    const a = 1 - Math.exp((-TWO_PI * cutoff) / sr);
    lp += (noise - lp) * a;
    lp2 += (lp - lp2) * 0.2;
    const env = Math.sin(p * Math.PI) * (1 - p * 0.4);
    write(ctx, start + i, (lp - lp2) * env * gain, Math.sin(p * Math.PI) * 0.4, 0.15);
  }
}

function whoosh(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.55 * sr);
  let lp = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const p = tt / 0.55;
    const noise = ctx.rand() * 2 - 1;
    const cutoff = 400 + Math.pow(Math.sin(p * Math.PI), 2) * 4200;
    const a = 1 - Math.exp((-TWO_PI * cutoff) / sr);
    lp += (noise - lp) * a;
    const env = Math.pow(Math.sin(p * Math.PI), 1.5);
    write(ctx, start + i, lp * env * gain, p * 0.8 - 0.3, 0.3);
  }
}

function chime(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.9 * sr);
  const partials = [
    { f: 1318.5, a: 0.5, d: 2.6 },
    { f: 1975.5, a: 0.32, d: 3.1 },
    { f: 2637, a: 0.18, d: 4.2 }
  ];
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    let value = 0;
    for (const partial of partials) {
      value += Math.sin(TWO_PI * partial.f * tt) * partial.a * Math.exp(-tt * partial.d);
    }
    write(ctx, start + i, value * gain * 0.6, 0.2, 0.55);
  }
}

function notify(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const notes = [
    { t: 0, f: 987.8 },
    { t: 0.09, f: 1318.5 }
  ];
  notes.forEach((note) => {
    const start = Math.floor((t0 + note.t) * sr);
    const length = Math.floor(0.55 * sr);
    for (let i = 0; i < length; i += 1) {
      const tt = i / sr;
      const env = Math.exp(-tt * 5) * Math.min(1, i / (0.004 * sr));
      const value = Math.sin(TWO_PI * note.f * tt) + Math.sin(TWO_PI * note.f * 2 * tt) * 0.3;
      write(ctx, start + i, value * env * gain * 0.35, 0.15, 0.5);
    }
  });
}

function pop(ctx, t0, gain) {
  const { sampleRate: sr } = ctx;
  const start = Math.floor(t0 * sr);
  const length = Math.floor(0.09 * sr);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const tt = i / sr;
    const p = tt / 0.09;
    const freq = 420 + p * 520;
    phase += freq / sr;
    if (phase > 1) phase -= 1;
    write(ctx, start + i, Math.sin(phase * TWO_PI) * Math.exp(-p * 6) * gain * 0.5, 0.1, 0.1);
  }
}

// ---- Effects and master --------------------------------------------------

function reverb(ctx) {
  const { sampleRate: sr, total } = ctx;
  // Four combs and two all-passes per channel: a small, bright plate for the
  // arpeggios, chimes and impacts.
  const combs = [0.0297, 0.0371, 0.0411, 0.0437];
  const feedback = 0.72;
  const damp = 0.35;

  for (const [buffer, other] of [
    [ctx.sendLeft, ctx.left],
    [ctx.sendRight, ctx.right]
  ]) {
    for (const delayTime of combs) {
      const delay = Math.max(1, Math.floor(delayTime * sr));
      const comb = new Float32Array(total);
      let store = 0;
      for (let i = 0; i < total; i += 1) {
        const delayed = i >= delay ? comb[i - delay] : 0;
        store = delayed * (1 - damp) + store * damp;
        comb[i] = buffer[i] + store * feedback;
      }
      for (let i = 0; i < total; i += 1) other[i] += comb[i] * 0.18;
    }
  }

  const allpass = [0.005, 0.0017];
  for (const [buffer] of [
    [ctx.sendLeft],
    [ctx.sendRight]
  ]) {
    for (const delayTime of allpass) {
      const delay = Math.max(1, Math.floor(delayTime * sr));
      for (let i = delay; i < total; i += 1) {
        const delayed = buffer[i - delay];
        const value = -buffer[i] * 0.5 + delayed;
        buffer[i] = buffer[i] * 0.5 + delayed * 0.5;
        buffer[i - delay] = value;
      }
    }
  }
}

function finalize(ctx) {
  const { left, right, total, sampleRate } = ctx;
  const fadeIn = Math.floor(0.03 * sampleRate);
  const fadeOut = Math.floor(1.1 * sampleRate);
  let peak = 0;

  for (let i = 0; i < total; i += 1) {
    let l = Math.tanh(left[i] * 1.15);
    let r = Math.tanh(right[i] * 1.15);
    const inGain = Math.min(1, i / fadeIn);
    const outGain = Math.min(1, (total - i) / fadeOut);
    l *= inGain * outGain;
    r *= inGain * outGain;
    left[i] = l;
    right[i] = r;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
  }

  // Leave true-peak headroom for AAC encoding.
  if (peak > 0.82) {
    const scale = 0.82 / peak;
    for (let i = 0; i < total; i += 1) {
      left[i] *= scale;
      right[i] *= scale;
    }
    peak = 0.82;
  }

  return { left, right, sampleRate, duration: total / sampleRate, peak };
}

// 16-bit PCM WAV, used by the offline renderer.
export function encodeWav(score) {
  const { left, right, sampleRate } = score;
  const frames = left.length;
  const bytes = 44 + frames * 4;
  const buffer = Buffer.alloc(bytes);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(bytes - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(frames * 4, 40);
  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))), offset);
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))), offset + 2);
    offset += 4;
  }
  return buffer;
}
