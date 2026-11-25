/**
 * Which "Read it" links the landing page can stand behind.
 *
 * The PDF and the package site live in the manuscript repository (the R
 * package, or this repository for a content-only dissertation). While that
 * repository is private, its `raw/` download answers "not found" to anyone
 * not signed in with access, and its GitHub Pages site exists only if the
 * author opted in on a paid plan. The landing page itself is usually public
 * (a Vercel deployment is), so it must not link what its readers cannot open.
 *
 * GitHub is the authority on visibility, and visibility can change after the
 * repository is made, so the build asks at build time instead of reading a
 * value written when the repository was created. It asks the links
 * themselves, with an anonymous HEAD request and no token: the answer wanted
 * is what a reader meets. No API is used, so there is no hourly quota.
 *
 * - A link that answers (2xx or a redirect) is shown.
 * - A link that answers 404 is either in a private repository or not built
 *   yet (a new repository has no PDF and no site until its first build). The
 *   repository's own page tells the two apart: 200 means public, so the link
 *   is shown and comes alive after the build, as before; anything else means
 *   the link is left out.
 * - Any other answer (offline, slow, rate-limited) is unknown, and an unknown
 *   link is shown, as before. A build with no network behaves as it always did.
 */
import { request } from 'node:https';

/** One anonymous HEAD request: its status code, or null on any failure. */
export type Probe = (url: string) => Promise<number | null>;

export interface ReadLinks {
  /** "Thesis PDF": the Pages copy when there is a site, else the raw download. */
  pdfHref: string | null;
  /** "direct download": the CI-committed PDF in the manuscript repository. */
  directDownloadHref: string | null;
  /** The methodology & package site (R-package dissertations only). */
  pagesUrl: string | null;
  /** True when no PDF link is left: the page says where the PDF is instead. */
  pdfWithheld: boolean;
}

type LinkState = 'live' | 'dead' | 'unknown';

function stateOf(status: number | null): LinkState {
  if (status === null) return 'unknown';
  if (status >= 200 && status < 400) return 'live';
  if (status === 404) return 'dead';
  return 'unknown';
}

/** Ask each link the page would print; leave out only the ones a reader cannot open. */
export async function resolveReadLinks(
  args: { manuscriptRepoUrl: string; pagesUrl: string | null },
  probe: Probe = headStatus,
): Promise<ReadLinks> {
  const raw = `${args.manuscriptRepoUrl}/raw/main/docs/thesis.pdf`;
  const pagesPdf = args.pagesUrl ? `${args.pagesUrl}thesis.pdf` : null;

  const [rawState, pagesState] = await Promise.all([
    probe(raw).then(stateOf),
    args.pagesUrl ? probe(args.pagesUrl).then(stateOf) : Promise.resolve<LinkState>('unknown'),
  ]);

  // Only a 404 needs the tie-breaker, and the repository page is asked once.
  let repoPublic: Promise<boolean> | null = null;
  const isPublic = () =>
    (repoPublic ??= probe(args.manuscriptRepoUrl).then((s) => s === 200));
  const keep = async (state: LinkState) => state !== 'dead' || (await isPublic());

  const keepRaw = await keep(rawState);
  const keepPages = args.pagesUrl ? await keep(pagesState) : false;

  const directDownloadHref = keepRaw ? raw : null;
  const pagesUrl = keepPages ? args.pagesUrl : null;
  const pdfHref = keepPages && pagesPdf ? pagesPdf : directDownloadHref;
  return { pdfHref, directDownloadHref, pagesUrl, pdfWithheld: pdfHref === null };
}

/** The real probe: anonymous HEAD, no redirects followed, 5 s timeout. */
export function headStatus(url: string, timeoutMs = 5000): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const req = request(
        url,
        { method: 'HEAD', headers: { 'User-Agent': 'dissertation-landing-page' }, timeout: timeoutMs },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? null);
        },
      );
      req.on('timeout', () => req.destroy());
      req.on('error', () => resolve(null));
      req.end();
    } catch {
      resolve(null);
    }
  });
}
