'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Activity, BadgeCheck, Banknote, Check, FileText, Inbox, Landmark, Loader2, Lock, PenLine, Pill, Receipt, Route, Send, Stethoscope } from 'lucide-react';
import { TRAVELS, type TravelIcon, type TravelItem, type TravelWindow } from '@/lib/pmjay-copy';
import { timeline } from '@/lib/timeline';

/*
 * The window beside "How a scheme claim travels": one scene per move, played
 * the way the AI Skill page's terminal plays a request. The HMIS gathers the
 * record into a bundle, the bundle crosses NHCX to the payer, the payer's
 * checks run and it approves, and the payment comes home to the HMIS. In
 * every scene four parts run one after another (a spinner, a filling bar or
 * a moving bundle, then a tick) and a result lands.
 *
 * A move plays when it is picked and when the window comes on screen; the
 * static HTML, and a reader with reduced motion, get the move finished. The
 * scene box has one height for every move, so the window never changes size.
 * The moves are on the page as text beside it, so the window is aria-hidden.
 */

const ICONS: Record<TravelIcon, typeof Check> = {
  diagnosis: Stethoscope,
  procedure: Activity,
  drugs: Pill,
  bill: Receipt,
  sign: PenLine,
  lock: Lock,
  route: Route,
  delivered: Inbox,
  sent: Send,
  decision: BadgeCheck,
  amount: Banknote,
  settle: Landmark,
};

const W: TravelWindow[] = TRAVELS.steps.map((s) => s.window);
const ITEM_MS = 850; // the filling bar and the count in styles/pmjay.css and CountUp run for the same time
const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

type Mark = 'todo' | 'running' | 'done';
type State = { index: number; run: number; running: number; finished: number; ready: boolean };
type SceneProps = { w: TravelWindow; s: State; mark: (i: number) => Mark };

const complete = (index: number, run = 0): State => ({ index, run, running: -1, finished: W[index].items.length, ready: true });
/** How far along the four parts are, 0 to 1: at the part that is running, or the last one done. */
const reach = (s: State, n: number) => Math.max(0, s.running >= 0 ? s.running : s.finished - 1) / (n - 1);

function ItemIcon({ icon, size = 16 }: { icon?: TravelIcon; size?: number }) {
  if (!icon) return null;
  const Icon = ICONS[icon];
  return (
    <span className="pj-sc-icon">
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

function StateMark({ mark }: { mark: Mark }) {
  return (
    <span className="pj-sc-state">
      {mark === 'done' && <Check size={12} strokeWidth={3} />}
      {mark === 'running' && <Loader2 size={14} strokeWidth={2.2} className="pj-sc-rot" />}
    </span>
  );
}

function Copy({ item }: { item: TravelItem }) {
  return (
    <span className="pj-sc-copy">
      <b>{item.title}</b>
      <span>{item.detail}</span>
    </span>
  );
}

/* 1. The record on the left is gathered, field by field, into the bundle on the right. */
function Collect({ w, s, mark }: SceneProps) {
  return (
    <div className="pj-sc pj-sc-collect">
      <div className="pj-sc-record">
        <span className="pj-sc-label">{w.heading}</span>
        {w.items.map((item, i) => (
          <div key={item.title} className={`pj-sc-field is-${mark(i)}`}>
            <ItemIcon icon={item.icon} />
            <Copy item={item} />
          </div>
        ))}
      </div>
      <span className="pj-sc-pipe">{s.running >= 0 && <i key={s.running} />}</span>
      <div className={`pj-sc-bundle${s.ready ? ' is-full' : ''}`}>
        <span className="pj-sc-bundle-head">
          <FileText size={16} strokeWidth={1.8} /> {w.subheading}
        </span>
        {w.items.map((item, i) => (
          <span key={item.title} className={`pj-sc-entry is-${mark(i)}`}>
            {item.resource}
            {mark(i) === 'done' && <Check size={13} strokeWidth={3} />}
          </span>
        ))}
      </div>
    </div>
  );
}

/* 2. The bundle crosses from the hospital through NHCX to the payer while its four stages run. */
function Travel({ w, s, mark }: SceneProps) {
  const nodes = w.nodes ?? [];
  // Signed and encrypted at the hospital, routed at NHCX, delivered at the payer.
  const at = s.running >= 0 ? [0, 0, 0.5, 1][s.running] : s.finished > 0 ? 1 : 0;
  return (
    <div className="pj-sc pj-sc-travel">
      <div className="pj-sc-route" style={{ '--p': at } as CSSProperties}>
        <div className="pj-sc-track">
          <span className="pj-sc-line">
            <i />
          </span>
          <span className="pj-sc-pkt">
            <FileText size={16} strokeWidth={2} />
          </span>
        </div>
        <div className="pj-sc-nodes">
          {nodes.map((node, i) => (
            <span key={node} className={`pj-sc-node${at >= i / (nodes.length - 1) ? ' is-on' : ''}`}>
              {node}
            </span>
          ))}
        </div>
      </div>
      <ol className="pj-sc-cards">
        {w.items.map((item, i) => (
          <li key={item.title} className={`pj-sc-card is-${mark(i)}`}>
            <ItemIcon icon={item.icon} size={17} />
            <Copy item={item} />
            <StateMark mark={mark(i)} />
            <i className="pj-sc-bar" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* 3. The payer's checks tick down the claim, then the decision is stamped. */
function Approve({ w, s, mark }: SceneProps) {
  return (
    <div className="pj-sc pj-sc-approve">
      <div className="pj-sc-claim">
        <div className="pj-sc-claim-head">
          <span className="pj-sc-copy">
            <b>{w.heading}</b>
            <span>{w.subheading}</span>
          </span>
          {w.amount !== undefined && <strong>{INR.format(w.amount)}</strong>}
        </div>
        <ul className="pj-sc-checks">
          {w.items.map((item, i) => (
            <li key={item.title} className={`pj-sc-check is-${mark(i)}`}>
              <StateMark mark={mark(i)} />
              <b>{item.title}</b>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
        <div className="pj-sc-decision">
          <span className="pj-sc-label">{w.stampLabel}</span>
          <span className={`pj-sc-stamp${s.ready ? ' is-on' : ''}`}>
            <BadgeCheck size={17} strokeWidth={2} /> {w.stamp}
          </span>
        </div>
      </div>
    </div>
  );
}

/* Counts up to the amount when `on` turns true, over the time one part runs. */
function CountUp({ value, on }: { value: number; on: boolean }) {
  const [shown, setShown] = useState(on ? value : 0);
  useEffect(() => {
    if (!on || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(on ? value : 0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ITEM_MS);
      setShown(Math.round(value * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [on, value]);
  return <>{INR.format(shown)}</>;
}

/* 4. The payment notice arrives: the amount counts up and the claim's timeline completes. */
function Payment({ w, s, mark }: SceneProps) {
  const n = w.items.length;
  return (
    <div className="pj-sc pj-sc-pay">
      <div className="pj-sc-amount">
        <span className="pj-sc-label">{w.heading}</span>
        <b>
          <CountUp value={w.amount ?? 0} on={s.running >= 2 || s.finished >= 3} />
        </b>
        <span className="pj-sc-sub">{w.subheading}</span>
      </div>
      <div className="pj-sc-tlwrap" style={{ '--p': reach(s, n) } as CSSProperties}>
        <i className="pj-sc-fill" />
        <ol className="pj-sc-timeline">
          {w.items.map((item, i) => (
            <li key={item.title} className={`pj-sc-tl is-${mark(i)}`}>
              <span className="pj-sc-dot">{mark(i) === 'running' ? <Loader2 size={16} strokeWidth={2.2} className="pj-sc-rot" /> : item.icon && <ItemGlyph icon={item.icon} />}</span>
              <b>{item.title}</b>
              <span>{item.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function ItemGlyph({ icon }: { icon: TravelIcon }) {
  const Icon = ICONS[icon];
  return <Icon size={16} strokeWidth={1.9} />;
}

const SCENES: Record<TravelWindow['kind'], (props: SceneProps) => React.ReactNode> = {
  collect: Collect,
  travel: Travel,
  approve: Approve,
  payment: Payment,
};

export default function ClaimWindow({ step }: { step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [s, setS] = useState<State>(() => complete(step));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setS((v) => complete(step, v.run));
      return;
    }
    const n = W[step].items.length;
    const { at, clear } = timeline();
    // A new run remounts the scene, so it fades in fresh rather than rewinding.
    setS((v) => ({ index: step, run: v.run + 1, running: -1, finished: 0, ready: false }));
    const from = 500;
    for (let i = 0; i < n; i++) {
      at(from + i * ITEM_MS, () => setS((v) => ({ ...v, running: i })));
      at(from + (i + 1) * ITEM_MS, () => setS((v) => ({ ...v, finished: i + 1, running: i + 1 < n ? i + 1 : -1 })));
    }
    at(from + n * ITEM_MS + 250, () => setS((v) => ({ ...v, ready: true })));
    return clear;
  }, [step, visible]);

  const w = W[s.index];
  const Scene = SCENES[w.kind];
  const mark = (i: number): Mark => (i < s.finished ? 'done' : i === s.running ? 'running' : 'todo');

  return (
    <div className="pj-cw" ref={ref} aria-hidden="true">
      <div className="pj-cw-body">
        <div className="pj-cw-scene">
          <Scene key={`${s.index}-${s.run}`} w={w} s={s} mark={mark} />
        </div>
        <div className={`pj-cw-ready${s.ready ? ' is-on' : ''}`}>
          <span className="pj-cw-ready-copy">
            <b>{w.ready.title}</b>
            <span>{w.ready.summary}</span>
          </span>
          <span className="pj-cw-check">
            <Check size={15} strokeWidth={3} />
          </span>
        </div>
      </div>
    </div>
  );
}
