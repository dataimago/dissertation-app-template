---
name: thesis-build
description: Build the author's submission-ready thesis PDF in their institution's format (thesis.classFile in dataimago-spec.yaml). Use for "build my thesis", formatting problems, or PDF/LaTeX errors. Delegates heavy work to the thesis-build-agent.
---

# thesis-build

Produce the institution-formatted thesis PDF. Conform to the institution's spec;
never bend formatting in non-conformant ways to clear an error.

## Steps
1. Resolve the class via `vertical.dissertation.thesis.classFile.type` in
   `dataimago-spec.yaml`. The three modes are the thesis-class registry's
   (`dataimago/dissertation-thesis-classes`). Put them to the author in these
   words, which `THESIS-CLS-README.md` beside the chapters also uses:
   - **`shipped`**: the registry has a class for your institution, and you use
     it as-is. (Set it up as in "Setting up a shipped class" below.)
   - **`vendored`**: you provide your institution's own class file. (It
     replaces `thesis.cls` beside the chapters.)
   - **`generated`** (the default): you start from the framework's default
     `thesis.cls` and tailor it to your institution's formatting guidelines.
     (The guidelines are in `raw/thesis-formatting/`.)

   The framework's default `thesis.cls`, the one the repo starts with, is where
   `generated` starts. It is not what `shipped` means.
2. Build via `build-thesis.yml` (Quarto + XeLaTeX). Chapters: `thesis/chapters/`
   (content-only) or the R package's `ui/www/chapters/`. For deep diagnosis or
   class drafting, hand off to the `thesis-build-agent`.
3. Verify against the institution checklist (margins, front matter, ToC, captions).

## Setting up a shipped class

"Beside the chapters" means the Quarto book's folder: `thesis/` in this repo
(content-only), or the R package's `ui/www/`. In the R-package layout that
folder is in the package's own repository, so ask the author before you change
it.

1. **Find the institution.** Read `vertical.dissertation.institution.name` from
   `dataimago-spec.yaml`.
2. **Look it up in the registry.** Fetch
   `https://raw.githubusercontent.com/dataimago/dissertation-thesis-classes/main/registry.json`
   and find the entry in `classes` whose `institution` is that name (ignore
   case) and whose `status` is `available`. If the spec names it differently
   (say, "CU Boulder" for "University of Colorado Boulder"), ask the author to
   confirm the match before you use it.
3. **No match? Say so and offer `generated`.** Tell the author plainly: "The
   thesis-class registry has no ready-made class for <institution> yet." Offer
   `generated` instead: with their agreement, set `classFile.type: generated`
   and adapt the framework's `thesis.cls` to their guidelines. Never borrow
   another institution's class. (A repo set up before 2026-11-07 may say
   `shipped` for the framework's default class; that was the old wording, and
   under today's wording it is `generated`.)
4. **Fetch the class.** If the committed `thesis.cls` is already the registry's
   file, skip to step 6. Otherwise fetch the entry's `path` and each file in
   `companions` from the same base,
   `https://raw.githubusercontent.com/dataimago/dissertation-thesis-classes/main/`,
   and save each one beside the chapters under its own file name. For CU
   Boulder, `classes/cu-boulder/thesis.cls` replaces `thesis.cls` and
   `classes/cu-boulder/macros.tex` becomes `macros.tex`. Keep `classFile.path`
   in the spec at `thesis.cls`.
5. **Point the Quarto config at it.** In `_quarto.yml` beside the chapters,
   under `format: pdf:`, set `documentclass` to the entry's `documentclass`,
   `classoption` to its `classOptions`, and `pdf-engine` to its `engine`.
6. **Check the title page.** A registry class may bring its own front-matter
   commands, listed in its README (`classes/<id>/README.md` in the registry).
   The CU Boulder class, for example, defines a two-argument
   `\author{first}{last}`, while Quarto's template writes `\author{...}` with
   one argument. So the first `shipped` build may need front-matter changes
   made outside the class: in `_quarto.yml` (for example `include-in-header`)
   or the front-matter chapter, never in the class file itself. Render locally
   (`quarto render --to pdf`) until the PDF builds.
7. **Commit the files.** Commit the class, its companions and the config change
   on a branch and propose them as a pull request, naming the registry `id` and
   `version` in the commit message. The committed files are the author's pinned
   copy: `build-thesis.yml` builds from them and never fetches from the
   registry, so a later change there cannot change the author's PDF. Update the
   class only when the author asks, by repeating these steps.

## Common build failures (from the dissertation-ai alpha, 2026-06-24)

The visible CI error is often just `Emergency stop` — dump the `.log`
(`tail -120 <chapters dir>/index.log`) or render locally (`quarto render --to pdf`)
to see the real `! LaTeX Error`.

- **`tlmgr: command not found`** — `quarto install tinytex` doesn't put `tlmgr`
  on PATH. Use `r-lib/actions/setup-tinytex@v2`, and `apt-get install` the fonts
  the class needs (e.g. `fonts-noto-core fonts-noto-extra`).
- **Equations come out in Latin Modern Math although `mathfont` is Noto Sans Math** —
  no error, just the wrong font (`pdffonts docs/thesis.pdf` lists `LatinModernMath`).
  The installed Noto Sans Math is 2.001, which has no OpenType MATH table; Linux
  distributions ship that version. Install 3.000 from google/fonts, as
  `build-thesis.yml` does, whose last step fails the run on this fallback.
- **`Emergency stop … no legal \end found`, last package loaded is the .sty** —
  a support `.sty` was pulled in via Quarto `include-in-header:` file injection,
  which inlines the file's `\endinput` and truncates `index.tex`. Load it as a
  package instead: `include-in-header: { text: "\\usepackage{<pkg>}" }`.
- **`Environment abstract undefined`** — `\renewenvironment{abstract}` on a class
  that `\LoadClass{book}`. Use `\newenvironment`, or base on `report`.
- **`Option clash for package geometry`** — the class loads `geometry` and the
  Quarto `geometry:` key reloads it. Drop one.
- **`validation failed … book:bibliography / book:csl`** — `bibliography`/`csl`
  are top-level keys, not `book:` children; a referenced `*.csl` must exist.
- **`Book contents must include a home page`** — list `index.qmd` first.
- **`git add docs/thesis.pdf` fails ("ignored by .gitignore")** — force the one
  artifact: `git add -f docs/thesis.pdf`.

## Guardrails
- Only class machinery may be contributed back to the registry, only with
  consent — never the manuscript prose.
- If `raw/manuscript/LOCKED.md` exists, the chapters are v1.0 of a finished work:
  fix the build, never rewrite the text.
