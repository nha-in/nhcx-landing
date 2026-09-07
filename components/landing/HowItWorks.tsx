import type { HomeCopy } from '@/lib/site-copy';

function Doc() {
  return (
    <svg width="17" height="21" viewBox="0 0 17 21" fill="none" stroke="#8E9AE9" strokeWidth="1.2" aria-hidden="true">
      <path d="M1 1.5h9l5.5 5v13H1V1.5Z" fill="#0A2540" />
      <path d="M10 1.5V6.5h5.5" />
      <path d="M4 11h8M4 14.5h8M4 8h4" />
    </svg>
  );
}

function Packet({ className }: { className?: string }) {
  return (
    <span className={`lp-packet ${className ?? ''}`} aria-hidden="true">
      <i />
    </span>
  );
}

function stubClass(i: number, n: number) {
  return `lp-stub${i === 0 ? ' first' : ''}${i === n - 1 ? ' last' : ''}`;
}

/** The dark "How NHCX works" band: statement, docs link and the provider ↔ NHCX ↔ payer network. */
export default function HowItWorks({ copy }: { copy: HomeCopy['howItWorks'] }) {
  return (
    <section id="how" className="lp-how" aria-labelledby="how-title">
      <div className="lp-how-glow" aria-hidden="true" />
      <div className="lp-wrap lp-how-inner">
        <p className="lp-eyebrow on-dark" id="how-title" data-reveal="">
          {copy.eyebrow}
        </p>
        <p className="lp-statement" data-reveal="" data-delay="60">
          {copy.statementLead} <span>{copy.statementAccent}</span>
        </p>
        {/* wide: the two columns wired through the hub */}
        <div className="lp-net" data-reveal="" data-delay="160" aria-label={copy.netLabel}>
          <div className="lp-net-side left">
            <div className="lp-net-label">{copy.providerLabel}</div>
            <div className="lp-net-grid">
              {copy.providers.map((p, i) => (
                <div key={p} style={{ display: 'contents' }}>
                  <div className="lp-node">{p}</div>
                  <div className={stubClass(i, copy.providers.length)} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
          <div className="lp-wire">
            <div className="lp-wire-line" aria-hidden="true" />
            <Packet />
          </div>
          <div className="lp-doc">
            <Doc />
          </div>
          <div className="lp-hub">{copy.hubLabel}</div>
          <div className="lp-doc">
            <Doc />
          </div>
          <div className="lp-wire">
            <div className="lp-wire-line" aria-hidden="true" />
            <Packet className="d2" />
          </div>
          <div className="lp-net-side right">
            <div className="lp-net-label">{copy.payerLabel}</div>
            <div className="lp-net-grid">
              {copy.payers.map((p, i) => (
                <div key={p} style={{ display: 'contents' }}>
                  <div className={stubClass(i, copy.payers.length)} aria-hidden="true" />
                  <div className="lp-node">{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* narrow: stacked */}
        <div className="lp-net-stack" aria-hidden="true">
          <div style={{ width: '100%' }}>
            <div className="lp-net-label">{copy.providerLabel}</div>
            <div className="lp-net-grid">
              {copy.providers.map((p) => (
                <div key={p} className="lp-node">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-vwire" />
          <div className="lp-hub">{copy.hubLabel}</div>
          <div className="lp-vwire" />
          <div style={{ width: '100%' }}>
            <div className="lp-net-label">{copy.payerLabel}</div>
            <div className="lp-net-grid">
              {copy.payers.map((p) => (
                <div key={p} className="lp-node">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
