# raw/inbox/ — drop what you brought here

If you came to dissertation.ai with a finished dissertation, a folder of
analysis code, reference material, reports, slides, data — **copy all of it
into this directory, as it is**, after cloning. Zips are fine unzipped or not.
Nothing needs renaming or sorting; that is what `/ingest` does.

Then open this repository in an AI-enabled editor and run **`/ingest`**. It will:

- sort everything into `raw/<category>/` (manuscript, code, references, data …),
- keep anything private out of git (`raw/private/`, gitignored) and tell you,
- write `raw/MANIFEST.md` — what was kept, what was set aside, and why,
- build the knowledge base in `wiki/` from all of it, and
- write `wiki/analyses/ingest-report.md` — what it read, what it inferred, how
  confident it is, and what is still missing.

Nothing in this directory is read by anything until you run `/ingest`. When
`/ingest` finishes, this directory should be empty again.

**No repository yet?** The same instructions work as a stand-alone prompt in
any capable AI session over the folder on your own machine:
[`.claude/skills/ingest/SKILL.md`](https://github.com/dataimago/dissertation-app-template/blob/main/.claude/skills/ingest/SKILL.md).
Run that way it writes the same `MANIFEST.md`, inventory, and report beside
your folder; copy the folder — those files included — into `raw/inbox/` once
your repository exists, and `/ingest` picks up where it left off.
