/**
 * The production NHCX figures from the NHA dashboard API.
 *
 * The API is public and sends `access-control-allow-origin: *` with a
 * preflight that allows GET and the `appName` header, so a browser on this
 * site can read it directly. It is therefore read twice, on purpose:
 *
 *   at build   `npm run sync:stats` stores the raw payload in
 *              content/stats.json, which is what the HTML is rendered from
 *   in the page components/landing/Stats.tsx re-reads the endpoint on mount
 *              and replaces the figures if they have moved on
 *
 * The build-time copy is what makes the first paint correct and complete —
 * no empty cells, no layout shift, no spinner, and the right numbers with
 * JavaScript off or the API down. The live read is what stops the figures
 * being as old as the last deploy. Both dates come from the API's own
 * `lastUpdatedOn`, never from the build or the clock, so a re-read can tell a
 * figure that has moved on from the same one arriving twice.
 *
 * The mapping lives here rather than in the sync script, and the script
 * stores the payload untouched, so the client and the server cannot drift
 * into reading the same API two different ways.
 *
 * Nothing in this file touches the filesystem: it is imported by a client
 * component, so reading content/stats.json lives in lib/stats-file.ts and
 * node:fs never reaches the browser bundle through here.
 */
export const STATS_ENDPOINT =
  'https://apisprod.nha.gov.in/pmjay/hcx/newhcxdashboard/v2/dashboard/stats?flag=Prod';

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
