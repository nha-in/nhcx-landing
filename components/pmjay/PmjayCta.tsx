import { withBase } from '@/lib/paths';
import { CTA } from '@/lib/pmjay-copy';

/* The closing band, built like the AI Skill page's. */
export default function PmjayCta() {
  return (
    <section className="tl-section is-alt" aria-labelledby="pj-cta-title">
      <div className="wrap">
        <h2 className="tl-h2" id="pj-cta-title">{CTA.title}</h2>
        <p className="tl-sub">{CTA.sub}</p>
        <div className="tl-cta">
          <a className="btn btn--primary" href={withBase(CTA.href)}>
            {CTA.label} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
