import { readContentFile } from './local-content';
import { resolveDevtoolsIn } from './content';

/**
 * content/site.json — every word of the pages that are designed rather than
 * edited: the landing sections, PM-JAY, DevTools and the AI skill page, plus
 * the parts of the chrome that are not in the CMS single type.
 *
 * These pages used to carry their copy inline in components/landing and
 * components/pages. That was fine while they were being drawn and wrong as
 * soon as anyone but a developer needed to change a word, so the strings live
 * here and the components render them. Nothing in this file is a fallback:
 * a component reads the JSON and shows what it finds, so an edit in the CMS
 * (cms/app.py, "Page copy") is the only way the wording changes.
 *
 * Why its own file rather than content/fallback.json: fallback.json is the
 * Strapi snapshot's committed baseline and `npm run sync` overwrites it from
 * the CMS. Copy that has no Strapi single type behind it would be lost on the
 * next sync, so it sits beside news.json, videos.json and download.json in the
 * hand-authored half of content/, and follows the same conventions — read at
 * build time, and `devtools:/apis` links resolved against the console.
 *
 * Types are hand-written rather than inferred from the JSON: the shape is the
 * contract the components render against, so a key renamed in the file is a
 * build error rather than a section that quietly disappears.
 */

/** A run of text with links and inline code in it, as authored in the JSON. */
export type Rich = Array<string | { label: string; href: string } | { code: string }>;

export interface Link {
  label: string;
  href: string;
}

// ─── chrome ──────────────────────────────────────────────────────────────────

export interface ChromeCopy {
  skipLink: string;
  /** The one button in the header row; `docs:` resolves at build time. */
  docsCta: Link;
  marksLabel: string;
  nhcxAlt: string;
  footer: {
    contactTitle: string;
    addressLines: string[];
    phone: string;
    credit: string;
    updatedPrefix: string;
  };
}

export interface StatsCopy {
  eyebrow: string;
  title: string;
  /** One card each, `key` naming the measure in a StatsRow. */
  measures: Array<{ key: string; label: string }>;
  /** One entry each, `key` naming the sector in public/stats.json. */
  rows: Array<{ key: string; label: string }>;
}

// ─── get started ─────────────────────────────────────────────────────────────

export interface GetStartedStep {
  title: string;
  text: string;
  linkLabel?: string;
  linkHref?: string;
}

export interface GetStartedRole {
  /** Matches the role a reader picks; also the id of the panel it reveals. */
  key: string;
  label: string;
  note: string;
  flowTitle: string;
  steps: GetStartedStep[];
}

export interface GetStartedCopy {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  question: string;
  changeLabel: string;
  roles: GetStartedRole[];
  bothTitle: string;
  both: string[];
  ctaLabel: string;
  ctaHref: string;
}

// ─── the landing page ────────────────────────────────────────────────────────

export interface Point {
  title: string;
  text?: string;
}

export interface BenefitCard {
  tone: string;
  tag: string;
  ariaLabel: string;
  sub: { lead: string; accent: string; tail: string };
  over: { before: string; strong: string; after: string };
  text: string;
  points: Point[];
  register?: {
    url: string;
    title: string;
    standard: string;
    rows: Array<{ id: string; tone: string; label: string }>;
  };
  phone?: {
    label: string;
    amount: string;
    facts: Array<{ label: string; value: string }>;
    button: string;
  };
  table?: {
    head: string[];
    rows: Array<{ label: string; code: string }>;
  };
  bars?: {
    items: Array<{ label: string; percent: number; tone: string }>;
    note: string;
  };
}

export interface ToolField {
  label: string;
  value?: string;
  optional?: boolean;
  required?: boolean;
  muted?: boolean;
  focus?: boolean;
  caret?: boolean;
}

/** One screen of the DevTools carousel. `kind` picks the panel layout. */
export interface ToolScreen {
  kind: 'builder' | 'ecosystem' | 'adapter' | 'playbook';
  shotTitle: string;
  shotSub: string;
  paneTitle?: string;
  paneSub?: string;
  fields?: ToolField[];
  fieldPair?: ToolField[];
  codeTitle?: string;
  codeBadge?: string;
  code?: string;
  shell?: string[];
  participants?: Array<{ name: string; role: string; state: string; tone: string }>;
  logTitle?: string;
  log?: Array<{ text: string; state: string; tone: string }>;
  checklistTitle?: string;
  checklist?: Array<{ label: string; done: boolean }>;
  steps?: Array<{ label: string; state: string }>;
  conceptTitle?: string;
  conceptParts?: Rich;
  conceptTags?: string[];
  runTitle?: string;
  runBadge?: string;
  scoreTitle?: string;
  scores?: Array<{ label: string; percent: number }>;
  scoreNote?: string;
  footText: string;
  footLinkLabel: string;
  footLinkHref: string;
}

export interface HomeCopy {
  hero: { titleLead: string; titleAccent: string; text: string; ctaLabel: string; ctaHref: string };
  stats: StatsCopy;
  benefits: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    cards: BenefitCard[];
  };
  howItWorks: {
    eyebrow: string;
    statementLead: string;
    statementAccent: string;
    ctaLabel: string;
    ctaHref: string;
    netLabel: string;
    providerLabel: string;
    payerLabel: string;
    hubLabel: string;
    providers: string[];
    payers: string[];
  };
  journey: {
    eyebrow: string;
    title: string;
    graphLabels: { start: string; hub: string; end: string };
    steps: Array<{ tag: string; title: string; text: string; tick: string }>;
  };
  onboarding: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    steps: Array<{ title: string; text: string; linkLabel: string; linkHref: string }>;
    support: Array<{ title: string; parts: Rich }>;
  };
  understand: {
    eyebrow: string;
    title: string;
    intro: string;
    participantsTitle: string;
    /** `icon` names an entry in components/vectors/understandIcons.tsx. */
    participants: Array<{ icon: string; title: string; text: string }>;
    useCasesTitle: string;
    useCases: Array<{ icon: string; name: string; path: string; what: string }>;
    note: Rich;
    whyTitle: string;
    why: Array<{ icon: string; title: string; text: string }>;
  };
  tools: {
    titleLead: string;
    titleAccent: string;
    prevLabel: string;
    nextLabel: string;
    screens: ToolScreen[];
  };
  integration: {
    titleLead: string;
    titleAccent: string;
    items: Array<{ title: string; text: string }>;
    links: Link[];
    mockUrl: string;
    code: string;
  };
  sandbox: { titleLead: string; titleAccent: string; titleTail: string; text: string; ctaLabel: string };
  specs: {
    eyebrow: string;
    title: string;
    lede: string;
    groups: Array<{
      title: string;
      items: Array<{ label: string; href: string; note?: string }>;
    }>;
  };
  faq: {
    fallbackTitle: string;
    generalTopic: string;
  };
}

// ─── PM-JAY ──────────────────────────────────────────────────────────────────

export interface PmjayCopy {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lede: string;
    primaryLabel: string;
    secondaryLabel: string;
    secondaryHref: string;
    emblemAlt: string;
  };
  facts: { eyebrow: string; title: string; items: Array<{ title: string; text: string }> };
  changed: {
    eyebrow: string;
    title: string;
    lede: string;
    items: Array<{ was: string; now: string; text: string }>;
  };
  journey: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    text: string;
    steps: Array<{ title: string; text: string }>;
  };
  sides: { eyebrow: string; title: string; groups: Array<{ who: string; items: string[] }> };
  start: {
    eyebrow: string;
    title: string;
    lede: string;
    applyLabel: string;
    consoleLabel: string;
  };
}

// ─── DevTools ────────────────────────────────────────────────────────────────

export type IconName = 'book' | 'braces' | 'play' | 'search' | 'plug' | 'rocket' | 'layers' | 'ledger';

export interface UseCaseCopy {
  icon: IconName;
  title: string;
  text: string;
}

export interface DevToolsCopy {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    intro: string;
    consoleCard: { title: string; copy: string; ctaLabel: string };
    adapterCard: {
      title: string;
      copy: string;
      downloadPrefix: string;
      fallbackCtaLabel: string;
      repoLabel: string;
    };
    flow: string[];
  };
  console: {
    fallbackTitle: string;
    ctaLabel: string;
    useCasesTitle: string;
    useCases: UseCaseCopy[];
  };
  adapter: {
    eyebrowPrefix: string;
    fallbackRepoName: string;
    repoUrl: string;
    title: string;
    introParts: Rich;
    useCasesTitle: string;
    useCases: UseCaseCopy[];
    downloadsTitle: string;
    releasedPrefix: string;
    emptyParts: Rich;
  };
  quickStart: {
    title: string;
    shellGroupLabel: string;
    copyLabel: string;
    copiedLabel: string;
    shells: Array<{ key: string; label: string; note: string; lines: string[] }>;
  };
  download: {
    recommendedLabel: string;
    selectedLabel: string;
    osLabel: string;
    archLabel: string;
    getLabel: string;
    archiveLabel: string;
    sizeLabel: string;
    shaLabel: string;
  };
}

// ─── the AI skill page ───────────────────────────────────────────────────────

export interface Transcript {
  prompt: string;
  steps: string[];
  reply: string;
}

export interface SkillCopy {
  meta: { title: string; description: string };
  skillUrl: string;
  install: string;
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lede: string;
    skillCtaLabel: string;
    consoleCtaLabel: string;
    chips: string[];
  };
  terminal: { tag: string; foot: string[]; transcripts: Transcript[] };
  loop: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    text: string;
    ringNodes: string[];
    phases: Array<{ title: string; text: string }>;
  };
  knows: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    ledeParts: Rich;
    cards: Array<{ tag: string; title: string; text: string }>;
  };
  prompts: { eyebrow: string; titleLead: string; titleAccent: string; text: string; items: string[] };
  rules: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    text: string;
    items: Array<{ title: string; text: string }>;
  };
  close: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    lede: string;
    skillCtaLabel: string;
    consoleCtaLabel: string;
    applyCtaLabel: string;
    noteParts: Rich;
  };
}

export interface SiteCopy {
  chrome: ChromeCopy;
  getStarted: GetStartedCopy;
  home: HomeCopy;
  pmjay: PmjayCopy;
  devtools: DevToolsCopy;
  skill: SkillCopy;
}

/**
 * The copy, with `devtools:` links resolved against the console's address.
 *
 * A missing or malformed file is a build error rather than an empty page:
 * every page on the site renders from this, so there is nothing sensible to
 * fall back to and a blank hero shipped quietly is the worse outcome.
 */
export function getSiteCopy(devtoolsUrl: string, docsUrl?: string): SiteCopy {
  const copy = readContentFile<SiteCopy>(['site.json']);
  if (!copy) throw new Error('content/site.json is missing: the pages have no copy to render');
  return resolveDevtoolsIn(copy, devtoolsUrl, docsUrl);
}
