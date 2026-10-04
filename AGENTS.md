# AI agent operating manual

> This repository is an AI-native dissertation environment provisioned by [dissertation.ai](https://dissertation-ai.dataimago.ai), built on the [dataimago](https://github.com/dataimago/dataimago) framework. **Every AI tool reads this file** — Codex, opencode, Cursor, Copilot and others directly; Claude Code through `CLAUDE.md`. The project's own facts (title, author, institution, layout) are in `dataimago-spec.yaml`; read it first.

## What this repo is

A Next.js dissertation environment holding the user's dissertation work — text, methodology, chapter PDFs, AI tooling context.

**This repo has one of three layouts** — check `source` in `dataimago-spec.yaml`:
- **R-package dissertation** (`source.rPackage` is non-null): the manuscript lives in a Git submodule at `packages/r-packages/<package name from the spec>/ui/www/` (chapters, `thesis.cls`, the Quarto book); R code in the package's `R/`.
- **Content-only dissertation** (`source.rPackage` is `null`, `source.case: no-r`): there is **no submodule**; the manuscript lives directly in this repo at `thesis/` (`thesis/chapters/`, `thesis/thesis.cls`), built by this repo's own `build-thesis.yml`.
- **Referenced whole-dissertation repository** (`source.rPackage` is `null`, `source.case: extension`, `source.referencedRepo` set; not yet offered by the hub, so only present if the spec says so): the author's existing repository holds their dissertation, scripts and data; it is **referenced, not linked as a submodule**. `/ingest` reads it in place; the working chapters, once imported, live at `thesis/` here.

Read the spec first; the rest of this manual notes the locations where they differ.

**Your first act in a fresh clone is `/ingest`.** It reads whatever the author brought (`raw/`, and `raw/inbox/` if they dropped a folder) and builds the knowledge base in `wiki/`. If `raw/manuscript/LOCKED.md` exists, `/import-manuscript` follows. See `KNOWLEDGE.md`.

**Skills work in any AI tool.** Each procedure is a plain Markdown file at `.claude/skills/<name>/SKILL.md`: `ingest`, `import-manuscript`, `thesis-build`, `coordinate`. Claude Code runs them as slash commands (`/ingest`). In any other tool (Codex, opencode, Cursor, ChatGPT with folder access), "run `/ingest`" means: read `.claude/skills/ingest/SKILL.md` and follow it step by step. Agent briefs for specialised roles are in `.claude/agents/`; any tool can read them the same way.

| Path | Purpose |
|---|---|
| `dataimago-spec.yaml` | **Source of truth** for project metadata. Edit it before changing anything else. |
| `src/app/` | Next.js app — landing page, chapter index, links to the thesis PDF + the R package's GitHub Pages site (spec-derived) |
| `packages/r-packages/<package>/` | (R-package layout) The user's R package (submodule; its name is `source.rPackage.name` in the spec). Thesis chapters live in `ui/www/chapters/`. R code in `R/`. |
| `raw/` | **The author's source materials, READ-ONLY for the AI agent.** `inbox/` (drop zone), `manuscript/`, `code/`, `research/`, `advisor/`, `style/`, `background/`, `thesis-formatting/`, `data/`, `private/` (gitignored, never read), `MANIFEST.md`, `inventory/`. See `raw/README.md`. |
| `wiki/` | The knowledge base the AI maintains from `raw/` — **written by `/ingest`**, owned by the author, published to GitHub Pages by `wiki-publish.yml`. It ships with the site scaffold only (`_quarto.yml`, `claims.qmd`, `registry.qmd`); the pages arrive with `/ingest`. Contract: `KNOWLEDGE.md`. |
| `.claude/` | The AI harness: `KNOWLEDGE.md`'s workflows as skills (`/ingest`, `/import-manuscript`, `/thesis-build`, `/coordinate`), four agent briefs, a session-start orientation script (`hooks/orient.sh`, which any tool can run), and Claude Code settings that forbid reading `.env*`, keys, and `raw/private/`. The skills and agents are plain Markdown, readable by any AI tool. Yours to edit. |
| `tools/ingest-check.mjs` | `npm run ingest:check` — every `raw/` file is cited by a wiki page, listed in `MANIFEST.md`, or ignored; otherwise it is un-ingested. Runs in CI as a reminder (a warning, never a failure). |
| `.github/workflows/generate.yml` | Runs `dataimago::ai(spec_path)` on push; commits generated files back |
| `.github/workflows/build-thesis.yml` | Content-only layout: builds `thesis/` → `docs/thesis.pdf` (Quarto + XeLaTeX, no R). Inert when there's no `thesis/`. |
| `.github/workflows/ci.yml` | typecheck + lint |

## The dataimago-spec.yaml is the contract

Every field in `dataimago-spec.yaml` affects something downstream. When the user edits the spec + pushes, `generate.yml` runs and regenerates derived files (types, MCP tool definitions, `.ai-context/`, etc.). **Never edit generated files directly without first updating the spec.**

The spec documents itself: each block in `dataimago-spec.yaml` carries a comment saying what it drives, and the README's "Editing your dissertation" table maps common changes to fields.

## When the user asks for help

- **"Edit chapter X"** — R-package layout: the package's `ui/www/chapters/X.qmd`; content-only (and referenced-repo) layout: `thesis/chapters/X.qmd`. Either way, `build-thesis.yml` rebuilds the PDF on push (the R package's for the former, this repo's for the latter).
- **"Add a committee member"** — edit `dataimago-spec.yaml`'s `vertical.dissertation.advisors.committee` array. Push.
- **"Change citation style"** — edit `dataimago-spec.yaml`'s `vertical.dissertation.thesis.bibliography.citationStyle`. Push.
- **"My institution requires a specific thesis format"** — see `THESIS-CLS-README.md` (under the R package's `ui/www/`, or under `thesis/` for content-only) for the 3-mode strategy (shipped / vendored / generated).
- **"How do I add my IRB number?"** — edit `dataimago-spec.yaml`'s `vertical.dissertation.compliance.irb` block. The interview deliberately didn't ask for this; it's an "additional information (fill in over time)" field.
- **Writing prose (chapters, wiki pages, READMEs)** — read `writing/STYLE.md` first and write under it. The spec's `vertical.dissertation.thesis.writingStyle` selects how that file is sourced (shipped / vendored / generated — see `writing/README.md`); the interview deliberately didn't ask.
- **"I want figures in X"** — `vertical.dissertation.graphics.engine` records the preference (`pstricks`, `tikz`, `r-base`, `ggplot2`; default `unspecified` = choose per context). Note: LaTeX-native engines render in the thesis PDF but not on HTML surfaces until converted — prefer R engines for figures that must appear on the knowledge site.

## Working with the author

- **Work on a branch and propose changes as pull requests.** Never push to `main`, merge, delete, or force-push without the author's explicit go-ahead.
- **The writing is the author's scholarship.** Suggest changes and explain them; never silently rewrite their prose. When you draft new text, say that you drafted it.
- **Ask before acting outside this repository** (other repos, services, accounts), and say what you will do first.

## Constraints

- **Don't delete `.ai-context/` if it exists.** It's generated by `dataimago::ai()` for AI tool consumption.
- **`raw/` is read-only for you.** Cite from it, summarize it, link to it, derive analysis from it — but never modify or rewrite a file. The one exception is `/ingest`'s first pass, which *moves* files out of `raw/inbox/` into their category. Your work goes in `wiki/` or in `dataimago-spec.yaml`. See `raw/README.md` and `KNOWLEDGE.md`.
- **`raw/inbox/` and `raw/private/` are gitignored. Never `git add -f` either, and never commit or push on the author's behalf while `raw/inbox/` still holds unsorted material** — history is not undone by a later move to `raw/private/`.
- **Never read `raw/private/`, and never read a data file beyond its header row.** Private material is listed in `raw/MANIFEST.md` so you know it exists; its contents are not yours to see. If `/ingest` set anything aside there, tell the author to make this repository private before pushing.
- **If `raw/manuscript/LOCKED.md` exists, it governs.** The manuscript beside it is the author's finished dissertation, imported as authoritative v1.0. Extend it — never regenerate, restructure, summarize-and-replace, or "improve" it. The **working copy** you extend is the `.qmd` derivative `/import-manuscript` creates (`thesis/chapters/` or the package's `ui/www/chapters/`); the files under `raw/manuscript/` are never edited, and where they and anything else disagree, they win. Legitimate work builds on top: derived papers, a revised edition as a new version, new chapters clearly marked post-v1.0. (This is stronger than the `raw/` rule above: that one forbids editing the bytes, this one forbids replacing the work.)
- **Don't commit secrets.** No API keys, no `.env.local`, no institutional credentials.
- **Never put identifiable personal data in git** (participant data, names with addresses, IDs, contact lists). If you find any outside `raw/private/`, stop and tell the author.
- **Public repository + unpublished work = warn first.** If this repository is public and holds unpublished chapters, data, or anything under embargo (see `vertical.dissertation.thesis.embargo` and `compliance.dua` in the spec), tell the author before pushing and show them how to make it private (repository Settings → General → Danger Zone → Change visibility).
- **(R-package layout) the submodule is a real Git repo.** Changes to chapter content + R code go in the R package's repo, not here — commit there, then commit the updated submodule pointer here. (Content-only layout has no submodule: edit `thesis/` and commit in this repo directly.)

## Editing this file

`AGENTS.md` is the one manual for every AI tool (Claude Code reads it through `CLAUDE.md`). It ships from the [dissertation-app-template](https://github.com/dataimago/dissertation-app-template) and is meant to be edited by the author as the project evolves: add guidance for the AI helping with your work, e.g. your committee's preferences, your advisor's writing voice, your methodological priorities.
