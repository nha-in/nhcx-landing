import type { PmjayCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * The PM-JAY page hero.
 *
 * PM-JAY is the scheme; NHCX is the rail its claims travel on. The headline
 * puts the two together and the sentence under it says what each one is,
 * ending on the change a hospital feels: the claim leaves the software it
 * already runs rather than being re-entered somewhere else. The roundel is
 * shown at a size the header no longer gives it, because this is the page it
 * belongs to: the Ayushman Bharat emblem, which grows out of a dot into the
 * figure, sprouts and unfolds its leaves, sways, then folds away and does it
 * again. The animation lives inside the SVG as CSS keyframes, so it is one
 * <img> with no script behind it, and the file carries its own
 * `prefers-reduced-motion` rule that leaves the emblem at rest — which is the
 * exact geometry of the mark.
 */
export default function PmjayHero({ copy, applyHref }: { copy: PmjayCopy['hero']; applyHref: string }) {
  return (
    <section className="pj-hero" aria-labelledby="pj-title">
      <div className="container pj-hero-inner">
        <div className="pj-hero-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="pj-title">
            {copy.titleLead}
            <span>{copy.titleAccent}</span>
          </h1>
          <p className="lede">{copy.lede}</p>
          <div className="pj-cta">
            <a href={withBase(applyHref)} className="btn btn-primary">
              {copy.primaryLabel} <span className="chev" aria-hidden="true">›</span>
            </a>
            <a href={copy.secondaryHref} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              {copy.secondaryLabel}
            </a>
          </div>
        </div>
        <div className="pj-hero-mark">
          <span className="pj-hero-glow" aria-hidden="true" />
          <img src={withBase('/assets/brand/pmjay-emblem.svg')} alt={copy.emblemAlt} />
        </div>
      </div>
    </section>
  );
}
