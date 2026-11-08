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
   cite the guide in `sources`, set the nearest allowed value or leave the field
   out, and put the gap on the checklist under "Cannot be expressed" so the
   author and the registry's maintainer see it.

## Step 1: find the guide and the institution

1. Read `dataimago-spec.yaml`: `vertical.dissertation.institution.name` and
   `vertical.dissertation.thesis.classFile.guidelinesDocuments` (each entry's
   `title` and `description` say what a document covers).
2. List `raw/thesis-formatting/`. If it is empty, ask the author for the guide
   and stop. If the guide defers to other documents (an accessibility page, a
   deposit service's instructions) that are not there, list them for the author
   and do not guess what they say. The fields they would settle go under
   `unstated`.
3. Choose the profile `id`: lowercase letters, digits and hyphens, from the
   institution (`cu-boulder`). Ask the author to confirm it.

## Step 2: get the registry's tools, outside this repository

The schema, the house profile and the checks live in the registry, which is
another repository. **Ask first.** Tell the author: "I will copy the public
registry into a temporary folder and install two small Python packages into a
throwaway environment there. It is read-only, nothing from it is committed here, and I
will delete it afterwards." Continue on their go-ahead.

```sh
SCRATCH=$(mktemp -d)
git clone --depth 1 https://github.com/dataimago/dissertation-thesis-classes "$SCRATCH/registry"
ls "$SCRATCH/registry/profiles"          # profiles that already exist
```

- **A profile for this institution already exists.** Tell the author, show it,
  and offer to check it against their guide's version instead of writing a new
  one. A changed guide is a change to that profile, which the registry's
  maintainer reviews like any other.
- Read, in the scratch copy: `docs/house-class-spec.md` section 6 (the field
  tables), `profiles/profile.schema.json`, `profiles/house.yaml`, and
  `profiles/cu-boulder.yaml` (a worked example of sourcing a profile from a real
  guide: section-name citations, `inferred` values, the `unstated` list,
  `guide.retrieved` and `guide.url`). Note 6 under the CU example in spec section 6.6 explains why
  a field the guide is silent on goes under `unstated` and is not assumed.
- Checking needs `python3` with `jsonschema` and `pyyaml`
  (`python3 -m venv "$SCRATCH/venv" && "$SCRATCH/venv/bin/pip" install jsonschema==4.23.0 pyyaml==6.0.2`, the pins in the registry's `tools/requirements.txt`; the rest of that file is for the PDF checks)
  and `texlua` or `quarto` for the generator. If one is missing, tell the author which check you could not run. Do not report it as passed.

## Step 3: read the guide and fill the profile

Read the whole guide. A PDF: read it page by page and keep the page numbers. A
web page or text file with no page numbers: cite by section heading, as the CU
profile does.

Write `profiles/<id>.yaml` beside the chapters (`thesis/profiles/` in a
content-only repository; `ui/www/profiles/` in the R package, where you ask the
author first because it is the package's own repository). Start from the shape in
spec section 6.3 and walk the field tables of section 6.4 in order, one section at
a time: `institution` and `guide`, `geometry`, `type`, `spacing`, `headings`
and `numbering`, `pagenumber`, `frontmatter`, `toc`, `appendices`, `landscape`,
`floats`, `bibliography`, `submission`, `accessibility`, `limits`. For each field:

| The guide... | You write |
|---|---|
| states a value | the value, and a `sources` entry: `{section: "Margins", page: 5, quote: "1 inch on all edges"}`. Section or page alone is enough; a quote is at most one short line. |
| states a value equal to the house value | you may leave the value out and keep the `sources` entry with a note "equals the house value", as the CU profile does for margins. |
| shows a value only in a sample the author supplied | the value and `{inferred: true, from: "<sample file, page>", note: "<what was measured>"}` |
| is silent, vague or contradicts itself | nothing; add the path to `unstated` (or, for a contradiction, put the two citations in the checklist's "Needs your decision" and leave the field out until the author chooses) |

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

In the scratch copy:

```sh
cp <profile>.yaml "$SCRATCH/registry/profiles/<id>.yaml"
cd "$SCRATCH/registry"
texlua classes/dataimago-thesis/thesis-profile.lua profiles <id>     # writes profiles/<id>.cfg
"$SCRATCH/venv/bin/python" tools/check_profile.py <id>
```

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

```sh
sh classes/dataimago-thesis/example/render.sh <id> lualatex     # then xelatex
```

It needs `quarto`, a current TeX Live and the TeX Gyre fonts. Report whether
each build passed. If a tool is missing, say the build did not run. Show the
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
Show the exact commands first. The file is `thesis/profiles/<id>.yaml`, committed
from this repository's root on a new branch (never `main`) and proposed as a
pull request; in the R-package layout it is `ui/www/profiles/<id>.yaml`, committed
inside the package's own repository (on its own branch and pull request), and
the submodule pointer here is updated only after the author has merged that
one. The author merges. Never run `git add`, `commit` or `push` inside
`$SCRATCH/registry`: it is a copy of the registry, not the author's repository.

Do this before Step 7, while the scratch copy still holds the `.cfg`. Delete the scratch
copy (`rm -rf "$SCRATCH"`) only after Step 7 is done or declined.

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

**Prepare the contribution.** One new file in a branch of a fork of the
registry, nothing else: `profiles/<id>.yaml`, plus the compiled
`profiles/<id>.cfg` from Step 4. Do not touch `registry.json`, `docs/`, `classes/`
or another profile. Show the author the commands and run each only with their
go-ahead, in their own GitHub account:

```sh
gh repo fork dataimago/dissertation-thesis-classes --clone=false
git clone https://github.com/<their-username>/dissertation-thesis-classes   # in a scratch folder
git switch -c profile/<id>
# copy in profiles/<id>.yaml and profiles/<id>.cfg
git add profiles/<id>.yaml profiles/<id>.cfg && git commit -m "profile: <institution>"
git push -u origin profile/<id>
gh pr create --repo dataimago/dissertation-thesis-classes --title "profile: <institution>" --body-file <body>
```

The pull-request body says: the institution, the guide's title, issuer, version
and date; "Contributed with the author's consent"; the number of inferred and
unstated fields; the validation and build results from Steps 4 and 5; and that
it holds facts about the guide only. It contains no names but the author's GitHub username,
which is how they are credited.

**Tell the author what happens next, before they open it.**

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

Do not merge, close or edit anything in the registry yourself, and do not push to
the registry repository: authors cannot, and an agent acting for them must not.
