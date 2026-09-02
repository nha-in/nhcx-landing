#!/usr/bin/env node
/**
 * Read the newest nhcx-adapter release off GitHub and write it as a manifest
 * the DevTools page renders its adapter download table from.
 *
 * Nothing is copied into public/: the archives are release assets on the
 * repository, so the table links straight at GitHub and only the description
 * of the release is baked into the export. That keeps the download for every
 * platform correct without anyone editing the CMS after a tag — re-run this
 * (or rebuild) and the table follows the release.
 *
 *     content/adapter.json     version, date, one row per platform archive
 *
 * `.github/workflows/ci.yml` in the adapter attaches these on a `vX.Y.Z` tag:
 *
 *     nhcx-adapter_<version>_<os>_<arch>.tar.gz   (unix)
 *     nhcx-adapter_<version>_<os>_<arch>.zip      (windows)
 *     SHA256SUMS                                  one line per archive
 *
 * The repository is public, so this needs no credentials.
 *
 *   NHCX_ADAPTER_REPO   owner/name, default nha-in/nhcx-adapter
 *   GITHUB_TOKEN        optional; only raises the anonymous rate limit
 *   NHCX_ADAPTER_SKIP=1 leave the committed manifest alone (offline builds)
 *
 * Like the docs sync, every failure — no network, rate limited, no
 * release yet — is a warning and exit 0. The last good manifest stays in
 * place, and with no manifest at all the page falls back to a plain link at
 * the releases page.
 *
 *   node scripts/sync-adapter.mjs [--repo owner/name] [--quiet]
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { osLabel, archLabel, archNote, byPlatform, humanSize, dateLabel } from './platforms.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const DEST = path.join(ROOT, 'content', 'adapter.json');

/** nhcx-adapter_<version>_<os>_<arch>.<ext> — version may contain dashes. */
const ASSET_RE = /^nhcx-adapter_(.+)_([a-z0-9]+)_([a-z0-9]+)\.(tar\.gz|zip)$/;

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const repoFlag = args.indexOf('--repo');
const REPO = (repoFlag >= 0 ? args[repoFlag + 1] : '') || process.env.NHCX_ADAPTER_REPO || 'nha-in/nhcx-adapter';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

function log(message) {
  if (!quiet) console.log(message);
}

function headers(accept = 'application/vnd.github+json') {
  const h = { accept, 'user-agent': 'nhcx-landing-sync-adapter', 'x-github-api-version': '2022-11-28' };
  if (TOKEN) h.authorization = `Bearer ${TOKEN}`;
  return h;
}

async function api(pathname, accept) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${pathname}`, {
    headers: headers(accept),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    // 403 with no token is almost always the 60/hour anonymous rate limit.
    const hint = res.status === 403 && !TOKEN ? ' — rate limited? set GITHUB_TOKEN' : '';
    throw new Error(`GET ${pathname} → ${res.status} ${res.statusText}${hint}`);
  }
  return res;
}

/** The newest published release: `latest`, or the newest non-draft tag. */
async function latestRelease() {
  try {
    return await (await api('/releases/latest')).json();
  } catch {
    // /latest is 404 when every release is a pre-release, and on some
    // permission shapes; the list endpoint still answers.
    const list = await (await api('/releases?per_page=20')).json();
    const published = list.filter((r) => !r.draft);
    if (!published.length) throw new Error('no published release');
    return published.find((r) => !r.prerelease) ?? published[0];
  }
}

/** SHA256SUMS as { filename: sha256 }; empty when the asset is absent. */
async function readChecksums(asset) {
  if (!asset) return {};
  try {
    const res = await api(`/releases/assets/${asset.id}`, 'application/octet-stream');
    const out = {};
    for (const line of (await res.text()).split('\n')) {
      const [sum, name] = line.trim().split(/\s+/);
      if (sum && name) out[name.replace(/^\*/, '')] = sum;
    }
    return out;
  } catch (err) {
    console.warn(`⚠ Could not read SHA256SUMS (${err.message}); digests omitted.`);
    return {};
  }
}

async function main() {
  if (process.env.NHCX_ADAPTER_SKIP === '1') {
    log('• Skipping the adapter release sync (NHCX_ADAPTER_SKIP=1).');
    return;
  }

  const release = await latestRelease();
  const assets = release.assets ?? [];
  const checksums = await readChecksums(assets.find((a) => a.name === 'SHA256SUMS'));

  const builds = [];
  for (const asset of assets) {
    const match = ASSET_RE.exec(asset.name);
    if (!match) continue;
    const [, version, os, arch, format] = match;
    builds.push({
      file: asset.name,
      url: asset.browser_download_url,
      version,
      os,
      osLabel: osLabel(os),
      arch,
      archLabel: archLabel(arch),
      archNote: archNote(os, arch),
      format,
      bytes: asset.size,
      size: humanSize(asset.size),
      builtAt: asset.updated_at ?? release.published_at,
      sha256: checksums[asset.name] ?? '',
    });
  }

  if (!builds.length) {
    console.warn(`⚠ ${REPO} ${release.tag_name} carries no nhcx-adapter_<version>_<os>_<arch> archives.`);
    console.warn('  Tag a vX.Y.Z release so the ci.yml `release` job attaches them.');
    return;
  }
  builds.sort(byPlatform);

  const released = release.published_at ?? release.created_at ?? '';
  const manifest = {
    repo: REPO,
    repoUrl: `https://github.com/${REPO}`,
    releasesUrl: `https://github.com/${REPO}/releases`,
    releaseUrl: release.html_url,
    version: release.tag_name,
    released,
    releasedLabel: dateLabel(released),
    checksumsUrl: assets.find((a) => a.name === 'SHA256SUMS')?.browser_download_url ?? null,
    builds,
  };

  fs.writeFileSync(DEST, `${JSON.stringify(manifest, null, 2)}\n`);
  const total = builds.reduce((sum, b) => sum + b.bytes, 0);
  log(`✔ ${REPO} ${manifest.version} — ${builds.length} archives (${humanSize(total)}) → content/adapter.json`);
}

try {
  await main();
} catch (err) {
  console.warn(`⚠ Could not read the nhcx-adapter release (${err.message}).`);
  console.warn(`  The DevTools page falls back to a link at https://github.com/${REPO}/releases.`);
}
process.exit(0);
