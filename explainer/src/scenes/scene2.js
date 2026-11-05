"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, smooth, easeOutCubic, easeOutBack, pulse, markerTime } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;

const NODES = {
  bank: { x: 108, y: 458, w: 282, h: 142 },
  swift: { x: 462, y: 458, w: 248, h: 142 },
  pmg: { x: 790, y: 458, w: 292, h: 142 },
  gpp: { x: 1232, y: 336, w: 320, h: 142 },
  ips: { x: 1232, y: 578, w: 320, h: 142 },
};

const Y = 529; // main message bus
const BRANCH_X = 1160;
const GPP_Y = NODES.gpp.y + NODES.gpp.h / 2;
const IPS_Y = NODES.ips.y + NODES.ips.h / 2;

const LINE_BANK_SWIFT = [[NODES.bank.x + NODES.bank.w, Y], [NODES.swift.x, Y]];
const LINE_SWIFT_PMG = [[NODES.swift.x + NODES.swift.w, Y], [NODES.pmg.x, Y]];
const LINE_PMG_BRANCH = [[NODES.pmg.x + NODES.pmg.w, Y], [BRANCH_X, Y]];
const LINE_TO_GPP = [[BRANCH_X, Y], [1198, Y], [1198, GPP_Y], [NODES.gpp.x, GPP_Y]];
const LINE_TO_IPS = [[BRANCH_X, Y], [1198, Y], [1198, IPS_Y], [NODES.ips.x, IPS_Y]];

function drawMigration(ctx, t, scene) {
  const start = markerTime(scene, "migration", 17.7);
  const p = smooth(inv(t, start - 0.2, start + 1.4));
  const alpha = inv(t, start - 0.25, start + 0.35);
  if (alpha <= 0.01) return;

  const x = 1590;
  const top = NODES.gpp.y + NODES.gpp.h - 12;
  const bottom = NODES.ips.y + 12;

  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(0, bottom, 0, top);
  g.addColorStop(0, "rgba(255,181,71,0.15)");
  g.addColorStop(0.5, "rgba(90,162,255,0.5)");
  g.addColorStop(1, "rgba(53,224,255,0.9)");
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.4;
  ctx.shadowColor = C.cyan;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x, bottom);
  ctx.lineTo(x, bottom + (top - bottom) * p);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (p > 0.12) {
    D.arrowHead(ctx, x, bottom + (top - bottom) * p, -Math.PI / 2, 12, C.cyanSoft, alpha);
  }

  // Moving migration packets.
  for (let i = 0; i < 3; i += 1) {
    const q = (t * 0.5 + i * 0.33) % 1;
    if (q < p) {
      D.packet(ctx, x, bottom + (top - bottom) * q, i === 1 ? C.cyan : C.blueSoft, {
        r: 2.6,
        alpha: alpha * 0.8,
        direction: -Math.PI / 2,
        intensity: 0.7,
      });
    }
  }

  // Label rail.
  ctx.save();
  ctx.translate(x + 30, (top + bottom) / 2);
  ctx.rotate(-Math.PI / 2);
  D.text(ctx, "MIGRATION PATH", 0, 0, {
    size: 10,
    family: "mono",
    weight: 600,
    color: C.cyanSoft,
    align: "center",
    baseline: "middle",
    letterSpacing: 3,
    alpha: 0.9,
  });
  ctx.restore();

  // Target platform badge.
  const badgeA = smooth(inv(t, start + 0.9, start + 1.5));
  if (badgeA > 0.01) {
    const bx = NODES.gpp.x + 12;
    const by = NODES.gpp.y - 24;
    ctx.save();
    ctx.globalAlpha *= badgeA;
    D.pill(ctx, "TARGET PLATFORM", bx, by, {
      size: 11,
      height: 30,
      padX: 14,
      color: C.green,
      bg: "rgba(57,230,161,0.10)",
      border: "rgba(57,230,161,0.38)",
      letterSpacing: 1.6,
      dotColor: C.green,
    });
    D.connection(ctx, [[bx + 70, by + 16], [bx + 70, NODES.gpp.y - 2]], {
      color: C.green,
      alpha: badgeA * 0.7,
      width: 1,
      glow: 0.5,
      arrow: true,
      arrowSize: 7,
    });
    ctx.restore();
  }
  ctx.restore();
}

function drawIntegration(ctx, t, scene) {
  const start = markerTime(scene, "downstream", 10.95);
  const a = smooth(inv(t, start - 0.2, start + 1.0));
  if (a <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = a;
  const x1 = 460;
  const x2 = 1552;
  const y = 754;
  const depth = 30;

  ctx.strokeStyle = "rgba(53,224,255,0.38)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x1, y + depth);
  ctx.lineTo(x2, y + depth);
  ctx.lineTo(x2, y);
  ctx.stroke();

  D.text(ctx, "DOWNSTREAM PAYMENT ENVIRONMENT", (x1 + x2) / 2, y + depth + 22, {
    size: 10,
    family: "mono",
    weight: 600,
    color: C.cyanSoft,
    align: "center",
    letterSpacing: 3,
    alpha: 0.9,
  });

  // PMG integration callout.
  const px = NODES.pmg.x + NODES.pmg.w / 2;
  const py = NODES.pmg.y + NODES.pmg.h;
  D.connection(ctx, [[px, py], [px, y]], {
    color: C.cyan,
    alpha: 0.8,
    width: 1.2,
    glow: 0.6,
    dashed: false,
    arrow: false,
  });
  D.pill(ctx, "INTEGRATION POINT", px, py + 44, {
    size: 10,
    height: 26,
    padX: 12,
    color: C.cyan,
    bg: "rgba(53,224,255,0.08)",
    border: "rgba(53,224,255,0.3)",
    align: "center",
    letterSpacing: 1.3,
    alpha: 0.9,
  });
  ctx.restore();
}

function drawRouter(ctx, t, scene) {
  const start = markerTime(scene, "ips", 15.5) - 0.8;
  const a = smooth(inv(t, start, start + 0.7));
  if (a <= 0.01) return;
  const x = BRANCH_X;
  const y = Y;
  ctx.save();
  ctx.globalAlpha = a;
  D.ring(ctx, x, y, 17, "rgba(53,224,255,0.55)", { width: 1.4, alpha: 0.9 });
  D.dot(ctx, x, y, 4, C.cyan, 0.9);
  D.ring(ctx, x, y, 26 + 4 * Math.sin(t * 2), "rgba(53,224,255,0.22)", { width: 1, alpha: 0.8 });
  D.text(ctx, "CONFIGURED FLOW", x - 18, y + 38, {
    size: 9,
    family: "mono",
    weight: 600,
    color: C.cyanSoft,
    align: "right",
    letterSpacing: 1.7,
    alpha: 0.85,
  });
  ctx.restore();
}

module.exports = function scene2(ctx, t, scene) {
  const titleA = smooth(inv(t, 0.1, 0.8));
  const appearBank = inv(t, 0.5, 1.15);
  const appearSwift = inv(t, 1.1, 1.75);
  const appearPmg = inv(t, 1.7, 2.35);
  const appearEngines = inv(t, 2.2, 2.95);
  const lineA = smooth(inv(t, 1.9, 3.1));

  const mSending = markerTime(scene, "sending", 5.0);
  const mSwift = markerTime(scene, "swift", 5.7);
  const mPmg = markerTime(scene, "pmg", 7.85);
  const mDownstream = markerTime(scene, "downstream", 10.95);
  const mIps = markerTime(scene, "ips", 15.49);
  const mGpp = markerTime(scene, "gpp", 16.58);
  const mTarget = markerTime(scene, "target", 21.28);

  drawGlow(ctx, W * 0.7, 430, 920, 0.22);

  drawSceneTitle(ctx, {
    eyebrow: "THE PAYMENT ECOSYSTEM",
    title: "Where GPP fits",
    sub: "A conceptual, project-specific flow from sending bank to processing engine",
    y: 150,
    alpha: titleA,
  });

  // Group panel around the processing engines.
  const groupA = smooth(inv(t, 2.4, 3.2));
  if (groupA > 0.01) {
    ctx.save();
    ctx.globalAlpha = groupA * 0.9;
    D.roundRectPath(ctx, 1200, 300, 384, 470, 22);
    ctx.fillStyle = "rgba(6, 18, 34, 0.42)";
    ctx.fill();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(90,162,255,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    D.text(ctx, "PROCESSING ENGINES", 1224, 286, {
      size: 9,
      family: "mono",
      weight: 600,
      color: C.dim,
      letterSpacing: 2.4,
      alpha: groupA * 0.8,
    });
  }

  // Main bus.
  D.connection(ctx, LINE_BANK_SWIFT, {
    color: C.blueSoft, alpha: 0.9, progress: lineA, width: 1.6, glow: 0.7,
  });
  D.connection(ctx, LINE_SWIFT_PMG, {
    color: C.blueSoft, alpha: 0.9, progress: smooth(inv(t, 2.2, 3.2)), width: 1.6, glow: 0.7,
  });
  D.connection(ctx, LINE_PMG_BRANCH, {
    color: C.blueSoft, alpha: 0.9, progress: smooth(inv(t, 2.5, 3.4)), width: 1.6, glow: 0.7,
  });
  D.connection(ctx, LINE_TO_GPP, {
    color: C.blue, alpha: 0.8, progress: smooth(inv(t, 2.7, 3.7)), width: 1.5, glow: 0.6,
  });
  D.connection(ctx, LINE_TO_IPS, {
    color: C.amber, alpha: 0.62, progress: smooth(inv(t, 2.8, 3.8)), width: 1.5, glow: 0.45,
  });

  // Nodes.
  const baseActive = 0.24;
  const swiftActive = baseActive + 0.75 * pulse(t, mSwift - 0.15, 0.18, 0.75, 1.0);
  const pmgActive = baseActive + 0.75 * pulse(t, mPmg - 0.15, 0.18, 1.0, 1.2) + 0.45 * pulse(t, mDownstream - 0.1, 0.2, 0.8, 1.0);
  const ipsActive = baseActive + 0.7 * pulse(t, mIps - 0.15, 0.2, 0.7, 1.0);
  const gppActive = baseActive + 0.75 * pulse(t, mGpp - 0.2, 0.25, 1.0, 1.2) + 0.4 * pulse(t, mTarget - 0.2, 0.25, 0.8, 1.0);
  const bankActive = baseActive + 0.55 * pulse(t, mSending - 0.1, 0.2, 0.6, 0.8);

  D.nodeCard(ctx, {
    ...NODES.bank, title: "SENDING BANK", sub: "Originates the payment instruction",
    iconName: "bank", color: C.blueSoft, appear: appearBank, active: bankActive,
    badge: "ORIGIN", badgeColor: C.blueSoft,
  });
  D.nodeCard(ctx, {
    ...NODES.swift, title: "SWIFT", sub: "Financial messaging network",
    iconName: "globe", color: C.blue, appear: appearSwift, active: swiftActive,
    badge: "MESSAGING", badgeColor: C.blueSoft,
  });
  D.nodeCard(ctx, {
    ...NODES.pmg, title: "PMG", sub: "Payments Management Gateway",
    iconName: "gateway", color: C.cyan, appear: appearPmg, active: pmgActive,
    badge: "INTEGRATION", badgeColor: C.cyan,
  });
  D.nodeCard(ctx, {
    ...NODES.gpp, title: "GPP", sub: "Target payment-processing platform",
    iconName: "chip", color: C.cyan, appear: appearEngines, active: gppActive,
    badge: "TARGET", badgeColor: C.green,
  });
  D.nodeCard(ctx, {
    ...NODES.ips, title: "LEGACY IPS", sub: "Legacy payment-processing engine",
    iconName: "server", color: C.amber, appear: appearEngines,
    active: ipsActive, dim: smooth(inv(t, 17.6, 19.2)) * 0.75,
    badge: "LEGACY", badgeColor: C.amber,
  });

  // Packet journey from the sending bank to the SWIFT network and the gateway.
  const p1 = smooth(inv(t, mSending - 0.25, mSwift + 0.15));
  if (p1 > 0) {
    D.packetOnLine(ctx, LINE_BANK_SWIFT, p1, C.cyan, { r: 4.2, alpha: 0.95, intensity: 1 });
  }
  const p2 = smooth(inv(t, mSwift + 0.45, mPmg + 0.1));
  if (p2 > 0) {
    D.packetOnLine(ctx, LINE_SWIFT_PMG, p2, C.cyan, { r: 4.2, alpha: 0.95, intensity: 1 });
  }
  const p3 = smooth(inv(t, mPmg + 0.5, mPmg + 1.2));
  if (p3 > 0) {
    D.packetOnLine(ctx, LINE_PMG_BRANCH, p3, C.blueSoft, { r: 3.6, alpha: 0.8, intensity: 0.8 });
  }

  // Routing demonstration.
  const pIps = smooth(inv(t, mIps - 0.5, mIps + 0.7));
  if (pIps > 0) {
    D.packetOnLine(ctx, LINE_TO_IPS, pIps, C.amber, { r: 4, alpha: 0.95, intensity: 0.9 });
  }
  const pGpp = smooth(inv(t, mGpp - 0.55, mGpp + 0.75));
  if (pGpp > 0) {
    D.packetOnLine(ctx, LINE_TO_GPP, pGpp, C.cyan, { r: 4.2, alpha: 0.95, intensity: 1 });
  }

  drawRouter(ctx, t, scene);
  drawIntegration(ctx, t, scene);
  drawMigration(ctx, t, scene);

  // Small legend.
  const legendA = smooth(inv(t, 3.6, 4.4));
  D.dot(ctx, 112, 830, 3.4, C.cyan, legendA * 0.9);
  D.text(ctx, "GPP TARGET PATH", 126, 834, {
    size: 10, family: "mono", weight: 500, color: C.muted, letterSpacing: 1.3, alpha: legendA * 0.8,
  });
  D.dot(ctx, 300, 830, 3.4, C.amber, legendA * 0.9);
  D.text(ctx, "LEGACY IPS PATH", 314, 834, {
    size: 10, family: "mono", weight: 500, color: C.muted, letterSpacing: 1.3, alpha: legendA * 0.8,
  });

  D.text(ctx, "Conceptual project flow — not a proprietary bank architecture", 112, 858, {
    size: 12, weight: 400, color: C.dim, letterSpacing: 0.2, alpha: legendA * 0.7,
  });
};
