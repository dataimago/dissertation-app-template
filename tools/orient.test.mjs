// Run: npm test. The orientation hook (.claude/hooks/orient.sh) names the
// book's home by the same rule as src/lib/manuscript-home.ts, reading the field
// name from that file (HOME_FIELD) and the old-spec message from
// src/copy/predates-beta.txt, so a rename is one edit. Each case runs the hook on
// a throwaway copy in the system temp folder; nothing touches the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOME_FIELD } from '../src/lib/manuscript-home.ts';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const MESSAGE = readFileSync(join(REPO, 'src', 'copy', 'predates-beta.txt'), 'utf8').trim();

/** Run the hook in a fresh repo with the given spec, folders and files. */
function orient(spec, { dirs = [], files = [], locked = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'orient-'));
  try {
    for (const f of ['.claude/hooks/orient.sh', 'src/lib/manuscript-home.ts', 'src/copy/predates-beta.txt']) {
      mkdirSync(dirname(join(root, f)), { recursive: true });
      cpSync(join(REPO, f), join(root, f));
    }
    if (locked) {
      mkdirSync(join(root, 'raw', 'manuscript'), { recursive: true });
      writeFileSync(join(root, 'raw', 'manuscript', 'LOCKED.md'), 'locked\n');
    }
    writeFileSync(join(root, 'dataimago-spec.yaml'), spec);
    for (const d of dirs) mkdirSync(join(root, d), { recursive: true });
    for (const f of files) {
      mkdirSync(dirname(join(root, f)), { recursive: true });
      writeFileSync(join(root, f), '');
    }
    return execFileSync('bash', [join(root, '.claude', 'hooks', 'orient.sh')], { encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** A spec as the hub writes it (js-yaml block style). `home` is the field's lines, or null. */
function spec({ kind, rPackage = false, quartoRoot = false, referenced = false, home }) {
  const lines = ['apiVersion: dataimago.ai/v1alpha1', 'metadata:', '  name: jane-dissertation', 'source:', `  case: ${kind}`];
  if (rPackage) {
    lines.push('  rPackage:', '    name: janepkg', '    submoduleUrl: https://github.com/jane/janepkg', '    submodulePath: packages/r-packages/janepkg');
    if (quartoRoot) lines.push('    quartoRoot: ui/www');
  } else lines.push('  rPackage: null');
  lines.push(referenced ? '  referencedRepo:\n    url: https://github.com/jane/diss' : '  referencedRepo: null');
  if (home) lines.push(`  ${HOME_FIELD}:`, ...home.map((l) => `    ${l}`));
  // The same words elsewhere in the spec must not count.
  lines.push('vertical:', '  dissertation:', '    thesis:', '      manuscript:', '        status: locked-v1', `      ${HOME_FIELD}:`, '        repo: package');
  return `${lines.join('\n')}\n`;
}

const lineOf = (out, marker) => out.split('\n').find((l) => l.includes(marker)) ?? '';

test('the app repository: the book is thesis/, and its chapters are named', () => {
  const out = orient(spec({ kind: 'no-r', home: ['repo: app', 'path: thesis'] }), { dirs: ['thesis/chapters'] });
  assert.match(lineOf(out, '## Book'), /thesis\/$/);
  assert.match(lineOf(out, 'derivative chapters'), /derivative chapters: thesis\/chapters$/);
  assert.ok(!out.includes(MESSAGE));
});

test('a new R package: the package book, even with a stray thesis/chapters', () => {
  const out = orient(spec({ kind: 'retrofit', rPackage: true, home: ['repo: package', 'path: ui/www'] }), {
    dirs: ['thesis/chapters', 'packages/r-packages/janepkg/ui/www/chapters'],
  });
  assert.match(lineOf(out, '## Book'), /packages\/r-packages\/janepkg\/ui\/www\/$/);
  assert.match(lineOf(out, 'derivative chapters'), /packages\/r-packages\/janepkg\/ui\/www\/chapters$/);
});

test('an existing package linked: thesis/ here, never the package', () => {
  const out = orient(spec({ kind: 'extension', rPackage: true, home: ['repo: app', 'path: thesis'] }), {
    dirs: ['packages/r-packages/janepkg/ui/www/chapters'],
  });
  assert.match(lineOf(out, '## Book'), /thesis\/$/);
  assert.match(lineOf(out, 'derivative chapters'), /not yet created.*\/import-manuscript/);
});

test('a referenced whole-dissertation repository: as today', () => {
  const out = orient(spec({ kind: 'extension', referenced: true, home: ['repo: referenced'] }), { dirs: ['thesis/chapters'] });
  assert.match(lineOf(out, '## Book'), /referenced repository/);
  assert.match(lineOf(out, 'derivative chapters'), /thesis\/chapters$/);
});

test('a spec from before the beta: the one plain message, and no folder named', () => {
  for (const s of [
    spec({ kind: 'no-r' }),
    spec({ kind: 'extension', rPackage: true }),
    spec({ kind: 'retrofit', rPackage: true, quartoRoot: true, home: ['repo: package'] }),
    spec({ kind: 'extension', referenced: true, home: ['repo: app', 'path: thesis'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: /thesis'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: ../thesis'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: \\thesis'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: a\\..\\b'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: the\tsis'] }),
    spec({ kind: 'no-r', home: ['repo: app', 'path: the\u2028sis'] }),
  ]) {
    const out = orient(s, { dirs: ['thesis/chapters'] });
    assert.ok(out.includes(MESSAGE), out);
    assert.equal(lineOf(out, 'derivative chapters'), '');
    assert.doesNotMatch(lineOf(out, '## Book'), /thesis\//);
  }
});

test('a value in the spec is read as text, never run', () => {
  const out = orient(spec({ kind: 'no-r', home: ['repo: app', 'path: $(echo RAN-IT)'] }));
  assert.doesNotMatch(out, /RAN-IT(?!\))/);
  assert.match(lineOf(out, '## Book'), /\$\(echo RAN-IT\)\/$/);
});

// Grok on #37: a YAML comment inside `source`, at any indent, is not a key.
test('comments inside the source block do not hide the field', () => {
  const s = spec({ kind: 'no-r', home: ['repo: app', 'path: thesis'] }).replace(
    `  ${HOME_FIELD}:\n    repo: app`,
    `  # where the book lives\n  ${HOME_FIELD}:\n  # the repository\n    repo: app\n    # its folder`,
  );
  assert.ok(s.includes('# the repository'));
  assert.match(lineOf(orient(s), '## Book'), /thesis\/$/);
});

// Round 2 on #37: the hook reads a value as YAML does, so it names the same
// folder manuscriptHome returns (js-yaml): an apostrophe is kept, one pair of
// surrounding quotes is removed, and ' #' inside quotes is not a comment.
import { load } from 'js-yaml';
import { manuscriptHome } from '../src/lib/manuscript-home.ts';

for (const raw of [`author's-book`, `"my #1 book"`, `'it''s mine'`, `"quoted" # a comment`, `plain # a comment`]) {
  test(`a path written ${raw} names the folder manuscriptHome names`, () => {
    const s = spec({ kind: 'no-r', home: ['repo: app', `path: ${raw}`] });
    const expected = manuscriptHome(load(s).source);
    assert.equal(expected.status, 'ok');
    assert.equal(lineOf(orient(s), '## Book'), `## Book: ${expected.bookFolder}/`);
  });
}
