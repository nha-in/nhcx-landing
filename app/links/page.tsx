import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { LINK_GROUPS } from '@/lib/links-data';

export const metadata: Metadata = {
  title: 'Links · NHCX',
  description: 'The NHCX specifications, the programme’s policies and guidelines, and the guides for getting onto the ABDM sandbox.',
};

/* The arrow out of a box: every row here leaves the site. */
function OutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
    </svg>
  );
}

/*
 * Links: everything the programme publishes about NHCX, in one place, each
 * opening where NHA or ABDM publishes it. Carried over from the previous
 * site's downloads page, which its "Links" nav item pointed at.
 */
export default function LinksPage() {
  return (
    <>
      <Header current="/links/" />
      <main className="tl">
        <section className="tl-hero" aria-labelledby="ln-title">
          <div className="wrap tl-hero-inner">
            <h1 className="tl-title" id="ln-title">
              <span className="tl-kicker">Links</span>
              Specifications, policies and <span className="tl-accent">guides</span>
            </h1>
            <p className="tl-lede">
              Everything the programme publishes about NHCX, in one place: the open specification and its data models, the policies and guidelines that govern participation, and the guides for getting onto the sandbox.
            </p>
          </div>
        </section>

        <div className="wrap ln-groups">
          {LINK_GROUPS.map((group) => (
            <section key={group.key} className="ln-group" id={group.key} aria-labelledby={`${group.key}-title`}>
              <div className="ln-group-head">
                <h2 id={`${group.key}-title`}>{group.title}</h2>
                {group.description && <p>{group.description}</p>}
              </div>
              <ul className="ln-list">
                {group.items.map((item) => (
                  <li key={item.url}>
                    <a className="ln-row" href={item.url} target="_blank" rel="noopener noreferrer">
                      <span className="ln-copy">
                        <b>{item.title}</b>
                        {item.description && <span className="ln-desc">{item.description}</span>}
                      </span>
                      <span className="ln-side">
                        <span className="ln-type">{item.type}</span>
                        <span className="ln-go">
                          <OutIcon />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
