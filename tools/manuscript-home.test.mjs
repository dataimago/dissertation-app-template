// Run: npm test (node --test; Node 23.6+ runs the TypeScript module directly).
// Where the author writes the dissertation: one rule, read from one field of
// dataimago-spec.yaml's `source` (its name is HOME_FIELD, defined in one place).
// The maintainer's decision, 2026-11-25: the hub writes the book only where it
// created the repository, and a repository from before the beta is not
// supported: it gets one plain message, never a guess.
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

test('the app repository (no R package, or an existing package linked): thesis/ here', () => {
  for (const s of [
    source({ case: 'no-r', ...home({ repo: 'app', path: 'thesis' }) }),
    source({ case: 'extension', rPackage: pkg, ...home({ repo: 'app', path: 'thesis' }) }),
  ]) {
    assert.deepEqual(manuscriptHome(s), {
      status: 'ok',
      inPackage: false,
      bookFolder: 'thesis',
      chapters: 'thesis/chapters',
    });
  }
});

test('a new R package the hub created: the package’s ui/www/', () => {
  assert.deepEqual(manuscriptHome(source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package', path: 'ui/www' }) })), {
    status: 'ok',
    inPackage: true,
    bookFolder: 'packages/r-packages/janepkg/ui/www',
    chapters: 'packages/r-packages/janepkg/ui/www/chapters',
  });
});

test('a referenced whole-dissertation repository: as today, its working chapters are thesis/ here', () => {
  assert.deepEqual(manuscriptHome(source({ referencedRepo: REFERENCED, ...home({ repo: 'referenced' }) })), {
    status: 'referenced',
    inPackage: false,
    bookFolder: 'thesis',
    chapters: 'thesis/chapters',
  });
});

test('path is any relative string, with the defaults when it is left out', () => {
  assert.equal(manuscriptHome(source({ case: 'no-r', ...home({ repo: 'app', path: 'book' }) })).bookFolder, 'book');
  assert.equal(manuscriptHome(source({ case: 'no-r', ...home({ repo: 'app' }) })).bookFolder, 'thesis');
  assert.equal(
    manuscriptHome(source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package' }) })).bookFolder,
    'packages/r-packages/janepkg/ui/www',
  );
});

test('a spec from before the beta: the one plain message, never a guess', () => {
  for (const s of [
    // The field is required in every case.
    source({ case: 'no-r' }),
    source({ case: 'extension', rPackage: pkg }),
    source({ referencedRepo: REFERENCED }),
    // rPackage.quartoRoot is the old way of saying where the book is.
    source({ case: 'retrofit', rPackage: { ...pkg, quartoRoot: 'ui/www' } }),
    source({ case: 'retrofit', rPackage: { ...pkg, quartoRoot: 'ui/www' }, ...home({ repo: 'package' }) }),
    // A value the rule cannot read.
    source({ case: 'no-r', ...home({ repo: 'elsewhere' }) }),
    source({ case: 'no-r', ...home({ repo: 'package', path: 'ui/www' }) }),
    source({ case: 'no-r', ...home({ repo: 'referenced' }) }),
    // The two rules @dataimago/spec enforces (dataimago-ai#365): a referenced
    // repository must say repo: referenced, and path is relative with no '..'.
    source({ referencedRepo: REFERENCED, ...home({ repo: 'app', path: 'thesis' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: '/thesis' }) }),
    source({ case: 'no-r', ...home({ repo: 'app', path: '../thesis' }) }),
    source({ case: 'retrofit', rPackage: pkg, ...home({ repo: 'package', path: 'ui/../../www' }) }),
  ]) {
    assert.deepEqual(manuscriptHome(s), { status: 'predates-beta' }, JSON.stringify(s));
  }
});
