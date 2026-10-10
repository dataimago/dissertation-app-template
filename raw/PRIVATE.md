# raw/private/ — never committed

`/ingest` moves anything that looks like private data here: files with
names, addresses, identifiers, or anything you flag. `raw/private/` is
**gitignored** (only the `.dataimago-keep` placeholder is tracked; this guide
lives outside it, so a file moved in can never replace it) and the AI harness is **denied**
from reading it (`.claude/settings.json`).

What is here is listed by name in `raw/MANIFEST.md` and in the repo's
`.dataimago/content.yaml` `containment[]`, so the knowledge base knows these
files exist and never opens them. If any file was moved here, make this
repository **private** on GitHub before you push anything else.
