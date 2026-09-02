'use client';

import { useEffect, useRef } from 'react';

/**
 * "How a typical flow looks like" — a claim's round trip, told as a pinned
 * scroll story on wide screens (the page scrolls 520vh while the stage stays
 * put; the path draws, the packet moves, one waypoint card at a time) and
 * as a plain vertical timeline on narrow screens or under reduced motion.
 * Both variants are in the HTML; CSS picks one by viewport width.
 */

const STEPS = [
  { tag: '01 · Hospital HMIS', title: 'Structured at source', text: 'The discharge summary, bill lines and codes leave the HMIS as a signed FHIR R4 bundle. No PDFs, no re-typing.', tick: 'Hospital HMIS' },
  { tag: '02 · In transit', title: 'Schema-checked and signed', text: 'Validated against the specification and signed on both sides, leaving an immutable trail.', tick: 'In transit' },
  { tag: '03 · NHCX', title: 'Route and deliver', text: 'The exchange identifies the payer and delivers the claim. One integration, every payer.', tick: 'NHCX' },
  { tag: '04 · Payer engine', title: 'Auto-adjudicated', text: 'Policy active, member verified. Package rate matched. Duplicate and abuse checks clear.', tick: 'Payer engine' },
  { tag: '05 · The return leg', title: 'Back to the provider', text: 'The decision travels the same path in reverse and lands in the HMIS: a round trip, not a one-way pipe.', tick: 'Return leg' },
];

const NODES: Array<[number, number]> = [
  [150, 420],
  [380, 305],
  [600, 215],
  [900, 330],
  [400, 472],
];
const STOPS = [0, 0.16, 0.34, 0.55, 0.78];
const FWD = 'M150,420 Q262,392 380,305 Q502,218 600,215 Q772,226 900,330';
const RET = 'M900,330 C820,478 420,516 150,420';

export default function Journey() {
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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
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
      const total = Math.max(el.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-el.getBoundingClientRect().top / total, 0), 1);
      const fT = Math.min(p / 0.78, 1);
      const rT = p <= 0.78 ? 0 : (p - 0.78) / 0.22;
      fwd.style.strokeDashoffset = `${fLen * (1 - fT)}px`;
      ret.style.strokeDashoffset = `${rLen * (1 - rT)}px`;
      const pt = rT > 0 ? ret.getPointAtLength(rT * rLen) : fwd.getPointAtLength(fT * fLen);
      pk.forEach((c) => {
        c.setAttribute('cx', pt.x.toFixed(1));
        c.setAttribute('cy', pt.y.toFixed(1));
      });
      let idx = 0;
      for (let i = 0; i < STOPS.length; i++) if (p >= STOPS[i]) idx = i;
      if (idx !== last) {
        last = idx;
        wps.forEach((w, i) => w.classList.toggle('is-on', i === idx));
        ticks.forEach((t, i) => t.classList.toggle('is-on', i === idx));
        glows.forEach((g, i) => g.setAttribute('opacity', i === idx ? '0.20' : '0'));
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
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="journey" className="lp-journey" aria-labelledby="journey-title">
      {/* wide: pinned stage */}
      <div className="lp-journey-scroll" ref={wrap}>
        <div className="lp-journey-stage">
          <div className="lp-wrap lp-journey-head">
            <p className="lp-eyebrow on-dark bare">How a typical flow looks like</p>
            <h2 id="journey-title">From the hospital&rsquo;s HMIS to a decision, and back again</h2>
          </div>
          <div className="lp-journey-graph-wrap">
            <div className="lp-journey-graph">
              <div className="lp-journey-canvas">
                <svg viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <g data-cam="">
                    <path d={RET} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" strokeDasharray="7 8" />
                    <path data-path="ret" d={RET} fill="none" stroke="#8FA0FF" strokeWidth="2.2" />
                    <path d={FWD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                    <path data-path="fwd" d={FWD} fill="none" stroke="#3E5BFF" strokeWidth="2.6" />
                    {NODES.slice(0, 4).map(([x, y], i) => (
                      <circle key={i} data-glow="" cx={x} cy={y} r={i === 2 ? 34 : 26} fill="#3E5BFF" opacity="0" />
                    ))}
                    <circle cx="150" cy="420" r="6" fill="#ADBDCC" />
                    <circle cx="380" cy="305" r="5" fill="#ADBDCC" />
                    <circle cx="600" cy="215" r="10" fill="#FFFFFF" />
                    <circle cx="600" cy="215" r="19" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />
                    <circle cx="900" cy="330" r="6" fill="#ADBDCC" />
                    <text x="150" y="452" textAnchor="middle" fill="#8792A2" fontFamily="'IBM Plex Mono', monospace" fontSize="13" letterSpacing="1.2">
                      HMIS
                    </text>
                    <text x="600" y="180" textAnchor="middle" fill="#8792A2" fontFamily="'IBM Plex Mono', monospace" fontSize="13" letterSpacing="1.2">
                      NHCX
                    </text>
                    <text x="900" y="364" textAnchor="middle" fill="#8792A2" fontFamily="'IBM Plex Mono', monospace" fontSize="13" letterSpacing="1.2">
                      PAYER
                    </text>
                    <circle data-packet="" cx="150" cy="420" r="16" fill="#3E5BFF" opacity="0.28" />
                    <circle data-packet="" cx="150" cy="420" r="5.5" fill="#FFFFFF" />
                  </g>
                </svg>
                {STEPS.map((s, i) => (
                  <div key={s.tag} className="lp-wp" data-wp={i}>
                    <div className="lp-wp-tag">{s.tag}</div>
                    <b>{s.title}</b>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lp-wrap lp-ticks" aria-hidden="true">
            {STEPS.map((s, i) => (
              <div key={s.tick} className="lp-tick" data-tick={i}>
                {s.tick}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* narrow: vertical timeline */}
      <div className="lp-journey-list">
        <div className="lp-wrap">
          <p className="lp-eyebrow on-dark bare">How a typical flow looks like</p>
          <h2>From the hospital&rsquo;s HMIS to a decision, and back again</h2>
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.tag} className="lp-step" style={{ listStyle: 'none' }}>
                <div className="lp-step-rail" aria-hidden="true">
                  {i === 4 ? <span className="lp-step-up">▲</span> : <span className={`lp-step-dot${i === 2 ? ' hub' : ''}`} />}
                  {i < 4 && <span className={`lp-step-line${i === 3 ? ' dashed' : ''}`} />}
                </div>
                <div>
                  <div className="lp-wp-tag">{s.tag}</div>
                  <b>{s.title}</b>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
