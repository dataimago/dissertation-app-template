import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'js-yaml';

interface SpecMetadata {
  user: { name: string };
  vertical: {
    dissertation: {
      institution: { name: string; degreeProgram: string };
      thesis: {
        workingTitle: string;
        chapters: Array<{ id: string; title: string }>;
      };
    };
  };
  source: { rPackage: { name: string } | null };
}

export default function Home() {
  const spec = load(
    readFileSync(resolve(process.cwd(), 'dataimago-spec.yaml'), 'utf-8'),
  ) as SpecMetadata;

  const { workingTitle, chapters } = spec.vertical.dissertation.thesis;
  const author = spec.user.name;
  const institution = spec.vertical.dissertation.institution;
  const rpkgName = spec.source.rPackage?.name ?? '';

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-stone-500">
        Dissertation in progress
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium text-ink sm:text-5xl">
        {workingTitle}
      </h1>
      <p className="mt-3 text-lg text-stone-700">
        {author} · {institution.degreeProgram} · {institution.name}
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">Chapters</h2>
        <ol className="mt-4 space-y-2 text-stone-900">
          {chapters.map((ch, i) => (
            <li key={ch.id} className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-stone-500">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{ch.title}</span>
            </li>
          ))}
        </ol>
        {rpkgName && (
          <p className="mt-4 text-sm text-stone-700">
            Edit chapter sources at{' '}
            <code className="font-mono">packages/r-packages/{rpkgName}/ui/www/chapters/*.qmd</code>.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-ink">Thesis PDF</h2>
        <p className="mt-2 text-stone-700">
          Rebuilt by your R package's <code className="font-mono">build-thesis.yml</code> workflow
          on every push that touches <code className="font-mono">ui/www/</code> or{' '}
          <code className="font-mono">R/</code>.
        </p>
      </section>

      <footer className="mt-16 border-t border-stone-200 pt-6 text-xs text-stone-500">
        Provisioned via{' '}
        <a className="text-forest-700 hover:underline" href="https://dissertation.ai">
          dissertation.ai
        </a>
        . Source of truth for project metadata: <code>dataimago-spec.yaml</code>.
      </footer>
    </main>
  );
}
