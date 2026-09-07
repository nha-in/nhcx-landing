#!/usr/bin/env node
/**
 * Store the NHA dashboard's answer as a file the site serves.
 *
 *     public/stats.json    the API payload, untouched, and when it was read
 *
 * It is read twice from there and the API is never called from the browser:
 *
 *   at build   lib/stats-file.ts reads it off disk, so the figures are in the
 *              HTML before any JavaScript runs
 *   in the page components/landing/Stats.tsx fetches /stats.json on mount
 *
 * public/ rather than content/ precisely so the second read is possible: the
 * file is copied into the export and served, which means re-running this and
 * putting the one file on the server moves the figures on without a rebuild,
 * and a reader who leaves the page open picks them up on the next load.
 * Going through our own origin also means no third-party request from the
 * reader's browser, and nothing on the page that can break if the NHA
 * endpoint is slow, moved or down.
 *
 * The payload is stored exactly as it arrives and lib/stats.ts does all the
 * reading of it, so the build-time copy and the live one cannot drift into
 * interpreting the same API two different ways.
 *
 * The endpoint needs no credentials. `Bearer undefined` is what the dashboard
 * itself sends and the API ignores it, so it is not sent here.
 *
 *   NHCX_STATS_URL     override the endpoint
 *   NHCX_STATS_SKIP=1  leave the committed manifest alone (offline builds)
 *
 * Like the adapter and docs syncs, every failure — no network, a bad payload,
 * a 500 — is a warning and exit 0, and the last good manifest stays in place.
 * A build with no manifest at all renders no statistics section until the
 * browser fetches one.
 *
 *   node scripts/sync-stats.mjs [--quiet]
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.join(import.meta.dirname, '..');
const DEST = path.join(ROOT, 'public', 'stats.json');
const URL_ =
  process.env.NHCX_STATS_URL ||
  'https://apisprod.nha.gov.in/pmjay/hcx/newhcxdashboard/v2/dashboard/stats?flag=Prod';

/* The fields lib/stats.ts needs; checked here only so a changed API is a
   warning at build time rather than a section that quietly stops rendering. */
const REQUIRED = [
  'noofProdPayPriv', 'noofProdProvPriv', 'preauthProcessedPriv', 'claimsProcessedPriv',
  'noofProdPayGov', 'noofProdProvGov', 'preauthProcessedGov', 'claimsProcessedGov',
  'lastUpdatedOn',
];

const quiet = process.argv.includes('--quiet');
const log = (message) => !quiet && console.log(message);
const warn = (message) => console.warn(`\u2013 ${message}`);

async function main() {
  if (process.env.NHCX_STATS_SKIP === '1') {
    log('\u2013 NHCX_STATS_SKIP=1; leaving public/stats.json alone');
    return;
  }

  let payload;
  try {
    const response = await fetch(URL_, {
      headers: { Accept: 'application/json', appName: 'NHCX-Dashboard' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      warn(`dashboard API answered ${response.status}; keeping the committed public/stats.json`);
      return;
    }
    payload = await response.json();
  } catch (error) {
    warn(`could not reach the dashboard API (${error.message}); keeping the committed public/stats.json`);
    return;
  }

  const missing = REQUIRED.filter((field) => payload?.[field] === undefined);
  if (missing.length) {
    warn(`dashboard API is missing ${missing.join(', ')}; keeping the committed public/stats.json`);
    return;
  }

  const manifest = { source: URL_, fetched: new Date().toISOString(), payload };
  fs.mkdirSync(path.dirname(DEST), { recursive: true });
  fs.writeFileSync(DEST, `${JSON.stringify(manifest, null, 2)}\n`);
  log(`\u2714 public/stats.json \u2014 dashboard figures as of ${payload.lastUpdatedOn}`);
}

main().catch((error) => {
  warn(`stats sync failed (${error.message}); keeping the committed public/stats.json`);
});
