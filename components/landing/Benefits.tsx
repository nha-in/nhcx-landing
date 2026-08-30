import { withBase } from '@/lib/paths';

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#FFA35D" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" />
      <path pathLength="1" d="M5.3 8.2l1.9 1.9 3.5-4" />
    </svg>
  );
}

function Points({ items }: { items: Array<{ title: string; text?: string }> }) {
  return (
    <ul className="lp-points">
      {items.map((p) => (
        <li key={p.title}>
          <Check />
          <div>
            <b>{p.title}</b>
            {p.text && <span>{p.text}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Dots() {
  return (
    <span className="lp-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

const CLAIMS: Array<[string, 'ok' | 'review' | 'query', string]> = [
  ['CLM-40912', 'ok', 'Approved'],
  ['CLM-40913', 'review', 'In review'],
  ['CLM-40915', 'ok', 'Approved'],
  ['CLM-40921', 'query', 'Query'],
  ['CLM-40928', 'ok', 'Approved'],
  ['CLM-40931', 'review', 'In review'],
  ['CLM-40934', 'ok', 'Approved'],
  ['CLM-40940', 'ok', 'Approved'],
];

/** "Why does this benefit" — three cards that flip to their explanation on hover or focus. */
export default function Benefits() {
  const docs = withBase('/documentation/');
  return (
    <section id="benefits" className="lp-benefits" aria-labelledby="benefits-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          Why does this benefit
        </p>
        <h2 id="benefits-title" data-reveal="" data-delay="60">
          Powering businesses of all sizes. <span>Run your business on a reliable platform that adapts your needs.</span>
        </h2>

        <div className="lp-bgrid">
          {/* Standardisation */}
          <article className="lp-card warm" data-reveal="" data-delay="120" tabIndex={0} aria-label="Standardisation — every claim speaks the same language">
            <div className="lp-card-base">
              <div className="lp-card-title">Standardisation</div>
              <div className="lp-card-sub">
                One standard for every <span>claim</span>
              </div>
              <div className="lp-mock-wrap" aria-hidden="true">
                <div className="lp-mock">
                  <div className="lp-mock-bar">
                    <Dots />
                    <span className="lp-mock-url">nhcx.abdm.gov.in/claims</span>
                  </div>
                  <div className="lp-mock-head">
                    <b>Claim register</b>
                    <i>FHIR R4</i>
                  </div>
                  <div className="lp-rows">
                    {CLAIMS.map(([id, tone, label]) => (
                      <div className="lp-row" key={id}>
                        <code>{id}</code>
                        <span className={`lp-pill ${tone}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lp-phone">
                  <div className="lp-phone-screen">
                    <div className="lp-phone-notch">
                      <span />
                    </div>
                    <div className="lp-phone-body">
                      <div className="lp-phone-label">Pre-auth</div>
                      <div className="lp-phone-amount">₹48,600</div>
                      <div className="lp-phone-facts">
                        <div>
                          <span>Package</span>
                          <span>HBP 2.0</span>
                        </div>
                        <div>
                          <span>Room</span>
                          <span>Semi-private</span>
                        </div>
                        <div>
                          <span>Stay</span>
                          <span>3 days</span>
                        </div>
                      </div>
                      <div className="lp-phone-btn">Submit bundle</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-card-over">
              <h3>
                Every <strong>claim</strong> speaks the same language
              </h3>
              <p>
                NHCX uses FHIR-based standards and internationally accepted coding practices, so provider and payer systems can
                exchange health information in a common, machine-readable format — without losing its meaning across systems.
              </p>
              <a href={docs} className="btn btn-secondary">
                Explore documentation →
              </a>
              <Points
                items={[
                  { title: 'One common structure', text: 'Health information follows a consistent FHIR-based format.' },
                  { title: 'Zero ambiguity', text: 'Standardised codes preserve the meaning of clinical information.' },
                  { title: 'Works across systems', text: 'Different technology stacks exchange the same information seamlessly.' },
                ]}
              />
            </div>
          </article>

          <div className="lp-bstack">
            {/* Structured data */}
            <article className="lp-card cool" data-reveal="" data-delay="180" tabIndex={0} aria-label="Structured data — data a system can read, not a page to re-type">
              <div className="lp-card-base">
                <div className="lp-card-title">Structured data</div>
                <div className="lp-card-sub">
                  Send <span>data</span>, not documents
                </div>
                <div className="lp-mock" aria-hidden="true">
                  <div className="lp-mock-bar">
                    <Dots />
                  </div>
                  <div className="lp-table">
                    <div className="lp-table-head">
                      <span>Field</span>
                      <span>Coded value</span>
                    </div>
                    <div className="lp-table-row">
                      <span>Diagnosis</span>
                      <code>ICD-10 · I21.0</code>
                    </div>
                    <div className="lp-table-row">
                      <span>Procedure</span>
                      <code>SNOMED · 232717009</code>
                    </div>
                    <div className="lp-table-row">
                      <span>Drug</span>
                      <code>NDHM-DR · 4180</code>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lp-card-over">
                <h3>
                  Data a system can <strong>read</strong>, not a page to re-type
                </h3>
                <p>Diagnoses, procedures, drugs and bill lines travel as coded values — priced and checked automatically instead of opened and read.</p>
                <Points items={[{ title: 'Coded at source' }, { title: 'Nothing lost in transit' }, { title: 'Signed and audit-ready' }]} />
              </div>
            </article>

            {/* Automation */}
            <article className="lp-card mint" data-reveal="" data-delay="240" tabIndex={0} aria-label="Automation and AI assistance — fewer queries, faster decisions">
              <div className="lp-card-base">
                <div className="lp-card-title">Automation &amp; AI assistance</div>
                <div className="lp-card-sub">
                  More accuracy, <span>less</span> resistance
                </div>
                <div className="lp-mock" aria-hidden="true">
                  <div className="lp-mock-bar">
                    <Dots />
                  </div>
                  <div className="lp-bars">
                    <div>
                      <div className="lp-bar-label">
                        <span>Auto-adjudicated</span>
                        <b>78%</b>
                      </div>
                      <div className="lp-bar">
                        <i style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="lp-bar-label">
                        <span>Queries raised</span>
                        <b>9%</b>
                      </div>
                      <div className="lp-bar">
                        <i className="teal" style={{ width: '9%' }} />
                      </div>
                    </div>
                    <div className="lp-mock-note">Bundle checked against payer rules before it leaves the hospital.</div>
                  </div>
                </div>
              </div>
              <div className="lp-card-over">
                <h3>
                  Fewer queries, <strong>faster</strong> decisions
                </h3>
                <p>Validated claims let payer engines price routine cases straight through, and let hospitals catch gaps before a claim ever leaves.</p>
                <Points items={[{ title: 'Straight-through pricing' }, { title: 'Checks before submission' }, { title: 'Insight across claims' }]} />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
