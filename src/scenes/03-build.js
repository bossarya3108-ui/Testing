// Scene 3 — Manveon builds the website: luminous elements assemble around the
// phone and resolve into the finished Luxe Studio homepage.
import { alpha, fillRR, strokeRR, linearGradient, radialGradient, drawTracked, clamp, smoothstep, easeOutCubic, easeOutExpo, lerp } from '../draw.js';
import { W, H, MANVEON, FONT } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone } from '../phone.js';
import { deepBackground, particleField, stagePolish, glassPanel } from '../stage.js';
import { drawHome } from '../ui/site.js';
import { UI_W, UI_H } from '../ui/primitives.js';

const FRAGMENTS = [
  { dx: -360, dy: -430, w: 230, h: 132, rot: -0.16, label: 'SERVICES' },
  { dx: 350, dy: -330, w: 210, h: 124, rot: 0.2, label: 'BOOKING' },
  { dx: -370, dy: 260, w: 206, h: 128, rot: 0.12, label: 'LOCATION' },
  { dx: 372, dy: 372, w: 226, h: 132, rot: -0.12, label: 'CONTACT' }
];

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0, blue: 0.9, lime: 0.3, grid: 0.8 });

  const build = clamp((t - CUES.assemble) / (CUES.homeReady - CUES.assemble));
  const resolved = smoothstep((t - (CUES.homeReady - 0.35)) / 0.55);
  const flash = clamp(1 - Math.abs(t - CUES.homeReady) / 0.6);

  particleField(ctx, { time: t, count: 74, seed: 17, color: '#8FD0FF', opacity: 0.5, speed: 22 });
  particleField(ctx, { time: t, count: 26, seed: 23, color: MANVEON.lime, opacity: 0.35, speed: 14, size: 2 });

  const camScale = lerp(0.93, 1.03, easeOutCubic(clamp((t - 11.2) / 6)));
  const phoneScale = (660 / 590) * camScale;
  const cx = W / 2;
  const cy = 900 - (1 - camScale) * 60;

  // Orbiting build arcs.
  const orbitFade = smoothstep((t - CUES.assemble) / 0.8) * (1 - resolved * 0.4);
  ctx.save();
  ctx.globalAlpha = orbitFade;
  for (let i = 0; i < 3; i += 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * (0.12 + i * 0.05) + i * 1.6);
    ctx.strokeStyle = i % 2 ? alpha(MANVEON.lime, 0.35) : alpha(MANVEON.blueBright, 0.4);
    ctx.lineWidth = 2;
    ctx.setLineDash([70, 120]);
    ctx.lineDashOffset = -t * 40;
    ctx.beginPath();
    ctx.ellipse(0, 0, 430 + i * 46, 520 + i * 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Digital fragments flying into the phone.
  const fly = easeOutCubic(clamp((t - CUES.assemble - 0.2) / 2.4));
  FRAGMENTS.forEach((frag, index) => {
    const delay = 0.12 * index;
    const local = clamp((fly - delay) / (1 - delay));
    if (local <= 0.01) return;
    const pull = easeOutExpo(local);
    const x = cx + frag.dx * (1 - pull);
    const y = cy + frag.dy * (1 - pull);
    const fade = 1 - clamp((local - 0.55) / 0.45);
    if (fade <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = fade * 0.9;
    ctx.translate(x, y);
    ctx.rotate(frag.rot * (1 - pull * 0.6));
    glassPanel(ctx, -frag.w / 2, -frag.h / 2, frag.w, frag.h, {
      radius: 16,
      fill: 'rgba(9,22,36,0.72)',
      stroke: alpha(index % 2 ? MANVEON.lime : MANVEON.blueBright, 0.35),
      glowColor: index % 2 ? MANVEON.lime : MANVEON.blue,
      glowStrength: 0.25
    });
    ctx.fillStyle = alpha(index % 2 ? MANVEON.lime : MANVEON.blueBright, 0.85);
    ctx.font = `600 13px ${FONT.semi}`;
    drawTracked(ctx, frag.label, -frag.w / 2 + 20, -frag.h / 2 + 30, 2);
    for (let i = 0; i < 3; i += 1) {
      fillRR(ctx, -frag.w / 2 + 20, -frag.h / 2 + 48 + i * 16, frag.w * (0.62 - i * 0.12), 5, 2.5, 'rgba(255,255,255,0.16)');
    }
    ctx.restore();
  });

  // Beams converging on the device.
  const beamAlpha = orbitFade * 0.5;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = beamAlpha;
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + t * 0.15;
    const x0 = cx + Math.cos(angle) * 620;
    const y0 = cy + Math.sin(angle) * 780;
    const g = ctx.createLinearGradient(x0, y0, cx, cy);
    g.addColorStop(0, 'rgba(120,180,255,0)');
    g.addColorStop(0.7, 'rgba(120,180,255,0.18)');
    g.addColorStop(1, 'rgba(198,255,61,0.3)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(cx, cy);
    ctx.stroke();
  }
  ctx.restore();

  // Device.
  drawPhone(ctx, {
    cx,
    cy,
    scale: phoneScale,
    rotation: -0.02 + Math.sin(t * 0.6) * 0.01,
    glowColor: resolved > 0.5 ? MANVEON.lime : MANVEON.blue,
    glowStrength: 0.55 + resolved * 0.35,
    promptGlow: clamp(flash * 1.2),
    screen: (c) => {
      if (resolved < 1) {
        buildScreen(c, t, easeOutCubic(clamp((t - CUES.assemble) / 2.4)));
      }
      if (resolved > 0) {
        c.save();
        c.globalAlpha = resolved;
        drawHome(c, { scroll: -6 * (1 - resolved), time: t });
        c.restore();
      }
    }
  });

  // Resolution flash.
  if (flash > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radialGradient(ctx, cx, cy, 0, 520, [
      [0, `rgba(200,240,255,${0.25 * flash})`],
      [0.5, `rgba(120,180,255,${0.08 * flash})`],
      [1, 'rgba(120,180,255,0)']
    ]);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  stagePolish(ctx, t, { vignetteStrength: 0.8, bloom: 0.4, bloomColor: MANVEON.blue });
  ctx.restore();
}

// The wireframe the site is assembled from.
function buildScreen(ctx, t, progress) {
  ctx.fillStyle = linearGradient(ctx, 0, 0, 0, UI_H, [
    [0, '#0B2236'],
    [0.55, '#071725'],
    [1, '#040D16']
  ]);
  ctx.fillRect(0, 0, UI_W, UI_H);

  // Blueprint grid.
  ctx.save();
  ctx.strokeStyle = 'rgba(110,170,255,0.22)';
  ctx.lineWidth = 1;
  for (let x = 0; x < UI_W; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, UI_H);
    ctx.stroke();
  }
  for (let y = 0; y < UI_H; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(UI_W, y);
    ctx.stroke();
  }
  ctx.restore();

  const blocks = [
    { x: 22, y: 70, w: 346, h: 54 },
    { x: 22, y: 140, w: 346, h: 250 },
    { x: 22, y: 406, w: 166, h: 120 },
    { x: 200, y: 406, w: 168, h: 120 },
    { x: 22, y: 542, w: 346, h: 96 },
    { x: 22, y: 654, w: 240, h: 64 }
  ];

  blocks.forEach((block, index) => {
    const p = clamp((progress - index * 0.1) / 0.3);
    if (p <= 0) return;
    const w = block.w * easeOutCubic(p);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * p;
    strokeRR(ctx, block.x, block.y, w, block.h, 10, alpha(index % 3 === 0 ? MANVEON.lime : MANVEON.blueBright, 0.85), 1.6);
    // Block content hints.
    if (p > 0.7) {
      ctx.globalAlpha = 0.5;
      fillRR(ctx, block.x + 14, block.y + 14, Math.min(w - 28, 120), 7, 3.5, 'rgba(160,200,255,0.4)');
      fillRR(ctx, block.x + 14, block.y + 30, Math.min(w - 28, 84), 5, 2.5, 'rgba(160,200,255,0.22)');
    }
    ctx.restore();
  });

  // Wordmark assembling in the header block.
  const wordP = smoothstep((progress - 0.15) / 0.4);
  ctx.save();
  ctx.globalAlpha = wordP;
  ctx.beginPath();
  ctx.rect(22, 70, 346 * wordP, 54);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `400 22px ${FONT.serif}`;
  drawTracked(ctx, 'LUXE STUDIO', 42, 108, 2.4);
  ctx.restore();

  // Assembly readout.
  ctx.fillStyle = alpha(MANVEON.lime, 0.75);
  ctx.font = `600 9px ${FONT.semi}`;
  drawTracked(ctx, 'MANVEON', 24, 770, 2.6);
  fillRR(ctx, 24, 786, 342, 2.5, 1.2, 'rgba(255,255,255,0.1)');
  fillRR(ctx, 24, 786, 342 * clamp(progress), 2.5, 1.2, MANVEON.lime);

  // Soft top light so the screen doesn't read as flat.
  ctx.fillStyle = radialGradient(ctx, UI_W / 2, 0, 0, 520, [
    [0, 'rgba(90,150,255,0.18)'],
    [1, 'rgba(90,150,255,0)']
  ]);
  ctx.fillRect(0, 0, UI_W, 520);

}
