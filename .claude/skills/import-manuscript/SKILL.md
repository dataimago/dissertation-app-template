---
name: import-manuscript
description: For an author who imported a finished dissertation (raw/manuscript/LOCKED.md exists) — derive version 1.0 of the chapters as .qmd from their sources (.tex / .Rnw / .docx via pandoc; PDF only as a last resort, with the fidelity loss disclosed), into thesis/chapters/ (content-only layout) or the R package's ui/www/chapters/ (R-package layout). raw/manuscript/ stays authoritative and untouched. Run after /ingest. Use for "import my dissertation", "make my chapters editable", or when the orientation hook says the derivative is missing.
---

# /import-manuscript — version 1.0, as text you can extend

The author's finished dissertation is the version 1.0 of a living research
program. Their PDF and sources in `raw/manuscript/` **are** v1.0 and stay
locked (`LOCKED.md`). What this skill makes is the working derivative: the
chapters as `.qmd`, in the place the thesis build reads, so new work extends
the text instead of starting beside it.

Preconditions: `raw/manuscript/LOCKED.md` exists; `/ingest` has run (the
inventory tells you which files are the sources and which is the rendered
copy). If the chapters directory already has non-stub `.qmd` files, stop and
ask — this skill does not overwrite an author's edits.

## 1. Choose the source, honestly

In order of fidelity, from `raw/inventory/corpus-inventory.yaml` → `manuscript`:

1. **LaTeX source** (`.tex`, with `.bib`, `.cls`, figures) — best.
2. **knitr source** (`.Rnw`) — same as LaTeX once the chunks are handled (below).
3. **Word** (`.docx`) — pandoc handles structure and citations reasonably.
4. **Quarto/Markdown** (`.qmd`, `.md`) — copy, adjust headers.
5. **PDF only** — last resort: `pandoc` cannot read PDF; use `pdftotext -layout`
   (poppler) if available, otherwise ask the author for a source file. State
   plainly in the fidelity note that headings, equations, tables, figures and
   citations were reconstructed from text and need checking.

If both a source and a rendered copy exist, use the source and keep the PDF as
the reference for what "v1.0 looked like".

## 2. Convert

- **LaTeX / knitr** → split on `\chapter{…}` (front matter before the first
  chapter; appendices after `\appendix`), then per chapter:
  `pandoc -f latex -t markdown+raw_tex --wrap=none --bibliography=<bib> --citeproc=false`
  (keep `\cite` as `[@key]`: pandoc's `-t markdown` converts `\cite{a,b}` to
  `[@a; @b]`). For `.Rnw`, first turn `<<chunk>>= … @` blocks into
  ```` ```{r} ```` fences (`knitr::purl`-style) — then, if this is the
  **content-only** layout, escape them to ```` ```{{r}} ```` so the app's
  R-free `build-thesis.yml` does not demand Rscript (the same
  `escapeExecutableFences` convention the provisioning hub uses); in the
  R-package layout leave them executable.
- **docx** → `pandoc -f docx -t markdown --wrap=none --extract-media=<figures dir>`
  (the book folder's `figures/`; on the referenced-repository path, where §3
  creates `thesis/`, convert into a scratch folder and place figures with the
  bibliography after §3),
  then split on level-1 headings.
- Copy the `.bib` file(s) to `references.bib` beside the chapters (merge if
  several; keep keys), figures into `figures/` beside the chapters (both deferred
  to §3 on the referenced-repository path, onto `thesis/references.bib` and
  `thesis/figures/`), and note any `.cls`/`.sty` among
  the sources for the §3 proposal. Copy nothing of them yet, and do not switch
  `_quarto.yml`: only if the author agrees in §3 do they go into the book folder
  beside `_quarto.yml` (never under `chapters/`). An author's own class means **vendored** mode (`shipped` is a
  registry profile, `generated` the house profile adapted; the author's own class
  is neither), but switching is the author's decision: §3 ends with a proposal.

## 3. Place, as v1.0

Target, decided by the same trio `/ingest` reads (`source.case`,
`source.referencedRepo`, a local `source.rPackage`):

- `no-r` → `thesis/chapters/` here (keep the provisioned `_quarto.yml`,
  `index.qmd`, and the house bundle `thesis-class/`, `profiles/`, `_environment`;
  on the older layout, `thesis.cls` and `dataimago.sty` instead, see below); knitr
  chunks escaped for the R-free build.
- `extension` **with** `referencedRepo` (the author's whole dissertation is an
  existing repository; `rPackage` is null, there is no submodule and no local
  `ui/www/`) → `thesis/chapters/` here, R-free build, chunks escaped — **and
  on this path you create the `thesis/` bundle yourself**, because the hub
  scaffolds it only for `no-r`: fetch `_quarto.yml`, `index.qmd`,
  `references.bib`, `THESIS-CLS-README.md` and the whole house bundle from
  `dataimago/dissertation-rpkg-template`'s `ui/www/` (public). **Ask first:** tell
  the author you will clone that public template into a temporary folder and copy
  `_quarto.yml`, `index.qmd`, `THESIS-CLS-README.md`, `thesis-class/`, `profiles/` and
  `_environment` into `thesis/` here (the template's `references.bib` only if §2 found
  no bibliography among the sources), then wait for a yes. Run this from
  the repository root; it changes no directory and stops if a file is missing:
  ```sh
  SCRATCH="$(mktemp -d)"
  git clone --depth 1 https://github.com/dataimago/dissertation-rpkg-template "$SCRATCH/rpkg"
  W="$SCRATCH/rpkg/ui/www"
  for f in _quarto.yml index.qmd references.bib THESIS-CLS-README.md thesis-class profiles _environment; do
    [ -e "$W/$f" ] || { echo "missing in the template: $f (stop and tell the author)"; exit 1; }
  done
  mkdir -p thesis
  cp -a "$W/_quarto.yml" "$W/index.qmd" "$W/THESIS-CLS-README.md" \
        "$W/thesis-class" "$W/profiles" "$W/_environment" thesis/
  # the bibliography: the author's own if §2 found one (written next, not merged
  # with the template's); the template's only when §2 found none
  [ -n "$AUTHOR_BIB_FOUND" ] || cp "$W/references.bib" thesis/
  # the two rewrites the hub applies, in place under this repository's thesis/
  perl -pi -e 's{output-dir: \.\./\.\./docs}{output-dir: ../docs}' thesis/_quarto.yml
  perl -pi -e 's/^(\s*```)\{(r[^}]*)\}/$1\{\{$2\}\}/' thesis/index.qmd   # the book file only, never thesis-class/
  ```
  Set `AUTHOR_BIB_FOUND=1` before the block when §2 found a `.bib`. Then write the
  author's bibliography onto `thesis/references.bib` (merging only the author's own
  `.bib` files with each other, never with the template's) and their figures into
  `thesis/figures/`. The same fence escape applies to each `thesis/chapters/*.qmd`
  as you write it (§2).
  The copied `_quarto.yml` and `index.qmd` are template scaffolding, not the author's
  book: treat every `thesis:` value in them (and any `PLACEHOLDER-*` or `{{...}}`) as
  empty, and propose real values from the manuscript, then the spec, in the §3
  front-matter proposal; wrap the template's `index.qmd` landing text in
  `::: {.content-visible when-format="html"}` so it does not print; and list
  `chapters/00-front-matter.qmd` in `chapters:` right after `index.qmd`. The app's `build-thesis.yml` is already here and inert
  until `thesis/` exists. The referenced repository is read, never written. On this path the
  `.Rnw` chunks become **inert listings** — say so in the first lines of the
  fidelity note (§4): the runnable analysis stays in the referenced
  repository, and an author who wants executable chapters moves to the
  R-package layout rather than un-escaping fences here.
- `retrofit`, or `extension` with a local R-package submodule → the package's
  `ui/www/chapters/`, built by the package's own `build-thesis.yml`, chunks
  left executable. One rule per path: escape only under app `thesis/`, keep
  executable only under `ui/www/` — never both on the same files.

Last, decide the class. **First check the layout**: does the book folder have
`thesis-class/`?

**House layout** (`thesis-class/` present), and **only if a `.cls` was found among
the sources (§2)**: name the `.cls` to the author and **propose** the switch to
vendored mode, then wait for a yes. The proposal lists exactly what would change:
copy the `.cls`/`.sty` into the book folder beside `_quarto.yml` (not `chapters/`,
where LaTeX would not find them); in `_quarto.yml` set `documentclass` to the `.cls`
file name without its extension, drop the house `template-partials`, `filters` and
`thesis:` block, set `pdf-engine` to the engine the class's own header or README
names (ask if it names none) and leave `classoption` empty unless the class
documents required options; set `dataimago-spec.yaml` `thesis.classFile.type:
vendored` and `path` to the `.cls` file name; and the folders `_environment`,
`thesis-class/` and `profiles/` would be removed (nothing is deleted before the yes;
in the R-package layout they live in the package repository, so ask before touching
it). If the author says no, the house class stays and the `.cls` is only a
reference (`raw/` is not touched). A yes overrides the "keep the provisioned
`_quarto.yml`" lines above.

**Older layout** (no `thesis-class/`: a repository set up before the house class,
with `thesis.cls`, `dataimago.sty`, `documentclass: thesis`). The house-class
front-matter slots below do not apply; the old class does not read them.
- If a `.cls` was found among the sources, offer the author a choice and wait: use
  their own class (vendored), or move to the house class. Vendored here means: copy
  their `.cls`/`.sty` beside `_quarto.yml`, set `documentclass` to the `.cls` file name
  without its extension and `pdf-engine` to the engine the class names (ask if it
  names none), remove `classoption` and the `\usepackage{dataimago}` header unless
  their class documents them, set `thesis.classFile.type: vendored` and `path` to the
  `.cls` file name, and, last and only once `documentclass` names their class,
  remove `thesis.cls` and `dataimago.sty`. Nothing changes before the yes. The move
  is `/thesis-build`, "Moving an older repository to the house class"; propose it,
  never do it here.
- If no `.cls` was found (or the author declines both), keep `thesis.cls`,
  `dataimago.sty` and `_quarto.yml` as they are, and tell the author the move to the
  house class is available (`/thesis-build`, "Moving an older repository to the
  house class"): propose it, never do it here.

Otherwise, when the house bundle is present and the house class stays, the book has
fixed front-matter slots the house class requires: the abstract in `index.qmd`'s
`abstract:` field, acknowledgments and dedication in `.acknowledgments` /
`.dedication` divs in `00-front-matter.qmd`, and the `thesis:` block of `_quarto.yml`
(institution, department, degree, advisors, committee). These are placements of the
v1.0 text, not edits to it, and this skill runs under `raw/manuscript/LOCKED.md`, so
**propose them before writing anything**: list each placement (what, from where in
the manuscript, to where) and each `thesis:` value with its source (the manuscript's
own title page first, the spec only where the manuscript is silent; if they
disagree, the manuscript wins), ask the author for what neither gives, and wait for
a yes. Only then write them. Keep values already in `_quarto.yml`; a change to a
non-empty one is part of the same proposal.

File names `NN-<slug>.qmd` in reading order; replace the eight provisioning
stubs; front matter to `00-front-matter.qmd` (on the house class, the abstract
and the other slots go where the proposal above put them once the author agreed;
on the older layout, leave the abstract and front matter where `thesis.cls`
already reads them),
appendices to `9N-…`. Update `_quarto.yml` `chapters:` to the real list (with
`index.qmd` first). Add to each chapter's YAML: `version: "1.0"`,
`derivedFrom: raw/manuscript/<source file>`, `importedAt: <date>`.

Then **append** one sentence to `raw/manuscript/LOCKED.md` so the lock names the
derivative (the hub wrote the lock at provision time and never names one — a
derivative did not exist yet):

> The working copy you extend is `<chapters dir>` (created by
> `/import-manuscript` on <date> from `<source file>`). These files remain the
> authoritative v1.0; if the two ever disagree, these win.

Never modify anything else under `raw/manuscript/`. Verify the sources are
byte-identical before and after (`git status raw/manuscript` must show only
`LOCKED.md`).

## 4. Build, and say what was lost

Run the thesis build (`quarto render --to pdf` in the chapters' project, or
push and let `build-thesis.yml` run; the `thesis-build` skill has the failure
catalogue). Write `wiki/analyses/manuscript-import.md` — the fidelity note: the
source used, the chapter map (source → file), what pandoc could not carry
(custom macros, theorem environments, complex tables, cross-references,
`\input` fragments not found), and a checklist of what the author should read
through. Link it from `wiki/index.md`; append `wiki/log.md`; add a sources
page for the manuscript if `/ingest` did not already.

## 5. Hand-off

Three lines to the author: where the chapters are, that `raw/manuscript/` is
still the untouched v1.0, and the two or three things in the fidelity note
most worth their eyes first.
