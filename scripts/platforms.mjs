/**
 * How a Go build target is named, ordered and explained on the site.
 *
 * Used by `sync-adapter.mjs` to label the nhcx-adapter archives read from a
 * GitHub release, and kept separate from it so any other release listing
 * names a platform the same way.
 */

/** Display names, and the order platforms are listed in. */
export const OS_META = {
  darwin: { label: 'macOS', rank: 0 },
  linux: { label: 'Linux', rank: 1 },
  windows: { label: 'Windows', rank: 2 },
  freebsd: { label: 'FreeBSD', rank: 3 },
};

export const ARCH_META = {
  arm64: { label: 'arm64', rank: 0 },
  amd64: { label: 'amd64', rank: 1 },
  '386': { label: '386', rank: 2 },
  arm: { label: 'arm', rank: 3 },
  ppc64le: { label: 'ppc64le', rank: 4 },
  riscv64: { label: 'riscv64', rank: 5 },
  s390x: { label: 's390x', rank: 6 },
};

/** What a reader recognises the architecture by, per platform. */
export const ARCH_NOTE = {
  'darwin/arm64': 'Apple silicon, M1 and later',
  'darwin/amd64': 'Intel Macs',
  'linux/amd64': 'x86-64 servers and desktops',
  'linux/arm64': 'ARM servers, Graviton, Raspberry Pi 4/5 (64-bit)',
  'linux/386': 'x86, 32-bit',
  'linux/arm': 'ARMv6/v7, 32-bit',
  'linux/ppc64le': 'IBM POWER, little-endian',
  'linux/riscv64': 'RISC-V, 64-bit',
  'linux/s390x': 'IBM Z mainframe',
  'windows/amd64': 'x86-64, most PCs',
  'windows/arm64': 'ARM64, Surface and Snapdragon PCs',
  'windows/386': 'x86, 32-bit',
  'freebsd/amd64': 'x86-64',
  'freebsd/arm64': 'ARM64',
};

export function osLabel(os) {
  return OS_META[os]?.label ?? os;
}

export function archLabel(arch) {
  return ARCH_META[arch]?.label ?? arch;
}

export function archNote(os, arch) {
  return ARCH_NOTE[`${os}/${arch}`] ?? '';
}

/** Comparator putting builds in listing order: macOS first, arm64 first. */
export function byPlatform(a, b) {
  return (
    (OS_META[a.os]?.rank ?? 9) - (OS_META[b.os]?.rank ?? 9) ||
    (ARCH_META[a.arch]?.rank ?? 9) - (ARCH_META[b.arch]?.rank ?? 9)
  );
}

/** `14 MB`, the form the download tables print sizes in. */
export function humanSize(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** `23 Aug 2026`, the form the rest of the site writes dates in. */
export function dateLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
