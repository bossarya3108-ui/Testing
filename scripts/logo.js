// Loads the official Manveon logo when it is present in assets/logo/.
//
// The brief asks for the supplied logo to be used exactly as provided. No logo
// file was included with this repository, so the renderer falls back to a plain
// typographic wordmark (see src/brand.js). Drop the official transparent PNG at
// assets/logo/manveon-logo.png and every render — preview, stills, MP4 — will
// use it unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadImage } from 'canvas';
import { setManveonLogo } from '../src/brand.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LOGO_PATH = path.join(ROOT, 'assets/logo/manveon-logo.png');

export async function loadReelLogo() {
  if (!fs.existsSync(LOGO_PATH)) return null;
  const image = await loadImage(LOGO_PATH);
  setManveonLogo(image);
  return image;
}
