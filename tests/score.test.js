import test from 'node:test';
import assert from 'node:assert/strict';
import { renderScore, encodeWav } from '../src/audio/score.js';
import { DURATION } from '../src/timeline.js';

const score = renderScore({ sampleRate: 22050 });

function rmsDb(left, right, from, to) {
  const start = Math.floor(from * score.sampleRate);
  const end = Math.min(left.length, Math.floor(to * score.sampleRate));
  let sum = 0;
  for (let i = start; i < end; i += 1) {
    const value = (left[i] + right[i]) / 2;
    sum += value * value;
  }
  return 10 * Math.log10(sum / Math.max(1, end - start) || 1e-12);
}

test('score length matches the picture', () => {
  assert.ok(Math.abs(score.duration - DURATION) < 0.01, `duration ${score.duration}`);
});

test('score is finite, stereo and loud enough without clipping', () => {
  assert.equal(score.left.length, score.right.length);
  let peak = 0;
  let difference = 0;
  for (let i = 0; i < score.left.length; i += 997) {
    const left = score.left[i];
    const right = score.right[i];
    assert.ok(Number.isFinite(left) && Number.isFinite(right), 'non-finite sample');
    peak = Math.max(peak, Math.abs(left), Math.abs(right));
    difference += Math.abs(left - right);
  }
  assert.ok(peak > 0.4 && peak <= 0.99, `peak ${peak}`);
  assert.ok(difference > 1, 'channels are identical — expected stereo width');
  const overall = rmsDb(score.left, score.right, 0, DURATION);
  assert.ok(overall > -24 && overall < -8, `overall RMS ${overall.toFixed(1)} dB`);
});

test('the drop is louder than the main groove and the intro is quieter', () => {
  const intro = rmsDb(score.left, score.right, 0, 4);
  const main = rmsDb(score.left, score.right, 18, 34);
  const drop = rmsDb(score.left, score.right, 48, 52);
  assert.ok(intro < main - 4, `intro ${intro.toFixed(1)} vs main ${main.toFixed(1)}`);
  assert.ok(drop > main + 1.2, `drop ${drop.toFixed(1)} vs main ${main.toFixed(1)}`);
});

test('the outro keeps a musical tail for the logo hold', () => {
  const tail = rmsDb(score.left, score.right, 54, 57);
  assert.ok(tail > -32, `outro RMS ${tail.toFixed(1)} dB`);
  const veryEnd = rmsDb(score.left, score.right, 57.6, 58);
  assert.ok(veryEnd < -20, 'the last frames should fade out');
});

test('WAV export has a valid header and the expected size', () => {
  const wav = encodeWav(score);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 2);
  assert.equal(wav.readUInt32LE(24), score.sampleRate);
  assert.equal(wav.length, 44 + score.left.length * 4);
});
