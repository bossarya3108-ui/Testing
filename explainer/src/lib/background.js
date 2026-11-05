"use strict";

const { createCanvas } = require("canvas");
const theme = require("./theme");
const { clamp, lerp, rng, smooth } = require("./util");
const D = require("./draw");

const C = theme.color;
const F = theme.fonts;
const W = theme.width;
const H = theme.height;

/**
 * Static backdrop: layered navy gradients, a technical grid, faint bokeh and a
 * vignette. Baked once so the per-frame cost stays low.
 */
function buildBackdrop() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#02050b");
  base.addColorStop(0.32, "#04101f");
  base.addColorStop(0.62, "#061629");
  base.addColorStop(1, "#02060d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Broad colour washes.
  const washes = [
    [W * 0.18, H * 0.05, 880, "rgba(38, 109, 255, 0.16)"],
    [W * 0.88, H * 0.78, 760, "rgba(20, 181, 224, 0.075)"],
    [W * 0.62, H * 0.08, 620, "rgba(63, 98, 255, 0.07)"],
    [W * 0.06, H * 0.9, 520, "rgba(28, 78, 150, 0.09)"],
  ];
  for (const [x, y, r, color] of washes) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Fine engineering grid.
  ctx.save();
  ctx.strokeStyle = "rgba(86, 145, 220, 0.045)";
  ctx.lineWidth = 1;
  for (let x = 40; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 80);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }
  for (let y = 80; y < H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(100, 170, 255, 0.07)";
  for (let x = 40; x < W; x += 160) {
    for (let y = 80; y < H; y += 160) {
      ctx.fillStyle = "rgba(110, 180, 255, 0.20)";
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  ctx.restore();

  // Soft bokeh.
  const rand = rng(20260418);
  for (let i = 0; i < 26; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 2 + rand() * 9;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(120, 200, 255, ${0.05 + rand() * 0.07})`);
    g.addColorStop(1, "rgba(120, 200, 255, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette.
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.92);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(0.72, "rgba(0,0,0,0.22)");
  vg.addColorStop(1, "rgba(0,0,0,0.66)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  return canvas;
}

function buildGlowTexture() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(70, 150, 255, 0.28)");
  g.addColorStop(0.5, "rgba(40, 110, 220, 0.09)");
  g.addColorStop(1, "rgba(20, 60, 140, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

const backdrop = buildBackdrop();
const glowTexture = buildGlowTexture();

function drawParticles(ctx, t, opts = {}) {
  const { count = 42, alpha = 1, seed = 7, speed = 7 } = opts;
  const rand = rng(seed);
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let i = 0; i < count; i += 1) {
    const bx = rand() * W;
    const by = rand() * H;
    const phase = rand() * Math.PI * 2;
    const drift = 10 + rand() * 26;
    const size = 0.8 + rand() * 1.8;
    const x = bx + Math.sin(t * 0.13 + phase) * drift;
    const y = ((by - t * speed * (0.4 + rand())) % (H + 60)) + 30;
    const twinkle = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.6 + phase));
    ctx.fillStyle = `rgba(120, 195, 255, ${0.10 + twinkle * 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBackdrop(ctx, t, opts = {}) {
  const { particles = 42, particleAlpha = 1, warmth = 0 } = opts;
  ctx.drawImage(backdrop, 0, 0);
  if (warmth > 0) {
    ctx.save();
    ctx.globalAlpha = warmth * 0.5;
    const g = ctx.createRadialGradient(W * 0.5, H * 0.6, 0, W * 0.5, H * 0.6, 800);
    g.addColorStop(0, "rgba(255, 120, 60, 0.08)");
    g.addColorStop(1, "rgba(255, 120, 60, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  drawParticles(ctx, t, { count: particles, alpha: particleAlpha });
}

function drawGlow(ctx, x, y, size, alpha = 1, tint = "blue") {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.globalCompositeOperation = "lighter";
  if (tint === "blue") {
    ctx.drawImage(glowTexture, x - size / 2, y - size / 2, size, size);
  } else {
    ctx.globalAlpha *= 0.6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
    const color = tint === "red" ? "255, 92, 116" : tint === "green" ? "57, 230, 161" : "53, 224, 255";
    g.addColorStop(0, `rgba(${color}, 0.20)`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  ctx.restore();
}

function drawHud(ctx, scene, globalTime, totalDuration, opts = {}) {
  const { showProgress = true } = opts;
  ctx.save();

  if (showProgress) {
    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.fillRect(0, 0, W, 2);
    const p = clamp(globalTime / totalDuration);
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "rgba(47,123,255,0.9)");
    g.addColorStop(0.55, "rgba(53,224,255,0.9)");
    g.addColorStop(1, "rgba(57,230,161,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W * p, 2);
    ctx.fillStyle = "rgba(53,224,255,0.8)";
    ctx.fillRect(W * p - 1, 0, 2, 2);
  }

  // Monogram.
  const mx = 76;
  const my = 62;
  ctx.save();
  D.roundRectPath(ctx, mx - 19, my - 19, 38, 38, 10);
  const bg = ctx.createLinearGradient(mx - 19, my - 19, mx + 19, my + 19);
  bg.addColorStop(0, "rgba(47,123,255,0.22)");
  bg.addColorStop(1, "rgba(53,224,255,0.07)");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "rgba(90,162,255,0.45)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.restore();
  D.text(ctx, "G", mx, my + 1, {
    size: 21,
    family: "display",
    weight: 700,
    color: C.ink,
    align: "center",
    baseline: "middle",
  });
  D.dot(ctx, mx + 12, my + 12, 2.2, C.cyan, 0.9);

  D.text(ctx, "GPP", mx + 32, my - 7, {
    size: 12,
    weight: 600,
    family: "mono",
    color: C.ink,
    letterSpacing: 2,
    alpha: 0.95,
  });
  D.text(ctx, "GLOBAL PAYMENTS PLATFORM", mx + 32, my + 9, {
    size: 8.5,
    weight: 500,
    family: "body",
    color: C.muted,
    letterSpacing: 1.8,
    alpha: 0.8,
  });

  // Section marker.
  const section = scene.section || "";
  const label = `${String(scene.id).padStart(2, "0")} / ${String(7).padStart(2, "0")}`;
  D.text(ctx, label, W - 76, my - 7, {
    size: 10,
    family: "mono",
    weight: 600,
    color: C.cyan,
    align: "right",
    letterSpacing: 1.6,
    alpha: 0.8,
  });
  D.text(ctx, section, W - 76, my + 9, {
    size: 8.5,
    weight: 500,
    color: C.muted,
    align: "right",
    letterSpacing: 1.9,
    alpha: 0.72,
  });

  // Footer rule + caption.
  ctx.strokeStyle = "rgba(96,150,220,0.13)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(76, H - 44);
  ctx.lineTo(W - 76, H - 44);
  ctx.stroke();
  D.text(ctx, "CONCEPTUAL EXPLAINER", 76, H - 26, {
    size: 8.5,
    family: "body",
    weight: 500,
    color: C.dim,
    letterSpacing: 1.8,
    alpha: 0.65,
  });
  D.text(ctx, "PAYMENTS BUSINESS ANALYSIS", W - 76, H - 26, {
    size: 8.5,
    family: "body",
    weight: 500,
    color: C.dim,
    align: "right",
    letterSpacing: 1.8,
    alpha: 0.65,
  });

  ctx.restore();
}

function drawSceneChrome(ctx, t, duration, opts = {}) {
  const { fadeIn = 0.55, fadeOut = 0.45, color = "rgba(2,5,11,1)" } = opts;
  if (t < fadeIn) {
    ctx.save();
    ctx.globalAlpha = 1 - smooth(t / fadeIn);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  const out = duration - t;
  if (out < fadeOut) {
    ctx.save();
    ctx.globalAlpha = 1 - smooth(out / fadeOut);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function drawSceneTitle(ctx, opts) {
  const { eyebrow, title, sub = "", x = 76, y = 128, alpha = 1, color = C.cyan, size = 46 } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  if (eyebrow) {
    D.text(ctx, eyebrow, x, y - 40, {
      size: 11,
      weight: 600,
      color,
      letterSpacing: 3,
      alpha: 0.9,
    });
    D.rule(ctx, x, y - 26, x + 34, y - 26, D.hexAlpha(color, 0.7), 0.9, 2);
  }
  D.text(ctx, title, x, y + 18, {
    size,
    family: "display",
    weight: 600,
    color: C.ink,
    letterSpacing: -0.8,
  });
  if (sub) {
    D.text(ctx, sub, x, y + 56, {
      size: 17,
      weight: 400,
      color: C.muted,
      letterSpacing: 0.1,
      alpha: 0.92,
    });
  }
  ctx.restore();
}

module.exports = {
  drawBackdrop,
  drawParticles,
  drawGlow,
  drawHud,
  drawSceneChrome,
  drawSceneTitle,
};
