/**
 * The base path comes from NEXT_PUBLIC_BASE_PATH — empty for a preview at `/`,
 * `/landing` for the production export served under that prefix (see
 * scripts/web-apps.conf at the repository root and landing/deploy). Next
 * prefixes its own chunks from `basePath`; the site's own links go through
 * lib/paths.ts `withBase()`, which reads the same variable.
 */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').trim();
const basePath = rawBase && rawBase !== '/' ? `/${rawBase.replace(/^\/+|\/+$/g, '')}` : '';

/** `next dev`; `next build` (and the export) run with NODE_ENV=production. */
const isDev = process.env.NODE_ENV !== 'production';

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

  /**
   * In production nginx serves the chat service at /chatbot/ alongside this
   * export (see lib/chat.ts), so the assistant is a same-origin path. `next
   * dev` has no such neighbour, so this gives a developer the same /chatbot
   * the deployed site has.
   *
   * Only under `next dev`: `output: 'export'` ignores rewrites and warns about
   * every one it finds, and there is nothing for it to do at build time.
   */
  ...(isDev
    ? {
        async rewrites() {
          const upstream = (process.env.NHCX_ASSISTANT_UPSTREAM ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
          return [{ source: '/chatbot/:path*', destination: `${upstream}/:path*` }];
        },
      }
    : {}),
};

export default nextConfig;
