/**
 * The single source of truth for the Strapi ↔ frontend contract.
 *
 * Every endpoint the site consumes is declared once, here, with the Strapi
 * schema UID it comes from and the populate tree it needs. Three consumers
 * read this file:
 *
 *   scripts/sync-content.mjs   — fetches and validates each entry
 *   scripts/gen-cms-types.mjs  — generates lib/cms-types.ts from the UIDs
 *   scripts/sync-cms-map.mjs   — copies the populate tree and endpoint list to
 *                                ../cms/data/cms-map.json, which the CMS reads
 *                                at bootstrap (seed, migrations, permissions)
 *   lib/content.ts             — consumes the generated types
 *
 * Adding a field to a Strapi schema and forgetting to populate it, or renaming
 * a content type without updating the frontend, is a build error rather than a
 * silently missing section on the live site.
 */

/** Populate tree for each component allowed in the landing dynamic zone. */
export const SECTION_POPULATE = {
  'sections.hero': { populate: ['primaryCta', 'secondaryCta', 'providers', 'payers', 'startTiles'] },
  'sections.actors': { populate: ['actors'] },
  'sections.pipeline': { populate: ['targetChecks', 'metrics'] },
  'sections.capabilities': { populate: ['features'] },
  'sections.split-benefits': { populate: { columns: { populate: ['cards'] }, traits: true } },
  'sections.live-stats': { populate: ['stats'] },
  // Retired with the network dashboard: the component stays in the Strapi
  // dynamic zone (existing databases still hold rows), so it is still
  // populated; the landing page (components/landing) does not render it.
  'sections.dashboard-promo': { populate: ['cta', 'rows', 'secondaryLink'] },
  'sections.steps': { populate: ['steps', 'cta'] },
  // `integration-kit` is the pre-rename UID, kept registered so databases that
  // have not yet run the v3 migration still sync. Both render as DevTools.
  'sections.integration-kit': { populate: ['steps', 'primaryCta', 'secondaryCta', 'metaChips'] },
  'sections.devtools': { populate: ['steps', 'primaryCta', 'secondaryCta', 'metaChips'] },
  'sections.faq': { populate: ['items'] },
  'sections.cta': { populate: ['primaryCta', 'secondaryCta'] },
};

/**
 * Single type holding the shared chrome. Each media attribute becomes a
 * `…Url` key in the snapshot; when nothing is uploaded the site uses the
 * copy staged under public/assets (the NHA, ABDM and PM-JAY marks are the
 * portal's own artwork, checked in at public/assets/brand).
 *
 * Link URLs anywhere in the content may use the `devtools:` scheme
 * (`devtools:/apis`, `devtools:/learn`): lib/content.ts resolves it against
 * `global.devtoolsUrl`, so the console's address is set once.
 */
export const GLOBAL = {
  key: 'global',
  uid: 'global',
  path: '/api/global',
  populate: {
    ribbonLinks: true,
    navLinks: true,
    applyCta: true,
    logo: true,
    nhaMark: true,
    abdmMark: true,
    pmjayMark: true,
    nhaMarkWhite: true,
    footerColumns: { populate: ['links'] },
    legalLinks: true,
    subFooterLinks: true,
  },
  /** Media attribute → the snapshot key holding its downloaded local path. */
  media: {
    logo: { key: 'logoUrl', fallback: '/assets/hcx-logo.png' },
    nhaMark: { key: 'nhaLogoUrl', fallback: '/assets/brand/nha-logo.png' },
    abdmMark: { key: 'abdmLogoUrl', fallback: '/assets/brand/abdm-logo.png' },
    pmjayMark: { key: 'pmjayLogoUrl', fallback: '/assets/brand/pmjay-logo.png' },
    nhaMarkWhite: { key: 'nhaLogoWhiteUrl', fallback: '/assets/brand/nha-logo-white.png' },
  },
};

export const LANDING = {
  key: 'landing',
  uid: 'landing-page',
  path: '/api/landing-page',
  populate: { seo: true, sections: { on: SECTION_POPULATE } },
};

/**
 * Single types rendered as their own route, keyed as `content.pages.<key>`.
 * The API catalogue (`api-catalogue-page` + `api-entry`) and the learning
 * path (`learn-page`) left this list in v7: both live in the DevTools console.
 * The dashboard, status and playbook pages were retired from the site; their
 * single types stay in the CMS but are no longer synced.
 */
export const PAGES = [
  {
    // The route and the section component are both `devtools`; the single type
    // kept its original UID so the rename needed no table migration.
    key: 'devtools',
    uid: 'integration-kit-page',
    path: '/api/integration-kit-page',
    populate: [
      'seo', 'primaryCta', 'secondaryCta', 'metaChips', 'buildChangelog',
      'features', 'downloads', 'checklistItems', 'checklistLinks', 'consoleTiles',
    ],
  },
  {
    key: 'videos',
    uid: 'videos-page',
    path: '/api/videos-page',
    populate: ['seo', 'channelCta', 'footLink'],
  },
  {
    key: 'news',
    uid: 'news-page',
    path: '/api/news-page',
    populate: ['seo', 'events', 'upcomingLink'],
  },
  {
    key: 'apply',
    uid: 'apply-page',
    path: '/api/apply-page',
    populate: ['seo'],
  },
];

/** Collection types, keyed as `content.collections.<key>`. */
export const COLLECTIONS = [
  /** Sync fails if a required collection comes back empty — the page needs these. */
  { key: 'videos', uid: 'video', path: '/api/videos', populate: ['outline'], sort: 'rank', required: true },
  { key: 'newsItems', uid: 'news-item', path: '/api/news-items', sort: 'rank', required: true },
  {
    key: 'releaseNotes',
    uid: 'release-note',
    path: '/api/release-notes',
    populate: ['highlights', 'breaking', 'links'],
    sort: ['date:desc', 'version:desc'],
    required: true,
  },
];

/**
 * Write-only / query-only endpoints the browser talks to directly. They are
 * not synced; they are listed here so the contract has one home.
 *   POST /api/integrator-applications                 (public create, multipart)
 */
export const RUNTIME = {
  applicationCreate: '/api/integrator-applications',
};

/**
 * The public-role permissions behind RUNTIME, as Strapi action UIDs. The CMS
 * grants these at bootstrap (via cms/data/cms-map.json) next to the read
 * permissions it derives from ENDPOINTS, so a new browser-facing endpoint is
 * declared here and nowhere else. find/findOne on these types stay
 * admin-only: the rows hold contact data.
 */
export const RUNTIME_ACTIONS = [
  'api::integrator-application.integrator-application.create',
];

/** Every endpoint, in fetch order. */
export const ENDPOINTS = [
  { ...GLOBAL, kind: 'single', slot: 'root' },
  { ...LANDING, kind: 'single', slot: 'root' },
  ...PAGES.map((p) => ({ ...p, kind: 'single', slot: 'pages' })),
  ...COLLECTIONS.map((c) => ({ ...c, kind: 'collection', slot: 'collections' })),
];

export const PAGE_SIZE = 100;
