import section from '@/content/site.yaml?home';
import type { Link } from '@/lib/site-copy';

/*
 * Every word and link on the home page, section by section, top to bottom.
 * They live in content/site.yaml (`home`); this file gives them their types.
 */

export type WhyCard = {
  tone: 'warm' | 'cool' | 'mint';
  tag: string;
  ariaLabel: string;
  sub: { lead: string; accent: string; tail: string };
  over: { before: string; strong: string; after: string };
  text: string;
  points: Array<{ title: string; text?: string }>;
};
export type AiIcon = 'database' | 'layout' | 'server' | 'flask';
export type JourneyArt = 'badge' | 'layers' | 'eye' | 'rocket';

type HomeContent = {
  hero: { kicker: string; titleLines: string[]; lede: string; ledeStrong: string; cta: Link };
  stats: {
    ariaLabel: string;
    title: string;
    measures: Record<'integrators' | 'providers' | 'preauth' | 'claims', string>;
    sectors: Record<'priv' | 'gov', string>;
  };
  why: {
    titleLead: string;
    titleAccent: string;
    cards: WhyCard[];
    register: { url: string; title: string; standard: string; rows: Array<{ id: string; tone: string; label: string }> };
    phone: { label: string; amount: string; facts: Array<{ label: string; value: string }>; button: string };
    table: { head: string[]; rows: Array<{ field: string; code: string }> };
    bars: { items: Array<{ label: string; percent: number; tone: string }>; note: string };
  };
  video: { ariaLabel: string; href: string; imageAlt: string; caption: string };
  how: {
    title: string;
    lede: string;
    ledeTail: string;
    cta: Link;
    netLabel: string;
    providerLabel: string;
    payerLabel: string;
    hub: string;
    providers: string[];
    payers: string[];
  };
  flow: { title: string; labels: { start: string; hub: string; end: string }; steps: Array<{ tag: string; title: string; text: string; tick: string }> };
  ai: {
    title: string;
    lede: string;
    demo: {
      hint: string;
      question: string;
      reply: string;
      steps: Array<{ icon: AiIcon; title: string; doing: string; done: string }>;
      ready: { title: string; summary: string[] };
      cta: Link;
    };
  };
  journey: { title: string; intro: string; coversLabel: string; steps: Array<{ title: string; body: string; link: Link; tags: string[]; art: JourneyArt }> };
  tool: {
    titleLead: string;
    titleAccent: string;
    dev: { title: string; text: string; art: { sandbox: string } };
    reference: { title: string; text: string; art: { provider: string; payer: string; submit: string; response: string } };
    docs: { title: string; text: string; art: { docs: string; openapi: string; snippets: string; build: string; app: string; compliant: string } };
    adapter: { title: string; optional: string; text: string; art: { hmis: string; payer: string; nhcx: string; or: string; adapter: string } };
  };
  benefits: {
    title: string;
    previousLabel: string;
    nextLabel: string;
    showPrefix: string;
    cards: Array<{ key: string; eyebrow: string; heading: string; stats: Array<{ value: string; label: string }>; photo: string }>;
  };
  faq: { title: string; topic: string; seeMore: Link };
  cta: { titleLead: string; titleBlue: string; titleMid: string; titleLive: string; lede: string; cta: Link };
};

export const {
  hero: HERO,
  stats: STATS,
  why: WHY,
  video: VIDEO,
  how: HOW,
  flow: FLOW,
  ai: AI,
  journey: JOURNEY,
  tool: TOOL,
  benefits: BENEFITS,
  faq: FAQ,
  cta: CTA,
} = section as HomeContent;
