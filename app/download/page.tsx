import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getDownloadGroups } from '@/lib/files';
import { PageShell } from '@/components/SiteChrome';
import { withBase } from '@/lib/paths';

/**
 * Downloads.
 *
 * A plain list of files the programme hands out — circulars, templates,
 * spreadsheets, sample bundles, archives — authored in
 * `content/downloads.json` (groups of items, each with a title, a description
 * and either a file under `public/files/` or an external URL). See
 * lib/files.ts and content/downloads.example.json.
 *
 * The route is `/download/` because `public/downloads/` is where the HCX
 * DevTools release archives are staged, and the static export would put a
 * `/downloads/` page in the same folder.
 */

export function generateMetadata(): Metadata {
  return {
    title: 'Downloads — NHCX',
    description: 'Documents, templates, sample bundles and other files published by the NHCX programme.',
  };
}

export default function DownloadPage() {
  const { global } = getContent();
  const groups = getDownloadGroups();
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <PageShell global={global} currentPath="/download/">
      <section className="page-head">
        <div className="container page-head-copy">
          <p className="eyebrow">Downloads</p>
          <h1 className="page-title">Documents and files</h1>
          <p className="page-intro">
            Circulars, templates, spreadsheets, sample bundles and other files published by the programme, in one place.
            The HCX DevTools builds themselves are on the <a href={withBase('/devtools/#downloads')}>DevTools page</a>.
          </p>
          <ul className="meta-list">
            <li>{total === 0 ? 'No files yet' : total === 1 ? '1 file' : `${total} files`}</li>
            {groups.length > 1 && (
              <li>
                {groups.map((g, i) => (
                  <span key={g.key}>
                    {i > 0 && ' · '}
                    <a href={`#${g.key}`}>{g.title}</a>
                  </span>
                ))}
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="container kitp-section dl-wrap" aria-label="Files to download">
        {groups.length === 0 ? (
          <p className="dl-empty">
            Nothing has been published for download yet. Files are listed from <code>content/downloads.json</code> — see{' '}
            <code>content/downloads.example.json</code> for the shape.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="dl-group" id={group.key}>
              <div className="section-head">
                <h2>{group.title}</h2>
                {group.description && <p className="lede">{group.description}</p>}
              </div>
              <div className="table-wrap">
                <table className="table dlt-table dl-table">
                  <thead>
                    <tr>
                      <th scope="col">File</th>
                      <th scope="col">Type</th>
                      <th scope="col" className="num">Size</th>
                      <th scope="col">Updated</th>
                      <th scope="col" className="num">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr key={item.url}>
                        <td>
                          <span className="dlt-name">{item.title}</span>
                          {item.description && <span className="dlt-note">{item.description}</span>}
                        </td>
                        <td>{item.kind}</td>
                        <td className="mono num">{item.size || '—'}</td>
                        <td className="mono">{item.modified ? <time dateTime={item.modified}>{item.modifiedLabel}</time> : '—'}</td>
                        <td className="num">
                          {item.external ? (
                            <a href={item.url} className="btn btn-sm btn-secondary" rel="noopener">
                              Download
                            </a>
                          ) : (
                            <a href={withBase(item.url)} download className="btn btn-sm btn-secondary">
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </PageShell>
  );
}
