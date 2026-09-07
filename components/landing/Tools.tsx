'use client';

import { useRef } from 'react';
import type { HomeCopy, ToolField, ToolScreen } from '@/lib/site-copy';
import Rich from '@/components/Rich';
import { CodeJson, CodeShell } from '@/components/Code';
import { withBase } from '@/lib/paths';

function Field({ field }: { field: ToolField }) {
  return (
    <div className="lp-field">
      <label>
        {field.label}
        {field.optional && <em>optional</em>}
        {field.required && <span className="req">*</span>}
      </label>
      <div className={`lp-input${field.muted ? ' muted' : ''}${field.focus ? ' focus' : ''}`}>
        <span>{field.value ?? ''}</span>
        {field.caret && <span className="caret">▾</span>}
      </div>
    </div>
  );
}

function Shot({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="lp-shot" aria-hidden="true">
      <div className="lp-shot-head">
        <b>{title}</b>
        <i>{sub}</i>
      </div>
      <div className="lp-shot-body">{children}</div>
    </div>
  );
}

/** The panels of one screen. Which pair is drawn is the screen's `kind`. */
function Panels({ screen }: { screen: ToolScreen }) {
  if (screen.kind === 'builder') {
    return (
      <>
        <div className="lp-pane">
          <div className="lp-pane-title">{screen.paneTitle}</div>
          <div className="lp-pane-sub">{screen.paneSub}</div>
          {screen.fields?.map((field) => (
            <Field key={field.label} field={field} />
          ))}
          <div className="lp-two">
            {screen.fieldPair?.map((field) => (
              <Field key={field.label} field={field} />
            ))}
          </div>
        </div>
        <div className="lp-pane dark">
          <div className="lp-pane-row">
            <span className="lp-pane-title">{screen.codeTitle}</span>
            <span className="lp-valid">{screen.codeBadge}</span>
          </div>
          <CodeJson code={screen.code ?? ''} />
        </div>
      </>
    );
  }

  if (screen.kind === 'ecosystem') {
    return (
      <>
        <div className="lp-pane">
          <div className="lp-pane-title">{screen.paneTitle}</div>
          <div className="lp-eco">
            {screen.participants?.map((p) => (
              <div key={p.name} className="lp-eco-row">
                <b>{p.name}</b>
                <i>{p.role}</i>
                <span className={p.tone}>{p.state}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-pane dark">
          <div className="lp-pane-title">{screen.logTitle}</div>
          <div className="lp-log">
            {screen.log?.map((line) => (
              <div key={line.text}>
                <span>{line.text}</span>
                <span className={line.tone}>{line.state}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (screen.kind === 'adapter') {
    return (
      <>
        <div className="lp-pane dark">
          <div className="lp-pane-row">
            <span className="lp-pane-title">{screen.codeTitle}</span>
            <span className="lp-valid">{screen.codeBadge}</span>
          </div>
          <CodeShell lines={screen.shell ?? []} />
        </div>
        <div className="lp-pane">
          <div className="lp-pane-title">{screen.checklistTitle}</div>
          <ul className="lp-check">
            {screen.checklist?.map((item) => (
              <li key={item.label} className={item.done ? 'done' : ''}>
                <em />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  if (screen.kind === 'playbook') {
    return (
      <>
        <div className="lp-pane">
          <div className="lp-pane-title">{screen.paneTitle}</div>
          <ol className="lp-play">
            {screen.steps?.map((step, i) => (
              <li key={step.label} className={step.state}>
                <span className="lp-play-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="lp-pane dark">
          <div className="lp-pane-title">{screen.conceptTitle}</div>
          <p className="lp-concept">
            <Rich parts={screen.conceptParts ?? []} />
          </p>
          <div className="lp-concept-tags">
            {screen.conceptTags?.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </>
    );
  }

  return null;
}

/**
 * "See what's happening inside the tool" — four screens of the DevTools
 * console, in a scroll-snap carousel: the FHIR builder, the simulated
 * ecosystem, the open-source gateway with its checklist, and the playbook.
 */
export default function Tools({ copy }: { copy: HomeCopy['tools'] }) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>('.lp-tool');
    const step = item ? item.getBoundingClientRect().width + 16 : el.clientWidth;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section id="tool" className="lp-tools" aria-labelledby="tools-title">
      <div className="lp-wrap">
        <div className="lp-tools-head" data-reveal="">
          <h2 id="tools-title">
            {copy.titleLead}
            <br />
            <span>{copy.titleAccent}</span>
          </h2>
          <div className="lp-car-btns">
            <button type="button" className="lp-car-btn" onClick={() => scroll(-1)} aria-label={copy.prevLabel}>
              ‹
            </button>
            <button type="button" className="lp-car-btn" onClick={() => scroll(1)} aria-label={copy.nextLabel}>
              ›
            </button>
          </div>
        </div>

        <div className="lp-track" ref={track} data-reveal="" data-delay="80">
          {copy.screens.map((screen) => (
            <div key={screen.shotTitle} className="lp-tool">
              <Shot title={screen.shotTitle} sub={screen.shotSub}>
                <Panels screen={screen} />
              </Shot>
              <div className="lp-tool-foot">
                <p>{screen.footText}</p>
                <a href={withBase(screen.footLinkHref)}>{screen.footLinkLabel}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
