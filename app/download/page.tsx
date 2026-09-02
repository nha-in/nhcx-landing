import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { getDownloadGroups } from "@/lib/files";
import { PageShell } from "@/components/SiteChrome";
import { withBase } from "@/lib/paths";

/**
 * Downloads.
 *
 * A plain list of files the programme hands out — circulars, templates,
 * spreadsheets, sample bundles, archives — authored in
 * `content/download.json` (groups of items, each with a title, a description
 * and either a file under `public/files/` or an external URL). See
 * lib/files.ts and content/download.example.json.
 *
 * The route is `/download/` because `public/downloads/` is where the HCX
 * DevTools release archives are staged, and the static export would put a
 * `/downloads/` page in the same folder.
 */

/**
 * The two things a row can be, as a mark rather than a word.
 *
 * A row is either a file staged under `public/files/` or an address somewhere
 * else, and that is the only distinction a reader needs before clicking: the
 * arrow-into-a-line saves, the arrow-out-of-a-box leaves the site. It replaces
 * the "Type" and "Size" columns, which described the artefact rather than what
 * would happen.
 */
function GetIcon({ external }: { external: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {external ? (
        <>
          <path d="M14 4h6v6" />
          <path d="M20 4l-9 9" />
          <path d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
        </>
      ) : (
        <>
          <path d="M12 3v12" />
          <path d="M7 10l5 5 5-5" />
          <path d="M4 20h16" />
        </>
      )}
    </svg>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Downloads · NHCX",
    description:
      "The NHCX specifications, the programme's policies and guidelines, and the guides for getting onto the ABDM sandbox.",
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
          <h1 className="page-title">Specifications, policies and guides</h1>
          <p className="page-intro">
            Everything the programme publishes about NHCX, in one place: the
            open specification and its data models, the policies and guidelines
            that govern participation, and the guides for getting onto the
            sandbox. Each one opens where NHA or ABDM publishes it. The NHCX
            Adapter itself is on the{" "}
            <a href={withBase("/devtools/#adapter-downloads")}>DevTools page</a>
            .
          </p>
          <ul className="meta-list">
            <li>
              {total === 0
                ? "Nothing published yet"
                : total === 1
                  ? "1 document"
                  : `${total} documents`}
            </li>
            {groups.length > 1 && (
              <li>
                {groups.map((g, i) => (
                  <span key={g.key}>
                    {i > 0 && " · "}
                    <a href={`#${g.key}`}>{g.title}</a>
                  </span>
                ))}
              </li>
            )}
          </ul>
        </div>
      </section>

      <section
        className="container kitp-section dl-wrap"
        aria-label="Files to download"
      >
        {groups.length === 0 ? (
          <p className="dl-empty">
            Nothing has been published for download yet. Files are listed from{" "}
            <code>content/download.json</code>: see{" "}
            <code>content/download.example.json</code> for the shape.
          </p>
        ) : (
          groups.map((group) => {
            // External items carry no modified date, so a group of links would
            // print a column of dashes: the column earns its place only when
            // something in the group is a file we staged.
            const dated = group.items.some((item) => item.modified);
            return (
              <div key={group.key} className="dl-group" id={group.key}>
                <div className="section-head">
                  <h2>{group.title}</h2>
                  {group.description && (
                    <p className="lede">{group.description}</p>
                  )}
                </div>
                <div className="table-wrap">
                  <table className="table dlt-table dl-table">
                    <thead>
                      <tr>
                        <th scope="col">File</th>
                        {dated && <th scope="col">Updated</th>}
                        <th scope="col" className="num">
                          Get
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.url}>
                          <td>
                            <span className="dlt-name">{item.title}</span>
                            {item.description && (
                              <span className="dlt-note">
                                {item.description}
                              </span>
                            )}
                          </td>
                          {dated && (
                            <td className="mono">
                              {item.modified ? (
                                <time dateTime={item.modified}>
                                  {item.modifiedLabel}
                                </time>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                          <td className="num">
                            {item.external ? (
                              <a
                                href={item.url}
                                className="dl-get"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Open ${item.title} in a new tab`}
                                aria-label={`Open ${item.title} in a new tab`}
                              >
                                <GetIcon external />
                              </a>
                            ) : (
                              <a
                                href={withBase(item.url)}
                                download
                                className="dl-get"
                                title={`Download ${item.title}`}
                                aria-label={`Download ${item.title}`}
                              >
                                <GetIcon external={false} />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </section>
    </PageShell>
  );
}
