import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The page is a single document with no router, so the default base is
// relative and the build can be served from any path. Override it the same
// way as the other portals when an absolute base is wanted:
//   npm run build -- --base=/landing-new/
//   VITE_BASE_PATH=/landing-new/ npm run build
const rawBase = process.env.VITE_BASE_PATH || process.env.BASE_URL || process.env.BASE_PATH || './'
const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    // Two static documents: the home page and links/.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        links: resolve(import.meta.dirname, 'links/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // 7000 is the Next landing, 5173 to 5175 are the portals.
    port: 7001,
    strictPort: true,
  },
})
