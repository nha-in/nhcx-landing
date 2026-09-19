import { hero, links } from '../content'
import { ARROW_OUT, SparkleIcon } from './icons'

export function Hero() {
  return (
    <section id="top" className="sbx-hero" aria-labelledby="landing-title" tabIndex={-1}>
      <div className="marketing-container">
        <div className="sbx-hero-copy">
          <p className="sbx-eyebrow sbx-hero-eyebrow">{hero.eyebrow}</p>
          <h1 id="landing-title">
            {hero.titleLead}
            <em>{hero.titleEm}</em>
          </h1>
          <p className="sbx-hero-lede">
            <SparkleIcon />
            {hero.subtitle}
          </p>
          <p className="sbx-hero-description">
            {hero.lede.map((part, index) =>
              typeof part === 'string' ? part : <b key={index}>{part.b}</b>,
            )}
          </p>
          <div className="marketing-actions">
            <a className="marketing-button marketing-button--primary" href={links.register}>
              {hero.primaryCta}
              <span aria-hidden="true">→</span>
            </a>
            <a className="marketing-button" href={links.artefacts}>
              {hero.artefactsCta}
              <span aria-hidden="true">↓</span>
            </a>
            <a className="marketing-button" href={links.journey}>
              {hero.secondaryCta}
              <span aria-hidden="true">{ARROW_OUT}</span>
            </a>
          </div>
        </div>
      </div>
      <div className="marketing-container">
        <nav className="sbx-section-nav" aria-label="Explore the sandbox">
          {hero.trust.map((item) => (
            <a key={item.value} href={item.href}>
              <strong>
                {item.value} <span aria-hidden="true">{ARROW_OUT}</span>
              </strong>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
