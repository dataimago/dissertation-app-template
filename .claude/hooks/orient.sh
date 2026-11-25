#!/usr/bin/env bash
# Level-3 author SessionStart orientation. Read-only, bounded: never reads
# secrets, raw/private/, or anything outside this repo.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 0
name="$(grep -m1 -E '^[[:space:]]*name:' dataimago-spec.yaml 2>/dev/null | sed -E 's/^[[:space:]]*name:[[:space:]]*//; s/["'"'"']//g')"
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
if [ -d raw/inbox ] && [ -n "$(ls -A raw/inbox 2>/dev/null | grep -v -E '^(\.dataimago-keep|\.gitkeep)$')" ]; then
  echo "## raw/inbox/ has unsorted material — /ingest will classify it"
fi
# The thesis book's home, by the rule of src/lib/manuscript-home.ts: the field
# named there (HOME_FIELD) under `source` in dataimago-spec.yaml. A spec without
# it, or with the old source.rPackage.quartoRoot, predates the beta: print the
# message in src/copy/predates-beta.txt and name no folder.
HOME_FIELD="$(sed -nE "s/^export const HOME_FIELD = '([^']+)';.*$/\1/p" src/lib/manuscript-home.ts 2>/dev/null)"
home_bad=""; home_set=""; home_repo=""; home_path=""; pkg_path=""; pkg_name=""; old_root=""; pkg_null=""; referenced=""
while IFS='=' read -r key value; do
  case "$key" in
    home_set) home_set=1 ;; home_repo) home_repo="$value" ;; home_path) home_path="$value" ;;
    pkg_path) pkg_path="$value" ;; pkg_name) pkg_name="$value" ;; old_root) old_root=1 ;;
    pkg_null) pkg_null=1 ;; referenced) referenced=1 ;;
  esac
done < <(awk -v F="${HOME_FIELD:-quartoHome}" '
  function val(s) { sub(/^[^:]*:[ \t]*/, "", s); sub(/[ \t]+#.*$/, "", s); gsub(/["\047]/, "", s); return s }
  /^[ \t]*#/ { next }
  /^source:/ { src = 1; next }
  src && /^[^ \t#]/ { src = 0 }
  !src { next }
  /^  [^ ]/ { sect = $1; sub(/:$/, "", sect) }
  sect == F && /^  [^ ]/ { print "home_set=1" }
  sect == F && /^    repo:/ { print "home_repo=" val($0) }
  sect == F && /^    path:/ { print "home_path=" val($0) }
  sect == "rPackage" && /^    submodulePath:/ { print "pkg_path=" val($0) }
  sect == "rPackage" && /^    name:/ { print "pkg_name=" val($0) }
  sect == "rPackage" && /^    quartoRoot:/ { print "old_root=1" }
  sect == "rPackage" && /^  rPackage:[ \t]*[^ \t]/ && val($0) == "null" { print "pkg_null=1" }
  sect == "referencedRepo" && /^    url:/ { print "referenced=1" }
' dataimago-spec.yaml 2>/dev/null)
book=""; book_note=""
# The rules @dataimago/spec and dataimago::validate_spec() enforce: path
# relative to its repository (no leading / or \, no .. segment, no control
# characters or line separators), and a referenced repository says repo:
# referenced.
case "${home_path}" in /*|\\*) home_bad=1 ;; esac
case "/${home_path}/" in */../*|*\\..\\*|*/..\\*|*\\../*) home_bad=1 ;; esac
case "${home_path}" in *[[:cntrl:]]*) home_bad=1 ;; esac
case "${home_path}" in *$'\xe2\x80\xa8'*|*$'\xe2\x80\xa9'*) home_bad=1 ;; esac
if [ -n "${referenced:-}" ] && [ "${home_repo:-}" != referenced ]; then home_bad=1; fi
if [ -n "${home_set:-}" ] && [ -z "${old_root:-}" ] && [ -z "${home_bad:-}" ]; then
  case "${home_repo:-}" in
    app) book="${home_path:-thesis}" ;;
    package)
      if [ -n "${pkg_name:-}${pkg_path:-}" ] && [ -z "${pkg_null:-}" ]; then
        book="${pkg_path:-packages/r-packages/${pkg_name}}/${home_path:-ui/www}"
      fi ;;
    referenced)
      if [ -n "${referenced:-}" ] && [ -z "${pkg_name:-}${pkg_path:-}" ]; then
        book="thesis"; book_note="the referenced repository holds the manuscript; its working chapters, once imported, are in "
      fi ;;
  esac
fi
if [ -n "$book" ]; then
  echo "## Book: ${book_note}${book}/"
else
  echo "## Book: $(cat src/copy/predates-beta.txt 2>/dev/null)"
fi
if [ -f raw/manuscript/LOCKED.md ]; then
  echo "## Manuscript: LOCKED as v1.0 (raw/manuscript/) — extend, never regenerate"
  # "Not yet created" only when the book has no chapters/: a false one would send
  # /import-manuscript over a working copy. No folder is named for an old spec.
  if [ -n "$book" ]; then
    if [ -d "$book/chapters" ]; then
      echo "   derivative chapters: $book/chapters"
    else
      echo "   derivative chapters: not yet created in $book/chapters/ (run /import-manuscript)"
    fi
  fi
fi
if [ -f wiki/log.md ]; then echo; echo "## Recent"; grep -m4 '^## ' wiki/log.md; fi
echo
echo "Read ./AGENTS.md and ./KNOWLEDGE.md. Your work stays yours — nothing leaves this repo without your action."
