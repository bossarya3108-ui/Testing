/* ============================================================
   main.js — scene dispatcher, transitions, play mode
   ============================================================ */
'use strict';

/* transition flash at a cut time tc: soft luminous bloom + elliptical streak */
function cutFlash(t, tc, hue) {
  const a = Math.max(win(t, tc - 0.12, tc, tc + 0.001, tc + 0.18), 0);
  if (a <= 0) return;
  ctx.save();
  const g = ctx.createRadialGradient(540, 960, 40, 540, 960, 1300);
  g.addColorStop(0, `rgba(${hue},0.30)`);
  g.addColorStop(1, `rgba(${hue},0)`);
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // soft diagonal light streak traveling across the frame
  const sp = seg(t, tc - 0.12, tc + 0.16);
  ctx.translate(lerp(60, W - 60, sp), 960);
  ctx.rotate(0.25);
  ctx.scale(1, 4);
  const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 160);
  sg.addColorStop(0, `rgba(${hue},0.35)`);
  sg.addColorStop(1, `rgba(${hue},0)`);
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

const SCENES = [
  { t0: 0,  t1: 4,  draw: scene1 },
  { t0: 4,  t1: 8,  draw: scene2 },
  { t0: 8,  t1: 14, draw: scene3 },
  { t0: 14, t1: 21, draw: scene4 },
  { t0: 21, t1: 26, draw: scene5 },
  { t0: 26, t1: 30, draw: scene6 },
];

function render(t) {
  t = clamp(t, 0, 30);
  const sc = SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];
  ctx.save();
  sc.draw(t);
  ctx.restore();
  // transition flashes at scene cuts
  cutFlash(t, 4,  '120,180,255');
  cutFlash(t, 8,  '160,220,255');
  cutFlash(t, 14, '120,180,255');
  cutFlash(t, 21, '150,210,255');
  cutFlash(t, 26, '200,235,255');
}

/* deterministic seek — used by the frame renderer */
window.__seek = function (t) { render(t); };

/* real-time playback — used for QA recording */
window.__play = function () {
  const start = performance.now();
  function frame(now) {
    render((now - start) / 1000);
    if ((now - start) / 1000 < 30.4) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};

render(0);
