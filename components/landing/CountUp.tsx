'use client';

import { useEffect, useRef } from 'react';

/**
 * A figure that counts up from zero the first time it scrolls into view.
 *
 * The server renders the final value, so the static HTML is always right;
 * the animation only runs after hydration, over ~1 s with an ease-out curve
 * so the last digits settle slowly. A prefix such as "~" or "₹" and a suffix
 * such as "%" or "+" are kept around the number. Reduced motion shows the
 * final value at once.
 */
export default function CountUp({ value, duration = 1000 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!m) return;
    const [, prefix, digits, suffix] = m;
    const target = Number(digits.replace(/,/g, ''));
    if (!Number.isFinite(target)) return;
    const decimals = (digits.split('.')[1] ?? '').length;
    const fmt = new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const grouped = digits.includes(',');
    const show = (n: number) => {
      el.textContent = `${prefix}${grouped ? fmt.format(n) : n.toFixed(decimals)}${suffix}`;
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        show(target * eased);
        if (t < 1) raf = requestAnimationFrame(frame);
        else show(target);
      };
      show(0);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="lp-count">
      {value}
    </span>
  );
}
