import fs from 'node:fs';
import path from 'node:path';

import type {
  ElementsChip,
  ElementsLink,
  Global,
  LandingPage,
  SiteContent,
} from './cms-types';

/** Every interface and section type generated from the Strapi schemas. */
export * from './cms-types';

/**
 * Aliases kept for the names the components already import. The shapes come
 * from the Strapi schemas via `lib/cms-types.ts` — see `npm run gen:types`.
 */
export type Link = ElementsLink;
export type Chip = ElementsChip;
export type GlobalContent = Global;
export type LandingContent = LandingPage;

/**
 * Content resolution order:
 *   1. content/snapshot.json — written by `npm run sync` from the Strapi CMS
 *   2. content/fallback.json — the committed baseline, regenerated from a live
 *      CMS with `npm run sync:fallback`; keeps the site buildable offline
 */
export function getContent(): SiteContent {
  const dir = path.join(process.cwd(), 'content');
  for (const name of ['snapshot.json', 'fallback.json']) {
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) continue;
    const content = JSON.parse(fs.readFileSync(file, 'utf8')) as SiteContent;
    assertUsable(content, name);
    return resolveDevtoolsLinks(content);
  }
  throw new Error('No content found: expected content/snapshot.json or content/fallback.json');
}

const DEVTOOLS_SCHEME = 'devtools:';

/**
 * Resolves the `devtools:` link scheme against `global.devtoolsUrl`.
 *
 * The API catalogue, the learning path, the simulator and the FHIR builder
 * live in the DevTools console, whose address differs between a laptop and a
 * deployment. Content therefore writes `devtools:/apis` rather than a host,
 * and the console's address is set once, on the global single type. Every
 * string in the snapshot that starts with the scheme is rewritten here, so
 * the components render plain hrefs and never learn about the convention.
 */
export function resolveDevtoolsLinks<T extends SiteContent>(content: T): T {
  const root = (content.global?.devtoolsUrl || 'http://localhost:8080').replace(/\/$/, '');
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value.startsWith(DEVTOOLS_SCHEME) ? `${root}${value.slice(DEVTOOLS_SCHEME.length)}` : value;
    }
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = walk(v);
      return out;
    }
    return value;
  };
  return walk(content) as T;
}

/**
 * Guards the one failure mode the old loader rendered as a blank page: an
 * unpublished Strapi single type answers `200 {"data": null}`, so a sync that
 * "succeeded" can leave a structurally empty branch in the snapshot. Failing
 * the build with the offending key beats shipping a page with no content.
 */
function assertUsable(content: SiteContent, source: string) {
  const missing: string[] = [];
  if (!content?.global) missing.push('global');
  if (!content?.landing?.sections?.length) missing.push('landing.sections');
  for (const [key, value] of Object.entries(content?.pages ?? {})) {
    if (!value || typeof value !== 'object') missing.push(`pages.${key}`);
  }
  for (const [key, value] of Object.entries(content?.collections ?? {})) {
    if (!Array.isArray(value)) missing.push(`collections.${key}`);
  }
  if (missing.length) {
    throw new Error(
      `content/${source} is missing or empty at: ${missing.join(', ')}.\n` +
        'Re-run `npm run sync` against a CMS where every single type is published.',
    );
  }
}
