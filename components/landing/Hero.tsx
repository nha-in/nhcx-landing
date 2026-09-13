import { withBase } from '@/lib/paths';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner">
        <h1 className="hero-title" id="hero-title">
          <span className="hero-kicker">National Health Claims Exchange</span>
          India’s Unified Platform for{' '}
          <br />
          Claim Settlement
        </h1>
        <p className="hero-lede">
          Leveraging cross platform interoperability NHCX enables seamless data exchange between Payers and Providers in{' '}
          <strong>completely digitized format</strong>
        </p>
        <div className="hero-actions">
          <a className="btn btn--primary hero-cta" href={withBase('/docs/')}>
            View Docs <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <img className="hero-wave" src={withBase('/assets/hero-wave.svg')} alt="" aria-hidden="true" />
    </section>
  );
}
