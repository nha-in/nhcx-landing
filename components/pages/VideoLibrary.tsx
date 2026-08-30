'use client';

import { useMemo, useState } from 'react';
import type { Link, Video } from '@/lib/content';
import { withBase } from '@/lib/paths';

const ALL = 'All tracks';

/** `2026-09-04` → `04 Sep 2026`; anything unparseable is shown as written. */
function dateLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * One entry. With a URL it is a recording and links out; without one it is a
 * planned session — no thumbnail pretending to be a player, just the outline
 * of what it will cover.
 */
export function VideoCard({ video }: { video: Video }) {
  const recorded = Boolean(video.url);
  const outline = video.outline ?? [];
  const body = (
    <>
      <span className={`vid-thumb${recorded ? '' : ' planned'}`}>
        {recorded ? (
          <>
            <span className="vid-play sm"><i /></span>
            {video.length && <span className="vid-length">{video.length}</span>}
          </>
        ) : (
          <span className="vid-soon">Recording coming soon</span>
        )}
      </span>
      <span className="vid-card-copy">
        <span className="vid-track">{video.track}</span>
        <span className="vid-title">{video.title}</span>
        <span className="vid-desc">{video.description}</span>
        {!recorded && outline.length > 0 && (
          <ul className="vid-outline" aria-label="What this recording will cover">
            {outline.map((point) => (
              <li key={point.text}>{point.text}</li>
            ))}
          </ul>
        )}
        <span className="vid-meta">
          {video.webinar && video.webinarDate ? `Webinar · ${dateLabel(video.webinarDate)}` : video.date || (recorded ? '' : 'not yet scheduled')}
        </span>
      </span>
    </>
  );
  return recorded ? (
    <a href={withBase(video.url)} className="vid-card">{body}</a>
  ) : (
    <div className="vid-card planned">{body}</div>
  );
}

export default function VideoLibrary({
  videos,
  footNote,
  footLink,
}: {
  videos: Video[];
  footNote?: string;
  footLink?: Link;
}) {
  const [track, setTrack] = useState(ALL);
  const webinars = useMemo(() => videos.filter((v) => v.webinar), [videos]);
  const library = useMemo(() => videos.filter((v) => !v.webinar), [videos]);
  const tracks = useMemo(() => [ALL, ...Array.from(new Set(library.map((v) => v.track)))], [library]);
  const visible = track === ALL ? library : library.filter((v) => v.track === track);
  const planned = visible.filter((v) => !v.url).length;

  return (
    <section id="playlists" className="container vid-body">
      <div className="vid-chips">
        {tracks.map((t) => (
          <button key={t} type="button" className={`chip-btn${t === track ? ' on' : ''}`} onClick={() => setTrack(t)}>
            {t === ALL ? t : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
        {planned > 0 && (
          <span className="vid-count">{planned === visible.length ? `${planned} planned, none recorded yet` : `${planned} of ${visible.length} still to be recorded`}</span>
        )}
      </div>

      <div className="vid-grid">
        {visible.map((video) => (
          <VideoCard key={video.title} video={video} />
        ))}
      </div>

      <div id="webinars" className="vid-webinars">
        <div className="vid-webinars-head">
          <h2>Webinar materials</h2>
          <span>{webinars.length ? `${webinars.length} session${webinars.length === 1 ? '' : 's'}` : 'no sessions held yet'}</span>
        </div>
        {webinars.length ? (
          <div className="vid-grid">
            {webinars.map((video) => (
              <VideoCard key={video.title} video={video} />
            ))}
          </div>
        ) : (
          <p className="vid-webinars-empty">
            Slides and recordings from developer clinics and payer workshops will be listed here once a session has been
            held. None has been scheduled yet.
          </p>
        )}
      </div>

      <div className="vid-note">
        <span>{footNote}</span>
        {footLink && <a href={withBase(footLink.url)}>{footLink.label}</a>}
      </div>
    </section>
  );
}
