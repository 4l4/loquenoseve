import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const root = new URL('..', import.meta.url).pathname;
export const tweego = join(root, '.tools', 'tweego', process.platform === 'win32' ? 'tweego.exe' : 'tweego');

if (!existsSync(tweego)) {
  console.error('Tweego not found. Run: npm run setup');
  process.exit(1);
}
// Tweego looks up story formats relative to its own directory; make it explicit.
process.env.TWEEGO_PATH = join(root, '.tools', 'tweego', 'storyformats');
