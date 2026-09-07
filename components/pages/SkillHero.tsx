import type { SkillCopy } from '@/lib/site-copy';
import SkillTerminal from './SkillTerminal';

/**
 * The AI skill page hero.
 *
 * The claim of the page is that the exchange is reachable by asking for it,
 * so the hero shows the asking: a terminal that types a real request and
 * works through it. Everything else on the band is still, and the only lights
 * that move are the aurora behind it and the one that travels the terminal's
 * top edge.
 */
export default function SkillHero({
  copy,
  terminal,
  skillUrl,
  consoleUrl,
}: {
  copy: SkillCopy['hero'];
  terminal: SkillCopy['terminal'];
  skillUrl: string;
  consoleUrl: string;
}) {
  return (
    <section className="sk-hero" aria-labelledby="sk-title">
      <span className="dk-aurora" aria-hidden="true" />
      <span className="dk-grid" aria-hidden="true" />

      <div className="container sk-hero-inner">
        <div className="sk-hero-copy">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h1 id="sk-title" className="dk-title">
            {copy.titleLead}
            <br />
            <span>{copy.titleAccent}</span>
          </h1>
          <p className="dk-lede">{copy.lede}</p>
          <div className="dk-cta">
            <a href={skillUrl} className="dk-btn dk-btn-primary" target="_blank" rel="noopener noreferrer">
              {copy.skillCtaLabel}
            </a>
            <a href={`${consoleUrl}/`} className="dk-btn" rel="noopener">
              {copy.consoleCtaLabel}
            </a>
          </div>
          <ul className="dk-chips">
            {copy.chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </div>

        <SkillTerminal copy={terminal} />
      </div>
    </section>
  );
}
