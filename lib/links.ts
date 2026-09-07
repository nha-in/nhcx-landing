import type { Global } from './cms-types';

/**
 * Link helpers shared by the sections and pages.
 *
 * The API catalogue and the learning path live in the DevTools console, not
 * on this site. Content addresses them with the `devtools:` scheme
 * (`devtools:/apis`, `devtools:/learn`), which lib/content.ts resolves against
 * `global.devtoolsUrl` when the snapshot is loaded; the helpers here cover
 * the few links that are built in code rather than authored in the CMS.
 */

/** The DevTools console's address, without a trailing slash. */
export function consoleUrl(global: Pick<Global, 'devtoolsUrl'>): string {
  return (global.devtoolsUrl || 'http://localhost:8080').replace(/\/$/, '');
}

/** A catalogue entry in the console, by slug. */
export function consoleApiHref(global: Pick<Global, 'devtoolsUrl'>, slug: string): string {
  return `${consoleUrl(global)}/apis/${encodeURIComponent(slug)}`;
}

/** True for a link that leaves the site (the console, nha.gov.in, …). */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}
