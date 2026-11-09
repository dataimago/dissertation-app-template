---
name: thesis-build
description: Build the author's submission-ready thesis PDF in their institution's format (thesis.classFile in dataimago-spec.yaml). Use for "build my thesis", formatting problems, or PDF/LaTeX errors. Delegates heavy work to the thesis-build-agent.
---

# thesis-build

Produce the institution-formatted thesis PDF. Conform to the institution's spec;
never bend formatting in non-conformant ways to clear an error.

## Steps
1. Resolve how the class is chosen via `vertical.dissertation.thesis.classFile.type`
   in `dataimago-spec.yaml`. The registry (`dataimago/dissertation-thesis-classes`)
   holds one house class, `dataimago-thesis`, and a **profile** per institution:
   the profile holds the institution's formatting rules, the class applies them.
   Put the three modes to the author in these words, which `THESIS-CLS-README.md`
   beside the chapters also uses:
   - **`shipped`**: the registry has a profile for your institution, and you use
     it as-is. (Set it up as in "Setting up a shipped profile" below.)
   - **`vendored`**: you provide your institution's own class file. (It goes
     beside `_quarto.yml`, and the house class is then not used; see "Switching
     to `vendored`" below.)
   - **`generated`** (the default): you start from the registry's `house`
     profile and adapt it to your institution's formatting guidelines. (The
     guidelines are in `raw/thesis-formatting/`; the `thesis-format` skill does
     the adapting.)

   The `house` profile is where `generated` starts. It is not what `shipped`
   means: `shipped` always names an institution's profile.
2. Build via `build-thesis.yml` (Quarto + LuaLaTeX, tagged PDF; XeLaTeX is
   supported but untagged). Chapters: `thesis/chapters/` (content-only) or the R
   package's `ui/www/chapters/`. For deep diagnosis or profile drafting, hand
   off to the `thesis-build-agent`.
3. Verify against the institution checklist (margins, front matter, ToC, captions).

## Where things are

"Beside the chapters" means the Quarto book's folder: `thesis/` in this repo
(content-only), or the R package's `ui/www/`. In the R-package layout that
folder is in the package's own repository, so ask the author before you change
it. There:

- `thesis-class/`: the house class and its Quarto partials and filter, copied
  from the registry. `registry-source.json` records the registry commit;
  `sync.py` checks and updates the copy; never hand-edit the other files.
- `profiles/<id>.yaml` and `profiles/<id>.cfg`: a profile and its compiled form.
  `thesis.profile: <id>` in `_quarto.yml` selects one.
- `_environment`: puts both folders on LaTeX's search path.
- `_quarto.yml`: `documentclass: dataimago-thesis`, `pdf-engine: lualatex`, the
  `template-partials` and `filters`, and a `thesis:` block (profile, institution,
  degree, department, advisors, committee).

If the folder has no `thesis-class/` (a repository set up before the house class
carries `thesis.cls` and `dataimago.sty` instead), it is on the older layout and
keeps building as it did. Moving it over is a change to the author's repository,
so propose it and wait for their agreement: follow "Moving an older repository
to the house class" below.

## Setting up a shipped profile

1. **Find the institution.** Read `vertical.dissertation.institution.name` from
   `dataimago-spec.yaml`.
2. **Look it up in the registry.** Fetch
   `https://raw.githubusercontent.com/dataimago/dissertation-thesis-classes/main/registry.json`.
   Check `schemaVersion`: this skill reads version 2. If it is anything else,
   stop and tell the author this skill needs updating; do not guess. In
   `profiles`, find the entry whose `institution` is that name (ignore case)
   and whose `mode` is `shipped` and `status` is `available`. Never pick the
   profile with id `house`. If the spec names the institution differently (say,
   "CU Boulder" for "University of Colorado Boulder"), ask the author to
   confirm the match before you use it.
3. **No match? Say so and offer `generated`.** Tell the author plainly: "The
   thesis-class registry has no ready-made profile for <institution> yet." Offer
   `generated` instead: with their agreement, set `classFile.type: generated`
   and adapt the `house` profile with the `thesis-format` skill. Never borrow
   another institution's profile. (A repo set up before 2026-11-07 may say
   `shipped` for the framework's old default class; that was the old wording,
   and under today's wording it is `generated`.)
4. **Resolve the class.** The matched profile's `class` is an `id` in the
   registry's `classes` (today `dataimago-thesis`; it must be `available`). The
   class's `path` and `companions` (under `classes/<class>/`) are the class
   bundle; the profile's `cfg` and `yaml` (under `profiles/`) are the other half.
   They live in different directories of the registry; fetch both.
5. **Fetch them.** Run
   `python3 <book folder>/thesis-class/sync.py sync --ref main --profile <id>`
   from the repository root (the book folder is `thesis/` for content-only, or the R package's `ui/www/`). It fetches the
   class `path` and every `companions` file into `thesis-class/` and the
   profile's `yaml` and `cfg` into `profiles/`, all from one registry commit,
   and records that commit in `thesis-class/registry-source.json`.
   **If `<book folder>/thesis-class/sync.py` does not exist, stop here:** the book
   is on the older layout (`thesis.cls`, `documentclass: thesis`, no `thesis:`
   block), and steps 6–9 would rewrite `_quarto.yml` into a shape its class cannot
   read. Do not run steps 6–9. Offer "Moving an older repository to the house
   class" below and wait for the author's yes; set up the profile after the move.
   Do not copy files by hand: a partial copy is the usual cause of a build that finds
   the class but not the profile.
6. **Point the book at it.** In `_quarto.yml`, under the existing `thesis:` block, change `profile: house` to `profile: <id>` and
   check `format: pdf:` against the class entry: `documentclass`
   (`dataimago-thesis`), and `pdf-engine` (the entry's `engine`, `lualatex`;
   `engineFallback` is `xelatex`, untagged). The profile's `classOptions` is
   `profile=<id>`; `thesis.profile` already sends it, so do not repeat it under
   `classoption`. Fill only the **empty** keys of the `thesis:` block (institution, degree,
   department, advisors, committee): the manuscript's own title page first, the
   spec where the manuscript is silent, and ask the author for what neither gives.
   Keep every value already there; to change a non-empty one, show the change and
   ask first.
7. **Read what the profile does not say.** Open `profiles/<id>.yaml`. Fields the
   institution's guide does not state are listed under `unstated` and keep the
   house value, and `sources` cites the rest. Tell the author what is unstated;
   never say the guide is fully met without reading both lists.
8. **Check the PDF.** Render locally (`quarto render --to pdf` in the book
   folder; it needs a current TeX Live with TeX Gyre, `luamml`, `tagpdf`,
   `latex-lab`) until the PDF builds. Check it against the profile's `sources`
   (what the guide states) and show the author the `unstated` list from step 7.
   Front-matter content has fixed
   places: the abstract is `abstract:` in `index.qmd`, acknowledgments, dedication
   and the like are `.acknowledgments` / `.dedication` divs in
   `chapters/00-front-matter.qmd`. Moving text into those places is a move, not
   an edit, and it waits for the author: name each move (what, from where, to
   where) and wait for a yes before making it, as in "Moving an older repository".
   If `raw/manuscript/LOCKED.md` exists, that is a second gate: show each move
   against the locked manuscript and wait again.
   Make changes there and in `_quarto.yml`, never
   in the vendored class files: using them as-is is what `shipped` means.
9. **Prepare the commit.** Edit the working tree only; never run `git add`, `commit`, `push` or `gh pr create` yourself. Show the author how to commit `thesis-class/`, `profiles/` and `_quarto.yml`
   on a branch and propose them as a pull request: in this repository for
   content-only (`thesis/...` paths); in the R-package layout, first in the
   package's own repository and then the submodule-pointer pull request here, with
   the same commands as `thesis-format` Step 6 (`git -C packages/r-packages/<name> ...`,
   then the pointer). Ask before touching the package repository. Either way, naming the profile `id`, the
   class `version` and the registry commit in the message. Do not push or open the
   pull request yourself: show the author the commands. The committed files are the
   author's pinned copy: `build-thesis.yml` builds from them and never fetches from
   the registry, so a later change there cannot change the author's PDF. Update the
   copy only when the author asks, by repeating step 5.

## Building a `generated` profile

`generated` does not mean writing or adapting a class. The `house` profile is
the starting point. Run the `thesis-format` skill: it writes a new
`profiles/<id>.yaml` beside the chapters (`extends: house`, plus only the values
the guide in `raw/thesis-formatting/` states, each cited; what the guide leaves out
is listed under `unstated` and keeps the house value), compiles it (`texlua <book folder>/thesis-class/thesis-profile.lua
<book folder>/profiles <id>`), and gives the author a checklist. Then propose changing `profile:` to `<id>` in the `thesis:` block of
`_quarto.yml` (show the change) and build once the author says yes. Until the author has a guide, the `house` profile builds
as it is.

## Switching to `vendored`

For a book on the house class whose author supplies their own `.cls`: with the author's
yes (name the `.cls` and the list first), copy the `.cls`/`.sty` beside `_quarto.yml`;
in `_quarto.yml` set `documentclass` to the `.cls` file name without its extension,
drop the house `template-partials`, `filters` and `thesis:` block, set `pdf-engine` to
the engine the class names (ask if it names none), and leave `classoption` empty unless
the class documents required options; set `thesis.classFile.type: vendored` and `path`
in `dataimago-spec.yaml`; then remove `_environment`, `thesis-class/` and `profiles/`.
Nothing is deleted before the yes, and in the R-package layout ask before touching the
package.

## Moving an older repository to the house class

A repository set up before the house class has `thesis.cls`, `dataimago.sty`,
`documentclass: thesis` and `pdf-engine: xelatex` in `_quarto.yml`, and a
`build-thesis.yml` that installs Noto fonts. Moving it is one pull request, and
the author agrees first, and the agreement names the file moves in step 3 (if
`raw/manuscript/LOCKED.md` exists, show each proposed move of the working
chapters' front matter and stop until the author confirms it). It is for books
that used the old default `thesis.cls` (`shipped` in the old wording, or
`generated`), not for `vendored` ones: a vendored author keeps their class and
does not move.

1. Copy the house bundle from `dataimago/dissertation-rpkg-template`'s `ui/www/`
   (public) into the book folder:
   ```sh
SCRATCH="$(mktemp -d)"
git clone --depth 1 https://github.com/dataimago/dissertation-rpkg-template "$SCRATCH/rpkg"
cp -a "$SCRATCH/rpkg/ui/www/thesis-class" "$SCRATCH/rpkg/ui/www/profiles" "$SCRATCH/rpkg/ui/www/_environment" <book folder>/
```
   Stop and tell the author if any of those paths is missing; never assemble the
   folder from guesses.
2. In `_quarto.yml`, from the step 1 clone's `"$SCRATCH/rpkg/ui/www/_quarto.yml"`, copy
   `lang`, the `thesis:` block's keys, and under `format: pdf:` the keys
   `documentclass` (`dataimago-thesis`), `pdf-engine` (`lualatex`),
   `template-partials` and `filters`. Do **not** copy `output-dir`: keep the book's
   own (`../docs` for content-only `thesis/`; the template's `../../docs` is the R
   package's), since `build-thesis.yml` publishes `docs/thesis.pdf`.
   Fill only empty `thesis:` keys (the manuscript's title page first, then the
   spec, then ask the author); keep values already in `_quarto.yml` and ask before
   changing a non-empty one; remove `mainfont`, `sansfont`,
   `mathfont`, `classoption` and the `\usepackage{dataimago}` header. The
   profile owns those.
3. Move the abstract to `abstract:` in `index.qmd`, and acknowledgments and
   dedication to `.acknowledgments` and `.dedication` divs in
   `chapters/00-front-matter.qmd` (words stay the author's; move, do not edit).
   An `index.qmd` landing text that should not print goes inside
   `::: {.content-visible when-format="html"}`.
4. Replace `build-thesis.yml` with the one for the layout. Content-only: `git clone --depth 1
   https://github.com/dataimago/dissertation-app-template "$SCRATCH/app"` and `cp
   "$SCRATCH/app/.github/workflows/build-thesis.yml" .github/workflows/`. R package:
   `cp "$SCRATCH/rpkg/.github/workflows/build-thesis.yml"` (the step 1 clone) over the
   package's. In words: content-only, this
   template's `.github/workflows/build-thesis.yml` from
   `dataimago/dissertation-app-template` (an unmigrated repo's own copy is the old
   one); R package, the package's
   `.github/workflows/build-thesis.yml` from `dataimago/dissertation-rpkg-template`
   (it has the R setup; never copy this repo's workflow into the package). Also
   copy `THESIS-CLS-README.md` from the template's `ui/www/`, so the old
   class-per-institution README does not stay beside the house class.
5. Delete `thesis.cls` and `dataimago.sty` (named in the agreement; the working tree
   changes, and you show the author the `git` commands, never running `git add`,
   `commit`, `push` or `gh pr create`).
6. Render until the PDF builds.

`classFile.path` in the spec names the old file; leave it unless the author
asks. It is not read by the build.

## Common build failures (from the dissertation-ai alpha, 2026-06-24)

The visible CI error is often just `Emergency stop` — dump the `.log`
(`tail -120 <chapters dir>/index.log`) or render locally (`quarto render --to pdf`)
to see the real `! LaTeX Error`.

- **`dataimago-thesis.cls` or `<id>.cfg` not found** — `_environment` is missing
  or the folder was copied piecemeal. The class is in `thesis-class/` and the
  compiled profile in `profiles/`; `_environment` puts both on `TEXINPUTS`.
  To repair, first run `python3 <book folder>/thesis-class/sync.py check` and show the
  author the files it reports, then, after a yes, `python3 <book folder>/thesis-class/sync.py sync`
  (no `--ref`, no `--profile`). It rewrites only the class files and the registry
  profiles listed in `registry-source.json`, at the commit recorded there; it deletes
  nothing, and a profile the author wrote (not in that list) is never touched. `--profile <id>` is only for an explicit shipped setup or update (step 5). A newer registry is an update, not a repair: send the author to "Setting up a shipped profile" step 5 and wait for a yes.
- **`Profile ... not found` / `no profile file <id>.cfg`** — `thesis.profile` names
  a profile with no compiled `.cfg`. Compile it:
  `texlua <book folder>/thesis-class/thesis-profile.lua <book folder>/profiles <id>`.
- **`The ... is missing` naming a `thesis.*` key** — a required title-page field
  (`thesis.degree.name`, `department`, `institution`, `advisors`, `committee`) or
  `abstract:` is empty. Fill it in `_quarto.yml` / `index.qmd`.
- **Equations come out in Latin Modern Math** — no error, just the wrong font
  (`pdffonts docs/thesis.pdf` lists `LatinModernMath`). The profile's math font
  (TeX Gyre Termes Math) was not found, or has no OpenType MATH table.
  `build-thesis.yml` installs TeX Live with TeX Gyre, and its last step
  (`thesis-class/check-pdf-fonts.sh`) fails the run on this fallback.
- **A warning that `mainfont`, `geometry`, `fontsize`, ... "is ignored"** — the
  profile owns those; change the named profile field instead.
- **`Emergency stop … no legal \end found`, last package loaded is the .sty** —
  (a `vendored` class's support `.sty`) pulled in via Quarto `include-in-header:` file injection,
  which inlines the file's `\endinput` and truncates `index.tex`. Load it as a
  package instead: `include-in-header: { text: "\\usepackage{<pkg>}" }`.
- **`Environment abstract undefined`** — in a `vendored` class: `\renewenvironment{abstract}` on a class
  that `\LoadClass{book}`. Use `\newenvironment`, or base on `report`.
- **`Option clash for package geometry`** — in a `vendored` class: it loads `geometry` and the
  Quarto `geometry:` key reloads it. Drop one. (The house class drops the key itself.)
- **`validation failed … book:bibliography / book:csl`** — `bibliography`/`csl`
  are top-level keys, not `book:` children; a referenced `*.csl` must exist.
- **`Book contents must include a home page`** — list `index.qmd` first.
- **`git add docs/thesis.pdf` fails ("ignored by .gitignore")** — force the one
  artifact: `git add -f docs/thesis.pdf`.

## Guardrails
- Only class machinery and profiles may be contributed back to the registry,
  only with consent — never the manuscript prose.
- Never hand-edit the vendored class files (`python3 <book folder>/thesis-class/sync.py check`
  lists differences from the registry); institution rules go in a profile.
- Build from committed files only; do not make `build-thesis.yml` fetch from the
  registry.
- If `raw/manuscript/LOCKED.md` exists, the chapters are v1.0 of a finished work:
  fix the build, never rewrite the text.
