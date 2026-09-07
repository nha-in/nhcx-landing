'use client';

import { useState } from 'react';
import type { GetStartedCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * "Get started" — the question first, the route second.
 *
 * The four stages onto the exchange are the same for everyone; what differs
 * is which half of a claim you build. Asking before answering is the point of
 * the page: a reader who has said which side they are on gets four steps
 * written for them, instead of eight steps with half of them to be skipped.
 *
 * Nothing is hidden that a reader cannot get to. Both routes are in the
 * server-rendered HTML — the choice only decides which is shown — so search
 * engines, a reader with JavaScript off and anyone printing the page get the
 * whole thing, and the panel that is not current is `hidden` rather than
 * unmounted.
 *
 * The choices are buttons in a `tablist`, not links, because picking a role
 * changes what this page shows rather than where the reader is; `aria-selected`
 * and `aria-controls` are what tell a screen reader that.
 *
 * Every word is `getStarted` in content/site.json.
 */
export default function GetStarted({ copy }: { copy: GetStartedCopy }) {
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <>
      <section className="gs-choose" aria-labelledby="gs-question">
        <div className="container">
          <h2 id="gs-question" className="gs-question">
            {copy.question}
          </h2>
          <div className="gs-roles" role="tablist" aria-labelledby="gs-question">
            {copy.roles.map((role) => {
              const current = chosen === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  role="tab"
                  id={`gs-tab-${role.key}`}
                  aria-selected={current}
                  aria-controls={`gs-panel-${role.key}`}
                  className={`gs-role${current ? ' is-current' : ''}`}
                  onClick={() => setChosen(role.key)}
                >
                  <span className="gs-role-label">{role.label}</span>
                  <span className="gs-role-note">{role.note}</span>
                </button>
              );
            })}
          </div>
          {chosen && (
            <button type="button" className="gs-change" onClick={() => setChosen(null)}>
              {copy.changeLabel}
            </button>
          )}
        </div>
      </section>

      {copy.roles.map((role) => (
        <section
          key={role.key}
          id={`gs-panel-${role.key}`}
          role="tabpanel"
          aria-labelledby={`gs-tab-${role.key}`}
          className="gs-flow"
          hidden={chosen !== null && chosen !== role.key}
        >
          <div className="container">
            <h2 className="gs-flow-title">{role.flowTitle}</h2>
            <ol className="gs-steps">
              {role.steps.map((step, i) => (
                <li key={step.title} className="gs-step">
                  <span className="gs-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="gs-step-body">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    {step.linkLabel && step.linkHref && (
                      <a href={withBase(step.linkHref)} className="gs-step-link">
                        {step.linkLabel} <span aria-hidden="true">›</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      <section className="gs-both" aria-labelledby="gs-both-title">
        <div className="container">
          <h2 id="gs-both-title">{copy.bothTitle}</h2>
          <ul className="gs-both-list">
            {copy.both.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="gs-cta">
            <a href={withBase(copy.ctaHref)} className="btn btn-primary">
              {copy.ctaLabel} <span className="chev" aria-hidden="true">›</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
