import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';
import { resolveReadLinks } from '@/lib/read-links';
import { manuscriptHome, type SpecSource } from '@/lib/manuscript-home';

interface SpecMetadata {
  metadata: { name: string };
  user: { name: string; githubUsername: string };
  vertical: {
    dissertation: {
      institution: { name: string; degreeProgram: string };
      thesis: {
        workingTitle: string;
        chapters: Array<{ id: string; title: string }>;
      };
    };
  };
  source: SpecSource & {
    rPackage: { name: string; submoduleUrl?: string; submodulePath?: string; quartoRoot?: string } | null;
  };
}

// Every link carries the same affordance: always underlined, in a colour the
// neutral preset defines. (`forest` is the dataimago house palette and is
// absent from @dataimago/css-neutral, so `text-forest-*` generated no CSS and
// links fell back to the surrounding text colour -- wi-20260905-at-landing-link-affordance.)
const linkClass =
  'text-ink-700 underline underline-offset-2 hover:text-ink-900 hover:decoration-2';

export default async function Home() {
  const spec = load(
    readFileSync(resolve(process.cwd(), 'dataimago-spec.yaml'), 'utf-8'),
  ) as SpecMetadata;

  const { workingTitle, chapters } = spec.vertical.dissertation.thesis;
  const author = spec.user.name;
  const institution = spec.vertical.dissertation.institution;
  const rpkgName = spec.source.rPackage?.name ?? '';
  // Where the book is, from the spec's one field for it (src/lib/manuscript-home.ts).
  // A spec from before the beta names no folder: the page says so, in the words
  // of src/copy/predates-beta.txt, and links nothing it would have to guess.
  const home = manuscriptHome(spec.source);
  const predatesBeta =
    home.status === 'predates-beta'
      ? readFileSync(resolve(process.cwd(), 'src/copy/predates-beta.txt'), 'utf-8').trim()
      : null;
  const inPackage = home.status !== 'predates-beta' && home.inPackage;

  // Publish surfaces, derived entirely from the spec. The PDF is committed
  // by CI into the repo that hosts the book (the new R package, or this
  // repo); the package's Pages site exists only when the book is in the package.
  const githubUser = spec.user.githubUsername;
  const manuscriptRepoUrl = inPackage
    ? (spec.source.rPackage?.submoduleUrl ??
       `https://github.com/${githubUser}/${rpkgName}`)
    : `https://github.com/${githubUser}/${spec.metadata.name}`;
  // Each link is asked, at build time and anonymously, whether a reader can
  // open it; one in a private repository is left out (src/lib/read-links.ts).
  // Without a network the links are shown as they always were.
  const { pdfHref, directDownloadHref, pagesUrl, pdfWithheld } = predatesBeta
    ? { pdfHref: null, directDownloadHref: null, pagesUrl: null, pdfWithheld: false }
    : await resolveReadLinks({
        manuscriptRepoUrl,
        pagesUrl: inPackage ? `https://${githubUser}.github.io/${rpkgName}/` : null,
      });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-stone-700">
        Dissertation in progress
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-ink-900 sm:text-5xl">
        {workingTitle}
      </h1>
      <p className="mt-3 text-lg text-stone-700">
        {author} · {institution.degreeProgram} · {institution.name}
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">Chapters</h2>
        <ol className="mt-4 space-y-2 text-stone-900">
          {chapters.map((ch, i) => (
            <li key={ch.id} className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-stone-700">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{ch.title}</span>
            </li>
          ))}
        </ol>
        {home.status === 'predates-beta' ? (
          <p className="mt-4 text-sm text-stone-700">{predatesBeta}</p>
        ) : (
          <p className="mt-4 text-sm text-stone-700">
            Edit chapter sources at{' '}
            <code className="font-mono">{`${home.chapters}/*.qmd`}</code>.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink-900">Read it</h2>
        <ul className="mt-3 space-y-2 text-stone-900">
          {pdfHref && (
            <li>
              <a className={linkClass} href={pdfHref}>
                Thesis PDF
              </a>{' '}
              <span className="text-sm text-stone-700">
                — rebuilt by <code className="font-mono">build-thesis.yml</code> on every push that
                touches <code className="font-mono">{home.status === 'predates-beta' ? '' : `${home.pathInRepo}/`}</code>
                {!inPackage ? '' : (
                  <>
                    {' '}or <code className="font-mono">R/</code>
                  </>
                )}{' '}
                in {inPackage ? 'your R package' : 'this repository'}
                {directDownloadHref && (
                  <>
                    {' '}(<a className={linkClass} href={directDownloadHref}>direct download</a>)
                  </>
                )}
              </span>
            </li>
          )}
          {pdfWithheld && (
            <li className="text-stone-700">
              The thesis PDF is not linked here because its repository is private. People with
              access find it in that repository at <code className="font-mono">docs/thesis.pdf</code>.
            </li>
          )}
          {pagesUrl && (
            <li>
              <a
                className={linkClass}
                href={pagesUrl}
              >
                Methodology &amp; package site
              </a>{' '}
              <span className="text-sm text-stone-700">
                — the thesis as an HTML book plus the{' '}
                <a className={linkClass} href={`${pagesUrl}r-package.html`}>
                  R package reference
                </a>
                , published to GitHub Pages on every push
              </span>
            </li>
          )}
        </ul>
      </section>

      <footer className="mt-16 border-t border-stone-200 pt-6 text-xs text-stone-700">
        Provisioned via{' '}
        <a className={linkClass} href="https://dissertation-ai.dataimago.ai">
          dissertation.ai
        </a>
        . Source of truth for project metadata: <code>dataimago-spec.yaml</code>.
      </footer>
    </main>
  );
}
