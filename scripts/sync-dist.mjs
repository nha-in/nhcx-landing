#!/usr/bin/env node
/**
 * Stage the HCX DevTools release artifacts into public/downloads for the
 * static export.
 *
 * `make release` in the hcxkit project cross-compiles the kit for every
 * supported platform into `hcxkit/dist`:
 *
 *     hcxkit_<version>_<os>_<arch>.tar.gz     (unix)
 *     hcxkit_<version>_<os>_<arch>.zip        (windows)
 *     checksums.txt                           sha256, one line per archive
 *
 * This script copies those archives into `public/downloads/`, which
 * `next build` emits verbatim, and writes a manifest describing each one so
 * the DevTools page can render a real, architecture-specific download table:
 *
 *     /downloads/manifest.json
 *     /downloads/hcxkit_<version>_darwin_arm64.tar.gz
 *
 * Source selection, in order:
 *
 *   1. $HCXKIT_DIST_DIR      an explicit dist directory
 *   2. --dist DIR
 *   3. ../../hcxkit/dist     the hcxkit working tree
 *
 * Only the newest archive per OS/arch is staged: `make release` leaves every
 * earlier version in dist/, and the download table should offer one build per
 * platform, not fourteen versions of it. Archives whose version carries a
 * `-dirty` suffix (built from an uncommitted tree) are skipped unless
 * `ALLOW_DIRTY_DIST=1` — a published download must be reproducible from a
 * commit.
 *
 * Like `npm run sync`, a missing dist directory is a warning and exit 0: the
 * site still builds, and the DevTools page falls back to the download rows
 * carried in the CMS content.
 *
 *   node scripts/sync-dist.mjs [--dist DIR] [--quiet]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

const ROOT = path.join(import.meta.dirname, '..');
const DEST = path.join(ROOT, 'public', 'downloads');

/** hcxkit_<version>_<os>_<arch>.<ext> — version may itself contain dashes. */
const ARCHIVE_RE = /^hcxkit_(.+)_([a-z0-9]+)_([a-z0-9]+)\.(tar\.gz|zip)$/;

/** Display names, and the order platforms are listed in. */
const OS_META = {
  darwin: { label: 'macOS', rank: 0 },
  linux: { label: 'Linux', rank: 1 },
  windows: { label: 'Windows', rank: 2 },
  freebsd: { label: 'FreeBSD', rank: 3 },
};
const ARCH_META = {
  arm64: { label: 'arm64', rank: 0 },
  amd64: { label: 'amd64', rank: 1 },
  '386': { label: '386', rank: 2 },
  arm: { label: 'arm', rank: 3 },
  ppc64le: { label: 'ppc64le', rank: 4 },
  riscv64: { label: 'riscv64', rank: 5 },
  s390x: { label: 's390x', rank: 6 },
};
/** What a reader recognises the architecture by, per platform. */
const ARCH_NOTE = {
  'darwin/arm64': 'Apple silicon — M1 and later',
  'darwin/amd64': 'Intel Macs',
  'linux/amd64': 'x86-64 servers and desktops',
  'linux/arm64': 'ARM servers, Graviton, Raspberry Pi 4/5 (64-bit)',
  'linux/386': 'x86, 32-bit',
  'linux/arm': 'ARMv6/v7, 32-bit',
  'linux/ppc64le': 'IBM POWER, little-endian',
  'linux/riscv64': 'RISC-V, 64-bit',
  'linux/s390x': 'IBM Z mainframe',
  'windows/amd64': 'x86-64 — most PCs',
  'windows/arm64': 'ARM64 — Surface and Snapdragon PCs',
  'windows/386': 'x86, 32-bit',
  'freebsd/amd64': 'x86-64',
  'freebsd/arm64': 'ARM64',
};

const ALLOW_DIRTY = process.env.ALLOW_DIRTY_DIST === '1';

/**
 * Orders version strings newest-first: semver-ish tags (`v2.4.1`, `2.4.1`)
 * compare numerically, and a tagged build beats a bare commit hash
 * (`cd55796`), which is what `make release` writes between tags. Ties fall
 * back to the archive's mtime, handled by the caller.
 */
function versionRank(version) {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?/.exec(version);
  if (!m) return [0, 0, 0, 0];
  return [1, Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
}

function newerVersion(a, b) {
  const ra = versionRank(a.version);
  const rb = versionRank(b.version);
  for (let i = 0; i < ra.length; i += 1) {
    if (ra[i] !== rb[i]) return ra[i] > rb[i] ? a : b;
  }
  return a.builtAt >= b.builtAt ? a : b;
}

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const flagIndex = args.indexOf('--dist');
const distDir = path.resolve(
  process.env.HCXKIT_DIST_DIR ||
    (flagIndex >= 0 ? args[flagIndex + 1] : '') ||
    path.join(ROOT, '..', '..', 'hcxkit', 'dist'),
);

function log(message) {
  if (!quiet) console.log(message);
}

function humanSize(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** checksums.txt as { filename: sha256 }; empty when the file is absent. */
function readChecksums(dir) {
  const file = path.join(dir, 'checksums.txt');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const [sum, name] = line.trim().split(/\s+/);
    if (sum && name) out[name.replace(/^\*/, '')] = sum;
  }
  return out;
}

/** `23 Aug 2026`, the form the rest of the site writes dates in. */
function dateLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function main() {
  // A previous run may have staged archives that are no longer eligible
  // (e.g. a -dirty preview); start clean so the page reflects this run only.
  fs.rmSync(DEST, { recursive: true, force: true });

  if (!fs.existsSync(distDir)) {
    console.warn(`⚠ No release artifacts at ${distDir}.`);
    console.warn('  Run `make release` in the hcxkit project to build them.');
    return;
  }

  const checksums = readChecksums(distDir);
  /** platform (`os/arch`) → the newest eligible archive for it. */
  const newest = new Map();
  let skippedDirty = 0;
  let superseded = 0;
  for (const name of fs.readdirSync(distDir).sort()) {
    const match = ARCHIVE_RE.exec(name);
    if (!match) continue;
    const [, version, os, arch, format] = match;
    if (/-dirty$/.test(version) && !ALLOW_DIRTY) {
      skippedDirty += 1;
      continue;
    }
    const source = path.join(distDir, name);
    const stat = fs.statSync(source);
    const bytes = stat.size;
    const build = {
      file: name,
      url: `/downloads/${name}`,
      version,
      os,
      osLabel: OS_META[os]?.label ?? os,
      arch,
      archLabel: ARCH_META[arch]?.label ?? arch,
      archNote: ARCH_NOTE[`${os}/${arch}`] ?? '',
      format,
      bytes,
      size: humanSize(bytes),
      builtAt: stat.mtime.toISOString(),
      sha256: checksums[name] ?? sha256(source),
      source,
    };
    const key = `${os}/${arch}`;
    const current = newest.get(key);
    if (current) superseded += 1;
    newest.set(key, current ? newerVersion(current, build) : build);
  }
  const builds = [...newest.values()];

  if (!builds.length) {
    if (skippedDirty) {
      console.warn(`⚠ ${distDir} holds only -dirty builds (${skippedDirty} skipped).`);
      console.warn('  Commit and run `make release` in the hcxkit project, or set ALLOW_DIRTY_DIST=1 for a preview.');
    } else {
      console.warn(`⚠ ${distDir} holds no hcxkit_<version>_<os>_<arch> archives.`);
    }
    return;
  }

  builds.sort(
    (a, b) =>
      (OS_META[a.os]?.rank ?? 9) - (OS_META[b.os]?.rank ?? 9) ||
      (ARCH_META[a.arch]?.rank ?? 9) - (ARCH_META[b.arch]?.rank ?? 9),
  );

  fs.mkdirSync(DEST, { recursive: true });
  for (const build of builds) {
    // COPYFILE_FICLONE keeps this near-free on APFS; a plain copy elsewhere.
    fs.copyFileSync(build.source, path.join(DEST, build.file), fs.constants.COPYFILE_FICLONE);
    delete build.source;
  }

  const version = builds[0].version;
  // The newest archive dates the release; `make release` writes them together.
  const released = builds.reduce((latest, b) => (b.builtAt > latest ? b.builtAt : latest), '');
  const checksumsFile = path.join(distDir, 'checksums.txt');
  let checksumsUrl = null;
  if (fs.existsSync(checksumsFile)) {
    fs.copyFileSync(checksumsFile, path.join(DEST, 'checksums.txt'));
    checksumsUrl = '/downloads/checksums.txt';
  }

  const manifest = { version, released, releasedLabel: dateLabel(released), checksumsUrl, builds };
  fs.writeFileSync(path.join(DEST, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const total = builds.reduce((sum, b) => sum + b.bytes, 0);
  const notes = [];
  if (superseded) notes.push(`${superseded} older archive(s) left behind`);
  if (skippedDirty) notes.push(`${skippedDirty} -dirty build(s) skipped`);
  log(
    `✔ Staged ${builds.length} ${version} builds (${humanSize(total)}) → public/downloads/` +
      (notes.length ? ` — ${notes.join(', ')}` : ''),
  );
}

try {
  main();
} catch (err) {
  console.warn(`⚠ Could not stage release artifacts (${err.message}).`);
}
process.exit(0);
