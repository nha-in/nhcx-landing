import { withBase } from '@/lib/paths';

export default function Hero({ applyHref }: { applyHref: string }) {
  return (
    <section id="hero" className="lp-hero" aria-labelledby="hero-title">
      <div className="lp-hero-grid" aria-hidden="true" />
      <div className="lp-wrap lp-hero-inner">
        <h1 id="hero-title">
          <span>One connected network for</span>
          <span className="accent">Health Claims</span>
        </h1>
        <p>
          NHCX brings India&rsquo;s healthcare ecosystem together with standardised, interoperable claim data: enabling
          seamless, transparent and efficient exchange across systems.
        </p>
        <div className="lp-hero-cta">
          <a href={withBase(applyHref)} className="btn btn-primary">
            Get sandbox access <span className="chev" aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
