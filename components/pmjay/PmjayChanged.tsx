'use client';

import { useState } from 'react';
import { CHANGED } from '@/lib/pmjay-copy';
import PmjayGlyph from '@/components/pmjay/icons';

/*
 * Three things a hospital does differently: an accordion of cards, one open
 * at a time, on the shared section band and heading.
 */
export default function PmjayChanged() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="tl-section" aria-labelledby="pj-changed-title">
      <div className="wrap">
        <div className="tl-head">
          <h2 className="tl-h2" id="pj-changed-title">{CHANGED.title}</h2>
          <p className="tl-sub">{CHANGED.sub}</p>
        </div>
        <ul className="pj-acc">
          {CHANGED.items.map((item, i) => {
            const on = open === i;
            return (
              <li key={item.title} className={on ? 'is-open' : ''}>
                <button type="button" className="pj-acc-head" aria-expanded={on} aria-controls={`pj-acc-${i}`} onClick={() => setOpen(on ? null : i)}>
                  <span className="pj-acc-icon" aria-hidden="true">
                    <PmjayGlyph name={item.icon} />
                  </span>
                  <h3>{item.title}</h3>
                  <span className="pj-acc-plus" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="pj-acc-body" id={`pj-acc-${i}`} hidden={!on}>
                  <p>{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
