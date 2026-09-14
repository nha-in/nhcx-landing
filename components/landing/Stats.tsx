'use client';

import { useEffect, useRef, useState } from 'react';
import { type Stats as StatsData, type StatsRow, groupDigits, parseStats } from '@/lib/stats';
import { withBase } from '@/lib/paths';
import { STATS } from '@/lib/home-copy';
import FallingCount from '@/components/landing/FallingCount';

/*
 * "NHCX Statistics Private and Govt" — the production figures as the NHA
 * dashboard publishes them, one column per measure with the private figure
 * (green) beside the government one (blue).
 *
 * Rendered from the build-time copy of public/stats.json, then re-fetched
 * from /stats.json on mount so the figures can be moved on by replacing that
 * one served file, with no rebuild and no third-party request from the
 * reader. A failed or malformed fetch changes nothing.
 *
 * During working hours the request counters climb: each starts a fixed
 * distance behind the published figure and closes it by a random step every
 * few seconds until it arrives, then stops, so the reader is left with the
 * real number. Under `prefers-reduced-motion` none of it runs. This is the
 * same behaviour, and the same numbers, as the previous landing page.
 */

const MEASURES: Array<keyof StatsRow> = ['integrators', 'providers', 'preauth', 'claims'];
const SECTORS: Array<{ key: 'priv' | 'gov'; className: string }> = [
  { key: 'priv', className: 'is-private' },
  { key: 'gov', className: 'is-govt' },
];

/** The design's figures, shown only when no stats.json has ever been synced. */
const FALLBACK: StatsData = {
  updated: '',
  rows: {
    priv: { integrators: 38, providers: 842, preauth: 147554, claims: 27165 },
    gov: { integrators: 46, providers: 46442, preauth: 157631860, claims: 85639034 },
  },
};

/** How far behind each sector starts, how fast it closes the gap, and which figures move at all. */
const DRIFT: Record<string, { behind: number; step: [number, number]; measures: Array<keyof StatsRow> }> = {
  gov: { behind: 50, step: [1, 4], measures: ['preauth', 'claims'] },
  priv: { behind: 10, step: [0, 1], measures: ['preauth'] },
};
const MIN_GAP = 5000;
const MAX_GAP = 10000;
const BEAT = 150;
const FROM_HOUR = 8;
const TO_HOUR = 20;
const counting = () => {
  const hour = new Date().getHours();
  return hour >= FROM_HOUR && hour < TO_HOUR;
};
type Behind = Record<string, Partial<Record<keyof StatsRow, number>>>;

export default function Stats({ stats: initial }: { stats: StatsData | null }) {
  const [stats, setStats] = useState(initial ?? FALLBACK);
  const [behind, setBehind] = useState<Behind>({});
  const gaps = useRef<Behind>({});

  useEffect(() => {
    const controller = new AbortController();
    fetch(withBase('/stats.json'), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((file) => {
        const live = parseStats(file?.payload);
        if (live && live.updated !== (initial?.updated ?? '')) setStats(live);
      })
      .catch(() => {
        /* The figures on the page are already right. */
      });
    return () => controller.abort();
  }, [initial]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!counting()) return;

    const opening: Behind = {};
    for (const [sector, drift] of Object.entries(DRIFT)) {
      opening[sector] = {};
      for (const measure of drift.measures) opening[sector][measure] = drift.behind;
    }
    gaps.current = opening;
    setBehind(opening);

    const timers = new Set<number>();
    const wait = () => MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
    const after = (ms: number, run: () => void) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        run();
      }, ms);
      timers.add(id);
    };

    const schedule = (sector: string, measure: keyof StatsRow) => {
      after(wait(), () => {
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

    const increment = (sector: string, measure: keyof StatsRow, left: number) => {
      const remaining = gaps.current[sector]?.[measure] ?? 0;
      if (remaining <= 0) return;
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

  const shown = (sector: string, measure: keyof StatsRow, value: number) =>
    Math.max(0, value - (behind[sector]?.[measure] ?? 0));

  return (
    <section className="stats" aria-label={STATS.ariaLabel}>
      <div className="stats-head">
        <p>{STATS.title}</p>
      </div>
      <dl className="stats-list">
        {MEASURES.map((measure) => (
          <div className="stat" key={measure}>
            <dt className="stat-label">{STATS.measures[measure]}</dt>
            <dd className="stat-values">
              {SECTORS.map((sector) => {
                const row = stats.rows[sector.key];
                if (!row) return null;
                return (
                  <span className={`stat-pill ${sector.className}`} key={sector.key} title={STATS.sectors[sector.key]}>
                    <FallingCount value={groupDigits(shown(sector.key, measure, row[measure]))} />
                  </span>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
