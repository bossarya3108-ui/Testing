"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, smooth, easeOutCubic, easeOutBack, pulse, markerTime } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");
const world = require("../lib/world");

const C = theme.color;
const W = theme.width;

const NODES = [
  { key: "bank", x: 155, title: "SENDING BANK", sub: "Payment instruction", icon: "bank", color: C.blueSoft, badge: "ORIGIN" },
  { key: "swift", x: 485, title: "SWIFT", sub: "Financial messaging network", icon: "globe", color: C.blue, badge: "MESSAGING" },
  { key: "pmg", x: 815, title: "PMG", sub: "Payments Management Gateway", icon: "gateway", color: C.cyan, badge: "GATEWAY" },
  { key: "gpp", x: 1145, title: "GPP", sub: "Target payment platform", icon: "chip", color: C.cyan, badge: "PLATFORM" },
  { key: "downstream", x: 1475, title: "DOWNSTREAM", sub: "Processing & operations", icon: "layers", color: C.green, badge: "CONSUMER" },
];

const ROW_Y = 340;
const NODE_W = 290;
const NODE_H = 120;

function drawJourneyNode(ctx, node, appear, active) {
  if (appear <= 0.001) return;
  const scale = 0.92 + 0.08 * easeOutBack(appear, 1.1);
  ctx.save();
  ctx.globalAlpha *= appear;
  ctx.translate(node.x + NODE_W / 2, ROW_Y + NODE_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(node.x + NODE_W / 2), -(ROW_Y + NODE_H / 2));
  D.panel(ctx, node.x, ROW_Y, NODE_W, NODE_H, {
    fillTop: active ? "rgba(18, 43, 74, 0.96)" : "rgba(10, 25, 45, 0.94)",
    fillBottom: active ? "rgba(7, 21, 40, 0.98)" : "rgba(5, 15, 29, 0.96)",
    stroke: active ? D.hexAlpha(node.color, 0.5) : "rgba(96,150,220,0.18)",
    glow: active ? 0.45 : 0,
    glowColor: node.color,
    accent: active ? D.hexAlpha(node.color, 0.5) : null,
    radius: 14,
  });
  D.icon(ctx, node.icon, node.x + 40, ROW_Y + 48, 26, node.color, { alpha: active ? 1 : 0.7, lineWidth: 1.6 });
  D.text(ctx, node.title, node.x + 70, ROW_Y + 42, {
    size: 18, family: "display", weight: 600, color: C.ink, letterSpacing: -0.3,
  });
  D.text(ctx, node.sub, node.x + 70, ROW_Y + 65, {
    size: 10.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  D.pill(ctx, node.badge, node.x + NODE_W - 14, ROW_Y + 20, {
    size: 8, height: 20, padX: 8, color: node.color,
    bg: D.hexAlpha(node.color, 0.08), border: D.hexAlpha(node.color, 0.25),
    align: "right", letterSpacing: 1, alpha: 0.9,
  });
  D.text(ctx, node.key === "downstream" ? "CONSUMES OUTCOMES" : node.key === "gpp" ? "PROCESSES" : node.key === "pmg" ? "INTEGRATES" : node.key === "swift" ? "EXCHANGES" : "INITIATES", node.x + 70, ROW_Y + 92, {
    size: 8.5, family: "mono", weight: 500, color: C.dim, letterSpacing: 1.4, alpha: 0.7,
  });
  ctx.restore();
}

function drawLink(ctx, from, to, progress, color, alpha, packetProgress) {
  const y = ROW_Y + NODE_H / 2;
  const pts = [[from.x + NODE_W, y], [to.x, y]];
  D.connection(ctx, pts, {
    color, alpha: alpha * 0.85, progress, width: 1.5, glow: 0.7, arrow: true, arrowSize: 9,
  });
  if (packetProgress > 0 && packetProgress < 1 && progress > 0.05) {
    D.packetOnLine(ctx, pts, packetProgress * progress, color, {
      r: 3.2, alpha: alpha * 0.9, intensity: 0.8,
    });
  }
}

function drawStatusChips(ctx, t, scene, alpha) {
  const statuses = markerTime(scene, "statuses", 6.5);
  const a = smooth(inv(t, statuses - 0.2, statuses + 0.6)) * alpha;
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  D.statusChip(ctx, "pacs.002 · STATUS", NODES[3].x + NODE_W / 2, 510, C.cyan, { align: "center", size: 9 });
  D.statusChip(ctx, "OUTCOME CONSUMED", NODES[4].x + NODE_W / 2, 510, C.green, { align: "center", size: 9 });
  D.text(ctx, "Statuses let downstream systems and teams track what happened", W / 2, 546, {
    size: 10.5, weight: 400, color: C.dim, align: "center", alpha: 0.75,
  });
  ctx.restore();
}

function drawException(ctx, t, scene, alpha) {
  const wrong = markerTime(scene, "wrong", 8.45);
  const a = smooth(inv(t, wrong - 0.2, wrong + 0.6)) * alpha;
  const p = pulse(t, wrong - 0.1, 0.2, 0.8, 0.9);
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  const x = NODES[4].x + NODE_W / 2;
  const y = 570;
  D.pill(ctx, "EXCEPTION TO INVESTIGATE", x, y, {
    size: 9, height: 28, padX: 12, color: C.amber,
    bg: "rgba(255,181,71,0.08)", border: "rgba(255,181,71,0.35)",
    align: "center", letterSpacing: 1.4, dotColor: C.amber,
  });
  D.connection(ctx, [[x, y + 14], [x, ROW_Y + NODE_H + 4]], {
    color: C.amber, alpha: 0.55, width: 1, glow: 0.4, dashed: true, arrow: false,
  });
  D.ring(ctx, x, y, 60 + 6 * Math.sin(t * 2), "rgba(255,181,71,0.16)", { alpha: 0.4 + p * 0.3, width: 1 });
  ctx.restore();
}

function drawStatement(ctx, t, scene) {
  const start = markerTime(scene, "foundation", 9.28);
  const dim = smooth(inv(t, start - 0.8, start + 0.4));
  if (dim <= 0.01) return 0;
  const a = smooth(inv(t, start - 0.3, start + 0.6));

  // Dim the ecosystem.
  ctx.save();
  ctx.globalAlpha = dim;
  ctx.fillStyle = "rgba(2, 6, 13, 0.62)";
  ctx.fillRect(0, 0, W, 1080);
  ctx.restore();

  const lines = [
    ["UNDERSTAND THE FLOW.", C.ink, C.blue],
    ["TRACE THE MESSAGE.", C.cyanSoft, C.cyan],
    ["INVESTIGATE THE EXCEPTION.", C.amber, C.amber],
  ];
  ctx.save();
  ctx.globalAlpha = a;
  D.text(ctx, "THE FOUNDATION", 200, 574, {
    size: 10, family: "mono", weight: 600, color: C.dim, letterSpacing: 3, alpha: 0.85,
  });
  lines.forEach(([label, color, accent], i) => {
    const la = smooth(inv(t, start + i * 0.4, start + 0.5 + i * 0.4));
    if (la <= 0.01) return;
    const y = 636 + i * 66;
    D.text(ctx, label, 200 + (1 - easeOutCubic(la)) * 24, y, {
      size: 50, family: "display", weight: 600, color, letterSpacing: -0.8, alpha: la,
    });
  });

  // Closing mark.
  const markA = smooth(inv(t, 11.1, 11.7));
  if (markA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= markA;
    D.roundRectPath(ctx, 200, 812, 46, 46, 12);
    const g = ctx.createLinearGradient(200, 812, 246, 858);
    g.addColorStop(0, "rgba(47,123,255,0.25)");
    g.addColorStop(1, "rgba(53,224,255,0.08)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(90,162,255,0.5)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    D.text(ctx, "G", 223, 836, {
      size: 25, family: "display", weight: 700, color: C.ink, align: "center", baseline: "middle",
    });
    D.text(ctx, "GLOBAL PAYMENTS PLATFORM", 262, 830, {
      size: 10, family: "mono", weight: 600, color: C.ink, letterSpacing: 2,
    });
    D.text(ctx, "Business analyst perspective", 262, 849, {
      size: 11, weight: 400, color: C.muted, alpha: 0.8,
    });
    ctx.restore();
  }
  ctx.restore();
  return dim;
}

module.exports = function scene7(ctx, t, scene) {
  const titleA = smooth(inv(t, 0.1, 0.8));
  const journey = markerTime(scene, "journey", 4.97);
  const systems = markerTime(scene, "systems", 5.51);
  const start = markerTime(scene, "foundation", 9.28);
  const dim = smooth(inv(t, start - 0.8, start + 0.4));
  const rowA = 1 - dim * 0.72;

  // World continuity.
  world.drawMap(ctx, { alpha: 0.10 * (1 - dim * 0.5), scale: 1.0 });
  drawGlow(ctx, W / 2, 400, 1000, 0.14);

  drawSceneTitle(ctx, {
    eyebrow: "THE ANALYST MINDSET",
    title: "Understand the complete journey",
    sub: "Follow the flow, trace the message, investigate what went wrong",
    y: 150,
    alpha: titleA * (1 - dim * 0.65),
  });

  // Journey row.
  const rowLabelA = smooth(inv(t, 0.8, 1.5)) * rowA;
  D.text(ctx, "THE COMPLETE PAYMENT JOURNEY", 155, 302, {
    size: 10, family: "mono", weight: 600, color: C.muted, letterSpacing: 2.6, alpha: rowLabelA * 0.8,
  });
  D.text(ctx, "SWIFT  →  PMG  →  GPP  →  DOWNSTREAM", 1765, 302, {
    size: 10, family: "mono", weight: 600, color: C.cyanSoft, align: "right", letterSpacing: 1.6, alpha: rowLabelA * 0.7,
  });

  const linkP = smooth(inv(t, journey - 0.3, journey + 1.2));
  const linkAlpha = rowA;
  NODES.forEach((node, i) => {
    const appear = smooth(inv(t, 0.7 + i * 0.2, 1.3 + i * 0.2));
    const active = systems > 0 && t >= systems + i * 0.13 && t < systems + i * 0.13 + 0.7
      ? 1
      : 0.15;
    drawJourneyNode(ctx, node, appear, active * rowA);
    if (i < NODES.length - 1) {
      drawLink(ctx, NODES[i], NODES[i + 1], linkP, i === 3 ? C.green : C.cyan, linkAlpha, linkP > 0 ? ((t * 0.35 + i * 0.25) % 1) : 0);
    }
  });

  drawStatusChips(ctx, t, scene, rowA);
  drawException(ctx, t, scene, rowA);
  drawStatement(ctx, t, scene);
};
