import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/albert-sans'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/landing.css'

import { Home } from './pages/Home'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
