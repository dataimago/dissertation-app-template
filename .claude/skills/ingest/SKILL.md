---
name: ingest
description: The first act after cloning, and any time raw/ changes — classify everything the author brought (raw/ and raw/inbox/), keep private material out of git, write raw/MANIFEST.md and the corpus inventory, build wiki/ from all of it (one sources/ page per source, then the synthesis pages), refine the spec's prospective fields from an imported manuscript (never invent), and end with wiki/analyses/ingest-report.md plus one work item per gap. Idempotent. Use for "ingest", "seed the wiki", "I added files to raw/", or a fresh clone with an empty wiki.
---

# /ingest — from what the author brought to a knowledge base

One skill, three doors. Whether the author arrived with interview answers and
a few uploads, a folder of everything, or an R package, this is how `raw/`
becomes `wiki/`. Read `KNOWLEDGE.md` first; it is the contract this skill
executes. Read `dataimago-spec.yaml` second: `source.case`,
`source.rPackage`, `source.referencedRepo` and
`vertical.dissertation.thesis.manuscript.status` decide what the steps below
do. The re-run mode is **not** a spec field: it is the rule in
`KNOWLEDGE.md` (merge by default; `/ingest --bootstrap` to overwrite seeded
pages). An R-package repo whose spec carries `vertical.rpkg.knowledge.wikiMode`
is honoured; a dissertation spec never gains that field.

Never modify a file's contents under `raw/`. Never open `raw/private/`. Never
read a data file beyond its header row. Never fabricate.

**Stand-alone use (no repository yet).** This file also works as a prompt in
any capable AI session over a folder on the author's machine. Then: treat the
folder as `raw/inbox/`, write `MANIFEST.md`, `inventory/corpus-inventory.yaml`
and `ingest-report.md` *beside* it (there is no `wiki/` to build yet — stop
after step 2 and write the report), and never move anything into a
`private/` directory the author has not agreed to. When the repository
exists, the folder and those files go into `raw/inbox/` and `/ingest`
continues from step 3.

## 0. Orient (2 min)

- `wiki/index.md` exists? Read it and the last 5 `log.md` entries; this is a
  re-run. Merge by default: never overwrite a page marked `curated: true`,
  never a page with no `generator:` line. Invoked as `/ingest --bootstrap`,
  overwrite seeded pages (those with a `generator:` line) too.
- `raw/inbox/` has anything besides its `.dataimago-keep` placeholder? Then the author dropped a
  folder — step 1 applies in full. Otherwise step 1 only re-checks.
- `source.referencedRepo` set (the author's whole dissertation is already a
  repository)? Read it in place — clone it read-only beside this repo if it is
  not already there — and treat its tree as the inbox; nothing is copied in.

## 1. Classify (the archive rule: classify everything, store what is safe)

Walk every file under `raw/inbox/` (or the referenced repo) and every file
already under `raw/`. Assign one class per file, by extension and name first,
then a light look at text files and **only the header row** of tabular ones:

| Class | Signals | Goes to |
|---|---|---|
| `manuscript` | `.tex`, `.Rnw`, `.qmd`, `.docx`, a PDF whose name or first page says dissertation/thesis; `.bib`, `.cls`, `.sty`, figures referenced by the sources | `raw/manuscript/` |
| `code` | `.R`, `.Rmd` scripts, `DESCRIPTION`/`NAMESPACE` (a package), `.py`, `.jl`, `Makefile`, `renv.lock` | `raw/code/` (a real R package: leave in place and note it — the spec's `source.rPackage` or `referencedRepo` is the pointer) |
| `research` | papers, articles, other people's PDFs | `raw/research/` |
| `advisor` | writings by names matching `vertical.dissertation.advisors` | `raw/advisor/` |
| `style` | exemplar dissertations/papers the author named as models | `raw/style/` |
| `background` | reports, blog posts, slides (PDF), course readings, methodological references | `raw/background/` |
| `thesis-formatting` | institutional formatting guidelines, sample front matter | `raw/thesis-formatting/` |
| `data` | `.csv`, `.tsv`, `.xlsx`, `.rds`, `.rda`, `.parquet`, `.sav`, `.dta`, `.json` data dumps | `raw/data/` — listed and characterised (rows unknown, columns from the header), never opened further |
| `private` | any file whose **name or header row** suggests personal identifiers — name, address, email, phone, SSN, student id, DOB, IP — and anything the author flags | `raw/private/` (gitignored) |
| `byproduct` | `.aux .log .bbl .blg .out .toc .synctex.gz`, `_site/`, `.quarto/`, `__pycache__`, `.Rhistory`, `.DS_Store` | excluded (left out of git; pointer only) |
| `unknown` | anything else | ask the author in the report; leave in `raw/inbox/` |

Rules: when a manuscript exists as both source (`.tex`/`.Rnw`) and rendered
(`.tex` beside `.Rnw`, or PDF), keep both and mark the source primary. Data
referenced by absolute paths outside the repo is a **gap**, not an error. A
file over 50 MB is excluded with a pointer unless the author asks; note that
Git LFS is the remedy. Move files (`git mv` for tracked ones) — never rename
the file itself, never edit it. `raw/inbox/` is gitignored, so what the
author dropped is untracked until you move it: only files placed in a
category become trackable, on the author's next commit, and `raw/private/`
never does. Do not commit or push during this step; if anything went to
`raw/private/`, the report's first sentence asks for a private repository
before the author pushes at all.

Then write **`raw/MANIFEST.md`**: the table from its template, one row per
item as the author brought it — class, new location, kept in git (yes / no:
private / no: byproduct / no: too large), why. Set `Status:` and `Last ingest:`
at the top. If anything went to `raw/private/`, append each path to
`.dataimago/content.yaml` → `spec.containment[]` (create the block if absent),
and put this sentence at the top of the report: **make this repository
private before you push.**

## 2. Inventory

Write `raw/inventory/corpus-inventory.yaml`: `metadata` (name, `subject:
dissertation-corpus` or `r-package`, `catalogedAt`, `sourceRoots`), then every
claim you can support — identity (title, author, institution, degree, year),
manuscript structure (chapters, front/back matter), bibliography (files,
entry counts), analysis (entry points, dependencies), data (assets, columns,
`piiRisk`), related work — each as `{value, confidence: high|medium|low,
evidence: [{path, line?}]}`. **Evidence or silence**: a value you cannot cite
becomes an entry in `gaps[]` (`{what, whyItMatters, howToSupply}`) instead.
Deterministic ordering; only `catalogedAt` changes on an identical re-run.

## 3. Sources pages

One `wiki/sources/<slug>.md` per ingestable source in `manuscript/`,
`research/`, `advisor/`, `style/`, `background/`, `thesis-formatting/`, and
per code entry point: frontmatter per `KNOWLEDGE.md` (`sources: [raw/…]`,
`curated: false`, `generator: dissertation-app-template/ingest`), then what it
is, its claims or purpose, method, key quotes with page references, and how it
relates to the project. A `.bib` file gets **one** page listing its entries
(count, year range, the ten most-cited-looking), not one page per entry. A
data file gets a page from its name and header only. Delegate long sources to
the `literature-synthesizer` agent, several in parallel. A page that already
exists and is protected (see step 0) is left alone; update its `sources:` only
if the path moved.

## 4. Synthesis

From the spec and the sources pages, seed or update: `wiki/overview.md` (the
project in one page — for an imported dissertation, from its abstract),
`wiki/glossary.md` (the field's terms, from the manuscript and the spec's
key terms), and the research-domain pages `theories/`, `methods/`,
`findings/`, `arguments/` — one page per distinct idea the sources support,
each with `sources:`. Then `wiki/index.md` (catalog, with a `Status:` line
naming this ingest) and append to `wiki/log.md`.

## 5. Refine the spec (imported dissertation only)

If `thesis.manuscript.status` is `locked-v1`, the hub's short door filled the
spec's prospective fields from what the author pasted — their abstract
(research question, background, contribution) and their chapter titles
(`thesis.chapters`). Those are the author's words, not placeholders. Refine
them from the manuscript itself: a sharper research question from the
introduction, chapter titles and ids matched to the table of contents, a
methodology summary from the methods chapter. Record each change in the
inventory with `confidence` and `evidence`, and mention it in the report so
the author sees what was rewritten. **Never invent** a value the manuscript
does not support — open a gap instead — and never touch other spec fields.

## 6. The report, and the gaps as work

Write `wiki/analyses/ingest-report.md` **for the author, not for the machine**:
lead with the scene — what you found in their folder in plain terms, what you
could read, what you could not, what you inferred and how sure you are — then
the counts, then the gaps, each with why it matters and how to supply it. If
private material was set aside, say so first. For each gap, file a work item
in `.dataimago/work/wi-<date>-<slug>.yaml` (`createdBy: ai`, `discoveredFrom:
ingest`), so the punch list lives where work lives.

End with `npm run ingest:check` and paste its last line into the report. If it
lists un-ingested files, either ingest them or list them in `MANIFEST.md`
with a reason — never leave it red.

## 7. Hand-off

Tell the author, in three lines: what is now in `wiki/`, what needs them (the
gaps), and — if `raw/manuscript/LOCKED.md` exists and no `.qmd` chapters do —
that the next step is `/import-manuscript`.
