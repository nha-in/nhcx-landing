import type { ReactNode } from 'react'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { UtilityStrip } from '../components/UtilityStrip'
import { PageProvider, type Page } from '../routing'

export function Shell({ page, children }: { page: Page; children: ReactNode }) {
  return (
    <PageProvider value={page}>
      <div className="marketing-shell">
        <UtilityStrip />
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </PageProvider>
  )
}
