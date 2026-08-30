import { withBase } from '@/lib/paths';

/** The "NHCX sessions" banner under the hero; links to the video library. */
export default function Banner() {
  return (
    <section className="lp-banner-section" aria-label="NHCX sessions">
      <div className="lp-wrap">
        <div className="lp-banner" data-reveal="">
          <div className="lp-banner-art" aria-hidden="true" />
          <div className="lp-banner-shade" aria-hidden="true" />
          <div className="lp-banner-copy">
            <h2>Building the digital rails for health claims</h2>
            <a href={withBase('/videos/')} className="btn btn-md btn-on-dark">
              Watch now <span className="chev" aria-hidden="true">›</span>
            </a>
          </div>
          <span className="lp-banner-tag">NHCX sessions</span>
        </div>
      </div>
    </section>
  );
}
