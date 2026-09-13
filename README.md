# NHCX landing (Figma "Final Design")

The home page built from the Figma file *Kyro-care › Homepage Redesign › Final Designs › Final Design*.
Next.js 15 static export, plain CSS, no Tailwind — the same stack and layout as `../landing-old`.

- `app/page.tsx` — the page, one component per design section in `components/landing/`.
- `styles/globals.css` — tokens, `.wrap`, `.btn`; `styles/landing.css` — every section, in page order.
- `public/assets/` — assets exported from Figma (waves, illustrations, screenshots, logos), committed
  because the Figma asset URLs expire.
- Links go through `lib/paths.ts` `withBase()` so the export works at `/` and under `/landing`.
- `public/stats.json` — the NHA dashboard figures, refreshed by `npm run sync:stats` (the build runs it
  first and keeps the committed copy if the API is unreachable). The strip re-reads the served file on
  load, so replacing that one file moves the figures on without a rebuild.

```sh
npm install
npm run dev            # http://localhost:7000
npm run sync:stats     # refresh public/stats.json from the NHA dashboard
npm run build          # sync stats, then static export to out/
npm run build:landing  # same, prefixed for /landing
```
