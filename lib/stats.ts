/**
 * The production NHCX figures from the NHA dashboard API.
 *
 * They are fetched at build, not by the reader: `npm run sync:stats`
 * (scripts/sync-stats.mjs, which holds the endpoint) stores the API's raw
 * payload in public/stats.json, the HTML is rendered from that file, and
 * components/landing/Stats.tsx re-reads the served /stats.json on mount, so
 * replacing that one file moves the figures on without a rebuild.
 *
 * Both dates come from the API's own `lastUpdatedOn`, never from the build or
 * the clock, so a re-read can tell a figure that has moved on from the same
 * one arriving twice.
 *
 * The mapping lives here rather than in the sync script, and the script
 * stores the payload untouched, so the build and the page cannot drift into
 * reading it two different ways.
 *
 * Nothing in this file touches the filesystem: it is imported by a client
 * component, so reading public/stats.json lives in lib/stats-file.ts and
 * node:fs never reaches the browser bundle through here.
 */
export interface StatsRow {
  /** Payers on the exchange; the dashboard labels this "Integrators". */
  integrators: number;
  /** Hospitals onboarded. */
  providers: number;
  preauth: number;
  claims: number;
}

export interface Stats {
  /**
   * The API's own `lastUpdatedOn`, ISO 8601. Not shown anywhere; it is how a
   * re-fetch tells figures that have moved on from the same ones again.
   */
  updated: string;
  rows: Record<string, StatsRow>;
}

/**
 * The dashboard's field names, per sector.
 *
 * "Integrators" is the payer count (`noofProdPay*`), not `integratorsProd*`:
 * the dashboard labels it that way and the two disagree — 38 payers against
 * 884 integrators for the private sector — so this follows the published
 * table rather than the field name.
 */
const FIELDS: Record<string, Record<keyof StatsRow, string>> = {
  priv: { integrators: 'noofProdPayPriv', providers: 'noofProdProvPriv', preauth: 'preauthProcessedPriv', claims: 'claimsProcessedPriv' },
  gov: { integrators: 'noofProdPayGov', providers: 'noofProdProvGov', preauth: 'preauthProcessedGov', claims: 'claimsProcessedGov' },
};

/** `06-09-2026 11:09` → ISO. */
function readStamp(value: unknown): { updated: string } | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/.exec(String(value ?? '').trim());
  if (!m) return null;
  const [, dd, mm, yyyy, hh, min] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  if (Number.isNaN(date.getTime())) return null;
  return { updated: `${yyyy}-${mm}-${dd}T${hh}:${min}:00` };
}

/**
 * A dashboard payload as figures, or null if it is not one.
 *
 * A missing or non-numeric field means the API has changed, not that the
 * count is zero, so the whole payload is rejected: publishing a 0 would give
 * a wrong figure the same confidence as a right one. The caller then keeps
 * whatever it already had.
 */
export function parseStats(payload: unknown): Stats | null {
  if (!payload || typeof payload !== 'object') return null;
  const source = payload as Record<string, unknown>;

  const rows: Record<string, StatsRow> = {};
  for (const [sector, fields] of Object.entries(FIELDS)) {
    const row: Partial<StatsRow> = {};
    for (const [key, field] of Object.entries(fields) as Array<[keyof StatsRow, string]>) {
      const value = source[field];
      if (typeof value !== 'number' || !Number.isFinite(value)) return null;
      row[key] = value;
    }
    rows[sector] = row as StatsRow;
  }

  const stamp = readStamp(source.lastUpdatedOn);
  return stamp ? { ...stamp, rows } : null;
}

/**
 * `157607578` → `157,607,578`.
 *
 * Grouped in threes rather than the Indian lakh/crore pattern, because that is
 * how the NHCX dashboard itself prints these figures and a reader comparing
 * the two should not have to re-read the digits.
 */
export function groupDigits(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
