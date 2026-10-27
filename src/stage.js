// Cinematic atmosphere shared across scenes: navy depth, bokeh, particles,
// luminous connections and glass panels.
import { alpha, fillRR, strokeRR, linearGradient, radialGradient, glow, seeded, clamp, grain, vignette } from './draw.js';
import { W, H, MANVEON } from './theme.js';

export function deepBackground(ctx, time, opts = {}) {
  const { warm = 0, blue = 0.5, lime = 0.2, grid = 0 } = opts;
  ctx.fillStyle = linearGradient(ctx, 0, 0, 0, H, [
    [0, '#04101D'],
    [0.45, '#030C16'],
    [1, '#02070D']
  ]);
  ctx.fillRect(0, 0, W, H);

  // Slow drifting blue key light.
  const drift = Math.sin(time * 0.22) * 0.5 + 0.5;
  ctx.fillStyle = radialGradient(ctx, W * (0.28 + drift * 0.3), H * 0.24, 0, W * 1.1, [
    [0, alpha(MANVEON.blue, 0.16 * blue)],
    [0.55, alpha(MANVEON.blue, 0.05 * blue)],
    [1, alpha(MANVEON.blue, 0)]
  ]);
  ctx.fillRect(0, 0, W, H);

  if (lime > 0) {
    ctx.fillStyle = radialGradient(ctx, W * 0.86, H * 0.82, 0, W * 0.8, [
      [0, alpha(MANVEON.lime, 0.1 * lime)],
      [1, alpha(MANVEON.lime, 0)]
    ]);
    ctx.fillRect(0, 0, W, H);
  }

  if (warm > 0) {
    ctx.fillStyle = radialGradient(ctx, W * 0.5, H * 0.42, 0, W * 0.95, [
      [0, `rgba(201,169,107,${0.16 * warm})`],
      [0.6, `rgba(180,130,80,${0.06 * warm})`],
      [1, 'rgba(0,0,0,0)']
    ]);
    ctx.fillRect(0, 0, W, H);
  }

  if (grid > 0) {
    ctx.save();
    ctx.globalAlpha = 0.12 * grid;
    ctx.strokeStyle = alpha(MANVEON.blueBright, 0.5);
    ctx.lineWidth = 1;
    const spacing = 120;
    const offset = (time * 12) % spacing;
    for (let x = -spacing; x < W + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset - 200, H);
      ctx.stroke();
    }
    for (let y = 200; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function bokehField(ctx, opts = {}) {
  const {
    time = 0,
    count = 18,
    seed = 7,
    colors = ['#C9A96B', '#6FA8FF', '#C6FF3D'],
    area = { x: 0, y: 0, w: W, h: H },
    strength = 0.5,
    size = 70
  } = opts;
  const rand = seeded(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i += 1) {
    const baseX = area.x + rand() * area.w;
    const baseY = area.y + rand() * area.h;
    const r = size * (0.4 + rand() * 1.4);
    const color = colors[Math.floor(rand() * colors.length)];
    const drift = Math.sin(time * (0.3 + rand() * 0.4) + i) * 22;
    const rise = ((time * (8 + rand() * 12)) % (area.h + 200)) - 100;
    glow(ctx, baseX + drift, baseY - rise, r, color, strength * (0.25 + rand() * 0.5));
  }
  ctx.restore();
}

export function particleField(ctx, opts = {}) {
  const {
    time = 0,
    count = 60,
    seed = 11,
    color = '#8FD0FF',
    opacity = 0.5,
    area = { x: 0, y: 0, w: W, h: H },
    speed = 18,
    size = 2.4
  } = opts;
  const rand = seeded(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < count; i += 1) {
    const baseX = area.x + rand() * area.w;
    const baseY = area.y + rand() * area.h;
    const phase = rand() * Math.PI * 2;
    const drift = Math.sin(time * 0.6 + phase) * 16;
    const wrapped = ((baseY - time * speed * (0.4 + rand()) + area.h) % area.h + area.h) % area.h;
    const y = area.y + wrapped;
    const a = opacity * (0.25 + rand() * 0.75) * (0.6 + 0.4 * Math.sin(time * 1.6 + phase));
    ctx.fillStyle = alpha(color, clamp(a));
    ctx.beginPath();
    ctx.arc(baseX + drift, y, size * (0.4 + rand() * 0.9), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function connection(ctx, from, to, opts = {}) {
  const {
    progress = 1,
    color = MANVEON.blueBright,
    width = 2.4,
    bend = 0.28,
    time = 0,
    dashed = true,
    pulse = 0,
    nodeColor = MANVEON.lime
  } = opts;
  if (progress <= 0) return;
  const mx = (from.x + to.x) / 2 + (to.y - from.y) * bend;
  const my = (from.y + to.y) / 2 - (to.x - from.x) * bend;
  const pointAt = (t) => ({
    x: (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * mx + t * t * to.x,
    y: (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * my + t * t * to.y
  });

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = alpha(color, 0.22);
  ctx.lineWidth = width * 2.4;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(mx, my, to.x, to.y);
  ctx.stroke();

  ctx.strokeStyle = alpha(color, 0.85);
  ctx.lineWidth = width;
  ctx.setLineDash(dashed ? [10, 12] : []);
  ctx.lineDashOffset = -time * 70;
  // Draw only the revealed portion of the curve.
  if (progress < 1) {
    ctx.beginPath();
    const steps = 32;
    for (let i = 0; i <= steps * progress; i += 1) {
      const p = pointAt(i / steps);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(mx, my, to.x, to.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  if (pulse > 0) {
    const t = (time * 0.45) % 1;
    const p = pointAt(progress >= 1 ? t : t * progress);
    glow(ctx, p.x, p.y, 26, nodeColor, 0.8);
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft source / target nodes.
  [from, to].forEach((p) => {
    glow(ctx, p.x, p.y, 20, color, 0.5);
    ctx.fillStyle = alpha(color, 0.9);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export function glassPanel(ctx, x, y, w, h, opts = {}) {
  const {
    radius = 18,
    fill = 'rgba(8,18,30,0.62)',
    stroke = 'rgba(140,190,255,0.18)',
    glowColor = null,
    glowStrength = 0.35
  } = opts;
  if (glowColor) glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 0.75, glowColor, glowStrength);
  fillRR(ctx, x, y, w, h, radius, fill);
  strokeRR(ctx, x, y, w, h, radius, stroke, 1);
  // Top light catch.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = linearGradient(ctx, x, y, x + w, y, [
    [0, 'rgba(255,255,255,0)'],
    [0.5, 'rgba(255,255,255,0.28)'],
    [1, 'rgba(255,255,255,0)']
  ]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + radius, y + 1);
  ctx.lineTo(x + w - radius, y + 1);
  ctx.stroke();
  ctx.restore();
}

export function stagePolish(ctx, time, opts = {}) {
  const { grainAmount = 0.05, vignetteStrength = 0.7, bloom = 0.35, bloomColor = MANVEON.blue } = opts;
  if (bloom > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radialGradient(ctx, W / 2, H * 0.42, 0, W * 0.75, [
      [0, alpha(bloomColor, 0.05 * bloom)],
      [1, alpha(bloomColor, 0)]
    ]);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  vignette(ctx, W, H, vignetteStrength);
  grain(ctx, W, H, grainAmount, time);
}

