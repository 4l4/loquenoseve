// Static checks for src/**/*.tw: broken passage links, missing images, unknown characters,
// scene passages without an initial <<bg>>. Exit code 1 on errors.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { assetName } from './assets.mjs';

const root = new URL('..', import.meta.url).pathname;
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const files = walk(join(root, 'src'));
const assets = new Set(readdirSync(join(root, 'resources')).map(assetName));
const charsSrc = files.filter(f => f.endsWith('.js')).map(f => readFileSync(f, 'utf8')).join('\n');
const charIds = new Set([...charsSrc.matchAll(/^\s*(\w+)\s*:\s*\{\s*name:/gm)].map(m => m[1]));
const special = new Set(['StoryTitle', 'StoryData', 'StoryInit']);

const passages = [];
for (const file of files.filter(f => f.endsWith('.tw') || f.endsWith('.twee'))) {
  const parts = readFileSync(file, 'utf8').split(/^::\s*/m).slice(1);
  for (const part of parts) {
    const [header, ...body] = part.split('\n');
    const name = header.replace(/\s*(\[[^\]]*\])?\s*(\{.*\})?\s*$/, '').trim();
    const tags = (header.match(/\[([^\]]*)\]/)?.[1] ?? '').split(/\s+/).filter(Boolean);
    passages.push({ name, tags, text: body.join('\n'), file: relative(root, file) });
  }
}

const names = new Set(passages.map(p => p.name));
const errors = [];
const warnings = [];
const seen = new Set();

for (const p of passages) {
  const where = `${p.file} :: ${p.name}`;
  if (seen.has(p.name)) errors.push(`${where}: duplicate passage name`);
  seen.add(p.name);
  if (special.has(p.name) || p.tags.includes('widget')) continue;

  const targets = [];
  for (const [, inner] of p.text.matchAll(/\[\[(.+?)\]\]/g)) {
    const link = inner.split('][')[0];
    let t = link;
    if (link.includes('|')) t = link.split('|').pop();
    else if (link.includes('->')) t = link.split('->').pop();
    else if (link.includes('<-')) t = link.split('<-')[0];
    targets.push(t.trim());
  }
  for (const [, t] of p.text.matchAll(/<<(?:nextscene|goto|link\s+"[^"]*")\s+["']([^"']+)["']/g)) targets.push(t);
  for (const [, t] of p.text.matchAll(/data-passage="([^"]+)"/g)) targets.push(t);
  for (const t of targets) if (!names.has(t)) errors.push(`${where}: link to missing passage "${t}"`);

  for (const [, kind, name] of p.text.matchAll(/<<(bg|fx)\s+["']([^"']+)["']/g)) {
    if (!assets.has(name)) errors.push(`${where}: <<${kind}>> image "${name}" not found in resources/`);
  }
  for (const [, id] of p.text.matchAll(/<<(?:char|say)\s+["']([^"']+)["']/g)) {
    if (!charIds.has(id) && !assets.has(id)) errors.push(`${where}: unknown character "${id}" (add it to src/story/characters.js)`);
  }
  if (!/^\s*<<bg\s/.test(p.text)) warnings.push(`${where}: passage does not start with <<bg>> (background may be wrong after loading a save)`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
console.log(`${passages.length} passages, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
