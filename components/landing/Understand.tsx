import type { ReactNode } from 'react';
import type { HomeCopy } from '@/lib/site-copy';
import Rich from '@/components/Rich';
import { UNDERSTAND_ICONS } from '@/components/vectors/understandIcons';

/**
 * One card, name on the front and the answer on the back.
 *
 * Both faces are in the markup and neither is hidden from assistive
 * technology: read straight through, a card is its name followed by what it
 * means, which is the sentence the list used to be. The flip is presentation
 * for people who can see it, not the only way to the content — so no-JS,
 * print, a crawler and a screen reader all get everything.
 *
 * `tabIndex={0}` and `:focus-within` are what make it work without a pointer:
 * a keyboard reaches the card and a tap on a touch screen focuses it, which
 * is the same state hover produces. It is not a button, because nothing
 * happens when you press it — the flip is a hover affordance, and a control
 * that claims to do something and does not is worse than none.
 */
function Flip({ icon, face, note, back }: { icon: string; face: string; note?: string; back: string }) {
  return (
    <li className="lp-flip" tabIndex={0}>
      <div className="lp-flip-inner">
        <div className="lp-flip-face">
          <svg viewBox="0 0 24 24" className="lp-flip-icon" aria-hidden="true">
            {UNDERSTAND_ICONS[icon]}
          </svg>
          <b>{face}</b>
          {note && <code>{note}</code>}
        </div>
        <div className="lp-flip-back">
          <span>{back}</span>
        </div>
      </div>
    </li>
  );
}

/** A titled row of them. */
function Flips({ title, delay, children }: { title: string; delay: number; children: ReactNode }) {
  return (
    <div className="lp-und-block">
      <h3 data-reveal="" data-delay={String(delay)}>
        {title}
      </h3>
      <ul className="lp-flips" data-reveal="" data-delay={String(delay + 40)}>
        {children}
      </ul>
    </div>
  );
}

/**
 * "Understand NHCX" — the facts a first-time visitor needs, drawn from the
 * programme's own site (nhcx.abdm.gov.in): what the exchange is, who takes
 * part and what moves over it.
 *
 * Thirteen definitions in three columns of prose was a wall to read rather
 * than something to look at. They are cards now, one per definition, with the
 * name on the front and the answer on the back: the page shows thirteen short
 * labels, and a reader turns over only the ones they do not already know.
 *
 * Each front carries a drawing, so a row is something to look at before it is
 * something to read, and three to a row at most — a fourth column made the
 * cards too narrow for a name to sit on one line.
 *
 * The "at a glance" figures that used to open this file were four
 * hand-written numbers dated July 2024, and the statistics table now above it
 * carries the same measures from the NHA dashboard, dated by the API. Two
 * counts of the same thing that disagree is worse than one, so they are gone.
 */

/** The explainer, placed after the onboarding steps. */
export default function Understand({ copy }: { copy: HomeCopy['understand'] }) {
  return (
    <section id="understand" className="lp-understand" aria-labelledby="understand-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          {copy.eyebrow}
        </p>
        <h2 id="understand-title" data-reveal="" data-delay="60">
          {copy.title}
        </h2>
        <p className="lp-understand-intro" data-reveal="" data-delay="100">
          {copy.intro}
        </p>

        <Flips title={copy.participantsTitle} delay={120}>
          {copy.participants.map((p) => (
            <Flip key={p.title} icon={p.icon} face={p.title} back={p.text} />
          ))}
        </Flips>

        <Flips title={copy.useCasesTitle} delay={180}>
          {copy.useCases.map((u) => (
            <Flip key={u.name} icon={u.icon} face={u.name} note={u.path} back={u.what} />
          ))}
        </Flips>
        <p className="lp-und-note" data-reveal="" data-delay="200">
          <Rich parts={copy.note} />
        </p>

        <Flips title={copy.whyTitle} delay={240}>
          {copy.why.map((item) => (
            <Flip key={item.title} icon={item.icon} face={item.title} back={item.text} />
          ))}
        </Flips>
      </div>
    </section>
  );
}
