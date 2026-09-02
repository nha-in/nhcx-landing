/**
 * The shape of a downloadable release: one row per platform build, grouped by
 * operating system.
 *
 * nhcx-adapter is the release the site lists (lib/adapter.ts, filled by
 * `npm run sync:adapter` from its GitHub releases); these types and helpers are
 * what its download table is built on, and are deliberately not tied to where
 * the archives are hosted — `url` may be a staged path or an absolute URL.
 */

/** One platform build in a release. */
export interface DistBuild {
  /** Archive filename, e.g. `nhcx-adapter_v1.0.1_darwin_arm64.tar.gz`. */
  file: string;
  /** Where the archive is downloaded from — a staged path or an absolute URL. */
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
