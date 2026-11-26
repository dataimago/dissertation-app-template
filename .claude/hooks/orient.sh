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
# message in src/copy/predates-beta.txt and name no folder. Only the folders that
# are built are homes (thesis/ here, ui/www/ in a new R package); any other prints
# src/copy/unsupported-book-folder.txt and names no folder.
HOME_FIELD="$(sed -nE "s/^export const HOME_FIELD = '([^']+)';.*$/\1/p" src/lib/manuscript-home.ts 2>/dev/null)"
home_set=""; home_repo=""; home_path=""; home_path_set=""; pkg_path=""; pkg_name=""; old_root=""; pkg_null=""; referenced=""
while IFS='=' read -r key value; do
  case "$key" in
    home_set) home_set=1 ;; home_repo) home_repo="$value" ;; home_path) home_path="$value"; home_path_set=1 ;;
    pkg_path) case "$value" in null|"~") pkg_path="" ;; *) pkg_path="$value" ;; esac ;; pkg_name) pkg_name="$value" ;; old_root) old_root=1 ;;
    pkg_null) pkg_null=1 ;; referenced) referenced=1 ;;
  esac
done < <(awk -v F="${HOME_FIELD:-quartoHome}" '
  # A value as YAML reads it: one pair of surrounding quotes removed (a doubled
  # single quote inside single quotes is one), and a # comment only outside quotes.
  function val(s) {
    sub(/^[^:]*:[ \t]*/, "", s)
    if (s ~ /^"/) { sub(/^"/, "", s); sub(/"[ \t]*(#.*)?$/, "", s); return s }
    if (s ~ /^\047/) { sub(/^\047/, "", s); sub(/\047[ \t]*(#.*)?$/, "", s); gsub(/\047\047/, "\047", s); return s }
    sub(/[ \t]+#.*$/, "", s); sub(/[ \t]+$/, "", s); return s
  }
  { sub(/\r$/, "") }
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
book=""; book_note=""; verdict=""
# The one package folder that is built, as src/lib/manuscript-home.ts's
# PACKAGE_ROOT: exactly packages/r-packages/<name>, as the hub writes it, with one
# segment of the characters a package or repository name allows (never . or ..).
safe_root() {
  case "$1" in packages/r-packages/.|packages/r-packages/..) return 1 ;; esac
  LC_ALL=C printf '%s' "$1" | LC_ALL=C grep -qE '^packages/r-packages/[A-Za-z0-9._-]+$' || return 1
  [ "$(printf '%s' "$1" | wc -l | tr -d ' ')" = 0 ] || return 1
  return 0
}
if [ -z "$home_set" ] || [ -n "$old_root" ]; then
  verdict=predates
elif [ -n "$referenced" ] && [ "$home_repo" != referenced ]; then
  verdict=predates
else
  # Values are compared as written: a path left out is the schema's default.
  case "$home_repo" in
    app)
      if [ -n "$home_path_set" ] && [ "$home_path" != thesis ]; then verdict=unsupported; else book="thesis"; fi ;;
    package)
      if [ -z "$pkg_name$pkg_path" ] || [ -n "$pkg_null" ]; then verdict=predates
      elif [ -n "$home_path_set" ] && [ "$home_path" != ui/www ]; then verdict=unsupported
      else
        root="${pkg_path:-packages/r-packages/${pkg_name}}"
        if safe_root "$root"; then book="$root/ui/www"; else verdict=unsupported; fi
      fi ;;
    referenced)
      if [ -z "$referenced" ] || [ -n "$pkg_name$pkg_path" ]; then verdict=predates
      elif [ -n "$home_path_set" ] && [ "$home_path" != thesis ]; then verdict=unsupported
      else book="thesis"; book_note="the referenced repository holds the manuscript; its working chapters, once imported, are in "
      fi ;;
    *) verdict=predates ;;
  esac
fi
if [ -n "$book" ]; then
  echo "## Book: ${book_note}${book}/"
elif [ "$verdict" = unsupported ]; then
  echo "## Book: $(cat src/copy/unsupported-book-folder.txt 2>/dev/null)"
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
