import { withBase } from '@/lib/paths';

/*
 * The footer, in the shape of nha.gov.in's: who manages the site, how to
 * reach the Authority, the important links, the policies,
 * and the copyright bar. No logo; the header carries the marks.
 */

const LINKS = [
  { label: 'Ministry of Health and Family Welfare', href: 'https://mohfw.gov.in/' },
  { label: 'NITI Aayog', href: 'https://www.niti.gov.in/' },
  { label: 'National Health Authority (NHA)', href: 'https://nha.gov.in/' },
  { label: 'Ayushman Bharat Digital Mission (ABDM)', href: 'https://abdm.gov.in/' },
  { label: 'PM-JAY', href: '/pmjay/' },
];
const POLICIES = [
  { label: 'Terms & Conditions', href: '/policies/terms/' },
  { label: 'Whistle Blower Policy', href: '/policies/whistle-blower/' },
  { label: 'Website Policy', href: '/policies/website/' },
  { label: 'Data Privacy Policy', href: '/policies/privacy/' },
  { label: 'Health Data Management Policy', href: '/policies/health-data/' },
  { label: 'Help', href: '/help/' },
];

/** Stamped at build time, as the static export is what is served. */
const UPDATED = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-main">
        <div className="wrap ftr-cols">
          <div className="ftr-col is-about">
            <p>
              <b>Website Content Managed by</b> : National Health Authority (NHA)
            </p>
            <p>
              <b>Email</b> : <a href="mailto:webmaster-pmjay@nha.gov.in">webmaster-pmjay@nha.gov.in</a>
            </p>
            <address>
              <b>Postal Address</b> : 9th Floor, Tower-I, Jeevan Bharati Building, Connaught Place, New Delhi – 110001
            </address>
            <p>
              <b>Toll-Free Call Center No</b> : NHA/PM-JAY : 14555 | ABDM : 14477
            </p>
            <p>
              <b>Last Updated on</b> : {UPDATED}
            </p>
          </div>

          <div className="ftr-col">
            <h2>Important Links</h2>
            <ul>
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href.startsWith('http') ? l.href : withBase(l.href)} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ftr-col">
            <h2>Policies</h2>
            <ul>
              {POLICIES.map((l) => (
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
          <p>Copyright © {YEAR} - All Rights Reserved - Official website of National Health Claims Exchange (NHCX), National Health Authority, Government of India</p>
          <a href="#top" className="ftr-top">↑ Back to top</a>
        </div>
      </div>
    </footer>
  );
}
