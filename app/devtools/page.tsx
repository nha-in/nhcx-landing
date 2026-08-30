import { Fragment } from 'react';
import type { Metadata } from 'next';
import { getContent, type Link, type Chip, type ElementsTile } from '@/lib/content';
import { getDistManifest, groupByPlatform } from '@/lib/downloads';
import { PageShell } from '@/components/SiteChrome';
import DownloadTable, { type DownloadRow } from '@/components/pages/DownloadTable';
import { withBase } from '@/lib/paths';

type Feature = { icon?: string; title: string; description?: string };
type Step = { tag?: string; title: string };

/** The DevTools route reads the `integration-kit-page` single type (pre-rename UID). */
function devtoolsPage() {
  const { global, pages } = getContent();
  return { global, page: pages.devtools };
}

export function generateMetadata(): Metadata {
  const { page } = devtoolsPage();
  const seo = page.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  return {
    title: seo?.metaTitle ?? 'DevTools — NHCX',
    description: seo?.metaDescription ?? '',
  };
}

export default function DevToolsPage() {
  const { global, page } = devtoolsPage();
  const metaChips = (page.metaChips as Chip[]) ?? [];
  const features = (page.features as Feature[]) ?? [];
  const downloads = (page.downloads as DownloadRow[]) ?? [];
  const checklistItems = (page.checklistItems as Step[]) ?? [];
  const checklistLinks = (page.checklistLinks as Link[]) ?? [];
  const consoleTiles = (page.consoleTiles as ElementsTile[]) ?? [];
  const primaryCta = page.primaryCta as Link | undefined;
  const secondaryCta = page.secondaryCta as Link | undefined;
  const buildChangelog = page.buildChangelog as Link | undefined;

  // The release artifacts, staged from hcxkit/dist by `npm run sync:dist`.
  // When they are absent the page keeps the download rows from the CMS.
  const dist = getDistManifest();
  const platforms = dist ? groupByPlatform(dist.builds) : [];

  return (
    <PageShell global={global} currentPath="/devtools/">
      <section className="kitp-hero">
        <div className="container kitp-hero-inner">
          <div className="kitp-copy page-head-copy">
            <p className="eyebrow">{page.badgeText as string}</p>
            <h1 className="page-title">{page.title as string}</h1>
            <p className="page-intro">{page.description as string}</p>
            <div className="kitp-ctas">
              {primaryCta && (
                <a href={withBase(primaryCta.url)} className="btn btn-primary">
                  {primaryCta.label}
                </a>
              )}
              {secondaryCta && (
                <a href={withBase(secondaryCta.url)} className="btn btn-secondary">
                  {secondaryCta.label}
                </a>
              )}
            </div>
            <ul className="meta-list">
              {dist && (
                <li>
                  {dist.builds.length} builds · {platforms.map((p) => p.label).join(' · ')} · newest per platform
                </li>
              )}
              {metaChips.map((chip) => (
                <li key={chip.label}>{chip.label}</li>
              ))}
            </ul>
          </div>
          <div className="kitp-build">
            <span className="kitp-build-label">{page.buildLabel as string}</span>
            <span className="kitp-build-version">{dist?.version ?? (page.buildVersion as string)}</span>
            <span className="kitp-build-meta">{dist?.releasedLabel ? `released ${dist.releasedLabel}` : (page.buildReleased as string)}</span>
            <span className="kitp-build-meta">{page.buildSpec as string}</span>
            {buildChangelog && (
              <a href={withBase(buildChangelog.url)} className="link-arrow">
                {buildChangelog.label.replace(/\s*→\s*$/, '')}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="container kitp-flow" aria-label="How the connector sits between your system and the exchange">
        <span className="kitp-flow-node">{page.flowSource as string}</span>
        <span className="kitp-flow-arrow" aria-hidden="true" />
        <span className="kitp-flow-hub">{page.flowConnector as string}</span>
        <span className="kitp-flow-arrow" aria-hidden="true" />
        <span className="kitp-flow-node">{page.flowTarget as string}</span>
      </section>

      <section className="container kitp-features" aria-label="What the connector handles">
        {features.map((feature) => (
          <div key={feature.title} className="kitp-feature">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>

      {consoleTiles.length > 0 && (
        <section id="console" className="container kitp-section" aria-labelledby="console-title">
          <div className="section-head">
            <h2 id="console-title">{(page.consoleTitle as string) || 'Inside the console'}</h2>
            {page.consoleIntro && <p className="lede">{page.consoleIntro as string}</p>}
          </div>
          <ul className="console-grid">
            {consoleTiles.map((tile) => (
              <li key={tile.title}>
                <a href={withBase(tile.url)} className="tile">
                  <span className="tile-title">{tile.title}</span>
                  {tile.description && <span className="tile-desc">{tile.description}</span>}
                  <span className="tile-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="downloads" className="container kitp-section" aria-labelledby="downloads-title">
        <div className="section-head">
          <h2 id="downloads-title">{page.downloadsTitle as string}</h2>
        </div>
        <DownloadTable dist={dist} fallbackRows={downloads} />
      </section>

      <section className="container kitp-bottom">
        <div className="kitp-card">
          <h2>{page.runTitle as string}</h2>
          <pre className="code-block">{page.runCode as string}</pre>
          <p className="small">{page.runNote as string}</p>
        </div>
        <div className="kitp-card">
          <h2>{page.checklistTitle as string}</h2>
          <ol className="kitp-checklist">
            {checklistItems.map((item) => (
              <Fragment key={item.title}>
                <li>
                  <span className="kitp-check-tag">{item.tag}</span>
                  {item.title}
                </li>
              </Fragment>
            ))}
          </ol>
          <div className="btn-row">
            {checklistLinks.map((link) => (
              <a key={link.label} href={withBase(link.url)} className="btn btn-secondary">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
