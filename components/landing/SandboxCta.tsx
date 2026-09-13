import { withBase } from '@/lib/paths';

export default function SandboxCta() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="wrap">
        <h2 className="cta-title" id="cta-title">
          Build in the <b className="is-blue">Sandbox</b><b>.</b> Certify Once. Go <b>Live</b>
        </h2>
        <p className="cta-lede">Free to test and certify for Hospitals, Insurer, TPA’s, Government schemes and solutoin vendors</p>
        <a className="btn btn--primary" href={withBase('/apply/')}>Get Started →</a>
      </div>
    </section>
  );
}
