import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { getAdapterRelease } from '@/lib/adapter';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import DevToolsHero from '@/components/pages/DevToolsHero';
import AdapterSection from '@/components/pages/AdapterSection';
import UseCases from '@/components/pages/UseCases';
import '@/styles/dark.css';
import '@/styles/devtools.css';

/**
 * DevTools.
 *
 * There are two developer tools for NHCX and this page carries both:
 * DevTools, which runs in a browser at `global.devtoolsUrl` (/dev/), and the
 * NHCX Adapter, the binary published on GitHub. Nothing else: the page
 * used to advertise a "UTI NHCX connector" that does not exist, and its hero,
 * flow strip, download table and run instructions all described it.
 *
 * Dark end to end, on the shared dark surface (styles/dark.css, then
 * styles/devtools.css): the page is where a developer comes to install
 * something, and the tools it describes are terminals and consoles, so it is
 * dressed like one rather than like the programme pages.
 *
 * Two sources of words meet here. The console section's title and intro come
 * from the CMS `integration-kit-page` single type (pre-rename UID), because
 * they were authored there; everything else — the hero, the use cases, the
 * adapter section, the run instructions and the download labels — is
 * `devtools` in content/site.json.
 */
function devtoolsPage() {
  const { global, pages } = getContent();
  const console_ = consoleUrl(global);
  return { global, console_, page: pages.devtools, copy: getSiteCopy(console_, global.docsUrl).devtools };
}

export function generateMetadata(): Metadata {
  const { page, copy } = devtoolsPage();
  const seo = page.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  return {
    title: seo?.metaTitle ?? copy.meta.title,
    description: seo?.metaDescription ?? copy.meta.description,
  };
}

export default function DevToolsPage() {
  const { global, console_, page, copy } = devtoolsPage();

  // The adapter's newest GitHub release (npm run sync:adapter); null when
  // nothing has been synced, which the sections below say plainly.
  const adapter = getAdapterRelease();

  return (
    <PageShell global={global} currentPath="/devtools/">
      <div className="dark-page">
        <DevToolsHero copy={copy.hero} fallbackRepoUrl={copy.adapter.repoUrl} release={adapter} consoleUrl={console_} />

        <section id="console" className="dk-section" aria-labelledby="console-title">
          <div className="container kitp-section">
            <div className="dk-head">
              <h2 id="console-title">{(page.consoleTitle as string) || copy.console.fallbackTitle}</h2>
              {page.consoleIntro && <p>{page.consoleIntro as string}</p>}
              <a href={`${console_}/`} className="dk-btn dk-btn-primary" rel="noopener">
                {copy.console.ctaLabel}
              </a>
            </div>
            <UseCases title={copy.console.useCasesTitle} items={copy.console.useCases} />
          </div>
        </section>

        <AdapterSection
          copy={copy.adapter}
          quickStart={copy.quickStart}
          download={copy.download}
          release={adapter}
        />
      </div>
    </PageShell>
  );
}
