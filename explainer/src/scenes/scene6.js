"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, smooth, easeOutCubic, easeOutBack, pulse, markerTime } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;

const DASH = { x: 1160, y: 245, w: 680, h: 635 };

const STEPS = [
  { key: "failure", title: "PAYMENT FAILURE", sub: "Validation / processing", icon: "alert", color: C.red },
  { key: "status", title: "REJECTION STATUS", sub: "pacs.002 where applicable", icon: "status", color: "#ff9b5e" },
  { key: "investigate", title: "OPERATIONAL INVESTIGATION", sub: "Triage and analysis", icon: "search", color: C.cyan },
  { key: "resolve", title: "RESOLUTION / FOLLOW-UP", sub: "Own the next action", icon: "analytics", color: C.green },
];

function drawTopRow(ctx, t, scene, titleA) {
  const fail = markerTime(scene, "fail", 2.95);
  const rejection = markerTime(scene, "rejection", 7.97);
  const pacs = markerTime(scene, "pacs002", 9.15);
  const incomingA = smooth(inv(t, 0.7, 1.4));
  const gppA = smooth(inv(t, 0.9, 1.6));
  const failed = smooth(inv(t, fail - 0.1, fail + 0.5));
  const statusA = smooth(inv(t, rejection - 0.2, rejection + 0.4));
  const statusPulse = pulse(t, pacs - 0.1, 0.2, 0.8, 0.9);

  // Inbound message.
  D.text(ctx, "INBOUND", 80, 246, {
    size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 2, alpha: incomingA * 0.8,
  });
  D.messageCard(ctx, 80, 262, 252, 96, {
    type: "pacs.008", desc: "Customer credit transfer", color: C.blueSoft,
    alpha: incomingA, appear: incomingA, active: 0.2,
  });
  D.connection(ctx, [[332, 318], [390, 318]], {
    color: C.blueSoft, alpha: incomingA * 0.8, width: 1.3, glow: 0.5, arrow: true,
  });
  const pre = smooth(inv(t, 1.0, 2.0));
  if (pre > 0 && pre < 1) {
    D.packetOnLine(ctx, [[332, 318], [390, 318]], pre, C.cyan, { r: 3, alpha: 0.9, intensity: 0.8 });
  }

  // GPP engine.
  D.nodeCard(ctx, {
    x: 390, y: 255, w: 310, h: 130,
    title: "GPP", sub: "Payment processing", iconName: "chip",
    color: failed > 0.2 ? C.red : C.cyan,
    appear: gppA, active: 0.75,
    badge: failed > 0.2 ? "FAILED" : "PROCESSING",
    badgeColor: failed > 0.2 ? C.red : C.cyan,
  });
  if (failed > 0.01) {
    D.crossBadge(ctx, 704, 292, 16, C.red, { alpha: failed, progress: 1 });
    D.ring(ctx, 545, 320, 82 + 4 * Math.sin(t * 2.4), "rgba(255,92,116,0.35)", { width: 1.2, alpha: failed * 0.7 });
  }

  // Outbound status report.
  if (statusA > 0.01) {
    const x = 760;
    const y = 265;
    D.connection(ctx, [[700, 320], [x, 320]], {
      color: "#ff9b5e", alpha: statusA * 0.7, width: 1.2, glow: 0.5, arrow: true,
      dashed: true,
    });
    const p = smooth(inv(t, rejection, rejection + 0.8));
    if (p > 0 && p < 1) {
      D.packetOnLine(ctx, [[700, 320], [x, 320]], p, "#ff9b5e", { r: 3.2, alpha: 0.9, intensity: 0.8 });
    }
    ctx.save();
    ctx.globalAlpha *= statusA;
    D.panel(ctx, x, y, 360, 120, {
      fillTop: "rgba(38, 22, 30, 0.9)", fillBottom: "rgba(16, 10, 16, 0.94)",
      stroke: "rgba(255, 155, 94, 0.35)", radius: 14,
      glow: statusPulse * 0.3, glowColor: "#ff9b5e",
      accent: "rgba(255,155,94,0.4)",
    });
    D.text(ctx, "pacs.002", x + 20, y + 38, {
      size: 24, family: "mono", weight: 600, color: "#ff9b5e", letterSpacing: -0.4,
    });
    D.text(ctx, "Payment status report", x + 20, y + 62, {
      size: 11.5, weight: 400, color: C.muted,
    });
    D.statusChip(ctx, "RJCT", x + 318, y + 30, C.red, { align: "right", size: 10 });
    D.text(ctx, "Rejection status — where applicable", x + 20, y + 92, {
      size: 10, family: "mono", weight: 500, color: C.dim, alpha: 0.9,
    });
    ctx.restore();
  }
}

function drawValidation(ctx, t, scene) {
  const fail = markerTime(scene, "fail", 2.95);
  const rejectedAt = 4.0;
  const failed = smooth(inv(t, fail - 0.1, fail + 0.4));
  const stampA = smooth(inv(t, rejectedAt, rejectedAt + 0.5));
  if (t < 2.2) return;

  const x = 80;
  const y = 410;
  const w = 650;
  const h = 140;
  D.panel(ctx, x, y, w, h, {
    fillTop: "rgba(8, 22, 41, 0.85)", fillBottom: "rgba(5, 14, 27, 0.9)",
    stroke: failed > 0.2 ? "rgba(255,92,116,0.4)" : "rgba(96,150,220,0.18)",
    radius: 14,
    glow: failed * 0.3, glowColor: C.red,
  });
  D.text(ctx, "VALIDATION", x + 24, y + 32, {
    size: 9, family: "mono", weight: 600, color: failed > 0.2 ? C.red : C.cyan, letterSpacing: 2.2,
  });
  D.statusChip(ctx, failed > 0.2 ? "FAILED" : "CHECKING", x + w - 24, y + 30, failed > 0.2 ? C.red : C.cyan, {
    align: "right", size: 9,
  });

  const rows = [
    ["Message structure", "Schema and mandatory fields", true, 0.3],
    ["Business data", "Account identifier does not pass the check", false, 0.8],
  ];
  rows.forEach(([label, sub, pass, at], i) => {
    const a = smooth(inv(t, 2.4 + at, 2.8 + at));
    const rowFailed = !pass && failed > 0.15;
    const ry = y + 58 + i * 38;
    D.roundRectPath(ctx, x + 24, ry - 14, w - 48, 32, 7);
    ctx.fillStyle = rowFailed ? "rgba(255,92,116,0.08)" : "rgba(7,20,38,0.45)";
    ctx.fill();
    if (a > 0.4) {
      if (pass) D.checkBadge(ctx, x + 44, ry + 1, 9, C.green, { alpha: a, iconSize: 11 });
      else D.crossBadge(ctx, x + 44, ry + 1, 9, C.red, { alpha: a, iconSize: 11 });
    }
    D.text(ctx, label, x + 64, ry - 1, {
      size: 13, weight: 500, color: rowFailed ? C.red : C.ink, baseline: "middle", alpha: a,
    });
    D.text(ctx, sub, x + 240, ry - 1, {
      size: 10.5, weight: 400, color: rowFailed ? "rgba(255,140,155,0.9)" : C.muted, baseline: "middle", alpha: a * 0.85,
    });
    D.text(ctx, pass ? "PASS" : rowFailed ? "FAIL" : "—", x + w - 44, ry - 1, {
      size: 9, family: "mono", weight: 600, color: pass ? C.green : rowFailed ? C.red : C.dim,
      align: "right", baseline: "middle", letterSpacing: 1.2, alpha: a,
    });
  });

  if (stampA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= stampA;
    ctx.translate(300, 562);
    ctx.rotate(-0.045);
    const pop = easeOutBack(stampA, 1.5);
    ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
    D.roundRectPath(ctx, -190, -22, 380, 44, 8);
    ctx.fillStyle = "rgba(255, 92, 116, 0.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 92, 116, 0.65)";
    ctx.lineWidth = 2;
    ctx.stroke();
    D.text(ctx, "PAYMENT REJECTED", 0, 1, {
      size: 23, family: "display", weight: 700, color: C.red,
      align: "center", baseline: "middle", letterSpacing: 1.8,
    });
    ctx.restore();
  }
}

function drawStep(ctx, step, index, x, y, appear, active, done, t) {
  if (appear <= 0.001) return;
  const w = 245;
  const h = 110;
  const scale = 0.94 + 0.06 * easeOutBack(appear, 1.1);
  ctx.save();
  ctx.globalAlpha *= appear;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  D.panel(ctx, x, y, w, h, {
    fillTop: active ? "rgba(20, 42, 70, 0.96)" : "rgba(10, 24, 43, 0.9)",
    fillBottom: active ? "rgba(8, 21, 39, 0.98)" : "rgba(5, 14, 27, 0.92)",
    stroke: active ? D.hexAlpha(step.color, 0.55) : done ? "rgba(57,230,161,0.25)" : "rgba(96,150,220,0.16)",
    glow: active ? 0.55 : 0,
    glowColor: step.color,
    radius: 12,
    accent: active ? D.hexAlpha(step.color, 0.5) : null,
  });
  D.text(ctx, `0${index + 1}`, x + 16, y + 20, {
    size: 8.5, family: "mono", weight: 600, color: step.color, letterSpacing: 1.2,
  });
  D.icon(ctx, step.icon, x + 34, y + 50, 22, step.color, { alpha: active ? 1 : 0.7, lineWidth: 1.6 });
  const titleLines = D.wrapLines(ctx, step.title, 150, 12.5, 600, "display");
  titleLines.slice(0, 2).forEach((line, i) => {
    D.text(ctx, line, x + 58, y + 44 + i * 14, {
      size: 12.5, family: "display", weight: 600, color: C.ink, letterSpacing: -0.1,
    });
  });
  D.text(ctx, step.sub, x + 58, y + 86, {
    size: 9.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  ctx.restore();
}

function drawPath(ctx, t, scene) {
  const fail = markerTime(scene, "fail", 2.95);
  const rejection = markerTime(scene, "rejection", 7.97);
  const ops = markerTime(scene, "operational", 12.13);
  const invest = markerTime(scene, "investigated", 19.62);
  const times = [fail - 0.25, rejection - 0.1, ops - 0.2, invest - 0.2];
  const y = 646;
  const x0 = 80;

  D.text(ctx, "EXCEPTION PATH", 80, 616, {
    size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 2.2, alpha: smooth(inv(t, 2.2, 2.8)) * 0.85,
  });

  const activeStep = t >= times[3] ? 3 : t >= times[2] ? 2 : t >= times[1] ? 1 : t >= times[0] ? 0 : -1;
  for (let i = 0; i < 4; i += 1) {
    const appear = smooth(inv(t, times[i], times[i] + 0.45));
    const active = activeStep === i;
    const x = x0 + i * 265;
    if (appear <= 0.001) {
      ctx.save();
      ctx.globalAlpha *= 0.12;
      drawStep(ctx, STEPS[i], i, x, y, 1, false, false, t);
      ctx.restore();
    } else {
      drawStep(ctx, STEPS[i], i, x, y, appear, active, false, t);
    }
    if (i < 3) {
      const ax = x + 245 + 2;
      D.text(ctx, "›", ax + 9, y + 55, {
        size: 22, color: activeStep > i ? C.green : C.faint, align: "center", baseline: "middle",
        alpha: Math.max(appear, 0.12) * 0.9,
      });
    }
  }

  D.text(ctx, "Illustrative exception path — status generation depends on the applicable flow", 80, 804, {
    size: 10.5, weight: 400, color: C.dim, alpha: smooth(inv(t, 3.4, 4.0)) * 0.68,
  });
}

function drawDashboard(ctx, t, scene) {
  const appear = smooth(inv(t, 1.3, 2.0));
  if (appear <= 0.01) return;
  const triggered = markerTime(scene, "triggered", 15.56);
  const system = markerTime(scene, "system", 16.44);
  const impact = markerTime(scene, "impact", 18.19);
  const investigated = markerTime(scene, "investigated", 19.62);

  let activeRow = -1;
  if (t >= investigated - 0.2) activeRow = 6;
  else if (t >= impact - 0.2) activeRow = 5;
  else if (t >= system - 0.2) activeRow = 4;
  else if (t >= triggered - 0.2) activeRow = 3;

  ctx.save();
  ctx.globalAlpha *= appear;
  D.panel(ctx, DASH.x, DASH.y, DASH.w, DASH.h, {
    fillTop: "rgba(9, 24, 44, 0.94)",
    fillBottom: "rgba(4, 12, 24, 0.97)",
    stroke: "rgba(53,224,255,0.2)",
    radius: 18,
  });
  D.text(ctx, "BUSINESS ANALYST VIEW", DASH.x + 28, DASH.y + 42, {
    size: 10.5, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: 2.4,
  });
  D.text(ctx, "Exception triage", DASH.x + 28, DASH.y + 66, {
    size: 12, weight: 400, color: C.muted, alpha: 0.85,
  });
  D.ring(ctx, DASH.x + DASH.w - 48, DASH.y + 48, 20, "rgba(53,224,255,0.3)", { width: 1 });
  D.icon(ctx, "user", DASH.x + DASH.w - 48, DASH.y + 48, 24, C.cyan, { alpha: 0.8, lineWidth: 1.5 });
  D.text(ctx, "BA", DASH.x + DASH.w - 48, DASH.y + 78, {
    size: 8, family: "mono", weight: 600, color: C.muted, align: "center", letterSpacing: 1.2, alpha: 0.7,
  });

  const rows = [
    ["PAYMENT REFERENCE", "GPP-2026-004182"],
    ["MESSAGE TYPE", "pacs.008 → pacs.002"],
    ["PROCESSING STATUS", "REJECTED"],
    ["REJECTION REASON", "Invalid account identifier"],
    ["DOWNSTREAM SYSTEM", "Payment operations"],
    ["EXCEPTION INDICATOR", "OPEN"],
    ["NEXT ACTION", "Investigate & follow up"],
  ];
  const rowH = 64;
  const startY = DASH.y + 100;
  rows.forEach(([label, value], i) => {
    const y = startY + i * rowH;
    const active = i === activeRow;
    const rowA = smooth(inv(t, 1.7 + i * 0.09, 2.1 + i * 0.09));
    ctx.save();
    ctx.globalAlpha *= rowA;
    if (active) {
      D.roundRectPath(ctx, DASH.x + 16, y - 2, DASH.w - 32, rowH - 6, 8);
      ctx.fillStyle = "rgba(53,224,255,0.07)";
      ctx.fill();
      ctx.strokeStyle = "rgba(53,224,255,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
      D.dot(ctx, DASH.x + 8, y + 28, 2.6, C.cyan, 0.9);
    }
    D.text(ctx, label, DASH.x + 30, y + 14, {
      size: 8.5, family: "mono", weight: 600, color: active ? C.cyanSoft : C.dim,
      letterSpacing: 1.7, alpha: active ? 1 : 0.85,
    });
    if (i === 2) {
      D.statusChip(ctx, "REJECTED", DASH.x + 30, y + 38, C.red, { size: 10 });
    } else if (i === 5) {
      D.statusChip(ctx, "OPEN", DASH.x + 30, y + 38, C.amber, { size: 10 });
    } else if (i === 3) {
      D.text(ctx, value, DASH.x + 30, y + 40, {
        size: 14, family: "body", weight: 500, color: active ? C.ink : C.muted,
      });
    } else {
      D.text(ctx, value, DASH.x + 30, y + 40, {
        size: 14.5, family: "mono", weight: 500, color: active ? C.ink : C.muted,
      });
    }
    D.rule(ctx, DASH.x + 30, y + rowH - 8, DASH.x + DASH.w - 30, y + rowH - 8, "rgba(96,150,220,0.10)", 0.7, 1);
    ctx.restore();
  });

  D.text(ctx, "Illustrative data — the applicable flow determines the status", DASH.x + 28, DASH.y + DASH.h - 22, {
    size: 10, weight: 400, color: C.dim, alpha: 0.65,
  });
  ctx.restore();
}

module.exports = function scene6(ctx, t, scene) {
  const titleA = smooth(inv(t, 0.1, 0.8));
  const fail = markerTime(scene, "fail", 2.95);
  const failureGlow = pulse(t, fail - 0.1, 0.2, 0.6, 1.0);

  drawGlow(ctx, 500, 400, 900, 0.16 + failureGlow * 0.12);
  drawGlow(ctx, 500, 400, 600, failureGlow * 0.22, "red");

  drawSceneTitle(ctx, {
    eyebrow: "EXCEPTIONS & ANALYSIS",
    title: "When a payment fails",
    sub: "From a rejection status to operational investigation",
    y: 150,
    alpha: titleA,
  });

  drawTopRow(ctx, t, scene, titleA);
  drawValidation(ctx, t, scene);
  drawPath(ctx, t, scene);
  drawDashboard(ctx, t, scene);
};
