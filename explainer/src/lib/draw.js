"use strict";

const theme = require("./theme");
const { clamp, lerp, easeOutCubic, easeOutBack, easeInOutCubic, smooth } = require("./util");

const C = theme.color;
const F = theme.fonts;

/* ------------------------------------------------------------------ text */

function text(ctx, str, x, y, opts = {}) {
  const {
    size = 20,
    weight = 400,
    family = "body",
    color = C.ink,
    align = "left",
    baseline = "alphabetic",
    alpha = 1,
    letterSpacing = 0,
    maxWidth,
  } = opts;
  if (!str || alpha <= 0) return 0;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.font = F[family](size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.letterSpacing = `${letterSpacing}px`;
  ctx.fillText(str, x, y, maxWidth);
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

function measure(ctx, str, size = 20, weight = 400, family = "body", letterSpacing = 0) {
  ctx.save();
  ctx.font = F[family](size, weight);
  ctx.letterSpacing = `${letterSpacing}px`;
  const width = ctx.measureText(str).width;
  ctx.restore();
  return width;
}

function wrapLines(ctx, str, maxWidth, size = 20, weight = 400, family = "body") {
  ctx.save();
  ctx.font = F[family](size, weight);
  const words = String(str).split(" ");
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
  return lines;
}

function paragraph(ctx, str, x, y, opts = {}) {
  const { size = 18, weight = 400, family = "body", color = C.muted, lineHeight = size * 1.45, maxWidth = 600, alpha = 1, align = "left" } = opts;
  const lines = wrapLines(ctx, str, maxWidth, size, weight, family);
  lines.forEach((line, i) => {
    const lx = align === "center" ? x + maxWidth / 2 : align === "right" ? x + maxWidth : x;
    text(ctx, line, lx, y + i * lineHeight, { size, weight, family, color, alpha, align });
  });
  return lines.length * lineHeight;
}

/* ------------------------------------------------------------------ shapes */

function roundRectPath(ctx, x, y, w, h, r = 14) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function panel(ctx, x, y, w, h, opts = {}) {
  const {
    radius = 16,
    alpha = 1,
    fill = null,
    fillTop = "rgba(14, 33, 58, 0.92)",
    fillBottom = "rgba(5, 14, 27, 0.94)",
    stroke = C.line,
    strokeWidth = 1.2,
    glow = 0,
    glowColor = C.blue,
    accent = null,
    topHighlight = true,
  } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  roundRectPath(ctx, x, y, w, h, radius);
  if (fill) {
    ctx.fillStyle = fill;
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, fillTop);
    g.addColorStop(1, fillBottom);
    ctx.fillStyle = g;
  }
  if (glow > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 34 * glow;
  }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = strokeWidth;
  ctx.strokeStyle = accent || stroke;
  ctx.stroke();
  if (accent) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, accent);
    grad.addColorStop(0.5, "rgba(255,255,255,0.05)");
    grad.addColorStop(1, accent);
    ctx.globalAlpha *= 0.7;
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, 2);
    ctx.restore();
  }
  if (topHighlight) {
    const hl = ctx.createLinearGradient(x, y, x, y + Math.min(60, h));
    hl.addColorStop(0, "rgba(255,255,255,0.055)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    roundRectPath(ctx, x + 1, y + 1, w - 2, Math.min(60, h - 2), radius);
    ctx.fill();
  }
  ctx.restore();
}

function rule(ctx, x1, y1, x2, y2, color = C.line, alpha = 1, width = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function dot(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pill(ctx, label, x, y, opts = {}) {
  const {
    size = 13,
    weight = 600,
    family = "body",
    color = C.cyan,
    bg = "rgba(53, 224, 255, 0.10)",
    border = "rgba(53, 224, 255, 0.32)",
    height = 30,
    padX = 13,
    align = "left",
    alpha = 1,
    letterSpacing = 1.2,
    dotColor = null,
  } = opts;
  const textWidth = measure(ctx, label, size, weight, family, letterSpacing);
  const w = textWidth + padX * 2 + (dotColor ? 14 : 0);
  const bx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  roundRectPath(ctx, bx, y - height / 2, w, height, height / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (dotColor) {
    dot(ctx, bx + padX + 3, y, 3.2, dotColor, 1);
  }
  text(ctx, label, bx + padX + (dotColor ? 14 : 0), y + 0.5, {
    size,
    weight,
    family,
    color,
    baseline: "middle",
    letterSpacing,
    alpha: 1,
  });
  ctx.restore();
  return w;
}

function chip(ctx, label, x, y, color, opts = {}) {
  const { size = 12, family = "mono", weight = 600, height = 24, padX = 8, alpha = 1 } = opts;
  const w = measure(ctx, label, size, weight, family) + padX * 2;
  ctx.save();
  ctx.globalAlpha *= alpha;
  roundRectPath(ctx, x, y - height / 2, w, height, 6);
  ctx.fillStyle = hexAlpha(color, 0.12);
  ctx.fill();
  ctx.strokeStyle = hexAlpha(color, 0.36);
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, label, x + padX, y + 0.5, { size, family, weight, color, baseline: "middle" });
  ctx.restore();
  return w;
}

function hexAlpha(hex, alpha) {
  if (!hex || !hex.startsWith("#")) return hex;
  const h = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ------------------------------------------------------------------ icons */

const ICONS = {
  bank(ctx) {
    ctx.moveTo(2.5, 9.5);
    ctx.lineTo(12, 3);
    ctx.lineTo(21.5, 9.5);
    ctx.moveTo(4.5, 9.5);
    ctx.lineTo(4.5, 19);
    ctx.moveTo(19.5, 9.5);
    ctx.lineTo(19.5, 19);
    ctx.moveTo(2.5, 20.5);
    ctx.lineTo(21.5, 20.5);
    ctx.moveTo(8.5, 12);
    ctx.lineTo(8.5, 17.5);
    ctx.moveTo(12, 12);
    ctx.lineTo(12, 17.5);
    ctx.moveTo(15.5, 12);
    ctx.lineTo(15.5, 17.5);
  },
  globe(ctx) {
    ctx.arc(12, 12, 8.7, 0, Math.PI * 2);
    ctx.moveTo(12, 3.3);
    ctx.bezierCurveTo(8.6, 6.2, 8.6, 17.8, 12, 20.7);
    ctx.bezierCurveTo(15.4, 17.8, 15.4, 6.2, 12, 3.3);
    ctx.moveTo(3.6, 9.2);
    ctx.lineTo(20.4, 9.2);
    ctx.moveTo(3.6, 14.8);
    ctx.lineTo(20.4, 14.8);
  },
  network(ctx) {
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    for (const [x, y] of [[4.5, 5.5], [19.5, 5.5], [4.5, 18.5], [19.5, 18.5]]) {
      ctx.moveTo(12, 12);
      ctx.lineTo(x, y);
      ctx.moveTo(x + 1.8, y);
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    }
  },
  gateway(ctx) {
    ctx.rect(2.5, 7, 19, 10);
    ctx.moveTo(6, 12);
    ctx.lineTo(17.5, 12);
    ctx.moveTo(14, 8.8);
    ctx.lineTo(17.5, 12);
    ctx.lineTo(14, 15.2);
    ctx.moveTo(6, 9.5);
    ctx.lineTo(6, 14.5);
  },
  chip(ctx) {
    ctx.rect(7, 7, 10, 10);
    ctx.rect(10, 10, 4, 4);
    for (const [a, b, c, d] of [[9, 3, 9, 7], [12, 3, 12, 7], [15, 3, 15, 7], [9, 17, 9, 21], [12, 17, 12, 21], [15, 17, 15, 21], [3, 9, 7, 9], [3, 12, 7, 12], [3, 15, 7, 15], [17, 9, 21, 9], [17, 12, 21, 12], [17, 15, 21, 15]]) {
      ctx.moveTo(a, b);
      ctx.lineTo(c, d);
    }
  },
  server(ctx) {
    ctx.rect(3.5, 3.5, 17, 5.2);
    ctx.rect(3.5, 9.6, 17, 5.2);
    ctx.rect(3.5, 15.7, 17, 4.8);
    ctx.moveTo(6.5, 6.1);
    ctx.lineTo(8.5, 6.1);
    ctx.moveTo(6.5, 12.2);
    ctx.lineTo(8.5, 12.2);
    ctx.moveTo(6.5, 18.1);
    ctx.lineTo(8.5, 18.1);
    ctx.arc(17.3, 6.1, 0.7, 0, Math.PI * 2);
    ctx.arc(17.3, 12.2, 0.7, 0, Math.PI * 2);
    ctx.arc(17.3, 18.1, 0.7, 0, Math.PI * 2);
  },
  shield(ctx) {
    ctx.moveTo(12, 2.5);
    ctx.lineTo(20, 5.8);
    ctx.lineTo(20, 11.8);
    ctx.bezierCurveTo(20, 17.2, 16.4, 20.2, 12, 21.5);
    ctx.bezierCurveTo(7.6, 20.2, 4, 17.2, 4, 11.8);
    ctx.lineTo(4, 5.8);
    ctx.closePath();
    ctx.moveTo(8.4, 12);
    ctx.lineTo(11, 14.5);
    ctx.lineTo(15.8, 9.4);
  },
  rules(ctx) {
    for (const y of [6.5, 12, 17.5]) {
      ctx.moveTo(4, y);
      ctx.lineTo(20, y);
    }
    for (const [x, y] of [[9, 6.5], [15.5, 12], [7, 17.5]]) {
      ctx.moveTo(x + 2.2, y);
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    }
  },
  route(ctx) {
    ctx.moveTo(3, 18);
    ctx.lineTo(8, 18);
    ctx.bezierCurveTo(12, 18, 12, 9, 16, 9);
    ctx.lineTo(20, 9);
    ctx.moveTo(17, 6);
    ctx.lineTo(20, 9);
    ctx.lineTo(17, 12);
    ctx.moveTo(3, 6);
    ctx.lineTo(8, 6);
    ctx.bezierCurveTo(10, 6, 10, 9, 12, 9);
  },
  status(ctx) {
    ctx.arc(12, 12, 8.8, 0, Math.PI * 2);
    ctx.moveTo(7.4, 12.2);
    ctx.lineTo(10.3, 15.1);
    ctx.lineTo(16.7, 8.7);
  },
  alert(ctx) {
    ctx.moveTo(12, 3);
    ctx.lineTo(21.5, 20.2);
    ctx.lineTo(2.5, 20.2);
    ctx.closePath();
    ctx.moveTo(12, 9);
    ctx.lineTo(12, 14.4);
    ctx.moveTo(12, 17.2);
    ctx.lineTo(12, 17.4);
  },
  search(ctx) {
    ctx.arc(10.5, 10.5, 6.3, 0, Math.PI * 2);
    ctx.moveTo(15.2, 15.2);
    ctx.lineTo(20.5, 20.5);
  },
  user(ctx) {
    ctx.arc(12, 8, 4.1, 0, Math.PI * 2);
    ctx.moveTo(4.2, 21);
    ctx.bezierCurveTo(4.2, 15.8, 7.6, 13.8, 12, 13.8);
    ctx.bezierCurveTo(16.4, 13.8, 19.8, 15.8, 19.8, 21);
  },
  ledger(ctx) {
    ctx.rect(5, 2.8, 14, 18.4);
    ctx.moveTo(8.6, 2.8);
    ctx.lineTo(8.6, 21.2);
    ctx.moveTo(11.5, 7);
    ctx.lineTo(16.2, 7);
    ctx.moveTo(11.5, 10.5);
    ctx.lineTo(16.2, 10.5);
    ctx.moveTo(11.5, 14);
    ctx.lineTo(14.5, 14);
  },
  doc(ctx) {
    ctx.moveTo(6, 2.8);
    ctx.lineTo(15, 2.8);
    ctx.lineTo(19, 6.8);
    ctx.lineTo(19, 21.2);
    ctx.lineTo(6, 21.2);
    ctx.closePath();
    ctx.moveTo(15, 2.8);
    ctx.lineTo(15, 6.8);
    ctx.lineTo(19, 6.8);
    ctx.moveTo(9, 11);
    ctx.lineTo(16, 11);
    ctx.moveTo(9, 14.5);
    ctx.lineTo(16, 14.5);
    ctx.moveTo(9, 18);
    ctx.lineTo(13.5, 18);
  },
  send(ctx) {
    ctx.moveTo(2.8, 12);
    ctx.lineTo(21.2, 3.6);
    ctx.lineTo(14, 20.8);
    ctx.lineTo(10.6, 12.8);
    ctx.closePath();
    ctx.moveTo(10.6, 12.8);
    ctx.lineTo(21.2, 3.6);
  },
  return(ctx) {
    ctx.moveTo(4, 9.5);
    ctx.lineTo(9, 9.5);
    ctx.bezierCurveTo(15, 9.5, 18.5, 12.5, 18.5, 17);
    ctx.moveTo(4, 9.5);
    ctx.lineTo(7.6, 6);
    ctx.moveTo(4, 9.5);
    ctx.lineTo(7.6, 13);
    ctx.moveTo(13, 20);
    ctx.lineTo(20.5, 20);
  },
  cancel(ctx) {
    ctx.arc(12, 12, 8.7, 0, Math.PI * 2);
    ctx.moveTo(5.9, 5.9);
    ctx.lineTo(18.1, 18.1);
  },
  check(ctx) {
    ctx.moveTo(4.5, 12.5);
    ctx.lineTo(9.5, 17.5);
    ctx.lineTo(19.5, 6.5);
  },
  cross(ctx) {
    ctx.moveTo(6, 6);
    ctx.lineTo(18, 18);
    ctx.moveTo(18, 6);
    ctx.lineTo(6, 18);
  },
  clock(ctx) {
    ctx.arc(12, 12, 8.7, 0, Math.PI * 2);
    ctx.moveTo(12, 7);
    ctx.lineTo(12, 12);
    ctx.lineTo(15.6, 14.2);
  },
  layers(ctx) {
    ctx.moveTo(12, 3);
    ctx.lineTo(21, 8);
    ctx.lineTo(12, 13);
    ctx.lineTo(3, 8);
    ctx.closePath();
    ctx.moveTo(3, 12.5);
    ctx.lineTo(12, 17.5);
    ctx.lineTo(21, 12.5);
    ctx.moveTo(3, 16.8);
    ctx.lineTo(12, 21.8);
    ctx.lineTo(21, 16.8);
  },
  analytics(ctx) {
    ctx.moveTo(4, 20);
    ctx.lineTo(4, 4);
    ctx.moveTo(4, 20);
    ctx.lineTo(21, 20);
    ctx.moveTo(8, 16);
    ctx.lineTo(8, 12);
    ctx.moveTo(12.5, 16);
    ctx.lineTo(12.5, 8);
    ctx.moveTo(17, 16);
    ctx.lineTo(17, 10);
  },
  lock(ctx) {
    ctx.rect(5.5, 10.5, 13, 9.5);
    ctx.moveTo(8.5, 10.5);
    ctx.lineTo(8.5, 7.5);
    ctx.bezierCurveTo(8.5, 3.8, 15.5, 3.8, 15.5, 7.5);
    ctx.lineTo(15.5, 10.5);
  },
};

function icon(ctx, name, cx, cy, size, color = C.ink, opts = {}) {
  const { alpha = 1, lineWidth = 1.7, filled = false } = opts;
  const painter = ICONS[name];
  if (!painter || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (filled) {
    ctx.fillStyle = hexAlpha(color, 0.14);
    ctx.beginPath();
    painter(ctx);
    ctx.fill();
  }
  ctx.beginPath();
  painter(ctx);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ cards */

function nodeCard(ctx, opts) {
  const {
    x, y, w, h,
    title,
    sub = "",
    iconName = "bank",
    color = C.blue,
    alpha = 1,
    appear = 1,
    active = 0,
    dim = 0,
    badge = null,
    badgeColor = color,
    iconSize = 30,
    radius = 16,
    tiny = false,
  } = opts;
  if (appear <= 0.001 || alpha <= 0.001) return;
  const pop = easeOutBack(appear, 1.1);
  const scale = 0.9 + 0.1 * pop;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha) * clamp(appear) * (1 - dim * 0.55);
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + w / 2), -(y + h / 2));

  panel(ctx, x, y, w, h, {
    fillTop: active > 0.1 ? "rgba(18, 45, 82, 0.96)" : "rgba(12, 29, 51, 0.94)",
    fillBottom: active > 0.1 ? "rgba(8, 24, 46, 0.98)" : "rgba(5, 15, 29, 0.96)",
    stroke: active > 0.1 ? hexAlpha(color, 0.45 + 0.35 * active) : C.line,
    glow: active * 0.9,
    glowColor: color,
    accent: active > 0.05 ? hexAlpha(color, 0.5 * active) : null,
    topHighlight: true,
  });

  const tile = tiny ? 40 : 54;
  const tx = x + (tiny ? 16 : 20);
  const ty = y + (h - tile) / 2;
  ctx.save();
  roundRectPath(ctx, tx, ty, tile, tile, 12);
  ctx.fillStyle = hexAlpha(color, 0.12 + 0.12 * active);
  ctx.fill();
  ctx.strokeStyle = hexAlpha(color, 0.25 + 0.3 * active);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  icon(ctx, iconName, tx + tile / 2, ty + tile / 2, iconSize * (tiny ? 0.8 : 1), color, {
    alpha: 0.85 + 0.15 * active,
    lineWidth: 1.6,
  });

  const textX = tx + tile + (tiny ? 12 : 16);
  const titleSize = tiny ? 20 : 24;
  text(ctx, title, textX, y + (sub ? h / 2 - 12 : h / 2), {
    size: titleSize,
    weight: 600,
    family: "display",
    color: C.ink,
    baseline: "middle",
    letterSpacing: -0.2,
  });
  if (sub) {
    const lines = wrapLines(ctx, sub, w - (textX - x) - 18, tiny ? 13 : 14, 400, "body");
    lines.slice(0, 2).forEach((line, i) => {
      text(ctx, line, textX, y + h / 2 + 10 + i * (tiny ? 15 : 18), {
        size: tiny ? 13 : 14,
        color: C.muted,
        baseline: "middle",
        alpha: 0.95,
      });
    });
  }
  if (badge) {
    pill(ctx, badge, x + w - 12, y + 14, {
      size: 10,
      height: 22,
      padX: 9,
      color: badgeColor,
      bg: hexAlpha(badgeColor, 0.12),
      border: hexAlpha(badgeColor, 0.35),
      align: "right",
      letterSpacing: 1,
    });
  }

  if (active > 0.05) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
    const sweepX = x + ((ctx.__t || 0) * 180) % (w + 240) - 120;
    const g = ctx.createLinearGradient(sweepX - 80, y, sweepX + 80, y);
    g.addColorStop(0, hexAlpha(color, 0));
    g.addColorStop(0.5, hexAlpha(color, 0.10 * active));
    g.addColorStop(1, hexAlpha(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ lines */

function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
}

function pointOnPolyline(points, progress) {
  const total = polylineLength(points);
  const target = clamp(progress) * total;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (walked + seg >= target || i === points.length - 1) {
      const p = seg === 0 ? 0 : clamp((target - walked) / seg);
      return {
        x: lerp(x0, x1, p),
        y: lerp(y0, y1, p),
        angle: Math.atan2(y1 - y0, x1 - x0),
      };
    }
    walked += seg;
  }
  const last = points[points.length - 1];
  return { x: last[0], y: last[1], angle: 0 };
}

function tracePolyline(ctx, points, progress) {
  if (progress <= 0) return null;
  const total = polylineLength(points);
  const target = clamp(progress) * total;
  let walked = 0;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (walked + seg >= target) {
      const p = seg === 0 ? 0 : (target - walked) / seg;
      ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p));
      break;
    }
    ctx.lineTo(x1, y1);
    walked += seg;
  }
  return pointOnPolyline(points, progress);
}

function arrowHead(ctx, x, y, angle, size, color, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha *= clamp(alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.52);
  ctx.lineTo(-size * 0.72, 0);
  ctx.lineTo(-size, size * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function connection(ctx, points, opts = {}) {
  const {
    color = C.blue,
    alpha = 1,
    progress = 1,
    width = 2,
    glow = 1,
    dashed = false,
    arrow = true,
    arrowSize = 11,
    baseAlpha = 0.18,
  } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.strokeStyle = hexAlpha(color, baseAlpha);
  ctx.lineWidth = width + 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();

  if (progress > 0) {
    const end = tracePolyline(ctx, points, progress);
    if (dashed) ctx.setLineDash([8, 10]);
    if (glow > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 * glow;
    }
    ctx.strokeStyle = hexAlpha(color, 0.95);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    if (arrow && end) {
      arrowHead(ctx, end.x, end.y, end.angle, arrowSize, color, 1);
    }
  }
  ctx.restore();
}

function glowLine(ctx, points, color = C.cyan, opts = {}) {
  connection(ctx, points, { ...opts, color, baseAlpha: 0.08 });
}

function packet(ctx, x, y, color = C.cyan, opts = {}) {
  const { r = 4.2, alpha = 1, direction = 0, trail = true, intensity = 1 } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  if (trail) {
    for (let i = 3; i >= 1; i -= 1) {
      const tx = x - Math.cos(direction) * i * 7;
      const ty = y - Math.sin(direction) * i * 7;
      dot(ctx, tx, ty, r * (1 - i * 0.18), color, 0.16 * (4 - i) * intensity);
    }
  }
  ctx.shadowColor = color;
  ctx.shadowBlur = 18 * intensity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(x - r * 0.12, y - r * 0.12, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function packetOnLine(ctx, points, progress, color, opts = {}) {
  const pos = pointOnPolyline(points, progress);
  if (!pos) return;
  packet(ctx, pos.x, pos.y, color, { ...opts, direction: pos.angle });
}

/* ------------------------------------------------------------------ badges */

function ring(ctx, cx, cy, r, color = C.blue, opts = {}) {
  const { alpha = 1, width = 1.5, dash = null, rotation = 0 } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(cx, cy, r, rotation, rotation + Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function checkBadge(ctx, cx, cy, r, color = C.green, opts = {}) {
  const { alpha = 1, progress = 1, iconSize = null } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = hexAlpha(color, 0.10);
  ctx.strokeStyle = hexAlpha(color, 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  const s = iconSize || r * 1.25;
  icon(ctx, "check", cx, cy, s, C.ink, { alpha: alpha, lineWidth: 2.4 });
  ring(ctx, cx, cy, r + 6 + 2 * Math.sin(progress * Math.PI), color, { alpha: 0.16 * (1 - progress) });
  ctx.restore();
}

function crossBadge(ctx, cx, cy, r, color = C.red, opts = {}) {
  const { alpha = 1, progress = 1 } = opts;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = hexAlpha(color, 0.10);
  ctx.strokeStyle = hexAlpha(color, 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  icon(ctx, "cross", cx, cy, r * 1.15, C.ink, { lineWidth: 2.4 });
  ring(ctx, cx, cy, r + 5 + 3 * progress, color, { alpha: 0.18 * (1 - progress) });
  ctx.restore();
}

function statusChip(ctx, label, x, y, color, opts = {}) {
  const { size = 11, alpha = 1, align = "left", dotColor = color } = opts;
  const w = measure(ctx, label, size, 600, "mono") + 26;
  const bx = align === "center" ? x - w / 2 : x;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  roundRectPath(ctx, bx, y - 12, w, 24, 12);
  ctx.fillStyle = hexAlpha(color, 0.12);
  ctx.fill();
  ctx.strokeStyle = hexAlpha(color, 0.4);
  ctx.lineWidth = 1;
  ctx.stroke();
  dot(ctx, bx + 10, y, 2.8, dotColor, 1);
  text(ctx, label, bx + 18, y + 0.5, {
    size,
    family: "mono",
    weight: 600,
    color,
    baseline: "middle",
    letterSpacing: 0.6,
  });
  ctx.restore();
  return w;
}

/* ------------------------------------------------------------------ misc */

function messageCard(ctx, x, y, w, h, opts = {}) {
  const {
    type = "pacs.008",
    desc = "FI-to-FI Customer Credit Transfer",
    color = C.cyan,
    alpha = 1,
    appear = 1,
    active = 0,
    code = true,
    iconName = "doc",
    compact = false,
  } = opts;
  if (appear <= 0.001 || alpha <= 0.001) return;
  const scale = 0.94 + 0.06 * easeOutBack(appear, 1.1);
  ctx.save();
  ctx.globalAlpha *= clamp(alpha) * clamp(appear);
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  panel(ctx, x, y, w, h, {
    fillTop: "rgba(13, 32, 57, 0.97)",
    fillBottom: "rgba(6, 17, 32, 0.98)",
    stroke: hexAlpha(color, 0.32 + 0.5 * active),
    glow: active * 0.6,
    glowColor: color,
    accent: hexAlpha(color, 0.55 * active),
    radius: 14,
  });
  const iy = y + h / 2;
  ctx.save();
  roundRectPath(ctx, x + 14, iy - (compact ? 16 : 18), compact ? 32 : 36, compact ? 32 : 36, 9);
  ctx.fillStyle = hexAlpha(color, 0.12);
  ctx.strokeStyle = hexAlpha(color, 0.3);
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  icon(ctx, iconName, x + 14 + (compact ? 16 : 18), iy, compact ? 18 : 21, color, { lineWidth: 1.6 });

  const tx = x + 14 + (compact ? 32 : 36) + 12;
  text(ctx, type, tx, code ? iy - 9 : iy, {
    size: compact ? 18 : 21,
    family: "mono",
    weight: 600,
    color,
    baseline: "middle",
    letterSpacing: -0.3,
  });
  if (desc) {
    text(ctx, desc, tx, iy + (code ? 12 : 0), {
      size: compact ? 12 : 13,
      color: C.muted,
      baseline: "middle",
    });
  }
  ctx.restore();
}

function bracket(ctx, x1, x2, y, depth, color = C.blue, alpha = 1, label = "") {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.strokeStyle = hexAlpha(color, 0.55);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x1, y + depth);
  ctx.lineTo(x2, y + depth);
  ctx.lineTo(x2, y);
  ctx.stroke();
  if (label) {
    const w = measure(ctx, label, 12, 600, "body", 1.8);
    ctx.fillStyle = C.bg1;
    ctx.fillRect((x1 + x2) / 2 - w / 2 - 12, y + depth - 9, w + 24, 18);
    text(ctx, label, (x1 + x2) / 2, y + depth + 1, {
      size: 12,
      weight: 600,
      color,
      align: "center",
      baseline: "middle",
      letterSpacing: 1.8,
      alpha: 0.95,
    });
  }
  ctx.restore();
}

function scanLine(ctx, x, y, w, color = C.cyan, alpha = 0.4) {
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, hexAlpha(color, 0));
  g.addColorStop(0.5, hexAlpha(color, alpha));
  g.addColorStop(1, hexAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, 1.2);
}

function cornerMarks(ctx, x, y, w, h, color = C.blue, alpha = 0.5, len = 12) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h);
  ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
  ctx.restore();
}

module.exports = {
  C,
  F,
  text,
  measure,
  wrapLines,
  paragraph,
  roundRectPath,
  panel,
  rule,
  dot,
  pill,
  chip,
  hexAlpha,
  icon,
  nodeCard,
  polylineLength,
  pointOnPolyline,
  arrowHead,
  connection,
  glowLine,
  packet,
  packetOnLine,
  ring,
  checkBadge,
  crossBadge,
  statusChip,
  messageCard,
  bracket,
  scanLine,
  cornerMarks,
  easeOutCubic,
  easeInOutCubic,
  smooth,
};
