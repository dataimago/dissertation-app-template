#!/usr/bin/env bash
# Level-3 author SessionStart orientation. Read-only, bounded: never reads
# secrets, raw/private/, or anything outside this repo.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 0
name="$(grep -m1 -E '^\s*name:' dataimago-spec.yaml 2>/dev/null | sed -E 's/^\s*name:\s*//; s/["'"'"']//g')"
echo "=== ${name:-this dissertation} — author orientation ==="
echo
if [ -f wiki/index.md ]; then
  echo "## Knowledge base"; grep -m1 -i "status:" wiki/index.md 2>/dev/null || echo "wiki/index.md present"
else
  echo "## Knowledge base: not yet seeded — run /ingest (reads raw/, writes wiki/)"
fi
if [ -f raw/MANIFEST.md ]; then
  echo "## raw/ manifest: $(grep -m1 -iE '^(Last ingest|Status):' raw/MANIFEST.md 2>/dev/null || echo present)"
fi
if [ -d raw/inbox ] && [ -n "$(ls -A raw/inbox 2>/dev/null | grep -v -E '^(README.md|\.gitkeep)$')" ]; then
  echo "## raw/inbox/ has unsorted material — /ingest will classify it"
fi
if [ -f raw/manuscript/LOCKED.md ]; then
  echo "## Manuscript: LOCKED as v1.0 (raw/manuscript/) — extend, never regenerate"
  [ -d thesis/chapters ] || [ -d packages/r-packages ] && echo "   derivative chapters: $(ls -d thesis/chapters 2>/dev/null || echo 'in the R package ui/www/chapters/ (or not yet created — run /import-manuscript)')"
fi
if [ -f wiki/log.md ]; then echo; echo "## Recent"; grep -m4 '^## ' wiki/log.md; fi
echo
echo "Read ./CLAUDE.md and ./KNOWLEDGE.md. Your work stays yours — nothing leaves this repo without your action."
