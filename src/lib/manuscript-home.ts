/**
 * Where the author writes the dissertation: the thesis book's home, read from
 * one field of `source` in dataimago-spec.yaml. The field's name is HOME_FIELD,
 * defined here and nowhere else (.claude/hooks/orient.sh reads it from this
 * line), so a rename is one edit.
 *
 * The maintainer's decision, 2026-11-25: dissertation.ai writes the book only
 * where it created the repository, and says so in the spec:
 *   { repo: 'app', path }        this repository (`thesis` by default): no R
 *                                 package, or an existing package the author
 *                                 linked, which is never written in;
 *   { repo: 'package', path }    the new R package dissertation.ai created, at
 *                                 `source.rPackage.submodulePath` (`ui/www` by
 *                                 default);
 *   { repo: 'referenced' }       the author's existing whole-dissertation
 *                                 repository (`source.referencedRepo`): the
 *                                 manuscript stays there, and its working
 *                                 chapters, once imported, are `thesis/` here.
 * No reader joins paths or reads `source.case` to find the chapters.
 *
 * A spec from before the beta (no such field, or the old
 * `source.rPackage.quartoRoot`) is not supported: it gets the one plain message
 * in src/copy/predates-beta.txt, never a guess. So does one that breaks the two
 * rules @dataimago/spec enforces (dataimago-ai#365): a referenced repository
 * must say `repo: 'referenced'`, and `path` is relative with no `..`.
 */
export const HOME_FIELD = 'quartoHome';

export interface SpecSource {
  rPackage: { name: string; submodulePath?: string; quartoRoot?: string } | null;
  referencedRepo?: { url: string } | null;
  [field: string]: unknown;
}

export type ManuscriptHome =
  | {
      status: 'ok' | 'referenced';
      /** The book is in the linked R package, not in this repository. */
      inPackage: boolean;
      /** The folder that holds `_quarto.yml`, from this repository's root. */
      bookFolder: string;
      /** The chapters folder, from this repository's root. */
      chapters: string;
    }
  | { status: 'predates-beta' };

const PREDATES: ManuscriptHome = { status: 'predates-beta' };

function at(bookFolder: string, inPackage: boolean, status: 'ok' | 'referenced' = 'ok'): ManuscriptHome {
  return { status, inPackage, bookFolder, chapters: `${bookFolder}/chapters` };
}

export function manuscriptHome(source: SpecSource): ManuscriptHome {
  const home = source[HOME_FIELD] as { repo?: unknown; path?: unknown } | undefined | null;
  if (!home || typeof home !== 'object' || source.rPackage?.quartoRoot !== undefined) return PREDATES;
  const path = typeof home.path === 'string' && home.path.length > 0 ? home.path : null;
  if (path !== null && (path.startsWith('/') || path.split('/').includes('..'))) return PREDATES;
  if (source.referencedRepo && home.repo !== 'referenced') return PREDATES;
  switch (home.repo) {
    case 'app':
      return at(path ?? 'thesis', false);
    case 'package': {
      const pkg = source.rPackage;
      if (!pkg) return PREDATES;
      const root = pkg.submodulePath ?? `packages/r-packages/${pkg.name}`;
      return at(`${root}/${path ?? 'ui/www'}`, true);
    }
    case 'referenced':
      return source.referencedRepo && !source.rPackage ? at('thesis', false, 'referenced') : PREDATES;
    default:
      return PREDATES;
  }
}
