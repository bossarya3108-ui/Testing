// On-screen story captions. Kept in one place so typography, placement and
// timing stay consistent across all nine scenes.
import { alpha, drawTracked, wrapText, clamp, easeOutCubic, easeOutExpo, linearGradient } from './draw.js';
import { W, H, FONT, MANVEON } from './theme.js';
import { CAPTIONS } from './timeline.js';

const PLACE_BY_SCENE = {
  1: 'bottom',
  2: 'top',
  3: 'bottom',
  4: 'top',
  5: 'top',
  6: 'top',
  7: 'top',
  8: 'bottom'
};

const SIZE = 42;
const TRACKING = 1.4;
const LINE_HEIGHT = 52;
const MAX_WIDTH = 900;

function scrim(ctx, place) {
  if (place === 'top') {
    ctx.fillStyle = linearGradient(ctx, 0, 0, 0, 430, [
      [0, 'rgba(2,7,13,0.82)'],
      [0.6, 'rgba(2,7,13,0.5)'],
      [1, 'rgba(2,7,13,0)']
    ]);
    ctx.fillRect(0, 0, W, 430);
  } else {
    ctx.fillStyle = linearGradient(ctx, 0, H - 470, 0, H, [
      [0, 'rgba(2,7,13,0)'],
      [0.55, 'rgba(2,7,13,0.72)'],
      [1, 'rgba(2,7,13,0.94)']
    ]);
    ctx.fillRect(0, H - 470, W, 470);
  }
}

function linesFor(ctx, text) {
  ctx.font = `900 ${SIZE}px ${FONT.black}`;
  return wrapText(ctx, text, MAX_WIDTH, TRACKING);
}

function drawLines(ctx, lines, place, opts = {}) {
  const { alphaValue = 1, offset = 0, color = '#FFFFFF', accent = true } = opts;
  if (alphaValue <= 0) return;
  ctx.save();
  ctx.globalAlpha = alphaValue;
  ctx.font = `900 ${SIZE}px ${FONT.black}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';

  const totalHeight = (lines.length - 1) * LINE_HEIGHT;
  const startY = place === 'top' ? 128 + offset : H - 148 - totalHeight + offset;

  if (accent) {
    const barY = startY - SIZE - 22;
    ctx.fillStyle = linearGradient(ctx, W / 2 - 34, barY, W / 2 + 34, barY, [
      [0, alpha(MANVEON.lime, 0)],
      [0.3, MANVEON.lime],
      [0.72, MANVEON.blueBright],
      [1, alpha(MANVEON.blueBright, 0)]
    ]);
    ctx.fillRect(W / 2 - 34, barY, 68, 3);
    // Restore the text colour: the accent bar above replaced fillStyle.
    ctx.fillStyle = color;
  }

  lines.forEach((line, index) => {
    drawTracked(ctx, line, W / 2, startY + index * LINE_HEIGHT, TRACKING, 'center', MAX_WIDTH);
  });
  ctx.restore();
}

function drawSingle(ctx, caption, time) {
  const place = PLACE_BY_SCENE[caption.scene] || 'bottom';
  const inP = easeOutExpo(clamp((time - caption.from) / 0.34));
  const outP = clamp((caption.to - time) / 0.24);
  const visible = Math.min(inP, outP);
  if (visible <= 0) return;

  scrim(ctx, place);
  const lines = linesFor(ctx, caption.text);
  drawLines(ctx, lines, place, {
    alphaValue: visible,
    offset: (1 - inP) * 26 - (1 - outP) * 12
  });
}

function drawStack(ctx, active, time) {
  scrim(ctx, 'bottom');
  const all = CAPTIONS.filter((c) => c.stack);
  ctx.save();
  ctx.font = `900 46px ${FONT.black}`;
  const startY = H - 156 - (all.length - 1) * 66;
  all.forEach((caption, index) => {
    const inP = easeOutCubic(clamp((time - caption.from) / 0.4));
    if (time < caption.from) return;
    const isLast = index === all.length - 1;
    ctx.globalAlpha = inP;
    ctx.font = `900 ${isLast ? 50 : 44}px ${FONT.black}`;
    ctx.fillStyle = isLast ? MANVEON.lime : 'rgba(255,255,255,0.95)';
    drawTracked(ctx, caption.text, W / 2, startY + index * 66 + (1 - inP) * 20, 1.6, 'center', 940);
  });
  ctx.restore();
}

export function drawCaptions(ctx, time) {
  const active = CAPTIONS.filter((caption) => time >= caption.from && time <= caption.to);
  if (!active.length) return;
  const stacks = active.filter((caption) => caption.stack);
  if (stacks.length) {
    drawStack(ctx, active, time);
    return;
  }
  drawSingle(ctx, active[active.length - 1], time);
}
