#!/usr/bin/env node
/**
 * One authored file in, every content file the app reads out.
 *
 *     content/site.yaml  ->  content/fallback.json
 *                            content/site.json
 *                            content/news.json
 *                            content/videos.json
 *                            content/download.json
 *
 * Every word on the site lives in the YAML, along with the two addresses that
 * are not on this site at all: where the DevTools console is and where the
 * documentation is. Content links to those with the `devtools:` and `docs:`
 * schemes, and lib/content.ts resolves them against these values when a page
 * renders, so a deployment changes an address in one place.
 *
 * The generated JSON is what the app loads, unchanged from before this script
 * existed: the loaders in lib/ never learned about YAML, so nothing at request
 * time depends on the parser and a build that skips this step still renders
 * from the JSON already committed.
 *
 *   NHCX_DEVTOOLS_URL  override config.devtoolsUrl
 *   NHCX_DOCS_URL      override config.docsUrl
 *
 *   node scripts/content.mjs           write the JSON
 *   node scripts/content.mjs --check   fail if the JSON is out of date
 *   node scripts/content.mjs --from-json   rebuild the YAML from the JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parse, stringify } from 'yaml';

const HEADER = `# Every word on the site, and the two addresses that are not on it.
#
# This is the only file to edit. \`npm run content\` writes the JSON the app
# loads; \`npm run build\` does it for you. Links to the DevTools console are
# written \`devtools:/apis\`, links to the documentation \`docs:/\`, and both
# resolve against config below when a page renders.
`;

const ROOT = path.join(import.meta.dirname, '..');
const YAML_FILE = path.join(ROOT, 'content', 'site.yaml');
const json = (name) => path.join(ROOT, 'content', name);

/** Which branch of the YAML becomes which file. */
const FILES = {
  'fallback.json': (d) => ({ global: d.global, landing: d.landing, pages: d.pages, collections: d.collections }),
  'site.json': (d) => d.copy,
  'news.json': (d) => d.news,
  'videos.json': (d) => d.videos,
  'download.json': (d) => d.downloads,
};

const args = process.argv.slice(2);
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** The YAML, with the two addresses folded into `global` where the app reads them. */
function load() {
  if (!fs.existsSync(YAML_FILE)) {
    console.error(`– ${path.relative(ROOT, YAML_FILE)} is missing`);
    process.exit(1);
  }
  const doc = parse(fs.readFileSync(YAML_FILE, 'utf8'));
  const config = doc.config ?? {};
  doc.global = {
    ...doc.global,
    devtoolsUrl: process.env.NHCX_DEVTOOLS_URL || config.devtoolsUrl || doc.global?.devtoolsUrl,
    docsUrl: process.env.NHCX_DOCS_URL || config.docsUrl || doc.global?.docsUrl,
  };
  return doc;
}

if (args.includes('--from-json')) {
  // Seed the YAML from the JSON that exists. Run once; after that the YAML is
  // the source and this direction is only for recovering it.
  const read = (name) => JSON.parse(fs.readFileSync(json(name), 'utf8'));
  const fallback = read('fallback.json');
  const { devtoolsUrl, docsUrl, ...global } = fallback.global;
  const doc = {
    config: { devtoolsUrl, docsUrl },
    global,
    landing: fallback.landing,
    pages: fallback.pages,
    collections: fallback.collections,
    copy: read('site.json'),
    news: read('news.json'),
    videos: read('videos.json'),
    downloads: read('download.json'),
  };
  fs.writeFileSync(YAML_FILE, `${HEADER}${stringify(doc, { lineWidth: 0 })}`);
  console.log(`✔ content/site.yaml written from the JSON (${fs.statSync(YAML_FILE).size} bytes)`);
  process.exit(0);
}

const doc = load();
let stale = [];
for (const [name, pick] of Object.entries(FILES)) {
  const value = pick(doc);
  if (value === undefined) continue;
  const file = json(name);
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (args.includes('--check')) {
    if (current !== next) stale.push(name);
  } else if (current !== next) {
    write(file, value);
  }
}

if (args.includes('--check')) {
  if (stale.length) {
    console.error(`– content/site.yaml has changes not built into ${stale.join(', ')}; run npm run content`);
    process.exit(1);
  }
  console.log('✔ content JSON matches content/site.yaml');
} else {
  console.log(`✔ content/site.yaml → ${Object.keys(FILES).join(', ')}`);
}
