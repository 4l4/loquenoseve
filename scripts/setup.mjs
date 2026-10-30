// Downloads Tweego and the pinned SugarCube story format into .tools/
import { mkdirSync, existsSync, chmodSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AdmZip from 'adm-zip';

const TWEEGO = '2.1.1';
const SUGARCUBE = '2.37.3';
const root = new URL('..', import.meta.url).pathname;
const tools = join(root, '.tools');

const platform = { linux: 'linux', darwin: 'macos', win32: 'windows' }[process.platform];
if (!platform) throw new Error(`Unsupported platform: ${process.platform}`);
const arch = process.arch === 'ia32' ? 'x86' : 'x64';

async function fetchZip(url) {
  console.log(`↓ ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return new AdmZip(Buffer.from(await res.arrayBuffer()));
}

mkdirSync(tools, { recursive: true });

const tweegoDir = join(tools, 'tweego');
rmSync(tweegoDir, { recursive: true, force: true });
(await fetchZip(`https://github.com/tmedwards/tweego/releases/download/v${TWEEGO}/tweego-${TWEEGO}-${platform}-${arch}.zip`))
  .extractAllTo(tweegoDir, true);
const bin = join(tweegoDir, platform === 'windows' ? 'tweego.exe' : 'tweego');
if (!existsSync(bin)) throw new Error(`tweego binary not found in ${tweegoDir}`);
chmodSync(bin, 0o755);

// Replace the SugarCube bundled with Tweego by the pinned release.
const formats = join(tweegoDir, 'storyformats');
rmSync(join(formats, 'sugarcube-2'), { recursive: true, force: true });
(await fetchZip(`https://github.com/tmedwards/sugarcube-2/releases/download/v${SUGARCUBE}/sugarcube-${SUGARCUBE}-for-twine-2.1-local.zip`))
  .extractAllTo(formats, true);

writeFileSync(join(tools, 'versions.json'), JSON.stringify({ tweego: TWEEGO, sugarcube: SUGARCUBE }, null, 2));
console.log(`✓ Tweego ${TWEEGO} + SugarCube ${SUGARCUBE} installed in .tools/`);
