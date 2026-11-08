---
name: thesis-format
description: Turn the author's institutional formatting guide (raw/thesis-formatting/) into a thesis-class profile, field by field, each value cited to the guide's page or section, with what the guide leaves unstated listed and never guessed; validate it, build the registry's sample book with it, and give the author a checklist to confirm against the guide. Optionally, with the author's explicit consent, prepare the profile to contribute to the thesis-class registry. Use for "turn my formatting guide into a profile" or "share my profile with the registry". It does not change how this repository builds the author's own PDF (that is `thesis-build`).
---

# /thesis-format: from a formatting guide to a checked profile

The house thesis class (`dataimago-thesis`) is one class plus a small YAML
**profile** per institution. A profile is a list of facts about a guide:
margins, type size, spacing, the order of the front pages, and so on. This
skill fills one in from the guide the author supplied. The contract is
`docs/house-class-spec.md` in the registry
(`https://github.com/dataimago/dissertation-thesis-classes`), section 6.

**The author decides.** You read, propose and cite; the author checks every
value against the guide and confirms. Nothing is committed, pushed or sent
anywhere until they say so. If the guide and the author disagree, the author
wins, and you edit the profile to match what they say.

Never open `raw/private/`. Never edit a file under `raw/`. Never read
`raw/manuscript/` for this task: a profile is about the guide, not the writing.

## Rules (they are the registry's rules P1 to P6)

1. **Every value taken from the guide has a citation** in `sources`, keyed by the
   dotted field path (`geometry.margins.top`): the page or section, plus a
   quote of at most one short line when it helps. A value with no `sources`
   entry is read as the house value, and the registry's CI fails a profile that
   differs from the house value without one.
2. **A value read from a sample (a sample PDF or template, not stated in the
   text) is marked `inferred`**: `{inferred: true, from: "<sample, page>", note: "<what you measured or saw>"}`.
   `from` and `note` are both required. The author reads these first.
3. **A field the guide does not state is left out** (the house value applies)
   and its path is listed under `unstated`. Never guess. Do not fill a field from
   memory of what the institution "usually" requires, from another
   institution's profile, or from common practice.
4. **Facts only.** No manuscript content, no author data and no names of real
   people anywhere in the profile.
5. Lengths carry units (`1in`, `24pt`); booleans are booleans. Quote values that
   YAML 1.1 reads as booleans or numbers (`tagged: "on"`, `pdfa: "4"`). Use
   plain YAML: block and flow maps and lists, plain and quoted scalars, no
   anchors.
6. A profile `extends: house`. It never extends another profile.
7. **Do not change the spec or the schema.** If the guide asks for something the
   schema cannot express (the CU profile's underlined links are an example),
   leave the field out of the profile and list its path under `unstated`. Do not
   substitute a nearby allowed value. Put the guide's citation, and what the guide
   requires, only on the checklist's "Cannot be expressed" list, so the author and the
   registry's maintainer see the gap.

## Step 1: find the guide and the institution

1. Read `dataimago-spec.yaml`: `vertical.dissertation.institution.name` and
   `vertical.dissertation.thesis.classFile.guidelinesDocuments` (each entry's
   `title` and `description` say what a document covers).
2. List `raw/thesis-formatting/`. If it is empty or holds only a `.gitkeep` placeholder, ask the author for the guide
   and stop. If the guide defers to other documents (an accessibility page, a
   deposit service's instructions) that are not there, list them for the author
   and do not guess what they say. The fields they would settle go under
   `unstated`.
3. Choose the profile `id`: lowercase letters, digits and hyphens, from the
   institution (`cu-boulder`). Ask the author to confirm it.

## Step 2: get the registry's tools, outside this repository

The schema, the house profile and the checks live in the registry, which is
another repository. **Ask first.** Tell the author: "I will copy the public
registry (`https://github.com/dataimago/dissertation-thesis-classes`) into a temporary folder
and install two small Python packages (`jsonschema`, `pyyaml`) into a throwaway environment
there. I will run the registry's checker and `texlua` (or `quarto`) on your profile, write a
generated settings file and a two-line example file, and build the registry's sample book
with your profile twice, once with LuaLaTeX and once with XeLaTeX. That build needs Quarto, a
current TeX Live and the TeX Gyre fonts, and it can take several minutes. Nothing from the
copy is committed to your repository, and I will delete the folder afterwards." Continue only
on an explicit yes. Without it, run none of this, including `render.sh`.

```sh
REPO_ROOT=$(git rev-parse --show-toplevel)   # the author's repository; never cd away from it in a way you do not undo
SCRATCH=$(mktemp -d)
git clone --depth 1 https://github.com/dataimago/dissertation-thesis-classes "$SCRATCH/registry"
ls "$SCRATCH/registry/profiles"          # profiles that already exist
for f in docs/house-class-spec.md profiles/profile.schema.json profiles/house.yaml \
         classes/dataimago-thesis/thesis-profile.lua classes/dataimago-thesis/example/render.sh tools/check_profile.py; do
  [ -e "$SCRATCH/registry/$f" ] || echo "MISSING: $f"
done
```

If any file is reported missing, stop. Tell the author that the house class and profiles
are not available in the registry's default branch yet, name what is missing, and do not
fill or validate a profile from memory or invent a schema.

- **A profile for this institution already exists.** Tell the author, show it,
  and offer to check it against their guide's version instead of writing a new
  one, working on a copy in their repository. If the guide differs, the update is
  a change to that one profile, which Step 7 can offer to the registry (the
  update case); the maintainer reviews it like any other.
- Read, in the scratch copy: `docs/house-class-spec.md` section 6 (the field
  tables), `profiles/profile.schema.json`, `profiles/house.yaml`, and, if it is there,
  `profiles/cu-boulder.yaml` (a worked example of sourcing a profile from a real
  guide: section-name citations, `inferred` values, the `unstated` list,
  `guide.retrieved` and `guide.url`). If it is not there, tell the author there is no
  worked example and go on; it is not needed. Note 6 under the CU example in spec section 6.6 explains why
  a field the guide is silent on goes under `unstated` and is not assumed.
- Checking needs `python3` with `jsonschema` and `pyyaml`
  (`python3 -m venv "$SCRATCH/venv" && "$SCRATCH/venv/bin/pip" install jsonschema==4.23.0 pyyaml==6.0.2`, the pins in the registry's `tools/requirements.txt`; the rest of that file is for the PDF checks)
  and `texlua` or `quarto` for the generator. If one is missing, tell the author which check you could not run. Do not report it as passed.

## Step 3: read the guide and fill the profile

Read the whole guide. A PDF: read it page by page and keep the page numbers. A
web page or text file with no page numbers: cite by section heading, as the CU
profile does.

Write `<id>.yaml` in a `profiles/` folder beside the chapters, chosen by
`source` in `dataimago-spec.yaml`: content-only and referenced-repository layouts
(`source.rPackage` null) use `thesis/profiles/<id>.yaml` in this repository;
the R-package layout uses
`packages/r-packages/<source.rPackage.name>/<source.rPackage.quartoRoot>/profiles/<id>.yaml`
(`ui/www` by default), inside the package's own repository, so ask the author first. Start from the shape in
spec section 6.3 and walk the field tables of section 6.4 in order, one section at
a time: `institution` and `guide`, `geometry`, `type`, `spacing`, `headings`
and `numbering`, `pagenumber`, `frontmatter`, `toc`, `appendices`, `landscape`,
`floats`, `bibliography`, `submission`, `accessibility`, `limits`. For each field:

| The guide... | You write |
|---|---|
| states a value | the value, and a `sources` entry: `{section: "Margins", page: 5, quote: "1 inch on all edges"}`. Section or page alone is enough; a quote is at most one short line. |
| states a value equal to the house value | you may leave the value out and keep the `sources` entry with a note "equals the house value", as the CU profile does for margins. |
| shows a value only in a sample the institution published (a template or sample document, supplied by the author) | the value and `{inferred: true, from: "<sample file, page>", note: "<what was measured>"}` |
| is silent, vague or contradicts itself, or shows a value only in the author's own thesis or drafts (those are never a source) | nothing; add the path to `unstated` (or, for a contradiction, put the two citations in the checklist's "Needs your decision" and leave the field out until the author chooses) |

Also fill `guide:` (`title`, `issuer`, `version`, `date`, `url` if the guide is
public, and `retrieved`: today's date, or the literal `unretrieved` if you did not
read it) and `institution:` (`name`, `graduateSchool`, as the guide words them).
Template strings (`titlePage.statement`, `abstract.header`, `committee.format`)
use only the slots the spec lists (`{title}`, `{author}`, `{institution}`,
`{documentType}`, ...). Copy the guide's required wording with slots in place of
anything about a person, and cite it. Never type a real name into a profile.

Several documents (a graduate-school guide plus a department supplement): the
more specific document wins where they differ. Cite each value to the document it came from, and list every conflict in "Needs your decision".

## Step 4: validate

Set `PROFILE_FILE` to the absolute path of the profile you wrote in Step 3
(`$REPO_ROOT/thesis/profiles/<id>.yaml`, or the R-package path from Step 3).
Run the checks in the scratch copy, in a subshell so your working directory stays in the
author's repository:

```sh
cp "$PROFILE_FILE" "$SCRATCH/registry/profiles/<id>.yaml"
(cd "$SCRATCH/registry" \
  && texlua classes/dataimago-thesis/thesis-profile.lua profiles <id> \
  && "$SCRATCH/venv/bin/python" tools/check_profile.py <id>)         # the first command writes profiles/<id>.cfg
```

After you edit the profile (Step 6), copy it over again from `$PROFILE_FILE` and re-run.

If `texlua` is missing but `quarto` is installed, use
`quarto pandoc lua classes/dataimago-thesis/thesis-profile.lua profiles <id>`
for the first command. If neither is installed, say that the `.cfg` was not
generated and the drift check did not run.

`check_profile.py` runs the schema, the P1 rule (every value that differs from
the house value has a `sources` entry), the inferred-needs-`from`-and-`note` rule,
the `unstated`-but-also-set rule and the front-matter cross-checks. Fix what it
reports by correcting the profile or adding the citation you missed; never by
weakening a value to make it pass.

## Step 5: build

Build the registry's synthetic example book with the profile, which shows how
the profile lays a page out without touching the author's chapters:

The example book picks its profile from an overlay named after it. In the scratch
copy, first create `classes/dataimago-thesis/example/_quarto-<id>.yml` with two
lines, `thesis:` and `  profile: <id>` (add `  institution: Example University` if the
profile sets no `institution.name`; a synthetic name, never a real one). Without it
the book is built with the house profile.

```sh
(cd "$SCRATCH/registry" && sh classes/dataimago-thesis/example/render.sh <id> lualatex)
(cd "$SCRATCH/registry" && sh classes/dataimago-thesis/example/render.sh <id> xelatex)
```

Run these only after the author's yes in Step 2. They need `quarto`, a current TeX
Live and the TeX Gyre fonts. If any is missing, skip this step and tell the author the
build did not run; never report it as passed. Otherwise report whether each build passed. Show the
author the first pages of the PDF (title, abstract, contents, a chapter opening)
so they can compare them with the guide's sample pages. Building the author's own
chapters with a profile belongs to `thesis-build`, once that skill supports
profiles; do not change `thesis-build` from here.

## Step 6: the checklist for the author

Give the author one table the length of the profile, in the guide's order, so
they can open the guide at each citation:

| Field | Value | Where in the guide | Stated or inferred |
|---|---|---|---|

Then three lists, in this order, because the weakest evidence comes first:

1. **Inferred from a sample.** Each with the sample and what you measured.
2. **Unstated.** The `unstated` paths, in plain words ("the guide does not say
   which font to use, so the house font applies"), and any document the guide
   defers to that was not supplied.
3. **Needs your decision / cannot be expressed.** Conflicts between documents and
   requirements the schema has no field for.

Ask the author to go through it against the guide and tell you every row that is
wrong or that they want changed. Edit the profile, re-run Steps 4 and 5, and
repeat until they say it is right.

Then offer to save the profile in their repository, and wait for their go-ahead.
**The author runs these commands after that go-ahead. You do not run any of them.**
The AI never runs `git add`, `git commit`, `git push` or `gh pr create` in the
dissertation repository, in the package repository or in the scratch clone. Show the
commands as text with `<id>` and the paths filled in.

Content-only or referenced-repository layout (`source.rPackage` null), from the
repository root:

```sh
git switch -c profile/<id>
git add thesis/profiles/<id>.yaml
git commit -m "thesis-format: <institution> profile"
git push -u origin profile/<id>
gh pr create --title "thesis-format: <institution> profile" --body "Profile from the formatting guide; checked against it."
```

R-package layout: first the profile inside the package's own repository (the folder is
the Step 3 path's parent, `packages/r-packages/<source.rPackage.name>/`), as its own branch and
pull request:

```sh
git -C packages/r-packages/<name> switch -c profile/<id>
git -C packages/r-packages/<name> add <quartoRoot>/profiles/<id>.yaml
git -C packages/r-packages/<name> commit -m "thesis-format: <institution> profile"
git -C packages/r-packages/<name> push -u origin profile/<id>
gh pr create --repo <package owner>/<package repo> --head profile/<id> --title "thesis-format: <institution> profile" --body "Profile from the formatting guide; checked against it."
```

After the author has merged that pull request, update the submodule pointer here:

```sh
git -C packages/r-packages/<name> switch main && git -C packages/r-packages/<name> pull
git switch -c profile/<id>-pointer
git add packages/r-packages/<name>
git commit -m "Update <name> to include the <institution> profile"
git push -u origin profile/<id>-pointer
gh pr create --title "Update <name> pointer" --body "Points at the merged profile."
```

The author merges. Never run any git command that writes inside `$SCRATCH/registry`: it
is a copy of the registry, not the author's repository.

Do this before Step 7, while the scratch copy still holds the `.cfg`. Delete the scratch
copy (`rm -rf "$SCRATCH"`) only after Step 7 is done or declined (in Step 7 you delete it once the files are written to the author's folder).

## Step 7 (optional): contribute the profile back

A profile for your institution helps every author there, and the registry
cannot grow without such contributions. It is the author's choice; ask once, in
plain words, and accept "no" without argument.

**Say this first.** "I can prepare your profile to offer to the shared registry
(`dataimago/dissertation-thesis-classes`), so other authors at your institution
can use it. It would contain facts about your institution's guide only: values
and page citations. No part of your writing, and no names. It is published under
the registry's MIT license, and once merged it is public. Do you want that?"
Continue only on an explicit yes. A yes covers this profile, not anything else.

**Then tell the author what happens next, before anything leaves their machine.**

1. The registry's CI checks the profile, but GitHub withholds the automated
   reviewer's access from pull requests that come from forks, on purpose. So a
   maintainer (or the maintainer's agent) checks that you consented and that the
   file holds facts only, then re-pushes your commits to a branch in the
   registry repository and opens a same-repository pull request that credits
   you. That one gets the normal automated review and a maintainer's review.
   The maintainer may also add the sample-page snapshots the checks need, which
   require a full TeX Live.
2. Your fork pull request is then closed with a link to the new one.
3. You may be asked questions on the new pull request. You can withdraw at any
   time before it is merged by saying so on either pull request.
4. After it merges, the profile is public and the registry can offer it to the next author at your
   institution.

Ask a second time: "Knowing that, do you want me to prepare it?" Do nothing below without a second explicit yes.

**Gate.** Prepare a contribution only if Step 4 produced `profiles/<id>.cfg` and passed `check_profile.py`. If it did not (no `texlua` or `quarto`, or a failed check), stop and say the registry offer cannot be prepared until the generator and the check have run.

**Check the file before the author sees it, and again with them.**

- Nothing from the manuscript: no title, abstract text, chapter names, quotes
  from the author's writing. A `quote` is a line from the guide, at most one short line.
- No person's name, email address or username anywhere, including inside
  template strings and `from`/`note` text. The author's own name does not
  belong in it either.
- No `inferred` value taken from the author's own thesis or drafts. A sample
  qualifies only if the institution published it (a template or sample document).
  Drop other inferred values, move them to `unstated`, and tell the author.
- No local paths from this repository (`raw/...`); name the guide and the sample as the institution titles them.
- `guide.url` only if the guide is public. If it needs a login, ask the author
  whether to cite its title and issuer without the link.
- Read the final file aloud to the author, line by line if they want. They may
  strike any line.

**Prepare the contribution.** If the `id` is new, three new files in a branch of
a fork of the registry, nothing else: `profiles/<id>.yaml`, the compiled `profiles/<id>.cfg`
from Step 4, and the two-line overlay
`classes/dataimago-thesis/example/_quarto-<id>.yml` from Step 5. Do not touch
`registry.json`, `docs/`, other files under `classes/`, or another profile.
If the `id` already exists in the registry (the update case), replace only
`profiles/<id>.yaml` and `profiles/<id>.cfg` (add the overlay only if it is
missing), and say in the pull-request body what changed and which guide version
it follows.

**The author opens the pull request; you only prepare.** Ask the author for their GitHub
username (never read it from `gh`) and for a folder outside their repository to keep the
files in (suggest `~/thesis-format-<id>`). Write into it, and print its full path:
`profiles/<id>.yaml`, `profiles/<id>.cfg`, the overlay at
`classes/dataimago-thesis/example/_quarto-<id>.yml`, and `pr-body.md` (described below).
Then show the author the commands below as text to copy, with `<CONTRIB>` replaced by that
absolute path and `<their-username>`, `<id>` and `<institution>` filled in. They run
them in their own terminal, signed in as themselves. **You do not run any of them** and
you put none of them in a command of your own. Delete `$SCRATCH` once the files are
written; the folder you printed is what the author keeps.

For the author to run (a fresh clone of their fork, never your scratch copy and never
their dissertation repository):

```sh
gh repo fork dataimago/dissertation-thesis-classes --clone=false
git clone https://github.com/<their-username>/dissertation-thesis-classes <CONTRIB>/fork
git -C <CONTRIB>/fork remote get-url origin       # must read https://github.com/<their-username>/dissertation-thesis-classes
git -C <CONTRIB>/fork switch -c profile/<id>
mkdir -p <CONTRIB>/fork/classes/dataimago-thesis/example
cp <CONTRIB>/profiles/<id>.yaml <CONTRIB>/profiles/<id>.cfg <CONTRIB>/fork/profiles/
# new profile only (skip when the registry already has this overlay):
cp <CONTRIB>/classes/dataimago-thesis/example/_quarto-<id>.yml <CONTRIB>/fork/classes/dataimago-thesis/example/
git -C <CONTRIB>/fork add profiles/<id>.yaml profiles/<id>.cfg classes/dataimago-thesis/example/_quarto-<id>.yml
git -C <CONTRIB>/fork commit -m "profile: <institution>"
git -C <CONTRIB>/fork push -u origin profile/<id>
gh pr create --repo dataimago/dissertation-thesis-classes --head <their-username>:profile/<id> \
  --title "profile: <institution>" --body-file <CONTRIB>/pr-body.md
```

The pull-request body says: the institution, the guide's title, issuer, version
and date; "Contributed with the author's consent"; the number of inferred and
unstated fields; the validation and build results from Steps 4 and 5; and that
it holds facts about the guide only. It contains no names but the author's GitHub username,
which is how they are credited.

Do not merge, close or edit anything in the registry yourself, and do not push to
the registry repository: authors cannot, and an agent acting for them must not.
