import footerLogo from '../assets/footer-lockup.png'
import { footer, site } from '../content'
import { useHref } from '../routing'
import { SocialGlyph } from './icons'

/** A link, or plain text while its destination is still unknown. */
function FooterLink({ label, href }: { label: string; href: string }) {
  const resolve = useHref()
  return href ? <a href={resolve(href)}>{label}</a> : <span>{label}</span>
}

export function Footer() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-container">
        <div className="marketing-footer-intro">
          {/* The lockup is drawn in white, so it sits on the navy panel. */}
          <div className="marketing-footer-logos">
            <img src={footerLogo} alt={site.footerLogoAlt} width="400" height="90" loading="lazy" />
          </div>
        </div>
        <div className="marketing-footer-grid">
          <section className="marketing-footer-contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="marketing-eyebrow">
              {footer.contactTitle}
            </h2>
            <address>
              <dl className="marketing-footer-contact-list">
                {footer.contact.map((entry) => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd>
                      {entry.lines.map((line) =>
                        line.href ? (
                          <a key={line.text} href={line.href}>
                            {line.text}
                          </a>
                        ) : (
                          <span key={line.text}>{line.text}</span>
                        ),
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </address>
            <div className="marketing-footer-socials">
              <h2 className="marketing-eyebrow">{footer.socialTitle}</h2>
              <ul role="list">
                {footer.social.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} aria-label={item.label}>
                      <SocialGlyph icon={item.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="marketing-eyebrow">{column.title}</h2>
              {column.links.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          ))}
        </div>
        <div className="marketing-footer-bottom">
          <p>
            {footer.copyright} · {footer.lastUpdated}
          </p>
          <nav aria-label="Legal">
            {footer.bottomLinks.map((link) => (
              <FooterLink key={link.label} {...link} />
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
