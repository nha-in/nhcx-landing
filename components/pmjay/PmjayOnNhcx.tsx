import { withBase } from '@/lib/paths';
import { FACTS } from '@/lib/pmjay-copy';
import PmjayGlyph from '@/components/pmjay/icons';

/*
 * PM-JAY on NHCX: the one-line claim and three facts, as the same cards the
 * DevTools page uses for its use cases (uc-grid in tools.css).
 */
export default function PmjayOnNhcx() {
  return (
    <section className="tl-section" id="pmjay-on-nhcx" aria-labelledby="pj-on-title">
      <div className="wrap">
        <div className="tl-head">
          <h2 className="tl-h2" id="pj-on-title">{FACTS.title}</h2>
        </div>
        <div className="tl-block">
          <ul className="uc-grid">
            {FACTS.items.map((item) => (
              <li key={item.lead} className="uc-card">
                <span className="uc-head">
                  <span className="uc-mark">
                    <PmjayGlyph name={item.icon} />
                  </span>
                  <b>{item.lead}</b>
                </span>
                <span className="uc-text">{item.text}</span>
                <a className="pj-card-link" href={item.href.startsWith('#') ? item.href : withBase(item.href)}>
                  {item.link} <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
