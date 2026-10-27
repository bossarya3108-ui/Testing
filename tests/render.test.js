import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from 'canvas';
import { registerReelFonts } from '../scripts/fonts.js';
import { renderFrame, W, H } from '../src/reel.js';
import { SCENES, CAPTIONS, DURATION } from '../src/timeline.js';

registerReelFonts();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

function frameStats(time) {
  renderFrame(ctx, time);
  const image = ctx.getImageData(0, 0, W, H).data;
  let lit = 0;
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  for (let i = 0; i < image.length; i += 64) {
    const luma = 0.2126 * image[i] + 0.7152 * image[i + 1] + 0.0722 * image[i + 2];
    if (luma > 18) lit += 1;
    sum += luma;
    sumSq += luma * luma;
    count += 1;
  }
  return {
    litRatio: lit / count,
    mean: sum / count,
    deviation: Math.sqrt(sumSq / count - (sum / count) ** 2)
  };
}

function brightPixels(time, fromY, toY) {
  renderFrame(ctx, time);
  const image = ctx.getImageData(0, fromY, W, toY - fromY).data;
  let bright = 0;
  for (let i = 0; i < image.length; i += 4) {
    if (image[i] > 232 && image[i + 1] > 232 && image[i + 2] > 232) bright += 1;
  }
  return bright;
}

test('every scene renders a rich, non-blank frame', () => {
  for (const scene of SCENES) {
    const time = Math.min(DURATION - 0.05, (scene.start + scene.end) / 2);
    const stats = frameStats(time);
    assert.ok(stats.mean > 6, `scene ${scene.id} is nearly black (mean ${stats.mean.toFixed(1)})`);
    assert.ok(stats.litRatio > 0.1, `scene ${scene.id} has too few lit pixels`);
    assert.ok(stats.deviation > 4, `scene ${scene.id} looks flat (deviation ${stats.deviation.toFixed(1)})`);
  }
});

test('captions render as white type in the expected band', () => {
  const bottom = CAPTIONS.find((caption) => caption.scene === 1);
  renderFrame(ctx, (bottom.from + bottom.to) / 2);
  assert.ok(brightPixels((bottom.from + bottom.to) / 2, 1580, 1880) > 400, 'bottom caption missing');

  const top = CAPTIONS.find((caption) => caption.scene === 4);
  const mid = (top.from + top.to) / 2;
  assert.ok(brightPixels(mid, 60, 300) > 400, 'top caption missing');
});

test('rendering is deterministic for a given time', () => {
  const first = createCanvas(W, H);
  const second = createCanvas(W, H);
  const a = first.getContext('2d');
  const b = second.getContext('2d');
  renderFrame(a, 33.3);
  renderFrame(b, 33.3);
  const left = first.toBuffer('raw');
  const right = second.toBuffer('raw');
  assert.ok(left.equals(right), 'two renders of the same frame differ');
});

test('the full reel can be rendered inside its duration', () => {
  for (let time = 0; time < DURATION; time += 1) {
    assert.doesNotThrow(() => renderFrame(ctx, time), `render failed at ${time}s`);
  }
});
