'use client';

import { useEffect, useRef, useState } from 'react';
import { withBase } from '@/lib/paths';
import { BENEFITS } from '@/lib/pmjay-copy';
import PmjayGlyph from '@/components/pmjay/icons';

/*
 * PM-JAY benefits: the three benefits as a list, laid out like the AI Skill
 * page's phases, beside an Ayushman card that flips on hover, focus or tap.
 * Its front is the card as issued; its back shows the cover used this year,
 * with the figures counting as it turns.
 */

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
/* How long each blank field on the card is drawn, in the order of its labels. */
const ROW_WIDTHS = [132, 44, 82, 68, 92];
const ID_WIDTHS = [72, 64, 56];

export default function PmjayBenefits() {
  const { card } = BENEFITS;
  const [open, setOpen] = useState(false);
  const [k, setK] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (!open) {
      setK(0);
      return;
    }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setK(1 - Math.pow(1 - p, 3));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open]);

  return (
    <section className="tl-section is-alt" id="pmjay-benefits" aria-labelledby="pj-benefits-title">
      <div className="wrap">
        <div className="tl-head">
          <h2 className="tl-h2" id="pj-benefits-title">{BENEFITS.title}</h2>
        </div>
        <div className="pj-benefits-grid">
          <ol className="pj-blist">
            {BENEFITS.items.map((item) => (
              <li key={item.title}>
                <span className="pj-bicon" aria-hidden="true">
                  <PmjayGlyph name={item.icon} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="pj-cardwrap">
            <span className="pj-cardglow" aria-hidden="true" />
            <div
              className={`pj-flip${open ? ' is-open' : ''}`}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onClick={() => setOpen((v) => !v)}
              tabIndex={0}
              role="button"
              aria-pressed={open}
              aria-label={card.ariaLabel}
            >
              <div className="pj-flip-inner">
                {/* Front: the card as issued. */}
                <div className="pj-card" aria-hidden={open}>
                  <div className="pj-card-top">
                    <div className="pj-card-marks">
                      <img className="pj-card-logo" src={withBase('/assets/animation/pmjay.svg')} alt="" />
                    </div>
                    <div className="pj-card-band">{card.band}</div>
                  </div>
                  <div className="pj-card-body">
                    <div className="pj-card-photo" aria-hidden="true">
                      <svg viewBox="0 0 78 92" preserveAspectRatio="xMidYMax meet">
                        <circle cx="39" cy="35" r="15" />
                        <path d="M9 92a30 30 0 0 1 60 0z" />
                      </svg>
                    </div>
                    <div className="pj-card-rows">
                      {card.rows.map((label, i) => (
                        <div key={label}>
                          <span>{label}</span>
                          <i style={{ width: ROW_WIDTHS[i] ?? 80 }} />
                        </div>
                      ))}
                    </div>
                    <div className="pj-card-side">
                      <b>{card.coverLine}</b>
                      <em>{card.coverNote}</em>
                      {/* A real code: it opens the beneficiary portal. */}
                      <img className="pj-card-qr" src={withBase('/assets/brand/pmjay-card-qr.svg')} alt="" />
                      <small>{card.state}</small>
                    </div>
                  </div>
                  <div className="pj-card-ids">
                    {card.ids.map((label, i) => (
                      <span key={label}>
                        {label} <i style={{ width: ID_WIDTHS[i] ?? 60 }} />
                      </span>
                    ))}
                  </div>
                  <div className="pj-card-foot">
                    {card.foot.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>

                {/* Back: the cover used this year. */}
                <div className="pj-card pj-card-back" aria-hidden={!open}>
                  <p className="tl-eyebrow">{card.backLabel}</p>
                  <div className="pj-back-big">
                    <b>₹{fmt(card.cover - card.claimed * k)}</b>
                    <span>
                      {card.remainingOf} ₹{fmt(card.cover)}
                    </span>
                  </div>
                  <div className="pj-back-bar">
                    <i style={{ width: `${(card.claimed / card.cover) * 100 * k}%` }} />
                  </div>
                  <div className="pj-back-facts">
                    <div>
                      <span>{card.claimedLabel}</span>
                      <b>₹{fmt(card.claimed * k)}</b>
                    </div>
                    <div>
                      <span>{card.staysLabel}</span>
                      <b>{card.stays}</b>
                    </div>
                    <div>
                      <span>{card.paidLabel}</span>
                      <b className="is-green">{card.paid}</b>
                    </div>
                  </div>
                  <p className="pj-back-note">{card.note}</p>
                </div>
              </div>
            </div>
            <p className="pj-cardhint">{open ? card.hintBack : card.hintFront}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
