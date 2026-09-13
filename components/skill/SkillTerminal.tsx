'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Bug, Check, CheckCheck, Database, FileCheck, FileCode, FlaskConical, LayoutTemplate, ListChecks, Loader2, Play, Receipt, Search, Send, Server, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { TERMINAL, type StepIcon } from '@/lib/skill-copy';
import { timeline } from '@/lib/timeline';

/*
 * The hero's terminal: the home page's AI demo (components/landing/AiDemo),
 * dark, cycling through the page's requests. For each one the AI mark
 * glows, the request types itself into the search bar, the bar flares and
 * sparks fly, a reply streams in, four step cards run one after another
 * (a spinner and a progress bar, then a tick and what came of it), and a
 * ready line lands. It plays while on screen and pauses off it.
 *
 * The static HTML carries the first request finished, so a reader without
 * JavaScript, or with reduced motion, sees a complete example. Every piece is
 * laid out from the start and shown by stage, with the longest prompt and
 * reply held invisibly, so the terminal never changes height and the hero
 * beside it stays still. It is aria-hidden: the same prompts are on the page
 * as text under "Prompts that are a whole task".
 */

const ICONS: Record<StepIcon, typeof Database> = {
  database: Database,
  layout: LayoutTemplate,
  server: Server,
  flask: FlaskConical,
  list: ListChecks,
  code: FileCode,
  check: CheckCheck,
  play: Play,
  shield: ShieldCheck,
  send: Send,
  receipt: Receipt,
  file: FileCheck,
  search: Search,
  bug: Bug,
  wrench: Wrench,
};

const T = TERMINAL.transcripts;
const LONGEST_PROMPT = T.reduce((a, t) => (t.prompt.length > a.length ? t.prompt : a), '');
const LONGEST_REPLY = T.reduce((a, t) => (t.reply.length > a.length ? t.reply : a), '');
const TYPE_MS = 34;
const REPLY_MS = 20;
const STEP_MS = 1000;
const HOLD_MS = 3600;

type Stage = 'logo' | 'prompt' | 'magic' | 'answer';
type State = { index: number; stage: Stage; typed: number; replied: number; running: number; finished: number; ready: boolean };
const finished = (index: number): State => ({ index, stage: 'answer', typed: T[index].prompt.length, replied: T[index].reply.length, running: -1, finished: T[index].steps.length, ready: true });

export default function SkillTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<State>(finished(0));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { at, clear } = timeline();
    const play = (index: number) => {
      clear();
      const t = T[index];
      setS({ index, stage: 'logo', typed: 0, replied: 0, running: -1, finished: 0, ready: false });
      at(1100, () => setS((v) => ({ ...v, stage: 'prompt' })));
      const typeFrom = 1500;
      for (let i = 1; i <= t.prompt.length; i++) at(typeFrom + i * TYPE_MS, () => setS((v) => ({ ...v, typed: i })));
      const typed = typeFrom + t.prompt.length * TYPE_MS;
      at(typed + 400, () => setS((v) => ({ ...v, stage: 'magic' })));
      const answer = typed + 1200;
      at(answer, () => setS((v) => ({ ...v, stage: 'answer' })));
      for (let i = 1; i <= t.reply.length; i++) at(answer + 250 + i * REPLY_MS, () => setS((v) => ({ ...v, replied: i })));
      const steps = answer + 250 + t.reply.length * REPLY_MS + 400;
      t.steps.forEach((_, i) => {
        at(steps + i * STEP_MS, () => setS((v) => ({ ...v, running: i })));
        at(steps + (i + 1) * STEP_MS, () => setS((v) => ({ ...v, finished: i + 1, running: i + 1 < t.steps.length ? i + 1 : -1 })));
      });
      const done = steps + t.steps.length * STEP_MS;
      at(done + 300, () => setS((v) => ({ ...v, ready: true })));
      at(done + 300 + HOLD_MS, () => play((index + 1) % T.length));
    };
    let playing = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playing) {
          playing = true;
          play(0);
        } else if (!entry.isIntersecting && playing) {
          playing = false;
          clear();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, []);

  const t = T[s.index];
  const typing = s.stage === 'prompt' && s.typed < t.prompt.length;
  const streaming = s.stage === 'answer' && s.replied < t.reply.length;

  return (
    <div className={`sk-term is-${s.stage}`} ref={ref} aria-hidden="true">
      <div className="sk-demo-mark">
        <span className="sk-demo-mark-core">
          <Sparkles size={38} strokeWidth={1.6} />
        </span>
      </div>
      <div className="sk-term-body">
        <div className={`sk-search${s.stage === 'magic' ? ' is-magic' : ''}`}>
          <span className="sk-search-text">
            <span className="sk-search-ghost">{LONGEST_PROMPT}</span>
            <span className="sk-search-live">
              {s.typed === 0 ? <span className="sk-search-hint">{TERMINAL.hint}</span> : t.prompt.slice(0, s.typed)}
              {typing && s.typed > 0 && <i className="sk-caret" />}
            </span>
          </span>
          <span className="sk-search-spark">
            <Sparkles size={20} strokeWidth={1.8} />
          </span>
          <span className="sk-burst">
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
        </div>

        <div className="sk-answer">
          <div className="sk-reply-line">
            <span className="sk-avatar">
              <Sparkles size={14} strokeWidth={2} />
            </span>
            <p className="sk-reply-text">
              <span className="sk-reply-ghost">{LONGEST_REPLY}</span>
              <span>
                {t.reply.slice(0, s.replied)}
                {streaming && <i className="sk-caret" />}
              </span>
            </p>
          </div>

          <ol className="sk-scards">
            {t.steps.map((step, i) => {
              const Icon = ICONS[step.icon];
              const state = i < s.finished ? 'done' : i === s.running ? 'running' : 'todo';
              return (
                <li key={step.title} className={`sk-scard is-${state}`}>
                  <span className="sk-scard-icon">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="sk-scard-text">
                    <b>{step.title}</b>
                    <span>{state === 'done' ? step.done : step.doing}</span>
                  </span>
                  <span className="sk-scard-state">
                    {state === 'done' && <Check size={13} strokeWidth={3} />}
                    {state === 'running' && <Loader2 size={15} strokeWidth={2.2} className="sk-rot" />}
                  </span>
                  <i className="sk-scard-bar" />
                </li>
              );
            })}
          </ol>

          <div className={`sk-ready${s.ready ? ' is-on' : ''}`}>
            <span className="sk-ready-text">
              <b>{t.ready.title}</b>
              <span>{t.ready.summary}</span>
            </span>
            <span className="sk-ready-check">
              <Check size={15} strokeWidth={3} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
