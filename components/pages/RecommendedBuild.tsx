'use client';

import { useEffect, useState } from 'react';
import type { DistBuild } from '@/lib/downloads';
import { withBase } from '@/lib/paths';

/**
 * The build that matches the machine the page is being read on.
 *
 * The download table lists every platform; this picks the one row a visitor
 * actually wants and puts it above the table. Detection is best-effort and
 * runs only in the browser — it renders nothing until a build is matched, so
 * the static export stays the same for every reader and hydration is clean.
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

export default function RecommendedBuild({ builds }: { builds: DistBuild[] }) {
  const [build, setBuild] = useState<DistBuild | null>(null);

  useEffect(() => {
    let cancelled = false;
    let detected: Detected | null = null;
    try {
      detected = detectFromUserAgent();
    } catch {
      return;
    }
    if (!detected) return;
    const guess = detected;
    // Detection is a convenience: any failure just leaves the table to do the
    // job, it never takes the page with it.
    refineArch(guess)
      .catch(() => guess)
      .then((refined) => {
        if (cancelled) return;
        const match =
          builds.find((b) => b.os === refined.os && b.arch === refined.arch) ??
          builds.find((b) => b.os === guess.os && b.arch === guess.arch);
        if (match) setBuild(match);
      })
      .catch(() => {
        /* nothing to recommend */
      });
    return () => {
      cancelled = true;
    };
  }, [builds]);

  if (!build) return null;

  return (
    <div className="dlt-pick">
      <span className="dlt-pick-copy">
        <b>Recommended for this machine</b>
        <span>
          {build.osLabel} · {build.archLabel}
          {build.archNote ? ` — ${build.archNote}` : ''}
        </span>
      </span>
      <span className="dlt-pick-meta">
        {build.format} · {build.size}
      </span>
      <a href={withBase(build.url)} download className="btn btn-md btn-primary">
        <span className="kit-download-arrow" />
        Download for {build.osLabel}
      </a>
    </div>
  );
}
