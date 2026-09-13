'use client';

import { useEffect, useRef } from 'react';

/*
 * "How a typical flow looks like" — a claim's round trip, carried over from
 * the previous landing page and set in this design's dark band. On wide
 * screens it is a pinned scroll story: the page scrolls while the stage stays
 * put, the path draws, the packet moves along it and one waypoint card shows
 * at a time, and each scroll gesture carries it to the next stop. On narrow screens, or under reduced motion, it is a plain
 * vertical timeline. Both are in the HTML; CSS picks one by viewport width.
 *
 * The geometry is one drawing rather than editable values: the node
 * positions, the stops along the path and the curves belong together.
 */

const STEPS = [
  { tag: '01 · HMIS / LMIS / RIS / EMR', title: 'Patient Records', text: 'Clinical Notes, Treatment Plan, Procedure Details, Diagnostic Reports, Discharge Summary and Itemized Bill sent to Payer addressee.', tick: 'HMIS / EMR' },
  { tag: '02 · In Transit', title: 'Schema checked and validated', text: 'The structured information enters pipeline as an encrypted payload in FHIR R4 format with due digital authorization from both sender and receiver.', tick: 'In transit' },
  { tag: '03 · NHCX Gateway', title: 'Record transaction and Deliver', text: 'NHCX maintains log of transaction about sender and receiver from Participant IDs and the purpose of the transaction from Workflow ID and forwards to the Beneficiary.', tick: 'NHCX Gateway' },
  { tag: '04 · Payer Engine', title: 'Claim Processing', text: 'Payer matches the data received against its existing records and adjudicates the claim easily based on the every minute details made available.', tick: 'Payer engine' },
  { tag: '05 · The Response', title: 'Communication of Decision', text: 'The return leg follows the same sets of protocol in the reverse direction with Provider receiving a callback.', tick: 'The response' },
];
const LABELS = { start: 'HMIS', hub: 'NHCX', end: 'PAYER' };

const NODES: Array<[number, number]> = [
  [150, 420],
  [380, 305],
  [600, 215],
  [900, 330],
  [400, 472],
];
/* The forward leg takes the first 78% of the scroll, the return the rest. */
const FWD_SHARE = 0.78;
const FWD = 'M150,420 Q262,392 380,305 Q502,218 600,215 Q772,226 900,330';
const RET = 'M900,330 C820,478 420,516 150,420';

export default function TypicalFlow() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fwd = el.querySelector<SVGPathElement>('[data-path="fwd"]');
    const ret = el.querySelector<SVGPathElement>('[data-path="ret"]');
    if (!fwd || !ret) return;
    const pk = Array.from(el.querySelectorAll<SVGCircleElement>('[data-packet]'));
    const cam = el.querySelector<SVGGElement>('[data-cam]');
    const wps = Array.from(el.querySelectorAll<HTMLElement>('[data-wp]'));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>('[data-tick]'));
    const glows = Array.from(el.querySelectorAll<SVGCircleElement>('[data-glow]'));
    const fLen = fwd.getTotalLength();
    const rLen = ret.getTotalLength();
    fwd.style.strokeDasharray = `${fLen}px`;
    ret.style.strokeDasharray = `${rLen}px`;
    // Where along the forward path each node sits, as a share of its length:
    // the stops of the story. The last node is the return leg's end.
    const nodeAt = NODES.slice(0, -1).map(([x, y]) => {
      let best = 0;
      let bestD = Infinity;
      for (let l = 0; l <= fLen; l += 1) {
        const q = fwd.getPointAtLength(l);
        const d = (q.x - x) ** 2 + (q.y - y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = l;
        }
      }
      return best / fLen;
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fwd.style.strokeDashoffset = '0px';
      ret.style.strokeDashoffset = '0px';
      wps.forEach((w) => w.classList.add('is-on'));
      ticks.forEach((t) => t.classList.add('is-on'));
      return;
    }

    let queued = false;
    let last = -1;
    const update = () => {
      queued = false;
      // Both from the same rect, so the page zoom on desktop cannot mix
      // zoomed and unzoomed pixels: offsetHeight is in the element's own
      // units, the rect is in the viewport's.
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / total, 0), 1);
      const fT = Math.min(p / FWD_SHARE, 1);
      const rT = p <= FWD_SHARE ? 0 : (p - FWD_SHARE) / (1 - FWD_SHARE);
      fwd.style.strokeDashoffset = `${fLen * (1 - fT)}px`;
      ret.style.strokeDashoffset = `${rLen * (1 - rT)}px`;
      const pt = rT > 0 ? ret.getPointAtLength(rT * rLen) : fwd.getPointAtLength(fT * fLen);
      pk.forEach((c) => {
        c.setAttribute('cx', pt.x.toFixed(1));
        c.setAttribute('cy', pt.y.toFixed(1));
      });
      // The waypoint whose node the packet has reached; the last one once
      // the return leg has begun.
      let idx = 0;
      for (let i = 0; i < nodeAt.length; i++) if (fT + 1e-3 >= nodeAt[i]) idx = i;
      if (rT > 0) idx = NODES.length - 1;
      if (idx !== last) {
        last = idx;
        wps.forEach((w, i) => w.classList.toggle('is-on', i === idx));
        ticks.forEach((t, i) => t.classList.toggle('is-on', i === idx));
        glows.forEach((g, i) => g.setAttribute('opacity', i === idx ? '0.2' : '0'));
        if (cam) {
          const [nx, ny] = NODES[idx];
          const dx = ((600 - nx) * 0.12).toFixed(1);
          const dy = ((300 - ny) * 0.12).toFixed(1);
          cam.setAttribute('transform', `translate(${dx},${dy}) translate(600,280) scale(1.05) translate(-600,-280)`);
        }
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Stepping. While the stage is pinned, a scroll gesture carries the story
    // to the next stop in its own direction, whatever the size of the
    // gesture: five stops, four scrolls end to end. Native scrolling is held
    // off meanwhile. A gesture that arrives while a step is still moving
    // queues one more, so quick repeated scrolling keeps the story going.
    // Scrolling on from the last stop, or back from the first, lets the page
    // go. A trackpad keeps sending shrinking deltas after a flick, so only a
    // delta that grows, or a notch-sized one, or one after a pause, counts as
    // a new gesture.
    //
    // Chrome makes every wheel event after the first of a sequence
    // non-cancelable when that first one was not cancelled. A fast scroll
    // that starts above the story and carries into it is such a sequence:
    // it cannot be stopped, so it is left to run (the story follows the
    // scroll anyway) and, once it ends, the page settles on the nearest stop.
    const TARGETS = [...nodeAt.map((t) => t * FWD_SHARE), 1];
    const AT_STOP = 0.04;
    const STEP_MS = 380;
    let anim = 0;
    let steppedAt = 0;
    let lastDelta = 0;
    let lastAt = 0;
    let pending = 0;
    let latched = false;
    let settleTimer = 0;
    let touchY: number | null = null;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const pinned = rect.height > 0 && rect.top <= 0.5 && rect.bottom >= window.innerHeight - 0.5;
      return { rect, total, p: -rect.top / total, pinned };
    };
    const nearest = (p: number) => TARGETS.reduce((best, t, i) => (Math.abs(t - p) < Math.abs(TARGETS[best] - p) ? i : best), 0);
    // The stop a gesture in this direction should reach, or -1 when the
    // story is over in that direction and the page should scroll on.
    const stopFor = (p: number, dir: number) => {
      let here = -1;
      for (let i = 0; i < TARGETS.length; i++) if (Math.abs(TARGETS[i] - p) < AT_STOP) here = i;
      if (here < 0) {
        if (dir > 0) for (let i = 0; i < TARGETS.length; i++) if (TARGETS[i] < p) here = i;
        if (dir < 0) for (let i = TARGETS.length - 1; i >= 0; i--) if (TARGETS[i] > p) here = i;
      }
      const next = here + dir;
      return next >= 0 && next < TARGETS.length ? next : -1;
    };
    // Eases the page to a stop over about a third of a second, then runs a
    // pending step if one arrived meanwhile. The distance left is measured
    // every frame, so scroll units and rect units need not agree (the
    // desktop page zoom) for it to land exactly.
    const moveTo = (target: number) => {
      cancelAnimationFrame(anim);
      steppedAt = performance.now();
      let frames = 0;
      const frame = () => {
        const { rect, total } = measure();
        const remaining = rect.top + target * total;
        // Within a pixel is landed: scroll offsets are whole device pixels,
        // so a closer target may never be reached. The frame cap is a
        // backstop so the loop can never be left running and fighting the
        // reader's own scrolling.
        if (Math.abs(remaining) < 1 || ++frames > 90) {
          anim = 0;
          if (pending) {
            const dir = pending;
            pending = 0;
            const next = claim(dir);
            if (next >= 0) moveTo(TARGETS[next]);
          }
          return;
        }
        window.scrollBy({ top: Math.abs(remaining) < 6 ? remaining : remaining * 0.16, behavior: 'instant' });
        anim = requestAnimationFrame(frame);
      };
      anim = requestAnimationFrame(frame);
    };
    // The stop a gesture claims, or -1 when the page should scroll as usual.
    const claim = (dir: number) => {
      const m = measure();
      return m.pinned ? stopFor(m.p, dir) : -1;
    };
    // Lets the page scroll as usual: nothing of the story's may still be
    // moving it.
    const release = () => {
      cancelAnimationFrame(anim);
      anim = 0;
      pending = 0;
    };
    // A gesture during a step queues one more, but only once the step is
    // well under way: the rising deltas of the very flick that started it
    // arrive within its first moments and must not count twice.
    const go = (dir: number, next: number) => {
      const since = performance.now() - steppedAt;
      if (anim || since < STEP_MS) {
        if (since > 200) pending = dir;
        return;
      }
      moveTo(TARGETS[next]);
    };
    // The end of a sequence that could not be cancelled: settle on a stop.
    const settle = () => {
      window.clearTimeout(settleTimer);
      if (!latched) return;
      latched = false;
      const m = measure();
      if (m.pinned && !anim) moveTo(TARGETS[nearest(m.p)]);
    };
    const onScrollForSettle = () => {
      if (!latched) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, 160);
    };
    const onWheel = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      if (!measure().pinned) return;
      if (!e.cancelable) {
        latched = true;
        pending = 0;
        return;
      }
      const now = performance.now();
      const d = Math.abs(e.deltaY);
      const fresh = now - lastAt > 120 || d > lastDelta * 1.2 || (d >= 30 && d >= lastDelta);
      lastAt = now;
      lastDelta = d;
      const next = claim(dir);
      if (next < 0) {
        // Over in this direction. A fresh gesture takes the page with it;
        // the tail of an earlier flick is swallowed, so a step that has just
        // landed on the first or last stop is not scrolled off it.
        if (fresh) release();
        else e.preventDefault();
        return;
      }
      e.preventDefault();
      if (fresh) go(dir, next);
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
      if (Math.abs(d) < 24) return;
      touchY = e.touches[0].clientY;
      go(dir, next);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('scroll', onScrollForSettle, { passive: true });
    window.addEventListener('scrollend', settle);

    return () => {
      cancelAnimationFrame(anim);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScrollForSettle);
      window.removeEventListener('scrollend', settle);
    };
  }, []);

  return (
    <div className="flow" id="flow">
      {/* wide: pinned stage */}
      <div className="flow-scroll" ref={wrap}>
        <div className="flow-stage">
          <div className="wrap">
            <h2 className="vh">How a typical flow looks like</h2>
          </div>
          <div className="flow-graph-wrap">
            <div className="flow-graph">
              <div className="flow-canvas">
                <svg viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <g data-cam="">
                    <path d={RET} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeDasharray="7 8" />
                    <path data-path="ret" d={RET} fill="none" stroke="#96a7e9" strokeWidth="2.2" />
                    <path d={FWD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                    <path data-path="fwd" d={FWD} fill="none" stroke="#1f4ee0" strokeWidth="2.6" />
                    {NODES.slice(0, 4).map(([x, y], i) => (
                      <circle key={i} data-glow="" cx={x} cy={y} r={i === 2 ? 34 : 26} fill="#1f4ee0" opacity="0" />
                    ))}
                    <circle cx="150" cy="420" r="6" fill="#b7c3e6" />
                    <circle cx="380" cy="305" r="5" fill="#b7c3e6" />
                    <circle cx="600" cy="215" r="10" fill="#ffffff" />
                    <circle cx="600" cy="215" r="19" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
                    <circle cx="900" cy="330" r="6" fill="#b7c3e6" />
                    <text className="flow-label" x="150" y="452" textAnchor="middle">{LABELS.start}</text>
                    <text className="flow-label" x="600" y="180" textAnchor="middle">{LABELS.hub}</text>
                    <text className="flow-label" x="900" y="364" textAnchor="middle">{LABELS.end}</text>
                    <circle data-packet="" cx="150" cy="420" r="16" fill="#1f4ee0" opacity="0.28" />
                    <circle data-packet="" cx="150" cy="420" r="5.5" fill="#ffffff" />
                  </g>
                </svg>
                {STEPS.map((s, i) => (
                  <div key={s.tag} className="flow-wp" data-wp={i}>
                    <div className="flow-wp-tag">{s.tag}</div>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="wrap flow-ticks" aria-hidden="true">
            {STEPS.map((s, i) => (
              <div key={s.tick} className="flow-tick" data-tick={i}>{s.tick}</div>
            ))}
          </div>
        </div>
      </div>

      {/* narrow: vertical timeline */}
      <div className="flow-list">
        <div className="wrap">
          <h2 className="vh">How a typical flow looks like</h2>
          <ol>
            {STEPS.map((s, i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={s.tag} className="flow-step">
                  <div className="flow-step-rail" aria-hidden="true">
                    {last ? <span className="flow-step-up">▲</span> : <span className={`flow-step-dot${i === 2 ? ' hub' : ''}`} />}
                    {!last && <span className={`flow-step-line${i === STEPS.length - 2 ? ' dashed' : ''}`} />}
                  </div>
                  <div>
                    <div className="flow-wp-tag">{s.tag}</div>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
