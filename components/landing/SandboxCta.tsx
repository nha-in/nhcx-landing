import { withBase } from '@/lib/paths';
import { CTA } from '@/lib/home-copy';

export default function SandboxCta() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="wrap">
        <h2 className="cta-title" id="cta-title">
          {CTA.titleLead} <b className="is-blue">{CTA.titleBlue}</b>
          <b>.</b> {CTA.titleMid} <b>{CTA.titleLive}</b>
        </h2>
        <p className="cta-lede">{CTA.lede}</p>
        <a className="btn btn--primary" href={withBase(CTA.cta.href)}>
          {CTA.cta.label}
        </a>
      </div>
    </section>
  );
}
