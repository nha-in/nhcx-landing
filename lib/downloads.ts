import fs from 'node:fs';
import path from 'node:path';

/**
 * The HCX DevTools release builds, staged into `public/downloads` at build
 * time by `npm run sync:dist` from the hcxkit project's `dist/` directory.
 *
 *     /downloads/manifest.json                          every build
 *     /downloads/hcxkit_<version>_darwin_arm64.tar.gz   one archive
 *
 * The manifest is read at build time — the DevTools page is statically
 * exported, so the download table is baked into the HTML. When the artifacts
 * have not been staged the page falls back to the download rows in the CMS
 * content.
 */

/** One platform build, as described by public/downloads/manifest.json. */
export interface DistBuild {
  /** Archive filename, e.g. `hcxkit_v2.4.1_darwin_arm64.tar.gz`. */
  file: string;
  /** URL of the staged archive, e.g. `/downloads/hcxkit_…tar.gz`. */
  url: string;
  version: string;
  /** Go's GOOS — `darwin`, `linux`, `windows`, `freebsd`. */
  os: string;
  osLabel: string;
  /** Go's GOARCH — `arm64`, `amd64`, `386`, … */
  arch: string;
  archLabel: string;
  /** What a reader recognises the architecture by, e.g. "Apple silicon". */
  archNote: string;
  format: 'tar.gz' | 'zip';
  bytes: number;
  /** Human-readable size, e.g. `14 MB`. */
  size: string;
  /** When the archive was built, ISO 8601. */
  builtAt: string;
  sha256: string;
}

export interface DistManifest {
  version: string;
  /** Release date, ISO 8601 — the newest archive in the set. */
  released: string;
  /** That date as `23 Aug 2026`. */
  releasedLabel: string;
  checksumsUrl: string | null;
  builds: DistBuild[];
}

/** Builds grouped under one operating system, in listing order. */
export interface DistPlatform {
  os: string;
  label: string;
  builds: DistBuild[];
}

/** The staged release manifest, or null when nothing has been staged. */
export function getDistManifest(): DistManifest | null {
  const file = path.join(process.cwd(), 'public', 'downloads', 'manifest.json');
  if (!fs.existsSync(file)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8')) as DistManifest;
    return manifest?.builds?.length ? manifest : null;
  } catch {
    return null;
  }
}

/** The manifest's builds grouped by operating system, order preserved. */
export function groupByPlatform(builds: DistBuild[]): DistPlatform[] {
  const platforms: DistPlatform[] = [];
  for (const build of builds) {
    const current = platforms.find((p) => p.os === build.os);
    if (current) current.builds.push(build);
    else platforms.push({ os: build.os, label: build.osLabel, builds: [build] });
  }
  return platforms;
}

/** Short form of a digest for display: `804a0484…b91f4996`. */
export function shortSha(sha256: string): string {
  return sha256 ? `${sha256.slice(0, 8)}…${sha256.slice(-8)}` : '';
}
