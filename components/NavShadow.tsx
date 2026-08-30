'use client';

import { useEffect } from 'react';

/**
 * Gives the sticky header row a hairline shadow once the page has scrolled,
 * so it reads as floating over content rather than sitting in it. Toggles
 * `is-stuck` on `.navbar`; the transition lives in globals.css.
 */
export default function NavShadow() {
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.navbar');
    if (!bar) return;
    let queued = false;
    const update = () => {
      queued = false;
      bar.classList.toggle('is-stuck', window.scrollY > 4);
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}
