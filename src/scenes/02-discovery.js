// Scene 2 — The customer discovers the business: social media becomes the
// salon's own mobile website.
import { alpha, fillRR, radialGradient, drawTracked, smoothstep, clamp, easeOutCubic, easeInOutCubic, lerp } from '../draw.js';
import { W, H, SALON, MANVEON, FONT } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone, drawTouch } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish } from '../stage.js';
import { drawSocialProfile, drawHome } from '../ui/site.js';
import { editorialArt } from '../ui/primitives.js';
import { UI_W, UI_H, statusBar } from '../ui/primitives.js';

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.7, blue: 0.4, lime: 0.08 });
  bokehField(ctx, {
    time: t,
    count: 14,
    seed: 12,
    colors: ['#E9C48C', '#9FC6FF', '#C6FF3D'],
    area: { x: 0, y: 0, w: W, h: H * 0.9 },
    strength: 0.55,
    size: 80
  });
  particleField(ctx, { time: t, count: 34, seed: 9, color: '#FFDFB2', opacity: 0.22, speed: 10 });

  const scroll = easeOutCubic(clamp((t - CUES.socialScroll) / 0.8)) * 10;
  const sheet = easeOutCubic(clamp((t - CUES.socialLink) / 0.42));
  const loaded = smoothstep((t - CUES.siteLoad) / 0.5);
  const homeScroll = easeInOutCubic(clamp((t - (CUES.siteLoad + 0.9)) / 1.5)) * 150;
  const loadProgress = clamp((t - CUES.socialLink) / (CUES.siteLoad - CUES.socialLink));

  const linkTap = touchAt(t, CUES.socialLink, 96, 256 - scroll);
  const scale = lerp(0.985, 1.045, clamp((t - 5.6) / 5.6));
  const driftY = Math.sin(t * 0.5) * 6;

  drawPhone(ctx, {
    cx: W / 2,
    cy: 968 + driftY,
    scale: (700 / 590) * scale,
    rotation: -0.035 + 0.02 * Math.sin(t * 0.7),
    glowColor: MANVEON.blue,
    glowStrength: 0.55,
    screen: (c) => {
      if (loaded > 0.98) {
        drawHome(c, { scroll: homeScroll, time: t });
        return;
      }

      drawSocialProfile(c, { scroll, time: t });
      if (linkTap) drawTouch(c, linkTap.x, linkTap.y, linkTap);

      // A page slides up over the social feed: the site takes over.
      if (sheet > 0) {
        c.save();
        c.translate(0, (1 - sheet) * UI_H);
        loadingSheet(c, t, loadProgress, sheet);
        c.restore();
      }
    }
  });

  stagePolish(ctx, t, { vignetteStrength: 0.8, bloom: 0.35, bloomColor: MANVEON.blue });
  ctx.restore();
}

function touchAt(t, when, x, y) {
  const dt = t - when;
  if (dt < -0.12 || dt > 0.4) return null;
  return {
    x,
    y,
    press: dt < 0 ? 0 : clamp(Math.sin((dt / 0.4) * Math.PI)),
    progress: clamp(dt / 0.4)
  };
}

// The loading state of the salon website, including browser chrome, so the
// jump from social media to the site reads as one continuous action.
function loadingSheet(ctx, t, progress, sheet = 1) {
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H + 120);

  ctx.fillStyle = radialGradient(ctx, UI_W / 2, 330, 0, 300, [
    [0, 'rgba(201,169,107,0.16)'],
    [1, 'rgba(201,169,107,0)']
  ]);
  ctx.fillRect(0, 0, UI_W, UI_H);

  ctx.textAlign = 'center';
  ctx.fillStyle = SALON.champagne;
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'LUXE STUDIO · BEAUTY & SALON', UI_W / 2, 248, 2.6, 'center');
  ctx.fillStyle = SALON.black;
  ctx.font = `400 32px ${FONT.serif}`;
  ctx.fillText('Beauty, refined.', UI_W / 2, 292);
  ctx.textAlign = 'left';

  for (let i = 0; i < 3; i += 1) {
    const w = [222, 178, 240][i];
    fillRR(ctx, (UI_W - w) / 2, 338 + i * 20, w, 7, 3.5, 'rgba(21,18,15,0.07)');
  }

  // Hero placeholder resolving in.
  const artY = 416;
  ctx.save();
  ctx.globalAlpha = 0.9;
  editorialArt(ctx, 40, artY, UI_W - 80, 214, {
    variant: 'silk',
    tone: 'champagne',
    radius: 16,
    seed: 5
  });
  ctx.restore();

  ctx.fillStyle = 'rgba(21,18,15,0.38)';
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.textAlign = 'center';
  ctx.fillText('Opening luxestudio.salon', UI_W / 2, 672);
  ctx.textAlign = 'left';

  fillRR(ctx, (UI_W - 160) / 2, 690, 160, 3, 1.5, 'rgba(21,18,15,0.1)');
  fillRR(ctx, (UI_W - 160) / 2, 690, 160 * progress, 3, 1.5, alpha(SALON.champagne, 0.95));

  // The status bar belongs to the page once it has fully covered the phone.
  if (sheet > 0.97) statusBar(ctx, { dark: false, time: '9:42' });

}
