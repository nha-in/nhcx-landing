'use client';

import { useEffect, useState } from 'react';

/**
 * The A- / A / A+ control in the government ribbon.
 *
 * The chosen scale is written to `--font-scale` on <html> (which the
 * stylesheet applies to the page) and remembered in localStorage so it
 * survives navigation between the static pages.
 */
const STEPS = [0.9, 1, 1.15, 1.3] as const;
const DEFAULT = 1;
const KEY = 'nhcx-font-scale';

function apply(scale: number) {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(scale));
  root.dataset.fontScale = String(scale);
}

export default function FontSizeControls() {
  const [scale, setScale] = useState<number>(DEFAULT);

  useEffect(() => {
    let stored = DEFAULT;
    try {
      const raw = Number(window.localStorage.getItem(KEY));
      if (STEPS.includes(raw as (typeof STEPS)[number])) stored = raw;
    } catch {
      /* storage may be unavailable; the default is fine */
    }
    setScale(stored);
    apply(stored);
  }, []);

  const change = (next: number) => {
    setScale(next);
    apply(next);
    try {
      window.localStorage.setItem(KEY, String(next));
    } catch {
      /* not persisted, still applied */
    }
  };
  const idx = STEPS.indexOf(scale as (typeof STEPS)[number]);
  const smaller = STEPS[Math.max(0, idx - 1)];
  const larger = STEPS[Math.min(STEPS.length - 1, idx + 1)];

  return (
    <span className="font-controls" role="group" aria-label="Text size">
      <button type="button" onClick={() => change(smaller)} disabled={idx <= 0} aria-label="Decrease text size">
        A-
      </button>
      <button type="button" onClick={() => change(DEFAULT)} aria-label="Default text size" aria-pressed={scale === DEFAULT}>
        A
      </button>
      <button
        type="button"
        onClick={() => change(larger)}
        disabled={idx >= STEPS.length - 1}
        aria-label="Increase text size"
      >
        A+
      </button>
    </span>
  );
}
