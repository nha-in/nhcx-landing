'use client';

import { useEffect, useRef } from 'react';

/**
 * A figure whose digits fall into place the first time it scrolls into view,
 * and which afterwards simply shows whatever it is given.
 *
 * The fall belongs to the arrival and nothing else. While a digit is in the
 * air its text cycles through other digits, which reads as a counter landing;
 * doing that again on every later change would make a counter walking 100,
 * 101, 102 flicker through nonsense between each one, and a number that is
 * only briefly true is worse than a number that simply changes. So an update
 * is a plain re-render: React writes the new digits and they stand.
 *
 * Each digit is its own span carrying its real value, so the server renders
 * the finished number and the static HTML is correct before any JavaScript
 * runs; nothing is assembled here, only animated. A screen reader reads the
 * concatenated text either way, and no-JS, reduced motion and a failed
 * hydration all leave the true figure on the page.
 *
 * Every timer is cleared on unmount and the true digit written back, so an
 * element that leaves mid-fall cannot be left showing a random number.
 */
const DIGIT = /\d/;
const STEP = 55;
const FALL = 620;
const STAGGER = 45;

export default function FallingCount({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const revealed = useRef(false);

  useEffect(() => {
    const root = ref.current;
    if (!root || revealed.current) return;
    revealed.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const digits = Array.from(root.querySelectorAll<HTMLElement>('.fc-d'));
    if (!digits.length) return;
    const timers: number[] = [];

    const fall = (digit: HTMLElement, stagger: number) => {
      const final = digit.dataset.final ?? digit.textContent ?? '';
      digit.style.setProperty('--fc-delay', `${stagger}ms`);
      digit.classList.add('is-falling');
      let elapsed = 0;
      const tick = () => {
        elapsed += STEP;
        if (elapsed >= stagger + FALL) {
          digit.textContent = final;
          return;
        }
        digit.textContent = String(Math.floor(Math.random() * 10));
        timers.push(window.setTimeout(tick, STEP));
      };
      timers.push(window.setTimeout(tick, STEP));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          digits.forEach((digit, i) => fall(digit, STAGGER * i));
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(root);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      // Whatever the fall was mid-way through writing, the truth goes back.
      digits.forEach((digit) => (digit.textContent = digit.dataset.final ?? digit.textContent));
    };
  }, []);

  return (
    <span className="fc" ref={ref}>
      {value.split('').map((character, i) =>
        DIGIT.test(character) ? (
          <span key={i} className="fc-d" data-final={character}>
            {character}
          </span>
        ) : (
          <span key={i} className="fc-sep">
            {character}
          </span>
        ),
      )}
    </span>
  );
}
