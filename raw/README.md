# raw/ — your source materials

Everything you brought, exactly as you brought it. The AI agent treats `raw/`
as **read-only**: it summarizes, analyzes, cites and links these files, and
never modifies them. That guarantee is what lets you put load-bearing source
material here — the PDFs you need verbatim, your committee's writings, your
institution's formatting rules, your finished dissertation — without an AI
session ever rewriting history.

The companion directory is `wiki/`. The AI **owns** `wiki/` and builds it
*from* `raw/` with one command: **`/ingest`**. Run it in a fresh clone, and
again whenever you add material.

## How material gets here

- **From dissertation.ai onboarding** — the documents you attached during the
  interview land in the category directories below.
- **From your own folders** — if you came with a finished dissertation, a
  folder of analysis, reports, slides, data: make the repository private on
  GitHub first if the folder might hold anything private, then copy all of it
  into **`raw/inbox/`** after cloning (see `raw/inbox/README.md`; the inbox
  is gitignored, so nothing is committed until it has been sorted) and run
  `/ingest`. It sorts everything into the categories, keeps anything private
  out of git, and writes `MANIFEST.md`.
- **Later** — drop new files into the matching category (or `inbox/`) and run
  `/ingest` again.

## Categories

| Directory | What it holds |
|---|---|
| `inbox/` | The drop zone. `/ingest` empties it. |
| `manuscript/` | Your finished dissertation, if you imported one: the PDF and/or sources (`.tex`, `.Rnw`, `.docx`), `.bib`, class files. `LOCKED.md` marks it as authoritative **version 1.0**; `/import-manuscript` derives the editable `.qmd` chapters from it. |
| `code/` | Analysis code that is not an R package (scripts, notebooks, a Makefile). A real R package is linked as a submodule or referenced from the spec instead. |
| `research/` | Papers and materials your dissertation engages with — sources you cite, methods you extend, prior work you compare to. |
| `advisor/` | Writings by your advisor and committee members; shapes how your AI assistant models the prose your committee expects. |
| `style/` | Exemplar dissertations or papers whose structure, voice, or formatting you want to emulate. |
| `background/` | Reports, talks (as PDF), blog posts, course readings, methodological references that shape your thinking but aren't cited. |
| `thesis-formatting/` | Your institution's formatting guidelines. Used to refine `thesis.cls` when `classFile.type` is `generated`. |
| `data/` | Data files. They are **listed and characterised from their headers only** — never opened further, never summarized in `wiki/`. |
| `private/` | Anything with names, addresses, identifiers, or that you flag. **Gitignored; the AI is denied from reading it.** If `/ingest` put anything here, make this repository private before you push. |
| `MANIFEST.md` | What you brought, where each item went, what was set aside and why. Written by `/ingest`. |
| `inventory/` | `corpus-inventory.yaml` — every claim `/ingest` made about your material, each with its evidence and a confidence, and the list of gaps (what is missing and why it matters). |

The categories are a seed, not a schema: add a directory for anything new
(`interviews/`, `regulatory-filings/`, …) with a short `README.md`, and run
`/ingest`.

## File-type notes

- **PDFs** are preferred for papers and institutional documents. Word files
  are accepted (`/import-manuscript` and `/ingest` read them via pandoc), but
  PDF is more robust.
- **Markdown and plain text** are fine for notes and transcripts.
- **Slides** — export to PDF.
- **Images** (PNG / JPEG / WebP) for figure sources and scanned pages.

## Size

- Files over ~50 MB are set aside with a pointer rather than committed; Git
  LFS is the remedy if you need them in the repository (extend
  `.gitattributes`).
- Above ~100 MB of cumulative `raw/` content, use LFS for `raw/**/*.pdf`.
