# {{thesis.workingTitle}}

> Your AI-native dissertation environment, set up for you by [dissertation.ai](https://dissertation-ai.dataimago.ai).

This repository is your dissertation's home: where you write your chapters, where the PDF is built, and a structured summary of your project (`dataimago-spec.yaml` — a plain-text file you can read and edit any time).

## Start here

**1. Get a copy on your computer.**

```sh
git clone --recursive https://github.com/{{user.githubUsername}}/{{metadata.name}}.git
cd {{metadata.name}}
```

The `--recursive` flag also pulls in your linked R package (with a new R package, that is where your chapters are). *If your dissertation has no R package, you can clone normally (without `--recursive`) — your chapters live right here in `thesis/` instead (see step 3).*

**2. Install what you need to build the PDF locally.** You only need these to preview/build the thesis on your own machine (you can also just push and let the build run for you — step 5):

- [Quarto](https://quarto.org/docs/get-started/) — the document engine. Use the version the build pins (`version:` in `.github/workflows/build-thesis.yml`, 1.11.9 at the time of writing; older releases are on [Quarto's download page](https://quarto.org/docs/download/prerelease.html) and its GitHub releases), so your local PDF matches the one GitHub builds.
- A current **TeX Live** (2026 or newer) for the LaTeX/PDF step, with the TeX Gyre fonts, `luamml`, `tagpdf` and `latex-lab`: for example [MacTeX](https://tug.org/mactex/) or Homebrew's `texlive` on a Mac, or TeX Live from [tug.org](https://tug.org/texlive/). The thesis is built with LuaLaTeX and comes out as a tagged (accessible) PDF. TinyTeX (`quarto install tinytex`, which earlier versions of this README suggested) is not enough for the house class: use a current TeX Live, or just push and let GitHub build. After installing it, run `tlmgr install tex-gyre tex-gyre-math luamml tagpdf latex-lab latexmk selnolig xurl bookmark pdflscape caption unicode-math fontspec setspace framed footnotehyper booktabs fancyvrb float xcolor colorprofiles tcolorbox fontawesome5 pgf` (from a terminal; on a system install it needs `sudo`; it is the build's own list, and a full MacTeX already has most of it). Or skip this and just push: the build runs on GitHub.
- The fonts: the house thesis class sets the thesis in **TeX Gyre** (a Times-style family that comes with TeX Live), so there is nothing to install separately. If a build complains a font is missing, your TeX Live lacks `tex-gyre` and `tex-gyre-math`.
- **R** *only if dissertation.ai created a new R package for you* (the `thesis/` build here needs none).

**3. Build your knowledge base — the first thing to do in a fresh clone.** Open this folder with your AI. In Claude Code, run **`/ingest`**; in any other tool (Codex, opencode, Cursor, ChatGPT with folder access), ask it: *"Read `.claude/skills/ingest/SKILL.md` and follow it."* Either way it is the same procedure. It reads everything under `raw/` and builds `wiki/` from it: one page per source, the synthesis pages, and a report of what it read, what it inferred, and what is still missing. The AI in this repository works *from* that knowledge base; nothing else here depends on it being clever in a single conversation.

- **Brought a finished dissertation, a folder of code, reports, data?** If it might contain anything private (names, addresses, identifiers), check this repository's visibility **first** (it is shown beside the repository's name on GitHub); if it does not say "Private", make it private (Settings → General → Danger Zone → Change visibility). Then copy all of it into `raw/inbox/` — as it is, no sorting; the inbox is gitignored, so nothing is committed until `/ingest` has sorted it — and run `/ingest`. It sorts everything, keeps anything private out of git (`raw/private/`, and it will tell you if it found any), and writes `raw/MANIFEST.md`. Then run **`/import-manuscript`**: it turns your dissertation's sources (`.tex`, `.Rnw`, `.docx`; PDF as a last resort) into editable chapters, as **version 1.0** — the originals in `raw/manuscript/` stay locked and untouched.
- **Started fresh at dissertation.ai?** The documents you attached are already under `raw/`; `/ingest` does the rest.

**4. Find where your writing lives.** Each chapter is one file.

- **If dissertation.ai created a new R package for you**: your manuscript travels with it as a linked sub-repository (Git calls this a *submodule*). Chapters are at `packages/r-packages/<your package>/ui/www/chapters/*.qmd` — the package's name is `source.rPackage.name` in `dataimago-spec.yaml`.
- **Otherwise** (an existing R package you connected, a content-only dissertation, or one whose existing repository is referenced rather than linked): your manuscript lives right here, at `thesis/chapters/*.qmd`. An existing R package is linked at `packages/r-packages/<your package>/` but never written in: cite it from your chapters. The `thesis/` build has no R, so a chapter there shows code as a listing rather than running it.

`dataimago-spec.yaml` records which of these is yours, under `source.quartoHome`. If it does not, this repository was set up before the dissertation.ai beta: the landing page and your AI assistant say so, and the fix is a new repository from dissertation.ai.

**5. Write + preview.** Edit a chapter, then from the directory that holds `_quarto.yml` (your new R package's `ui/www/`, or `thesis/`):

```sh
quarto preview        # live HTML preview while you write
quarto render --to pdf   # build the PDF locally
```

**6. Commit + push.** A GitHub Actions workflow (`build-thesis.yml`) rebuilds the PDF on every push that changes your chapters: this repository's for `thesis/`, the new R package's own for its `ui/www/`. The built PDF is committed to **`docs/thesis.pdf`** in the manuscript repo and linked from this app's landing page, alongside the GitHub Pages methodology site (a new R package only). While the manuscript repository is private, the landing page leaves out the links your readers could not open; see "While your repositories are private" below.

### The submodule mental model (R-package dissertations only)

Your R package is its *own* Git repository; this dissertation repo merely **points** at a specific commit of it. With a new R package, edit + commit your chapters **inside the package** (`packages/r-packages/<your package>/`), then come back here and commit the updated pointer. With an existing R package you connected, your chapters are in `thesis/` here and the package is only pointed at; commit a new pointer when you want this repository to follow a newer version of it. `git clone --recursive` and `git submodule update --init --recursive` keep the two in step. (Content-only dissertations have none of this — everything is in this one repo.)

### Common problems

- **`packages/r-packages/.../` is empty after cloning** — you cloned without `--recursive`. Run `git submodule update --init --recursive`.
- **Cloning asks you to sign in, or says the repository was not found** — a private repository can be cloned only by someone signed in to GitHub with access to it, and GitHub answers "not found" to anyone else. Sign in first (`gh auth login` with the [GitHub CLI](https://cli.github.com) is the shortest way), then clone again. A private R package is a second private repository: `--recursive` needs your account to have access to both.
- **A missing-font or missing-class error when building** — see step 2 (a current TeX Live with the TeX Gyre fonts; TinyTeX is not enough). On the house class (`documentclass: dataimago-thesis` in `_quarto.yml`), check that the folder holding `_quarto.yml` (`ui/www/` or `thesis/`) still has `thesis-class/`, `profiles/` (with the `.cfg` of the profile `_quarto.yml` names) and `_environment`. On your own class (`vendored`), check that the `.cls` sits beside `_quarto.yml` and that `documentclass` is its file name without `.cls`.
- **The PDF didn't rebuild after a push** — check the **Actions** tab; the build only fires on pushes that touch your chapters (`ui/www/**` in a new R package, `thesis/**` here otherwise).

## Editing your dissertation

`<chapters>` below is `packages/r-packages/<your package>/ui/www/` when dissertation.ai created a new R package for you, and `thesis/` otherwise (an existing R package you connected included).

| What you want to change | Where |
|---|---|
| Thesis chapter content | `<chapters>/chapters/*.qmd` |
| Bibliography | `<chapters>/references.bib` |
| Thesis formatting (margins, fonts, spacing, front pages) | a profile in `<chapters>/profiles/` (see `THESIS-CLS-README.md`); the class in `<chapters>/thesis-class/` is copied from the registry, not edited |
| Title page details (degree, department, committee) | the `thesis:` block in `<chapters>/_quarto.yml` |
| Methodology R code | `packages/r-packages/<your package>/R/` (R-package dissertations only) |
| Your sources and materials | `raw/` — then run `/ingest` |
| Your knowledge base | `wiki/` — the AI maintains it from `raw/`; you own it (see `KNOWLEDGE.md`) |
| App landing page | `src/app/page.tsx` |
| Dissertation metadata (title, research question, ...) | `dataimago-spec.yaml` |

After editing `dataimago-spec.yaml`, push to `main`; an automated step keeps the generated files in sync.

**Your institution's thesis format.** `thesis.classFile.type` in `dataimago-spec.yaml` records the choice you made at setup:

- **`shipped`**: the registry has a profile for your institution, and you use it as-is. The registry is the [dataimago thesis-class registry](https://github.com/dataimago/dissertation-thesis-classes): one house class plus a small profile of formatting rules per institution. Ask your AI assistant to "set up my institution's thesis profile". It copies the class and your institution's profile into your repository, so your PDF builds from files you can see, and they stay the same until you ask to update them.
- **`vendored`**: you provide your institution's own class file. Put it beside `<chapters>/_quarto.yml`, set `documentclass` to its file name without `.cls` there, and drop the house `template-partials`, `filters` and `thesis:` block (ask your AI assistant: *"switch my thesis to my own class"*; `thesis-build` lists the changes and waits for your yes).
- **`generated`** (the default): you start from the registry's `house` profile and adapt it to your institution's formatting guidelines. Put the guidelines in `raw/thesis-formatting/`, and your AI assistant does the adapting with you (`/thesis-format`).

`<chapters>/THESIS-CLS-README.md` says more about each one.

**Turn your formatting guide into a profile.** In Claude Code, run **`/thesis-format`**; in any other tool, ask it: *"Read `.claude/skills/thesis-format/SKILL.md` and follow it."* It reads the guide in `raw/thesis-formatting/` and fills in a profile for the registry's house thesis class (`dataimago-thesis`), starting from the `house` profile: each value cited to the guide's page or section, and what the guide does not say listed as unstated, never guessed. It checks the profile, builds the registry's sample book with it and saves the profile next to your chapters (`<chapters>/profiles/<id>.yaml`, and its compiled `<id>.cfg`, which the PDF build reads); you confirm every value against the guide. To make your own PDF follow it, change `profile:` to `<id>` in the `thesis:` block of `<chapters>/_quarto.yml` (`/thesis-build` helps). A repository set up before the house class has no `thesis:` block yet: `/thesis-build` first proposes moving it to the house class, and the profile is used after that. You can then choose to offer the profile to the registry, so other authors at your institution can use it; that is optional and happens only with your explicit consent. To make this repository's own PDF match a profile the registry already has, use `/thesis-build`; "my school isn't in the registry" is the `generated` mode.

## Adding committee members + advisor

With the house thesis class, the names on the committee page come from the `thesis:` block in `<chapters>/_quarto.yml`: your chair under `advisors:`, the other members under `committee:`. dissertation.ai filled it in from your interview answers. Edit the names there, then commit and push the repository that holds that file: when dissertation.ai created a new R package for you, that is the package (then commit the updated submodule pointer here); otherwise this one. `dataimago-spec.yaml`'s `advisors` block keeps a record of your interview answers; changing it does not change the names in the PDF. A `vendored` class has no `thesis:` block (do not add one): the names are set the way that class asks, so open the class file beside `<chapters>/_quarto.yml` (the `.cls` whose name, without `.cls`, is `documentclass` there) and use the entries it defines.

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

- [dissertation.ai](https://dissertation-ai.dataimago.ai) — the hub that provisioned this repo (start a new dissertation there)
- [dataimago](https://github.com/dataimago/dataimago) — the framework this environment is built on
- [dissertation-app-template](https://github.com/dataimago/dissertation-app-template) — the template this repo was made from

## License

MIT

## Deployment (optional)

Everything in this section puts something on the public web. A private
repository keeps your files private; it does not make a website built from
them private. Read "While your repositories are private" below before turning
any of it on.

- **GitHub Pages (a new R package):** the R package repo publishes the
  thesis HTML book + PDF + package reference via its `quarto-publish.yml`.
  Enable Pages once (repo Settings → Pages → Source: GitHub Actions) if the
  provisioning flow hasn't already.
- **Knowledge base (GitHub Pages, this repo):** once `/ingest` has seeded
  `wiki/`, `wiki-publish.yml` publishes it —
  theory and methods pages, the claim ledger, and the experiment registry — at
  `https://<you>.github.io/<this-repo>/`. Enable Pages once
  (Settings → Pages → Source: GitHub Actions) if onboarding hasn't. While this
  repository is private the workflow builds and publishes nothing, and says so
  in its run summary.
- **Vercel (this app, optional):** import this repo at
  [vercel.com/new/import](https://vercel.com/new/import) — Next.js is
  auto-detected, no configuration needed; pushes then deploy automatically.
  A Vercel deployment is public even when this repository is private: anyone
  with the address sees the landing page, which shows your title, your name,
  your institution and your chapter list.
  The landing page reads `dataimago-spec.yaml` at build time, so redeploys
  pick up spec edits. **Vercel is one host among several** — this is a
  standard Next.js app and runs anywhere Next.js runs (Netlify,
  self-hosting, `npm run dev` locally); GitHub is the only requirement.
  `vercel-deploy.yml` offers an opt-in CI-driven alternative whose
  credentials live only in YOUR repo secrets.
- After your first `npm install`, commit the generated `package-lock.json`
  for reproducible installs.

### While your repositories are private

A private repository is visible only to you and the people you invite
(Settings → Collaborators). Five things follow from that.

- **GitHub Pages needs a public repository on GitHub's free plan.** A private
  repository can have a Pages site only on a paid plan (GitHub Pro, Team or
  Enterprise).
- **A Pages site is public even when its repository is private.** Anyone with
  the address can read it. For that reason `wiki-publish.yml` publishes nothing
  from a private repository unless you opt in. To publish the knowledge base,
  either make this repository public (Settings → General → Danger Zone → Change
  visibility), or, on a paid plan, add a repository variable named
  `PUBLISH_PAGES_FROM_PRIVATE` with the value `true` (Settings → Secrets and
  variables → Actions → Variables). The value must be exactly `true`.
- **Making a repository private does not undo publishing.** On a paid plan, a
  site that is already published stays on the public web after you switch the
  repository to private: unpublish it yourself (Settings → Pages). The switch
  does not clear `PUBLISH_PAGES_FROM_PRIVATE` either, so if you set it, the next
  push publishes again until you delete the variable.
- **The landing page leaves out links your readers cannot open.** When the
  app is built, `src/app/page.tsx` asks each link it would print ("Thesis
  PDF", "direct download", "Methodology & package site"), signed out, whether
  it opens (`src/lib/read-links.ts`). A link in a private repository answers
  "not found", so it is left out; when no PDF link is left, the page says the
  PDF is in a private repository instead. A link in a public repository that
  is not built yet stays: it starts working after the first build. A package
  site published from a private repository (a paid plan with the opt-in) is
  public, so it stays. Nothing is asked with a token, and no GitHub API is
  used. If the build cannot reach GitHub, every link is shown, as before. The
  answer is as of the build: after you change a repository's visibility,
  redeploy the app (push any change to this repository) to update the page.
- **A private R package needs a token for one workflow.** `generate.yml` reads
  your R package's source, and the token GitHub gives a workflow reads only its
  own repository. Create a fine-grained personal access token with
  "Contents: read" on the package repository (your GitHub Settings → Developer
  settings → Personal access tokens → Fine-grained tokens) and save it in this
  repository as a secret named `SUBMODULE_TOKEN` (Settings → Secrets and
  variables → Actions). Without it the workflow ends with a notice and changes
  nothing; the rest of the repository works as before.

**Limits on the free plan.** For private repositories, GitHub's free plan
includes a monthly allowance of Actions minutes and of storage for build
artifacts; [GitHub's plans page](https://github.com/pricing) states the current
amounts. Public repositories are not metered. The long step is the thesis
build's first run, which installs TeX Live (later runs reuse a cached copy).
The build keeps its PDF artifact for 7 days, and a push build also commits the
PDF to `docs/thesis.pdf`, which is the copy to rely on. Your usage so far is
shown in your GitHub account's billing settings.
