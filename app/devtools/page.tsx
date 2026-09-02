import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getAdapterRelease } from '@/lib/adapter';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import DevToolsHero from '@/components/pages/DevToolsHero';
import AdapterSection from '@/components/pages/AdapterSection';
import UseCases, { type UseCase } from '@/components/pages/UseCases';

/** What a reader opens DevTools to do, as opposed to what it contains. */
const DEVTOOLS_USE_CASES: UseCase[] = [
  {
    icon: 'book',
    title: 'Starting from zero',
    text: 'Fourteen chapters across two tracks, from what the exchange is to how a claim settles, each ending in a short check that remembers where you got to.',
  },
  {
    icon: 'braces',
    title: 'Preparing your first claim',
    text: 'Compose eligibility, pre-authorisation, claim and payment bundles against the ABDM profiles, and find what is wrong before a real send does.',
  },
  {
    icon: 'play',
    title: 'Testing with no counterparty',
    text: 'A mock payer answers, so a whole flow runs end to end before anyone assigns you a partner — and when one fails, the decrypted request and callback are both there.',
  },
];

/**
 * DevTools.
 *
 * There are two developer tools for NHCX and this page carries both:
 * DevTools, which runs in a browser at `global.devtoolsUrl` (/dev/), and the
 * NHCX Adapter, the binary published on GitHub. Nothing else: the page
 * used to advertise a "UTI NHCX connector" that does not exist, and its hero,
 * flow strip, download table and run instructions all described it.
 *
 * The route still reads the `integration-kit-page` single type (pre-rename
 * UID); the fields that described the connector, and the closing checklist
 * and "which one do I need" cards, are no longer rendered.
 */
function devtoolsPage() {
  const { global, pages } = getContent();
  return { global, page: pages.devtools };
}

export function generateMetadata(): Metadata {
  const { page } = devtoolsPage();
  const seo = page.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  return {
    title: seo?.metaTitle ?? 'DevTools · NHCX',
    description: seo?.metaDescription ?? '',
  };
}

export default function DevToolsPage() {
  const { global, page } = devtoolsPage();

  // DevTools at /dev/, and the adapter's newest GitHub release
  // (npm run sync:adapter): the two things this page is about.
  const console_ = consoleUrl(global);
  const adapter = getAdapterRelease();

  return (
    <PageShell global={global} currentPath="/devtools/">
      <DevToolsHero release={adapter} consoleUrl={console_} />

      <section id="console" className="container kitp-section" aria-labelledby="console-title">
        <div className="section-head">
          <p className="eyebrow">In your browser</p>
          <h2 id="console-title">{(page.consoleTitle as string) || 'DevTools'}</h2>
          {page.consoleIntro && <p className="lede">{page.consoleIntro as string}</p>}
          <a href={`${console_}/`} className="btn btn-secondary" rel="noopener">
            Open DevTools
          </a>
        </div>
        <UseCases title="What you'd use DevTools for" items={DEVTOOLS_USE_CASES} />
      </section>

      <AdapterSection release={adapter} />
    </PageShell>
  );
}
