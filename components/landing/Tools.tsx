'use client';

import { useRef } from 'react';
import { withBase } from '@/lib/paths';

function Field({ label, optional, required, value, muted, focus, caret }: { label: string; optional?: boolean; required?: boolean; value?: string; muted?: boolean; focus?: boolean; caret?: boolean }) {
  return (
    <div className="lp-field">
      <label>
        {label}
        {optional && <em>optional</em>}
        {required && <span className="req">*</span>}
      </label>
      <div className={`lp-input${muted ? ' muted' : ''}${focus ? ' focus' : ''}`}>
        <span>{value ?? ''}</span>
        {caret && <span className="caret">▾</span>}
      </div>
    </div>
  );
}

function Shot({ title, sub, children, single }: { title: string; sub: string; children: React.ReactNode; single?: boolean }) {
  return (
    <div className="lp-shot" aria-hidden="true">
      <div className="lp-shot-head">
        <b>{title}</b>
        <i>{sub}</i>
      </div>
      <div className={`lp-shot-body${single ? ' single' : ''}`}>{children}</div>
    </div>
  );
}

/**
 * "See what's happening inside the tool" — five screens of the DevTools
 * console, in a scroll-snap carousel: the FHIR builder, the simulated
 * ecosystem, the open-source gateway with its checklist, the playbook, and
 * the compliance agent.
 */
export default function Tools({ consoleUrl }: { consoleUrl: string }) {
  const track = useRef<HTMLDivElement>(null);
  const docs = withBase('/documentation/');

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
            See what&rsquo;s happening
            <br />
            <span>inside the tool</span>
          </h2>
          <div className="lp-car-btns">
            <button type="button" className="lp-car-btn" onClick={() => scroll(-1)} aria-label="Previous screen">
              ‹
            </button>
            <button type="button" className="lp-car-btn" onClick={() => scroll(1)} aria-label="Next screen">
              ›
            </button>
          </div>
        </div>

        <div className="lp-track" ref={track} data-reveal="" data-delay="80">
          {/* 1 · FHIR builder */}
          <div className="lp-tool">
            <Shot title="FHIR Builder" sub="Visual editor to construct payload request bundles quickly">
              <div className="lp-pane">
                <div className="lp-pane-title">Visual FHIR bundle constructor</div>
                <div className="lp-pane-sub">Select a request template to generate form results dynamically.</div>
                <Field label="Mapping template" value="E4/NHCX.diagnostic.report" caret />
                <Field label="Document title" optional />
                <Field label="Patient name" required focus />
                <div className="lp-two">
                  <Field label="Gender" value="Select" muted caret />
                  <Field label="Date of birth" value="YYYY-MM-DD" muted />
                </div>
              </div>
              <div className="lp-pane dark">
                <div className="lp-pane-row">
                  <span className="lp-pane-title">FHIR JSON result</span>
                  <span className="lp-valid">Valid</span>
                </div>
                <pre className="lp-code">
                  <span className="n">1</span>{'{\n'}
                  <span className="n">2</span>  <span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Bundle&quot;</span>,{'\n'}
                  <span className="n">3</span>  <span className="k">&quot;type&quot;</span>: <span className="s">&quot;collection&quot;</span>,{'\n'}
                  <span className="n">4</span>  <span className="k">&quot;entry&quot;</span>: [{'\n'}
                  <span className="n">5</span>    {'{ '}<span className="k">&quot;resource&quot;</span>: {'{\n'}
                  <span className="n">6</span>      <span className="k">&quot;resourceType&quot;</span>: <span className="s">&quot;Claim&quot;</span>,{'\n'}
                  <span className="n">7</span>      <span className="k">&quot;status&quot;</span>: <span className="s">&quot;active&quot;</span>,{'\n'}
                  <span className="n">8</span>      <span className="k">&quot;total&quot;</span>: {'{ '}<span className="k">&quot;value&quot;</span>: <span className="v">48600</span>{' }\n'}
                  <span className="n">9</span>    {'} }\n'}
                  <span className="n">10</span>  ]{'\n'}
                  <span className="n">11</span>{'}'}
                </pre>
              </div>
            </Shot>
            <div className="lp-tool-foot">
              <p>Build and validate FHIR bundles visually, with guided fields and instant FHIR output.</p>
              <a href={`${consoleUrl}/builder`}>Open the FHIR builder →</a>
            </div>
          </div>

          {/* 2 · Simulated ecosystem */}
          <div className="lp-tool">
            <Shot title="Simulated ecosystem" sub="A dummy IRDAI, PM-JAY, payers and providers to exchange claims with">
              <div className="lp-pane">
                <div className="lp-pane-title">Participants in this sandbox</div>
                <div className="lp-eco">
                  {[
                    ['IRDAI', 'regulator', 'audit view', 'ok'],
                    ['PM-JAY · SHA', 'government scheme', 'HBP 2.0 rates', 'ok'],
                    ['NIC-HEALTH', 'insurer', 'auto-adjudication on', 'ok'],
                    ['MediAssist', 'TPA', 'queries 2/10', 'ok'],
                    ['District Hospital, Pune', 'provider', 'HMIS · 14 claims', 'ok'],
                    ['Apex Diagnostics', 'provider', 'awaiting first bundle', 'wait'],
                  ].map(([name, role, state, tone]) => (
                    <div key={name} className="lp-eco-row">
                      <b>{name}</b>
                      <i>{role}</i>
                      <span className={tone}>{state}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-pane dark">
                <div className="lp-pane-title">Live traffic</div>
                <div className="lp-log">
                  <div>
                    <span>hospital → NHCX · /claim/submit</span>
                    <span className="ok">202</span>
                  </div>
                  <div>
                    <span>NHCX → NIC-HEALTH · deliver</span>
                    <span className="ok">200</span>
                  </div>
                  <div>
                    <span>NIC-HEALTH → NHCX · /claim/on_submit</span>
                    <span className="ok">202</span>
                  </div>
                  <div>
                    <span>NHCX → hospital · decision</span>
                    <span className="ok">approved</span>
                  </div>
                  <div>
                    <span>IRDAI · /claim/search (aggregate)</span>
                    <span className="warn">masked</span>
                  </div>
                </div>
              </div>
            </Shot>
            <div className="lp-tool-foot">
              <p>Every actor in the real network, simulated: a regulator, a government scheme, insurers, TPAs and hospitals that answer your calls the way production will.</p>
              <a href={`${consoleUrl}/simulator`}>Open the simulator →</a>
            </div>
          </div>

          {/* 3 · Open-source gateway + checklist */}
          <div className="lp-tool">
            <Shot title="nhcx-adapter" sub="Open-source adapter between your HMIS and the exchange, with the go-live checklist">
              <div className="lp-pane dark">
                <div className="lp-pane-row">
                  <span className="lp-pane-title">Terminal</span>
                  <span className="lp-valid">open source</span>
                </div>
                <pre className="lp-code">
                  <span className="k">$</span> tar xzf nhcx-adapter_v1.0.1_linux_amd64.tar.gz{'\n'}
                  <span className="k">$</span> ./nhcx-adapter config edit{'\n'}
                  <span className="k">$</span> ./nhcx-adapter serve{'\n'}
                  <span className="s">✓</span> participant code <span className="v">HOSP-4471</span> loaded{'\n'}
                  <span className="s">✓</span> keys verified · JWE ready{'\n'}
                  <span className="s">✓</span> callback https://hospital.example/in/v1/ reachable{'\n'}
                  <span className="s">✓</span> panel on http://127.0.0.1:8090/panel
                </pre>
              </div>
              <div className="lp-pane">
                <div className="lp-pane-title">Go-live checklist</div>
                <ul className="lp-check">
                  {[
                    ['Sandbox participant code and key pair', true],
                    ['Public callback URL or bundled tunnel', true],
                    ['Claim data mapped to the FHIR R4 profiles', true],
                    ['All five use cases pass in the simulator', true],
                    ['Functional test cases cleared', false],
                    ['Security review (STQC / CERT-In)', false],
                    ['Production credentials provisioned', false],
                  ].map(([label, done]) => (
                    <li key={String(label)} className={done ? 'done' : ''}>
                      <em />
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Shot>
            <div className="lp-tool-foot">
              <p>One static binary (no JVM, no Docker) that signs, encrypts and routes every message, and tells you exactly what is left before you go live.</p>
              <a href={withBase('/devtools/#adapter')}>Get nhcx-adapter →</a>
            </div>
          </div>

          {/* 4 · Playbook and concepts */}
          <div className="lp-tool">
            <Shot title="Playbook and concepts" sub="The order to build in, the mandatory APIs per role, and what each concept means">
              <div className="lp-pane">
                <div className="lp-pane-title">Integration playbook · Provider</div>
                <ol className="lp-play">
                  {[
                    ['Register and get keys', 'done'],
                    ['Coverage eligibility check', 'done'],
                    ['Pre-authorisation submit / on_submit', 'now'],
                    ['Claim submit / on_submit', ''],
                    ['Payment notice and communication', ''],
                    ['Certification and go-live', ''],
                  ].map(([step, state], i) => (
                    <li key={step} className={state}>
                      <span className="lp-play-n">{String(i + 1).padStart(2, '0')}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="lp-pane dark">
                <div className="lp-pane-title">Concept · Correlation ID</div>
                <p className="lp-concept">
                  Every request and its <code>on_</code> callback share one correlation ID. The exchange uses it to pair the return leg with the
                  onward leg, and so should your HMIS.
                </p>
                <div className="lp-concept-tags">
                  <span>JWE envelope</span>
                  <span>Participant code</span>
                  <span>FHIR bundle</span>
                  <span>on_ callback</span>
                  <span>Sandbox exit</span>
                </div>
              </div>
            </Shot>
            <div className="lp-tool-foot">
              <p>A guided path with a check after every chapter, so a new integrator knows what to build first and why.</p>
              <a href={`${consoleUrl}/learn`}>Start the learning path →</a>
            </div>
          </div>

          {/* 5 · Compliance agent */}
          <div className="lp-tool">
            <Shot title="Compliance agent" sub="Agentic AI that reads your payloads and makes them NHCX-compliant">
              <div className="lp-pane dark">
                <div className="lp-pane-row">
                  <span className="lp-pane-title">Agent run · claim CLM-40921</span>
                  <span className="lp-valid">3 fixes</span>
                </div>
                <div className="lp-agent">
                  <div className="lp-agent-msg">
                    <i>Agent</i>
                    <span>Bundle fails profile validation: 2 errors, 1 warning. Fixing.</span>
                  </div>
                  <div className="lp-agent-step">
                    <em className="ok" />
                    <span>
                      <code>Condition.code</code> was free text: mapped to <code>ICD-10 I21.0</code>
                    </span>
                  </div>
                  <div className="lp-agent-step">
                    <em className="ok" />
                    <span>
                      Added missing <code>Claim.insurance.coverage</code> from the eligibility response
                    </span>
                  </div>
                  <div className="lp-agent-step">
                    <em className="ok" />
                    <span>
                      Signed with <code>HOSP-4471</code>, encrypted for <code>NIC-HEALTH</code>
                    </span>
                  </div>
                  <div className="lp-agent-msg">
                    <i>Agent</i>
                    <span>Re-validated: compliant with the implementation guide. Submit?</span>
                  </div>
                </div>
              </div>
              <div className="lp-pane">
                <div className="lp-pane-title">Compliance score</div>
                <div className="lp-bars">
                  {[
                    ['Profile validation', 100],
                    ['Terminology bindings', 100],
                    ['Envelope and signature', 100],
                    ['Payer rules (NIC-HEALTH)', 92],
                  ].map(([label, pct]) => (
                    <div key={String(label)}>
                      <div className="lp-bar-label">
                        <span>{label}</span>
                        <b>{pct}%</b>
                      </div>
                      <div className="lp-bar">
                        <i className={Number(pct) === 100 ? 'teal' : ''} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="lp-mock-note">Runs against the documentation corpus and the payer's published rules; every change is shown before it is applied.</div>
                </div>
              </div>
            </Shot>
            <div className="lp-tool-foot">
              <p>Point it at a claim from your HMIS and it maps, fixes and validates the bundle against the specification: explaining each change.</p>
              <a href={docs}>Ask the assistant in the documentation →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
