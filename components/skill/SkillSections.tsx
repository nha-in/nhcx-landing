import { Check } from 'lucide-react';
import { withBase } from '@/lib/paths';
import { CLOSE, HERO, KNOWS, LOOP, PROMPTS, RULES, SKILL_URL } from '@/lib/skill-copy';
import CopyButton from '@/components/shared/CopyButton';
import SkillTerminal from '@/components/skill/SkillTerminal';
import AgentInstall from '@/components/skill/AgentInstall';

/*
 * The sections of the AI Skill page, carried over from the previous site on
 * this site's theme: the hero with the working terminal, the loop the agent
 * runs, the stages it climbs, prompts to copy, the rules it keeps, and the close
 * with an install line for each coding agent.
 */

export function SkillHero() {
  return (
    <section className="tl-hero" aria-labelledby="sk-title">
      <div className="wrap tl-hero-inner sk-hero-inner">
        <div>
          <h1 className="tl-title" id="sk-title">
            <span className="tl-kicker">{HERO.kicker}</span>
            {HERO.titleLead} <span className="tl-accent">{HERO.titleAccent}</span>
          </h1>
          <p className="tl-lede">{HERO.lede}</p>
          <div className="tl-cta">
            <a className="btn btn--primary" href={SKILL_URL} target="_blank" rel="noopener noreferrer">
              {HERO.skillCtaLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <SkillTerminal />
      </div>
    </section>
  );
}

function Head({ id, lead, accent, text }: { id: string; lead: string; accent: string; text: string }) {
  return (
    <div className="tl-head">
      <h2 className="tl-h2" id={id}>
        {lead} <span>{accent}</span>
      </h2>
      <p className="tl-sub">{text}</p>
    </div>
  );
}

/* The ring the agent loop runs round, and the same four phases as prose. */
export function SkillLoop() {
  return (
    <section className="tl-section" aria-labelledby="sk-loop-title">
      <div className="wrap">
        <Head id="sk-loop-title" lead={LOOP.titleLead} accent={LOOP.titleAccent} text={LOOP.text} />
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
              <img className="sk-ring-mark" src={withBase('/assets/hcx-logo.png')} alt="" />
            </span>
            {LOOP.ringNodes.map((node, i) => (
              <span key={node} className={`sk-node n${i + 1}`}>
                {node}
              </span>
            ))}
          </div>
          <ol className="sk-phases">
            {LOOP.phases.map((phase, i) => (
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

/*
 * What the skill is, from the skill itself: the eleven stages it climbs in
 * four phases, each with the file it writes and the gate that closes it, then
 * the references every stage reads from.
 */
export function SkillKnows() {
  return (
    <section className="tl-section is-alt" aria-labelledby="sk-knows-title">
      <div className="wrap">
        <Head id="sk-knows-title" lead={KNOWS.titleLead} accent={KNOWS.titleAccent} text={KNOWS.lede} />
        <ol className="sk-ladder">
          {KNOWS.phases.map((phase) => (
            <li key={phase.title} className="sk-ladder-col">
              <h3 className="sk-ladder-phase">{phase.title}</h3>
              <ol className="sk-stages">
                {phase.stages.map((stage) => (
                  <li key={stage.n} className="sk-stage">
                    <div className="sk-stage-top">
                      <span className="sk-stage-num">{String(stage.n).padStart(2, '0')}</span>
                      <h4>{stage.title}</h4>
                    </div>
                    <code>{stage.writes}</code>
                    {stage.modules && (
                      <span className="sk-modules" aria-hidden="true">
                        {Array.from({ length: stage.modules }, (_, i) => (
                          <i key={i} />
                        ))}
                      </span>
                    )}
                    <p>
                      <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                      <span>
                        <span className="vh">{KNOWS.gateLabel}: </span>
                        {stage.gate}
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>

        <h3 className="sk-carries-title">{KNOWS.carriesTitle}</h3>
        <ul className="sk-cards">
          {KNOWS.carries.map((card) => (
            <li key={card.title} className="sk-card">
              <h4>{card.title}</h4>
              <p>{card.text}</p>
            </li>
          ))}
        </ul>
        <p className="tl-note">{KNOWS.note}</p>
      </div>
    </section>
  );
}

export function SkillPrompts() {
  return (
    <section className="tl-section" aria-labelledby="sk-prompts-title">
      <div className="wrap">
        <Head id="sk-prompts-title" lead={PROMPTS.titleLead} accent={PROMPTS.titleAccent} text={PROMPTS.text} />
        <ul className="sk-prompts">
          {PROMPTS.items.map((prompt) => (
            <li key={prompt} className="sk-prompt">
              <span className="sk-prompt-text">{prompt}</span>
              <CopyButton text={prompt} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SkillRules() {
  return (
    <section className="tl-section is-alt" aria-labelledby="sk-rules-title">
      <div className="wrap">
        <Head id="sk-rules-title" lead={RULES.titleLead} accent={RULES.titleAccent} text={RULES.text} />
        <ul className="sk-rules">
          {RULES.items.map((rule) => (
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

export function SkillClose() {
  return (
    <section className="tl-section sk-close" aria-labelledby="sk-close-title">
      <div className="wrap">
        <h2 className="tl-h2" id="sk-close-title">
          {CLOSE.titleLead} <span>{CLOSE.titleAccent}</span>
        </h2>
        <p className="tl-sub">{CLOSE.lede}</p>
        <AgentInstall />
        <div className="tl-cta">
          <a className="btn btn--primary" href={SKILL_URL} target="_blank" rel="noopener noreferrer">
            {CLOSE.skillCtaLabel} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="tl-note">{CLOSE.note}</p>
      </div>
    </section>
  );
}
