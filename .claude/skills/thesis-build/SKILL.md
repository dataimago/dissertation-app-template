---
name: thesis-build
description: Build the author's submission-ready thesis PDF in their institution's format (thesis.classFile in dataimago-spec.yaml). Use for "build my thesis", formatting problems, or PDF/LaTeX errors. Delegates heavy work to the thesis-build-agent.
---

# thesis-build

Produce the institution-formatted thesis PDF. Conform to the institution's spec;
never bend formatting in non-conformant ways to clear an error.

## Steps
1. Resolve the class via `thesis.classFile.type` in `dataimago-spec.yaml`:
   `shipped` / `vendored` / `generated` (see `THESIS-CLS-README.md` beside the
   chapters).
2. Build via `build-thesis.yml` (Quarto + XeLaTeX). Chapters: `thesis/chapters/`
   (content-only) or the R package's `ui/www/chapters/`. For deep diagnosis or
   class drafting, hand off to the `thesis-build-agent`.
3. Verify against the institution checklist (margins, front matter, ToC, captions).

## Common build failures (from the dissertation-ai alpha, 2026-06-24)

The visible CI error is often just `Emergency stop` — dump the `.log`
(`tail -120 <chapters dir>/index.log`) or render locally (`quarto render --to pdf`)
to see the real `! LaTeX Error`.

- **`tlmgr: command not found`** — `quarto install tinytex` doesn't put `tlmgr`
  on PATH. Use `r-lib/actions/setup-tinytex@v2`, and `apt-get install` the fonts
  the class needs (e.g. `fonts-noto-core fonts-noto-extra`).
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
