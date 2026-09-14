# NHCX landing (Figma "Final Design")

The NHCX site: the home page built from the Figma file *Kyro-care › Homepage Redesign › Final Designs ›
Final Design*, and the PM-JAY, DevTools, AI Skill, Links and FAQ pages on the same theme.
Next.js 15 static export, plain CSS, no Tailwind — the same stack and layout as `../landing-old`.

## Words and links

Every word and link on the site is in **`content/site.yaml`**, one section per page (`site` holds what
every page shares: tab titles, header, footer). Edit a value and save: `npm run dev` shows it at once,
and `npm run build` bakes it into the export. Keep the keys as they are; the components find the words
by them, and a missing section fails the build. Each `lib/*-copy.ts` module types one section of the file
(`lib/site-copy.ts`, `lib/home-copy.ts`, `lib/pmjay-copy.ts`, and so on). The YAML is parsed at build time
by `scripts/yaml-loader.cjs`, so no parser ships to the browser, and each page imports only its own section.

## Layout

- `app/*/page.tsx` — the pages; one component per section in `components/<page>/`.
- `styles/globals.css` — tokens, `.wrap`, `.btn`; `styles/landing.css` — the home page, in page order;
  `styles/tools.css` — the shared page pieces (`.tl-*`) and the DevTools, AI Skill and Links pages;
  `styles/pmjay.css` — what only the PM-JAY page has.
- `public/assets/` — assets exported from Figma (waves, illustrations, screenshots, logos), committed
  because the Figma asset URLs expire.
- Links go through `lib/paths.ts` `withBase()` so the export works at `/` and under `/landing`.
- `public/stats.json` — the NHA dashboard figures, refreshed by `npm run sync:stats` (the build runs it
  first and keeps the committed copy if the API is unreachable). The strip re-reads the served file on
  load, so replacing that one file moves the figures on without a rebuild.

## Commands

```sh
npm install
npm run dev            # http://localhost:7000
npm run sync:stats     # refresh public/stats.json from the NHA dashboard
npm run build          # sync stats, then static export to out/
npm run build:landing  # same, prefixed for /landing
```
