// Frame compositor. `renderFrame(ctx, time)` is a pure function of time, so the
// browser preview and the offline MP4 export produce identical images.
import { W, H, FPS } from './theme.js';
import { SCENES, DURATION, sceneAt } from './timeline.js';
import { drawCaptions } from './captions.js';

import { draw as beginning } from './scenes/01-beginning.js';
import { draw as discovery } from './scenes/02-discovery.js';
import { draw as build } from './scenes/03-build.js';
import { draw as explore } from './scenes/04-explore.js';
import { draw as booking } from './scenes/05-booking.js';
import { draw as smarter } from './scenes/06-smarter.js';
import { draw as owner } from './scenes/07-owner.js';
import { draw as ecosystem } from './scenes/08-ecosystem.js';
import { draw as reveal } from './scenes/09-reveal.js';

const DRAWERS = [beginning, discovery, build, explore, booking, smarter, owner, ecosystem, reveal];
// Per-boundary transitions. Scenes that cut inside the same app use a hard cut
// (or a very short dissolve) so two mobile UIs never ghost over each other.
const FADE = {
  discovery: 0.3,
  build: 0.4,
  explore: 0.0,
  booking: 0.18,
  smarter: 0.0,
  owner: 0.35,
  ecosystem: 0.4,
  reveal: 0.3
};

function previousScene(scene) {
  const index = SCENES.findIndex((entry) => entry.key === scene.key);
  return index > 0 ? SCENES[index - 1] : null;
}

export function renderFrame(ctx, time) {
  const t = Math.min(DURATION - 1 / FPS, Math.max(0, time));
  const scene = sceneAt(t);
  const previous = previousScene(scene);
  const fade = FADE[scene.key] ?? 0.3;
  const fadeP = previous && fade > 0 ? Math.min(1, Math.max(0, (t - scene.start) / fade)) : 1;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (previous && fadeP < 1) {
    DRAWERS[SCENES.indexOf(previous)](ctx, t);
    ctx.save();
    ctx.globalAlpha = fadeP;
    DRAWERS[SCENES.indexOf(scene)](ctx, t);
    ctx.restore();
  } else {
    DRAWERS[SCENES.indexOf(scene)](ctx, t);
  }

  drawCaptions(ctx, t);
  ctx.restore();
}

export { W, H, DURATION, FPS };
