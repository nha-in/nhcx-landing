import fs from 'node:fs';
import path from 'node:path';
import { type Stats, parseStats } from './stats';

/**
 * The build-time copy of the dashboard figures.
 *
 * Split from lib/stats.ts because that module is imported by a client
 * component: keeping `node:fs` out of it is what stops the browser bundle
 * trying to resolve it. Everything about *reading* the payload stays there,
 * so this is only the part that cannot run in a browser.
 *
 * Written by `npm run sync:stats` into public/, so the same file this reads
 * off disk at build time is the one the browser fetches at /stats.json.
 */

/** What public/stats.json holds: the API's answer, untouched, plus when. */
interface StatsFile {
  source: string;
  fetched: string;
  payload: Record<string, unknown>;
}

/** The figures stored at build time, or null when none have been synced. */
export function getStats(): Stats | null {
  const file = path.join(process.cwd(), 'public', 'stats.json');
  if (!fs.existsSync(file)) return null;
  try {
    const stored = JSON.parse(fs.readFileSync(file, 'utf8')) as StatsFile;
    return parseStats(stored?.payload);
  } catch {
    return null;
  }
}
