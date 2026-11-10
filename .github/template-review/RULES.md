# Review rules — dissertation-app-template (maintainer rules; NOT for author repos)

Review the PR diff for correctness, security, regressions and violations of the
contracts below. This repo is the **template**: dissertation.ai (the hub) creates
every author's dissertation repository from it, copying all files. Report
concrete, actionable defects; do not turn style preferences or speculative
redesigns into findings. These rules live under `.github/template-review/` on
purpose, so Cursor's own Bugbot never applies them to an author's dissertation.

## P1 — every generated repo inherits this

- **Placeholders stay intact.** `{{metadata.name}}`, `PLACEHOLDER-*` values and
  every other Mustache variable that the hub substitutes at provision time must
  survive. Flag a PR that renames, hard-codes or removes one, or adds a variable
  the hub does not know.
- **Nothing specific to one author.** No real names, emails, institutions,
  repositories, advisors or titles outside obvious placeholders.
- **No secrets and no real manuscript prose.** Examples and fixtures are
  synthetic only. Never quote unpublished thesis text in a finding.

## P1 — agent and skill guidance is the product

- **Every step must be followable.** `.claude/skills/*` and `.claude/agents/*`
  say exactly what the AI does: real paths, real commands, real field names. Flag
  steps that cannot be carried out (missing file, tool the AI does not have,
  vague "handle appropriately").
- **The author decides.** The AI proposes; nothing changes the author's prose,
  spec, history or settings without their confirmation. Flag steps that apply,
  commit, push, merge or delete on the author's behalf. This is the commitment
  "AI in culture, not culture in AI" and "emancipation over efficiency".
- **`AGENTS.md` mirrors `.claude/`** for non-Claude tools: a skill, agent or
  constraint added, renamed or changed in one must change in the other.
- **Containment holds.** `raw/` stays read-only, `raw/private/` is never read,
  `raw/manuscript/LOCKED.md` governs; do not weaken `.claude/settings.json` denies.

## P1 — registry contract

- The three `thesis.classFile.type` modes (`shipped` / `vendored` / `generated`),
  the lookup key `vertical.dissertation.institution.name`, and the shipped steps
  must match `dataimago/dissertation-thesis-classes` (`registry.json` at
  `schemaVersion` 2, `docs/discovery-contract.md`, `docs/house-class-spec.md`):
  an institution is found in `profiles` (`mode: shipped`, `status: available`),
  the profile's `class` is resolved in `classes`, and both halves are fetched:
  the class `path` + `companions` (under `classes/<class>/`) and the profile's
  `cfg` + `yaml` (under `profiles/`). `shipped` never names the `house` profile;
  `generated` starts from it; `vendored` is the author's own class. The profile
  path beside the chapters is `<book folder>/profiles/<id>.yaml` + `.cfg`, the
  same in `thesis-build`, `thesis-format`, `AGENTS.md` and the README. Flag
  guidance that contradicts the registry, or still describes the version-1 shape
  (a class per institution).
- CI builds from committed files only: a build step that fetches a class or
  profile at build time is a defect. The build engine is LuaLaTeX (the class's
  `engine`), with XeLaTeX only as the untagged fallback.
- TeX Live is pinned: `TL_SNAPSHOT`, `TL_INSTALLER_SHA512` and `TL_TLPDB_SHA512`
  in `build-thesis.yml`'s Install TeX Live step equal `tools/texlive-pin.txt` in
  the registry (bumped there first). The installer is downloaded to a file and
  checked before it is unpacked, and `install-tl` and `tlmgr` use only the
  snapshot. Flag an install from the current CTAN mirror and an unchecked download.

## P1 — spec

- `dataimago-spec.yaml` stays valid against the dataimago spec schema (additive
  changes only, otherwise an `apiVersion` bump upstream), and `src/` still reads
  it without breaking. Optional down-the-road fields stay optional.

## P2

- **Next.js app.** `npm run typecheck` and `lint` would pass once placeholders are
  substituted (they cannot pass in the template itself; `ci.yml` skips it).
  `@dataimago/*` packages (the `-neutral` ones) are used per the design system:
  tokens and CSS vars, no hard-coded colors, published-npm pins, never
  `link:`/`file:`. Accessibility: semantic HTML, contrast, focus, 48px targets.
- **Docs for a new author.** README/KNOWLEDGE/guides assume a dissertation author
  who may be new to GitHub: plain words, each command or setting explained.
- **Workflows.** Generated-repo workflows must be inert or green in a fresh repo;
  template-only workflows carry the `github.repository ==` guard.

## Alignment concern format

When a changed line conflicts with an explicit commitment, title the finding
`Alignment concern: <dimension_slug>` with `Dimension:` one of
`foundation_traceability`, `emancipatory_usefulness`, `ai_in_culture_fit`,
`democratic_revisability`, `dignity_accessibility_equity`, or
`anti_domination_human_capability`, plus `Location:`, `Contract/evidence:`,
`Impact:` and `Corrective action:` lines. PR-level feedback only; never a score
or release decision.

## Boundaries

- Review the PR diff. Read unchanged code only to verify a contract a changed
  line uses. Never read `.env*`, keys, `node_modules/`, build output or `raw/`.
- The hub (dissertation-ai), the rpkg template and the thesis-class registry are
  other repos: point to them, do not flag their contents.
- Do not approve, merge, publish or deploy. Do not reproduce secrets; report an
  exposure without quoting the value.
