'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { withBase } from '@/lib/paths';
import JourneyArt from '@/components/landing/JourneyArt';

/*
 * "Integration journey from Registration to Production" as a stack of
 * sticky cards: each step sticks just under the header as it arrives, the
 * next slides up over it, and the titles of the steps already passed pile up
 * at the top of the viewport — the pattern of the solutions list on
 * aubergine.co. It is CSS only (position: sticky with a stepped top offset
 * per card), so it costs nothing on scroll and degrades to a plain list.
 */

const STEPS = [
  {
    title: 'Complete you ABDM milestones',
    body: 'ABDM milestone M1 is a prerequisite before starting your NHCX integration and gaining API access, for Payer and Provider roles; whereas for Providers both M1 and M2 are recommended.',
    link: { label: 'Sandbox Registration', href: '/apply/' },
    tags: ['ABDM Sandbox', 'Milestone M1', 'Milestone M2'],
    art: 'badge',
  },
  {
    title: 'Develop and Test in Sandbox',
    body: 'Apply for the NHCX Sandbox with the intended role and integrate with your application against the published APIs and FHIR profiles. Test the end to end claims journey including insurance plan, coverage eligibility, pre-authorisation, claims and payment communication using the sandbox environment.',
    link: { label: 'HCX Sandbox Documents', href: '/docs/' },
    tags: ['Sandbox APIs', 'FHIR profiles', 'Eligibility', 'Pre-authorisation', 'Claims', 'Payment'],
    art: 'layers',
  },
  {
    title: 'FHIR Validation and UAT',
    body: 'Proceed with the required functional test cases for NHCX workflows and validation of your FHIR payloads. Demonstrate the working capabilities for individual use cases during UAT post integration in order to establish your production readiness.',
    link: { label: 'Test Cases', href: '/docs/test-cases/' },
    tags: ['Functional test cases', 'FHIR validation', 'Review and demo'],
    art: 'eye',
  },
  {
    title: 'HTC Demo and Go Live',
    body: 'Receive role based Production access for NHCX on your Client ID already assigned to you after ABDM M1 certification. Configure your Participant ID along with credentials to establish connect with NHCX gateway and thus start processing claims.',
    link: { label: 'Sandbox Registration', href: '/apply/' },
    tags: ['Production access', 'Participant credentials', 'Live claims'],
    art: 'rocket',
  },
];

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
          <h2 className="journey-title" id="journey-title">Integrators’ journey from Registration to Production</h2>
          <p className="journey-intro">
            All it takes for a new Integrator from ABDM registration to settle claims on NHCX - embark on the journey, build and test in Sandbox, validate and demonstrate… then Go Live
          </p>
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
                <ul className="journey-tags" aria-label="Covers">
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
