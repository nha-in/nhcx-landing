import { withBase } from '@/lib/paths';

export default function VideoBanner() {
  return (
    <section className="video" aria-label="Featured video">
      <a className="video-card" href={withBase('/videos/')}>
        <img src={withBase('/assets/video-banner.jpg')} alt="Watch: Building the economic infrastructure for AI" />
      </a>
      <p className="video-caption">
        Watch how NHCX connects payers, providers and TPAs on one standardised network, so a claim moves from admission to settlement without leaving the system. Every pre-authorisation, claim and settlement travels as structured FHIR data through a single gateway, giving hospitals faster approvals, insurers cleaner data and patients a clear view of where their claim stands at each step.
      </p>
    </section>
  );
}
