"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, easeOutCubic, easeOutBack, smooth, rng, markerTime } = require("../lib/util");
const world = require("../lib/world");
const { drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;
const H = theme.height;

const CITIES = [
  { lon: -74.0, lat: 40.7, label: "NEW YORK", side: "left" },
  { lon: -0.1, lat: 51.5, label: "LONDON", side: "right" },
  { lon: 8.7, lat: 50.1, label: "", side: "right" },
  { lon: 55.3, lat: 25.2, label: "DUBAI", side: "right" },
  { lon: 103.8, lat: 1.35, label: "SINGAPORE", side: "right" },
  { lon: 151.2, lat: -33.9, label: "SYDNEY", side: "right" },
  { lon: 139.7, lat: 35.7, label: "TOKYO", side: "right" },
  { lon: -46.6, lat: -23.5, label: "SÃO PAULO", side: "left" },
  { lon: 28.0, lat: -26.2, label: "", side: "right" },
];

const ROUTES = [
  [0, 1, 0.0],
  [1, 3, 0.45],
  [3, 4, 0.2],
  [4, 5, 0.72],
  [0, 7, 0.35],
  [1, 3, 0.8],
];

function drawNetwork(ctx, t, alpha) {
  if (alpha <= 0.01) return;
  const visibility = alpha;

  // Arc infrastructure.
  ROUTES.forEach(([a, b, phase], i) => {
    const pa = world.project(CITIES[a].lon, CITIES[a].lat);
    const pb = world.project(CITIES[b].lon, CITIES[b].lat);
    world.drawArc(ctx, pa, pb, {
      color: i % 3 === 0 ? C.cyan : C.blueSoft,
      alpha: 0.22 * visibility,
      progress: 1,
      bend: 0.12 + (i % 3) * 0.03,
      width: 1.1,
      glow: 0.25,
    });
  });

  // Moving payment packets.
  ROUTES.forEach(([a, b, phase], i) => {
    const pa = world.project(CITIES[a].lon, CITIES[a].lat);
    const pb = world.project(CITIES[b].lon, CITIES[b].lat);
    const progress = (t * (0.14 + (i % 3) * 0.025) + phase) % 1;
    const pts = world.arcPoints(pa, pb, 0.12 + (i % 3) * 0.03);
    const pos = D.pointOnPolyline(pts, progress);
    if (pos) {
      D.packet(ctx, pos.x, pos.y, i % 2 ? C.cyan : C.blueSoft, {
        r: 3.2,
        alpha: visibility * (0.4 + 0.6 * Math.sin(progress * Math.PI)),
        direction: pos.angle,
        trail: true,
        intensity: 0.9,
      });
    }
    // A second slower packet for depth.
    const p2 = (t * 0.09 + phase + 0.5) % 1;
    const pos2 = D.pointOnPolyline(pts, p2);
    if (pos2) {
      D.packet(ctx, pos2.x, pos2.y, C.blueSoft, {
        r: 2.2,
        alpha: visibility * 0.35,
        direction: pos2.angle,
        intensity: 0.6,
      });
    }
  });

  CITIES.forEach((city, i) => {
    world.cityNode(ctx, [city.lon, city.lat], {
      label: city.label,
      sub: city.label && i % 2 === 0 ? "PAYMENT HUB" : "",
      labelSide: city.side,
      t,
      phase: i * 0.8,
      alpha: visibility * (0.45 + 0.55 * smooth(inv(t, 0.7 + i * 0.12, 1.6 + i * 0.12))),
      size: 3.1,
    });
  });

  // Currency chips sit beside their home markets.
  const chips = [
    [0, "USD", 36, 30, 0.6],
    [2, "EUR", -56, 72, 1.8],
    [4, "SGD", 22, 46, 0.9],
    [6, "JPY", 24, 34, 2.4],
    [5, "AUD", -8, 48, 1.3],
  ];
  chips.forEach(([cityIndex, label, dx, dy, phase], i) => {
    const base = world.project(CITIES[cityIndex].lon, CITIES[cityIndex].lat);
    const y = base[1] + dy + Math.sin(t * 0.5 + phase) * 4;
    const x = base[0] + dx + Math.cos(t * 0.3 + phase) * 5;
    D.text(ctx, label, x, y, {
      size: 9,
      family: "mono",
      weight: 500,
      color: i % 2 ? C.cyan : C.blueSoft,
      align: "center",
      alpha: visibility * 0.42,
      letterSpacing: 1.4,
    });
  });
}

function drawCore(ctx, cx, cy, t, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  const breathe = 1 + 0.04 * Math.sin(t * 1.3);
  drawGlow(ctx, cx, cy, 460, 0.9 * alpha);

  // Outer rotating rings.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.18);
  ctx.setLineDash([3, 12]);
  ctx.strokeStyle = "rgba(53,224,255,0.32)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, 132 * breathe, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-t * 0.12);
  ctx.setLineDash([26, 14]);
  ctx.strokeStyle = "rgba(47,123,255,0.34)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 108 * breathe, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  D.ring(ctx, cx, cy, 86, "rgba(90,162,255,0.45)", { width: 1.2, alpha });
  D.dot(ctx, cx, cy, 70, "rgba(6,20,40,0.9)", alpha);

  // Core fill.
  const g = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, 80);
  g.addColorStop(0, "rgba(53,224,255,0.35)");
  g.addColorStop(0.55, "rgba(47,123,255,0.14)");
  g.addColorStop(1, "rgba(10,30,60,0.02)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 76, 0, Math.PI * 2);
  ctx.fill();

  D.icon(ctx, "chip", cx, cy - 6, 46, C.cyan, { alpha: 1, lineWidth: 1.5 });
  D.text(ctx, "PROCESSING", cx, cy + 46, {
    size: 10,
    family: "mono",
    weight: 600,
    color: C.cyanSoft,
    align: "center",
    letterSpacing: 2.6,
    alpha: 0.9,
  });

  // Orbiting packets.
  for (let i = 0; i < 3; i += 1) {
    const angle = t * 0.5 + (i * Math.PI * 2) / 3;
    const r = 108 + Math.sin(t * 0.9 + i) * 5;
    D.packet(ctx, cx + Math.cos(angle) * r, cy + Math.sin(angle) * r * 0.36, i === 1 ? C.cyan : C.blueSoft, {
      r: 3,
      alpha: 0.8,
      direction: angle + Math.PI / 2,
      intensity: 0.8,
    });
  }
  ctx.restore();
}

function drawInfrastructure(ctx, t, alpha) {
  if (alpha <= 0.01) return;
  const appear = inv(t, 7.15, 8.15);
  const bankX = 230;
  const bankY = 470;
  const coreX = 960;
  const coreY = 548;
  const downX = 1420;
  const downY = 470;

  const lineA = [
    [bankX + 300, 545],
    [coreX - 140, 545],
  ];
  const lineB = [
    [coreX + 140, 545],
    [downX, 545],
  ];
  const drawP = smooth(inv(t, 7.6, 8.7));

  D.connection(ctx, lineA, {
    color: C.blueSoft,
    alpha: alpha * 0.85,
    progress: drawP,
    width: 1.6,
    glow: 0.7,
    dashed: true,
    arrow: true,
  });
  D.connection(ctx, lineB, {
    color: C.cyan,
    alpha: alpha * 0.75,
    progress: Math.max(0, drawP - 0.12),
    width: 1.6,
    glow: 0.7,
    dashed: true,
    arrow: true,
  });

  D.nodeCard(ctx, {
    x: bankX, y: bankY, w: 300, h: 150,
    title: "SENDING BANK",
    sub: "Originates the payment instruction",
    iconName: "bank",
    color: C.blueSoft,
    alpha,
    appear: inv(t, 7.1, 7.9),
    active: 0.45,
    badge: "ORIGIN",
  });

  drawCore(ctx, coreX, coreY, t, alpha);

  D.nodeCard(ctx, {
    x: downX, y: downY, w: 300, h: 150,
    title: "DOWNSTREAM",
    sub: "Receives processing outcomes",
    iconName: "layers",
    color: C.cyan,
    alpha,
    appear: inv(t, 7.3, 8.1),
    active: 0.35,
  });

  // Message cards streaming into the core.
  for (let i = 0; i < 2; i += 1) {
    const speed = 0.34;
    const progress = (t * speed + i * 0.5) % 1;
    const start = lineA[0];
    const end = lineA[1];
    const x = lerp(start[0], end[0] + 10, progress);
    const y = start[1] - 118 - Math.sin(progress * Math.PI) * 10;
    const cardAlpha = alpha * Math.sin(progress * Math.PI) * 0.95;
    D.panel(ctx, x - 66, y - 22, 132, 44, {
      fill: "rgba(7,20,38,0.95)",
      stroke: "rgba(53,224,255,0.45)",
      radius: 9,
      alpha: cardAlpha,
      glow: 0.25,
      glowColor: C.cyan,
    });
    D.text(ctx, "pacs.008", x - 54, y + 1, {
      size: 12,
      family: "mono",
      weight: 600,
      color: C.cyan,
      baseline: "middle",
      alpha: cardAlpha,
    });
    D.text(ctx, "XML", x + 54, y + 1, {
      size: 8,
      family: "mono",
      weight: 500,
      color: C.muted,
      align: "right",
      baseline: "middle",
      alpha: cardAlpha * 0.8,
    });
    D.dot(ctx, x - 48, y - 12, 2.2, C.blueSoft, cardAlpha);
    D.dot(ctx, x - 38, y - 12, 2.2, C.green, cardAlpha * 0.8);
  }

  D.text(ctx, "INBOUND PAYMENT TRAFFIC", 230, 676, {
    size: 9,
    family: "mono",
    weight: 600,
    color: C.muted,
    letterSpacing: 2.2,
    alpha: alpha * 0.65,
  });
  D.text(ctx, "VALIDATE · APPLY RULES · ROUTE · STATUS", 230, 694, {
    size: 10,
    family: "body",
    weight: 500,
    color: C.dim,
    letterSpacing: 0.6,
    alpha: alpha * 0.65,
  });
}


function drawOrbital(ctx, t, alpha) {
  if (alpha <= 0.01) return;
  const cx = 1508;
  const cy = 516;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawGlow(ctx, cx, cy, 680, 0.55);

  for (let i = 0; i < 3; i += 1) {
    const r = 150 + i * 68;
    const rot = t * (i % 2 ? -0.06 : 0.045) + i;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.setLineDash(i === 1 ? [2, 10] : [18, 16]);
    ctx.strokeStyle = i === 1 ? "rgba(53,224,255,0.24)" : "rgba(90,162,255,0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Orbiting payment nodes on the outer ring.
  for (let i = 0; i < 8; i += 1) {
    const angle = t * 0.16 + (i * Math.PI * 2) / 8;
    const r = 286;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    D.rule(ctx, cx + Math.cos(angle) * 150, cy + Math.sin(angle) * 150, x, y, "rgba(90,162,255,0.12)", 0.7, 1);
    const hot = i === 0 || i === 4;
    D.dot(ctx, x, y, hot ? 3.4 : 2.3, hot ? C.cyan : C.blueSoft, hot ? 0.9 : 0.55);
    if (hot) {
      D.ring(ctx, x, y, 11 + 3 * Math.sin(t * 1.4 + i), D.hexAlpha(C.cyan, 0.5), { alpha: 0.5, width: 1 });
    }
  }

  // Inner core.
  D.ring(ctx, cx, cy, 58, "rgba(90,162,255,0.35)", { width: 1, alpha: 0.8 });
  D.ring(ctx, cx, cy, 72, "rgba(53,224,255,0.15)", { width: 1, alpha: 0.7, dash: [2, 7] });
  drawGlow(ctx, cx, cy, 220, 0.5);
  D.dot(ctx, cx, cy, 5, C.cyan, 0.9);
  D.packet(ctx, cx + Math.cos(t * 0.5) * 215, cy + Math.sin(t * 0.5) * 215, C.cyan, {
    r: 3.2, alpha: 0.9, direction: t * 0.5 + Math.PI / 2, intensity: 0.9,
  });
  D.packet(ctx, cx + Math.cos(t * 0.34 + 2.5) * 150, cy + Math.sin(t * 0.34 + 2.5) * 150, C.blueSoft, {
    r: 2.4, alpha: 0.7, direction: t * 0.34 + 2.5 + Math.PI / 2, intensity: 0.7,
  });
  ctx.restore();
}

function drawTitle(ctx, t, scene) {
  const start = markerTime(scene, "global", 9.9) - 0.1;
  const gpp = markerTime(scene, "gpp", 11.6) - 0.2;
  const eco = markerTime(scene, "ecosystem", 14.7);
  const a = inv(t, start, start + 0.8);
  if (a <= 0.01) return;

  const x = 148;
  const y1 = 412;
  const line1 = inv(t, start, start + 0.75);
  const line2 = inv(t, gpp - 0.35, gpp + 0.55);
  const subA = inv(t, gpp + 0.35, gpp + 1.1);
  const ecoA = inv(t, eco - 0.2, eco + 0.9);

  ctx.save();

  // Scrim so the title owns the frame while the orbital art stays visible.
  ctx.fillStyle = "rgba(2,6,13,0.42)";
  ctx.fillRect(0, 0, W, H);
  const scrim = ctx.createLinearGradient(0, 0, W * 0.72, 0);
  scrim.addColorStop(0, "rgba(2,6,13,0.92)");
  scrim.addColorStop(0.52, "rgba(2,6,13,0.62)");
  scrim.addColorStop(1, "rgba(2,6,13,0)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, W, H);

  D.rule(ctx, x, 300, x + 64, 300, D.hexAlpha(C.cyan, 0.8), a * 0.9, 2);
  D.text(ctx, "INTRODUCING", x + 78, 304, {
    size: 12,
    weight: 600,
    color: C.cyanSoft,
    letterSpacing: 4,
    alpha: a * 0.9,
    baseline: "middle",
  });

  // Line one.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 30, y1 - 92, 1250, 118);
  ctx.clip();
  D.text(ctx, "GLOBAL PAYMENTS", x, y1 + (1 - easeOutCubic(line1)) * 60, {
    size: 82,
    family: "display",
    weight: 600,
    color: C.ink,
    letterSpacing: -1.6,
    alpha: a * smooth(line1),
  });
  ctx.restore();

  // Line two + GPP badge.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 30, y1 + 10, 1250, 118);
  ctx.clip();
  D.text(ctx, "PLATFORM", x, y1 + 108 + (1 - easeOutCubic(line2)) * 60, {
    size: 82,
    family: "display",
    weight: 600,
    color: C.ink,
    letterSpacing: -1.6,
    alpha: a * smooth(line2),
  });
  ctx.restore();

  const platformWidth = D.measure(ctx, "PLATFORM", 82, 600, "display", -1.6);
  const badgeX = x + platformWidth + 30;
  if (line2 > 0) {
    const pop = easeOutBack(line2, 1.35);
    ctx.save();
    ctx.globalAlpha = a * clamp(line2);
    ctx.translate(badgeX + 74, y1 + 72);
    ctx.scale(0.72 + 0.28 * pop, 0.72 + 0.28 * pop);
    D.roundRectPath(ctx, -74, -42, 148, 84, 18);
    ctx.fillStyle = "rgba(47,123,255,0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(90,162,255,0.65)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    D.text(ctx, "GPP", 0, 1, {
      size: 46,
      family: "mono",
      weight: 600,
      color: C.cyanSoft,
      align: "center",
      baseline: "middle",
      letterSpacing: 2,
    });
    ctx.restore();
  }

  // Subtitle.
  D.text(ctx, "Understanding the engine behind modern payment processing.", x, y1 + 194, {
    size: 26,
    weight: 400,
    color: C.muted,
    letterSpacing: 0.1,
    alpha: a * subA * 0.96,
  });

  // A quiet hint of the payment chain.
  if (ecoA > 0.01) {
    const chain = ["SENDING BANK", "SWIFT", "PMG", "GPP"];
    let cx = x + 2;
    const cy = 872;
    D.text(ctx, "THE PAYMENT JOURNEY", x, cy - 42, {
      size: 10,
      family: "mono",
      weight: 600,
      color: C.dim,
      letterSpacing: 2.8,
      alpha: ecoA * 0.8,
    });
    chain.forEach((label, i) => {
      const w = D.measure(ctx, label, 12, 600, "mono", 1) + 32;
      const active = i === chain.length - 1;
      D.pill(ctx, label, cx, cy, {
        size: 12,
        height: 38,
        padX: 16,
        color: active ? C.cyan : C.muted,
        bg: active ? "rgba(53,224,255,0.10)" : "rgba(96,150,220,0.06)",
        border: active ? "rgba(53,224,255,0.4)" : "rgba(96,150,220,0.18)",
        alpha: ecoA,
        letterSpacing: 1,
      });
      cx += w + (i < chain.length - 1 ? 30 : 0);
      if (i < chain.length - 1) {
        D.text(ctx, "›", cx - 20, cy + 1, {
          size: 20,
          color: C.faint,
          align: "center",
          baseline: "middle",
          alpha: ecoA,
        });
      }
    });
  }

  ctx.restore();
}

module.exports = function scene1(ctx, t, scene) {
  const mapAlpha = smooth(inv(t, 0.1, 1.1)) * (1 - smooth(inv(t, 6.9, 9.2)));
  const infraAlpha = smooth(inv(t, 7.0, 8.2)) * (1 - smooth(inv(t, 9.0, 10.0)));
  const titleScrim = smooth(inv(t, 9.6, 10.6));
  const orbitalAlpha = smooth(inv(t, 10.1, 11.3));

  drawGlow(ctx, W * 0.22, H * 0.3, 980, 0.35 * (1 - titleScrim * 0.5));
  ctx.save();
  const mapScale = 1.02 + 0.05 * smooth(inv(t, 0, 8.5));
  ctx.translate(W / 2, H / 2 + 20);
  ctx.scale(mapScale, mapScale);
  ctx.translate(-W / 2, -(H / 2 + 20));
  world.drawMap(ctx, { alpha: mapAlpha });
  drawNetwork(ctx, t, mapAlpha);
  ctx.restore();
  drawInfrastructure(ctx, t, infraAlpha);
  drawOrbital(ctx, t, orbitalAlpha);
  drawTitle(ctx, t, scene);
};
