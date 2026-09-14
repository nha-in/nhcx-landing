'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { withBase } from '@/lib/paths';
import { JOURNEY } from '@/lib/home-copy';
import JourneyArt from '@/components/landing/JourneyArt';

/*
 * "Integration journey from Registration to Production" as a stack of
 * sticky cards: each step sticks just under the header as it arrives, the
 * next slides up over it, and the titles of the steps already passed pile up
 * at the top of the viewport — the pattern of the solutions list on
 * aubergine.co. It is CSS only (position: sticky with a stepped top offset
 * per card), so it costs nothing on scroll and degrades to a plain list.
 */

const STEPS = JOURNEY.steps;

export default function Journey() {
  const list = useRef<HTMLOListElement>(null);

  // A card is "covered" from the moment the next card's top edge overlaps
  // it; its illustration fades out then, so a passed card shows its title
  // alone. Measured on scroll from the cards' own rectangles, which are
  // consistent under the desktop page zoom.
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.journey-step'));
    let queued = false;
    const update = () => {
      queued = false;
      for (let i = 0; i < cards.length - 1; i++) {
        const here = cards[i].getBoundingClientRect();
        const next = cards[i + 1].getBoundingClientRect();
        cards[i].classList.toggle('is-covered', next.top < here.bottom - 1);
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="wrap">
        <div className="journey-head">
          <h2 className="journey-title" id="journey-title">
            {JOURNEY.title}
          </h2>
          <p className="journey-intro">{JOURNEY.intro}</p>
        </div>

        <ol className="journey-list" ref={list} style={{ '--steps': STEPS.length } as CSSProperties}>
          {STEPS.map((s, i) => (
            <li className="journey-step" key={s.title} style={{ top: `calc(var(--stack-top) + ${i} * var(--stack-row))` }}>
              <div className="journey-text">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <a className="journey-link" href={withBase(s.link.href)}>
                  {s.link.label} <b aria-hidden="true">→</b>
                </a>
                <ul className="journey-tags" aria-label={JOURNEY.coversLabel}>
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="journey-art">
                <JourneyArt kind={s.art} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
