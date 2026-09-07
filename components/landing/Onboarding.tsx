import type { HomeCopy } from '@/lib/site-copy';
import Rich from '@/components/Rich';
import { withBase } from '@/lib/paths';

/**
 * "How to onboard" — the programme's own sequence, from ABDM sandbox
 * registration to production credentials. The order carries information,
 * so the steps are numbered.
 */
export default function Onboarding({ copy }: { copy: HomeCopy['onboarding'] }) {
  return (
    <section id="onboarding" className="lp-onboard" aria-labelledby="onboard-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          {copy.eyebrow}
        </p>
        <h2 id="onboard-title" data-reveal="" data-delay="60">
          {copy.titleLead} <span>{copy.titleAccent}</span>
        </h2>
        <ol className="lp-onboard-steps">
          {copy.steps.map((step, i) => (
            <li key={step.title} className="lp-onboard-step" data-reveal="" data-delay={String(100 + i * 60)}>
              <span className="lp-onboard-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <a href={withBase(step.linkHref)} className="link-arrow">
                {step.linkLabel}
              </a>
            </li>
          ))}
        </ol>
        <div className="lp-support" data-reveal="" data-delay="200">
          {copy.support.map((block) => (
            <div key={block.title}>
              <b>{block.title}</b>
              <span>
                <Rich parts={block.parts} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
