import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import DevToolsHero from '@/components/devtools/DevToolsHero';
import UseCases from '@/components/devtools/UseCases';
import AdapterDownload from '@/components/devtools/AdapterDownload';
import QuickStart from '@/components/devtools/QuickStart';
import { ADAPTER, CONSOLE, DEVTOOLS_URL, DOWNLOAD, QUICKSTART } from '@/lib/devtools-copy';
import { ADAPTER_RELEASE } from '@/lib/adapter-release';

export const metadata: Metadata = {
  title: 'DevTools · NHCX',
  description: 'Two developer tools for NHCX: DevTools, which teaches and rehearses the exchange in a browser, and the NHCX Adapter, the binary that carries it in production.',
};

/*
 * DevTools: the two developer tools for NHCX, carried over from the previous
 * site on this site's theme. DevTools runs in a browser; the NHCX Adapter is
 * the binary published on GitHub, with its download and run instructions.
 */
export default function DevToolsPage() {
  const release = ADAPTER_RELEASE;
  return (
    <>
      <Header current="/devtools/" />
      <main className="tl">
        <DevToolsHero release={release} />

        <section className="tl-section" id="console" aria-labelledby="console-title">
          <div className="wrap">
            <div className="tl-head">
              <h2 className="tl-h2" id="console-title">{CONSOLE.title}</h2>
              <p className="tl-sub">{CONSOLE.intro}</p>
              <a className="btn btn--primary btn--green" href={`${DEVTOOLS_URL}/`} target="_blank" rel="noopener">
                {CONSOLE.ctaLabel} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <UseCases title={CONSOLE.useCasesTitle} items={CONSOLE.useCases} />
          </div>
        </section>

        <section className="tl-section is-alt" id="adapter" aria-labelledby="adapter-title">
          <div className="wrap">
            <div className="tl-head">
              <h2 className="tl-h2" id="adapter-title">{ADAPTER.title}</h2>
              <p className="tl-sub">
                {ADAPTER.introBefore}
                <code>{ADAPTER.introCode}</code>
                {ADAPTER.introAfter}
              </p>
            </div>

            <UseCases title={ADAPTER.useCasesTitle} items={ADAPTER.useCases} />

            <div className="tl-block">
              <h3 className="tl-block-title" id="adapter-downloads">
                {ADAPTER.downloadsTitle}
                <span>
                  {release.version} · {ADAPTER.releasedPrefix} {release.releasedLabel}
                </span>
              </h3>
              <AdapterDownload copy={DOWNLOAD} builds={release.builds} />
            </div>

            <div className="tl-block">
              <QuickStart copy={QUICKSTART} version={release.version} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
