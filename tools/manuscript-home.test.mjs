// Run: npm test (node --test; Node 23.6+ runs the TypeScript module directly).
// Where the author writes the dissertation: one rule, read from one field of
// dataimago-spec.yaml's `source` (its name is HOME_FIELD, defined in one place).
// The maintainer's decision, 2026-11-25: the hub writes the book only where it
// created the repository; a repository from before the beta gets one plain
// message, never a guess. And, for the last round on #37: support only what is
// built. Nothing builds a book outside thesis/ here or ui/www/ in a new R
// package, so any other folder names no folder and gets a second plain message.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME_FIELD, manuscriptHome } from '../src/lib/manuscript-home.ts';

const pkg = {
  name: 'janepkg',
  submoduleUrl: 'https://github.com/jane/janepkg',
  submodulePath: 'packages/r-packages/janepkg',
};
const REFERENCED = { url: 'https://github.com/jane/diss' };
const source = (fields) => ({ case: 'extension', rPackage: null, referencedRepo: null, ...fields });
const home = (value) => ({ [HOME_FIELD]: value });
const UNSUPPORTED = { status: 'unsupported-folder' };
const PREDATES = { status: 'predates-beta' };

const THESIS = { inPackage: false, bookFolder: 'thesis', pathInRepo: 'thesis', chapters: 'thesis/chapters' };

test('the three homes that are built resolve', () => {
  // No R package, and an existing R package linked (never written in).
  for (const s of [
    source({ case: 'no-r', ...home({ repo: 'app', path: 'thesis' }) }),
    source({ case: 'extension', rPackage: pkg, ...home({ repo: 'app', path: 'thesis' }) }),
  ]) {
    assert.deepEqual(manuscriptHome(s), { status: 'ok', ...THESIS });
  }
  // A new R package the hub created: its ui/www/.
  assert.deepEqual(manuscriptHome(source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package', path: 'ui/www' }) })), {
    status: 'ok',
    inPackage: true,
    bookFolder: 'packages/r-packages/janepkg/ui/www',
    pathInRepo: 'ui/www',
    chapters: 'packages/r-packages/janepkg/ui/www/chapters',
  });
  // A referenced whole-dissertation repository, as today.
  assert.deepEqual(manuscriptHome(source({ referencedRepo: REFERENCED, ...home({ repo: 'referenced' }) })), {
    status: 'referenced',
    ...THESIS,
  });
});

test('a path left out is the default the schema fills in', () => {
  assert.equal(manuscriptHome(source({ case: 'no-r', ...home({ repo: 'app' }) })).bookFolder, 'thesis');
  assert.equal(
    manuscriptHome(source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package' }) })).bookFolder,
    'packages/r-packages/janepkg/ui/www',
  );
});

test('any other book folder names no folder, including a schema-valid one', () => {
  for (const s of [
    source({ case: 'no-r', ...home({ repo: 'app', path: 'book' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: 'thesis/' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: 'raw/private' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: '/thesis' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: '../thesis' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: 'the\tsis' }) }),
    // The two spellings the review named: compared as written, neither is a home.
    source({ case: 'no-r', ...home({ repo: 'app', path: "author's-book" }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: 'my #1 book' }) }),
    source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package', path: 'book' }) }),
    source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package', path: 'thesis' }) }),
    source({ referencedRepo: REFERENCED, ...home({ repo: 'referenced', path: 'thesis' }) }),
  ]) {
    assert.deepEqual(manuscriptHome(s), UNSUPPORTED, JSON.stringify(s));
  }
});

// Support only what is built: the hub always writes submodulePath as
// packages/r-packages/<package name>, so that is the only form accepted.
test('the package folder is only packages/r-packages/<name>, as the hub writes it', () => {
  const withPackage = (rPackage) =>
    source({ case: 'retrofit', rPackage, ...home({ repo: 'package', path: 'ui/www' }) });
  for (const submodulePath of [
    './raw/private',
    '././raw/private',
    'raw',
    'packages/r-packages/../../raw',
    '../raw/private',
    '/abs/pkg',
    'raw/janepkg',
    'vendor/janepkg',
    'packages/r-packages/',
    'packages/r-packages/.',
    'packages/r-packages/..',
    'packages/r-packages/a/b',
    'packages//r-packages/janepkg',
    'packages\\r-packages\\janepkg',
    'packages/r-packages/jane pkg',
    'packages/r-packages/pkg\u2028x',
  ]) {
    assert.deepEqual(manuscriptHome(withPackage({ ...pkg, submodulePath })), UNSUPPORTED, submodulePath);
  }
  // With no submodulePath the fallback packages/r-packages/<name> is checked too.
  const { submodulePath: _drop, ...noPath } = pkg;
  assert.deepEqual(manuscriptHome(withPackage({ ...noPath, name: '../../raw' })), UNSUPPORTED);
  assert.equal(manuscriptHome(withPackage(noPath)).bookFolder, 'packages/r-packages/janepkg/ui/www');
  // A name with the characters a package or repository name allows.
  assert.equal(
    manuscriptHome(withPackage({ ...pkg, submodulePath: 'packages/r-packages/data.table_2-x' })).bookFolder,
    'packages/r-packages/data.table_2-x/ui/www',
  );
});

test('a spec from before the beta, or one the rule cannot read: the predates-beta message', () => {
  for (const s of [
    // The field is required in every case.
    source({ case: 'no-r' }),
    source({ case: 'extension', rPackage: pkg }),
    source({ referencedRepo: REFERENCED }),
    // rPackage.quartoRoot is the old way of saying where the book is.
    source({ case: 'retrofit', rPackage: { ...pkg, quartoRoot: 'ui/www' } }),
    source({ case: 'retrofit', rPackage: { ...pkg, quartoRoot: 'ui/www' }, ...home({ repo: 'package' }) }),
    // A repo the rule cannot read, or one that does not fit the source.
    source({ case: 'no-r', ...home({ repo: 'elsewhere' }) }),
    source({ case: 'no-r', ...home({ repo: 'package', path: 'ui/www' }) }),
    source({ case: 'no-r', ...home({ repo: 'referenced' }) }),
    source({ referencedRepo: REFERENCED, ...home({ repo: 'app', path: 'thesis' }) }),
  ]) {
    assert.deepEqual(manuscriptHome(s), PREDATES, JSON.stringify(s));
  }
});
