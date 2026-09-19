import { useEffect, useRef } from 'react'
import headerLogo from '../assets/header-lockup.png'
import { links, nav, site } from '../content'
import { useHref } from '../routing'

export function Header() {
  const href = useHref()
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDetailsElement>(null)

  // Keep anchors below the sticky header when it wraps or text is enlarged.
  useEffect(() => {
    const header = headerRef.current
    if (!header || !('ResizeObserver' in window)) return
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        '--marketing-header-height',
        `${header.getBoundingClientRect().height}px`,
      )
    })
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const onClick = (event: MouseEvent) => {
      if (!menu.contains(event.target as Node)) menu.open = false
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false
        menu.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false
  }

  return (
    <header className="marketing-header" ref={headerRef}>
      <div className="marketing-container marketing-header-inner">
        <a className="marketing-brand" href={href(links.home)} aria-label={site.brandLabel}>
          <img src={headerLogo} alt={site.headerLogoAlt} width="656" height="124" />
        </a>
        <nav className="marketing-desktop-nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.label} href={href(item.href)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="marketing-header-actions">
          <a className="marketing-button marketing-button--primary marketing-button--small" href={links.register}>
            {site.registerCta}
          </a>
        </div>
        <details className="marketing-mobile-menu" ref={menuRef}>
          <summary aria-label="Navigation menu">
            <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label="Mobile navigation">
            {nav.map((item) => (
              <a key={item.label} href={href(item.href)} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <a href={links.register} onClick={closeMenu}>
              {site.registerCta} <span aria-hidden="true">→</span>
            </a>
          </nav>
        </details>
      </div>
    </header>
  )
}
