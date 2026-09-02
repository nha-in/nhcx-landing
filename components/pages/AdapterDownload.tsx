'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DistBuild } from '@/lib/downloads';
import { groupByPlatform, shortSha } from '@/lib/downloads';
import { withBase } from '@/lib/paths';

/**
 * One download, not a table of them.
 *
 * A release carries a dozen archives and a reader wants exactly one, so the
 * page shows a single build — the one that matches the machine it is being
 * read on — and puts the rest behind two selects. Detection is best-effort and
 * browser-only: the static export always renders the same first build, and the
 * pick is corrected after mount, so hydration matches.
 */

type Detected = { os: string; arch: string };

/** Chromium exposes the real CPU architecture; everyone else needs the UA. */
interface UserAgentData {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>;
}

function detectFromUserAgent(): Detected | null {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) {
    if (/ARM64|aarch64/i.test(ua)) return { os: 'windows', arch: 'arm64' };
    return { os: 'windows', arch: /Win64|x64|WOW64/i.test(ua) ? 'amd64' : '386' };
  }
  if (/FreeBSD/i.test(ua)) {
    return { os: 'freebsd', arch: /aarch64|arm64/i.test(ua) ? 'arm64' : 'amd64' };
  }
  if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
    // Every Mac browser still claims "Intel Mac OS X"; refineArch settles it.
    return { os: 'darwin', arch: 'amd64' };
  }
  if (/Linux|X11|CrOS/i.test(ua) && !/Android/i.test(ua)) {
    if (/aarch64|arm64/i.test(ua)) return { os: 'linux', arch: 'arm64' };
    if (/armv|arm\b/i.test(ua)) return { os: 'linux', arch: 'arm' };
    if (/i686|i386/i.test(ua)) return { os: 'linux', arch: '386' };
    return { os: 'linux', arch: 'amd64' };
  }
  return null;
}

/**
 * Settle the architecture the user agent string cannot report.
 *
 * Chromium answers truthfully through client hints, including on Apple
 * silicon. Safari and Firefox have no hints, so on macOS fall back to the GPU
 * renderer — the one thing there that does name the chip. That probe builds a
 * WebGL context, so it runs only when it is the only option left, and only for
 * macOS.
 */
async function refineArch(detected: Detected): Promise<Detected> {
  const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
  if (data?.getHighEntropyValues) {
    try {
      const { architecture, bitness } = await data.getHighEntropyValues(['architecture', 'bitness']);
      if (architecture === 'arm') return { ...detected, arch: bitness === '64' ? 'arm64' : 'arm' };
      if (architecture === 'x86') return { ...detected, arch: bitness === '64' ? 'amd64' : '386' };
    } catch {
      /* client hints are optional — fall through to the guess below */
    }
  }
  if (detected.os === 'darwin' && macIsAppleSilicon()) return { ...detected, arch: 'arm64' };
  return detected;
}

/** True when the GPU renderer names an Apple chip; false on any doubt. */
function macIsAppleSilicon(): boolean {
  let gl: WebGLRenderingContext | null = null;
  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false });
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    if (!gl || !info) return false;
    return /apple\s*(m\d|gpu|silicon)/i.test(String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)));
  } catch {
    return false;
  } finally {
    // Contexts are a scarce, GPU-process-backed resource: release it at once.
    try {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* nothing more to do */
    }
  }
}

export default function AdapterDownload({ builds }: { builds: DistBuild[] }) {
  const platforms = useMemo(() => groupByPlatform(builds), [builds]);
  const [os, setOs] = useState(builds[0]?.os ?? '');
  const [arch, setArch] = useState(builds[0]?.arch ?? '');
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let guess: Detected | null = null;
    try {
      guess = detectFromUserAgent();
    } catch {
      return;
    }
    if (!guess) return;
    const first = guess;
    // Detection is a convenience: any failure just leaves the selects to do
    // the job, it never takes the page with it.
    refineArch(first)
      .catch(() => first)
      .then((refined) => {
        if (cancelled) return;
        const match =
          builds.find((b) => b.os === refined.os && b.arch === refined.arch) ??
          builds.find((b) => b.os === first.os && b.arch === first.arch) ??
          builds.find((b) => b.os === first.os);
        if (!match) return;
        setOs(match.os);
        setArch(match.arch);
        setDetected(match.os === first.os && match.arch === refined.arch);
      })
      .catch(() => {
        /* nothing to recommend */
      });
    return () => {
      cancelled = true;
    };
  }, [builds]);

  const forOs = useMemo(() => builds.filter((b) => b.os === os), [builds, os]);
  const build = forOs.find((b) => b.arch === arch) ?? forOs[0] ?? builds[0];

  if (!build) return null;

  /** Keep the architecture across an OS change when that OS has it. */
  function chooseOs(next: string) {
    const options = builds.filter((b) => b.os === next);
    const kept = options.find((b) => b.arch === arch) ?? options[0];
    setOs(next);
    if (kept) setArch(kept.arch);
    setDetected(false);
  }

  return (
    <div className="adl">
      <div className="adl-head">
        <div className="adl-head-copy">
          <p className="adl-label">{detected ? 'Recommended for this machine' : 'Selected build'}</p>
          <p className="adl-os">
            {build.osLabel} · {build.archLabel}
          </p>
          {build.archNote && <p className="adl-note">{build.archNote}</p>}
        </div>
        <a href={withBase(build.url)} download className="btn btn-md btn-primary adl-get">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 20h16" />
          </svg>
          Download {build.version}
        </a>
      </div>

      <div className="adl-choose">
        <label className="adl-field">
          <span>Operating system</span>
          <select value={os} onChange={(event) => chooseOs(event.target.value)}>
            {platforms.map((platform) => (
              <option key={platform.os} value={platform.os}>
                {platform.label}
              </option>
            ))}
          </select>
        </label>
        <label className="adl-field">
          <span>Architecture</span>
          <select
            value={build.arch}
            onChange={(event) => {
              setArch(event.target.value);
              setDetected(false);
            }}
          >
            {forOs.map((option) => (
              <option key={option.arch} value={option.arch}>
                {option.archLabel}
                {option.archNote ? ` · ${option.archNote}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="adl-meta">
        <li>
          <span>Archive</span>
          <b className="mono">{build.file}</b>
        </li>
        <li>
          <span>Size</span>
          <b className="mono">
            {build.size} · {build.format}
          </b>
        </li>
        <li>
          <span>SHA-256</span>
          <b className="mono" title={build.sha256}>
            {shortSha(build.sha256)}
          </b>
        </li>
      </ul>
    </div>
  );
}
