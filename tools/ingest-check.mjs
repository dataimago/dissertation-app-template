#!/usr/bin/env node
// Ingestion completeness: every file under raw/ is (a) cited by a wiki page's
// `sources:` frontmatter, (b) listed in raw/MANIFEST.md, or (c) matched by
// raw/.ingestignore. Anything else is un-ingested. Exit 1 if any, so the
// template's CI (and the author) can see it. Reads names only, never contents.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rawDir = path.join(root, 'raw');
if (!fs.existsSync(rawDir)) { console.log('ingest-check: no raw/ — nothing to check'); process.exit(0); }

function globToRe(g) {
  let re = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') { if (g[i + 1] === '*') { re += '.*'; i++; if (g[i + 1] === '/') i++; } else re += '[^/]*'; }
    else if (c === '?') re += '[^/]';
    else if ('.+^$()[]{}|\\'.includes(c)) re += '\\' + c;
    else re += c;
  }
  return new RegExp('^' + re + '$');
}
const ignore = fs.existsSync(path.join(rawDir, '.ingestignore'))
  ? fs.readFileSync(path.join(rawDir, '.ingestignore'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(globToRe)
  : [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rawFiles = walk(rawDir).map(f => path.relative(rawDir, f).split(path.sep).join('/'));

const cited = new Set();
const wikiDir = path.join(root, 'wiki');
if (fs.existsSync(wikiDir)) {
  for (const f of walk(wikiDir).filter(f => /\.(md|qmd)$/.test(f))) {
    const txt = fs.readFileSync(f, 'utf8');
    const m = txt.match(/^---\n([\s\S]*?)\n---/);
    if (!m) continue;
    const fm = m[1];
    const s = fm.match(/^sources:\s*\n((?:\s+-\s+.*\n?)+)/m) || fm.match(/^sources:\s*\[(.*)\]/m);
    if (!s) continue;
    const items = s[1].includes('\n') ? s[1].split('\n').map(l => l.replace(/^\s*-\s*/, '').trim()) : s[1].split(',').map(x => x.trim());
    for (const it of items) { const v = it.replace(/^["']|["']$/g, ''); if (v.startsWith('raw/')) cited.add(v.slice(4)); }
  }
}
const manifest = fs.existsSync(path.join(rawDir, 'MANIFEST.md')) ? fs.readFileSync(path.join(rawDir, 'MANIFEST.md'), 'utf8') : '';
const listed = (rel) => manifest.includes(rel) || manifest.includes(path.basename(rel));

const missing = rawFiles.filter(rel => !ignore.some(re => re.test(rel)) && !cited.has(rel) && !listed(rel));
const total = rawFiles.filter(rel => !ignore.some(re => re.test(rel))).length;
console.log(`ingest-check: ${total - missing.length}/${total} raw/ files ingested (cited by a wiki page or listed in MANIFEST.md)`);
if (missing.length) { console.log('un-ingested:'); for (const m of missing) console.log('  raw/' + m); process.exit(1); }
