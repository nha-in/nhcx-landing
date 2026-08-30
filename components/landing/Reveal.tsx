'use client';

import { useEffect } from 'react';

/**
 * Scroll reveal for `[data-reveal]` elements on the landing page.
 *
 * The static HTML is fully visible; on mount this adds `lp-armed` to <html>
 * (which is what lets styles/landing.css hide the elements) and then marks
 * each one `is-in` as it enters the viewport, honouring `data-delay` in
 * milliseconds. Reduced motion, or a browser without IntersectionObserver,
 * shows everything at once; a fail-safe reveals the rest after four seconds
 * whatever happens.
 */
export default function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!els.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showAll = () => els.forEach((el) => el.classList.add('is-in'));
    if (reduced || !('IntersectionObserver' in window)) {
      showAll();
      return;
    }
    root.classList.add('lp-armed');
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const delay = parseInt(el.dataset.delay ?? '0', 10) || 0;
          timers.push(window.setTimeout(() => el.classList.add('is-in'), delay));
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    const failSafe = window.setTimeout(showAll, 4000);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
      clearTimeout(failSafe);
      root.classList.remove('lp-armed');
    };
  }, []);
  return null;
}
