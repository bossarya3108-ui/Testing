// Manveon brand lockup.
//
// The brief requires the official logo asset to be used exactly as supplied.
// No logo file was provided with this repository, so the renderer draws the
// wordmark typographically and will use `assets/logo/manveon-logo.png` instead
// as soon as that file exists (see assets/logo/README.md). Nothing here
// redraws or approximates a logo mark.
import { alpha, drawTracked, measureTracked } from './draw.js';
import { FONT, MANVEON } from './theme.js';

let logoImage = null;

export function setManveonLogo(image) {
  logoImage = image;
}

export function drawManveonLogo(ctx, opts = {}) {
  const { cx, cy, width = 620, opacity = 1 } = opts;
  ctx.save();
  ctx.globalAlpha = opacity;

  if (logoImage) {
    const ratio = logoImage.height / logoImage.width;
    const w = width;
    const h = w * ratio;
    ctx.drawImage(logoImage, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
    return { width: w, height: h };
  }

  const size = width / 5.2;
  ctx.font = `900 ${size}px ${FONT.black}`;
  ctx.fillStyle = MANVEON.white;
  ctx.textBaseline = 'middle';
  const textWidth = measureTracked(ctx, 'MANVEON', size * 0.14);
  drawTracked(ctx, 'MANVEON', cx, cy, size * 0.14, 'center');
  ctx.restore();
  return { width: textWidth, height: size };
}

// A thin lime rule used as a layout accent below the lockup — not part of the
// logo itself.
export function brandRule(ctx, cx, y, width = 560, opacity = 1) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const g = ctx.createLinearGradient(cx - width / 2, y, cx + width / 2, y);
  g.addColorStop(0, alpha(MANVEON.lime, 0));
  g.addColorStop(0.25, alpha(MANVEON.lime, 0.9));
  g.addColorStop(0.75, alpha(MANVEON.blueBright, 0.9));
  g.addColorStop(1, alpha(MANVEON.blueBright, 0));
  ctx.fillStyle = g;
  ctx.fillRect(cx - width / 2, y, width, 2);
  ctx.restore();
}
