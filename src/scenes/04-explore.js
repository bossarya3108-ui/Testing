// Scene 4 — Let the viewer explore the website: tap Explore Services, open
// Makeup, scroll the packages, then return to the navigation drawer.
import { alpha, fillRR, radialGradient, glow, clamp, smoothstep, easeOutCubic, easeInOutCubic } from '../draw.js';
import { W, H, MANVEON, SALON } from '../theme.js';
import { CUES } from '../timeline.js';
import { drawPhone, drawTouch } from '../phone.js';
import { deepBackground, bokehField, particleField, stagePolish } from '../stage.js';
import { drawHome, drawMakeupPage, drawMenu, LAYOUT } from '../ui/site.js';
import { UI_W } from '../ui/primitives.js';

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.55, blue: 0.7, lime: 0.15 });
  bokehField(ctx, {
    time: t,
    count: 10,
    seed: 41,
    colors: ['#E9C48C', '#9FC6FF'],
    area: { x: 0, y: 0, w: W, h: H },
    strength: 0.4,
    size: 90
  });
  particleField(ctx, { time: t, count: 28, seed: 29, color: '#BFD8FF', opacity: 0.18, speed: 8 });

  // Scroll choreography.
  const homeScroll = easeInOutCubic(clamp((t - CUES.exploreTap) / 1.15)) * LAYOUT.exploreScroll;
  const makeupEnter = easeOutCubic(clamp((t - (CUES.makeupTap + 0.05)) / 0.5));
  const makeupScroll = easeInOutCubic(clamp((t - CUES.makeupScroll) / 1.05)) * LAYOUT.makeupScroll;
  const menuOpen = easeOutCubic(clamp((t - CUES.menuTap) / 0.35));
  const isMakeup = t >= CUES.makeupTap + 0.05;

  const tap = (when, x, y, size = 1) => touchAt(t, when, x, y, size);
  const explore = tap(CUES.exploreTap, 102, 496 - homeScroll * 0.15);
  const makeup = tap(CUES.makeupTap, 105, 428, 1.1);
  const menu = tap(CUES.menuTap, 354, 80);
  const book = tap(CUES.menuBook, 240, 597, 1.15);

  const camScale = 1 + smoothstep((t - 17.4) / 4.0) * 0.02 + menuOpen * 0.035;
  const cy = 1040 - menuOpen * 6;

  drawPhone(ctx, {
    cx: W / 2,
    cy,
    scale: (720 / 590) * camScale,
    rotation: -0.025 + Math.sin(t * 0.55) * 0.008,
    glowColor: MANVEON.blue,
    glowStrength: 0.5,
    screen: (c) => {
      if (!isMakeup) {
        drawHome(c, { scroll: homeScroll, time: t });
      } else {
        // Push transition: home slides left, makeup slides in.
        if (makeupEnter < 1) {
          c.save();
          c.globalAlpha = 1 - makeupEnter;
          c.translate(-70 * makeupEnter, 0);
          drawHome(c, { scroll: LAYOUT.exploreScroll, time: t });
          c.restore();
        }
        c.save();
        c.globalAlpha = makeupEnter;
        c.translate(130 * (1 - makeupEnter), 0);
        drawMakeupPage(c, { scroll: makeupScroll, time: t });
        c.restore();
      }

      if (menuOpen > 0) {
        drawMenu(c, { open: menuOpen, selected: -1 });
      }

      if (explore) drawTouch(c, explore.x, explore.y, explore);
      if (makeup) drawTouch(c, makeup.x, makeup.y, makeup);
      if (menu) drawTouch(c, menu.x, menu.y, menu);
      if (book) drawTouch(c, book.x, book.y, book);

      scrollIndicator(c, isMakeup ? makeupScroll / LAYOUT.makeupScroll : homeScroll / LAYOUT.exploreScroll);
    }
  });

  // Soft floor glow beneath the device.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radialGradient(ctx, W / 2, 1840, 0, 380, [
    [0, alpha(MANVEON.blueBright, 0.12)],
    [0.6, alpha(MANVEON.lime, 0.04)],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.fillRect(0, 1500, W, 420);
  ctx.restore();

  stagePolish(ctx, t, { vignetteStrength: 0.75, bloom: 0.35, bloomColor: MANVEON.blue });
  ctx.restore();
}

function touchAt(t, when, x, y, size = 1) {
  const dt = t - when;
  if (dt < -0.14 || dt > 0.42) return null;
  return {
    x,
    y,
    press: dt < 0 ? 0 : clamp(Math.sin((dt / 0.42) * Math.PI)),
    progress: clamp(dt / 0.42),
    size
  };
}

function scrollIndicator(ctx, ratio) {
  if (ratio <= 0.01) return;
  const trackY = 96;
  const trackH = 690;
  fillRR(ctx, UI_W - 8, trackY, 3, trackH, 1.5, 'rgba(21,18,15,0.06)');
  fillRR(ctx, UI_W - 8, trackY + ratio * (trackH - 90), 3, 90, 1.5, alpha(SALON.taupe, 0.45));
}
