"use strict";

const theme = require("./theme");
const D = require("./draw");
const { clamp, smooth } = require("./util");

const C = theme.color;
const F = theme.fonts;
const W = theme.width;
const H = theme.height;

const TECHNICAL = /^(pacs\.\d{3}|camt\.\d{3}|ISO|SWIFT|PMG|GPP|IPS|Nostro|Vostro|FI-to-FI)$/i;

function splitLines(ctx, text, size, weight, maxWidth) {
  ctx.save();
  ctx.font = F.body(size, weight);
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  ctx.restore();
  if (lines.length > 2) {
    // Re-balance into two lines rather than truncating.
    const all = lines.join(" ");
    const half = Math.ceil(all.length / 2);
    let cut = all.lastIndexOf(" ", half);
    if (cut < 0) cut = half;
    return [all.slice(0, cut), all.slice(cut + 1)];
  }
  return lines;
}

function drawLine(ctx, line, cx, baseline, size, weight, alpha) {
  const words = line.split(" ");
  const space = ctx.measureText(" ").width;
  const widths = words.map((word) => {
    const clean = word.replace(/^[("']|[)"',.;:!?]+$/g, "");
    const technical = TECHNICAL.test(clean);
    ctx.font = F.body(size, technical ? 600 : weight);
    return ctx.measureText(word).width;
  });
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = cx - total / 2;
  words.forEach((word, i) => {
    const clean = word.replace(/^[("']|[)"',.;:!?]+$/g, "");
    const technical = TECHNICAL.test(clean);
    D.text(ctx, word, x, baseline, {
      size,
      weight: technical ? 600 : weight,
      family: "body",
      color: technical ? C.cyanSoft : C.ink,
      alpha,
      baseline: "alphabetic",
    });
    x += widths[i] + space;
  });
  return total;
}

function drawSubtitles(ctx, cues, t) {
  if (!cues || !cues.length) return;
  const cue = cues.find((c) => t >= c.start && t <= c.end);
  if (!cue) return;
  // Hard cuts between cues keep every line fully readable; the scene
  // chrome already provides the soft video fades.
  const alpha = 0.98;

  const maxWidth = 1430;
  let size = 33;
  let weight = 500;
  let lines = splitLines(ctx, cue.text, size, weight, maxWidth);
  if (lines.length === 2) {
    const widest = Math.max(
      ...lines.map((l) => D.measure(ctx, l, size, weight, "body"))
    );
    if (widest > maxWidth) size = 30;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  const lineHeight = size * 1.34;
  const totalHeight = lines.length * lineHeight;
  const baseY = H - 92 - (lines.length - 1) * lineHeight;
  const widest = Math.max(
    ...lines.map((l) => {
      ctx.font = F.body(size, weight);
      return ctx.measureText(l).width;
    })
  );
  const panelW = Math.min(W - 160, widest + 76);
  const panelH = totalHeight + 30;
  const panelY = baseY - size - 18;

  const g = ctx.createLinearGradient(0, panelY, 0, panelY + panelH);
  g.addColorStop(0, "rgba(2, 7, 14, 0.62)");
  g.addColorStop(1, "rgba(2, 7, 14, 0.82)");
  D.roundRectPath(ctx, W / 2 - panelW / 2, panelY, panelW, panelH, panelH / 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 160, 235, 0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  lines.forEach((line, i) => {
    drawLine(ctx, line, W / 2, baseY + i * lineHeight, size, weight, 1);
  });
  ctx.restore();
}

module.exports = { drawSubtitles };
