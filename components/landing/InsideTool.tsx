/*
 * "See what's happening inside the tool": four cards, each with a line
 * illustration that comes to life while the pointer rests on it, built from
 * the "Card animations with hover effects" design. The animations are pure
 * CSS: every animated part carries the `tk` class and names its keyframes in
 * --anim, and the stylesheet only switches the animation on for the hovered
 * card (styles/landing.css, "inside the tool").
 */

import type { CSSProperties } from 'react';
import { ArrowLeftRight, BookOpen, Cable, FlaskConical } from 'lucide-react';

export default function InsideTool() {
  return (
    <section className="tool" aria-labelledby="tool-title">
      <div className="wrap">
        <h2 className="tool-title" id="tool-title">
          See whats happening
          <span>DevTools</span>
        </h2>
        <div className="tool-grid">
          <article className="tool-card is-dev">
            <h3>Dev Environment</h3>
            <p style={{ maxWidth: '30ch' }}>Build, validate and test NHCX integrations safely before connecting to production.</p>
            <div className="tool-icon is-dev" aria-hidden="true">
              <span className="tool-icon-ring" />
              <FlaskConical size={44} strokeWidth={1.6} />
            </div>
            <div className="tool-art is-bottom">
              <div className="tool-art-box">
                <div style={{ position: 'absolute', inset: '0', opacity: '1', backgroundImage: 'repeating-linear-gradient(to right, #eef2f9 0 1px, transparent 1px 26px), repeating-linear-gradient(to bottom, #eef2f9 0 1px, transparent 1px 26px)', maskImage: 'radial-gradient(120% 90% at 50% 40%, #000 35%, transparent 82%)', WebkitMaskImage: 'radial-gradient(120% 90% at 50% 40%, #000 35%, transparent 82%)' }}>
                </div>
                <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '0s', position: 'absolute', left: '68%', top: '26%', width: '46%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.20), rgba(31,78,224,0) 68%)' } as CSSProperties}>
                </div>
                <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '1.5s', position: 'absolute', left: '33%', top: '85%', width: '42%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.18), rgba(31,78,224,0) 68%)' } as CSSProperties}>
                </div>
                <svg viewBox="0 0 320 430" width="100%" style={{ display: 'block', position: 'relative' }}>
                  <g fill="none" stroke="#dbe3ee" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
                    <rect x="18" y="10" width="284" height="410" rx="16" stroke="#dfe6f1" strokeDasharray="3 6">
                    </rect>
                    <rect x="44" y="188" width="26" height="11" rx="5.5" stroke="#e7ecf4">
                    </rect>
                    <rect x="246" y="300" width="15" height="15" rx="4" stroke="#e7ecf4">
                    </rect>
                    <path d="M28 46 H40 M34 40 V52" stroke="#eaeff6">
                    </path>
                    <path d="M286 384 H298 M292 378 V390" stroke="#eaeff6">
                    </path>
                    <path d="M219 132 V164 A9 9 0 0 1 210 173 H170 A9 9 0 0 0 161 182 V218" stroke="#dde5f0">
                    </path>
                    <path d="M161 254 V286 A9 9 0 0 1 152 295 H114 A9 9 0 0 0 105 304 V340" stroke="#dde5f0">
                    </path>
                  </g>
                  <g fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M219 132 V164 A9 9 0 0 1 210 173 H170 A9 9 0 0 0 161 182 V218" strokeDasharray="150" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.45,0,.25,1)', animationDelay: '.25s', stroke: 'var(--acc)', '--L': 150, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M161 254 V286 A9 9 0 0 1 152 295 H114 A9 9 0 0 0 105 304 V340" strokeDasharray="150" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.45,0,.25,1)', animationDelay: '1.15s', stroke: 'var(--acc)', '--L': 150, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M219 132 V164 A9 9 0 0 1 210 173 H170 A9 9 0 0 0 161 182 V218" stroke="#8aa6f5" strokeDasharray="16 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '.35s', '--L': 150, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.6))' } as CSSProperties}>
                    </path>
                    <path d="M161 254 V286 A9 9 0 0 1 152 295 H114 A9 9 0 0 0 105 304 V340" stroke="#8aa6f5" strokeDasharray="16 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '1.25s', '--L': 150, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.6))' } as CSSProperties}>
                    </path>
                  </g>
                  <g fill="#ffffff" stroke="#d7dfec" strokeWidth="1">
                    <rect x="150" y="96" width="138" height="36" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0s' } as CSSProperties}>
                    </rect>
                    <rect x="92" y="218" width="138" height="36" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '.9s' } as CSSProperties}>
                    </rect>
                    <rect x="36" y="340" width="138" height="36" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '1.8s' } as CSSProperties}>
                    </rect>
                  </g>
                  <g fill="none" stroke="#dde5f0" strokeWidth="1" strokeLinecap="round">
                    <path d="M182 108 H274 M182 120 H246">
                    </path>
                    <path d="M124 230 H216 M124 242 H188">
                    </path>
                    <path d="M68 352 H160 M68 364 H132">
                    </path>
                  </g>
                  <g fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center' }}>
                    <path d="M161 114 l3.2 3.4 l6.2 -7" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '.2s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.5))' } as CSSProperties}>
                    </path>
                    <path d="M103 236 l3.2 3.4 l6.2 -7" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '1.1s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.5))' } as CSSProperties}>
                    </path>
                    <circle cx="50" cy="358" r="3.4" stroke="none" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '2s', fill: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 4px rgba(31,78,224,.6))' } as CSSProperties}>
                    </circle>
                    <circle cx="50" cy="358" r="9" className="tk" style={{ '--anim': 'dcPing', animationTimingFunction: 'ease-out', animationDelay: '2s', stroke: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                    </circle>
                    <g transform="rotate(45 105 392)">
                      <rect x="99" y="386" width="12" height="12" rx="2" stroke="none" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '2.15s', fill: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 5px rgba(31,78,224,.55))' } as CSSProperties}>
                      </rect>
                    </g>
                  </g>
                  <g fill="#94a3b8" fontFamily="'IBM Plex Mono', monospace" fontSize="14" letterSpacing="1.6">
                    <text x="18" y="0" dy="404" fill="#94a3b8">
                      SANDBOX
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </article>

          <article className="tool-card is-reference">
            <h3>Reference Payer &amp; Provider</h3>
            <p style={{ maxWidth: '46ch' }}>Simulate both sides of a claim exchange to test complete NHCX workflows end to end.</p>
            <div className="tool-icon is-ref" aria-hidden="true">
              <span className="tool-icon-ring" />
              <ArrowLeftRight size={44} strokeWidth={1.6} />
            </div>
            <div className="tool-art-box" style={{ marginTop: '2px' }}>
              <div style={{ position: 'absolute', inset: '0', opacity: '1', backgroundImage: 'repeating-linear-gradient(to right, #eef2f9 0 1px, transparent 1px 24px)', maskImage: 'radial-gradient(100% 80% at 50% 50%, #000 20%, transparent 76%)', WebkitMaskImage: 'radial-gradient(100% 80% at 50% 50%, #000 20%, transparent 76%)' }}>
              </div>
              <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '0s', position: 'absolute', left: '21%', top: '50%', width: '26%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.20), rgba(31,78,224,0) 66%)' } as CSSProperties}>
              </div>
              <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '.9s', position: 'absolute', left: '79%', top: '50%', width: '26%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.20), rgba(31,78,224,0) 66%)' } as CSSProperties}>
              </div>
              <svg viewBox="0 0 460 220" width="100%" style={{ display: 'block', position: 'relative' }}>
                <g fill="none" stroke="#eef2f9" strokeWidth="1">
                  <path d="M126 110 C190 70 270 70 334 110">
                  </path>
                  <path d="M126 110 C190 150 270 150 334 110">
                  </path>
                  <path d="M126 110 H334">
                  </path>
                </g>
                <g fill="none" stroke="#dde5f0" strokeWidth="1" strokeLinecap="round">
                  <path d="M126 110 C182 36 278 36 334 110">
                  </path>
                  <path d="M126 110 C182 184 278 184 334 110">
                  </path>
                </g>
                <g fill="none" strokeWidth="1" strokeLinecap="round">
                  <path d="M126 110 C182 36 278 36 334 110" strokeDasharray="250" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '.2s', stroke: 'var(--acc)', '--L': 250, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M334 110 C278 184 182 184 126 110" strokeDasharray="250" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '1.5s', stroke: 'var(--acc)', '--L': 250, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M126 110 C182 36 278 36 334 110" stroke="#8aa6f5" strokeDasharray="18 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '.3s', '--L': 250, opacity: '0', filter: 'drop-shadow(0 0 4px rgba(31,78,224,.6))' } as CSSProperties}>
                  </path>
                  <path d="M334 110 C278 184 182 184 126 110" stroke="#8aa6f5" strokeDasharray="18 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '1.6s', '--L': 250, opacity: '0', filter: 'drop-shadow(0 0 4px rgba(31,78,224,.6))' } as CSSProperties}>
                  </path>
                </g>
                <g fill="#ffffff" stroke="#dbe3ee" strokeWidth="1">
                  <circle cx="96" cy="110" r="30" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0s' } as CSSProperties}>
                  </circle>
                  <circle cx="364" cy="110" r="30" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '1.35s' } as CSSProperties}>
                  </circle>
                </g>
                <g fill="none" stroke="#e3e9f3" strokeWidth="1">
                  <circle cx="96" cy="110" r="20" strokeDasharray="2 5">
                  </circle>
                  <circle cx="364" cy="110" r="20" strokeDasharray="2 5">
                  </circle>
                  <circle cx="96" cy="110" r="40" stroke="#f1f4f9">
                  </circle>
                  <circle cx="364" cy="110" r="40" stroke="#f1f4f9">
                  </circle>
                </g>
                <g stroke="none">
                  <circle cx="96" cy="110" r="3.4" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '.1s', fill: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 4px rgba(31,78,224,.6))' } as CSSProperties}>
                  </circle>
                  <circle cx="364" cy="110" r="3.4" className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '1.4s', fill: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0', filter: 'drop-shadow(0 0 4px rgba(31,78,224,.6))' } as CSSProperties}>
                  </circle>
                </g>
                <g fill="none" strokeWidth="1" style={{ stroke: 'var(--acc)' }}>
                  <circle cx="96" cy="110" r="24" className="tk" style={{ '--anim': 'dcPing', animationTimingFunction: 'ease-out', animationDelay: '.1s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                  </circle>
                  <circle cx="364" cy="110" r="24" className="tk" style={{ '--anim': 'dcPing', animationTimingFunction: 'ease-out', animationDelay: '1.4s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                  </circle>
                </g>
                <g fontFamily="'IBM Plex Mono', monospace" fontSize="18" letterSpacing="1.8" fill="#64748b" textAnchor="middle">
                  <text x="96" y="178">
                    PROVIDER
                  </text>
                  <text x="364" y="178">
                    PAYER
                  </text>
                </g>
                <g>
                  <g className="tk" style={{ '--anim': 'dcDrift', animationTimingFunction: 'ease-out', animationDelay: '.45s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                    <rect x="160" y="8" width="140" height="30" rx="8" fill="#ffffff" strokeWidth="1" style={{ stroke: 'var(--acc)' }}>
                    </rect>
                    <text x="230" y="28" fontFamily="'IBM Plex Mono', monospace" fontSize="16" fill="#1f4ee0" textAnchor="middle" letterSpacing=".4">
                      claim.submit
                    </text>
                  </g>
                  <g className="tk" style={{ '--anim': 'dcDrift', animationTimingFunction: 'ease-out', animationDelay: '1.75s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                    <rect x="150" y="184" width="160" height="30" rx="8" fill="#ffffff" strokeWidth="1" style={{ stroke: 'var(--acc)' }}>
                    </rect>
                    <text x="230" y="204" fontFamily="'IBM Plex Mono', monospace" fontSize="16" fill="#1f4ee0" textAnchor="middle" letterSpacing=".4">
                      claim.response
                    </text>
                  </g>
                </g>
                <g fill="#e6ecf5" stroke="none">
                  <circle cx="230" cy="110" r="1.8">
                  </circle>
                  <circle cx="60" cy="52" r="1.6">
                  </circle>
                  <circle cx="404" cy="176" r="1.6">
                  </circle>
                  <circle cx="292" cy="64" r="1.6">
                  </circle>
                </g>
              </svg>
            </div>
          </article>

          <article className="tool-card is-docs">
            <h3>Documentation</h3>
            <p style={{ maxWidth: '34ch' }}>Find implementation guides, API specifications and technical references for building on NHCX.</p>
            <div className="tool-icon is-docs" aria-hidden="true">
              <span className="tool-icon-ring" />
              <BookOpen size={44} strokeWidth={1.6} />
            </div>
            <div className="tool-art is-bottom">
              <div className="tool-art-box">
                <div style={{ position: 'absolute', inset: '0', opacity: '1', backgroundImage: 'radial-gradient(#e8eef7 1px, transparent 1.2px)', backgroundSize: '18px 18px', maskImage: 'radial-gradient(110% 78% at 50% 48%, #000 28%, transparent 80%)', WebkitMaskImage: 'radial-gradient(110% 78% at 50% 48%, #000 28%, transparent 80%)' }}>
                </div>
                <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '.6s', position: 'absolute', left: '50%', top: '54%', width: '42%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.16), rgba(31,78,224,0) 68%)' } as CSSProperties}>
                </div>
                <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '1.5s', position: 'absolute', left: '50%', top: '20%', width: '60%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(22,163,74,.16), rgba(22,163,74,0) 68%)' } as CSSProperties}>
                </div>
                <svg viewBox="0 0 320 430" width="86%" style={{ display: 'block', position: 'relative', margin: '0 auto' }}>
                  <g fill="none" stroke="#e2e9f3" strokeWidth="1" strokeLinecap="round">
                    <path d="M56 300 C56 268 160 274 160 240">
                    </path>
                    <path d="M160 300 V240">
                    </path>
                    <path d="M264 300 C264 268 160 274 160 240">
                    </path>
                    <path d="M160 196 V150">
                    </path>
                  </g>
                  <g fill="none" strokeWidth="1" strokeLinecap="round">
                    <path d="M56 300 C56 268 160 274 160 240" strokeDasharray="120" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '0.6s', stroke: 'var(--acc)', '--L': 120, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M160 300 V240" strokeDasharray="60" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '0.72s', stroke: 'var(--acc)', '--L': 60, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M264 300 C264 268 160 274 160 240" strokeDasharray="120" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '0.84s', stroke: 'var(--acc)', '--L': 120, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M56 300 C56 268 160 274 160 240" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '0.65s', '--L': 120, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.55))' } as CSSProperties}>
                    </path>
                    <path d="M160 300 V240" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '0.77s', '--L': 60, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.55))' } as CSSProperties}>
                    </path>
                    <path d="M264 300 C264 268 160 274 160 240" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '0.89s', '--L': 120, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.55))' } as CSSProperties}>
                    </path>
                    <path d="M160 196 V150" strokeDasharray="46" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.4,0,.2,1)', animationDelay: '1.35s', stroke: 'var(--acc)', '--L': 46, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M160 196 V150" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '1.4s', '--L': 46, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.55))' } as CSSProperties}>
                    </path>
                  </g>
                  <g fill="#ffffff" stroke="#d7dfec" strokeWidth="1">
                    <rect x="12" y="300" width="88" height="104" rx="12" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0.15s' } as CSSProperties}>
                    </rect>
                    <rect x="116" y="300" width="88" height="104" rx="12" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0.3s' } as CSSProperties}>
                    </rect>
                    <rect x="220" y="300" width="88" height="104" rx="12" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0.45s' } as CSSProperties}>
                    </rect>
                  </g>
                  <g fill="none" stroke="#ccd6e4" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                    <path d="M56 324 C50 319 42 319 37 321 V344 C42 342 50 342 56 346 C62 342 70 342 75 344 V321 C70 319 62 319 56 321 Z">
                    </path>
                    <path d="M56 324 V346">
                    </path>
                    <path d="M160 316 L174 324 V340 L160 348 L146 340 V324 Z">
                    </path>
                    <path d="M153 336 C153 328 167 328 167 336">
                    </path>
                    <rect x="245" y="318" width="38" height="28" rx="4">
                    </rect>
                    <path d="M245 326 H283">
                    </path>
                    <path d="M252 334 L256 338 L252 342 M260 342 H272">
                    </path>
                  </g>
                  <g fontFamily="'IBM Plex Mono', monospace" fontSize="14" letterSpacing=".6" fill="#64748b" textAnchor="middle">
                    <text x="56" y="388">
                      DOCS
                    </text>
                    <text x="160" y="388">
                      OPENAPI
                    </text>
                    <text x="264" y="388">
                      SNIPPETS
                    </text>
                  </g>
                  <rect x="104" y="196" width="112" height="40" rx="20" fill="#ffffff" stroke="#d7dfec" strokeWidth="1" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '1.0s' } as CSSProperties}>
                  </rect>
                  <text x="160" y="223" fontFamily="'IBM Plex Mono', monospace" fontSize="14" letterSpacing="2.2" fill="#64748b" textAnchor="middle">
                    BUILD
                  </text>
                  <rect x="30" y="14" width="260" height="136" rx="12" fill="#ffffff" stroke="#d7dfec" strokeWidth="1" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '1.55s' } as CSSProperties}>
                  </rect>
                  <path d="M30 40 H290" fill="none" stroke="#e7ecf4" strokeWidth="1">
                  </path>
                  <g fill="#e3e9f2" stroke="none">
                    <circle cx="46" cy="27" r="3">
                    </circle>
                    <circle cx="58" cy="27" r="3">
                    </circle>
                    <circle cx="70" cy="27" r="3">
                    </circle>
                  </g>
                  <g fill="none" stroke="#dde5f0" strokeWidth="1" strokeLinecap="round">
                    <path d="M46 58 H136 M46 72 H108">
                    </path>
                  </g>
                  <g fill="none" strokeWidth="1" strokeLinecap="round" style={{ stroke: 'var(--acc)' }}>
                    <path d="M46 58 H136" strokeDasharray="90" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'ease-out', animationDelay: '1.7s', '--L': 90, opacity: '0' } as CSSProperties}>
                    </path>
                    <path d="M46 72 H108" strokeDasharray="62" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'ease-out', animationDelay: '1.8s', '--L': 62, opacity: '0' } as CSSProperties}>
                    </path>
                  </g>
                  <rect x="70" y="98" width="180" height="34" rx="8" fill="none" stroke="none">
                  </rect>
                  <text x="160" y="120" fontFamily="'IBM Plex Mono', monospace" fontSize="14" letterSpacing="1.6" fill="#94a3b8" textAnchor="middle">
                    APP
                  </text>
                  <g className="tk" style={{ '--anim': 'dcPop', animationTimingFunction: 'cubic-bezier(.3,1.4,.4,1)', animationDelay: '2.0s', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                    <rect x="70" y="98" width="180" height="34" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1">
                    </rect>
                    <path d="M86 114 l3.6 3.8 l6.8 -7.6" fill="none" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    </path>
                    <text x="169" y="120" fontFamily="'IBM Plex Mono', monospace" fontSize="14" letterSpacing=".6" fill="#15803d" textAnchor="middle">
                      NHCX COMPLIANT
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </article>

          <article className="tool-card is-adapter">
            <h3>
              NHCX Adapter <span className="tool-opt">(Optional)</span>
            </h3>
            <p style={{ maxWidth: '46ch' }}>Connect existing hospital or payer systems to NHCX without rebuilding your core workflows.</p>
            <div className="tool-icon is-adapter" aria-hidden="true">
              <span className="tool-icon-ring" />
              <Cable size={44} strokeWidth={1.6} />
            </div>
            <div className="tool-art-box" style={{ marginTop: '14px' }}>
              <div style={{ position: 'absolute', inset: '0', opacity: '1', backgroundImage: 'radial-gradient(#e8eef7 1px, transparent 1.2px)', backgroundSize: '16px 16px', maskImage: 'radial-gradient(110% 80% at 50% 50%, #000 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(110% 80% at 50% 50%, #000 30%, transparent 80%)' }}>
              </div>
              <div className="tk" style={{ '--anim': 'dcGlow', animationTimingFunction: 'ease-in-out', animationDelay: '.55s', position: 'absolute', left: '52%', top: '50%', width: '32%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', opacity: '0', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(31,78,224,.22), rgba(31,78,224,0) 66%)' } as CSSProperties}>
              </div>
              <svg viewBox="0 0 460 220" width="100%" style={{ display: 'block', position: 'relative' }}>
                <g fill="none" stroke="#dde5f0" strokeWidth="1" strokeLinecap="round">
                  <path d="M114 66 C152 66 158 104 196 104" stroke="#dfe6f1">
                  </path>
                  <path d="M114 154 C152 154 158 116 196 116" stroke="#dfe6f1">
                  </path>
                  <path d="M284 110 H356" stroke="#dfe6f1">
                  </path>
                  <path d="M218 92 C238 92 244 110 262 110" stroke="#e6ecf5">
                  </path>
                  <path d="M218 110 H262" stroke="#e6ecf5">
                  </path>
                  <path d="M218 128 C238 128 244 110 262 110" stroke="#e6ecf5">
                  </path>
                  <path d="M206 92 H218 M206 110 H218 M206 128 H218 M262 92 H274 M262 110 H274 M262 128 H274" stroke="#e0e7f1">
                  </path>
                </g>
                <g fill="#ffffff" stroke="#d7dfec" strokeWidth="1">
                  <rect x="28" y="44" width="86" height="44" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '0s' } as CSSProperties}>
                  </rect>
                  <rect x="28" y="132" width="86" height="44" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '.15s' } as CSSProperties}>
                  </rect>
                  <rect x="196" y="76" width="88" height="68" rx="11" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '.5s' } as CSSProperties}>
                  </rect>
                  <rect x="356" y="88" width="78" height="44" rx="9" className="tk" style={{ '--anim': 'dcLit', animationTimingFunction: 'ease-in-out', animationDelay: '1.15s' } as CSSProperties}>
                  </rect>
                </g>
                <g fontFamily="'IBM Plex Mono', monospace" fontSize="20" letterSpacing="1.4" fill="#64748b" textAnchor="middle">
                  <text x="71" y="73">
                    HMIS
                  </text>
                  <text x="71" y="161">
                    PAYER
                  </text>
                  <text x="395" y="117">
                    NHCX
                  </text>
                  <text x="71" y="118" fontSize="16" fill="#94a3b8" letterSpacing="2.2">
                    OR
                  </text>
                  <text x="240" y="170" fontSize="16" fill="#94a3b8" letterSpacing="2.2">
                    ADAPTER
                  </text>
                </g>
                <g fill="none" strokeWidth="1" strokeLinecap="round">
                  <path d="M114 66 C152 66 158 104 196 104" strokeDasharray="110" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.45,0,.25,1)', animationDelay: '.1s', stroke: 'var(--acc)', '--L': 110, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M114 154 C152 154 158 116 196 116" strokeDasharray="110" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.45,0,.25,1)', animationDelay: '.25s', stroke: 'var(--acc)', '--L': 110, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M284 110 H356" strokeDasharray="80" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'cubic-bezier(.45,0,.25,1)', animationDelay: '1.05s', stroke: 'var(--acc)', '--L': 80, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M114 66 C152 66 158 104 196 104" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '.2s', '--L': 110, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.6))' } as CSSProperties}>
                  </path>
                  <path d="M114 154 C152 154 158 116 196 116" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '.35s', '--L': 110, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.6))' } as CSSProperties}>
                  </path>
                  <path d="M284 110 H356" stroke="#8aa6f5" strokeDasharray="14 4000" className="tk" style={{ '--anim': 'dcStreak', animationTimingFunction: 'linear', animationDelay: '1.15s', '--L': 80, opacity: '0', filter: 'drop-shadow(0 0 3px rgba(31,78,224,.6))' } as CSSProperties}>
                  </path>
                  <path d="M218 92 C238 92 244 110 262 110" strokeDasharray="60" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'ease-out', animationDelay: '.6s', stroke: 'var(--acc)', '--L': 60, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M218 128 C238 128 244 110 262 110" strokeDasharray="60" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'ease-out', animationDelay: '.75s', stroke: 'var(--acc)', '--L': 60, opacity: '0' } as CSSProperties}>
                  </path>
                  <path d="M218 110 H262" strokeDasharray="50" className="tk" style={{ '--anim': 'dcDraw', animationTimingFunction: 'ease-out', animationDelay: '.68s', stroke: 'var(--acc)', '--L': 50, opacity: '0' } as CSSProperties}>
                  </path>
                  <circle cx="240" cy="110" r="22" className="tk" style={{ '--anim': 'dcPing', animationTimingFunction: 'ease-out', animationDelay: '.55s', stroke: 'var(--acc)', transformBox: 'fill-box', transformOrigin: 'center', opacity: '0' } as CSSProperties}>
                  </circle>
                </g>
                <g fill="none" stroke="#eaeff6" strokeWidth="1">
                  <path d="M28 200 H434" stroke="#f0f4f9">
                  </path>
                </g>
                <g fill="none" stroke="#e7ecf4" strokeWidth="1">
                  <path d="M28 194 V200 M70 196 V200 M112 194 V200 M154 196 V200 M196 194 V200 M238 190 V200 M280 194 V200 M322 196 V200 M364 194 V200 M406 196 V200">
                  </path>
                </g>
              </svg>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
