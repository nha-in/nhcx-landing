import type { HomeCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

export default function SandboxCta({ copy, applyHref }: { copy: HomeCopy['sandbox']; applyHref: string }) {
  return (
    <section id="sandbox" className="lp-sandbox" aria-labelledby="sandbox-title">
      <div className="lp-wrap">
        <h2 id="sandbox-title" data-reveal="">
          {copy.titleLead} <span>{copy.titleAccent}</span>
          {copy.titleTail}
        </h2>
        <p data-reveal="" data-delay="60">
          {copy.text}
        </p>
        <div data-reveal="" data-delay="120">
          <a href={withBase(applyHref)} className="btn btn-primary">
            {copy.ctaLabel} <span className="chev" aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>
  );
}
