import { createContext, useContext } from 'react'
import { LINKS_PAGE } from './content'

export type Page = 'home' | 'links'

const PageContext = createContext<Page>('home')
export const PageProvider = PageContext.Provider

/**
 * Resolves a content href for the page being rendered. The build is two static
 * documents (index.html and links/index.html) under a relative base, so a
 * home-page anchor such as "#journey" becomes "../#journey" on the links page.
 */
export function useHref() {
  const page = useContext(PageContext)
  return (href: string) => {
    if (href === LINKS_PAGE) return page === 'links' ? '#top' : 'links/'
    if (page === 'links' && href.startsWith('#')) return href === '#top' ? '../' : `../${href}`
    return href
  }
}
