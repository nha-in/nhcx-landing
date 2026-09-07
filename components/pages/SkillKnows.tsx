import type { SkillCopy } from '@/lib/site-copy';
import Rich from '@/components/Rich';

/**
 * "What the skill knows" and "The rules it works under".
 *
 * Two still sections between the animated ones: what the skill carries, and
 * the limits it keeps. Both are lists, and a list of claims should not move,
 * so nothing here animates beyond the hover lift on a card.
 */

export function SkillKnows({ copy }: { copy: SkillCopy['knows'] }) {
  return (
    <section className="dk-section" aria-labelledby="sk-knows-title">
      <div className="container">
        <div className="dk-head">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h2 id="sk-knows-title">
            {copy.titleLead} <span>{copy.titleAccent}</span>
          </h2>
          <p>
            <Rich parts={copy.ledeParts} />
          </p>
        </div>
        <ul className="dk-cards">
          {copy.cards.map((item) => (
            <li key={item.title} className="dk-card">
              <p className="dk-card-tag">{item.tag}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SkillRules({ copy }: { copy: SkillCopy['rules'] }) {
  return (
    <section className="dk-section" aria-labelledby="sk-rules-title">
      <div className="container">
        <div className="dk-head">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h2 id="sk-rules-title">
            {copy.titleLead} <span>{copy.titleAccent}</span>
          </h2>
          <p>{copy.text}</p>
        </div>
        <ul className="sk-rules">
          {copy.items.map((rule) => (
            <li key={rule.title} className="sk-rule">
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
