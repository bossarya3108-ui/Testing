// Renders the score to out/score.wav (used by the MP4 render).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderScore, encodeWav } from '../src/audio/score.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });

const started = Date.now();
const score = renderScore();
const wav = encodeWav(score);
const file = path.join(OUT, 'score.wav');
fs.writeFileSync(file, wav);
console.log(
  `Wrote ${path.relative(ROOT, file)} · ${score.duration.toFixed(2)}s · peak ${score.peak.toFixed(3)} · ${(
    (Date.now() - started) / 1000
  ).toFixed(1)}s render`
);
