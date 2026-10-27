// Browser preview: a real-time player over the same deterministic renderer that
// produces the MP4. Space toggles playback, arrows seek.
import { renderFrame, W, H, DURATION, FPS } from './reel.js';
import { SCENES, sceneAt } from './timeline.js';
import { renderScore } from './audio/score.js';
import { setManveonLogo } from './brand.js';

const canvas = document.getElementById('reel');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const playButton = document.getElementById('play');
const restartButton = document.getElementById('restart');
const muteButton = document.getElementById('mute');
const scrub = document.getElementById('scrub');
const currentLabel = document.getElementById('current');
const totalLabel = document.getElementById('total');
const status = document.getElementById('status');
const loading = document.getElementById('loading');
const download = document.getElementById('download');
const chapterList = document.getElementById('chapter-list');

let time = 0;
let playing = false;
let audioContext = null;
let audioBuffer = null;
let source = null;
let gain = null;
let startedAt = 0;
let muted = false;
let lastDraw = -1;
let scrubbing = false;

scrub.max = String(DURATION);
totalLabel.textContent = format(DURATION);

// ---- Chapters ------------------------------------------------------------

const chapterButtons = SCENES.map((scene) => {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<span class="num">${String(scene.id).padStart(2, '0')}</span><span class="title">${scene.title}</span><span class="when">${format(scene.start)}</span>`;
  button.addEventListener('click', () => seek(scene.start));
  li.appendChild(button);
  chapterList.appendChild(li);
  return button;
});

// ---- Playback ------------------------------------------------------------

function format(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

function update() {
  const frame = Math.round(time * FPS);
  if (frame !== lastDraw) {
    renderFrame(ctx, time);
    lastDraw = frame;
  }
  if (!scrubbing) scrub.value = String(time);
  currentLabel.textContent = format(time);
  const active = sceneAt(Math.min(time, DURATION - 0.001));
  chapterButtons.forEach((button, index) => {
    button.classList.toggle('active', SCENES[index].key === active.key);
  });
}

function clockNow() {
  if (audioBuffer && audioContext && audioContext.state === 'running') return audioContext.currentTime;
  return performance.now() / 1000;
}

function tick() {
  if (playing) {
    time = clockNow() - startedAt;
    if (time >= DURATION) {
      time = DURATION;
      pause();
    }
  }
  if (!scrubbing) update();
  requestAnimationFrame(tick);
}

function stopSource() {
  if (!source) return;
  try {
    source.stop();
  } catch {
    /* already stopped */
  }
  source.disconnect();
  source = null;
}

function ensureSource(offset) {
  stopSource();
  if (!audioBuffer) return;
  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(gain);
  source.start(0, Math.min(offset, DURATION - 0.01));
}

function startClock(offset) {
  startedAt = clockNow() - offset;
}

async function play() {
  if (time >= DURATION - 0.01) time = 0;
  if (audioContext && audioContext.state === 'suspended') await audioContext.resume();
  if (audioBuffer) ensureSource(time);
  startClock(time);
  playing = true;
  playButton.textContent = 'Pause';
  status.textContent = audioBuffer ? 'Playing · sound on' : 'Playing · picture only (audio unavailable)';
}

function pause() {
  playing = false;
  stopSource();
  playButton.textContent = 'Play';
  status.textContent = 'Paused';
  update();
}

function seek(value) {
  time = Math.max(0, Math.min(DURATION, value));
  lastDraw = -1;
  if (playing) {
    if (audioBuffer) ensureSource(time);
    startClock(time);
  }
  update();
}

function toggle() {
  if (playing) pause();
  else play();
}

playButton.addEventListener('click', toggle);
restartButton.addEventListener('click', () => {
  seek(0);
  if (!playing) play();
});
muteButton.addEventListener('click', () => {
  muted = !muted;
  muteButton.setAttribute('aria-pressed', String(muted));
  muteButton.textContent = muted ? 'Sound off' : 'Sound on';
  if (gain) gain.gain.value = muted ? 0 : 1;
});
scrub.addEventListener('input', () => {
  scrubbing = true;
  time = Number(scrub.value);
  lastDraw = -1;
  update();
});
scrub.addEventListener('change', () => {
  scrubbing = false;
  seek(Number(scrub.value));
});
window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.code === 'Space') {
    event.preventDefault();
    toggle();
  }
  if (event.code === 'ArrowRight') seek(time + 1);
  if (event.code === 'ArrowLeft') seek(time - 1);
  if (event.code === 'Home') seek(0);
});

// ---- Boot ----------------------------------------------------------------

function loadOptionalLogo() {
  const image = new Image();
  image.onload = () => {
    setManveonLogo(image);
    lastDraw = -1;
  };
  image.src = 'assets/logo/manveon-logo.png';
}

async function boot() {
  loadOptionalLogo();
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  update();
  loading.classList.add('hidden');

  if (fetch) {
    fetch('out/manveon-reel.mp4', { method: 'HEAD' })
      .then((response) => {
        if (response.ok) download.hidden = false;
      })
      .catch(() => {});
  }

  // Render the score off the critical path so the first frame can paint.
  await new Promise((resolve) => setTimeout(resolve, 80));
  try {
    const score = renderScore({ sampleRate: 44100 });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioBuffer = audioContext.createBuffer(2, score.left.length, score.sampleRate);
    audioBuffer.copyToChannel(score.left, 0);
    audioBuffer.copyToChannel(score.right, 1);
    gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    playButton.disabled = false;
    status.textContent = 'Ready · press play';
  } catch (error) {
    console.error(error);
    status.textContent = 'Audio unavailable — press play for a silent preview';
    playButton.disabled = false;
  }
}

tick();
boot();
