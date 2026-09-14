import section from '@/content/site.yaml?devtools';
import type { Meta } from '@/lib/site-copy';

/*
 * Every word and link on the DevTools page. They live in content/site.yaml
 * (`devtools`); this file gives them their types. The adapter's release list
 * is generated separately, into lib/adapter-release.ts.
 */

export type IconName = 'book' | 'braces' | 'play' | 'search' | 'plug' | 'rocket' | 'layers' | 'ledger';
export type UseCase = { icon: IconName; title: string; text: string };
type Shell = { key: string; label: string; note: string; lines: string[] };
export type QuickStartCopy = { title: string; shellGroupLabel: string; copyLabel: string; copiedLabel: string; shells: Shell[] };
export type DownloadCopy = {
  recommendedLabel: string;
  selectedLabel: string;
  osLabel: string;
  archLabel: string;
  getLabel: string;
  archiveLabel: string;
  sizeLabel: string;
  shaLabel: string;
};

type DevtoolsContent = {
  meta: Meta;
  url: string;
  hero: {
    kicker: string;
    titleLead: string;
    titleAccent: string;
    intro: string;
    consoleCard: { title: string; copy: string; ctaLabel: string };
    adapterCard: { title: string; copy: string; downloadPrefix: string; repoLabel: string };
    flow: [string, string, string];
  };
  console: { title: string; intro: string; ctaLabel: string; useCasesTitle: string; useCases: UseCase[] };
  adapter: { title: string; introBefore: string; introCode: string; introAfter: string; useCasesTitle: string; useCases: UseCase[]; downloadsTitle: string; releasedPrefix: string };
  quickstart: QuickStartCopy;
  download: DownloadCopy;
};

const c = section as DevtoolsContent;

/** The DevTools console, which runs in a browser. */
export const DEVTOOLS_URL = c.url;
export const { meta: META, hero: HERO, console: CONSOLE, adapter: ADAPTER, quickstart: QUICKSTART, download: DOWNLOAD } = c;
