// Renders the full reel in parallel chunks, concatenates them and muxes the
// score. This keeps `npm run render` comfortably inside a few minutes on a
// multi-core machine.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DURATION } from '../src/reel.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const CHUNKS_DIR = path.join(OUT, 'chunks');
const FINAL = path.join(OUT, 'manveon-reel.mp4');
const AUDIO = path.join(OUT, 'score.wav');

const chunks = Math.max(1, Math.min(6, Number(process.env.CHUNKS || Math.min(os.cpus().length, 4))));

fs.mkdirSync(CHUNKS_DIR, { recursive: true });
for (const file of fs.readdirSync(CHUNKS_DIR)) fs.rmSync(path.join(CHUNKS_DIR, file));

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
  });
}

if (!fs.existsSync(AUDIO)) {
  console.log('Rendering score…');
  await run('node', ['scripts/render-audio.js']);
}

const span = DURATION / chunks;
const started = Date.now();
const jobs = [];
for (let index = 0; index < chunks; index += 1) {
  const from = index * span;
  const to = index === chunks - 1 ? DURATION : (index + 1) * span;
  const file = path.join(CHUNKS_DIR, `part-${String(index).padStart(2, '0')}.mp4`);
  jobs.push(
    run('node', [
      'scripts/render.js',
      `--from=${from.toFixed(3)}`,
      `--to=${to.toFixed(3)}`,
      `--out=${path.relative(ROOT, file)}`
    ])
  );
}
await Promise.all(jobs);

// Concatenate the identical chunks, then add the soundtrack.
const listFile = path.join(CHUNKS_DIR, 'list.txt');
const parts = fs
  .readdirSync(CHUNKS_DIR)
  .filter((file) => file.endsWith('.mp4'))
  .sort();
fs.writeFileSync(listFile, parts.map((file) => `file '${path.join(CHUNKS_DIR, file)}'`).join('\n'));

await run('ffmpeg', [
  '-y',
  '-loglevel', 'error',
  '-f', 'concat',
  '-safe', '0',
  '-i', listFile,
  '-i', AUDIO,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  '-shortest',
  FINAL
]);

const size = fs.statSync(FINAL).size;
console.log(
  `\n${path.relative(ROOT, FINAL)} · ${chunks} chunks · ${(size / 1024 / 1024).toFixed(1)} MB · ${(
    (Date.now() - started) / 1000
  ).toFixed(0)}s`
);
