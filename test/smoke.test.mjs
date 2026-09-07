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
import DevToolsPage, { generateMetadata as devtoolsMetadata } from '@/app/devtools/page';
import PmjayPage, { generateMetadata as pmjayMetadata } from '@/app/pmjay/page';
import SkillPage, { generateMetadata as skillMetadata } from '@/app/skill/page';
import GetStartedPage, { generateMetadata as getStartedMetadata } from '@/app/get-started/page';
import DownloadPage, { generateMetadata as downloadMetadata } from '@/app/download/page';
import VideosPage, { generateMetadata as videosMetadata } from '@/app/videos/page';
import NewsPage, { generateMetadata as newsMetadata } from '@/app/news/page';
import ApplyPage, { generateMetadata as applyMetadata } from '@/app/apply/page';
import { getContent } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { groupDigits } from '@/lib/stats';
import { getStats } from '@/lib/stats-file';

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
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  assert.equal(h1s, 1, `${route}: expected exactly one <h1>, found ${h1s}`);
  const hit = html.match(PLACEHOLDER);
  assert.equal(hit, null, `${route}: placeholder text leaked into the page: ${hit?.[0]}`);
  assert.ok(!/lorem ipsum/i.test(html), `${route}: lorem ipsum in the page`);
  const retired = html.match(RETIRED);
  assert.equal(retired, null, `${route}: links to a retired route or an unresolved devtools: link: ${retired?.[0]}`);
}

const ROUTES = [
  ['/', Home, rootMetadata],
  ['/pmjay/', PmjayPage, pmjayMetadata],
  ['/devtools/', DevToolsPage, devtoolsMetadata],
  ['/skill/', SkillPage, skillMetadata],
  ['/get-started/', GetStartedPage, getStartedMetadata],
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

test('the designed pages take every heading and tagline from content/site.json', async () => {
  const copy = getSiteCopy('http://localhost:8080');
  // One string per page, chosen from the parts a component used to hold
  // inline: change it in the file and the page has to change with it.
  const pages = [
    ['/', Home, [copy.home.hero.titleAccent, copy.home.hero.text, copy.home.sandbox.text, copy.home.specs.lede]],
    ['/pmjay/', PmjayPage, [copy.pmjay.hero.lede, copy.pmjay.changed.title, copy.pmjay.sides.groups[0].who]],
    ['/devtools/', DevToolsPage, [copy.devtools.hero.intro, copy.devtools.adapter.useCasesTitle]],
    ['/skill/', SkillPage, [copy.skill.hero.lede, copy.skill.prompts.items[0], copy.skill.install]],
  ];
  for (const [route, Page, strings] of pages) {
    const html = await render(Page);
    for (const wanted of strings) {
      // react-dom/server escapes only these three in a text node.
      const escaped = wanted.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      assert.ok(html.includes(escaped), `${route}: "${wanted.slice(0, 48)}…" is not on the page`);
    }
  }
  // The chrome's own words come from the same file, on every route.
  const home = await render(Home);
  assert.ok(home.includes(copy.chrome.footer.phone), 'footer: the contact line is not from content/site.json');
  assert.ok(home.includes(copy.chrome.footer.credit), 'footer: the credit line is not from content/site.json');
});

test('the header button points at the documentation site, not at a local route', async () => {
  const html = await render(Home);
  const { global } = getContent();
  const nav = html.slice(html.indexOf('class="navbar"'), html.indexOf('</header>'));
  assert.ok(nav.includes('nav-tools'), 'header: the button slot is gone from the header row');
  // The documentation is a different site: the `docs:` scheme must have been
  // resolved against global.docsUrl, and nothing may be left unresolved or
  // pointing at a route this site no longer serves.
  assert.ok(global.docsUrl, 'global.docsUrl is not configured');
  assert.ok(nav.includes(`href="${global.docsUrl}`), `header: the button does not point at ${global.docsUrl}`);
  assert.ok(!nav.includes('docs:'), 'header: an unresolved docs: link reached the page');
  // Absolute, so it leaves this site. Checking for the string "/documentation/"
  // would not do it: the configured docs URL ends in that path itself.
  assert.match(nav, /href="https?:\/\//, 'header: the button is a relative link, so it stays on this site');
  assert.ok(global.applyCta?.label && !nav.includes(global.applyCta.label), 'header: the apply CTA is back in the header');
  assert.ok(nav.includes('>Links<'), 'header: the downloads link is not labelled "Links"');
  assert.ok(!/href="[^"]*\/news\/"/.test(nav), 'header: the news link is back in the navigation');
});

test('the home page prints the synced NHCX production figures', async () => {
  const html = await render(Home);
  // Through the same accessor and formatter the page uses: the bundle runs
  // from test/dist/, so a relative read of content/ would not resolve.
  const stats = getStats();
  assert.ok(stats, 'public/stats.json has not been synced; run npm run sync:stats');
  // FallingCount puts every digit in its own span, so the figure is only whole
  // once the tags are out of the way. Checking the text is also the check that
  // matters: it is what a reader and a screen reader are given.
  const text = html.replace(/<[^>]*>/g, '');
  for (const [sector, row] of Object.entries(stats.rows)) {
    for (const [measure, value] of Object.entries(row)) {
      assert.ok(text.includes(groupDigits(value)), `/: ${sector}.${measure} (${groupDigits(value)}) is not on the page`);
    }
  }
  // The stamp was removed on purpose; the figures carry no date on the page.
  assert.ok(!html.includes('lp-stats-stamp'), '/: the last-updated stamp is back');
});

test('/get-started/ asks the role first and renders both routes for it', async () => {
  const html = await render(GetStartedPage);
  const copy = getSiteCopy('http://localhost:8080').getStarted;
  assert.ok(html.includes(copy.question), '/get-started/: the question is not asked');
  for (const role of copy.roles) {
    assert.ok(html.includes(role.label), `/get-started/: no ${role.label} choice`);
    // Both routes are in the HTML and one is hidden, rather than only the
    // chosen one existing: no-JS and a printed page get the whole thing.
    for (const step of role.steps) {
      assert.ok(html.includes(step.title), `/get-started/: ${role.label} is missing "${step.title}"`);
    }
  }
  assert.ok(html.includes('role="tablist"'), '/get-started/: the choices are not a tablist');
});

test('the home page sends a first-time reader to /get-started/, not the form', async () => {
  const html = await render(Home);
  const hero = html.slice(html.indexOf('class="lp-hero'), html.indexOf('lp-banner') + 1 || undefined);
  assert.match(hero, /href="[^"]*\/get-started\/"/, 'hero: the call to action does not go to /get-started/');
});

test('the chrome carries the NHA and ABDM marks, PM-JAY in the footer, and the primary navigation', async () => {
  const html = await render(Home);
  for (const alt of ['National Health Authority', 'Ayushman Bharat Digital Mission']) {
    assert.ok(html.includes(`alt="${alt}"`), `masthead: no ${alt} mark`);
  }
  // PM-JAY settles claims over the exchange rather than publishing it, so its
  // roundel is a footer mark and a page of its own, not a masthead mark.
  const pmjay = (html.match(/alt="Pradhan Mantri Jan Arogya Yojana"/g) ?? []).length;
  assert.equal(pmjay, 1, 'PM-JAY should appear once, in the footer');
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
  assert.ok(html.includes('lp-stat-cards'), 'no NHCX statistics');
  assert.ok(!html.includes('lp-figures'), 'the at-a-glance figures are back alongside the statistics');
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

test('the landing FAQ has at least 15 questions in topic groups', async () => {
  const html = await render(Home);
  const questions = (html.match(/<summary>/g) ?? []).length;
  assert.ok(questions >= 15, `FAQ has ${questions} questions`);
  assert.ok((html.match(/class="lp-faq-topic"/g) ?? []).length >= 4, 'FAQ has fewer than 4 topic groups');
});

test('renders the root layout', () => {
  const html = renderToString(RootLayout({ children: 'body' }));
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes('family=Inter') && html.includes('IBM+Plex+Mono'), 'the layout does not load Inter and IBM Plex Mono');
});
