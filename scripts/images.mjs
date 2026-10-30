// Converts resources/*.png into web-sized WebP files in dist/img/.
// Asset naming rules: scripts/assets.mjs
import { readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { assetName } from './assets.mjs';

const root = new URL('..', import.meta.url).pathname;
const src = join(root, 'resources');
const out = join(root, 'dist', 'img');
mkdirSync(out, { recursive: true });

let converted = 0;
for (const file of readdirSync(src).filter(f => /\.(png|jpe?g|webp)$/i.test(f))) {
  const from = join(src, file);
  const to = join(out, `${assetName(file)}.webp`);
  if (existsSync(to) && statSync(to).mtimeMs >= statSync(from).mtimeMs) continue;
  // Backgrounds/overlays: fit into 1920x1080; character sprites: max 1200px tall.
  const resize = file.startsWith('character_')
    ? { height: 1200, withoutEnlargement: true }
    : { width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true };
  await sharp(from).resize(resize).webp({ quality: 82, alphaQuality: 90 }).toFile(to);
  converted++;
}
console.log(`✓ images: ${converted} converted, output in dist/img/`);
