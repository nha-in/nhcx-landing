'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Database, FlaskConical, LayoutTemplate, Loader2, Server, Sparkles } from 'lucide-react';
import { withBase } from '@/lib/paths';
import { AI, type AiIcon } from '@/lib/home-copy';
import { timeline } from '@/lib/timeline';

/*
 * The AI card's demonstration, played when it scrolls into view: an AI mark
 * glows in the middle of the card, then the prompt bar slides in and the
 * request types itself out, then a burst of sparks and the assistant
 * replies — a streamed line, four step cards that each start, run and tick
 * off with what they produced, and a summary that the integration is ready.
 * It holds on the finished answer and plays again if the card leaves the
 * screen and comes back. Under reduced motion the finished answer is shown
 * at once.
 */

const ICONS: Record<AiIcon, typeof Database> = { database: Database, layout: LayoutTemplate, server: Server, flask: FlaskConical };
const { question: QUESTION, reply: REPLY, steps: STEPS } = AI.demo;
const STEP_MS = 1150;

type Stage = 'logo' | 'prompt' | 'magic' | 'answer';
type State = { stage: Stage; typed: number; replied: number; running: number; finished: number; ready: boolean };
const START: State = { stage: 'logo', typed: 0, replied: 0, running: -1, finished: 0, ready: false };
const FINAL: State = { stage: 'answer', typed: QUESTION.length, replied: REPLY.length, running: -1, finished: STEPS.length, ready: true };

export default function AiDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<State>(START);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setS(FINAL);
      return;
    }
    const { at, clear } = timeline();
    const play = () => {
      clear();
      setS(START);
      at(1500, () => setS((v) => ({ ...v, stage: 'prompt' })));
      const typeFrom = 2100;
      for (let i = 1; i <= QUESTION.length; i++) at(typeFrom + i * 38, () => setS((v) => ({ ...v, typed: i })));
      const typed = typeFrom + QUESTION.length * 38;
      at(typed + 450, () => setS((v) => ({ ...v, stage: 'magic' })));
      const answer = typed + 1300;
      at(answer, () => setS((v) => ({ ...v, stage: 'answer' })));
      for (let i = 1; i <= REPLY.length; i++) at(answer + 300 + i * 22, () => setS((v) => ({ ...v, replied: i })));
      const steps = answer + 300 + REPLY.length * 22 + 500;
      STEPS.forEach((_, i) => {
        at(steps + i * STEP_MS, () => setS((v) => ({ ...v, running: i })));
        at(steps + (i + 1) * STEP_MS, () => setS((v) => ({ ...v, finished: i + 1, running: i + 1 < STEPS.length ? i + 1 : -1 })));
      });
      at(steps + STEPS.length * STEP_MS + 350, () => setS((v) => ({ ...v, ready: true })));
    };
    let playing = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playing) {
          playing = true;
          play();
        } else if (!entry.isIntersecting && playing) {
          playing = false;
          clear();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, []);

  const stage = s.stage;
  return (
    <div className={`ai-demo is-${stage}`} ref={ref}>
      {/* 1. The mark */}
      <div className="ai-mark" aria-hidden="true">
        <span className="ai-mark-ring" />
        <span className="ai-mark-core">
          <Sparkles size={56} strokeWidth={1.6} />
        </span>
      </div>

      {/* 2. The prompt, typed */}
      <div className="ai-prompt" aria-hidden={stage === 'logo'}>
        <span className="ai-prompt-text">
          {s.typed === 0 ? <span className="ai-prompt-hint">{AI.demo.hint}</span> : QUESTION.slice(0, s.typed)}
          {stage === 'prompt' && <span className="ai-caret" />}
        </span>
        <span className="ai-sparkle" aria-hidden="true">
          <Sparkles size={34} strokeWidth={1.8} />
        </span>
        <span className="ai-burst" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </span>
      </div>

      {/* 3. The reply */}
      <div className="ai-reply" aria-live="polite">
        <div className="ai-reply-line">
          <span className="ai-avatar" aria-hidden="true">
            <Sparkles size={18} strokeWidth={2} />
          </span>
          <p>
            {REPLY.slice(0, s.replied)}
            {s.replied < REPLY.length && stage === 'answer' && <span className="ai-caret is-small" />}
          </p>
        </div>

        <ol className="ai-steps">
          {STEPS.map((step, i) => {
            const Icon = ICONS[step.icon];
            const state = i < s.finished ? 'done' : i === s.running ? 'running' : 'todo';
            return (
              <li key={step.title} className={`ai-step is-${state}`}>
                <span className="ai-step-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="ai-step-text">
                  <b>{step.title}</b>
                  <span>{state === 'done' ? step.done : step.doing}</span>
                  <i className="ai-step-bar" aria-hidden="true" />
                </span>
                <span className="ai-step-state" aria-hidden="true">
                  {state === 'done' && <Check size={16} strokeWidth={3} />}
                  {state === 'running' && <Loader2 size={18} strokeWidth={2.2} className="ai-spin" />}
                </span>
              </li>
            );
          })}
        </ol>

        <div className={`ai-ready${s.ready ? ' is-on' : ''}`}>
          <div className="ai-ready-text">
            <b>{AI.demo.ready.title}</b>
            <span>{AI.demo.ready.summary.join(' · ')}</span>
          </div>
          <a className="btn btn--primary ai-ready-btn" href={withBase(AI.demo.cta.href)} tabIndex={s.ready ? 0 : -1}>
            {AI.demo.cta.label} <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
