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

test('/devtools/ lists what is inside DevTools', async () => {
  const html = await render(DevToolsPage);
  assert.ok(html.includes('id="console-title"'), '/devtools/: no DevTools section');
  assert.ok(html.includes('NHCX Adapter'), '/devtools/: the adapter is not named');
  assert.ok(/<a[^>]+github\.com[^>]+target="_blank"/.test(html), '/devtools/: GitHub links do not open in a new tab');
  assert.ok(!html.includes('console-grid'), '/devtools/: the console tile list is still rendered');
  for (const item of ['Starting from zero', 'Preparing your first claim', 'Put an existing system on NHCX']) {
    assert.ok(html.includes(item), `/devtools/: use cases lack ${item}`);
  }
});

test('/download/ lists the items of content/downloads.json, or says there are none', async () => {
  const html = await render(DownloadPage);
  assert.ok(html.includes('dl-table') || html.includes('dl-empty'), '/download/: neither a file table nor the empty state');
  assert.ok(html.includes('nhcx.abdm.gov.in'), '/download/: the NHCX specification links are missing');
  assert.ok(html.includes('class="dl-get"'), '/download/: rows have no get link');
  assert.ok(!html.includes('<th scope="col">Type</th>'), '/download/: the Type column is still rendered');
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

test('a ```mermaid fence renders as a drawable md-mermaid figure', async () => {
  const { renderMarkdown } = await import('@/lib/markdown');
  const doc = renderMarkdown(
    '# Flow\n\n```mermaid\nflowchart LR\n  A[HMIS] -->|claim| B[NHCX]\n```\n',
  );
  // The renderer marks the source up for lib/mermaid.ts to draw client-side;
  // the sanitiser must let the figure, its class and its state through.
  assert.ok(doc.html.includes('<figure class="md-mermaid" data-state="pending">'), 'no md-mermaid figure');
  assert.ok(doc.html.includes('class="md-mermaid-source"'), 'diagram source not kept in the figure');
  assert.ok(doc.html.includes('flowchart LR'), 'diagram text lost');
  // An ordinary fence must keep the plain code path.
  const code = renderMarkdown('```json\n{ "a": 1 }\n```\n');
  assert.ok(code.html.includes('<figure class="md-code"'), 'plain fence no longer renders as code');
});

test('a page image is resolved against the page, not the reader route', async () => {
  const { renderMarkdown } = await import('@/lib/markdown');
  // The corpus embeds images relative to the markdown file. The reader lives
  // at /documentation/, so an unresolved source would point at /assets/… and
  // 404 — every doc image did until the document's URL was passed in.
  const src = '![figure 1](../assets/images/documents/flow/flow-01.png)';
  const page = renderMarkdown(src, { baseUrl: '/docs/06-pmjay-flow/03-integration-overview.md' });
  assert.ok(
    page.html.includes('src="/docs/assets/images/documents/flow/flow-01.png"'),
    `relative image not resolved: ${page.html}`,
  );
  // No base URL, no rewriting: the chat transcript renders the same function.
  assert.ok(renderMarkdown(src).html.includes('src="../assets/images/'), 'image rewritten without a base');
  // An absolute source is left alone.
  const remote = renderMarkdown('![x](https://example.test/a.png)', { baseUrl: '/docs/a/b.md' });
  assert.ok(remote.html.includes('src="https://example.test/a.png"'), 'absolute image source rewritten');
});
