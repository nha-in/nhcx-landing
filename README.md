# nhcx-landing-new

The NHCX Agentic AI Sandbox home page as a Vite + React + TypeScript build.

- Copy comes from the approved HTML template (`home-nhcx-sandbox-updated1.2`) and lives
  in `src/content.ts`. Link targets live in `links` and `footer` there; an empty
  string renders as plain text (or is left out) until someone supplies the URL.
- Theme and components follow the ABDM Developer Sandbox (sbxai.abdm.gov.in): the
  `--primary-*` palette, Albert Sans / Bricolage Grotesque / DM Mono, and its hero,
  card, navy band, milestone, journey, call-to-action and footer patterns
  (`src/styles/`).

- Two static documents are built: `index.html` (home) and `links/index.html` (the links
  page). Shared chrome lives in `src/pages/Shell.tsx`; `useHref()` in `src/routing.tsx`
  rewrites home-page anchors so the header and footer work from either page.
- The links page points at the sibling portals by absolute path (`/dev/`, `/uat/`), as
  `frontend-nginx/nginx.conf` serves them.

```
npm install
npm run dev        # http://localhost:7001
npm run build      # dist/, relative base, serves from any path
npm run build -- --base=/landing-new/
```

From the repository root, `make landing-new` builds it into `build/web/landing-new`.
