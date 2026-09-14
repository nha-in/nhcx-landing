'use client';

import { useEffect, useRef } from 'react';

/*
 * The document that travels the provider ↔ NHCX ↔ payer network. It appears
 * where the providers' trunk meets the wire, runs along the wire and through
 * the exchange to the payers' trunk, and vanishes on arrival; a moment later
 * a second document appears there and comes back the same way: the claim
 * out (blue), the response home (green). The exchange sits above the
 * document so it disappears inside while it is being handled.
 *
 * Its position is worked out on every frame from the network's own layout
 * offsets, in the same CSS pixels the transform moves it in, so it sits on
 * the wire exactly as the wire is drawn at that moment: no screen size, page
 * zoom, browser zoom, late font, or resize can put it off the line.
 */

const SPEED = 230; // px per second
const FADE = 200; // ms, the opacity transition in the stylesheet
const HANDOFF = 500; // ms between the claim vanishing and the response appearing
const PAUSE = 700; // ms between round trips

type Phase = 'out' | 'handoff' | 'back' | 'pause';

export default function NetworkPacket() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const net = el?.parentElement;
    if (!el || !net) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pGrid = net.querySelector<HTMLElement>('.is-provider .how-grid');
    const yGrid = net.querySelector<HTMLElement>('.is-payer .how-grid');
    const hub = net.querySelector<HTMLElement>('.how-hub');
    const wire = net.querySelector<HTMLElement>('.how-wire');
    if (!pGrid || !yGrid || !hub || !wire) return;

    // An element's offset from the network's top-left, in CSS pixels.
    const at = (e: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = e;
      while (n && n !== net) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    // The wire's stops, left to right: providers' trunk, the hub's two
    // sides, the payers' trunk; all on the wire's centre line.
    const stops = () => {
      const y = at(wire).y + wire.offsetHeight / 2;
      const h = at(hub).x;
      return { xs: [at(pGrid).x + pGrid.offsetWidth, h, h + hub.offsetWidth, at(yGrid).x], y };
    };

    let phase: Phase = 'pause';
    let since = performance.now() - PAUSE + 400;
    let raf = 0;
    let visible = true;

    const place = (x: number, y: number) => {
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (net.offsetWidth === 0) return;
      const { xs, y } = stops();
      const span = xs[3] - xs[0];
      const legMs = (Math.abs(span) / SPEED) * 1000;
      const t = now - since;
      if (phase === 'out' || phase === 'back') {
        const k = Math.min(t / legMs, 1);
        place(phase === 'out' ? xs[0] + span * k : xs[3] - span * k, y);
        if (k >= 1) {
          el.style.opacity = '0';
          phase = phase === 'out' ? 'handoff' : 'pause';
          since = now;
        }
        return;
      }
      const hold = FADE + (phase === 'handoff' ? HANDOFF : PAUSE);
      if (t < hold) return;
      phase = phase === 'handoff' ? 'back' : 'out';
      since = now;
      el.classList.toggle('is-response', phase === 'back');
      place(phase === 'out' ? xs[0] : xs[3], y);
      el.style.opacity = '1';
    };

    // Runs only while the network is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        since = performance.now();
        phase = 'pause';
        el.style.opacity = '0';
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(net);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span className="how-packet" ref={ref} aria-hidden="true">
      {/* The file icon, inline so it takes its colour from the stylesheet. */}
      <svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M27.5 11L19.25 2.75H8.25C7.52065 2.75 6.82118 3.03973 6.30546 3.55546C5.78973 4.07118 5.5 4.77065 5.5 5.5V27.5C5.5 28.2293 5.78973 28.9288 6.30546 29.4445C6.82118 29.9603 7.52065 30.25 8.25 30.25H24.75C25.4793 30.25 26.1788 29.9603 26.6945 29.4445C27.2103 28.9288 27.5 28.2293 27.5 27.5V11ZM19.25 2.75L19.25 11H27.5M22 17.875H11M22 23.375H11M13.75 12.375H11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
