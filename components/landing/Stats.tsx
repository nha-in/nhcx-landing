'use client';

import { useEffect, useRef, useState } from 'react';
import type { HomeCopy } from '@/lib/site-copy';
import { type Stats as StatsData, type StatsRow, groupDigits, parseStats } from '@/lib/stats';
import { withBase } from '@/lib/paths';
import FallingCount from '@/components/landing/FallingCount';

/**
 * "NHCX Statistics" — the production figures, as the NHA dashboard publishes
 * them: one card per measure, each holding both sectors.
 *
 * A card per measure rather than a table of two rows against four columns.
 * The comparison a reader actually makes here is between the two sectors
 * inside one measure — 46,442 hospitals against 842 — and a wide table put
 * those two numbers at opposite ends of a scroll on a phone. Stacked in a
 * card they sit under each other, with a bar showing the split, and four
 * cards fit a page without a horizontal scroller.
 *
 * Rendered from the build-time copy of public/stats.json, then re-fetched
 * from /stats.json on mount. The NHA API is never called from the browser:
 * `npm run sync:stats` puts its answer in that one served file, so the
 * figures can be moved on by replacing it — no rebuild, no third-party
 * request from the reader, and nothing on the page that breaks if the
 * dashboard endpoint is slow or down. A failed or malformed fetch changes
 * nothing: the figures already rendered stay.
 *
 * The API's `lastUpdatedOn` is still parsed and still compared, because it is
 * how a re-fetch tells a moved figure from the same one; it is simply not
 * printed on the page any more.
 *
 * The two request counters climb during working hours. Each starts a fixed
 * distance behind the published figure and closes it by a random step every
 * five seconds until it arrives, and then stops, so what a reader is left
 * looking at is the real number rather than one that keeps inventing traffic.
 * Under `prefers-reduced-motion` none of it runs and the published figures
 * are shown at once.
 *
 * Which figures move is set per sector in DRIFT below — government preauths
 * and claims, private preauths. Everything else is published and left alone:
 * Integrators and Hospitals barely move minute to minute, and the government
 * row has 46 integrators, which cannot be shown 50 behind.
 */

/**
 * How far behind each sector starts, how fast it closes the gap, and which of
 * its figures move at all. Everything not named here is published and left
 * alone: Integrators and Hospitals are standing counts that do not change
 * minute to minute, and private claims is off at request.
 */
const DRIFT: Record<string, { behind: number; step: [number, number]; measures: Array<keyof StatsRow> }> = {
  gov: { behind: 50, step: [1, 4], measures: ['preauth', 'claims'] },
  priv: { behind: 10, step: [0, 1], measures: ['preauth'] },
};
/** Milliseconds between one counter's steps, drawn fresh for every step. */
const MIN_GAP = 5000;
const MAX_GAP = 10000;
/** Milliseconds between the single increments inside one step. */
const BEAT = 150;
/**
 * The hours the counters are allowed to run, on the reader's own clock.
 * Outside them the published figures are shown and nothing climbs.
 *
 * Only the climb is gated. The digits still fall into place as a card scrolls
 * into view at any hour: that is how the figure arrives, not the figure
 * changing, and a page opened in the evening should still feel built rather
 * than switched off.
 */
const FROM_HOUR = 8;
const TO_HOUR = 20;
const counting = () => {
  const hour = new Date().getHours();
  return hour >= FROM_HOUR && hour < TO_HOUR;
};
type Behind = Record<string, Partial<Record<keyof StatsRow, number>>>;

export default function Stats({ copy, stats: initial }: { copy: HomeCopy['stats']; stats: StatsData }) {
  const [stats, setStats] = useState(initial);
  // Zero on the server and on the first client render, so the HTML carries the
  // published figures and hydration matches; the gap opens in the effect
  // below, before the section has been scrolled to.
  const [behind, setBehind] = useState<Behind>({});
  // The same gaps, kept outside React. A counter decides whether to schedule
  // its next step from what it just wrote, and a state setter's updater does
  // not run in time to answer that; the ref is the value, the state is only
  // how it reaches the screen.
  const gaps = useRef<Behind>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBase('/stats.json'), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((file) => {
        const live = parseStats(file?.payload);
        // Only when it says something different, so a reader is not shown the
        // same numbers falling again for nothing.
        if (live && live.updated !== initial.updated) setStats(live);
      })
      .catch(() => {
        /* The figures on the page are already right and already dated. */
      });
    return () => controller.abort();
  }, [initial]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Opened outside the hours: the published figures stand as they are.
    if (!counting()) return;

    const opening: Behind = {};
    for (const [sector, drift] of Object.entries(DRIFT)) {
      opening[sector] = {};
      for (const measure of drift.measures) opening[sector][measure] = drift.behind;
    }
    gaps.current = opening;
    setBehind(opening);

    // A chain of timeouts per counter rather than one interval over all of
    // them. Each counter draws its own gap for every step, so the four never
    // move together and none of them keeps a beat a reader could count: a
    // figure that ticks on the tick reads as a script running, and one that
    // arrives when it arrives reads as traffic.
    //
    // A step of three is then paid out as three increments a beat apart, not
    // as one jump of three. A counter should be seen to count — 100, 101, 102
    // — and a figure that leaps in threes reads as a number being rewritten
    // rather than a number going up. The randomness stays where it belongs:
    // in how long the pause is and how many increments follow it.
    const timers = new Set<number>();
    const wait = () => MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
    const after = (ms: number, run: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        run();
      }, ms);
      timers.add(id);
    };

    /** Pause, then pay out one step as single increments. */
    const schedule = (sector: string, measure: keyof StatsRow) => {
      after(wait(), () => {
        // Eight o'clock arriving mid-climb closes the remaining gap rather
        // than freezing a number short of the published one all evening: the
        // figure a reader is left with overnight is the published figure.
        if (!counting()) {
          timers.forEach(clearTimeout);
          timers.clear();
          gaps.current = {};
          setBehind({});
          return;
        }
        const { step } = DRIFT[sector] ?? { step: [1, 1] as [number, number] };
        increment(sector, measure, step[0] + Math.floor(Math.random() * (step[1] - step[0] + 1)));
      });
    };

    /** One increment, then the next, until the step is spent. */
    const increment = (sector: string, measure: keyof StatsRow, left: number) => {
      const remaining = gaps.current[sector]?.[measure] ?? 0;
      // Arrived: this counter stops and the published figure stands. The
      // others carry on until they arrive too.
      if (remaining <= 0) return;
      // A step of zero — the private counters draw one sometimes — is a pause
      // with nothing after it, which is what a quiet minute looks like.
      if (left <= 0) {
        schedule(sector, measure);
        return;
      }

      const next = remaining - 1;
      gaps.current = { ...gaps.current, [sector]: { ...gaps.current[sector], [measure]: next } };
      setBehind(gaps.current);
      if (next <= 0) return;
      after(BEAT, () => increment(sector, measure, left - 1));
    };

    for (const [sector, drift] of Object.entries(DRIFT)) {
      for (const measure of drift.measures) schedule(sector, measure);
    }

    return () => timers.forEach(clearTimeout);
  }, []);

  const rows = copy.rows.filter((row) => stats.rows[row.key]);
  if (!rows.length) return null;

  /** The published figure, less however much of the gap is still open. */
  const shown = (sector: string, measure: keyof StatsRow, value: number) =>
    Math.max(0, value - (behind[sector]?.[measure] ?? 0));

  return (
    <section className="lp-stats" aria-labelledby="stats-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          {copy.eyebrow}
        </p>
        <h2 id="stats-title" data-reveal="" data-delay="60">
          {copy.title}
        </h2>

        <ul className="lp-stat-cards">
          {copy.measures.map((measure, i) => {
            const key = measure.key as keyof StatsRow;
            return (
              <li key={measure.key} className="lp-stat-card" data-reveal="" data-delay={String(120 + i * 60)}>
                <p className="lp-stat-measure">{measure.label}</p>
                <dl className="lp-stat-figures">
                  {rows.map((row) => (
                    <div key={row.key} className="lp-stat-figure">
                      <dt>{row.label}</dt>
                      <dd>
                        <FallingCount value={groupDigits(shown(row.key, key, stats.rows[row.key][key]))} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
