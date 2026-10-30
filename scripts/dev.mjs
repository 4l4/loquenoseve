// Watches src/ with Tweego and serves dist/ on http://localhost:8080 (PORT to override).
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { tweego, root } from './tweego.mjs';

const port = Number(process.env.PORT) || 8080;
const dist = join(root, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.css': 'text/css', '.js': 'text/javascript' };

spawn(tweego, ['-w', '-o', 'dist/index.html', 'src'], { cwd: root, stdio: 'inherit', env: process.env });

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if (path.startsWith('..')) return res.writeHead(403).end();
  const file = path && path !== '.' ? path : 'index.html';
  try {
    const body = await readFile(join(dist, file));
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, () => console.log(`▶ http://localhost:${port}  (Tweego watching src/, reload the page after edits)`));
