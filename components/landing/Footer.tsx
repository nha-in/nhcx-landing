import { withBase } from '@/lib/paths';
import { FOOTER } from '@/lib/site-copy';

/*
 * The footer, in the shape of nha.gov.in's: who manages the site, how to
 * reach the Authority, the important links, the policies, and the copyright
 * bar. No logo; the header carries the marks.
 */

/** Stamped at build time, as the static export is what is served. */
const UPDATED = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const YEAR = new Date().getFullYear();
const external = (href: string) => /^https?:/.test(href);

export default function Footer() {
  const f = FOOTER;
  return (
    <footer className="ftr">
      <div className="ftr-main">
        <div className="wrap ftr-cols">
          <div className="ftr-col is-about">
            <p>
              <b>{f.managedBy.label}</b> : {f.managedBy.value}
            </p>
            <p>
              <b>{f.email.label}</b> : <a href={`mailto:${f.email.address}`}>{f.email.address}</a>
            </p>
            <address>
              <b>{f.address.label}</b> : {f.address.value}
            </address>
            <p>
              <b>{f.tollFree.label}</b> : {f.tollFree.value}
            </p>
            <p>
              <b>{f.updatedLabel}</b> : {UPDATED}
            </p>
          </div>

          <div className="ftr-col">
            <h2>{f.linksTitle}</h2>
            <ul>
              {f.links.map((l) => (
                <li key={l.label}>
                  <a href={withBase(l.href)} {...(external(l.href) ? { target: '_blank', rel: 'noopener' } : {})}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ftr-col">
            <h2>{f.policiesTitle}</h2>
            <ul>
              {f.policies.map((l) => (
                <li key={l.label}>
                  <a href={withBase(l.href)}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="ftr-bar">
        <div className="wrap">
          <p>{f.copyright.replace('{year}', String(YEAR))}</p>
          <a href="#top" className="ftr-top">
            {f.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
