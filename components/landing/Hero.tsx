import { withBase } from '@/lib/paths';
import { HERO } from '@/lib/home-copy';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <h1 className="hero-title" id="hero-title">
          <span className="hero-kicker">{HERO.kicker}</span>
          {HERO.titleLines[0]}{' '}
          <br />
          {HERO.titleLines[1]}
        </h1>
        <p className="hero-lede">
          {HERO.lede} <strong>{HERO.ledeStrong}</strong>
        </p>
        <div className="hero-actions">
          <a className="btn btn--primary hero-cta" href={withBase(HERO.cta.href)}>
            {HERO.cta.label} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <img className="hero-wave" src={withBase('/assets/hero-wave.svg')} alt="" aria-hidden="true" />
    </section>
  );
}
