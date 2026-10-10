# raw/inbox/ — drop what you brought here

If you came to dissertation.ai with a finished dissertation, a folder of
analysis code, reference material, reports, slides, data — **copy all of it
into `raw/inbox/`, as it is**, after cloning. Zips are fine unzipped or not.
Nothing needs renaming or sorting; that is what `/ingest` does.

Then open this repository in an AI-enabled editor and run **`/ingest`**. It will:

- sort everything into `raw/<category>/` (manuscript, code, references, data …),
- keep anything private out of git (`raw/private/`, gitignored) and tell you,
- write `raw/MANIFEST.md` — what was kept, what was set aside, and why,
- build the knowledge base in `wiki/` from all of it, and
- write `wiki/analyses/ingest-report.md` — what it read, what it inferred, how
  confident it is, and what is still missing.

**`raw/inbox/` is gitignored.** Nothing you drop here can be committed or
pushed — not by you, not by the AI — until `/ingest` has sorted it into
`raw/<category>/`, and anything it sets aside in `raw/private/` stays out of
git for good. Never force-add (`git add -f`) anything in it. (This guide lives outside the folder, so a README in what you copy can never replace it and become committable.) If your folder
*might* contain anything with names, addresses or other identifiers, **make
this repository private on GitHub before you push anything** (Settings →
General → Danger Zone → Change visibility); `/ingest` will tell you if it
found such material, but git history is not undone by a later move.

Nothing in `raw/inbox/` is read by anything until you run `/ingest`. When
`/ingest` finishes, it should be empty again (apart from `.dataimago-keep`).

**No repository yet?** The same instructions work as a stand-alone prompt in
any capable AI session over the folder on your own machine:
[`.claude/skills/ingest/SKILL.md`](https://github.com/dataimago/dissertation-app-template/blob/main/.claude/skills/ingest/SKILL.md).
Run that way it writes the same `MANIFEST.md`, inventory, and report beside
your folder; copy the folder — those files included — into `raw/inbox/` once
your repository exists, and `/ingest` picks up where it left off.
