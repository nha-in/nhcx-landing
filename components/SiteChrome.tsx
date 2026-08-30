import type { GlobalContent } from '@/lib/content';
import FontSizeControls from '@/components/FontSizeControls';
import NavShadow from '@/components/NavShadow';
import { withBase } from '@/lib/paths';

/**
 * The site's chrome: a slim top strip (ministry line, accessibility
 * controls), one sticky header row (programme marks, navigation and the apply
 * button) and the navy footer.
 *
 * Every internal href goes through withBase(); links resolved from the
 * `devtools:` scheme and the programme sites are absolute and pass through.
 */

function marks(global: GlobalContent) {
  return [
    { src: global.nhaLogoUrl, alt: global.nhaAlt || 'National Health Authority', href: global.nhaHref || 'https://nha.gov.in', cls: 'mark-nha' },
    { src: global.abdmLogoUrl, alt: global.abdmAlt || 'Ayushman Bharat Digital Mission', href: global.abdmHref || 'https://abdm.gov.in', cls: 'mark-roundel' },
    { src: global.pmjayLogoUrl, alt: global.pmjayAlt || 'Pradhan Mantri Jan Arogya Yojana', href: global.pmjayHref || 'https://pmjay.gov.in', cls: 'mark-roundel' },
  ].filter((m) => m.src);
}

/** The slim strip above the header: ministry line, ribbon links and the A- / A / A+ control. */
export function GovRibbon({ global }: { global: GlobalContent }) {
  return (
    <div className="gov">
      <div className="gov-bar">
        <div className="container gov-inner">
          <span className="gov-text">{global.ribbonText}</span>
          <span className="gov-links">
            {global.ribbonLinks?.map((link) =>
              link.url ? (
                <a key={link.label} href={withBase(link.url)}>
                  {link.label}
                </a>
              ) : (
                <span key={link.label}>{link.label}</span>
              ),
            )}
            <FontSizeControls />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Sticky header row: programme marks on the left, navigation and apply on the right. */
export function Navbar({ global, currentPath = '/' }: { global: GlobalContent; currentPath?: string }) {
  return (
    <div className="navbar">
      <NavShadow />
      <div className="container navbar-inner">
        <div className="brand">
          <ul className="brand-marks" aria-label="Programme partners">
            {marks(global).map((mark) => (
              <li key={mark.alt}>
                <a href={mark.href} className={mark.cls} title={mark.alt}>
                  <img src={withBase(mark.src)} alt={mark.alt} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav className="nav-links" aria-label="Primary">
          {global.navLinks?.map((link) => {
            const active = link.url === currentPath;
            return (
              <a key={link.label} href={withBase(link.url)} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
                {link.label}
              </a>
            );
          })}
        </nav>
        <div className="nav-tools">
          {global.applyCta && (
            <a href={withBase(global.applyCta.url)} className="btn btn-sm btn-primary">
              {global.applyCta.label} <span className="chev" aria-hidden="true">›</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** `2026-08-25T…` → `25 Aug 2026`, fixed at build time. */
function buildDate(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Footer({ global }: { global: GlobalContent }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          {marks(global).map((mark) => (
            <a key={mark.alt} href={mark.href} className={mark.cls} title={mark.alt}>
              <img src={withBase(mark.src)} alt={mark.alt} />
            </a>
          ))}
        </div>
        <div className="footer-grid">
          {global.footerColumns?.map((column) => (
            <nav key={column.title} className="footer-col" aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links?.map((link) => (
                  <li key={link.label}>
                    <a href={withBase(link.url)}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="footer-col">
            <h2>Contact</h2>
            <div className="footer-contact">
              <div>
                9th floor, Tower-I, Jeevan Bharati Building,
                <br />
                Connaught Place, New Delhi – 110001
              </div>
              <div>Toll-free 14555</div>
            </div>
          </div>
        </div>
        <div className="footer-legal">
          <span>{global.copyright}</span>
          <span className="footer-legal-links">
            {global.legalLinks?.map((link) => (
              <a key={link.label} href={withBase(link.url)}>
                {link.label}
              </a>
            ))}
            {global.subFooterLinks?.map((link) => (
              <a key={`sub-${link.label}`} href={withBase(link.url)}>
                {link.label}
              </a>
            ))}
          </span>
          <span>Designed and developed by National Health Authority (NHA), Government of India.</span>
          <span className="footer-updated">Last updated {buildDate()}</span>
        </div>
      </div>
    </footer>
  );
}

/**
 * The page frame every route uses: skip link, header (top strip and the
 * sticky header row), the main landmark around the page's own sections,
 * and the footer. The header and footer keep the site's container width on
 * every page; `wide` only lets <main> spread (the documentation reader).
 */
export function PageShell({
  global,
  currentPath,
  wide = false,
  children,
}: {
  global: GlobalContent;
  currentPath: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <GovRibbon global={global} />
        <Navbar global={global} currentPath={currentPath} />
      </header>
      <main id="main" className={wide ? 'main-wide' : undefined}>
        {children}
      </main>
      <Footer global={global} />
    </>
  );
}
