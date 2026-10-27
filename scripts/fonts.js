// Registers the bundled OFL fonts with node-canvas so offline renders match the
// browser preview. The family aliases are identical to the @font-face names in
// styles.css.
import { registerFont } from 'canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FONT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/fonts');

const FONTS = [
  ['Barlow-Regular.ttf', 'Barlow'],
  ['Barlow-Medium.ttf', 'BarlowMedium'],
  ['Barlow-SemiBold.ttf', 'BarlowSemi'],
  ['Barlow-Bold.ttf', 'BarlowBold'],
  ['Barlow-Black.ttf', 'BarlowBlack'],
  ['Prata-Regular.ttf', 'Prata']
];

let registered = false;

export function registerReelFonts() {
  if (registered) return;
  for (const [file, family] of FONTS) {
    registerFont(path.join(FONT_DIR, file), { family });
  }
  registered = true;
}
