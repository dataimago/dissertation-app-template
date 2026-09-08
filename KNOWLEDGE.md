# Knowledge Base Manual

How the AI maintains **your** research knowledge base — house style, scoped to
one author. Read at the start of knowledge-work sessions. The project's name,
your name, and your field are in `dataimago-spec.yaml`; this manual does not
repeat them.

## Layout

```
raw/          your sources — the AI reads, never edits
  inbox/        drop what you brought here; /ingest sorts it and empties it
  manuscript/   your finished dissertation, if you imported one (LOCKED.md = v1.0)
  code/         analysis code you brought that is not an R package
  research/     papers and materials your dissertation engages with
  advisor/      writings by your advisor and committee
  style/        exemplars whose voice or structure you want to emulate
  background/   style guides, course readings, methodological references
  thesis-formatting/  your institution's formatting guidelines
  data/         data files, listed and characterised — never opened beyond headers
  private/      anything with names, addresses, identifiers — gitignored, never read
  MANIFEST.md   what you brought, where it went, what was set aside and why
  inventory/    corpus-inventory.yaml — every claim /ingest made, with evidence
wiki/         the structured knowledge the AI maintains from raw/ — you own this
  index.md      catalog + status line
  log.md        what changed, newest first (appended, never replaced)
  overview.md   the project in one page
  glossary.md   your field's terms
  sources/      one page per source: claims, method, key quotes with page refs
  theories/  methods/  findings/  arguments/    the research domain's synthesis pages
  analyses/     synthesized themes, comparisons, open questions; ingest-report.md
  connections/  how ideas (or your app ↔ package) relate
thesis/       your chapters as .qmd (content-only layout; R-package layout: the package's ui/www/)
```

## Workflows

- **Ingest (`/ingest`)** — the first act after cloning, and any time `raw/`
  changes: classify what is in `raw/` (and `raw/inbox/`), write `raw/MANIFEST.md`
  and `raw/inventory/corpus-inventory.yaml`, write one `wiki/sources/` page per
  source, seed the synthesis pages, and end with `wiki/analyses/ingest-report.md`
  plus one work item per gap. Idempotent: re-run it whenever you add material.
- **Import manuscript (`/import-manuscript`)** — only if `raw/manuscript/LOCKED.md`
  exists: derive version 1.0 of your chapters as `.qmd` from your sources
  (`.tex`, `.Rnw`, `.docx`; PDF last). `raw/manuscript/` stays authoritative.
- **Query** — answer from `wiki/` with citations; offer to file the answer in
  `analyses/`.
- **Write** — ground each claim in a wiki page or source (read `writing/STYLE.md`
  first); flag unsupported claims rather than smoothing them over.
- **Lint** — orphan pages, broken `[[links]]`, pages with no `sources:`, `raw/`
  files no page cites (`npm run ingest:check`).

## Page contract

Every wiki page has YAML frontmatter:

```yaml
---
title: …
type: source | theory | method | finding | argument | analysis | connection | overview | glossary | log
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [raw/research/rubin-1976.pdf]     # raw/ paths this page rests on, or wiki pages
tags: [..]
curated: false                              # set true once you have edited it — /ingest then never overwrites it
generator: dissertation-app-template/ingest # on seeded pages only
---
```

and a `## Related pages` block of `[[page-name]]` links. One fact, one page;
kebab-case filenames; no orphans. `sources:` is what makes provenance
machine-checkable: a page without it is a guess.

## Rules

- You own `wiki/`; you never modify `raw/`. The one exception is `/ingest`'s
  first classification pass, which *moves* files out of `raw/inbox/` into their
  category — it never edits their contents.
- **Evidence or silence.** A claim you cannot cite to a `raw/` path (and, where
  it matters, a line or page) does not go in the wiki; open a gap instead.
- Never open `raw/private/` (the harness is denied from it) and never read a
  data file beyond its header row.
- If `raw/manuscript/LOCKED.md` exists it governs: the manuscript is authoritative
  v1.0 — cite it, summarize it, derive from it; never rewrite it.
- Never fabricate a citation or a result.
- Re-runs merge by default: `/ingest` never overwrites a page marked
  `curated: true` or a page with no `generator:` line; `/ingest --bootstrap`
  overwrites seeded pages too. This is a rule of this manual, not a field of
  your spec. `log.md` is only ever appended.

## Sovereignty

This knowledge base is yours. Nothing here is shared upstream without your
action. Keep restricted data out of `wiki/`: summarize structure, never
sensitive content. If `/ingest` moved anything into `raw/private/`, make this
repository private before you push.
