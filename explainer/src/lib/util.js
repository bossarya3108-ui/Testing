"use strict";

const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (t, start, end) => clamp((t - start) / (end - start));
const smooth = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInCubic = (t) => Math.pow(clamp(t), 3);
const easeOutQuint = (t) => 1 - Math.pow(1 - clamp(t), 5);
const easeInOutCubic = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOutBack = (t, overshoot = 1.25) => {
  const x = clamp(t) - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
};
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));

// Smooth 0 -> 1 -> 0 pulse, useful for highlights.
const pulse = (t, start, attack = 0.25, hold = 0.5, release = 0.6) => {
  if (t < start) return 0;
  const dt = t - start;
  if (dt < attack) return smooth(dt / attack);
  if (dt < attack + hold) return 1;
  if (dt < attack + hold + release) return 1 - smooth((dt - attack - hold) / release);
  return 0;
};

// Deterministic pseudo-random generator so every render is identical.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function markerTime(scene, name, fallback) {
  const m = scene.markers && scene.markers[name];
  if (m === null || m === undefined) return fallback;
  return scene.leadIn + m;
}

// Ease a numeric value between keyframes: [[time, value], ...]
function keyframes(t, frames) {
  if (!frames.length) return 0;
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i += 1) {
    if (t <= frames[i][0]) {
      const [t0, v0] = frames[i - 1];
      const [t1, v1] = frames[i];
      return lerp(v0, v1, easeInOutCubic((t - t0) / (t1 - t0)));
    }
  }
  return frames[frames.length - 1][1];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

module.exports = {
  clamp,
  lerp,
  inv,
  smooth,
  easeOutCubic,
  easeInCubic,
  easeOutQuint,
  easeInOutCubic,
  easeOutBack,
  easeOutExpo,
  pulse,
  rng,
  markerTime,
  keyframes,
  pad2,
};
