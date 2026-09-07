import type { AdapterRelease } from '@/lib/adapter';
import type { DevToolsCopy } from '@/lib/site-copy';
import { withBase } from '@/lib/paths';

/**
 * The DevTools page hero.
 *
 * There are exactly two developer tools for NHCX and this says so: DevTools,
 * which runs in a browser at /dev/, and the NHCX Adapter, the one binary you
 * put in front of the exchange. One card each, so a reader can tell in a
 * glance which one they want, and the flow strip underneath shows where the
 * adapter sits, between a hospital system and NHCX, with a signal travelling
 * the wire out to the exchange and back. The strip says it on its own, so
 * there is no caption under it.
 *
 * The band opens the page's dark surface (styles/dark.css, then
 * styles/devtools.css) and the animation is CSS alone: the export is static
 * and nothing here should wait on JavaScript. Everything that moves stops
 * under `prefers-reduced-motion`.
 */
export default function DevToolsHero({
  copy,
  fallbackRepoUrl,
  release,
  consoleUrl,
}: {
  copy: DevToolsCopy['hero'];
  fallbackRepoUrl: string;
  release: AdapterRelease | null;
  consoleUrl: string;
}) {
  const repoUrl = release?.repoUrl ?? fallbackRepoUrl;
  const { consoleCard, adapterCard } = copy;

  return (
    <section className="dtx-hero dk-band">
      <span className="dk-aurora" aria-hidden="true" />
      <span className="dk-grid" aria-hidden="true" />

      <div className="container dtx-hero-inner">
        <p className="dk-eyebrow">{copy.eyebrow}</p>
        <h1 className="dk-title">
          {copy.titleLead}
          <br />
          <span>{copy.titleAccent}</span>
        </h1>
        <p className="dtx-intro">{copy.intro}</p>

        <div className="dtx-cards">
          <article className="dtx-card is-tools">
            <h2>{consoleCard.title}</h2>
            <p className="dtx-card-copy">{consoleCard.copy}</p>
            <div className="dtx-card-actions">
              <a href={`${consoleUrl}/`} className="dk-btn dk-btn-primary" rel="noopener">
                {consoleCard.ctaLabel}
              </a>
            </div>
          </article>

          <article className="dtx-card is-adapter">
            <h2>{adapterCard.title}</h2>
            <p className="dtx-card-copy">{adapterCard.copy}</p>
            <div className="dtx-card-actions">
              <a href={withBase('/devtools/#adapter')} className="dk-btn dk-btn-primary">
                {release ? `${adapterCard.downloadPrefix} ${release.version}` : adapterCard.fallbackCtaLabel}
              </a>
              <a href={repoUrl} className="dk-btn" target="_blank" rel="noopener noreferrer">
                {adapterCard.repoLabel}
              </a>
            </div>
          </article>
        </div>

        <div className="dtx-flow" aria-hidden="true">
          <span className="dtx-flow-node">{copy.flow[0]}</span>
          <span className="dtx-wire is-a">
            <i />
          </span>
          <span className="dtx-flow-node is-mid">{copy.flow[1]}</span>
          <span className="dtx-wire is-b">
            <i />
          </span>
          <span className="dtx-flow-node">{copy.flow[2]}</span>
        </div>
      </div>
    </section>
  );
}
