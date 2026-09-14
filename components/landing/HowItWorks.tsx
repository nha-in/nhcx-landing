import { withBase } from '@/lib/paths';
import TypicalFlow from '@/components/landing/TypicalFlow';
import NetworkPacket from '@/components/landing/NetworkPacket';
import { HOW } from '@/lib/home-copy';

const { providers: PROVIDERS, payers: PAYERS } = HOW;

/*
 * The provider ↔ NHCX ↔ payer network, carried over from the previous
 * landing page: each column's nodes hang off a trunk by dotted stubs, the
 * trunk meets a dashed wire that marches towards the exchange, and a
 * document travels along the wires through the exchange and back
 * (NetworkPacket).
 */

function stubClass(i: number, n: number) {
  return `how-stub${i === 0 ? ' first' : ''}${i === n - 1 ? ' last' : ''}`;
}

function Wire() {
  return (
    <div className="how-wire" aria-hidden="true">
      <div className="how-wire-line" />
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="how" aria-labelledby="how-title">
      {/* The navy slab: the vector keeps its shape (notch, corners), and the
          band continues below it in the gradient's end colour however tall
          the pinned story makes the section. */}
      <div className="how-bgs" aria-hidden="true">
        <div className="how-shadow" style={{ backgroundImage: `url(${withBase('/assets/how-bg-shadow.png')})` }} />
        <img className="how-bg" src={withBase('/assets/how-bg-vector.svg')} alt="" />
        <div className="how-fill" />
      </div>

      <div className="wrap how-block">
        <h2 className="vh" id="how-title">
          {HOW.title}
        </h2>
        <div className="how-body">
          <div className="how-intro">
            <p className="how-lede">
              {HOW.lede} <span>{HOW.ledeTail}</span>
            </p>
            <a className="btn btn--primary" href={withBase(HOW.cta.href)}>
              {HOW.cta.label}
            </a>
          </div>

          {/* wide: the two columns wired through the hub */}
          <div className="how-net" role="img" aria-label={HOW.netLabel}>
            <div className="how-side is-provider">
              <p className="how-col-label">{HOW.providerLabel}</p>
              <div className="how-grid">
                {PROVIDERS.map((p, i) => (
                  <div key={p} style={{ display: 'contents' }}>
                    <div className="how-node">{p}</div>
                    <div className={stubClass(i, PROVIDERS.length)} aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
            <Wire />
            <div className="how-hub">{HOW.hub}</div>
            <Wire />
            <div className="how-side is-payer">
              <p className="how-col-label">{HOW.payerLabel}</p>
              <div className="how-grid">
                {PAYERS.map((p, i) => (
                  <div key={p} style={{ display: 'contents' }}>
                    <div className={stubClass(i, PAYERS.length)} aria-hidden="true" />
                    <div className="how-node">{p}</div>
                  </div>
                ))}
              </div>
            </div>
            <NetworkPacket />
          </div>

          {/* narrow: stacked */}
          <div className="how-stack" aria-hidden="true">
            <p className="how-col-label">{HOW.providerLabel}</p>
            <div className="how-stack-grid">
              {PROVIDERS.map((p) => (
                <div key={p} className="how-node">{p}</div>
              ))}
            </div>
            <div className="how-vwire" />
            <div className="how-hub">{HOW.hub}</div>
            <div className="how-vwire" />
            <p className="how-col-label">{HOW.payerLabel}</p>
            <div className="how-stack-grid">
              {PAYERS.map((p) => (
                <div key={p} className="how-node">{p}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TypicalFlow />
    </section>
  );
}
