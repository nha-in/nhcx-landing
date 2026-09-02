import type { AdapterRelease } from '@/lib/adapter';
import AdapterDownload from '@/components/pages/AdapterDownload';
import QuickStart from '@/components/pages/QuickStart';
import UseCases, { type UseCase } from '@/components/pages/UseCases';

/**
 * The NHCX Adapter on the DevTools page.
 *
 * The adapter is the small, stateless piece an integrator actually deploys:
 * one binary in front of NHCX that completes the `x-hcx-*` headers, encrypts
 * and decrypts, keeps its session token fresh and writes every message down.
 * DevTools is where you learn and rehearse the protocol; this is what carries
 * it in production, so the page advertises both.
 *
 * The copy is written here rather than in the CMS because it describes a
 * specific repository (the same reason the landing carousel is code) and the
 * download is generated: `npm run sync:adapter` reads the newest GitHub
 * release into content/adapter.json and the picker below offers whatever it
 * found. Without a synced release the section still stands, with the releases
 * page as its download link.
 */

const USE_CASES: UseCase[] = [
  {
    icon: 'plug',
    title: 'Put an existing system on NHCX',
    text: 'Your HMIS or claims software posts a bundle to one local endpoint and reads plain JSON back. Nothing inside it learns the protocol, and one adapter can carry several participant codes.',
  },
  {
    icon: 'rocket',
    title: 'Move from sandbox to production',
    text: 'One switch in config.json. The same calls and the same endpoints, pointed at the other environment\u2019s registry and credentials.',
  },
  {
    icon: 'search',
    title: 'Settle a disputed claim',
    text: 'Pull the exact request and callback for a correlation id months later, decrypted and readable, and replay it if the payer asks.',
  },
];

export default function AdapterSection({ release }: { release: AdapterRelease | null }) {
  const repoUrl = release?.repoUrl ?? 'https://github.com/nha-in/nhcx-adapter';
  const releasesUrl = release?.releasesUrl ?? `${repoUrl}/releases`;

  return (
    <section id="adapter" className="container kitp-section" aria-labelledby="adapter-title">
      <div className="section-head">
        <p className="eyebrow">Open source · {release?.repo?.split('/').pop() ?? 'nhcx-adapter'}</p>
        <h2 id="adapter-title">NHCX Adapter</h2>
        <p className="lede">
          One binary between your system and NHCX. Your software posts a FHIR bundle to it and reads a plain callback
          back; the adapter does the <code>x-hcx-*</code> headers, the encryption, the certificates and the
          acknowledgements. Nothing else about your system changes.
        </p>
      </div>

      <UseCases title="What you'd use the adapter for" items={USE_CASES} />

      <QuickStart version={release?.version ?? '<version>'} />

      <div className="blk">
        <h3 id="adapter-downloads" className="blk-title">
          Download the NHCX Adapter
          {release && (
            <span className="adapter-rel">
              {release.version} · released {release.releasedLabel}
            </span>
          )}
        </h3>
        {release ? (
          <AdapterDownload builds={release.builds} />
        ) : (
          <p className="dl-empty">
            The release list could not be read at build time. Every platform build is on the{' '}
            <a href={releasesUrl} target="_blank" rel="noopener noreferrer">
              releases page
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
