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
2. **Decide which job this is before doing anything.** A build or a log
   diagnosis (the usual "build my thesis") builds from the committed files: it
   never fetches from the registry, never runs `sync.py sync --ref main`, never
   edits `profile:` in `_quarto.yml`, and never starts `thesis-format`. For
   `shipped`, if `<book folder>/thesis-class/registry-source.json` exists and
   `thesis.profile` already names the shipped profile, just build; if not, tell the
   author the shipped profile is not set up yet, offer "Setting up a shipped
   profile", and go on only after a yes. For `generated`, build the profile
   `_quarto.yml` names (`house` until the author adapts one); offer
   `thesis-format` only if the author asked to adapt their guide, and run it after
   a yes. Setup, update and adapting a guide happen only on the author's explicit
   request.
3. Build via `build-thesis.yml` (Quarto + LuaLaTeX, tagged PDF; XeLaTeX is
   supported but untagged). Chapters: `thesis/chapters/` (content-only) or the R
   package's `ui/www/chapters/`. For deep diagnosis or profile drafting, hand
   off to the `thesis-build-agent`.
4. Verify against the institution checklist (margins, front matter, ToC, captions).

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

Only on the author's explicit request, or after their yes to the offer in step 2
of "Steps" above. A routine build never runs these steps.

1. **Find the institution.** Read `vertical.dissertation.institution.name` from
   `dataimago-spec.yaml`.
2. **Check the layout first.** The book folder is `thesis/` for content-only, or
   the R package's `ui/www/`. **If `<book folder>/thesis-class/sync.py` does not
   exist, stop here:** the book is on the older layout (`thesis.cls`,
   `documentclass: thesis`, no `thesis:` block, and possibly
   `classFile.type: shipped` in the old wording), and the steps below would rewrite
   `_quarto.yml` into a shape its class cannot read. Run none of steps 3–10. Offer
   "Moving an older repository to the house class" below and wait for the author's
   yes; set up the profile after the move.
3. **Look it up in the registry.** Fetch
   `https://raw.githubusercontent.com/dataimago/dissertation-thesis-classes/main/registry.json`.
   Check `schemaVersion`: this skill reads version 2. If it is anything else,
   stop and tell the author this skill needs updating; do not guess. In
   `profiles`, find the entry whose `institution` is that name (ignore case)
   and whose `mode` is `shipped` and `status` is `available`. Never pick the
   profile with id `house`. If the spec names the institution differently (say,
   "CU Boulder" for "University of Colorado Boulder"), ask the author to
   confirm the match before you use it.
4. **No match? Say so and offer `generated`.** Tell the author plainly: "The
   thesis-class registry has no ready-made profile for <institution> yet." Offer
   `generated` instead: with their agreement, set `classFile.type: generated`
   and adapt the `house` profile with the `thesis-format` skill. Never borrow
   another institution's profile. (A repo set up before 2026-11-07 may say
   `shipped` for the framework's old default class; that was the old wording,
   and under today's wording it is `generated`.)
5. **Resolve the class.** The matched profile's `class` is an `id` in the
   registry's `classes` (today `dataimago-thesis`; it must be `available`). The
   class's `path` and `companions` (under `classes/<class>/`) are the class
   bundle; the profile's `cfg` and `yaml` (under `profiles/`) are the other half.
   They live in different directories of the registry; fetch both.
6. **Fetch them.** Run
   `python3 <book folder>/thesis-class/sync.py sync --ref main --profile <id>`
   from the repository root. It fetches the
   class `path` and every `companions` file into `thesis-class/` and the
   profile's `yaml` and `cfg` into `profiles/`, all from one registry commit,
   and records that commit in `thesis-class/registry-source.json`. Do not copy
   files by hand: a partial copy is the usual cause of a build that finds
   the class but not the profile.
7. **Point the book at it.** In `_quarto.yml`, under the existing `thesis:` block, change `profile: house` to `profile: <id>` and
   check `format: pdf:` against the class entry: `documentclass`
   (`dataimago-thesis`), and `pdf-engine` (the entry's `engine`, `lualatex`;
   `engineFallback` is `xelatex`, untagged). The profile's `classOptions` is
   `profile=<id>`; `thesis.profile` already sends it, so do not repeat it under
   `classoption`. Fill only the **empty** keys of the `thesis:` block (institution, degree,
   department, advisors, committee): the manuscript's own title page first, the
   spec where the manuscript is silent, and ask the author for what neither gives.
   Keep every value already there; to change a non-empty one, show the change and
   ask first.
8. **Read what the profile does not say.** Open `profiles/<id>.yaml`. Fields the
   institution's guide does not state are listed under `unstated` and keep the
   house value, and `sources` cites the rest. Tell the author what is unstated;
   never say the guide is fully met without reading both lists.
9. **Check the PDF.** Render locally (`quarto render --to pdf` in the book
   folder; it needs a current TeX Live with TeX Gyre, `luamml`, `tagpdf`,
   `latex-lab`) until the PDF builds. Check it against the profile's `sources`
   (what the guide states) and show the author the `unstated` list from step 8.
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
10. **Prepare the commit.** Edit the working tree only; never run `git add`, `commit`, `push` or `gh pr create` yourself. Show the author how to commit `thesis-class/`, `profiles/` and `_quarto.yml`
   on a branch and propose them as a pull request: in this repository for
   content-only (`thesis/...` paths); in the R-package layout, first in the
   package's own repository and then the submodule-pointer pull request here, with
   the same commands as `thesis-format` Step 6 (`git -C packages/r-packages/<name> ...`,
   then the pointer). Ask before touching the package repository. Either way, naming the profile `id`, the
   class `version` and the registry commit in the message. Do not push or open the
   pull request yourself: show the author the commands. The committed files are the
   author's pinned copy: `build-thesis.yml` builds from them and never fetches from
   the registry, so a later change there cannot change the author's PDF. Update the
   copy only when the author asks, by repeating step 6.

## Building a `generated` profile

`generated` does not mean writing or adapting a class. The `house` profile is
the starting point. **Check the layout first**, as in "Setting up a shipped profile"
step 2: if `<book folder>/thesis-class/sync.py` does not exist, the book is on the
older layout (`thesis.cls`, no `thesis:` block), the profile cannot be used yet,
and nothing below applies. Build the book as it is, offer "Moving an older
repository to the house class" and wait for a yes; never add a `thesis:` block or
change `documentclass` without that move. On the house class, a build uses the
profile `_quarto.yml` names; adapting a guide is a separate job, only when the
author asks (or says yes when you offer it). Then run the `thesis-format` skill:
it writes a new
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
the class documents required options; set `thesis.classFile.type: vendored` and `path` to the `.cls` file name (it sits beside `_quarto.yml`)
in `dataimago-spec.yaml`; then remove `_environment`, `thesis-class/` and `profiles/`.
Nothing is deleted before the yes, and in the R-package layout ask before touching the
package.

## Moving an older repository to the house class

A repository set up before the house class has `thesis.cls`, `dataimago.sty`,
`documentclass: thesis` and `pdf-engine: xelatex` in `_quarto.yml`, and a
`build-thesis.yml` that installs Noto fonts. The move is for books that used the
old default `thesis.cls` (`shipped` in the old wording, or `generated`), not for
`vendored` ones: a vendored author keeps their class and does not move. The book
folder is `thesis/` for content-only, or
`packages/r-packages/<source.rPackage.name>/<quartoRoot>/` (`ui/www/` by default)
for an R package. The move is one pull request (two in the R-package layout: the
package, then the submodule pointer here).

1. **Propose the whole move and wait for a yes.** Change nothing before it. Show
   the author, in one message:
   - the public repositories you will clone into a temporary folder:
     `dataimago/dissertation-rpkg-template`, and for content-only also
     `dataimago/dissertation-app-template` (for its `build-thesis.yml`);
   - what you will copy into the book folder: `thesis-class/`, `_environment`,
     `THESIS-CLS-README.md` (replacing the old one), and `profiles/` merged in
     without overwriting any profile already there;
   - every `_quarto.yml` change: `documentclass: thesis` becomes
     `dataimago-thesis`, `pdf-engine: xelatex` becomes `lualatex`; add the
     template's `lang`, `template-partials` and `filters`; remove `mainfont`,
     `sansfont`, `mathfont`, `classoption` and the `\usepackage{dataimago}`
     header (the profile owns those); add a `thesis:` block with the values you
     propose and their sources (the manuscript's title page first, then the
     spec; ask for what neither gives), and `profile:` set to the author's own
     profile if `profiles/` holds one other than `house`, otherwise `house`; and
     add `chapters/00-front-matter.qmd` to `chapters:` right after `index.qmd` if
     it is not listed. Keep the book's own `output-dir` (`../docs` for
     content-only; the template's `../../docs` is the R package's);
   - each front-matter move: the abstract into `index.qmd`'s `abstract:`, and
     acknowledgments and dedication into `.acknowledgments` / `.dedication` divs
     in `chapters/00-front-matter.qmd` (created if it does not exist);
   - the workflow replaced, and, last, `thesis.cls` and `dataimago.sty` deleted;
   - in the R-package layout, that all of this happens in the package's own
     repository.

   If `raw/manuscript/LOCKED.md` exists, also show each front-matter move against
   the locked manuscript and wait for that confirmation too.
2. **Copy the bundle.** From the repository root (it changes no directory and
   stops if a template file is missing):
   ```sh
   SCRATCH="$(mktemp -d)"
   git clone --depth 1 https://github.com/dataimago/dissertation-rpkg-template "$SCRATCH/rpkg"
   W="$SCRATCH/rpkg/ui/www"
   BOOK=<book folder>
   for f in thesis-class profiles _environment THESIS-CLS-README.md; do
     [ -e "$W/$f" ] || { echo "missing in the template: $f (stop and tell the author)"; exit 1; }
   done
   cp -a "$W/thesis-class" "$W/_environment" "$W/THESIS-CLS-README.md" "$BOOK/"
   mkdir -p "$BOOK/profiles"
   for f in "$W"/profiles/*; do              # never over a profile already there
     [ -e "$BOOK/profiles/${f##*/}" ] || cp -a "$f" "$BOOK/profiles/"
   done
   ```
3. **Edit `_quarto.yml`** exactly as agreed in step 1. The `format: pdf:` keys
   listed there are replaced (that is the move); the `thesis:` values are the
   ones the author agreed to.
4. **Move the front matter** as agreed: create `chapters/00-front-matter.qmd` if it
   does not exist and list it in `chapters:`. The words stay the author's; move,
   do not edit. An `index.qmd` landing text that should not print goes inside
   `::: {.content-visible when-format="html"}`.
5. **Replace `build-thesis.yml`.** This step stands on its own (a fresh clone, so
   it does not depend on step 2's shell). From the repository root, content-only
   (this repository's workflow):
   ```sh
   S="$(mktemp -d)"
   git clone --depth 1 https://github.com/dataimago/dissertation-app-template "$S/app"
   [ -f "$S/app/.github/workflows/build-thesis.yml" ] || { echo "missing in the template: build-thesis.yml (stop and tell the author)"; exit 1; }
   cp "$S/app/.github/workflows/build-thesis.yml" .github/workflows/build-thesis.yml
   ```
   R package (the package's own workflow, which has the R setup; never this
   repository's):
   ```sh
   S="$(mktemp -d)"
   git clone --depth 1 https://github.com/dataimago/dissertation-rpkg-template "$S/rpkg"
   [ -f "$S/rpkg/.github/workflows/build-thesis.yml" ] || { echo "missing in the template: build-thesis.yml (stop and tell the author)"; exit 1; }
   cp "$S/rpkg/.github/workflows/build-thesis.yml" packages/r-packages/<source.rPackage.name>/.github/workflows/build-thesis.yml
   ```
   Do not skip it: a house-class book with the old workflow does not build.
6. **Delete the old class, last, and only once the book points at the new one:**
   ```sh
   grep -q '^ *documentclass: *dataimago-thesis' "$BOOK/_quarto.yml" \
     && rm "$BOOK/thesis.cls" "$BOOK/dataimago.sty" \
     || echo "documentclass is not dataimago-thesis yet: thesis.cls kept"
   ```
7. **Render** until the PDF builds (`quarto render --to pdf` in the book folder),
   then prepare the commit: show the author the `git` commands, never running
   `git add`, `commit`, `push` or `gh pr create`. Content-only: one branch and pull
   request here. R package: first in the package's repository, then the
   submodule-pointer pull request here, with the commands of `thesis-format`
   Step 6.

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
  nothing, and a profile the author wrote (not in that list) is never touched. `--profile <id>` is only for an explicit shipped setup or update (step 6). A newer registry is an update, not a repair: send the author to "Setting up a shipped profile" step 6 and wait for a yes.
- **`Profile ... not found` / `no profile file <id>.cfg`** — `thesis.profile` names
  a profile with no compiled `.cfg`. Compile it:
  `texlua <book folder>/thesis-class/thesis-profile.lua <book folder>/profiles <id>`.
- **`The ... is missing` naming a `thesis.*` key** — a required title-page field
  (`thesis.degree.name`, `department`, `institution`, `advisors`, `committee`) or
  `abstract:` is empty. Fill it by the rules of "Setting up a shipped profile" step 7:
  from the manuscript's own title page and abstract first, then the spec, and ask the
  author for anything neither gives. Never invent a value or an abstract. Moving the
  abstract text into `index.qmd` is a move: name it and wait for a yes (and again
  under `raw/manuscript/LOCKED.md`).
- **Equations come out in Latin Modern Math** — no error, just the wrong font
  (`pdffonts docs/thesis.pdf` lists `LatinModernMath`). The profile's math font
  (TeX Gyre Termes Math) was not found, or has no OpenType MATH table.
  `build-thesis.yml` installs TeX Live with TeX Gyre, and its last step
  (`thesis-class/check-pdf-fonts.sh`) fails the run on this fallback.
- **A warning that `mainfont`, `geometry`, `fontsize`, ... "is ignored"** — the
  profile owns those, so the `_quarto.yml` key has no effect. Propose removing that
  key from `_quarto.yml` and do it after a yes; the build is unchanged either way.
  Do not edit the profile to clear the warning: a `shipped` profile is used as-is,
  and changing an author's `generated` profile is `thesis-format`'s job, offered
  and run only after a yes.
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
