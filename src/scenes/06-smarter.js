// Scene 6 — Smarter digital features: the AI concierge answers a question,
// notifications arrive, then the connected flow is laid out over the phone.
import { alpha, fillRR, strokeRR, glow, drawTracked, clamp, smoothstep, easeOutCubic, easeOutExpo } from '../draw.js';
import { W, H, MANVEON, FONT } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish, glassPanel } from '../stage.js';
import { drawAssistant } from '../ui/assistant.js';
import { drawNotifications } from '../ui/booking.js';
import { icon } from '../ui/primitives.js';

const FLOW = [
  { label: 'WEBSITE', icon: 'globe', tone: 'blue' },
  { label: 'AI ASSISTANT', icon: 'sparkle', tone: 'lime' },
  { label: 'BOOKING REQUEST', icon: 'calendar', tone: 'blue' },
  { label: 'CONFIRMATION', icon: 'check', tone: 'lime' },
  { label: 'REMINDER', icon: 'bell', tone: 'blue' }
];

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.3, blue: 0.85, lime: 0.3 });
  bokehField(ctx, {
    time: t,
    count: 9,
    seed: 71,
    colors: ['#7FB6FF', '#C6FF3D'],
    area: { x: 0, y: 0, w: W, h: H },
    strength: 0.35,
    size: 80
  });
  particleField(ctx, { time: t, count: 30, seed: 73, color: '#9FD4FF', opacity: 0.2, speed: 12 });

  const typedQuestion = clamp((t - 35.25) / 0.6);
  const sent = smoothstep((t - CUES.ask) / 0.18);
  const answer = clamp((t - 36.15) / 1.05);
  const chips = clamp((t - 37.15) / 0.35);
  const toNotifications = smoothstep((t - 38.1) / 0.45);
  const notifOne = clamp((t - CUES.notifOne) / 0.45);
  const notifTwo = clamp((t - CUES.notifTwo) / 0.45);
  const chain = smoothstep((t - CUES.chain) / 0.45);

  const cy = 900 + Math.sin(t * 0.6) * 5;
  const camScale = 1 + chain * 0.03 - toNotifications * 0.01;

  drawPhone(ctx, {
    cx: W / 2,
    cy,
    scale: (640 / 590) * camScale,
    rotation: -0.02,
    glowColor: MANVEON.lime,
    glowStrength: 0.45 + chain * 0.2,
    dim: chain * 0.95,
    screen: (c) => {
      if (toNotifications < 1) {
        c.save();
        c.globalAlpha = 1 - toNotifications;
        c.translate(0, -toNotifications * 40);
        drawAssistant(c, { typedQuestion, sent, answer, chips, time: t });
        c.restore();
      }
      if (toNotifications > 0) {
        c.save();
        c.globalAlpha = toNotifications;
        drawNotifications(c, { one: notifOne, two: notifTwo, time: t });
        c.restore();
      }
    }
  });

  if (chain > 0.01) drawFlow(ctx, t, chain);

  stagePolish(ctx, t, { vignetteStrength: 0.8, bloom: 0.35, bloomColor: MANVEON.blue });
  ctx.restore();
}

function drawFlow(ctx, t, amount) {
  const start = CUES.chain;
  const nodeW = 620;
  const nodeH = 84;
  const gap = 24;
  const startY = 588;
  const cx = W / 2;

  const firstCenter = startY + nodeH / 2;
  const lastCenter = startY + (FLOW.length - 1) * (nodeH + gap) + nodeH / 2;

  // Rail.
  const railP = clamp((t - start - 0.1) / 0.9);
  ctx.save();
  ctx.strokeStyle = 'rgba(140,190,255,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, firstCenter);
  ctx.lineTo(cx, firstCenter + (lastCenter - firstCenter) * easeOutCubic(railP));
  ctx.stroke();
  ctx.restore();

  FLOW.forEach((node, index) => {
    const at = start + index * 0.2;
    const p = clamp((t - at) / 0.36);
    if (p <= 0) return;
    const ease = easeOutExpo(p);
    const y = startY + index * (nodeH + gap);
    const tone = node.tone === 'lime' ? MANVEON.lime : MANVEON.blueBright;

    ctx.save();
    ctx.globalAlpha = ease * amount;
    ctx.translate(0, (1 - ease) * 26);
    glassPanel(ctx, cx - nodeW / 2, y, nodeW, nodeH, {
      radius: 20,
      fill: 'rgba(6,17,28,0.92)',
      stroke: alpha(tone, 0.28),
      glowColor: tone,
      glowStrength: 0.18 * ease
    });

    // Icon plate.
    fillRR(ctx, cx - nodeW / 2 + 16, y + 16, 52, 52, 16, alpha(tone, 0.14));
    strokeRR(ctx, cx - nodeW / 2 + 16, y + 16, 52, 52, 16, alpha(tone, 0.35), 1);
    icon(ctx, node.icon, cx - nodeW / 2 + 30, y + 30, 24, tone, 1.7);

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.font = `600 23px ${FONT.semi}`;
    drawTracked(ctx, node.label, cx - nodeW / 2 + 88, y + nodeH / 2 + 8, 1.4);

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `600 15px ${FONT.semi}`;
    ctx.textAlign = 'right';
    ctx.fillText(`0${index + 1}`, cx + nodeW / 2 - 24, y + nodeH / 2 + 6);
    ctx.textAlign = 'left';

    ctx.restore();

    // Connector to the next node.
    if (index < FLOW.length - 1) {
      const lineP = clamp((t - at - 0.12) / 0.28);
      if (lineP > 0) {
        const y0 = y + nodeH;
        const y1 = y0 + gap;
        ctx.save();
        ctx.globalAlpha = lineP * amount;
        ctx.strokeStyle = alpha(MANVEON.lime, 0.55);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, y0);
        ctx.lineTo(cx, y0 + gap * lineP);
        ctx.stroke();
        ctx.restore();
      }
    }
  });

  // Travelling light along the whole rail.
  if (railP > 0.98) {
    const travel = ((t - start) * 0.5) % 1;
    const y = firstCenter + (lastCenter - firstCenter) * travel;
    glow(ctx, cx, y, 40, MANVEON.lime, 0.8);
    ctx.fillStyle = MANVEON.lime;
    ctx.beginPath();
    ctx.arc(cx, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
