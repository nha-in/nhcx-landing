/**
 * Smoke test: every route renders from content/fallback.json.
 *
 * Each page component is rendered to a string with react-dom/server, exactly
 * as the static export does, and the HTML is checked for the failure modes
 * a green build does not catch: a thrown render, an editor placeholder such
 * as "[ press photo — 1200×750 ]" leaking into the page, an empty <main>, or
 * a link to a route that left the site (/apis and /learn live in the
 * DevTools console; /dashboard, /status and /playbook were retired).
 *
 * Run with `npm test` (scripts/build-tests.mjs bundles this file into test/dist/ first).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';

import RootLayout, { generateMetadata as rootMetadata } from '@/app/layout';
import Home from '@/app/page';
import DocumentationPage, { generateMetadata as documentationMetadata } from '@/app/documentation/page';
import DevToolsPage, { generateMetadata as devtoolsMetadata } from '@/app/devtools/page';
import DownloadPage, { generateMetadata as downloadMetadata } from '@/app/download/page';
import VideosPage, { generateMetadata as videosMetadata } from '@/app/videos/page';
import NewsPage, { generateMetadata as newsMetadata } from '@/app/news/page';
import ReleasesPage, { generateMetadata as releasesMetadata } from '@/app/releases/page';
import ApplyPage, { generateMetadata as applyMetadata } from '@/app/apply/page';
import { getContent } from '@/lib/content';

/** Bracketed editor notes: "[ press photo — 1200×750 ]", "[ paste URL ]". */
const PLACEHOLDER = /\[ [^\]\n]{2,120} \]/;
/** Routes that moved into the DevTools console or were retired, and the unresolved link scheme. */
const RETIRED = /href="(?:\/landing)?\/(?:apis|learn|dashboard|status|playbook)(?:\/|"|#)|devtools:/;

async function render(Page, props) {
  const element = await Page(props ?? {});
  return renderToString(element);
}

function check(html, route) {
  assert.ok(html.length > 500, `${route}: rendered almost nothing`);
  assert.ok(html.includes('<main'), `${route}: no <main> landmark`);
  assert.ok(html.includes('<header'), `${route}: no <header> landmark`);
  assert.ok(html.includes('<footer'), `${route}: no <footer> landmark`);
  // The documentation reader's <h1> is the corpus page title, which arrives
  // with the corpus on the client; every other route renders its own.
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  assert.ok(h1s <= 1 && (h1s === 1 || route === '/documentation/'), `${route}: expected exactly one <h1>, found ${h1s}`);
  const hit = html.match(PLACEHOLDER);
  assert.equal(hit, null, `${route}: placeholder text leaked into the page: ${hit?.[0]}`);
  assert.ok(!/lorem ipsum/i.test(html), `${route}: lorem ipsum in the page`);
  const retired = html.match(RETIRED);
  assert.equal(retired, null, `${route}: links to a retired route or an unresolved devtools: link: ${retired?.[0]}`);
}

const ROUTES = [
  ['/', Home, rootMetadata],
  ['/documentation/', DocumentationPage, documentationMetadata],
  ['/devtools/', DevToolsPage, devtoolsMetadata],
  ['/download/', DownloadPage, downloadMetadata],
  ['/videos/', VideosPage, videosMetadata],
  ['/news/', NewsPage, newsMetadata],
  ['/releases/', ReleasesPage, releasesMetadata],
  ['/apply/', ApplyPage, applyMetadata],
];

for (const [route, Page, metadata] of ROUTES) {
  test(`renders ${route}`, async () => {
    const html = await render(Page);
    check(html, route);
    const meta = await metadata();
    assert.ok(typeof meta.title === 'string' && meta.title.length > 0, `${route}: empty <title>`);
  });
}

test('the chrome carries the NHA, ABDM and PM-JAY marks and the primary navigation', async () => {
  const html = await render(Home);
  for (const alt of ['National Health Authority', 'Ayushman Bharat Digital Mission', 'Pradhan Mantri Jan Arogya Yojana']) {
    assert.ok(html.includes(`alt="${alt}"`), `masthead: no ${alt} mark`);
  }
  for (const href of ['https://nha.gov.in', 'https://abdm.gov.in', 'https://pmjay.gov.in']) {
    assert.ok(html.includes(`href="${href}"`), `masthead: no link to ${href}`);
  }
  assert.ok(html.includes('footer-brand'), 'footer: programme marks card missing');
  assert.ok(html.includes('aria-current="page"'), 'nav: no aria-current on the active link');
  assert.ok(!html.includes('level-chip'), 'nav: the learner level chip is still rendered');
});

test('the home page points at the DevTools console for the catalogue and the learning path', async () => {
  const html = await render(Home);
  const { global } = getContent();
  const root = (global.devtoolsUrl || 'http://localhost:8080').replace(/\/$/, '');
  assert.ok(html.includes(`href="${root}/apis"`), 'no link to the API catalogue in the console');
  assert.ok(html.includes(`href="${root}/learn"`), 'no link to the learning path in the console');
  assert.ok(html.includes('class="lp-hero'), 'no hero');
  assert.ok(html.includes('class="lp-net"'), 'no provider–NHCX–payer network diagram');
  assert.ok(html.includes('lp-journey'), 'no claim journey');
  assert.ok(html.includes('lp-figures'), 'no at-a-glance figures');
  assert.ok(html.includes('lp-count'), 'figures do not count up');
  assert.ok(!html.includes('ABDM · NHCX'), 'the ABDM · NHCX label is still rendered');
  assert.ok(html.includes('lp-onboard-steps'), 'no onboarding steps');
  assert.ok(html.includes('lp-specs-grid'), 'no specifications list');
  assert.ok(html.includes('hcx.integration@nha.gov.in'), 'no integration support contact');
});

test('/devtools/ lists what is inside the console', async () => {
  const html = await render(DevToolsPage);
  assert.ok(html.includes('Inside the console'), '/devtools/: no console section');
  for (const item of ['API catalogue', 'Learning path', 'FHIR builder', 'Simulator', 'Transaction logs']) {
    assert.ok(html.includes(item), `/devtools/: console list lacks ${item}`);
  }
});

test('/download/ lists the items of content/downloads.json, or says there are none', async () => {
  const html = await render(DownloadPage);
  assert.ok(html.includes('dl-table') || html.includes('dl-empty'), '/download/: neither a file table nor the empty state');
  assert.ok(html.includes('nhcx.abdm.gov.in'), '/download/: the NHCX specification links are missing');
  assert.ok(!/>\.in\/</.test(html) && html.includes('>Download</a>'), '/download/: buttons should read "Download"');
  assert.ok(!html.includes('gov-tricolour'), 'the tricolour rule is still rendered');
});

test('/news/ carries no sample-data banner, no newsletter form and no fabricated items', async () => {
  const html = await render(NewsPage);
  assert.ok(!html.includes('sample-banner'), '/news/: sample banner present');
  assert.ok(!/UTI NHCX connector|media@nha\.example|Developer clinic/.test(html), '/news/: pre-v6 placeholder copy');
  assert.ok(!html.includes('nl-form'), '/news/: newsletter form still rendered');
});

test('/videos/ says "Recording coming soon" for entries without a URL', async () => {
  const html = await render(VideosPage);
  assert.ok(html.includes('Recording coming soon'), '/videos/: no coming-soon marker');
  assert.ok(html.includes('Webinar materials'), '/videos/: no webinar group');
  assert.ok(!html.includes('href="#playlists"'), '/videos/: a planned recording still links to a fake player');
});

test('/releases/ lists every release note newest first', async () => {
  const html = await render(ReleasesPage);
  const versions = [...html.matchAll(/class="rn-version">([^<]+)</g)].map((m) => m[1]);
  assert.ok(versions.length >= 1, '/releases/: no entries');
  assert.deepEqual(versions, [...versions].sort().reverse(), '/releases/: not newest first');
});

test('the landing FAQ has at least 15 questions in topic groups with documentation links', async () => {
  const html = await render(Home);
  const questions = (html.match(/<summary>/g) ?? []).length;
  assert.ok(questions >= 15, `FAQ has ${questions} questions`);
  assert.ok((html.match(/class="lp-faq-topic"/g) ?? []).length >= 4, 'FAQ has fewer than 4 topic groups');
  assert.ok(html.includes('faq-docs'), 'FAQ answers do not link to the documentation');
});

test('renders the root layout', () => {
  const html = renderToString(RootLayout({ children: 'body' }));
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('family=Inter') && html.includes('IBM+Plex+Mono'), 'the layout does not load Inter and IBM Plex Mono');
});
