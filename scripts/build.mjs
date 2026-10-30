// Compiles src/ into dist/index.html with Tweego.
import { spawnSync } from 'node:child_process';
import { tweego, root } from './tweego.mjs';

const res = spawnSync(tweego, ['-o', 'dist/index.html', 'src'], { cwd: root, stdio: 'inherit', env: process.env });
if (res.status !== 0) process.exit(res.status ?? 1);
console.log('✓ build: dist/index.html');
