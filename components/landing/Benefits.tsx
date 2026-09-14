'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { withBase } from '@/lib/paths';
import { BENEFITS } from '@/lib/home-copy';

/*
 * "NHCX Benefits" — the four cards from the design as a horizontal
 * accordion, the way supabase.com shows its customer stories: the open card
 * takes the row, the other three collapse to 72px colour strips on its right
 * (the design's peek strip), and choosing a strip or an arrow slides the
 * width across; resting the pointer on a strip opens it too. Every card
 * keeps its full layout inside a fixed-width inner
 * box, so nothing reflows while a card opens or closes; the strip simply
 * clips it. On narrow screens the cards stack open, one under another.
 */

const CARDS = BENEFITS.cards;

/** A heading with its *starred* words in the accent colour. */
function accent(text: string) {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <span key={i}>{part}</span> : part));
}

export default function Benefits() {
  const [active, setActive] = useState(0);
  const step = (d: number) => setActive((i) => (i + d + CARDS.length) % CARDS.length);

  return (
    <section className="benefits" aria-labelledby="benefits-title">
      <div className="wrap">
        <div className="benefits-head">
          <h2 className="benefits-title" id="benefits-title">
            {BENEFITS.title}
          </h2>
          <div className="benefits-nav">
            <button type="button" className="benefits-arrow" aria-label={BENEFITS.previousLabel} onClick={() => step(-1)}>
              <ArrowLeft size={24} strokeWidth={1.5} />
            </button>
            <button type="button" className="benefits-arrow" aria-label={BENEFITS.nextLabel} onClick={() => step(1)}>
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="benefits-row">
          {CARDS.map((card, i) => {
            const open = i === active;
            return (
              <article
                key={card.key}
                className={`benefit is-${card.key}${open ? ' is-active' : ''}`}
                aria-current={open ? 'true' : undefined}
                onMouseEnter={() => setActive(i)}
              >
                {/* The strip: the whole collapsed card is the control that opens it. */}
                <button
                  type="button"
                  className="benefit-strip"
                  aria-label={`${BENEFITS.showPrefix} ${card.eyebrow}`}
                  aria-expanded={open}
                  tabIndex={open ? -1 : 0}
                  onClick={() => setActive(i)}
                >
                  <span>{card.eyebrow}</span>
                </button>
                <div className="benefit-inner" aria-hidden={!open}>
                  <div className="benefit-panel">
                    <div className="benefit-body">
                      <div className="benefit-text">
                        <h3 className="benefit-heading">{accent(card.heading)}</h3>
                        <dl className="benefit-stats">
                          {card.stats.map((stat) => (
                            <div key={stat.label}>
                              <dt>{stat.value}</dt>
                              <dd>{stat.label}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="benefit-photo">
                    <img src={withBase('/assets/benefits-photo.jpg')} alt="" aria-hidden="true" style={{ objectPosition: card.photo }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
