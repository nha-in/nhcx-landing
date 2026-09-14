'use client';

import { useEffect, useRef, useState } from 'react';
import { TRAVELS } from '@/lib/pmjay-copy';
import ClaimWindow from '@/components/pmjay/ClaimWindow';

/*
 * How a scheme claim travels, as a pinned scroll story. On wide screens the
 * section is a tall track and the whole view (the heading, the four moves
 * and the panel) locks under the header while the track passes. While it is
 * locked, any scroll gesture, small or large, carries the story to the next
 * move or back to the previous one, the way the home page's flow story
 * steps; scrolling on from the last move, or back from the first, lets the
 * page go. Clicking a move goes to it. On narrow screens nothing pins: a
 * move is picked as it passes the middle of the viewport. The window beside
 * the moves (ClaimWindow) plays the move that is picked.
 */

const WIDE = '(min-width: 1101px)';

export default function PmjayTravels() {
  const n = TRAVELS.steps.length;
  const [step, setStep] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLLIElement | null>>([]);
  const goRef = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const mq = window.matchMedia(WIDE);
    // One stop per move, from the start of the lock (0) to its end (1).
    const TARGETS = Array.from({ length: n }, (_, i) => i / (n - 1));
    const AT_STOP = 0.04;
    const STEP_MS = 380;
    // How far a gesture has to scroll before it moves the story: one wheel
    // notch does, a small trackpad nudge does not.
    const NEED_WHEEL = 70;
    const NEED_TOUCH = 56;
    let io: IntersectionObserver | null = null;
    let queued = false;
    let frame = 0;
    let steppedAt = 0;
    let lastDelta = 0;
    let lastAt = 0;
    let lastDir = 0;
    let gathered = 0;
    let used = false;
    let pending = 0;
    let latched = false;
    let settleTimer = 0;
    let touchY: number | null = null;

    // All in viewport pixels, so the ratios hold under the page zoom. The
    // lock starts when the track's top reaches the header and ends when its
    // bottom reaches the viewport's.
    const measure = () => {
      const r = el.getBoundingClientRect();
      const head = document.querySelector('.hdr')?.getBoundingClientRect().height ?? 0;
      const endTop = window.innerHeight - r.height;
      const total = Math.max(head - endTop, 1);
      const pinned = r.height > 0 && r.top <= head + 0.5 && r.top >= endTop - 0.5;
      return { r, head, total, p: (head - r.top) / total, pinned };
    };
    const nearest = (p: number) => TARGETS.reduce((best, t, i) => (Math.abs(t - p) < Math.abs(TARGETS[best] - p) ? i : best), 0);
    const show = () => {
      queued = false;
      const { p } = measure();
      setStep(nearest(Math.min(Math.max(p, 0), 1)));
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(show);
      }
    };

    // The stop a gesture in this direction should reach, or -1 when the story
    // is over in that direction and the page should scroll on.
    const stopFor = (p: number, dir: number) => {
      let here = -1;
      for (let i = 0; i < n; i++) if (Math.abs(TARGETS[i] - p) < AT_STOP) here = i;
      if (here < 0) {
        if (dir > 0) for (let i = 0; i < n; i++) if (TARGETS[i] < p) here = i;
        if (dir < 0) for (let i = n - 1; i >= 0; i--) if (TARGETS[i] > p) here = i;
      }
      const next = here + dir;
      return next >= 0 && next < n ? next : -1;
    };
    const claim = (dir: number) => {
      const m = measure();
      return m.pinned ? stopFor(m.p, dir) : -1;
    };
    const release = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pending = 0;
    };
    // Eases the page to a stop over about a third of a second; the distance
    // left is measured every frame, so scroll units and rect units need not
    // agree (the page zoom) for it to land. A gesture that arrived meanwhile
    // runs next.
    const moveTo = (target: number) => {
      cancelAnimationFrame(frame);
      steppedAt = performance.now();
      let frames = 0;
      const tick = () => {
        const { r, head, total } = measure();
        const remaining = r.top - (head - target * total);
        if (Math.abs(remaining) < 1 || ++frames > 90) {
          frame = 0;
          if (pending) {
            const dir = pending;
            pending = 0;
            const next = claim(dir);
            if (next >= 0) moveTo(TARGETS[next]);
          }
          return;
        }
        window.scrollBy({ top: Math.abs(remaining) < 6 ? remaining : remaining * 0.18, behavior: 'instant' });
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const go = (dir: number, next: number) => {
      const since = performance.now() - steppedAt;
      if (frame || since < STEP_MS) {
        // The rising deltas of the flick that started a step must not count twice.
        if (since > 200) pending = dir;
        return;
      }
      moveTo(TARGETS[next]);
    };
    // A wheel sequence the browser will not let us cancel (it began before the
    // lock) is left to run, and the page settles on the nearest move after.
    const settle = () => {
      window.clearTimeout(settleTimer);
      if (!latched) return;
      latched = false;
      const m = measure();
      if (m.pinned && !frame) moveTo(TARGETS[nearest(m.p)]);
    };
    const onScrollSettle = () => {
      if (!latched) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 160);
    };
    const onWheel = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY);
      if (!dir || !measure().pinned) return;
      if (!e.cancelable) {
        latched = true;
        pending = 0;
        return;
      }
      const now = performance.now();
      const d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 16 : 1);
      const rising = d > lastDelta * 1.2 || (d >= 30 && d >= lastDelta);
      const fresh = now - lastAt > 120 || rising;
      // One gesture gathers its distance until it has moved the story once;
      // a pause, a turn, or a new flick after that step starts another.
      if (now - lastAt > 160 || dir !== lastDir || (used && rising)) {
        gathered = 0;
        used = false;
      }
      lastAt = now;
      lastDelta = d;
      lastDir = dir;
      gathered += d;
      const next = claim(dir);
      if (next < 0) {
        // Over in this direction: a fresh gesture takes the page with it; the
        // tail of an earlier one is swallowed so a step that just landed on
        // the first or last move is not scrolled off it.
        if (fresh) release();
        else e.preventDefault();
        return;
      }
      e.preventDefault();
      if (!used && gathered >= NEED_WHEEL) {
        used = true;
        go(dir, next);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      const d = touchY - e.touches[0].clientY;
      const dir = Math.sign(d);
      if (!dir) return;
      const next = claim(dir);
      if (next < 0) {
        release();
        return;
      }
      if (!e.cancelable) {
        latched = true;
        pending = 0;
        return;
      }
      e.preventDefault();
      if (Math.abs(d) < NEED_TOUCH) return;
      touchY = e.touches[0].clientY;
      go(dir, next);
    };

    const detachWide = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScrollSettle);
      window.removeEventListener('scrollend', settle);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      release();
    };
    const setup = () => {
      detachWide();
      io?.disconnect();
      io = null;
      if (mq.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('scroll', onScrollSettle, { passive: true });
        window.addEventListener('scrollend', settle);
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        show();
        goRef.current = (i: number) => moveTo(TARGETS[i]);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
        },
        { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
      );
      refs.current.forEach((li) => li && observer.observe(li));
      io = observer;
      goRef.current = (i: number) => {
        const li = refs.current[i];
        if (!li) return;
        const r = li.getBoundingClientRect();
        window.scrollTo({ top: r.top + window.scrollY - window.innerHeight / 2 + r.height / 2, behavior: 'smooth' });
      };
    };

    setup();
    mq.addEventListener('change', setup);
    window.addEventListener('resize', onScroll);
    return () => {
      mq.removeEventListener('change', setup);
      window.removeEventListener('resize', onScroll);
      window.clearTimeout(settleTimer);
      detachWide();
      io?.disconnect();
    };
  }, [n]);

  return (
    <section className="tl-section is-alt pj-travels" id="pmjay-travels" aria-labelledby="pj-travels-title">
      <div className="pj-travels-scroll" ref={track}>
        <div className="pj-travels-stage">
          <div className="wrap pj-travels-frame">
            <div className="tl-head">
              <h2 className="tl-h2" id="pj-travels-title">
                {TRAVELS.titleLead} <span>{TRAVELS.titleAccent}</span>
              </h2>
              <p className="tl-sub">{TRAVELS.sub}</p>
            </div>

            <div className="pj-travels-grid">
              <ol className="pj-steps">
                {TRAVELS.steps.map((s, i) => (
                  <li
                    key={s.title}
                    data-step={i}
                    ref={(li) => {
                      refs.current[i] = li;
                    }}
                    className={step === i ? 'is-on' : ''}
                  >
                    <button type="button" onClick={() => goRef.current(i)} aria-current={step === i ? 'step' : undefined}>
                      <span className="pj-dot" aria-hidden="true" />
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="pj-stage">
                <ClaimWindow step={step} />
                <div className="pj-stage-foot pj-mono">
                  <span>{TRAVELS.footLabel}</span>
                  <span>
                    {String(step + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
