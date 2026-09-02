import type { Metadata } from 'next';
import { getContent, type Link } from '@/lib/content';
import { getNewsFile } from '@/lib/local-content';
import { withBase } from '@/lib/paths';
import { PageShell } from '@/components/SiteChrome';
import NewsFeed from '@/components/pages/NewsFeed';

type EventItem = { when: string; title: string };

/**
 * The page's copy and its feed, from content/news.json — the CMS snapshot is
 * only a fallback for a checkout that has no file.
 */
function newsContent() {
  const { global, pages, collections } = getContent();
  const file = getNewsFile(global.devtoolsUrl ?? '');
  return {
    global,
    page: (file?.page ?? pages.news) as typeof pages.news,
    items: (file?.items ?? collections.newsItems) as unknown[],
  };
}

export function generateMetadata(): Metadata {
  const { page } = newsContent();
  return {
    title: page.seo?.metaTitle ?? 'News · NHCX',
    description: page.seo?.metaDescription ?? '',
  };
}

/**
 * News. Everything on this page is either a milestone of this site, a
 * documentation refresh, or a pointer at NHA / NRCeS material the corpus
 * reproduces — so it carries no sample-data banner.
 */
export default function NewsPage() {
  const { global, page, items } = newsContent();
  const events = (page.events as EventItem[]) ?? [];
  const upcomingLink = page.upcomingLink as Link | undefined;
  const featuredUrl = (page.featuredUrl as string | undefined) || '#feed';

  return (
    <PageShell global={global} currentPath="/news/">
      <section className="container page-head">
        <p className="eyebrow">{page.eyebrow as string}</p>
        <h1 className="page-title">{page.title as string}</h1>
        <p className="page-intro">{page.intro as string}</p>
      </section>

      <section className="container">
        <a href={withBase(featuredUrl)} className="news-featured">
          <div className="news-photo">{page.featuredImageNote as string}</div>
          <div className="news-featured-copy">
            <span className="news-featured-tagrow">
              <span className="pill-badge">{page.featuredTag as string}</span>
              <span className="news-date">{page.featuredDate as string}</span>
            </span>
            <h2>{page.featuredTitle as string}</h2>
            <p>{page.featuredDescription as string}</p>
            <span className="news-more">{page.featuredLinkLabel as string}</span>
          </div>
        </a>
      </section>

      <section id="feed" className="container news-feed">
        <NewsFeed items={items} />

        <aside className="news-aside">
          <div className="news-aside-card">
            <b>{page.upcomingTitle as string}</b>
            {events.map((event) => (
              <span key={event.title} className="news-event">
                <i>{event.when}</i>
                <span>{event.title}</span>
              </span>
            ))}
            {events.length === 0 && page.upcomingNote && <span className="news-aside-note">{page.upcomingNote as string}</span>}
            {upcomingLink && <a href={withBase(upcomingLink.url)}>{upcomingLink.label}</a>}
          </div>
          <div className="news-aside-dashed" id="enquiries">
            <b>{page.enquiriesTitle as string}</b>
            <span>{page.enquiriesText as string}</span>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
