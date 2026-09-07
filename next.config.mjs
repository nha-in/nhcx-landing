/**
 * The base path comes from NEXT_PUBLIC_BASE_PATH — empty for a preview at `/`,
 * `/landing` for the production export served under that prefix (see
 * scripts/web-apps.conf at the repository root and landing/deploy). Next
 * prefixes its own chunks from `basePath`; the site's own links go through
 * lib/paths.ts `withBase()`, which reads the same variable.
 */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim();
const basePath = rawBase && rawBase !== '/' ? `/${rawBase.replace(/^\/+|\/+$/g, '')}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  // `next dev` is pointed at its own directory (see the dev script), so a
  // production build cannot trample the chunks a running dev server is
  // serving. `next build` keeps .next/ and exports to out/ as before.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',

};

export default nextConfig;
