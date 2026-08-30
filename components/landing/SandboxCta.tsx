import { withBase } from '@/lib/paths';

export default function SandboxCta({ applyHref }: { applyHref: string }) {
  return (
    <section id="sandbox" className="lp-sandbox" aria-labelledby="sandbox-title">
      <div className="lp-wrap">
        <h2 id="sandbox-title" data-reveal="">
          Build in the <span>sandbox</span>. Certify once. Go live.
        </h2>
        <p data-reveal="" data-delay="60">
          Free to test and certify — for hospitals, insurers, TPAs, government schemes and solution vendors.
        </p>
        <div data-reveal="" data-delay="120">
          <a href={withBase(applyHref)} className="btn btn-primary">
            Get sandbox access <span className="chev" aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
