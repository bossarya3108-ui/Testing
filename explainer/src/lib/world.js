"use strict";

const { createCanvas } = require("canvas");
const { geoNaturalEarth1, geoPath } = require("d3-geo");
const { feature } = require("topojson-client");
const topo = require("world-atlas/land-110m.json");

const theme = require("./theme");
const D = require("./draw");
const { clamp, lerp } = require("./util");

const C = theme.color;
const W = theme.width;
const H = theme.height;

const land = feature(topo, topo.objects.land);
const projection = geoNaturalEarth1().fitExtent(
  [
    [110, 150],
    [W - 110, 900],
  ],
  land
);
const path = geoPath(projection);

function project(lon, lat) {
  return projection([lon, lat]);
}

function buildMap() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");


  // Land silhouette.
  ctx.save();
  ctx.beginPath();
  path.context(ctx)(land);
  const fill = ctx.createLinearGradient(0, 120, 0, 920);
  fill.addColorStop(0, "rgba(18, 48, 84, 0.48)");
  fill.addColorStop(1, "rgba(8, 27, 52, 0.62)");
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(74, 144, 226, 0.20)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // Dot-matrix land texture, clipped to the coastline.
  ctx.save();
  ctx.beginPath();
  path.context(ctx)(land);
  ctx.clip();

  const step = 7;
  for (let y = 120; y < 940; y += step) {
    for (let x = 90; x < W - 90; x += step) {
      const jitter = ((x * 13 + y * 7) % 5) / 30;
      ctx.fillStyle = `rgba(92, 168, 255, ${0.22 + jitter})`;
      ctx.beginPath();
      ctx.arc(x + ((y / step) % 2) * 2.2, y, 1.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Faint latitude/longitude ticks around the frame.
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = "rgba(90, 160, 230, 0.5)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const y = 170 + i * 62;
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.lineTo(72, y);
    ctx.moveTo(W - 72, y);
    ctx.lineTo(W - 64, y);
    ctx.stroke();
  }
  ctx.restore();

  return canvas;
}

const mapCanvas = buildMap();

function drawMap(ctx, opts = {}) {
  const {
    alpha = 1,
    scale = 1,
    cx = W / 2,
    cy = H / 2 + 30,
    focus = null,
    tint = 1,
  } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  let fx = cx;
  let fy = cy;
  if (focus) {
    const p = project(focus[0], focus[1]);
    fx = p[0];
    fy = p[1];
  }
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-fx, -fy);
  ctx.drawImage(mapCanvas, 0, 0);
  if (tint > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha *= 0.25 * tint;
    ctx.fillStyle = "rgba(20, 60, 120, 0.4)";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function arcPoints(p0, p1, bend = 0.18, steps = 40) {
  const mx = (p0[0] + p1[0]) / 2;
  const my = (p0[1] + p1[1]) / 2;
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  // Lift the arc against the direction of travel, always upward on screen.
  const cx = mx - (dy / len) * len * bend * Math.sign(-dy || 1);
  const cy = my - Math.abs(len) * bend - 10;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * cx + t * t * p1[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * cy + t * t * p1[1];
    points.push([x, y]);
  }
  return points;
}

function drawArc(ctx, p0, p1, opts = {}) {
  const {
    color = C.cyan,
    alpha = 1,
    progress = 1,
    bend = 0.18,
    width = 1.5,
    glow = 0.6,
    arrow = false,
  } = opts;
  if (alpha <= 0 || progress <= 0) return null;
  const points = arcPoints(p0, p1, bend);
  const count = Math.max(2, Math.floor(points.length * clamp(progress)));
  const slice = points.slice(0, count);
  D.connection(ctx, slice, {
    color,
    alpha,
    width,
    glow,
    arrow,
    arrowSize: 8,
    baseAlpha: 0.06,
  });
  return slice;
}

function cityNode(ctx, lonLat, opts = {}) {
  const {
    label = "",
    color = C.cyan,
    alpha = 1,
    t = 0,
    phase = 0,
    size = 3.6,
    labelSide = "right",
    sub = "",
    pulse = 1,
  } = opts;
  const [x, y] = project(lonLat[0], lonLat[1]);
  if (alpha <= 0) return { x, y };
  const breathe = 1 + 0.25 * Math.sin(t * 1.6 + phase);
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * breathe, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = D.hexAlpha(color, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, size + 6 + 2 * Math.sin(t * 1.3 + phase), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (label) {
    const align = labelSide === "left" ? "right" : "left";
    const lx = x + (labelSide === "left" ? -14 : 14);
    D.text(ctx, label, lx, y - 3, {
      size: 11,
      family: "mono",
      weight: 500,
      color: C.ink,
      align,
      alpha: alpha * 0.9,
      letterSpacing: 0.8,
    });
    if (sub) {
      D.text(ctx, sub, lx, y + 11, {
        size: 8.5,
        family: "body",
        weight: 500,
        color: C.muted,
        align,
        alpha: alpha * 0.7,
        letterSpacing: 0.6,
      });
    }
  }
  return { x, y };
}

module.exports = {
  project,
  drawMap,
  arcPoints,
  drawArc,
  cityNode,
  mapCanvas,
  land,
  projection,
};
