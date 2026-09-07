import type { AdapterRelease } from '@/lib/adapter';
import type { DevToolsCopy } from '@/lib/site-copy';
import Rich from '@/components/Rich';
import AdapterDownload from '@/components/pages/AdapterDownload';
import QuickStart from '@/components/pages/QuickStart';
import UseCases from '@/components/pages/UseCases';

/**
 * The NHCX Adapter on the DevTools page.
 *
 * The adapter is the small, stateless piece an integrator actually deploys:
 * one binary in front of NHCX that completes the `x-hcx-*` headers, encrypts
 * and decrypts, keeps its session token fresh and writes every message down.
 * DevTools is where you learn and rehearse the protocol; this is what carries
 * it in production, so the page advertises both.
 *
 * The words are `devtools.adapter` in content/site.json; the download is
 * generated, because it describes a specific repository: `npm run
 * sync:adapter` reads the newest GitHub release into content/adapter.json and
 * the picker below offers whatever it found. Without a synced release the
 * section still stands, with the releases page as its download link.
 */
export default function AdapterSection({
  copy,
  quickStart,
  download,
  release,
}: {
  copy: DevToolsCopy['adapter'];
  quickStart: DevToolsCopy['quickStart'];
  download: DevToolsCopy['download'];
  release: AdapterRelease | null;
}) {
  const repoUrl = release?.repoUrl ?? copy.repoUrl;
  const releasesUrl = release?.releasesUrl ?? `${repoUrl}/releases`;

  return (
    <section id="adapter" className="dk-section dk-band" aria-labelledby="adapter-title">
      <span className="dk-aurora dtx-adapter-glow" aria-hidden="true" />
      <div className="container kitp-section">
        <div className="dk-head">
          <p className="dk-eyebrow">
            {copy.eyebrowPrefix} {release?.repo?.split('/').pop() ?? copy.fallbackRepoName}
          </p>
          <h2 id="adapter-title">{copy.title}</h2>
          <p>
            <Rich parts={copy.introParts} />
          </p>
        </div>

        <UseCases title={copy.useCasesTitle} items={copy.useCases} />

        <div className="blk">
          <h3 id="adapter-downloads" className="blk-title">
            {copy.downloadsTitle}
            {release && (
              <span className="adapter-rel">
                {release.version} · {copy.releasedPrefix} {release.releasedLabel}
              </span>
            )}
          </h3>
          {release ? (
            <AdapterDownload copy={download} builds={release.builds} />
          ) : (
            <p className="dl-empty">
              <Rich parts={copy.emptyParts.map((part) => (typeof part === 'object' && 'label' in part ? { ...part, href: releasesUrl } : part))} />
            </p>
          )}
        </div>

        <QuickStart copy={quickStart} version={release?.version ?? '<version>'} />
      </div>
    </section>
  );
}
