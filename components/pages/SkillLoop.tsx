import type { SkillCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * "The loop it runs": four phases on a ring, and the same four as prose.
 *
 * The mark sits at the centre of the ring rather than the words "NHCX skill":
 * the whole section is about the skill, so naming it again in the middle of
 * its own diagram said nothing the heading above had not.
 *
 * The ring is the honest picture of an agent doing this work — it goes round
 * until the flow passes — so the dot walks it continuously and each node
 * lights as the dot reaches it. The list beside it says the same thing in
 * words, which is what a reader with reduced motion or a screen reader gets.
 */
export default function SkillLoop({ copy }: { copy: SkillCopy['loop'] }) {
  return (
    <section className="dk-section" aria-labelledby="sk-loop-title">
      <div className="container">
        <div className="dk-head">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h2 id="sk-loop-title">
            {copy.titleLead} <span>{copy.titleAccent}</span>
          </h2>
          <p>{copy.text}</p>
        </div>

        <div className="sk-loop-grid">
          <div className="sk-ring" aria-hidden="true">
            <svg viewBox="0 0 280 280" role="presentation">
              <circle className="sk-ring-track" cx="140" cy="140" r="118" />
              <circle className="sk-ring-dash" cx="140" cy="140" r="118" />
            </svg>
            <span className="sk-arm">
              <i />
            </span>
            <span className="sk-ring-core">
              <img className="sk-ring-mark" src={withBase('/assets/brand/hcx-logo-white.png')} alt="" />
            </span>
            {copy.ringNodes.map((node, i) => (
              <span key={node} className={`sk-node n${i + 1}`}>
                {node}
              </span>
            ))}
          </div>

          <ol className="sk-phases">
            {copy.phases.map((phase, i) => (
              <li key={phase.title} className="sk-phase">
                <span className="sk-phase-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{phase.title}</h3>
                  <p>{phase.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
