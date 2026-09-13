import { withBase } from '@/lib/paths';
import AiDemo from '@/components/landing/AiDemo';

export default function AiSection() {
  return (
    <section className="ai" aria-labelledby="ai-title">
      <div className="ai-head">
        <h2 className="ai-title" id="ai-title">Your NHCX Integration now made easy with AI</h2>
        <p className="ai-lede">
          Make the best use of an omnipotent AI Tool that understands the entire communication protocol, FHIR bundles, flow wise use cases and probable errors, besides generating codes for you.
        </p>
      </div>
      <img className="ai-wave" src={withBase('/assets/ai-wave.svg')} alt="" aria-hidden="true" />
      <div className="ai-card">
        <AiDemo />
      </div>
    </section>
  );
}
