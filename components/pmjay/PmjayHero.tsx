import { withBase } from '@/lib/paths';
import { HERO } from '@/lib/pmjay-copy';

/*
 * The PM-JAY hero, built like the AI Skill hero: the shared hero band and
 * type (tl-hero, tl-kicker, tl-title, tl-lede, tl-cta in tools.css) in two
 * columns, with the Ayushman Bharat emblem where the Skill page has its
 * terminal. The emblem's animation lives inside the SVG file as CSS
 * keyframes, so it is one <img> with nothing to hydrate, and the file
 * carries its own reduced-motion rule.
 */
export default function PmjayHero() {
  return (
    <section className="tl-hero" aria-labelledby="pj-title">
      <div className="wrap tl-hero-inner pj-hero-grid">
        <div>
          <h1 className="tl-title" id="pj-title">
            <span className="tl-kicker">{HERO.kicker}</span>
            {HERO.titleLead} <span className="tl-accent">{HERO.titleAccent}</span>
          </h1>
          <p className="tl-lede">{HERO.lede}</p>
          <div className="tl-cta">
            <a className="btn btn--primary" href={HERO.knowMore.href} target="_blank" rel="noopener">
              {HERO.knowMore.label} <span aria-hidden="true">↗</span>
            </a>
            <a className="btn btn--outline" href={HERO.about.href}>
              {HERO.about.label}
            </a>
          </div>
        </div>
        <div className="pj-hero-mark">
          <span className="pj-hero-glow" aria-hidden="true" />
          <img src={withBase('/assets/brand/pmjay-emblem.svg')} alt={HERO.emblemAlt} />
        </div>
      </div>
    </section>
  );
}
