// The black smartphone that carries the whole story. Drawn procedurally so it
// stays crisp at any scale in both the browser and the offline renderer.
import { fillRR, rrPath, strokeRR, linearGradient, radialGradient, glow, clamp } from './draw.js';
import { MANVEON } from './theme.js';

const DEVICE = {
  uiWidth: 390,
  uiHeight: 844,
  screenW: 564,
  screenH: Math.round((564 * 844) / 390), // 1221
  bezel: 13,
  radius: 86,
  get bodyW() {
    return this.screenW + this.bezel * 2;
  },
  get bodyH() {
    return this.screenH + this.bezel * 2;
  }
};

/**
 * Draws the device centred on (cx, cy).
 * `screen(ctx, ui)` receives a context already scaled to the 390×844 website
 * coordinate space.
 */
export function drawPhone(ctx, options) {
  const {
    cx,
    cy,
    scale = 1,
    rotation = 0,
    glowColor = MANVEON.blue,
    glowStrength = 0.55,
    screen,
    promptGlow = 0,
    dim = 0,
    shadow = 1,
    reflection = 1
  } = options;

  const { bodyW, bodyH, screenW, screenH, bezel, radius } = DEVICE;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  if (glowStrength > 0) {
    glow(ctx, 0, 0, bodyH * 0.62, glowColor, glowStrength);
  }

  // Cast shadow beneath the device.
  if (shadow > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0,0,0,${0.7 * shadow})`;
    ctx.shadowBlur = 70;
    ctx.shadowOffsetY = 26;
    fillRR(ctx, -bodyW / 2, -bodyH / 2, bodyW, bodyH, radius, '#05070a');
    ctx.restore();
  }

  // Metal frame.
  fillRR(
    ctx,
    -bodyW / 2,
    -bodyH / 2,
    bodyW,
    bodyH,
    radius,
    linearGradient(ctx, -bodyW / 2, -bodyH / 2, bodyW / 2, bodyH / 2, [
      [0, '#5a636e'],
      [0.18, '#2b313a'],
      [0.5, '#14181e'],
      [0.82, '#242a32'],
      [1, '#6c7683']
    ])
  );

  // Polished edge highlight.
  strokeRR(
    ctx,
    -bodyW / 2 + 1,
    -bodyH / 2 + 1,
    bodyW - 2,
    bodyH - 2,
    radius - 1,
    linearGradient(ctx, -bodyW / 2, -bodyH / 2, bodyW / 2, bodyH / 2, [
      [0, 'rgba(255,255,255,0.55)'],
      [0.35, 'rgba(255,255,255,0.06)'],
      [0.7, 'rgba(255,255,255,0.02)'],
      [1, 'rgba(255,255,255,0.35)']
    ]),
    2
  );

  // Side buttons.
  ctx.fillStyle = '#2c323a';
  fillRR(ctx, bodyW / 2 - 2, -190, 4, 96, 2, '#3a424c');
  fillRR(ctx, -bodyW / 2 - 2, -240, 4, 62, 2, '#3a424c');
  fillRR(ctx, -bodyW / 2 - 2, -160, 4, 62, 2, '#3a424c');

  // Black bezel and screen.
  fillRR(ctx, -screenW / 2 - bezel, -screenH / 2 - bezel, screenW + bezel * 2, screenH + bezel * 2, radius - 10, '#050608');

  ctx.save();
  rrPath(ctx, -screenW / 2, -screenH / 2, screenW, screenH, radius - 20);
  ctx.clip();
  ctx.translate(-screenW / 2, -screenH / 2);
  const uiScale = screenW / DEVICE.uiWidth;
  ctx.scale(uiScale, uiScale);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, DEVICE.uiWidth, DEVICE.uiHeight + 2);
  if (screen) screen(ctx, { w: DEVICE.uiWidth, h: DEVICE.uiHeight, scale: uiScale });
  ctx.restore();

  // Screen glass: diagonal sheen plus a cool top highlight.
  if (reflection > 0) {
    ctx.save();
    rrPath(ctx, -screenW / 2, -screenH / 2, screenW, screenH, radius - 20);
    ctx.clip();
    ctx.globalAlpha = 0.1 * reflection;
    ctx.fillStyle = linearGradient(ctx, -screenW / 2, -screenH / 2, screenW / 2, screenH / 3, [
      [0, 'rgba(255,255,255,0.55)'],
      [0.35, 'rgba(255,255,255,0.05)'],
      [0.55, 'rgba(255,255,255,0.0)'],
      [1, 'rgba(255,255,255,0.12)']
    ]);
    ctx.beginPath();
    ctx.moveTo(-screenW / 2, -screenH / 2);
    ctx.lineTo(screenW * 0.15, -screenH / 2);
    ctx.lineTo(-screenW / 2, screenH * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.1 * reflection;
    ctx.fillStyle = radialGradient(ctx, -screenW * 0.28, -screenH * 0.34, 0, screenW * 0.7, [
      [0, 'rgba(190,220,255,0.5)'],
      [1, 'rgba(190,220,255,0)']
    ]);
    ctx.fillRect(-screenW / 2, -screenH / 2, screenW, screenH);
    // Inner edge darkening keeps the panel looking recessed.
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 10;
    rrPath(ctx, -screenW / 2, -screenH / 2, screenW, screenH, radius - 20);
    ctx.stroke();
    ctx.restore();
  }

  if (dim > 0) {
    ctx.save();
    rrPath(ctx, -screenW / 2, -screenH / 2, screenW, screenH, radius - 20);
    ctx.fillStyle = `rgba(2,6,12,${clamp(dim) * 0.72})`;
    ctx.fill();
    ctx.restore();
  }

  // Dynamic island.
  const islandW = 132;
  const islandH = 36;
  fillRR(ctx, -islandW / 2, -screenH / 2 + 20, islandW, islandH, islandH / 2, '#010203');
  ctx.fillStyle = 'rgba(30,42,58,0.9)';
  ctx.beginPath();
  ctx.arc(islandW / 2 - 26, -screenH / 2 + 20 + islandH / 2, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Home indicator.
  fillRR(ctx, -86, screenH / 2 - 20, 172, 7, 3.5, 'rgba(255,255,255,0.55)');

  if (promptGlow > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = promptGlow * 0.5;
    ctx.strokeStyle = MANVEON.lime;
    ctx.lineWidth = 2;
    rrPath(ctx, -bodyW / 2 - 8, -bodyH / 2 - 8, bodyW + 16, bodyH + 16, radius + 8);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// A touch indicator: a soft contact shadow, a warm fingertip suggestion and a
// clean ripple. Reads on both the ivory website and the dark dashboard.
export function drawTouch(ctx, x, y, opts = {}) {
  const { press = 0, progress = 1, swipe = null, alphaValue = 1 } = opts;
  const radius = 9.5 * (1 - press * 0.12);

  ctx.save();
  ctx.globalAlpha = alphaValue;

  // Soft shadow of the hand falling across the glass.
  const shadow = ctx.createLinearGradient(x, y, x + 44, y + 96);
  shadow.addColorStop(0, 'rgba(0,0,0,0.22)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(x + 26, y + 62, 30, 66, -0.62, 0, Math.PI * 2);
  ctx.fill();

  if (swipe) {
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + swipe);
    ctx.stroke();
  }

  // Contact point.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radialGradient(ctx, x, y, 0, radius * 3.2, [
    [0, 'rgba(255,248,235,0.5)'],
    [0.35, 'rgba(255,240,215,0.16)'],
    [1, 'rgba(255,240,215,0)']
  ]);
  ctx.beginPath();
  ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,250,240,0.55)';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  if (progress < 1) {
    ctx.strokeStyle = `rgba(255,255,255,${0.42 * (1 - progress)})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y, radius + progress * 20, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
