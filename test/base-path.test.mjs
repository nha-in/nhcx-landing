/**
 * Base-path smoke test: the same pages render once with NEXT_PUBLIC_BASE_PATH
 * set and must then carry no root-absolute internal link. The full-export
 * check on real build output is scripts/check-base-path.mjs (run by
 * `npm run build:landing`); this is the fast, per-render version that runs
 * on every `npm test`.
 *
 * `node --test` runs each file in its own process, so setting the variable
 * here cannot leak into smoke.test.mjs. lib/paths.ts reads it at call time.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';

process.env.NEXT_PUBLIC_BASE_PATH = '/landing';

import { basePath, withBase } from '@/lib/paths';
import RootLayout, { generateMetadata as rootMetadata } from '@/app/layout';
import Home from '@/app/page';
import NewsPage from '@/app/news/page';
import VideosPage from '@/app/videos/page';
import DevToolsPage from '@/app/devtools/page';
import DownloadPage from '@/app/download/page';
import DocumentationPage from '@/app/documentation/page';
import ApplyPage from '@/app/apply/page';
import ReleasesPage from '@/app/releases/page';

const BASE = '/landing';
/** href/src that starts with "/" but not with the base path. */
const ROOT_ABSOLUTE = /\b(?:href|src)="(\/(?!landing\/|\/)[^"]*)"/g;

async function render(Page, props) {
  return renderToString(await Page(props ?? {}));
}

function assertPrefixed(html, route) {
  const offenders = [...html.matchAll(ROOT_ABSOLUTE)].map((m) => m[1]);
  assert.deepEqual(offenders, [], `${route}: root-absolute links: ${offenders.slice(0, 8).join(', ')}`);
  assert.ok(html.includes(`href="${BASE}/`), `${route}: no link under ${BASE}/ at all`);
}

test('withBase() prefixes site paths and leaves everything else alone', () => {
  assert.equal(basePath(), BASE);
  assert.equal(withBase('/'), `${BASE}/`);
  assert.equal(withBase('/news/'), `${BASE}/news/`);
  assert.equal(withBase('/documentation/?p=04.04'), `${BASE}/documentation/?p=04.04`);
  assert.equal(withBase(`${BASE}/news/`), `${BASE}/news/`, 'already prefixed');
  assert.equal(withBase('#feed'), '#feed');
  assert.equal(withBase('?p=04.04'), '?p=04.04');
  assert.equal(withBase('https://example.gov.in/x'), 'https://example.gov.in/x');
  assert.equal(withBase('http://localhost:8080/apis'), 'http://localhost:8080/apis', 'console links pass through');
  assert.equal(withBase('//cdn.example/x'), '//cdn.example/x');
  assert.equal(withBase(undefined), undefined);
});

test('the root layout icon is prefixed', () => {
  const meta = rootMetadata();
  assert.equal(meta.icons.icon, `${BASE}/assets/hcx-logo.png`);
  assert.ok(renderToString(RootLayout({ children: 'body' })).includes('<html'));
});

for (const [route, Page] of [
  ['/', Home],
  ['/news/', NewsPage],
  ['/videos/', VideosPage],
  ['/devtools/', DevToolsPage],
  ['/download/', DownloadPage],
  ['/documentation/', DocumentationPage],
  ['/apply/', ApplyPage],
  ['/releases/', ReleasesPage],
]) {
  test(`${route} renders with every internal link under ${BASE}/`, async () => {
    assertPrefixed(await render(Page), route);
  });
}

test('the brand marks are served from under the base path', async () => {
  const html = await render(Home);
  for (const file of ['nha-logo.png', 'abdm-logo.png', 'pmjay-logo.png']) {
    assert.ok(html.includes(`src="${BASE}/assets/brand/${file}"`), `${file} is not prefixed`);
  }
});
