import { DEVTOOLS_URL, HERO } from '@/lib/devtools-copy';
import type { AdapterRelease } from '@/lib/downloads';

/*
 * The DevTools hero: there are exactly two developer tools for NHCX, so one
 * card each, and under them the strip that shows where the adapter sits,
 * between a hospital system and NHCX, with a signal travelling out to the
 * exchange and back. The animation is CSS alone and stops under reduced
 * motion.
 */
export default function DevToolsHero({ release }: { release: AdapterRelease }) {
  const { consoleCard, adapterCard } = HERO;
  return (
    <section className="tl-hero" aria-labelledby="dt-title">
      <div className="wrap tl-hero-inner">
        <h1 className="tl-title" id="dt-title">
          <span className="tl-kicker">{HERO.kicker}</span>
          {HERO.titleLead} <span className="tl-accent">{HERO.titleAccent}</span>
        </h1>
        <p className="tl-lede">{HERO.intro}</p>

        <div className="dt-cards">
          <article className="dt-card is-tools">
            <h2>{consoleCard.title}</h2>
            <p>{consoleCard.copy}</p>
            <div className="dt-card-actions">
              <a className="btn btn--primary btn--green" href={`${DEVTOOLS_URL}/`} target="_blank" rel="noopener">
                {consoleCard.ctaLabel} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
          <article className="dt-card is-adapter">
            <h2>{adapterCard.title}</h2>
            <p>{adapterCard.copy}</p>
            <div className="dt-card-actions">
              <a className="btn btn--primary" href="#adapter-downloads">
                {adapterCard.downloadPrefix} {release.version}
              </a>
              <a className="btn btn--outline" href={release.repoUrl} target="_blank" rel="noopener noreferrer">
                {adapterCard.repoLabel} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>

        <div className="dt-flow" aria-hidden="true">
          <span className="dt-node">{HERO.flow[0]}</span>
          <span className="dt-wire is-a">
            <i />
          </span>
          <span className="dt-node is-mid">{HERO.flow[1]}</span>
          <span className="dt-wire is-b">
            <i />
          </span>
          <span className="dt-node">{HERO.flow[2]}</span>
        </div>
      </div>
    </section>
  );
}
