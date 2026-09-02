import fs from 'node:fs';
import path from 'node:path';
import type { DistBuild, DistPlatform } from './downloads';
import { groupByPlatform } from './downloads';

/**
 * The published nhcx-adapter release, as read from GitHub by
 * `npm run sync:adapter` into content/adapter.json.
 *
 * Nothing is staged into public/: the archives stay release assets on
 * github.com/nha-in/nhcx-adapter and the table links straight at them. Only
 * the shape of the release — version, date, one row per platform with its size
 * and digest — is baked into the static export, so a new tag needs a re-sync
 * (or a rebuild), not a content edit.
 *
 * The build rows are `DistBuild`s with absolute URLs, which is what lets the
 * adapter reuse the DevTools download table and its per-machine recommendation
 * unchanged — `withBase()` passes an absolute URL through untouched.
 */
export interface AdapterRelease {
  /** `nha-in/nhcx-adapter`. */
  repo: string;
  repoUrl: string;
  releasesUrl: string;
  /** The release's own page, e.g. `…/releases/tag/v1.0.1`. */
  releaseUrl: string;
  /** Tag name, e.g. `v1.0.1`. */
  version: string;
  /** Publication date, ISO 8601. */
  released: string;
  /** That date as `30 Aug 2026`. */
  releasedLabel: string;
  /** The SHA256SUMS asset, when the release carries one. */
  checksumsUrl: string | null;
  builds: DistBuild[];
}

/** The synced release, or null when none has been fetched. */
export function getAdapterRelease(): AdapterRelease | null {
  const file = path.join(process.cwd(), 'content', 'adapter.json');
  if (!fs.existsSync(file)) return null;
  try {
    const release = JSON.parse(fs.readFileSync(file, 'utf8')) as AdapterRelease;
    return release?.builds?.length ? release : null;
  } catch {
    return null;
  }
}

/** The release's builds grouped by operating system, order preserved. */
export function adapterPlatforms(release: AdapterRelease): DistPlatform[] {
  return groupByPlatform(release.builds);
}
