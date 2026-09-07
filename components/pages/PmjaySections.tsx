import type { PmjayCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * The PM-JAY page below the hero: what the scheme is, what a hospital does
 * differently once its claims travel over the exchange, how such a claim
 * travels, what each side of it gets, and where to start.
 *
 * Every word is `pmjay` in content/site.json; what is written here is the
 * arrangement. The journey band is the one dark stretch of the page, on the
 * shared dark surface (styles/dark.css), because it is the mechanism rather
 * than the programme: a claim leaving a hospital, crossing the exchange and
 * coming back settled. Its steps are numbered and static — the movement is
 * the signal travelling the rule beneath them, which is the one thing on the
 * page that is genuinely in motion.
 */

export function PmjayFacts({ copy }: { copy: PmjayCopy['facts'] }) {
  return (
    <section className="section" aria-labelledby="pj-facts-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="pj-facts-title">{copy.title}</h2>
        </div>
        <ul className="pj-facts">
          {copy.items.map((fact) => (
            <li key={fact.title} className="pj-fact">
              <h3>{fact.title}</h3>
              <p>{fact.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PmjayChanged({ copy }: { copy: PmjayCopy['changed'] }) {
  return (
    <section className="section section-alt" aria-labelledby="pj-changed-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="pj-changed-title">{copy.title}</h2>
          <p className="lede">{copy.lede}</p>
        </div>
        <ul className="pj-changes">
          {copy.items.map((change) => (
            <li key={change.now} className="pj-change">
              <p className="pj-change-was">
                <span>{change.was}</span>
              </p>
              <h3>{change.now}</h3>
              <p>{change.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PmjayJourney({ copy }: { copy: PmjayCopy['journey'] }) {
  return (
    <section className="dark-page pj-journey" aria-labelledby="pj-journey-title">
      <span className="dk-aurora" aria-hidden="true" />
      <span className="dk-grid" aria-hidden="true" />
      <div className="container pj-journey-inner">
        <div className="dk-head">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h2 id="pj-journey-title">
            {copy.titleLead} <span>{copy.titleAccent}</span>
          </h2>
          <p>{copy.text}</p>
        </div>
        <ol className="pj-steps">
          {copy.steps.map((step, i) => (
            <li key={step.title} className="pj-step">
              <span className="pj-step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="pj-rail" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}

export function PmjaySides({ copy }: { copy: PmjayCopy['sides'] }) {
  return (
    <section className="section" aria-labelledby="pj-sides-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="pj-sides-title">{copy.title}</h2>
        </div>
        <div className="pj-sides">
          {copy.groups.map((side) => (
            <div key={side.who} className="pj-side">
              <h3>{side.who}</h3>
              <ul>
                {side.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PmjayStart({
  copy,
  applyHref,
  consoleUrl,
}: {
  copy: PmjayCopy['start'];
  applyHref: string;
  consoleUrl: string;
}) {
  return (
    <section className="section section-alt" aria-labelledby="pj-start-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="pj-start-title">{copy.title}</h2>
          <p className="lede">{copy.lede}</p>
        </div>
        <div className="pj-cta">
          <a href={withBase(applyHref)} className="btn btn-primary">
            {copy.applyLabel} <span className="chev" aria-hidden="true">›</span>
          </a>
          <a href={`${consoleUrl}/`} className="btn btn-secondary" rel="noopener">
            {copy.consoleLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
