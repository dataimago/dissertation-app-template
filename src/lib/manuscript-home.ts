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
 * in src/copy/predates-beta.txt, never a guess. So does one whose repo does
 * not fit the source (a referenced repository must say `repo: 'referenced'`).
 * Paths are compared as written against the two folders that are built
 * (BOOK_FOLDER, PACKAGE_ROOT), so a path the schema refuses, or one it allows
 * but nothing builds, names no folder (src/copy/unsupported-book-folder.txt).
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
      /** The same folder inside the repository that holds it (the package's own
       *  path for `repo: package`): what that repository's build watches. */
      pathInRepo: string;
      /** The chapters folder, from this repository's root. */
      chapters: string;
    }
  | { status: 'predates-beta' }
  | { status: 'unsupported-folder' };

const PREDATES: ManuscriptHome = { status: 'predates-beta' };
const UNSUPPORTED: ManuscriptHome = { status: 'unsupported-folder' };

/**
 * The two book folders anything builds (support only what is built, the last
 * round on #37): `thesis` in this repository, built by `build-thesis.yml`, and
 * `ui/www` in a new R package, built by the package's own. Any other folder,
 * even one the schema allows, gets the message in
 * src/copy/unsupported-book-folder.txt and names no folder, until the
 * workflow and the manuals follow `quartoHome.path`.
 */
export const BOOK_FOLDER = { app: 'thesis', package: 'ui/www' } as const;

/**
 * The one form of package folder that is built: `packages/r-packages/<name>`,
 * exactly as the hub writes `source.rPackage.submodulePath`, with one segment
 * of the characters a package or repository name allows (never `.` or `..`).
 * Support only what is built: anything else (`./raw/private`, `raw`, a nested
 * or backslashed path) names no folder.
 */
const PACKAGE_ROOT = /^packages\/r-packages\/(?!\.{1,2}$)[A-Za-z0-9._-]+$/;

function at(
  bookFolder: string,
  inPackage: boolean,
  pathInRepo: string,
  status: 'ok' | 'referenced' = 'ok',
): ManuscriptHome {
  return { status, inPackage, bookFolder, pathInRepo, chapters: `${bookFolder}/chapters` };
}

export function manuscriptHome(source: SpecSource): ManuscriptHome {
  const home = source[HOME_FIELD] as { repo?: unknown; path?: unknown } | undefined | null;
  if (!home || typeof home !== 'object' || source.rPackage?.quartoRoot !== undefined) return PREDATES;
  // Compared as written: a path left out is the default the schema fills in.
  const path = home.path === undefined ? undefined : home.path;
  if (source.referencedRepo && home.repo !== 'referenced') return PREDATES;
  switch (home.repo) {
    case 'app':
      if (path !== undefined && path !== BOOK_FOLDER.app) return UNSUPPORTED;
      return at(BOOK_FOLDER.app, false, BOOK_FOLDER.app);
    case 'package': {
      const pkg = source.rPackage;
      if (!pkg) return PREDATES;
      if (path !== undefined && path !== BOOK_FOLDER.package) return UNSUPPORTED;
      const root = pkg.submodulePath ?? `packages/r-packages/${pkg.name}`;
      if (!PACKAGE_ROOT.test(root)) return UNSUPPORTED;
      return at(`${root}/${BOOK_FOLDER.package}`, true, BOOK_FOLDER.package);
    }
    case 'referenced':
      if (!source.referencedRepo || source.rPackage) return PREDATES;
      if (path !== undefined) return UNSUPPORTED;
      return at(BOOK_FOLDER.app, false, BOOK_FOLDER.app, 'referenced');
    default:
      return PREDATES;
  }
}
