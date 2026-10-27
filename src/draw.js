// Small canvas toolkit shared by every scene. Kept dependency-free so the same
// drawing code runs in the browser preview and in node-canvas for the MP4.

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOutCubic = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(t)));
export const easeOutBack = (t, overshoot = 1.4) => {
  const x = clamp(t) - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
};

// #rrggbb / #rgb into rgba() with a custom alpha.
export function alpha(hex, a = 1) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function rrPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export function fillRR(ctx, x, y, w, h, r, fill) {
  rrPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function strokeRR(ctx, x, y, w, h, r, stroke, lineWidth = 1) {
  rrPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function linearGradient(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

export function radialGradient(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

// Soft additive light blob used for glows, bokeh and screens.
export function glow(ctx, x, y, radius, color, strength = 1) {
  if (radius <= 0 || strength <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radialGradient(ctx, x, y, 0, radius, [
    [0, alpha(color, 0.55 * strength)],
    [0.45, alpha(color, 0.18 * strength)],
    [1, alpha(color, 0)]
  ]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function vignette(ctx, w, h, strength = 0.55) {
  const g = ctx.createRadialGradient(w / 2, h * 0.48, h * 0.2, w / 2, h * 0.5, h * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.7, `rgba(0,0,0,${0.18 * strength})`);
  g.addColorStop(1, `rgba(0,0,0,${0.72 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function createCanvasLike(ctx, w, h) {
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
  return new ctx.canvas.constructor(w, h);
}

const grainCache = new WeakMap();

function grainPattern(ctx, size = 220) {
  let cached = grainCache.get(ctx);
  if (cached) return cached;
  const canvas = createCanvasLike(ctx, size, size);
  const gctx = canvas.getContext('2d');
  const image = gctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = Math.random() * 255;
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = Math.random() * 26;
  }
  gctx.putImageData(image, 0, 0);
  const pattern = ctx.createPattern(canvas, 'repeat');
  grainCache.set(ctx, pattern);
  return pattern;
}

// A whisper of film grain stops large gradients from banding.
export function grain(ctx, w, h, opacity = 0.055, time = 0) {
  const pattern = grainPattern(ctx);
  if (!pattern) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = 'overlay';
  const shift = Math.floor(time * 24) % 220;
  ctx.translate(-shift, -shift * 0.5);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w + 220, h + 220);
  ctx.restore();
}

// Letter-spaced text. Each glyph is placed manually so tracking works
// identically in browsers and node-canvas.
export function measureTracked(ctx, text, spacing = 0) {
  let width = 0;
  for (const ch of text) width += ctx.measureText(ch).width + spacing;
  return Math.max(0, width - spacing);
}

export function drawTracked(ctx, text, x, y, spacing = 0, align = 'left', fitWidth = 0) {
  const measured = measureTracked(ctx, text, spacing);
  let tracking = spacing;
  if (fitWidth > 0 && measured > fitWidth && text.length > 1) {
    tracking = spacing - (measured - fitWidth) / (text.length - 1);
  }
  const width = measureTracked(ctx, text, tracking);
  let cursor = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
  ctx.textAlign = previousAlign;
  return width;
}

export function wrapText(ctx, text, maxWidth, spacing = 0) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureTracked(ctx, candidate, spacing) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Draws a caption-style block, returns the total height used.
export function paragraph(ctx, text, options) {
  const {
    x,
    y,
    maxWidth,
    size = 40,
    lineHeight = size * 1.14,
    family = 'Barlow',
    weight = '',
    color = '#fff',
    align = 'center',
    spacing = 0,
    maxLines = 0
  } = options;
  ctx.save();
  ctx.font = `${weight ? weight + ' ' : ''}${size}px ${family}`;
  ctx.fillStyle = color;
  let lines = wrapText(ctx, text, maxWidth, spacing);
  if (maxLines && lines.length > maxLines) lines = lines.slice(0, maxLines);
  lines.forEach((line, index) => {
    drawTracked(ctx, line, x, y + index * lineHeight, spacing, align, maxWidth);
  });
  ctx.restore();
  return lines.length * lineHeight;
}

// Deterministic pseudo-random generator: keeps particle fields stable frame to
// frame instead of jittering.
export function seeded(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
