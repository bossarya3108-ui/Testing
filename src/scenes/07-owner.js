// Scene 7 — The salon owner's side: a mobile dashboard, a request detail sheet
// and a status update.
import { alpha, glow, clamp, smoothstep, easeOutCubic } from '../draw.js';
import { W, H, MANVEON } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone, drawTouch } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish } from '../stage.js';
import { drawOwnerDashboard } from '../ui/owner.js';

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.35, blue: 0.7, lime: 0.45 });
  bokehField(ctx, {
    time: t,
    count: 8,
    seed: 83,
    colors: ['#C6FF3D', '#7FB6FF', '#E9C48C'],
    area: { x: 0, y: 0, w: W, h: H },
    strength: 0.32,
    size: 80
  });
  particleField(ctx, { time: t, count: 22, seed: 89, color: '#B8FF7A', opacity: 0.16, speed: 10 });

  const sheet = easeOutCubic(clamp((t - CUES.requestOpen - 0.06) / 0.45));
  const confirmed = easeOutCubic(clamp((t - CUES.markConfirmed) / 0.55));
  const updated = smoothstep((t - CUES.statusDone) / 0.6);

  const tap = (when, x, y) => {
    const dt = t - when;
    if (dt < -0.14 || dt > 0.42) return null;
    return { x, y, press: clamp(Math.sin((dt / 0.42) * Math.PI)), progress: clamp(dt / 0.42) };
  };

  drawPhone(ctx, {
    cx: W / 2,
    cy: 1040,
    scale: 720 / 590,
    rotation: -0.018,
    glowColor: updated > 0.2 ? MANVEON.lime : MANVEON.blue,
    glowStrength: 0.45 + updated * 0.2,
    screen: (c) => {
      drawOwnerDashboard(c, { sheet, confirmed, time: t });
      const request = tap(CUES.requestOpen, 195, 270);
      const mark = tap(CUES.markConfirmed, 195, 720);
      if (request) drawTouch(c, request.x, request.y, request);
      if (mark) drawTouch(c, mark.x, mark.y, mark);
    }
  });

  // A quiet pulse showing the customer's request landing in the owner's view.
  const ping = smoothstep((t - 43.2) / 0.9);
  if (ping > 0 && ping < 1) {
    ctx.save();
    ctx.globalAlpha = (1 - ping) * 0.8;
    ctx.strokeStyle = alpha(MANVEON.lime, 0.6);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, 620, 160 + ping * 320, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (updated > 0.05) {
    glow(ctx, W / 2, 900, 560, MANVEON.lime, updated * 0.3);
  }

  stagePolish(ctx, t, { vignetteStrength: 0.78, bloom: 0.3, bloomColor: MANVEON.lime });
  ctx.restore();
}
