import type { HomeCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * The home hero: the headline, the promise and one call to action on the
 * left, the exchange mark on the right, over the hairline grid. They arrive
 * in that order on load (the `nhcx-rise` cascade in styles/landing.css).
 *
 * The layout is .pj-hero on the PM-JAY page. The mark stood in a band of its
 * own below the hero, then centred under the call to action; a mark a reader
 * has to scroll to is not doing a hero's job, so it sits beside the words.
 * Participants appear around a ring, each reaches a line in toward the
 * centre, the exchange forms where they meet and carries a claim out and a
 * decision back, then the whole thing unbuilds and does it again. Built like
 * the PM-JAY emblem: the animation is CSS keyframes inside the SVG file, so
 * it is one <img> with no script behind it and nothing to hydrate, and the
 * file carries its own `prefers-reduced-motion` rule and rests on the
 * finished diagram — stillness leaves the picture, not an empty frame.
 *
 * `alt=""`: the headline above it already says what it says.
 *
 * The call to action goes to /get-started/ rather than straight at the
 * application form: the form asks a first-time reader to name their role
 * before anything on the site has said what the roles do.
 */
export default function Hero({ copy }: { copy: HomeCopy['hero'] }) {
  return (
    <section id="hero" className="lp-hero" aria-labelledby="hero-title">
      <div className="lp-hero-grid" aria-hidden="true" />
      <div className="lp-wrap lp-hero-inner">
        <div className="lp-hero-copy">
          <h1 id="hero-title">
            <span>{copy.titleLead}</span>
            <span className="accent">{copy.titleAccent}</span>
          </h1>
          <p>{copy.text}</p>
          <div className="lp-hero-cta">
            <a href={withBase(copy.ctaHref)} className="btn btn-primary">
              {copy.ctaLabel} <span className="chev" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
        <div className="lp-hero-mark">
          <span className="lp-hero-glow" aria-hidden="true" />
          <img src={withBase('/assets/art/nhcx-exchange.svg')} alt="" />
        </div>
      </div>
    </section>
  );
}
