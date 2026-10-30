// Publishes dist/ to the gh-pages branch of origin (GitHub Pages). Run after `npm run build`.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run: npm run build');
  process.exit(1);
}

const run = (args, opts = {}) => {
  const res = spawnSync('git', args, { cwd: root, encoding: 'utf8', ...opts });
  if (res.status !== 0) {
    console.error(res.stderr || res.stdout);
    process.exit(res.status ?? 1);
  }
  return res.stdout.trim();
};

const remote = run(['remote', 'get-url', 'origin']);
const source = run(['rev-parse', '--short', 'HEAD']);
writeFileSync(join(dist, '.nojekyll'), '');

// Separate throwaway repository whose work tree is dist/: the main repo is untouched.
const gitDir = mkdtempSync(join(tmpdir(), 'loquenoseve-pages-'));
const git = args => run([`--git-dir=${gitDir}`, `--work-tree=${dist}`, ...args]);
try {
  git(['init', '-q', '-b', 'gh-pages']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', `Deploy ${source}`]);
  git(['push', '-f', remote, 'gh-pages']);
  console.log(`✓ deployed ${source} → ${remote} (gh-pages)`);
} finally {
  rmSync(gitDir, { recursive: true, force: true });
}
