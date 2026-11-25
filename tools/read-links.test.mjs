// Run: npm test (node --test; Node 23.6+ runs the TypeScript module directly).
// Every probe is a stub: these tests never touch the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { headStatus, resolveReadLinks } from '../src/lib/read-links.ts';

const REPO = 'https://github.com/jane/janepkg';
const RAW = `${REPO}/raw/main/docs/thesis.pdf`;
const PAGES = 'https://jane.github.io/janepkg/';

/** A stub probe answering from a table; an unlisted URL is a failure (null). */
function stub(table) {
  const asked = [];
  const probe = async (url) => {
    asked.push(url);
    return url in table ? table[url] : null;
  };
  return { probe, asked };
}

test('public repository, everything built: links as before', async () => {
  const { probe } = stub({ [RAW]: 302, [PAGES]: 200 });
  assert.deepEqual(await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe), {
    pdfHref: `${PAGES}thesis.pdf`,
    directDownloadHref: RAW,
    pagesUrl: PAGES,
    pdfWithheld: false,
  });
});

test('public repository, nothing built yet: links stay, they come alive after the first build', async () => {
  const { probe } = stub({ [RAW]: 404, [PAGES]: 404, [REPO]: 200 });
  const links = await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe);
  assert.equal(links.directDownloadHref, RAW);
  assert.equal(links.pagesUrl, PAGES);
  assert.equal(links.pdfWithheld, false);
});

test('private repository, no site: no link a reader cannot open', async () => {
  const { probe, asked } = stub({ [RAW]: 404, [PAGES]: 404, [REPO]: 404 });
  assert.deepEqual(await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe), {
    pdfHref: null,
    directDownloadHref: null,
    pagesUrl: null,
    pdfWithheld: true,
  });
  // The repository page is asked once, not once per dead link.
  assert.equal(asked.filter((u) => u === REPO).length, 1);
});

test('private repository with a published site (paid-plan opt-in): the site stays, the raw download goes', async () => {
  const { probe } = stub({ [RAW]: 404, [PAGES]: 200, [REPO]: 404 });
  assert.deepEqual(await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe), {
    pdfHref: `${PAGES}thesis.pdf`,
    directDownloadHref: null,
    pagesUrl: PAGES,
    pdfWithheld: false,
  });
});

test('content-only dissertation in a private repository: the PDF link goes', async () => {
  const app = 'https://github.com/jane/janes-dissertation';
  const { probe } = stub({ [`${app}/raw/main/docs/thesis.pdf`]: 404, [app]: 404 });
  const links = await resolveReadLinks({ manuscriptRepoUrl: app, pagesUrl: null }, probe);
  assert.equal(links.pdfHref, null);
  assert.equal(links.directDownloadHref, null);
  assert.equal(links.pagesUrl, null);
  assert.equal(links.pdfWithheld, true);
});

test('no network: links as before (unknown is shown)', async () => {
  const { probe } = stub({});
  assert.deepEqual(await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe), {
    pdfHref: `${PAGES}thesis.pdf`,
    directDownloadHref: RAW,
    pagesUrl: PAGES,
    pdfWithheld: false,
  });
});

test('rate-limited or failing answers are unknown and shown', async () => {
  const { probe } = stub({ [RAW]: 429, [PAGES]: 503 });
  const links = await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe);
  assert.equal(links.directDownloadHref, RAW);
  assert.equal(links.pagesUrl, PAGES);
});

test('only a 404 from the repository page means private: any other answer keeps the link', async () => {
  for (const repoStatus of [null, 301, 302, 403, 429, 500]) {
    const { probe } = stub({ [RAW]: 404, [PAGES]: 404, ...(repoStatus === null ? {} : { [REPO]: repoStatus }) });
    const links = await resolveReadLinks({ manuscriptRepoUrl: REPO, pagesUrl: PAGES }, probe);
    assert.equal(links.directDownloadHref, RAW, `repository answered ${repoStatus}`);
    assert.equal(links.pagesUrl, PAGES, `repository answered ${repoStatus}`);
    assert.equal(links.pdfWithheld, false, `repository answered ${repoStatus}`);
  }
});

// A stand-in for node:https request(): never connects, never answers.
function silentRequest() {
  const req = new EventEmitter();
  req.end = () => {};
  req.destroy = () => {};
  return req;
}

test('a probe that never answers settles as unknown (null) at its deadline', async () => {
  const started = Date.now();
  const status = await headStatus('https://example.invalid/', 50, silentRequest);
  assert.equal(status, null);
  assert.ok(Date.now() - started < 1000, 'settled near the deadline');
});

test('a socket timeout settles the probe once, as unknown', async () => {
  let req;
  const requestFn = () => {
    req = silentRequest();
    return req;
  };
  const pending = headStatus('https://example.invalid/', 5000, requestFn);
  req.emit('timeout');
  req.emit('error', new Error('late error after timeout'));
  assert.equal(await pending, null);
});
