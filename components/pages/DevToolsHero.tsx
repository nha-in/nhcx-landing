import type { AdapterRelease } from '@/lib/adapter';
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
 * Dark, because it is the only band of the site that is, and the animation is
 * CSS alone: the export is static and nothing here should wait on JavaScript.
 * Everything that moves stops under `prefers-reduced-motion`.
 */
export default function DevToolsHero({
  release,
  consoleUrl,
}: {
  release: AdapterRelease | null;
  consoleUrl: string;
}) {
  const repoUrl = release?.repoUrl ?? 'https://github.com/nha-in/nhcx-adapter';

  return (
    <section className="dtx-hero">
      <span className="dtx-aurora" aria-hidden="true" />
      <span className="dtx-grid" aria-hidden="true" />

      <div className="container dtx-hero-inner">
        <p className="dtx-eyebrow">Developer tools for NHCX</p>
        <h1 className="dtx-title">
          Rehearse in a browser,
          <br />
          <span>deploy one binary</span>
        </h1>
        <p className="dtx-intro">
          Two tools and no third thing to choose between: one that teaches and rehearses the exchange in a browser tab,
          one that carries it in production.
        </p>

        <div className="dtx-cards">
          <article className="dtx-card is-tools">
            <p className="dtx-card-tag">
              <span className="dtx-live" aria-hidden="true" />
              In your browser
            </p>
            <h2>DevTools</h2>
            <p className="dtx-card-copy">
              The exchange end to end, in a tab: read how an endpoint behaves, build a bundle that validates, and trade
              claims with a mock payer until every flow passes. Nothing you do here touches your servers.
            </p>
            <ul className="dtx-card-meta">
              <li>no install</li>
              <li>no login</li>
              <li>sandbox included</li>
            </ul>
            <div className="dtx-card-actions">
              <a href={`${consoleUrl}/`} className="dtx-btn dtx-btn-primary" rel="noopener">
                Open DevTools
              </a>
            </div>
          </article>

          <article className="dtx-card is-adapter">
            <p className="dtx-card-tag">
              <span className="dtx-dot" aria-hidden="true" />
              One binary
            </p>
            <h2>NHCX Adapter</h2>
            <p className="dtx-card-copy">
              The piece you actually deploy. Post a FHIR bundle to it, read a plain callback back, and it does the
              headers, the encryption, the certificates and the acknowledgements in between. One JSON config, no
              database.
            </p>
            <ul className="dtx-card-meta">
              {release ? (
                <>
                  <li>{release.version}</li>
                  <li>{release.builds.length} platform builds</li>
                  <li>released {release.releasedLabel}</li>
                </>
              ) : (
                <li>open source on GitHub</li>
              )}
            </ul>
            <div className="dtx-card-actions">
              <a href={withBase('/devtools/#adapter')} className="dtx-btn dtx-btn-primary">
                {release ? `Download ${release.version}` : 'Get the adapter'}
              </a>
              <a href={repoUrl} className="dtx-btn" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </article>
        </div>

        <div className="dtx-flow" aria-hidden="true">
          <span className="dtx-flow-node">Your system</span>
          <span className="dtx-wire is-a">
            <i />
          </span>
          <span className="dtx-flow-node is-mid">NHCX Adapter</span>
          <span className="dtx-wire is-b">
            <i />
          </span>
          <span className="dtx-flow-node">NHCX</span>
        </div>
      </div>
    </section>
  );
}
