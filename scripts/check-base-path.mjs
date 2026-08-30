#!/usr/bin/env node
/**
 * Asserts that an export built with a base path carries no root-absolute
 * internal links.
 *
 * The site is served under `/landing/` in production. Every internal href is
 * meant to go through lib/paths.ts `withBase()`; one that does not — a raw
 * `<a href="/news/">`, a CMS link rendered without the helper, a staged file
 * under public/ — works in a preview at `/` and 404s on the real host. This
 * script walks the exported HTML and fails on any `href`/`src` that starts
 * with `/` but not with the base path.
 *
 *   node scripts/check-base-path.mjs --base /landing     # after a build
 *   NEXT_PUBLIC_BASE_PATH=/landing node scripts/check-base-path.mjs
 *
 * `npm run build:landing` runs it after the build. Without a base path there
 * is nothing to check and the script says so.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'out');

const args = process.argv.slice(2);
const flag = args.indexOf('--base');
const raw = (flag >= 0 ? args[flag + 1] : process.env.NEXT_PUBLIC_BASE_PATH) ?? '';
const base = raw.trim() && raw.trim() !== '/' ? `/${raw.trim().replace(/^\/+|\/+$/g, '')}` : '';

if (!base) {
  console.log('base-path: no base path set (NEXT_PUBLIC_BASE_PATH / --base) — nothing to check');
  process.exit(0);
}
if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error(`✖ base-path: no export at ${OUT} — run the build first`);
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

/** href="…", src="…", action="…" — the attributes that address a URL. */
const ATTR_RE = /\b(?:href|src|action|poster)="([^"]*)"/g;

const offenders = [];
let files = 0;
let prefixed = 0;
for (const file of htmlFiles(OUT)) {
  files += 1;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(ATTR_RE)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (url === base || url.startsWith(`${base}/`)) {
      prefixed += 1;
      continue;
    }
    offenders.push(`${path.relative(OUT, file)}: ${url}`);
  }
}

if (offenders.length) {
  console.error(`✖ base-path: ${offenders.length} root-absolute link(s) not under ${base}/ in ${files} HTML file(s):`);
  for (const line of offenders.slice(0, 40)) console.error(`    ${line}`);
  if (offenders.length > 40) console.error(`    … and ${offenders.length - 40} more`);
  console.error('  Route the link through withBase() in lib/paths.ts.');
  process.exit(1);
}
if (prefixed === 0) {
  console.error(`✖ base-path: no link under ${base}/ found — was the export built with NEXT_PUBLIC_BASE_PATH=${base}?`);
  process.exit(1);
}
console.log(`✔ base-path: ${files} HTML file(s), ${prefixed} link(s) under ${base}/, none root-absolute`);
