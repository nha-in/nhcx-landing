import { withBase } from '@/lib/paths';
import { AI } from '@/lib/home-copy';
import AiDemo from '@/components/landing/AiDemo';

export default function AiSection() {
  return (
    <section className="ai" aria-labelledby="ai-title">
      <div className="ai-head">
        <h2 className="ai-title" id="ai-title">
          {AI.title}
        </h2>
        <p className="ai-lede">{AI.lede}</p>
      </div>
      <img className="ai-wave" src={withBase('/assets/ai-wave.svg')} alt="" aria-hidden="true" />
      <div className="ai-card">
        <AiDemo />
      </div>
    </section>
  );
}
