"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, smooth, easeOutCubic, easeOutBack, pulse, markerTime } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;

const LEFT = { x: 80, y: 416, w: 850, h: 440 };
const RIGHT = { x: 990, y: 416, w: 850, h: 440 };
const DIVIDER = 960;

function drawBank(ctx, x, y, label, sub, iconName, color, appear, active) {
  D.nodeCard(ctx, {
    x, y, w: 300, h: 104,
    title: label,
    sub,
    iconName,
    color,
    appear,
    active,
    badge: null,
    tiny: false,
  });
}

function drawAccountCard(ctx, opts) {
  const {
    x, y, w, h, bankLabel, relationship, badge, badgeColor,
    balance, reference, icon, active, alpha, callout, calloutColor,
  } = opts;
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  D.panel(ctx, x, y, w, h, {
    fillTop: active ? "rgba(16, 40, 68, 0.96)" : "rgba(10, 25, 45, 0.94)",
    fillBottom: active ? "rgba(7, 21, 40, 0.98)" : "rgba(5, 15, 29, 0.96)",
    stroke: active ? D.hexAlpha(badgeColor, 0.5) : "rgba(96,150,220,0.18)",
    glow: active ? 0.55 : 0,
    glowColor: badgeColor,
    accent: active ? D.hexAlpha(badgeColor, 0.45) : null,
    radius: 14,
  });
  D.icon(ctx, icon, x + 44, y + 40, 26, badgeColor, { alpha: active ? 1 : 0.7, lineWidth: 1.6 });
  D.text(ctx, bankLabel, x + 74, y + 28, {
    size: 9, family: "mono", weight: 600, color: C.muted, letterSpacing: 1.8,
  });
  D.text(ctx, relationship, x + 74, y + 50, {
    size: 17, family: "display", weight: 500, color: C.ink, letterSpacing: -0.2,
  });
  D.text(ctx, balance, x + 74, y + 80, {
    size: 15, family: "mono", weight: 600, color: C.ink,
  });
  D.text(ctx, reference, x + 280, y + 80, {
    size: 10, family: "mono", weight: 400, color: C.dim, letterSpacing: 0.4,
  });
  D.pill(ctx, badge, x + w - 20, y + 28, {
    size: 10, height: 28, padX: 12, color: badgeColor,
    bg: D.hexAlpha(badgeColor, 0.12), border: D.hexAlpha(badgeColor, 0.4),
    align: "right", letterSpacing: 1.8,
  });
  if (callout && (opts.calloutAlpha || 0) > 0.01) {
    D.text(ctx, callout, x + w - 20, y + 52, {
      size: 10, weight: 500, color: calloutColor || badgeColor,
      align: "right", alpha: opts.calloutAlpha,
    });
  }
  if (active) {
    D.dot(ctx, x + 18, y + h - 18, 2.6, badgeColor, 0.9);
  }
  ctx.restore();
}

function drawMessageLane(ctx, t, scene, appear) {
  if (appear <= 0.01) return;
  const alpha = appear;
  ctx.save();
  ctx.globalAlpha = alpha;

  D.text(ctx, "01", LEFT.x + 40, LEFT.y + 42, {
    size: 10, family: "mono", weight: 600, color: C.cyan, letterSpacing: 2.2,
  });
  D.text(ctx, "PAYMENT INSTRUCTION", LEFT.x + 40, LEFT.y + 74, {
    size: 24, family: "display", weight: 600, color: C.ink, letterSpacing: -0.3,
  });
  D.text(ctx, "A message travelling between banks", LEFT.x + 40, LEFT.y + 102, {
    size: 12, weight: 400, color: C.muted, alpha: 0.9,
  });
  D.pill(ctx, "MESSAGING LANE", LEFT.x + LEFT.w - 40, LEFT.y + 56, {
    size: 9, height: 24, padX: 11, color: C.cyan,
    bg: "rgba(53,224,255,0.07)", border: "rgba(53,224,255,0.28)",
    align: "right", letterSpacing: 1.4,
  });

  const laneY = 646;
  const x0 = LEFT.x + 60;
  const x1 = LEFT.x + LEFT.w - 60;
  D.rule(ctx, x0, laneY, x1, laneY, "rgba(53,224,255,0.18)", 1, 1.2);

  D.pill(ctx, "BANK A", x0 + 6, laneY, {
    size: 9, height: 26, padX: 10, color: C.blueSoft,
    bg: "rgba(90,162,255,0.08)", border: "rgba(90,162,255,0.28)", letterSpacing: 1.4,
  });
  D.pill(ctx, "BANK B", x1 - 6, laneY, {
    size: 9, height: 26, padX: 10, color: C.cyan,
    bg: "rgba(53,224,255,0.08)", border: "rgba(53,224,255,0.28)", align: "right", letterSpacing: 1.4,
  });

  // Moving instruction card.
  const progress = (t * 0.16) % 1;
  const cx = lerp(x0 + 120, x1 - 120, progress);
  const cy = laneY - 56;
  D.rule(ctx, cx, cy + 24, cx, laneY, "rgba(53,224,255,0.18)", 0.7, 1);
  D.messageCard(ctx, cx - 120, cy - 24, 240, 48, {
    type: "pacs.008", desc: "Payment instruction", color: C.cyan, compact: true, alpha: 0.95,
  });

  D.text(ctx, "INSTRUCTION MESSAGE", LEFT.x + 60, laneY + 42, {
    size: 9, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: 2,
  });
  D.text(ctx, "pacs.008", LEFT.x + LEFT.w - 60, laneY + 42, {
    size: 10, family: "mono", weight: 600, color: C.cyan, align: "right", letterSpacing: 0.8,
  });

  // Message vs funds callout inside the lane.
  D.panel(ctx, LEFT.x + 40, LEFT.y + 300, LEFT.w - 80, 74, {
    fill: "rgba(8, 22, 41, 0.7)", stroke: "rgba(96,150,220,0.16)", radius: 10,
  });
  D.icon(ctx, "doc", LEFT.x + 70, LEFT.y + 337, 22, C.cyan, { alpha: 0.75, lineWidth: 1.5 });
  D.text(ctx, "A payment instruction is a message.", LEFT.x + 98, LEFT.y + 330, {
    size: 14, weight: 500, color: C.ink,
  });
  D.text(ctx, "It does not, by itself, move funds.", LEFT.x + 98, LEFT.y + 352, {
    size: 11.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  ctx.restore();
}

function drawFundsPacket(ctx, x, y, alpha, t) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  D.dot(ctx, x, y, 13, "rgba(57,230,161,0.14)", 1);
  D.ring(ctx, x, y, 13, "rgba(57,230,161,0.5)", { width: 1.2, alpha: 0.9 });
  D.text(ctx, "$", x, y + 1, {
    size: 12, family: "mono", weight: 600, color: C.green, align: "center", baseline: "middle",
  });
  D.ring(ctx, x, y, 20 + 3 * Math.sin(t * 2.4), "rgba(57,230,161,0.2)", { width: 1, alpha: 0.5 });
  ctx.restore();
}

function drawAccountsLane(ctx, t, scene, appear) {
  if (appear <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = appear;

  D.text(ctx, "02", RIGHT.x + 40, RIGHT.y + 42, {
    size: 10, family: "mono", weight: 600, color: C.green, letterSpacing: 2.2,
  });
  D.text(ctx, "CORRESPONDENT ACCOUNTS", RIGHT.x + 40, RIGHT.y + 74, {
    size: 24, family: "display", weight: 600, color: C.ink, letterSpacing: -0.3,
  });
  D.text(ctx, "From Bank A's perspective", RIGHT.x + 40, RIGHT.y + 102, {
    size: 12, weight: 400, color: C.muted, alpha: 0.9,
  });
  D.pill(ctx, "ACCOUNT RELATIONSHIP", RIGHT.x + RIGHT.w - 40, RIGHT.y + 56, {
    size: 9, height: 24, padX: 11, color: C.green,
    bg: "rgba(57,230,161,0.07)", border: "rgba(57,230,161,0.28)",
    align: "right", letterSpacing: 1.4,
  });

  const nostro2 = markerTime(scene, "nostro2", 3.37);
  const vostro2 = markerTime(scene, "vostro2", 6.06);
  const co = markerTime(scene, "correspondent", 9.7);
  const st = markerTime(scene, "settlement", 11.04);
  const settling = markerTime(scene, "settling", 13.32);
  const same = markerTime(scene, "same", 16.0);

  const nostroActive = 0.35 + 0.65 * Math.max(
    pulse(t, 1.7, 0.2, 0.45, 0.6),
    pulse(t, nostro2 - 0.1, 0.2, 1.0, 0.8),
    0.25 * pulse(t, co, 0.2, 0.6, 0.8)
  );
  const vostroActive = 0.35 + 0.65 * Math.max(
    pulse(t, 2.25, 0.2, 0.45, 0.6),
    pulse(t, vostro2 - 0.1, 0.2, 1.0, 0.8),
    0.25 * pulse(t, co, 0.2, 0.6, 0.8)
  );

  const calloutN = smooth(inv(t, nostro2 - 0.1, nostro2 + 0.5));
  const calloutV = smooth(inv(t, vostro2 - 0.1, vostro2 + 0.5));

  drawAccountCard(ctx, {
    x: RIGHT.x + 40, y: RIGHT.y + 114, w: RIGHT.w - 80, h: 112,
    bankLabel: "BANK A'S ACCOUNT",
    relationship: "Maintained with Bank B",
    badge: "NOSTRO", badgeColor: C.blueSoft,
    balance: "USD 1,250,000.00",
    reference: "**** 4821",
    icon: "ledger",
    active: clamp(nostroActive),
    alpha: 1,
    callout: "OUR ACCOUNT WITH THEM",
    calloutColor: C.blueSoft,
    calloutAlpha: calloutN * 0.9,
  });

  drawAccountCard(ctx, {
    x: RIGHT.x + 40, y: RIGHT.y + 240, w: RIGHT.w - 80, h: 112,
    bankLabel: "BANK B'S ACCOUNT",
    relationship: "Maintained with Bank A",
    badge: "VOSTRO", badgeColor: C.cyan,
    balance: "USD 840,000.00",
    reference: "**** 7314",
    icon: "ledger",
    active: clamp(vostroActive),
    alpha: 1,
    callout: "THEIR ACCOUNT WITH US",
    calloutColor: C.cyan,
    calloutAlpha: calloutV * 0.9,
  });

  // Settlement lane.
  const laneA = smooth(inv(t, st - 0.3, st + 0.6));
  const sx0 = RIGHT.x + 50;
  const sx1 = RIGHT.x + RIGHT.w - 50;
  const sy = RIGHT.y + 398;
  if (laneA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= laneA;
    D.text(ctx, "SETTLEMENT LANE", RIGHT.x + 40, RIGHT.y + 374, {
      size: 9, family: "mono", weight: 600, color: C.green, letterSpacing: 2,
    });
    D.rule(ctx, sx0, sy, sx1, sy, "rgba(57,230,161,0.22)", 1, 1.2);
    D.text(ctx, "FUNDS MOVEMENT", (sx0 + sx1) / 2, sy - 18, {
      size: 9, family: "mono", weight: 600, color: C.green,
      align: "center", letterSpacing: 1.8, alpha: 0.75,
    });

    const fundsP = smooth(inv(t, settling - 0.2, settling + 1.6));
    if (fundsP > 0.01) {
      const fx = lerp(sx0 + 40, sx1 - 40, fundsP);
      drawFundsPacket(ctx, fx, sy, 1, t);
      if (fundsP > 0.85) {
        D.statusChip(ctx, "FUNDS POSTED", sx1 - 40, sy - 42, C.green, { align: "right", size: 9 });
      }
    }
    D.text(ctx, "Posting of funds — separate from the instruction message", RIGHT.x + 40, RIGHT.y + 428, {
      size: 10, weight: 400, color: C.dim, alpha: 0.75,
    });
    ctx.restore();
  }

  // Message != settlement.
  const neqA = smooth(inv(t, same - 0.15, same + 0.55));
  if (neqA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= neqA;
    const y = 868;
    D.panel(ctx, DIVIDER - 230, y - 17, 460, 34, {
      fill: "rgba(5, 14, 27, 0.94)",
      stroke: "rgba(90,162,255,0.28)",
      radius: 18,
    });
    D.text(ctx, "MESSAGE", DIVIDER - 150, y + 1, {
      size: 12, family: "mono", weight: 600, color: C.cyan,
      align: "right", baseline: "middle", letterSpacing: 1.2,
    });
    D.text(ctx, "≠", DIVIDER, y + 1, {
      size: 20, family: "display", weight: 600, color: C.ink,
      align: "center", baseline: "middle",
    });
    D.text(ctx, "SETTLEMENT", DIVIDER + 150, y + 1, {
      size: 12, family: "mono", weight: 600, color: C.green,
      align: "left", baseline: "middle", letterSpacing: 1.2,
    });
    ctx.restore();
  }
  ctx.restore();
}

function drawCorrespondentArcs(ctx, t, scene, alpha) {
  if (alpha <= 0.01) return;
  const start = markerTime(scene, "correspondent", 9.7);
  const p = smooth(inv(t, start - 0.8, start + 0.4));
  const ax = 460;
  const bx = 1460;
  const y = 324;
  const leftPts = [];
  const rightPts = [];
  for (let i = 0; i <= 24; i += 1) {
    const q = i / 24;
    const lx = (1 - q) * (1 - q) * ax + 2 * (1 - q) * q * 710 + q * q * 930;
    const ly = (1 - q) * (1 - q) * y + 2 * (1 - q) * q * (y - 86) + q * q * y;
    leftPts.push([lx, ly]);
    const rx = (1 - q) * (1 - q) * 990 + 2 * (1 - q) * q * 1210 + q * q * bx;
    const ry = (1 - q) * (1 - q) * y + 2 * (1 - q) * q * (y - 86) + q * q * y;
    rightPts.push([rx, ry]);
  }
  const sliceL = leftPts.slice(0, Math.max(2, Math.floor(leftPts.length * p)));
  const sliceR = rightPts.slice(0, Math.max(2, Math.floor(rightPts.length * p)));
  D.connection(ctx, sliceL, {
    color: C.cyan, alpha: alpha * 0.5, width: 1.2, glow: 0.5, arrow: false, baseAlpha: 0.05,
  });
  D.connection(ctx, sliceR, {
    color: C.cyan, alpha: alpha * 0.5, width: 1.2, glow: 0.5, arrow: false, baseAlpha: 0.05,
  });
  const q = (t * 0.3) % 1;
  const pl = D.pointOnPolyline(leftPts, q);
  const pr = D.pointOnPolyline(rightPts, 1 - q);
  if (pl) D.packet(ctx, pl.x, pl.y, C.cyan, { r: 2.6, alpha: alpha * 0.7, direction: pl.angle, intensity: 0.6 });
  if (pr) D.packet(ctx, pr.x, pr.y, C.cyan, { r: 2.6, alpha: alpha * 0.7, direction: pr.angle, intensity: 0.6 });

  ctx.save();
  ctx.globalAlpha = alpha;
  D.ring(ctx, DIVIDER, y, 31, "rgba(53,224,255,0.4)", { width: 1.2 });
  D.icon(ctx, "globe", DIVIDER, y, 38, C.cyan, { alpha: 0.8, lineWidth: 1.4 });
  D.text(ctx, "CORRESPONDENT RELATIONSHIP", DIVIDER, y + 48, {
    size: 8.5, family: "mono", weight: 600, color: C.cyanSoft,
    align: "center", letterSpacing: 2, alpha: 0.85,
  });
  ctx.restore();
}

module.exports = function scene5(ctx, t, scene) {
  const titleA = smooth(inv(t, 0.1, 0.8));
  const banksA = smooth(inv(t, 0.5, 1.2));
  const lanesA = smooth(inv(t, 0.9, 1.7));
  const arcsA = smooth(inv(t, markerTime(scene, "correspondent", 9.7) - 0.2, markerTime(scene, "correspondent", 9.7) + 0.4));

  drawGlow(ctx, W / 2, 520, 900, 0.14);

  drawSceneTitle(ctx, {
    eyebrow: "CORRESPONDENT BANKING",
    title: "Nostro, Vostro and settlement",
    sub: "Instruction and settlement are related — but they are not the same event",
    y: 150,
    alpha: titleA,
  });

  drawBank(ctx, 160, 272, "BANK A", "Sending bank", "bank", C.blueSoft, banksA, 0.25);
  drawBank(ctx, 1460, 272, "BANK B", "Receiving bank", "bank", C.cyan, banksA, 0.25);
  drawCorrespondentArcs(ctx, t, scene, arcsA);

  // Panels.
  D.panel(ctx, LEFT.x, LEFT.y, LEFT.w, LEFT.h, {
    fillTop: "rgba(7, 20, 38, 0.78)", fillBottom: "rgba(4, 12, 24, 0.84)",
    stroke: "rgba(90,162,255,0.16)", radius: 18, alpha: lanesA,
  });
  D.panel(ctx, RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h, {
    fillTop: "rgba(7, 20, 38, 0.78)", fillBottom: "rgba(4, 12, 24, 0.84)",
    stroke: "rgba(90,162,255,0.16)", radius: 18, alpha: lanesA,
  });
  D.rule(ctx, DIVIDER, 416, DIVIDER, 856, "rgba(96,150,220,0.13)", lanesA, 1);

  drawMessageLane(ctx, t, scene, lanesA);
  drawAccountsLane(ctx, t, scene, lanesA);
};
