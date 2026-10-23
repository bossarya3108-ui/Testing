/* ============================================================
   MANVEON concept reel — core helpers
   Deterministic renderer: every draw is a function of time t (seconds, 0..30).
   Canvas: 1080 x 1920 (9:16). Safe areas respected for Reels.
   ============================================================ */
'use strict';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

/* ---------- palette ---------- */
const C = {
  navyDeep:  '#060B16',
  navy:      '#0A1220',
  navy2:     '#0E1830',
  charcoal:  '#14181F',
  charcoal2: '#1B212B',
  ink:       '#222A36',
  blue:      '#3B82F6',
  blueHot:   '#38BDF8',
  lime:      '#A3E635',
  limeSoft:  '#BEF264',
  white:     '#F4F7FB',
  dim:       'rgba(214,226,240,0.62)',
  dimmer:    'rgba(214,226,240,0.38)',
  hair:      'rgba(148,178,210,0.16)',
  warm:      '#FFD9A0',
  warmDeep:  '#C98F4E'
};

/* ---------- math / easing ---------- */
const clamp  = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp   = (a, b, t) => a + (b - a) * t;
const easeOutCubic  = t => 1 - Math.pow(1 - t, 3);
const easeOutQuint  = t => 1 - Math.pow(1 - t, 5);
const easeInOutCubic= t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
const easeOutExpo   = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutBack   = t => { const c = 1.35; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const easeInCubic   = t => t * t * t;

/* normalized progress of t within [a,b], clamped 0..1 */
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
/* window with fade-in/out: rises a->b, falls c->d */
function win(t, a, b, c, d) {
  return Math.min(seg(t, a, b), 1 - seg(t, c, d));
}
/* deterministic pseudo-random from integer seed */
function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ---------- typography ---------- */
const FONT = "'Inter', 'Noto Sans', sans-serif";
function font(weight, size) { return `${weight} ${size}px ${FONT}`; }

/* tracked (letter-spaced) text, horizontally centered at (x,y) */
function trackText(str, x, y, size, weight, spacing, fill, opts = {}) {
  ctx.save();
  ctx.font = font(weight, size);
  ctx.textBaseline = 'alphabetic';
  const chars = [...str];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((s, w) => s + w, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  ctx.fillStyle = fill;
  if (opts.glow) {
    ctx.shadowColor = opts.glowColor || 'rgba(56,189,248,0.55)';
    ctx.shadowBlur = opts.glow;
  }
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cx, y);
    cx += widths[i] + spacing;
  }
  ctx.restore();
  return total;
}

function text(str, x, y, size, weight, fill, opts = {}) {
  ctx.save();
  ctx.font = font(weight, size);
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'alphabetic';
  ctx.fillStyle = fill;
  if (opts.glow) { ctx.shadowColor = opts.glowColor || 'rgba(56,189,248,0.5)'; ctx.shadowBlur = opts.glow; }
  ctx.fillText(str, x, y);
  ctx.restore();
}

/* ---------- surfaces ---------- */
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glassCard(x, y, w, h, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, 'rgba(30,40,56,0.92)');
  g.addColorStop(1, 'rgba(14,20,32,0.92)');
  rr(x, y, w, h, r);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(150,185,220,0.16)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

/* soft radial glow blob */
function glow(x, y, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/* rounded-rect gradient button */
function button(x, y, w, h, r, label, size, bg, fg, glowAmt) {
  ctx.save();
  if (glowAmt) { ctx.shadowColor = 'rgba(59,130,246,0.55)'; ctx.shadowBlur = glowAmt; }
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
  rr(x, y, w, h, r);
  ctx.fillStyle = g; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = font(600, size);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = fg;
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

/* ---------- cinematic overlays ---------- */
let grainTile = null;
function buildGrain() {
  grainTile = document.createElement('canvas');
  grainTile.width = grainTile.height = 256;
  const g = grainTile.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd(i * 0.371 + 1) * 255);
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 255;
  }
  g.putImageData(img, 0, 0);
}

function grain(t) {
  if (!grainTile) buildGrain();
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  const ox = Math.floor(rnd(Math.floor(t * 30) * 3.7) * 256);
  const oy = Math.floor(rnd(Math.floor(t * 30) * 7.3) * 256);
  for (let y = -oy; y < H; y += 256)
    for (let x = -ox; x < W; x += 256)
      ctx.drawImage(grainTile, x, y);
  ctx.restore();
}

function vignette(strength = 0.42) {
  ctx.save();
  const g = ctx.createRadialGradient(W/2, H/2, H * 0.28, W/2, H/2, H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(2,4,10,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* letterbox-free cinematic grade: subtle blue shadows / warm-free */
function grade() {
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(20,60,120,0.20)');
  g.addColorStop(0.5, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,30,70,0.24)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* animated light-leak streak used on transitions */
function lightSweep(t, x, y, len, ang, alpha) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  const g = ctx.createLinearGradient(-len/2, 0, len/2, 0);
  g.addColorStop(0,   'rgba(56,189,248,0)');
  g.addColorStop(0.5, `rgba(120,190,255,${0.5 * alpha})`);
  g.addColorStop(1,   'rgba(56,189,248,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-len/2, -260, len, 520);
  ctx.restore();
}

/* ---------- scene base ---------- */
function baseBg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.navyDeep);
  g.addColorStop(0.55, C.navy);
  g.addColorStop(1, '#05080F');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* small caption chip used to label scenes (top area, inside safe zone) */
function kicker(txt, y, t, t0, alpha = 1) {
  const p = win(t, t0, t0 + 0.5, 0, 999);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p * alpha;
  trackText(txt, W/2, y, 30, 600, 8, C.limeSoft, { glow: 18, glowColor: 'rgba(163,230,53,0.35)' });
  ctx.restore();
}
