// Offline renderer: draws every frame with node-canvas and pipes raw pixels
// straight into ffmpeg. Run the whole reel with `npm run render`.
//
//   node scripts/render.js --from=0 --to=10 --out=out/part.mp4 [--audio=out/score.wav]
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';
import { registerReelFonts } from './fonts.js';
import { renderFrame, W, H, FPS, DURATION } from '../src/reel.js';
import { loadReelLogo } from './logo.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const match = process.argv.find((value) => value.startsWith(`--${name}=`));
  return match ? match.slice(name.length + 3) : fallback;
}

const from = Number(arg('from', 0));
const to = Number(arg('to', DURATION));
const outFile = path.resolve(ROOT, arg('out', 'out/manveon-reel.mp4'));
const audioFile = arg('audio', null);
const fps = Number(arg('fps', FPS));

if (!(to > from)) {
  console.error('Invalid frame range.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
registerReelFonts();
await loadReelLogo();

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const startFrame = Math.round(from * fps);
const endFrame = Math.round(to * fps);
const totalFrames = endFrame - startFrame;

const ffmpegArgs = [
  '-y',
  '-loglevel', 'error',
  '-f', 'rawvideo',
  '-pix_fmt', 'bgra',
  '-s', `${W}x${H}`,
  '-r', String(fps),
  '-i', '-'
];
if (audioFile) {
  ffmpegArgs.push('-i', path.resolve(ROOT, audioFile));
}
ffmpegArgs.push(
  '-c:v', 'libx264',
  '-preset', 'veryfast',
  '-tune', 'animation',
  '-crf', '19',
  '-pix_fmt', 'yuv420p',
  '-profile:v', 'high',
  '-movflags', '+faststart'
);
if (audioFile) {
  ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest');
}
ffmpegArgs.push(outFile);

const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
let ffmpegError = null;
ffmpeg.on('error', (error) => {
  ffmpegError = error;
});
const exitPromise = new Promise((resolve) => {
  ffmpeg.on('close', (code) => resolve(code));
});

const started = Date.now();
for (let frame = 0; frame < totalFrames; frame += 1) {
  const time = (startFrame + frame) / fps;
  renderFrame(ctx, time);
  const buffer = canvas.toBuffer('raw');
  if (!ffmpeg.stdin.write(buffer)) {
    await once(ffmpeg.stdin, 'drain');
  }
  if (frame % 60 === 0 && frame > 0) {
    const elapsed = (Date.now() - started) / 1000;
    const rate = frame / elapsed;
    const remaining = (totalFrames - frame) / rate;
    process.stdout.write(
      `  ${Math.round((frame / totalFrames) * 100)}% · ${rate.toFixed(1)} fps · ~${Math.round(remaining)}s left\n`
    );
  }
}
ffmpeg.stdin.end();

const code = await exitPromise;
if (ffmpegError) throw ffmpegError;
if (code !== 0) {
  console.error(`ffmpeg exited with code ${code}`);
  process.exit(1);
}

const size = fs.statSync(outFile).size;
console.log(
  `${path.relative(ROOT, outFile)} · ${totalFrames} frames · ${(size / 1024 / 1024).toFixed(1)} MB · ${(
    (Date.now() - started) / 1000
  ).toFixed(1)}s`
);
