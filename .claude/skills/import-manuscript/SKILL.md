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
- **docx** → `pandoc -f docx -t markdown --wrap=none --extract-media=<figures dir>`,
  then split on level-1 headings.
- Copy the `.bib` file(s) to `references.bib` beside the chapters (merge if
  several; keep keys), figures into `figures/`, and the author's `.cls`/`.sty`
  into the chapters directory as **vendored** class files — update
  `dataimago-spec.yaml` `thesis.classFile.type: vendored` and `path` if the
  spec still says `shipped`.

## 3. Place, as v1.0

Target: `thesis/chapters/` when `source.case` is `no-r` (and `thesis/` exists
from provisioning; keep its `_quarto.yml`, `index.qmd`, `thesis.cls`); the R
package's `ui/www/chapters/` otherwise. File names `NN-<slug>.qmd` in reading
order; replace the eight provisioning stubs; front matter to `00-front-matter.qmd`,
appendices to `9N-…`. Update `_quarto.yml` `chapters:` to the real list (with
`index.qmd` first). Add to each chapter's YAML: `version: "1.0"`,
`derivedFrom: raw/manuscript/<source file>`, `importedAt: <date>`.

Then rewrite the last line of `raw/manuscript/LOCKED.md` so the lock names the
derivative:

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
