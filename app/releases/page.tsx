import type { Metadata } from 'next';
import { getContent, type ReleaseNote } from '@/lib/content';
import { withBase } from '@/lib/paths';
import { PageShell } from '@/components/SiteChrome';

export function generateMetadata(): Metadata {
  return {
    title: 'Release notes — NHCX',
    description: 'What changed in each release of the NHCX sandbox site and its tooling: highlights, breaking changes and links.',
  };
}

/** `2026-08-25` → `25 Aug 2026`. */
function dateLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Entry({ note }: { note: ReleaseNote }) {
  return (
    <article className="rn-entry" id={`v-${note.version.replace(/[^a-z0-9]+/gi, '-')}`}>
      <div className="rn-side">
        <span className="rn-version">{note.version}</span>
        <span className="rn-date">{dateLabel(note.date)}</span>
        <span className={`rn-channel ${note.channel}`}>{note.channel === 'production' ? 'Production' : 'Sandbox'}</span>
      </div>
      <div className="rn-main">
        {note.title && <h2>{note.title}</h2>}
        {note.summary && <p className="rn-summary">{note.summary}</p>}
        {note.highlights.length > 0 && (
          <>
            <h3>Highlights</h3>
            <ul>
              {note.highlights.map((h) => (
                <li key={h.text}>{h.text}</li>
              ))}
            </ul>
          </>
        )}
        {note.breaking.length > 0 && (
          <>
            <h3 className="rn-breaking-title">Breaking changes</h3>
            <ul className="rn-breaking">
              {note.breaking.map((b) => (
                <li key={b.text}>{b.text}</li>
              ))}
            </ul>
          </>
        )}
        {note.links.length > 0 && (
          <div className="rn-links">
            {note.links.map((l) => (
              <a key={l.label} href={withBase(l.url ?? '#')}>
                {l.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Release notes — the `release-note` collection, newest first. Entries are
 * this site's own releases (sourced from its history) and, when NHA publishes
 * them, the sandbox's; nothing here is inferred.
 */
export default function ReleasesPage() {
  const { global, collections } = getContent();
  const notes = collections.releaseNotes;
  const channels = Array.from(new Set(notes.map((n) => n.channel)));

  return (
    <PageShell global={global} currentPath="/releases/">
      <section className="container page-head">
        <p className="eyebrow">RELEASE NOTES</p>
        <h1 className="page-title">What changed, release by release</h1>
        <p className="page-intro">
          Every release of this site and its sandbox tooling, newest first, with what it added, what it broke and where to
          look. {channels.includes('production') ? 'Sandbox and production releases are marked.' : 'All entries so far are sandbox releases.'}
        </p>
      </section>

      <section className="container rn-wrap">
        <div className="rn-list">
          {notes.map((note) => (
            <Entry key={note.version} note={note} />
          ))}
        </div>
        <aside className="rn-aside">
          <div className="news-aside-dashed">
            <b>Where the entries come from</b>
            <span>
              Site releases are written from the repository history. NHA release notes for the sandbox are added here when
              NHA publishes them; none are reproduced from memory.
            </span>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
