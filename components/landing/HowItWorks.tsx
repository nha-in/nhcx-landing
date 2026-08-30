import { withBase } from '@/lib/paths';

const PROVIDERS = ['District hospital', 'Multi-speciality chain', 'Nursing home', 'Diagnostic centre'];
const PAYERS = ['Insurance company', 'TPA', 'State health agency', 'Government scheme'];

function Doc() {
  return (
    <svg width="17" height="21" viewBox="0 0 17 21" fill="none" stroke="#8FA0FF" strokeWidth="1.2" aria-hidden="true">
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
export default function HowItWorks() {
  return (
    <section id="how" className="lp-how" aria-labelledby="how-title">
      <div className="lp-how-glow" aria-hidden="true" />
      <div className="lp-wrap lp-how-inner">
        <p className="lp-eyebrow on-dark" id="how-title" data-reveal="">
          How NHCX works
        </p>
        <p className="lp-statement" data-reveal="" data-delay="60">
          Instead of converting structured hospital data into PDFs and images and sending them manually,{' '}
          <span>NHCX enables providers and payers to exchange digitised, machine-readable health information.</span>
        </p>
        <div data-reveal="" data-delay="120">
          <a href={withBase('/documentation/')} className="btn btn-md btn-primary">
            View developer docs <span className="chev" aria-hidden="true">›</span>
          </a>
        </div>

        {/* wide: the two columns wired through the hub */}
        <div className="lp-net" data-reveal="" data-delay="160" aria-label="Providers connect to payers through NHCX">
          <div className="lp-net-side left">
            <div className="lp-net-label">Provider</div>
            <div className="lp-net-grid">
              {PROVIDERS.map((p, i) => (
                <div key={p} style={{ display: 'contents' }}>
                  <div className="lp-node">{p}</div>
                  <div className={stubClass(i, PROVIDERS.length)} aria-hidden="true" />
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
          <div className="lp-hub">NHCX</div>
          <div className="lp-doc">
            <Doc />
          </div>
          <div className="lp-wire">
            <div className="lp-wire-line" aria-hidden="true" />
            <Packet className="d2" />
            <Packet className="back" />
          </div>
          <div className="lp-net-side right">
            <div className="lp-net-label">Payer</div>
            <div className="lp-net-grid">
              {PAYERS.map((p, i) => (
                <div key={p} style={{ display: 'contents' }}>
                  <div className={stubClass(i, PAYERS.length)} aria-hidden="true" />
                  <div className="lp-node">{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* narrow: stacked */}
        <div className="lp-net-stack" aria-hidden="true">
          <div style={{ width: '100%' }}>
            <div className="lp-net-label">Provider</div>
            <div className="lp-net-grid">
              {PROVIDERS.map((p) => (
                <div key={p} className="lp-node">
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-vwire" />
          <div className="lp-hub">NHCX</div>
          <div className="lp-vwire" />
          <div style={{ width: '100%' }}>
            <div className="lp-net-label">Payer</div>
            <div className="lp-net-grid">
              {PAYERS.map((p) => (
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
