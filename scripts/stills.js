// Renders individual PNG stills for quick visual inspection:
//   node scripts/stills.js 4.8 12 33.2
import { createCanvas } from 'canvas';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerReelFonts } from './fonts.js';
import { renderFrame, W, H, DURATION } from '../src/reel.js';
import { loadReelLogo } from './logo.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out/stills');
fs.mkdirSync(OUT, { recursive: true });

registerReelFonts();
await loadReelLogo();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const defaults = [1.4, 4.8, 7.2, 10.2, 13.4, 16.1, 19.8, 22.6, 25.0, 27.6, 33.0, 37.4, 41.2, 45.9, 48.8, 51.2, 54.6, 57.2];
const times = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
const list = times.length ? times : defaults;

for (const t of list) {
  const clamped = Math.max(0, Math.min(DURATION - 0.01, t));
  const started = Date.now();
  renderFrame(ctx, clamped);
  const file = path.join(OUT, `t${clamped.toFixed(2)}.png`);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  console.log(`${path.relative(ROOT, file)}  (${Date.now() - started}ms)`);
}
