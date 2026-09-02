import fs from 'node:fs';
import path from 'node:path';
import { resolveDevtoolsIn } from './content';

/**
 * Page content authored as a file in `content/`, rather than in the CMS.
 *
 * Three pages are edited this way — downloads (`download.json`), news
 * (`news.json`) and videos (`videos.json`). They are lists someone updates
 * often and by hand: a file in the repository is quicker to change than a CMS
 * entry, reviews as a diff, and keeps the page correct in a clone with no CMS
 * behind it.
 *
 * Each file carries both the page's own copy and its entries, so everything a
 * page shows is in one place:
 *
 *     { "page": { "title": …, "intro": … }, "items": [ … ] }
 *
 * A missing file is not an error here — each caller decides what to do
 * without one (the downloads page says nothing is published yet; news and
 * videos fall back to the CMS snapshot).
 *
 * These files carry the same `devtools:/learn` link scheme the CMS content
 * does, so the page readers resolve it against the console's address the same
 * way `getContent()` does for the snapshot.
 *
 * Everything is read at build time: the site is a static export.
 */

/** The first of `names` that exists in content/, parsed; null if none do. */
export function readContentFile<T>(names: string[]): T | null {
  for (const name of names) {
    const file = path.join(process.cwd(), 'content', name);
    if (!fs.existsSync(file)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as T;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (err) {
      // A malformed file is a mistake worth stopping for: silently falling
      // back would publish a page missing everything the editor just wrote.
      throw new Error(`content/${name}: ${(err as Error).message}`);
    }
  }
  return null;
}

/** One entry in the news feed. */
export interface NewsEntry {
  date: string;
  tag: string;
  /** `brand` for the programme's own milestones; anything else reads muted. */
  tone?: string;
  title: string;
  body?: string;
  meta?: string;
  url?: string;
}

/** content/news.json — the page's copy, then its feed. */
export interface NewsFile {
  page?: Record<string, unknown>;
  items?: NewsEntry[];
}

/** content/videos.json — the page's copy, then the library. */
export interface VideosFile {
  page?: Record<string, unknown>;
  videos?: unknown[];
}

export function getNewsFile(devtoolsUrl: string): NewsFile | null {
  const file = readContentFile<NewsFile>(['news.json']);
  return file && resolveDevtoolsIn(file, devtoolsUrl);
}

export function getVideosFile(devtoolsUrl: string): VideosFile | null {
  const file = readContentFile<VideosFile>(['videos.json']);
  return file && resolveDevtoolsIn(file, devtoolsUrl);
}
