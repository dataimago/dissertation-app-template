# {{thesis.workingTitle}}

> Your AI-native dissertation environment, set up for you by [dissertation.ai](https://dissertation.ai).

This repository is your dissertation's home: where you write your chapters, where the PDF is built, and a structured summary of your project (`dataimago-spec.yaml` — a plain-text file you can read and edit any time).

## Start here

**1. Get a copy on your computer.**

```sh
git clone --recursive https://github.com/{{user.githubUsername}}/{{metadata.name}}.git
cd {{metadata.name}}
```

The `--recursive` flag also pulls in the linked R package that holds your chapters. *If your dissertation has no R package, you can clone normally (without `--recursive`) — your chapters live right here in `thesis/` instead (see step 3).*

**2. Install what you need to build the PDF locally.** You only need these to preview/build the thesis on your own machine (you can also just push and let the build run for you — step 5):

- [Quarto](https://quarto.org/docs/get-started/) — the document engine.
- [TinyTeX](https://yihui.org/tinytex/) for the LaTeX/PDF step: `quarto install tinytex`.
- The fonts the default thesis class uses — the **Noto Sans** family (Noto Sans, Noto Sans Math). Install them from your OS font manager if a build complains a font is missing.
- **R** *only if your dissertation includes an R package* (the no-R path needs none).

**3. Find where your writing lives.** Each chapter is one file.

- **If you have an R package** (most computational dissertations): your manuscript travels with it as a linked sub-repository (Git calls this a *submodule*). Chapters are at `packages/r-packages/{{rPackage.name}}/ui/www/chapters/*.qmd`.
- **If you don't** (a content-only dissertation): your manuscript lives right here, at `thesis/chapters/*.qmd`. No submodule.

**4. Write + preview.** Edit a chapter, then from the directory that holds `_quarto.yml` (your R package's `ui/www/`, or `thesis/`):

```sh
quarto preview        # live HTML preview while you write
quarto render --to pdf   # build the PDF locally
```

**5. Commit + push.** A GitHub Actions workflow (`build-thesis.yml`) rebuilds the PDF on every push that changes your chapters. The built PDF is committed to **`docs/thesis.pdf`** and linked from this app's landing page.

### The submodule mental model (R-package dissertations only)

Your R package is its *own* Git repository; this dissertation repo merely **points** at a specific commit of it. So: edit + commit your chapters **inside the package** (`packages/r-packages/{{rPackage.name}}/`), then come back here and commit the updated pointer. `git clone --recursive` and `git submodule update --init --recursive` keep the two in step. (Content-only dissertations have none of this — everything is in this one repo.)

### Common problems

- **`packages/r-packages/.../` is empty after cloning** — you cloned without `--recursive`. Run `git submodule update --init --recursive`.
- **`tlmgr: command not found` or a missing-font error when building** — see step 2 (install TinyTeX + the Noto fonts).
- **The PDF didn't rebuild after a push** — check the **Actions** tab; the build only fires on pushes that touch your chapters (`ui/www/**` for R-package dissertations, `thesis/**` for content-only ones).

## Editing your dissertation

| What you want to change | Where |
|---|---|
Paths below are shown for the **R-package** layout. For a **content-only** dissertation, drop the `packages/r-packages/{{rPackage.name}}/ui/www/` prefix and read `thesis/` instead (e.g. `thesis/chapters/*.qmd`, `thesis/references.bib`, `thesis/thesis.cls`).

| What you want to change | Where (R-package layout) |
|---|---|
| Thesis chapter content | `packages/r-packages/{{rPackage.name}}/ui/www/chapters/*.qmd` |
| Bibliography | `packages/r-packages/{{rPackage.name}}/ui/www/references.bib` |
| Thesis class file (formatting) | `packages/r-packages/{{rPackage.name}}/ui/www/thesis.cls` (or see `THESIS-CLS-README.md`) |
| Methodology R code | `packages/r-packages/{{rPackage.name}}/R/` (R-package dissertations only) |
| App landing page | `src/app/page.tsx` |
| Dissertation metadata (title, committee, ...) | `dataimago-spec.yaml` |

After editing `dataimago-spec.yaml`, push to `main`; an automated step keeps the generated files in sync.

## Adding committee members + advisor

Edit `dataimago-spec.yaml`'s `vertical.dissertation.advisors` block. The generator updates the signature page template + README.

## Additional information (fill in over time)

Your `dataimago-spec.yaml` accommodates several optional fields the onboarding interview deliberately didn't ask about. They're real dissertation concerns — they affect your title page, signature page, README, and front matter — but they're not what you should be initially burdened with looking up. **Fill them in by editing `dataimago-spec.yaml` directly as they become relevant.** AI assistance in your editor can help.

| Spec field | When it matters |
|---|---|
| `institution.submissionDeadline` | When your defense date solidifies — affects timeline-aware AI suggestions |
| `institution.archiveUrl` | The institutional dissertation library URL where you'll finally deposit |
| `institution.administratorContact` | The person to email for procedural questions |
| `thesis.embargo` | If you plan to embargo (e.g., during a journal publication window) |
| `thesis.coauthors` | If your dissertation is multi-authored |
| `thesis.classFile.guidelinesDocuments` | If your institution publishes a format guide |
| `compliance.irb` | If your work needs IRB approval — number goes on the title page at many institutions |
| `compliance.dua` | If you have data-use agreements that restrict what you can commit publicly |
| `funding` | If you have grant or fellowship support to acknowledge |

The principle: the `dataimago-spec.yaml` is the complete representation of your dissertation; the interview asked only for the essentials. Add structured logistical data over time as it becomes settled.

## Framework links

- [dissertation.ai](https://dissertation.ai) — the Level-2 hub that provisioned this repo
- [dataimago-rpkg](https://github.com/dataimago/dataimago-rpkg) — the R generator package
- [dataimago-design](https://github.com/dataimago/dataimago-design) — the design system + wiki

## License

MIT
