// Shared mobile-interface building blocks, drawn in the 390 × 844 website
// coordinate space used by every screen.
import { alpha, fillRR, strokeRR, rrPath, linearGradient, radialGradient, drawTracked, measureTracked, seeded } from '../draw.js';
import { SALON, FONT } from '../theme.js';

export const UI_W = 390;
export const UI_H = 844;

export function statusBar(ctx, opts = {}) {
  const { dark = false, time = '9:41', opacity = 1 } = opts;
  const ink = dark ? 'rgba(255,255,255,0.92)' : 'rgba(21,18,15,0.9)';
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = ink;
  ctx.font = `600 13px ${FONT.semi}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(time, 28, 24);

  // Signal.
  const x = UI_W - 96;
  for (let i = 0; i < 4; i += 1) {
    fillRR(ctx, x + i * 5, 27 - (i + 1) * 2.6, 3, (i + 1) * 2.6, 1, ink);
  }
  // Wi-Fi.
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.arc(UI_W - 68, 29, 4 + i * 3.6, Math.PI * 1.22, Math.PI * 1.78);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(UI_W - 68, 29, 0.9, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
  // Battery.
  strokeRR(ctx, UI_W - 46, 19, 22, 11, 3, alpha(dark ? '#ffffff' : SALON.black, 0.45), 1.2);
  fillRR(ctx, UI_W - 44, 21, 15, 7, 1.6, ink);
  fillRR(ctx, UI_W - 22.5, 22.5, 2, 4, 1, alpha(dark ? '#ffffff' : SALON.black, 0.45));
  ctx.restore();
}

export function icon(ctx, name, x, y, size = 20, color = SALON.black, lineWidth = 1.7) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth / s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  switch (name) {
    case 'menu':
      ctx.moveTo(3, 7);
      ctx.lineTo(21, 7);
      ctx.moveTo(3, 12);
      ctx.lineTo(16, 12);
      ctx.moveTo(3, 17);
      ctx.lineTo(21, 17);
      ctx.stroke();
      break;
    case 'back':
      ctx.moveTo(15, 4);
      ctx.lineTo(7, 12);
      ctx.lineTo(15, 20);
      ctx.stroke();
      break;
    case 'chevron':
      ctx.moveTo(9, 4);
      ctx.lineTo(17, 12);
      ctx.lineTo(9, 20);
      ctx.stroke();
      break;
    case 'check':
      ctx.moveTo(4, 12.5);
      ctx.lineTo(10, 18.5);
      ctx.lineTo(20, 6);
      ctx.stroke();
      break;
    case 'sparkle':
      ctx.moveTo(12, 2.5);
      ctx.lineTo(13.8, 9.6);
      ctx.lineTo(21, 12);
      ctx.lineTo(13.8, 14.4);
      ctx.lineTo(12, 21.5);
      ctx.lineTo(10.2, 14.4);
      ctx.lineTo(3, 12);
      ctx.lineTo(10.2, 9.6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'bell':
      ctx.moveTo(6, 16.5);
      ctx.lineTo(7.2, 14.5);
      ctx.lineTo(7.2, 10.5);
      ctx.arc(12, 10.5, 4.8, Math.PI, 0);
      ctx.lineTo(16.8, 14.5);
      ctx.lineTo(18, 16.5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 19, 1.6, 0, Math.PI);
      ctx.stroke();
      break;
    case 'calendar':
      ctx.rect(3.5, 5, 17, 15.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3.5, 9.5);
      ctx.lineTo(20.5, 9.5);
      ctx.moveTo(8, 3);
      ctx.lineTo(8, 7);
      ctx.moveTo(16, 3);
      ctx.lineTo(16, 7);
      ctx.stroke();
      break;
    case 'clock':
      ctx.arc(12, 12, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, 7.5);
      ctx.lineTo(12, 12.5);
      ctx.lineTo(16, 14.5);
      ctx.stroke();
      break;
    case 'pin':
      ctx.moveTo(12, 21);
      ctx.bezierCurveTo(6, 14.5, 5, 11.5, 5, 9.2);
      ctx.arc(12, 9.2, 7, Math.PI, 0);
      ctx.bezierCurveTo(19, 11.5, 18, 14.5, 12, 21);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 9.2, 2.4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'phone':
      ctx.moveTo(7, 3.5);
      ctx.lineTo(10, 8.5);
      ctx.lineTo(8.2, 10.4);
      ctx.bezierCurveTo(9.4, 13.4, 10.6, 14.6, 13.6, 15.8);
      ctx.lineTo(15.5, 14);
      ctx.lineTo(20.5, 17);
      ctx.lineTo(17.5, 20.2);
      ctx.bezierCurveTo(11, 20.5, 3.5, 13, 3.8, 6.5);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'mail':
      ctx.rect(3.5, 5.5, 17, 13);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, 6.5);
      ctx.lineTo(12, 13);
      ctx.lineTo(20, 6.5);
      ctx.stroke();
      break;
    case 'send':
      ctx.moveTo(3.5, 12);
      ctx.lineTo(20.5, 4);
      ctx.lineTo(14, 20);
      ctx.lineTo(11.5, 13.5);
      ctx.closePath();
      ctx.stroke();
      break;
    case 'globe':
      ctx.arc(12, 12, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(12, 12, 3.6, 8.5, 0, 0, Math.PI * 2);
      ctx.moveTo(3.5, 12);
      ctx.lineTo(20.5, 12);
      ctx.stroke();
      break;
    case 'user':
      ctx.arc(12, 8.5, 3.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4.8, 20);
      ctx.bezierCurveTo(5.6, 15.6, 8.2, 14, 12, 14);
      ctx.bezierCurveTo(15.8, 14, 18.4, 15.6, 19.2, 20);
      ctx.stroke();
      break;
    case 'instagram':
      rrPath(ctx, 3.5, 3.5, 17, 17, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 12, 4.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(17.2, 6.9, 1.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'grid':
      rrPath(ctx, 3.5, 3.5, 7, 7, 1.5);
      rrPath(ctx, 13.5, 3.5, 7, 7, 1.5);
      rrPath(ctx, 3.5, 13.5, 7, 7, 1.5);
      rrPath(ctx, 13.5, 13.5, 7, 7, 1.5);
      ctx.stroke();
      break;
    case 'message':
      rrPath(ctx, 3, 5, 18, 13, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8.5, 18);
      ctx.lineTo(7, 21.5);
      ctx.lineTo(12.5, 18);
      ctx.stroke();
      break;
    case 'chart':
      ctx.moveTo(4, 20);
      ctx.lineTo(4, 4);
      ctx.moveTo(4, 20);
      ctx.lineTo(20, 20);
      ctx.moveTo(8, 16);
      ctx.lineTo(8, 11);
      ctx.moveTo(12.5, 16);
      ctx.lineTo(12.5, 7.5);
      ctx.moveTo(17, 16);
      ctx.lineTo(17, 13);
      ctx.stroke();
      break;
    case 'wallet':
      rrPath(ctx, 3.5, 6, 17, 13, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16.5, 12.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      break;
  }
  ctx.restore();
}

// Editorial still-life imagery: warm plaster, glass, silk and champagne light.
// Purely procedural, so the reel ships without stock photography.
const TONES = {
  ivory: {
    bg: ['#F8F0E4', '#EBDCC7', '#D2BB9B'],
    accent: '#B08A57',
    deep: 'rgba(66,44,26,0.35)',
    light: 'rgba(255,250,242,0.92)'
  },
  champagne: {
    bg: ['#EBD7B4', '#D6B784', '#A9834E'],
    accent: '#7E5C31',
    deep: 'rgba(48,30,14,0.4)',
    light: 'rgba(255,241,213,0.9)'
  },
  charcoal: {
    bg: ['#2E2822', '#191411', '#0A0807'],
    accent: '#D9B87F',
    deep: 'rgba(0,0,0,0.55)',
    light: 'rgba(255,226,186,0.55)'
  },
  rose: {
    bg: ['#F6E8E2', '#E7CCC2', '#C5A193'],
    accent: '#A97963',
    deep: 'rgba(70,42,34,0.32)',
    light: 'rgba(255,246,242,0.9)'
  }
};

const VARIANT_TONE = {
  silk: 'champagne',
  glass: 'ivory',
  pearl: 'rose',
  bloom: 'charcoal',
  gold: 'charcoal'
};

export function editorialArt(ctx, x, y, w, h, opts = {}) {
  const { variant = 'silk', radius = 14, label = '', seed = 1, tone: toneName = null } = opts;
  const rand = seeded(seed * 7919 + variant.length * 131);
  const tone = TONES[toneName || VARIANT_TONE[variant] || 'ivory'];

  ctx.save();
  rrPath(ctx, x, y, w, h, radius);
  ctx.clip();

  // Backdrop.
  ctx.fillStyle = linearGradient(ctx, x, y, x + w * 0.9, y + h, [
    [0, tone.bg[0]],
    [0.55, tone.bg[1]],
    [1, tone.bg[2]]
  ]);
  ctx.fillRect(x, y, w, h);

  // Key light from the upper left.
  ctx.fillStyle = radialGradient(ctx, x + w * 0.28, y + h * 0.18, 0, Math.max(w, h) * 0.95, [
    [0, tone.light],
    [0.45, 'rgba(255,246,232,0.12)'],
    [1, 'rgba(255,246,232,0)']
  ]);
  ctx.fillRect(x, y, w, h);

  if (variant === 'silk') drawSilk(ctx, x, y, w, h, tone, rand);
  if (variant === 'glass') drawBottle(ctx, x, y, w, h, tone, rand);
  if (variant === 'pearl') drawPetals(ctx, x, y, w, h, tone, rand);
  if (variant === 'gold') drawGold(ctx, x, y, w, h, tone, rand);
  if (variant === 'bloom') drawMarble(ctx, x, y, w, h, tone, rand);

  // Bottom grade keeps overlaid labels readable.
  ctx.fillStyle = linearGradient(ctx, x, y + h * 0.5, x, y + h, [
    [0, 'rgba(28,18,10,0)'],
    [1, 'rgba(28,18,10,0.5)']
  ]);
  ctx.fillRect(x, y, w, h);

  if (label) {
    ctx.font = `600 10px ${FONT.semi}`;
    ctx.fillStyle = 'rgba(255,250,243,0.9)';
    drawTracked(ctx, label.toUpperCase(), x + 14, y + h - 16, 1.6);
  }

  ctx.restore();
}

function drawSilk(ctx, x, y, w, h, tone, rand) {
  // Layered fabric folds: wide curves of light and shadow.
  for (let i = 0; i < 7; i += 1) {
    const base = y + h * (0.12 + i * 0.13);
    const lift = h * (0.1 + rand() * 0.16);
    ctx.beginPath();
    ctx.moveTo(x - 10, base);
    ctx.bezierCurveTo(x + w * 0.28, base - lift, x + w * 0.62, base + lift, x + w + 10, base - lift * 0.4);
    ctx.lineTo(x + w + 10, base + h * 0.1);
    ctx.bezierCurveTo(x + w * 0.62, base + lift + h * 0.1, x + w * 0.28, base - lift + h * 0.1, x - 10, base + h * 0.1);
    ctx.closePath();
    const light = alpha('#FFF8EC', 0.05 + rand() * 0.16);
    const dark = alpha('#3A2412', 0.06 + rand() * 0.1);
    ctx.fillStyle = linearGradient(ctx, x, base - lift, x + w, base + lift, [
      [0, light],
      [0.5, dark],
      [1, light]
    ]);
    ctx.fill();
    ctx.strokeStyle = alpha('#FFEFD6', 0.16 + rand() * 0.1);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, base - lift * 0.75);
    ctx.bezierCurveTo(x + w * 0.3, base - lift * 1.6, x + w * 0.66, base + lift * 0.3, x + w, base - lift * 1.1);
    ctx.stroke();
  }
  // A shaft of window light.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = linearGradient(ctx, x, y, x + w * 0.8, y + h, [
    [0, 'rgba(255,244,224,0.12)'],
    [1, 'rgba(255,244,224,0)']
  ]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.42, y);
  ctx.lineTo(x + w * 0.08, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBottle(ctx, x, y, w, h, tone, rand) {
  const cx = x + w * 0.5;
  const floor = y + h * 0.82;
  const bw = w * 0.3;
  const bh = h * 0.4;
  const bx = cx - bw / 2;
  const by = floor - bh;
  const dark = tone.bg[2] === '#0A0807' || toneNameIsDark(tone);

  // Contact shadow.
  ctx.fillStyle = radialGradient(ctx, cx, floor + 4, 0, bw * 1.3, [
    [0, 'rgba(0,0,0,0.4)'],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.beginPath();
  ctx.ellipse(cx, floor + 6, bw * 1.2, bh * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bottle body.
  const glassA = dark ? '#F1E4D1' : '#F7ECDC';
  const glassB = dark ? '#BFA98A' : '#C9A87B';
  ctx.fillStyle = linearGradient(ctx, bx, by, bx + bw, by + bh, [
    [0, alpha(glassA, 0.92)],
    [0.2, alpha(glassA, 0.98)],
    [0.55, alpha(glassB, 0.92)],
    [0.8, alpha('#8A6742', 0.85)],
    [1, alpha('#5C4229', 0.9)]
  ]);
  rrPath(ctx, bx, by, bw, bh, bw * 0.16);
  ctx.fill();

  // Neck and cap.
  ctx.fillStyle = alpha(glassB, 0.95);
  fillRR(ctx, cx - bw * 0.13, by - h * 0.09, bw * 0.26, h * 0.095, 3, alpha(glassB, 0.95));
  fillRR(ctx, cx - bw * 0.17, by - h * 0.135, bw * 0.34, h * 0.05, 3, tone.accent);

  // Label.
  const labelH = bh * 0.32;
  fillRR(ctx, bx + bw * 0.08, by + bh * 0.34, bw * 0.84, labelH, 2, 'rgba(252,247,238,0.92)');
  ctx.fillStyle = 'rgba(80,56,32,0.75)';
  ctx.font = `400 ${Math.max(7, bw * 0.14)}px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.fillText('LUXE', cx, by + bh * 0.45);
  ctx.fillStyle = 'rgba(80,56,32,0.45)';
  ctx.font = `600 ${Math.max(4, bw * 0.06)}px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON', cx, by + bh * 0.52, 1, 'center');
  ctx.textAlign = 'left';

  // Specular highlight.
  fillRR(ctx, bx + bw * 0.13, by + bh * 0.06, bw * 0.1, bh * 0.8, bw * 0.05, 'rgba(255,255,255,0.55)');
  // Liquid line.
  ctx.strokeStyle = 'rgba(120,86,52,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bx + 2, by + bh * 0.78);
  ctx.lineTo(bx + bw - 2, by + bh * 0.78);
  ctx.stroke();

  // Companion jar.
  const jw = w * 0.2;
  const jh = h * 0.16;
  const jx = cx - bw * 1.1;
  const jy = floor - jh;
  ctx.fillStyle = radialGradient(ctx, jx + jw * 0.35, jy + jh * 0.3, 0, jw, [
    [0, 'rgba(255,250,240,0.95)'],
    [0.6, alpha(tone.bg[1], 0.95)],
    [1, alpha(tone.bg[2], 0.95)]
  ]);
  rrPath(ctx, jx, jy, jw, jh, 4);
  ctx.fill();
  fillRR(ctx, jx, jy - jh * 0.16, jw, jh * 0.18, 2, tone.accent);
  ctx.fillStyle = radialGradient(ctx, cx - bw * 1.1 + jw / 2, floor + 6, 0, jw, [
    [0, 'rgba(0,0,0,0.3)'],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.beginPath();
  ctx.ellipse(jx + jw / 2, floor + 4, jw * 0.8, jh * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

function toneNameIsDark(tone) {
  return tone.bg[0] === '#2E2822';
}

function drawPetals(ctx, x, y, w, h, tone, rand) {
  const cx = x + w * 0.52;
  const cy = y + h * 0.55;
  // Stem.
  ctx.strokeStyle = alpha('#5E6B43', 0.4);
  ctx.lineWidth = Math.max(1, w * 0.008);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + h * 0.95);
  ctx.bezierCurveTo(x + w * 0.42, y + h * 0.7, cx - w * 0.05, cy + h * 0.2, cx, cy);
  ctx.stroke();

  for (let i = 0; i < 6; i += 1) {
    const angle = -1.2 + i * 0.62 + rand() * 0.2;
    const px = cx + Math.cos(angle) * w * 0.12;
    const py = cy + Math.sin(angle) * h * 0.1;
    const rx = w * (0.11 + rand() * 0.06);
    const ry = h * (0.07 + rand() * 0.05);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    // Shadow.
    ctx.fillStyle = 'rgba(90,50,40,0.16)';
    ctx.beginPath();
    ctx.ellipse(2, 3, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = linearGradient(ctx, -rx, -ry, rx, ry, [
      [0, 'rgba(255,250,246,0.98)'],
      [0.55, 'rgba(240,210,200,0.95)'],
      [1, alpha(tone.accent, 0.9)]
    ]);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Petal veins.
  ctx.strokeStyle = 'rgba(160,110,95,0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.06 + i * w * 0.03, cy);
    ctx.lineTo(cx - w * 0.02 + i * w * 0.03, cy - h * 0.12);
    ctx.stroke();
  }
}

function drawGold(ctx, x, y, w, h, tone, rand) {
  const cx = x + w * 0.5;
  const cy = y + h * 0.55;
  const r = Math.min(w, h) * 0.3;

  // Plinth.
  ctx.fillStyle = linearGradient(ctx, x, y + h * 0.78, x + w, y + h * 0.9, [
    [0, 'rgba(255,240,214,0.18)'],
    [0.5, 'rgba(255,240,214,0.05)'],
    [1, 'rgba(0,0,0,0.25)']
  ]);
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);

  // Ring.
  ctx.save();
  ctx.strokeStyle = linearGradient(ctx, cx - r, cy - r, cx + r, cy + r, [
    [0, '#F7E5BE'],
    [0.38, tone.accent],
    [0.7, '#6E4E2A'],
    [1, '#E8CE9C']
  ]);
  ctx.lineWidth = Math.max(6, r * 0.22);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,248,232,0.35)';
  ctx.lineWidth = Math.max(1.6, r * 0.04);
  ctx.beginPath();
  ctx.arc(cx, cy, r - r * 0.1, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();

  // Sphere resting in front.
  ctx.fillStyle = radialGradient(ctx, cx + r * 0.55, cy + r * 0.75, 0, r * 0.55, [
    [0, 'rgba(255,252,244,0.98)'],
    [0.5, 'rgba(226,201,160,0.95)'],
    [1, 'rgba(120,88,52,0.9)']
  ]);
  ctx.beginPath();
  ctx.arc(cx + r * 0.55, cy + r * 0.75, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.55, cy + r * 1.2, r * 0.45, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMarble(ctx, x, y, w, h, tone, rand) {
  // Warm stone with fine champagne veining: an abstract texture that reads as
  // a beauty campaign backdrop.
  for (let i = 0; i < 7; i += 1) {
    const y0 = y + h * (0.05 + rand() * 0.95);
    const dip = h * (0.06 + rand() * 0.16);
    ctx.beginPath();
    ctx.moveTo(x - 10, y0);
    ctx.bezierCurveTo(
      x + w * 0.25,
      y0 - dip,
      x + w * 0.62,
      y0 + dip,
      x + w + 10,
      y0 - dip * 0.4
    );
    ctx.strokeStyle = alpha(i % 3 === 0 ? tone.accent : '#FFF4E2', 0.14 + rand() * 0.22);
    ctx.lineWidth = 0.8 + rand() * 2.4;
    ctx.stroke();
  }
  // A soft lit edge.
  ctx.fillStyle = linearGradient(ctx, x, y, x + w, y + h, [
    [0, 'rgba(255,246,232,0.16)'],
    [0.5, 'rgba(255,246,232,0)'],
    [1, 'rgba(40,24,12,0.18)']
  ]);
  ctx.fillRect(x, y, w, h);
  // Loose powder grains.
  for (let i = 0; i < 26; i += 1) {
    ctx.fillStyle = alpha('#FFF6E6', 0.05 + rand() * 0.12);
    ctx.beginPath();
    ctx.arc(x + rand() * w, y + rand() * h, 0.6 + rand() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function button(ctx, x, y, w, h, label, opts = {}) {
  const {
    fill = SALON.black,
    color = SALON.white,
    size = 13,
    border = null,
    icon: iconName = null,
    pressed = 0
  } = opts;
  const lift = pressed * 1.5;
  fillRR(ctx, x, y + lift, w, h, h / 2, fill);
  if (border) strokeRR(ctx, x, y + lift, w, h, h / 2, border, 1);
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px ${FONT.semi}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const iconSpace = iconName ? 22 : 0;
  const textW = measureTracked(ctx, label, 0.6);
  const startX = x + w / 2 - (textW + iconSpace) / 2;
  drawTracked(ctx, label, startX + iconSpace, y + h / 2 + lift, 0.6);
  ctx.restore();
  if (iconName) {
    icon(ctx, iconName, startX - 4, y + h / 2 - 8 + lift, 16, color, 1.6);
  }
  return { x, y, w, h };
}

export function sectionLabel(ctx, x, y, text, opts = {}) {
  const { color = SALON.champagne, size = 9, spacing = 2.4, align = 'left' } = opts;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px ${FONT.semi}`;
  drawTracked(ctx, text.toUpperCase(), x, y, spacing, align);
  ctx.restore();
}

export function divider(ctx, x, y, w, color = SALON.line) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

export function chip(ctx, x, y, w, h, label, opts = {}) {
  const { active = false, fill, color, border, size = 11 } = opts;
  fillRR(ctx, x, y, w, h, h / 2, fill || (active ? SALON.black : 'rgba(21,18,15,0.05)'));
  if (border || !active) strokeRR(ctx, x, y, w, h, h / 2, border || SALON.line, 1);
  ctx.save();
  ctx.fillStyle = color || (active ? SALON.white : SALON.black);
  ctx.font = `500 ${size}px ${FONT.medium}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
}

export function avatar(ctx, cx, cy, r, initials, opts = {}) {
  const { fill = SALON.champagne, color = SALON.white, size = r * 0.7 } = opts;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = `400 ${size}px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx, cy + 1);
  ctx.restore();
}

export function monogram(ctx, cx, cy, r, opts = {}) {
  const { dark = false } = opts;
  ctx.save();
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(201,169,107,0.16)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alpha(SALON.champagne, dark ? 0.6 : 0.9);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = dark ? SALON.champagneSoft : SALON.espresso;
  ctx.font = `400 ${r * 0.9}px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LS', cx, cy + 1);
  ctx.restore();
}

export function stickyBar(ctx, text, opts = {}) {
  const { y = UI_H - 78, pressed = 0, sub = null } = opts;
  ctx.save();
  ctx.fillStyle = linearGradient(ctx, 0, y - 24, 0, UI_H, [
    [0, 'rgba(244,235,221,0)'],
    [0.55, 'rgba(244,235,221,0.92)'],
    [1, 'rgba(244,235,221,1)']
  ]);
  ctx.fillRect(0, y - 24, UI_W, UI_H - y + 24);
  button(ctx, 20, y, UI_W - 40, 48, text, {
    size: 13,
    pressed,
    icon: 'calendar'
  });
  if (sub) {
    ctx.fillStyle = SALON.taupe;
    ctx.font = `400 9px ${FONT.sans}`;
    ctx.textAlign = 'center';
    ctx.fillText(sub, UI_W / 2, y + 62);
  }
  ctx.restore();
}

export function caret(ctx, x, y, time, color, height = 14) {
  const visible = Math.floor(time * 2.4) % 2 === 0;
  if (!visible) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y - height, 1.6, height);
}
