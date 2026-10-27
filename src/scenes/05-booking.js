// Scene 5 — From browsing to booking: a five-step request flow and a clear
// confirmation that the salon still has to confirm availability.
import { alpha, glow, clamp, smoothstep, easeOutCubic } from '../draw.js';
import { W, H, MANVEON } from '../theme.js';
import { CUES, BEAT } from '../timeline.js';
import { drawPhone, drawTouch } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish } from '../stage.js';
import { drawBookingStep, drawConfirmation } from '../ui/booking.js';

const STEP_TIMES = [26.2, 27.15, 28.35, 29.4, 30.95];

function stepIndexAt(t) {
  let index = 0;
  for (let i = 0; i < STEP_TIMES.length; i += 1) {
    if (t >= STEP_TIMES[i]) index = i;
  }
  return index;
}

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.35, blue: 0.75, lime: 0.2 });
  bokehField(ctx, {
    time: t,
    count: 9,
    seed: 57,
    colors: ['#D9B98C', '#8FC0FF'],
    area: { x: 0, y: 0, w: W, h: H },
    strength: 0.38,
    size: 80
  });
  particleField(ctx, { time: t, count: 24, seed: 61, color: '#CDE2FF', opacity: 0.16, speed: 9 });

  const step = stepIndexAt(t);
  const stepStart = STEP_TIMES[step];
  const entry = easeOutCubic(clamp((t - stepStart) / 0.32));
  const typed = clamp((t - CUES.typeStart) / (CUES.typeEnd - CUES.typeStart));
  const confirmed = smoothstep((t - CUES.confirmed) / 0.6);
  const confirmGlow = clamp((t - CUES.confirmed + 0.1) / 0.5) * (1 - clamp((t - CUES.confirmed - 1.6) / 1.2));

  const press = (when) => {
    const dt = t - when;
    if (dt < -0.14 || dt > 0.42) return 0;
    return clamp(Math.sin((clamp(dt / 0.42) * Math.PI) * 0.5));
  };

  const tap = (when, x, y) => {
    const dt = t - when;
    if (dt < -0.14 || dt > 0.42) return null;
    return { x, y, press: clamp(Math.sin((dt / 0.42) * Math.PI)), progress: clamp(dt / 0.42) };
  };

  const camScale = 1 + confirmed * 0.035 - (1 - entry) * 0.01;
  const cy = 1040 + Math.sin(t * 0.7) * 4;

  drawPhone(ctx, {
    cx: W / 2,
    cy,
    scale: (720 / 590) * camScale,
    rotation: -0.02,
    glowColor: MANVEON.lime,
    glowStrength: 0.35 + confirmGlow * 0.55,
    screen: (c) => {
      if (confirmed < 1) {
        c.save();
        c.globalAlpha = 1 - smoothstep((t - CUES.confirmed) / 0.35);
        c.translate(0, (1 - entry) * 46);
        drawBookingStep(c, {
          step,
          time: t,
          typed,
          pressed: press(step === 4 ? CUES.submit : CUES.continueTap) > 0 ? 'cta' : null
        });
        c.restore();

        const serviceTap = tap(CUES.servicePick, 195, 246);
        const dateTap = tap(CUES.datePick, 143, 265);
        const timeTap = tap(CUES.timePick, 276, 247);
        const continueTap = tap(CUES.continueTap, 195, 790);
        const submitTap = tap(CUES.submit, 195, 790);
        [serviceTap, dateTap, timeTap, continueTap, submitTap].forEach((touch) => {
          if (touch) drawTouch(c, touch.x, touch.y, touch);
        });
      }

      if (confirmed > 0) {
        drawConfirmation(c, {
          appear: easeOutCubic(clamp((t - CUES.confirmed) / 0.45)),
          time: t
        });
        // A heartbeat ring on the confirmation mark.
        const pulse = (t - CUES.confirmed) % BEAT;
        if (pulse < 1) {
          c.save();
          c.strokeStyle = alpha(MANVEON.lime, 0.4 * (1 - pulse));
          c.lineWidth = 2;
          c.beginPath();
          c.arc(195, 220, 50 + pulse * 60, 0, Math.PI * 2);
          c.stroke();
          c.restore();
        }
      }
    }
  });

  // Confirmation halo.
  if (confirmGlow > 0.02) {
    glow(ctx, W / 2, 1040, 520, MANVEON.lime, confirmGlow * 0.35);
  }

  stagePolish(ctx, t, { vignetteStrength: 0.78, bloom: 0.3, bloomColor: MANVEON.blue });
  ctx.restore();
}
