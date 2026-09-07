import type { HomeCopy } from '@/lib/site-copy';
import { CodeJson } from '@/components/Code';
import { withBase } from '@/lib/paths';

/** "NHCX developer integration" — an accordion beside a bundle illustration, with links into the console. */
export default function Integration({ copy }: { copy: HomeCopy['integration'] }) {
  return (
    <section id="integration" className="lp-integration" aria-labelledby="integration-title">
      <div className="lp-wrap">
        <h2 id="integration-title" data-reveal="">
          {copy.titleLead} <span>{copy.titleAccent}</span>
        </h2>
        <div className="lp-int-grid">
          <div data-reveal="" data-delay="60">
            <div className="lp-acc">
              {copy.items.map((item, i) => (
                <details key={item.title} open={i === 0}>
                  <summary>{item.title}</summary>
                  <div className="lp-acc-body">
                    <div>
                      <p>{item.text}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
            <div className="lp-int-links">
              {copy.links.map((link) => (
                <a key={link.label} href={withBase(link.href)} className="link-arrow">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="lp-int-art" data-reveal="" data-delay="140" aria-hidden="true">
            <div className="lp-int-art-glow" />
            <div className="lp-mock">
              <div className="lp-mock-bar">
                <span className="lp-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="lp-mock-url">{copy.mockUrl}</span>
              </div>
              <CodeJson code={copy.code} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
