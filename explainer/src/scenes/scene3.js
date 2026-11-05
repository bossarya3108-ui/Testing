"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, smooth, easeOutCubic, easeOutBack, pulse, markerTime } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;

const PANEL = { x: 80, y: 470, w: 1760, h: 380 };
const NODE_W = 300;
const NODE_H = 84;
const NODE_Y = 322;
const NODE_X = [80, 445, 810, 1175, 1540];
const NODE_CENTERS = NODE_X.map((x) => x + NODE_W / 2);

const STAGES = [
  { key: "receive", title: "RECEIVE", sub: "Inbound instruction", icon: "doc", color: C.blueSoft, status: "RECEIVED" },
  { key: "validate", title: "VALIDATE", sub: "Message & business data", icon: "shield", color: C.cyan, status: "PASSED" },
  { key: "rules", title: "APPLY RULES", sub: "Configured logic", icon: "rules", color: C.cyan, status: "RULES APPLIED" },
  { key: "route", title: "ROUTE / PROCESS", sub: "Next destination", icon: "route", color: C.blue, status: "ROUTED" },
  { key: "status", title: "GENERATE STATUS", sub: "Track the outcome", icon: "status", color: C.green, status: "STATUS UPDATED" },
];

function stageWindow(t, scene) {
  const s0 = 2.0;
  const s1 = markerTime(scene, "validation", 7.26) - 0.3;
  const s2 = markerTime(scene, "rules", 11.26) - 0.3;
  const s3 = markerTime(scene, "routed", 15.07) - 0.3;
  const s4 = markerTime(scene, "finally", 16.3) - 0.2;
  return [s0, s1, s2, s3, s4];
}

function activeIndex(t, starts) {
  let idx = -1;
  for (let i = 0; i < starts.length; i += 1) {
    if (t >= starts[i]) idx = i;
  }
  return idx;
}

function drawStageNode(ctx, stage, i, x, active, complete, appear, t) {
  if (appear <= 0.001) return;
  const y = NODE_Y;
  const scale = 0.9 + 0.1 * easeOutBack(appear, 1.15);
  ctx.save();
  ctx.globalAlpha *= clamp(appear);
  ctx.translate(x + NODE_W / 2, y + NODE_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + NODE_W / 2), -(y + NODE_H / 2));

  const glow = active ? 0.8 : complete ? 0.2 : 0;
  D.panel(ctx, x, y, NODE_W, NODE_H, {
    fillTop: active ? "rgba(18, 45, 82, 0.97)" : "rgba(11, 27, 48, 0.95)",
    fillBottom: active ? "rgba(8, 24, 46, 0.98)" : "rgba(5, 15, 29, 0.96)",
    stroke: active ? D.hexAlpha(stage.color, 0.55) : complete ? "rgba(57,230,161,0.30)" : C.line,
    glow,
    glowColor: stage.color,
    accent: active ? D.hexAlpha(stage.color, 0.55) : null,
    radius: 14,
  });

  ctx.save();
  D.roundRectPath(ctx, x + 14, y + 25, 34, 34, 9);
  ctx.fillStyle = D.hexAlpha(stage.color, active ? 0.22 : 0.10);
  ctx.strokeStyle = D.hexAlpha(stage.color, active ? 0.55 : 0.22);
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  D.icon(ctx, stage.icon, x + 31, y + 42, 19, stage.color, { lineWidth: 1.6 });

  D.text(ctx, `0${i + 1}`, x + 14, y + 16, {
    size: 9,
    family: "mono",
    weight: 600,
    color: complete ? C.green : stage.color,
    letterSpacing: 1.2,
    alpha: 0.85,
  });
  D.text(ctx, stage.title, x + 58, y + 38, {
    size: 18,
    family: "display",
    weight: 600,
    color: C.ink,
    baseline: "middle",
    letterSpacing: -0.2,
  });
  D.text(ctx, stage.sub, x + 58, y + 60, {
    size: 11.5,
    weight: 400,
    color: C.muted,
    baseline: "middle",
    alpha: 0.92,
  });

  if (complete) {
    D.checkBadge(ctx, x + NODE_W - 22, y + 18, 10, C.green, { alpha: 0.95, iconSize: 13 });
  } else if (active) {
    D.dot(ctx, x + NODE_W - 18, y + 16, 3.2, stage.color, 0.9);
  }
  ctx.restore();
}

function drawHeader(ctx, idx, t, stageLocal, alpha) {
  if (alpha <= 0.01) return;
  const stage = STAGES[idx];
  ctx.save();
  ctx.globalAlpha = alpha;
  D.text(ctx, `STAGE 0${idx + 1} / 05`, PANEL.x + 40, PANEL.y + 40, {
    size: 10,
    family: "mono",
    weight: 600,
    color: stage.color,
    letterSpacing: 2.2,
  });
  D.text(ctx, stage.title, PANEL.x + 40, PANEL.y + 72, {
    size: 24,
    family: "display",
    weight: 600,
    color: C.ink,
    letterSpacing: -0.3,
  });
  D.statusChip(ctx, stage.status, PANEL.x + PANEL.w - 40, PANEL.y + 58, stage.color, {
    align: "right",
    size: 11,
  });

  // Segment progress under the header.
  const barX = PANEL.x + 40;
  const barY = PANEL.y + 96;
  const gap = 8;
  const segW = (PANEL.w - 80 - gap * 4) / 5;
  for (let i = 0; i < 5; i += 1) {
    const done = i < idx;
    const current = i === idx;
    D.roundRectPath(ctx, barX + i * (segW + gap), barY, segW, 3, 1.5);
    ctx.fillStyle = done
      ? "rgba(57,230,161,0.55)"
      : current
        ? D.hexAlpha(stage.color, 0.9)
        : "rgba(96,150,220,0.14)";
    ctx.fill();
  }
  ctx.restore();
}

/* ------------------------------------------------------------- stage views */

function drawReceive(ctx, local, phase, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  D.text(ctx, "INBOUND QUEUE", 140, 590, {
    size: 10, family: "mono", weight: 600, color: C.muted, letterSpacing: 2.2, alpha: 0.9,
  });
  D.panel(ctx, 140, 592, 440, 212, {
    fill: "rgba(5, 15, 29, 0.7)", stroke: "rgba(90,162,255,0.16)", radius: 14,
  });
  for (let i = 0; i < 3; i += 1) {
    const slide = smooth(inv(local, 0.45 + i * 0.32, 1.1 + i * 0.32));
    const y = 604 + i * 50 - (1 - slide) * 24;
    const a = slide * (i === 0 ? 1 : 0.82 - i * 0.1);
    D.messageCard(ctx, 168 + i * 8, y, 384, 44, {
      type: "pacs.008", desc: i === 0 ? "Customer credit transfer" : "Inbound instruction",
      color: i === 0 ? C.cyan : C.blueSoft, compact: true, alpha: a * 0.95,
    });
  }
  // Receiver slot.
  D.roundRectPath(ctx, 168, 762, 384, 26, 8);
  ctx.fillStyle = "rgba(53,224,255,0.06)";
  ctx.fill();
  ctx.strokeStyle = "rgba(53,224,255,0.24)";
  ctx.lineWidth = 1;
  ctx.stroke();
  D.text(ctx, "RECEIVING", 360, 775, {
    size: 9, family: "mono", weight: 600, color: C.cyan, align: "center", baseline: "middle", letterSpacing: 2,
  });
  D.connection(ctx, [[600, 668], [650, 668]], {
    color: C.cyan, alpha: 0.6, width: 1.4, glow: 0.5, arrow: true,
  });

  // Parsed fields.
  const rows = [
    ["MESSAGE TYPE", "pacs.008"],
    ["SENDER", "BANK-A"],
    ["RECEIVER", "BANK-B"],
    ["AMOUNT", "25,000.00 USD"],
    ["REFERENCE", "GPP-2026-004182"],
  ];
  rows.forEach(([label, value], i) => {
    const a = smooth(inv(local, 0.7 + i * 0.16, 1.1 + i * 0.16));
    const y = 590 + i * 44;
    D.text(ctx, label, 700, y, {
      size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 1.8, alpha: a * 0.9,
    });
    D.text(ctx, value, 880, y, {
      size: 16, family: "mono", weight: 500, color: C.ink, alpha: a * 0.95,
    });
    D.rule(ctx, 700, y + 20, 1750, y + 20, "rgba(96,150,220,0.12)", a * 0.8, 1);
  });
  D.statusChip(ctx, "MESSAGE RECEIVED", 700, 790, C.green, { size: 10 });

  // Little XML beacon on the right.
  D.text(ctx, "<IntrBkSttlmAmt Ccy=\"USD\">", 1310, 598, {
    size: 12, family: "mono", weight: 400, color: C.cyanSoft, alpha: 0.45,
  });
  D.text(ctx, "  <CdtTrfTxInf>", 1330, 620, {
    size: 12, family: "mono", weight: 400, color: C.blueSoft, alpha: 0.3,
  });
  ctx.restore();
}

function drawValidate(ctx, local, phase, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Document being scanned.
  D.panel(ctx, 150, 578, 330, 226, {
    fill: "rgba(6,18,34,0.8)", stroke: "rgba(90,162,255,0.2)", radius: 12,
  });
  const lines = [
    ["<FIToFICstmrCdtTrf>", C.cyanSoft],
    ["  <GrpHdr>", C.blueSoft],
    ["    <MsgId>GPP-2026-004182</MsgId>", C.muted],
    ["  </GrpHdr>", C.blueSoft],
    ["  <CdtTrfTxInf>", C.blueSoft],
    ["    <IntrBkSttlmAmt>25,000.00</...>", C.muted],
    ["  </CdtTrfTxInf>", C.blueSoft],
    ["</FIToFICstmrCdtTrf>", C.cyanSoft],
  ];
  lines.forEach(([line, color], i) => {
    D.text(ctx, line, 174, 612 + i * 22, {
      size: 10.5, family: "mono", weight: 400, color, alpha: 0.72,
    });
  });
  const scanY = 590 + ((local * 62) % 200);
  const g = ctx.createLinearGradient(0, scanY - 16, 0, scanY + 16);
  g.addColorStop(0, "rgba(53,224,255,0)");
  g.addColorStop(0.5, "rgba(53,224,255,0.20)");
  g.addColorStop(1, "rgba(53,224,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(150, scanY - 16, 330, 32);
  D.scanLine(ctx, 150, scanY, 330, C.cyan, 0.75);

  const checkA = smooth(inv(local, 1.2, 1.8));
  D.checkBadge(ctx, 574, 652, 46, C.green, { alpha: checkA, progress: clamp((local - 1.2) / 1.4), iconSize: 42 });
  D.text(ctx, "VALIDATION PASSED", 574, 728, {
    size: 10, family: "mono", weight: 600, color: C.green, align: "center", letterSpacing: 1.8, alpha: checkA,
  });
  D.text(ctx, "Message & business data", 574, 750, {
    size: 11, weight: 400, color: C.muted, align: "center", alpha: checkA * 0.8,
  });

  // Validation checklist.
  const checks = [
    ["Message structure", "Schema and mandatory fields"],
    ["Business data", "Amount, currency and references"],
    ["Identifiers", "BIC and account details"],
    ["Duplicate check", "Reference screening"],
  ];
  checks.forEach(([title, sub], i) => {
    const at = 0.35 + i * 0.34;
    const a = smooth(inv(local, at, at + 0.4));
    const y = 600 + i * 56;
    ctx.save();
    ctx.globalAlpha *= a;
    D.roundRectPath(ctx, 650, y - 22, 1110, 44, 9);
    ctx.fillStyle = "rgba(8,22,41,0.65)";
    ctx.fill();
    ctx.strokeStyle = "rgba(96,150,220,0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (a > 0.6) {
      D.checkBadge(ctx, 680, y, 11, C.green, { alpha: a, iconSize: 13 });
    } else {
      D.ring(ctx, 680, y, 10, "rgba(96,150,220,0.35)", { width: 1, alpha: a });
    }
    D.text(ctx, title, 714, y - 4, {
      size: 15, weight: 500, color: C.ink, baseline: "middle", alpha: a,
    });
    D.text(ctx, sub, 714, y + 13, {
      size: 11, weight: 400, color: C.muted, baseline: "middle", alpha: a * 0.8,
    });
    D.statusChip(ctx, "PASS", 1712, y, C.green, { align: "right", size: 9 });
    ctx.restore();
  });

  D.text(ctx, "Indicative checks — the validation set is configured for the flow", 650, 806, {
    size: 10.5, weight: 400, color: C.dim, alpha: 0.7,
  });
  ctx.restore();
}

function drawRules(ctx, local, phase, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Configuration side panel.
  D.panel(ctx, 150, 580, 400, 220, {
    fill: "rgba(6,18,34,0.8)", stroke: "rgba(53,224,255,0.2)", radius: 12,
  });
  D.text(ctx, "RULE CONFIGURATION", 174, 610, {
    size: 9, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: 2,
  });
  const toggles = ["Currency check", "Amount threshold", "Route selection"];
  toggles.forEach((label, i) => {
    const y = 646 + i * 48;
    const on = smooth(inv(local, 0.35 + i * 0.3, 0.75 + i * 0.3));
    D.text(ctx, label, 174, y, {
      size: 13, weight: 400, color: on > 0.4 ? C.ink : C.muted, baseline: "middle", alpha: 0.92,
    });
    const tx = 474;
    D.roundRectPath(ctx, tx, y - 10, 44, 20, 10);
    ctx.fillStyle = `rgba(57,230,161,${0.12 + 0.22 * on})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(57,230,161,${0.2 + 0.4 * on})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    D.dot(ctx, tx + 10 + 24 * on, y, 7, on > 0.5 ? C.green : C.faint, 0.95);
  });
  D.text(ctx, "Configured for this flow", 174, 782, {
    size: 10.5, weight: 400, color: C.dim, alpha: 0.75,
  });

  // Applied rule cards.
  const rules = [
    ["currency", "=", "USD", "Payment currency supported"],
    ["amount", "≤", "10,000.00", "Within the configured limit"],
    ["route", "=", "GPP", "Directs to the target platform"],
  ];
  rules.forEach(([field, op, value, desc], i) => {
    const at = 0.45 + i * 0.38;
    const a = smooth(inv(local, at, at + 0.45));
    const y = 588 + i * 72;
    ctx.save();
    ctx.globalAlpha *= a;
    D.panel(ctx, 620, y, 1130, 58, {
      fill: "rgba(8,22,41,0.7)", stroke: "rgba(96,150,220,0.2)", radius: 10,
      fillTop: "rgba(11, 28, 50, 0.9)", fillBottom: "rgba(6, 16, 30, 0.9)",
    });
    D.text(ctx, "IF", 646, y + 29, {
      size: 10, family: "mono", weight: 600, color: C.cyan, baseline: "middle", letterSpacing: 1.5,
    });
    D.text(ctx, field, 700, y + 29, {
      size: 16, family: "mono", weight: 500, color: C.ink, baseline: "middle",
    });
    D.text(ctx, op, 830, y + 29, {
      size: 16, family: "mono", weight: 400, color: C.muted, baseline: "middle",
    });
    D.text(ctx, value, 880, y + 29, {
      size: 16, family: "mono", weight: 500, color: C.cyanSoft, baseline: "middle",
    });
    D.text(ctx, desc, 1180, y + 29, {
      size: 11.5, weight: 400, color: C.muted, baseline: "middle", alpha: 0.8,
    });
    D.text(ctx, "→", 1660, y + 29, {
      size: 16, color: C.dim, baseline: "middle", alpha: 0.6,
    });
    D.statusChip(ctx, "APPLIED", 1718, y + 29, C.green, { align: "right", size: 9 });
    ctx.restore();
  });
  D.text(ctx, "Rules are configurable and vary by institution and by flow", 620, 806, {
    size: 10.5, weight: 400, color: C.dim, alpha: 0.7,
  });
  ctx.restore();
}

function drawRoute(ctx, local, phase, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Origin.
  D.panel(ctx, 160, 610, 190, 120, {
    fill: "rgba(12,30,54,0.9)", stroke: "rgba(53,224,255,0.3)", radius: 14,
    glow: 0.4, glowColor: C.cyan,
  });
  D.icon(ctx, "chip", 255, 650, 30, C.cyan, { lineWidth: 1.5 });
  D.text(ctx, "GPP", 255, 696, {
    size: 16, family: "display", weight: 600, color: C.ink, align: "center",
  });
  D.text(ctx, "PROCESSED", 255, 716, {
    size: 8.5, family: "mono", weight: 600, color: C.cyanSoft, align: "center", letterSpacing: 1.4, alpha: 0.8,
  });

  // Route line.
  const pts = [[350, 670], [700, 670], [980, 670], [1210, 670]];
  D.connection(ctx, pts, {
    color: C.cyan, alpha: 0.9, width: 1.6, glow: 0.8, progress: 1, arrow: true, dashed: true,
  });
  const move = (local * 0.34) % 1;
  D.packetOnLine(ctx, pts, move, C.cyan, { r: 4, alpha: 0.95, intensity: 1 });

  // Route decision marker.
  D.pill(ctx, "ROUTE SELECTED", 700, 622, {
    size: 9, height: 24, padX: 11, color: C.cyan,
    bg: "rgba(53,224,255,0.08)", border: "rgba(53,224,255,0.3)", letterSpacing: 1.3,
  });
  D.rule(ctx, 760, 634, 760, 660, "rgba(53,224,255,0.3)", 0.8, 1);

  // Destination.
  const destA = smooth(inv(local, 0.4, 1.0));
  ctx.save();
  ctx.globalAlpha *= destA;
  D.panel(ctx, 1210, 580, 500, 180, {
    fill: "rgba(9,26,46,0.92)", stroke: "rgba(57,230,161,0.3)", radius: 16,
    accent: "rgba(57,230,161,0.4)",
  });
  D.icon(ctx, "layers", 1260, 638, 32, C.green, { lineWidth: 1.6 });
  D.text(ctx, "NEXT PROCESSING", 1308, 626, {
    size: 10, family: "mono", weight: 600, color: C.green, letterSpacing: 1.8,
  });
  D.text(ctx, "DESTINATION", 1308, 648, {
    size: 10, family: "mono", weight: 600, color: C.green, letterSpacing: 1.8,
  });
  D.text(ctx, "Downstream processing & operations", 1260, 686, {
    size: 17, weight: 400, color: C.ink, alpha: 0.9,
  });
  D.text(ctx, "Hand-off initiated", 1260, 714, {
    size: 11.5, weight: 400, color: C.muted, alpha: 0.8,
  });
  D.statusChip(ctx, "ROUTED", 1668, 618, C.green, { align: "right", size: 9 });
  ctx.restore();

  D.text(ctx, "The destination is determined by the configured flow", 160, 806, {
    size: 10.5, weight: 400, color: C.dim, alpha: 0.7,
  });
  ctx.restore();
}

function drawStatus(ctx, local, phase, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const acceptedA = smooth(inv(local, 0.02, 0.5));
  const rejectedA = smooth(inv(local, 0.5, 1.0));

  // Accepted.
  ctx.save();
  ctx.globalAlpha *= acceptedA;
  D.panel(ctx, 160, 570, 750, 210, {
    fillTop: "rgba(10, 30, 40, 0.88)", fillBottom: "rgba(5, 18, 28, 0.92)",
    stroke: "rgba(57,230,161,0.32)", radius: 16,
    accent: "rgba(57,230,161,0.35)", glow: 0.1, glowColor: C.green,
  });
  D.checkBadge(ctx, 220, 622, 24, C.green, { alpha: acceptedA, progress: 1, iconSize: 24 });
  D.text(ctx, "ACCEPTED", 262, 616, {
    size: 26, family: "display", weight: 600, color: C.green, letterSpacing: 0.2,
  });
  D.text(ctx, "Processing completed · status available for tracking", 262, 644, {
    size: 12.5, weight: 400, color: C.muted,
  });
  D.text(ctx, "STATUS", 190, 700, {
    size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 1.8,
  });
  D.text(ctx, "pacs.002", 190, 724, {
    size: 16, family: "mono", weight: 600, color: C.cyanSoft,
  });
  D.text(ctx, "Downstream systems and operations teams can track the outcome.", 190, 758, {
    size: 11.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  ctx.restore();

  // Rejected example.
  ctx.save();
  ctx.globalAlpha *= rejectedA;
  D.panel(ctx, 950, 570, 750, 210, {
    fillTop: "rgba(28, 16, 24, 0.85)", fillBottom: "rgba(14, 9, 16, 0.9)",
    stroke: "rgba(255,92,116,0.28)", radius: 16,
  });
  D.crossBadge(ctx, 1010, 622, 24, C.red, { alpha: rejectedA, progress: 1 });
  D.text(ctx, "REJECTED", 1052, 616, {
    size: 26, family: "display", weight: 600, color: C.red, letterSpacing: 0.2,
  });
  D.pill(ctx, "EXAMPLE OUTCOME", 1690, 594, {
    size: 9, height: 22, padX: 10, color: C.amber,
    bg: "rgba(255,181,71,0.08)", border: "rgba(255,181,71,0.3)", align: "right", letterSpacing: 1.2,
  });
  D.text(ctx, "A rejection is one possible processing outcome — not a guaranteed result.", 1052, 644, {
    size: 12.5, weight: 400, color: C.muted,
  });
  D.text(ctx, "STATUS", 980, 700, {
    size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 1.8,
  });
  D.text(ctx, "Rejection reported", 980, 724, {
    size: 16, family: "mono", weight: 500, color: C.ink,
  });
  D.text(ctx, "Follows the applicable exception process.", 980, 758, {
    size: 11.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  ctx.restore();

  D.text(ctx, "Status generation depends on the applicable flow and the processing outcome", 160, 806, {
    size: 10.5, weight: 400, color: C.dim, alpha: 0.7,
  });
  ctx.restore();
}

function drawDetail(ctx, idx, local, alpha) {
  switch (STAGES[idx].key) {
    case "receive": return drawReceive(ctx, local, 0, alpha);
    case "validate": return drawValidate(ctx, local, 0, alpha);
    case "rules": return drawRules(ctx, local, 0, alpha);
    case "route": return drawRoute(ctx, local, 0, alpha);
    case "status": return drawStatus(ctx, local, 0, alpha);
    default: return undefined;
  }
}

module.exports = function scene3(ctx, t, scene) {
  const starts = stageWindow(t, scene);
  const idx = activeIndex(t, starts);
  const titleA = smooth(inv(t, 0.1, 0.8));

  drawGlow(ctx, W / 2, 560, 1100, 0.16);

  drawSceneTitle(ctx, {
    eyebrow: "INSIDE THE ENGINE",
    title: "How GPP processes a payment",
    sub: "A conceptual five-stage processing pipeline",
    y: 150,
    alpha: titleA,
  });

  // Pipeline rail.
  const railA = smooth(inv(t, 1.0, 1.9));
  D.rule(ctx, 80, NODE_Y - 4, 1840, NODE_Y - 4, "rgba(96,150,220,0.14)", railA, 1);
  for (let i = 0; i < 4; i += 1) {
    const x = NODE_X[i] + NODE_W + 8;
    D.text(ctx, "›", x + 18, NODE_Y + 38, {
      size: 22, color: C.faint, align: "center", baseline: "middle", alpha: railA * 0.8,
    });
  }

  STAGES.forEach((stage, i) => {
    const appear = inv(t, 0.6 + i * 0.22, 1.2 + i * 0.22);
    const active = idx === i;
    const complete = idx > i;
    drawStageNode(ctx, stage, i, NODE_X[i], active, complete, appear, t);
  });

  // Message token above the active stage.
  if (idx >= 0) {
    const stageStart = starts[idx];
    const prevX = idx === 0 ? 44 : NODE_CENTERS[idx - 1];
    const x = lerp(prevX, NODE_CENTERS[idx], easeOutCubic(inv(t, stageStart, stageStart + 0.65)));
    const tokenA = smooth(inv(t, stageStart, stageStart + 0.35));
    const y = 246;
    ctx.save();
    ctx.globalAlpha *= tokenA;
    D.rule(ctx, x, y + 28, x, NODE_Y + 2, "rgba(53,224,255,0.2)", tokenA * 0.7, 1);
    D.panel(ctx, x - 96, y - 24, 192, 50, {
      fill: "rgba(7,22,40,0.96)", stroke: "rgba(53,224,255,0.4)", radius: 10,
      glow: 0.35, glowColor: C.cyan,
    });
    D.icon(ctx, "doc", x - 72, y + 1, 18, C.cyan, { lineWidth: 1.5 });
    D.text(ctx, "pacs.008", x - 54, y - 1, {
      size: 14, family: "mono", weight: 600, color: C.cyanSoft, baseline: "middle",
    });
    D.text(ctx, "PAYMENT", x - 54, y + 14, {
      size: 8, family: "mono", weight: 600, color: C.muted, letterSpacing: 1.2, baseline: "middle",
    });
    ctx.restore();
  }

  // Detail panel.
  const panelA = smooth(inv(t, 1.6, 2.2));
  D.panel(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, {
    fillTop: "rgba(7, 20, 38, 0.86)",
    fillBottom: "rgba(4, 12, 24, 0.9)",
    stroke: "rgba(90,162,255,0.18)",
    radius: 18,
    alpha: panelA,
  });

  if (idx >= 0) {
    const local = t - starts[idx];
    const inA = smooth(inv(t, starts[idx], starts[idx] + 0.25));
    drawHeader(ctx, idx, t, local, panelA * inA);
    drawDetail(ctx, idx, local, panelA * inA);
  }

  // Intro caption before the first stage detail.
  const introA = smooth(inv(t, 0.9, 1.5)) * (1 - smooth(inv(t, 2.0, 2.4)));
  if (introA > 0.01) {
    D.pill(ctx, "GPP PROCESSING ENGINE", W / 2, 770, {
      size: 11, height: 30, padX: 16, color: C.cyan,
      bg: "rgba(53,224,255,0.08)", border: "rgba(53,224,255,0.28)",
      align: "center", letterSpacing: 2.2, alpha: introA * 0.9,
    });
    D.text(ctx, "Receiving · validating · routing · reporting", W / 2, 806, {
      size: 12, weight: 400, color: C.muted, align: "center", alpha: introA * 0.8,
    });
  }
};
