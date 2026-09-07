'use client';

import { useEffect, useState } from 'react';
import type { SkillCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/** Typing speed per character, the pause between steps, and the hold on a finished answer. */
const TYPE_MS = 28;
const STEP_MS = 640;
const HOLD_MS = 3200;

/**
 * The hero's terminal, cycling through a few real requests.
 *
 * The static HTML carries the first transcript complete — typed prompt, every
 * step ticked, the answer — so a reader without JavaScript, a crawler or a
 * print sees a finished example rather than an empty box. On mount the
 * component rewinds to the first character and starts the cycle; under
 * `prefers-reduced-motion` it never rewinds, and the finished transcript is
 * all there is.
 *
 * The widget is `aria-hidden`: a panel that rewrites itself every few seconds
 * is noise to a screen reader, and the same prompts are on the page as text
 * under "Prompts to try".
 */
export default function SkillTerminal({ copy }: { copy: SkillCopy['terminal'] }) {
  const transcripts = copy.transcripts;
  // -1 is the pre-mount state: render the whole transcript, nothing running.
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(-1);
  const [steps, setSteps] = useState(-1);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setChars(0);
    setSteps(0);
  }, []);

  useEffect(() => {
    if (chars < 0) return;
    const current = transcripts[index];
    if (chars < current.prompt.length) {
      const id = window.setTimeout(() => setChars(chars + 1), TYPE_MS);
      return () => window.clearTimeout(id);
    }
    if (steps < current.steps.length) {
      const id = window.setTimeout(() => setSteps(steps + 1), STEP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setIndex((index + 1) % transcripts.length);
      setChars(0);
      setSteps(0);
    }, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [chars, steps, index, transcripts]);

  const current = transcripts[index];
  const still = chars < 0;
  const typing = !still && chars < current.prompt.length;
  const shown = still ? current.prompt : current.prompt.slice(0, chars);
  const revealed = still ? current.steps.length : steps;
  const finished = still || steps >= current.steps.length;

  return (
    <div className="sk-term" aria-hidden="true">
      <div className="sk-term-bar">
        <span className="sk-term-dot" />
        <span className="sk-term-dot" />
        <span className="sk-term-dot" />
        <img className="sk-term-mark" src={withBase('/assets/brand/hcx-logo-white.png')} alt="" />
        <span className="sk-term-tag">{copy.tag}</span>
      </div>
      <div className="sk-term-body">
        <p className="sk-ask">
          <span>
            {shown}
            {typing && <i className="sk-caret" />}
          </span>
        </p>
        <ul className="sk-steps">
          {current.steps.slice(0, Math.max(revealed, typing ? 0 : revealed)).map((step, i) => (
            <li key={step} className={!finished && i === revealed - 1 ? 'sk-step is-live' : 'sk-step'}>
              <span>{step}</span>
            </li>
          ))}
        </ul>
        {finished && <p className="sk-reply">{current.reply}</p>}
      </div>
      <div className="sk-term-foot">
        {copy.foot.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
