# {{metadata.name}} — AI agent operating manual

> Claude Code reads this file; every other AI tool reads `AGENTS.md`. The manual itself is `AGENTS.md` (imported below), so there is one set of rules for every tool. Put Claude-only notes here; put everything else in `AGENTS.md`.

@AGENTS.md

## Claude Code specifics

- The skills in `.claude/skills/` are slash commands here: `/ingest`, `/import-manuscript`, `/thesis-build`, `/coordinate`.
- `.claude/settings.json` enforces the containment rules (no `.env*`, keys, or `raw/private/`) and runs `.claude/hooks/orient.sh` at session start to print where the project stands.
