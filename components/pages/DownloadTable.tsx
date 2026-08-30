import type { DistManifest } from '@/lib/downloads';
import { groupByPlatform, shortSha } from '@/lib/downloads';
import RecommendedBuild from '@/components/pages/RecommendedBuild';
import { withBase } from '@/lib/paths';

/** A row of the CMS-authored fallback table (`integration-kit-page.downloads`). */
export type DownloadRow = { name: string; note?: string; runtime?: string; size?: string; format?: string; url?: string };

/**
 * The HCX DevTools download table, shared by /download/ and the DevTools
 * page. With a staged release (`npm run sync:dist`) it lists one build per
 * platform and architecture, with the machine's own build recommended above
 * the table; without one it falls back to the rows authored in the CMS.
 */
export default function DownloadTable({ dist, fallbackRows }: { dist: DistManifest | null; fallbackRows: DownloadRow[] }) {
  if (!dist) {
    return (
      <div className="table-wrap">
        <table className="table dlt-table">
          <thead>
            <tr>
              <th scope="col">Package</th>
              <th scope="col">Runtime</th>
              <th scope="col" className="num">Size</th>
              <th scope="col" className="num">Download</th>
            </tr>
          </thead>
          <tbody>
            {fallbackRows.map((row) => (
              <tr key={row.name}>
                <td>
                  <span className="dlt-name">{row.name}</span>
                  <span className="dlt-note">{row.note}</span>
                </td>
                <td className="mono">{row.runtime}</td>
                <td className="mono num">{row.size}</td>
                <td className="num">
                  <a href={withBase(row.url ?? '#downloads')} className="btn btn-sm btn-secondary">
                    {row.format}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const platforms = groupByPlatform(dist.builds);
  return (
    <>
      <RecommendedBuild builds={dist.builds} />
      <div className="table-wrap">
        <table className="table dlt-table">
          <thead>
            <tr>
              <th scope="col">Architecture</th>
              <th scope="col">Format</th>
              <th scope="col" className="num">Size</th>
              <th scope="col">SHA-256</th>
              <th scope="col" className="num">Download</th>
            </tr>
          </thead>
          {platforms.map((platform) => (
            <tbody key={platform.os}>
              <tr className="dlt-group">
                <th scope="rowgroup" colSpan={5}>
                  {platform.label}
                  <span>{platform.builds.length === 1 ? '1 architecture' : `${platform.builds.length} architectures`}</span>
                </th>
              </tr>
              {platform.builds.map((build) => (
                <tr key={build.file}>
                  <td>
                    <span className="dlt-name">{build.archLabel}</span>
                    <span className="dlt-note">{build.archNote}</span>
                  </td>
                  <td className="mono">{build.format}</td>
                  <td className="mono num">{build.size}</td>
                  <td className="mono dlt-sum" title={build.sha256}>{shortSha(build.sha256)}</td>
                  <td className="num">
                    <a href={withBase(build.url)} download className="btn btn-sm btn-secondary">
                      {build.osLabel} {build.archLabel}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="dlt-foot">
        Every archive carries the same {dist.version} build — the <code>hcxkit</code> binary, the console, the
        documentation corpus and a sample config. Verify a download against{' '}
        {dist.checksumsUrl ? <a href={withBase(dist.checksumsUrl)}>checksums.txt</a> : 'the published digest'} with{' '}
        <code>shasum -a 256</code>.
      </p>
    </>
  );
}
