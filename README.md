# Your dissertation

> An AI-native dissertation environment provisioned via [dissertation.ai](https://dissertation.ai).

This repository was generated from [`dataimago/dissertation-app-template`](https://github.com/dataimago/dissertation-app-template) at provision time. Mustache placeholders like `{{user.name}}`, `{{thesis.workingTitle}}`, and `{{rPackage.name}}` get substituted into this README + `package.json` + other files by `dissertation.ai`'s `/api/generate` endpoint when your repo is created.

## What's in this repo

- **Your dissertation app** — Next.js application at `src/app/` showing your chapter index, thesis-PDF link, and (as your work grows) AI-assisted exploration tools.
- **Your R package** — at `packages/r-packages/{{rPackage.name}}/` (added as a Git submodule). Holds your thesis chapter sources, methodological R code, and the Quarto + XeLaTeX → thesis PDF pipeline.
- **Your `dataimago-spec.yaml`** — the contract between you and `dataimago::ai()`. Edit it to refine your dissertation's configuration; CI re-runs the generator on every push.

## Quick start

1. Clone with submodules:
   ```sh
   git clone --recursive https://github.com/{{user.githubUsername}}/{{metadata.name}}.git
   cd {{metadata.name}}
   ```

2. Install + run the app locally:
   ```sh
   npm install
   npm run dev
   ```

3. Edit chapter content in `packages/r-packages/{{rPackage.name}}/ui/www/chapters/*.qmd`. The `build-thesis.yml` workflow in the R package rebuilds your thesis PDF on every push.

## Editing your dissertation

| What you want to change | Where |
|---|---|
| Thesis chapter content | `packages/r-packages/{{rPackage.name}}/ui/www/chapters/*.qmd` |
| Bibliography | `packages/r-packages/{{rPackage.name}}/ui/www/references.bib` |
| Thesis class file (formatting) | `packages/r-packages/{{rPackage.name}}/ui/www/thesis.cls` (or see `THESIS-CLS-README.md`) |
| Methodology R code | `packages/r-packages/{{rPackage.name}}/R/` |
| App landing page | `src/app/page.tsx` |
| Dissertation metadata (title, committee, ...) | `dataimago-spec.yaml` |

After editing `dataimago-spec.yaml`, push to `main` and the `generate.yml` workflow will regenerate everything downstream.

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
