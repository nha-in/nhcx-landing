/**
 * The documentation corpus, as the browser reads it.
 *
 * The corpus is the docs project, staged into `public/docs` at build time by
 * `scripts/sync-docs.mjs` and emitted verbatim by the static export. There is
 * no server to ask, so a page is just a file:
 *
 *   /docs/manifest.json                                  the navigation
 *   /docs/04-transaction-flows/03-preauthorization.md    one page
 *
 * The manifest is the same one the HCX Kit console reads from disk over
 * /internal/content/docs, so a page's address is the same in both: its
 * chapter.subchapter code — `04.03` — resolved here into a path to fetch.
 */
import { withBase } from '@/lib/paths';

/** One documentation page, as described by public/docs/manifest.json. */
export interface DocsManifestPage {
  /** chapter.subchapter — `04.03`. The page's address in the reader URL. */
  code: string;
  /** Path under public/docs, e.g. `04-transaction-flows/03-preauthorization.md`. */
  path: string;
  /** Human-readable alternative address, `transaction-flows/pre-authorisation-flow`. */
  slug: string;
  title: string;
  summary: string;
  section: string;
  keywords: string[];
  headings: string[];
  words: number;
}

export interface DocsManifestSection {
  id: string;
  title: string;
  /** Page codes, in reading order. */
  pages: string[];
}

export interface DocsManifest {
  generated: string;
  source: { docs: string; corpus: string; release: Record<string, unknown> | null };
  sections: DocsManifestSection[];
  pages: DocsManifestPage[];
}

/** Set this to host the corpus somewhere other than <site root>/docs. */
const CONFIGURED = (process.env.NEXT_PUBLIC_DOCS_BASE ?? '').replace(/\/$/, '');

/**
 * Where the staged corpus is served from.
 *
 * The corpus sits at <site root>/docs and the reader lives one level down at
 * /documentation/, so the default is resolved *relatively* rather than as an
 * absolute /docs. An export served under a path prefix — /nhcx/documentation/
 * — then finds /nhcx/docs without being told, which an origin-rooted URL
 * would not.
 */
function base(): string {
  if (CONFIGURED) return CONFIGURED;
  if (typeof window === 'undefined') return withBase('/docs');
  return new URL('../docs', window.location.href).href.replace(/\/$/, '');
}

/** The URL of one staged file, by its path in the manifest. */
export function docsFileUrl(path: string): string {
  return `${base()}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/**
 * The documentation manifest — every page with its code, title and summary.
 * Returns null when no corpus is staged (a build that never ran
 * `npm run sync:docs`), and throws only when the fetch itself fails.
 */
export async function fetchDocsManifest(): Promise<DocsManifest | null> {
  const res = await fetch(`${base()}/manifest.json`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // A static host that answers 200 with its index page for a missing file
  // would otherwise land here as a JSON parse error.
  const manifest = (await res.json().catch(() => null)) as DocsManifest | null;
  return manifest?.pages?.length ? manifest : null;
}

let manifestPromise: Promise<DocsManifest | null> | null = null;

/**
 * The manifest, fetched at most once per page load. Chat citations name pages
 * by path and the reader addresses them by code, so both resolve through this
 * one copy.
 */
export function loadDocsManifest(): Promise<DocsManifest | null> {
  manifestPromise ??= fetchDocsManifest().catch(() => null);
  return manifestPromise;
}

/** One documentation page's markdown, by its path in the manifest. */
export async function fetchDocsPage(path: string): Promise<string> {
  const res = await fetch(docsFileUrl(path));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
