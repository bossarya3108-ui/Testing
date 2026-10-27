// Scene 8 — The complete digital experience: the phone at the centre of a
// connected ecosystem, with the beat drop landing on the reveal.
import { alpha, fillRR, strokeRR, radialGradient, glow, drawTracked, clamp, easeOutCubic, easeOutBack } from '../draw.js';
import { W, H, MANVEON, FONT } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish, glassPanel, connection } from '../stage.js';
import { drawHome } from '../ui/site.js';
import { drawOwnerDashboard } from '../ui/owner.js';
import { icon } from '../ui/primitives.js';

const CARDS = [
  { x: 188, y: 396, label: ['WEBSITE'], icon: 'globe', tone: 'blue' },
  { x: 892, y: 428, label: ['AI ASSISTANT'], icon: 'sparkle', tone: 'lime' },
  { x: 152, y: 764, label: ['BOOKING'], icon: 'calendar', tone: 'lime' },
  { x: 928, y: 792, label: ['NOTIFICATIONS'], icon: 'bell', tone: 'blue' },
  { x: 540, y: 1306, label: ['BUSINESS', 'DASHBOARD'], icon: 'chart', tone: 'blue' }
];

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.55, blue: 0.9, lime: 0.5, grid: 0.3 });
  bokehField(ctx, {
    time: t,
    count: 12,
    seed: 101,
    colors: ['#C6FF3D', '#7FB6FF', '#F0C98F'],
    area: { x: 0, y: 0, w: W, h: H },
    strength: 0.45,
    size: 90
  });
  particleField(ctx, { time: t, count: 48, seed: 103, color: '#9FD4FF', opacity: 0.3, speed: 20 });
  particleField(ctx, { time: t, count: 22, seed: 107, color: MANVEON.lime, opacity: 0.25, speed: 14 });

  const drop = clamp((t - CUES.drop) / 0.7);
  const cx = W / 2;
  const cy = 760;

  // Impact rings on the drop.
  for (let i = 0; i < 3; i += 1) {
    const p = clamp((t - CUES.drop - i * 0.08) / 1.1);
    if (p <= 0 || p >= 1) continue;
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.55;
    ctx.strokeStyle = i % 2 ? MANVEON.lime : MANVEON.blueBright;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 240 + p * 620, 300 + p * 720, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Orbit rings behind the device.
  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = alpha(MANVEON.blueBright, 0.1 - i * 0.02);
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 18]);
    ctx.lineDashOffset = -t * (10 + i * 6);
    ctx.beginPath();
    ctx.ellipse(cx, cy + 40, 320 + i * 110, 380 + i * 120, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Connections first, so cards sit on top.
  CARDS.forEach((card, index) => {
    const appear = easeOutCubic(clamp((t - (CUES.drop + 0.15 + index * 0.12)) / 0.5));
    if (appear <= 0) return;
    const bob = Math.sin(t * 0.9 + index) * 5;
    connection(ctx, { x: cx, y: cy + 40 }, { x: card.x, y: card.y + bob }, {
      progress: appear,
      color: card.tone === 'lime' ? MANVEON.lime : MANVEON.blueBright,
      width: 2,
      bend: 0.22,
      time: t + index * 1.7,
      pulse: appear,
      nodeColor: card.tone === 'lime' ? MANVEON.lime : MANVEON.blueBright
    });
  });

  // The device.
  drawPhone(ctx, {
    cx,
    cy,
    scale: (340 / 590) * (1 + (1 - drop) * 0.08),
    rotation: -0.015,
    glowColor: MANVEON.blue,
    glowStrength: 0.75,
    screen: (c) => {
      // 2.5s screens and a 5.0s cycle: the loop ends with the scene. Freeze
      // slightly early so a settled screen carries into the reveal.
      const period = 2.5;
      const cycleTime = Math.min(t, 52.2) - CUES.drop;
      const phase = Math.max(0, cycleTime) % (period * 2);
      const dashboard = phase >= period;
      const local = phase % period;
      const blend = clamp((local - (period - 0.35)) / 0.35);
      const paint = (which, alphaValue) => {
        if (alphaValue <= 0) return;
        c.save();
        c.globalAlpha = alphaValue;
        if (which === 'dashboard') drawOwnerDashboard(c, { sheet: 0, confirmed: 0, time: t });
        else drawHome(c, { scroll: 0, time: t });
        c.restore();
      };
      paint(dashboard ? 'dashboard' : 'home', 1);
      if (blend > 0) paint(dashboard ? 'home' : 'dashboard', blend);
    }
  });

  // Feature cards.
  CARDS.forEach((card, index) => {
    const at = CUES.drop + 0.15 + index * 0.12;
    const p = clamp((t - at) / 0.55);
    if (p <= 0) return;
    const ease = easeOutBack(p, 1.2);
    const bob = Math.sin(t * 0.9 + index) * 5;
    const tone = card.tone === 'lime' ? MANVEON.lime : MANVEON.blueBright;
    const w = 268;
    const h = 96;
    const x = card.x - w / 2;
    const y = card.y - h / 2 + bob;

    ctx.save();
    ctx.globalAlpha = clamp(p * 1.4);
    ctx.translate(card.x, card.y + bob);
    ctx.scale(ease, ease);
    ctx.translate(-card.x, -(card.y + bob));

    glassPanel(ctx, x, y, w, h, {
      radius: 22,
      fill: 'rgba(6,16,27,0.78)',
      stroke: alpha(tone, 0.32),
      glowColor: tone,
      glowStrength: 0.2
    });
    fillRR(ctx, x + 18, y + 20, 44, 44, 14, alpha(tone, 0.14));
    strokeRR(ctx, x + 18, y + 20, 44, 44, 14, alpha(tone, 0.35), 1);
    icon(ctx, card.icon, x + 29, y + 31, 22, tone, 1.6);

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.font = `600 19px ${FONT.semi}`;
    if (card.label.length === 1) {
      drawTracked(ctx, card.label[0], x + 76, y + h / 2 + 7, 1.2);
    } else {
      drawTracked(ctx, card.label[0], x + 76, y + h / 2 - 4, 1.2);
      drawTracked(ctx, card.label[1], x + 76, y + h / 2 + 18, 1.2);
    }
    ctx.restore();
  });

  // Warm salon light grounding the ecosystem.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radialGradient(ctx, cx, 1560, 0, 520, [
    [0, 'rgba(201,169,107,0.18)'],
    [1, 'rgba(201,169,107,0)']
  ]);
  ctx.fillRect(0, 1100, W, 760);
  // Floor glow beneath the device.
  ctx.fillStyle = radialGradient(ctx, cx, 1200, 0, 260, [
    [0, 'rgba(120,180,255,0.18)'],
    [1, 'rgba(120,180,255,0)']
  ]);
  ctx.fillRect(cx - 260, 1080, 520, 320);
  ctx.restore();

  stagePolish(ctx, t, { vignetteStrength: 0.75, bloom: 0.45, bloomColor: MANVEON.blue });
  ctx.restore();
}
