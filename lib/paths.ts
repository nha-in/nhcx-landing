/**
 * The site's base path, and the one place an internal link is prefixed with it.
 *
 * The export is served under `/landing/` in production (scripts/web-apps.conf,
 * landing/deploy/nginx/landing.conf) and at `/` in local previews. Next.js
 * prefixes its own chunks from `basePath` in next.config.mjs, but the site
 * writes plain anchors — content from the CMS, hand-written routes, the
 * search index, staged files under public/ — and those must be prefixed by
 * hand. Every such href goes through `withBase()`, so the same export works
 * at either location and the base-path check (scripts/check-base-path.mjs)
 * can fail the build when one is missed.
 *
 * `NEXT_PUBLIC_BASE_PATH` is read at call time rather than module load: in
 * the browser bundle Next inlines the value at build time, and in the smoke
 * tests the same code renders once with and once without a base path.
 */

/** The configured base path, normalised to `/landing` (or `` for none). */
export function basePath(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim();
  if (!raw || raw === '/') return '';
  return `/${raw.replace(/^\/+|\/+$/g, '')}`;
}

/** True for a root-absolute path on this site (`/apis/`), false for anything else. */
export function isSiteAbsolute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/**
 * Prefix a root-absolute internal href with the base path. Relative links,
 * anchors, query-only links (`?p=04.04`) and external URLs pass through, as
 * does a path that is already prefixed.
 */
export function withBase(href: string): string;
export function withBase(href: string | undefined): string | undefined;
export function withBase(href: string | undefined): string | undefined {
  if (href === undefined || !isSiteAbsolute(href)) return href;
  const base = basePath();
  if (!base) return href;
  if (href === base || href.startsWith(`${base}/`)) return href;
  return `${base}${href}`;
}
