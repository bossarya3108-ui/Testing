// Scene 9 — The Manveon reveal: light trails resolve into the brand lockup and
// the closing statement.
import { alpha, radialGradient, glow, drawTracked, clamp, smoothstep, easeOutCubic, easeOutExpo, easeOutBack, seeded, lerp } from '../draw.js';
import { W, H, MANVEON, FONT } from '../theme.js';
import { CUES, FINAL } from '../timeline.js';
import { particleField, stagePolish } from '../stage.js';
import { drawManveonLogo, brandRule } from '../brand.js';

const TARGET = { x: W / 2, y: 702 };

const trails = (() => {
  const rand = seeded(9091);
  const count = 26;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.22;
    const radius = 980 + rand() * 620;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle) * 1.12;
    const px = -dy;
    const py = dx;
    const bend = (rand() - 0.5) * 240;
    return {
      sx: TARGET.x + dx * radius,
      sy: TARGET.y + dy * radius,
      c1x: TARGET.x + dx * radius * 0.66 + px * bend,
      c1y: TARGET.y + dy * radius * 0.66 + py * bend,
      c2x: TARGET.x + dx * radius * 0.3 + px * bend * 0.55,
      c2y: TARGET.y + dy * radius * 0.3 + py * bend * 0.55,
      ex: TARGET.x + dx * (26 + rand() * 70),
      ey: TARGET.y + dy * (26 + rand() * 70),
      lime: i % 3 === 0,
      delay: rand() * 0.3,
      width: 1.3 + rand() * 1.9
    };
  });
})();

function cubicPoint(trail, u) {
  const v = 1 - u;
  return {
    x: v * v * v * trail.sx + 3 * v * v * u * trail.c1x + 3 * v * u * u * trail.c2x + u * u * u * trail.ex,
    y: v * v * v * trail.sy + 3 * v * v * u * trail.c1y + 3 * v * u * u * trail.c2y + u * u * u * trail.ey
  };
}

export function draw(ctx, t) {
  ctx.save();

  // Deep navy stage.
  ctx.fillStyle = 'rgba(4,16,29,1)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = radialGradient(ctx, W / 2, H * 0.34, 0, W * 1.05, [
    [0, 'rgba(24,70,140,0.55)'],
    [0.45, 'rgba(9,32,62,0.35)'],
    [1, 'rgba(2,8,16,0)']
  ]);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = radialGradient(ctx, W * 0.82, H * 0.78, 0, W * 0.75, [
    [0, 'rgba(198,255,61,0.12)'],
    [1, 'rgba(198,255,61,0)']
  ]);
  ctx.fillRect(0, 0, W, H);

  const logo = easeOutExpo(clamp((t - CUES.logo + 0.25) / 0.9));
  const trailFade = 1 - smoothstep((t - (CUES.logo + 0.2)) / 0.9);

  // Light trails converging on the lockup.
  trails.forEach((trail, index) => {
    const p = easeOutExpo(clamp((t - 52.65 - trail.delay) / 0.95));
    if (p <= 0) return;
    const color = trail.lime ? MANVEON.lime : MANVEON.blueBright;
    const head = cubicPoint(trail, p);
    const tail = cubicPoint(trail, Math.max(0, p - 0.32));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (0.5 + (index % 3) * 0.16) * (trailFade * 0.92 + 0.08);
    const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    g.addColorStop(0, alpha(color, 0));
    g.addColorStop(0.6, alpha(color, 0.35));
    g.addColorStop(1, alpha(color, 0.95));
    ctx.strokeStyle = g;
    ctx.lineWidth = trail.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const steps = 18;
    for (let i = 0; i <= steps; i += 1) {
      const u = Math.max(0, p - 0.32) + ((p - Math.max(0, p - 0.32)) * i) / steps;
      const point = cubicPoint(trail, u);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Bright head.
    glow(ctx, head.x, head.y, 46, color, 0.75);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(head.x, head.y, trail.width * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Ambient streaks keep the frame alive after the logo appears.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = smoothstep((t - (CUES.logo + 0.4)) / 1.2) * 0.5;
  for (let i = 0; i < 6; i += 1) {
    const y = 180 + i * 290 + Math.sin(t * 0.6 + i) * 24;
    const x = ((t * (38 + i * 9) + i * 320) % (W + 700)) - 350;
    const g = ctx.createLinearGradient(x, y, x + 420, y + 60);
    g.addColorStop(0, 'rgba(110,170,255,0)');
    g.addColorStop(0.5, i % 2 ? 'rgba(198,255,61,0.16)' : 'rgba(110,170,255,0.18)');
    g.addColorStop(1, 'rgba(110,170,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 420, y + 60);
    ctx.stroke();
  }
  ctx.restore();

  particleField(ctx, { time: t, count: 40, seed: 113, color: '#BFDBFF', opacity: 0.35, speed: 16 });
  particleField(ctx, { time: t, count: 14, seed: 127, color: MANVEON.lime, opacity: 0.25, speed: 12 });

  // Logo flash.
  const flash = clamp(1 - Math.abs(t - CUES.logo - 0.1) / 0.55);
  if (flash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radialGradient(ctx, W / 2, 790, 0, 560, [
      [0, `rgba(170,215,255,${0.3 * flash})`],
      [0.5, `rgba(80,140,255,${0.1 * flash})`],
      [1, 'rgba(80,140,255,0)']
    ]);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Brand lockup.
  if (logo > 0) {
    const breathe = 0.5 + 0.5 * Math.sin((t - CUES.logo) * 1.4);
    glow(ctx, W / 2, 792, 470, MANVEON.blue, 0.35 * logo + breathe * 0.08);
    ctx.save();
    ctx.globalAlpha = logo;
    ctx.translate(W / 2, 792);
    const s = lerp(0.92, 1, easeOutBack(clamp((t - CUES.logo + 0.2) / 0.8), 1.4));
    ctx.scale(s, s);
    ctx.translate(-W / 2, -792);
    drawManveonLogo(ctx, { cx: W / 2, cy: 792, width: 640, opacity: 1 });
    ctx.restore();
  }

  // Closing statement.
  const line = (from, text, y, opts) => {
    const ease = easeOutCubic(clamp((t - from) / 0.6));
    if (ease <= 0) return;
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.fillStyle = opts.color;
    ctx.font = `${opts.weight || 600} ${opts.size}px ${opts.family || FONT.semi}`;
    drawTracked(ctx, text, W / 2, y + (1 - ease) * 16, opts.tracking || 1.4, 'center', opts.maxWidth || 960);
    ctx.restore();
  };

  line(CUES.tagline, FINAL.tagline[0], 962, {
    color: 'rgba(255,255,255,0.96)',
    weight: 700,
    family: FONT.bold,
    size: 42,
    tracking: 1.2
  });
  line(CUES.tagline + 0.18, FINAL.tagline[1], 1018, {
    color: 'rgba(255,255,255,0.96)',
    weight: 700,
    family: FONT.bold,
    size: 42,
    tracking: 1.2
  });

  const rule = easeOutCubic(clamp((t - CUES.tagline - 0.4) / 0.7));
  if (rule > 0) brandRule(ctx, W / 2, 1066, 520 * rule, rule);

  line(FINAL.times.services, FINAL.services, 1116, {
    color: 'rgba(219,233,248,0.8)',
    weight: 500,
    family: FONT.medium,
    size: 17,
    tracking: 2.4,
    maxWidth: 960
  });

  line(FINAL.times.era, FINAL.era, 1180, {
    color: MANVEON.lime,
    weight: 600,
    family: FONT.semi,
    size: 20,
    tracking: 6,
    maxWidth: 900
  });

  const urlEase = easeOutCubic(clamp((t - FINAL.times.url) / 0.6));
  if (urlEase > 0) {
    ctx.save();
    ctx.globalAlpha = urlEase;
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.font = `500 34px ${FONT.medium}`;
    drawTracked(ctx, FINAL.url, W / 2, 1272 + (1 - urlEase) * 14, 0.6, 'center');
    ctx.restore();
  }

  stagePolish(ctx, t, { vignetteStrength: 0.55, bloom: 0.2, bloomColor: MANVEON.blue, grainAmount: 0.045 });
  ctx.restore();
}
