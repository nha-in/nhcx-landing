import type { Metadata } from 'next';
import { getContent, type Link } from '@/lib/content';
import { withBase } from '@/lib/paths';
import { PageShell } from '@/components/SiteChrome';
import VideoLibrary from '@/components/pages/VideoLibrary';

export function generateMetadata(): Metadata {
  const { pages } = getContent();
  return {
    title: pages.videos.seo?.metaTitle ?? 'Videos — NHCX',
    description: pages.videos.seo?.metaDescription ?? '',
  };
}

export default function VideosPage() {
  const { global, pages, collections } = getContent();
  const page = pages.videos;
  const channelCta = page.channelCta as Link | undefined;
  const featuredUrl = (page.featuredUrl as string | undefined) || '';
  const featuredBody = (
    <>
      <div className={`vid-thumb${featuredUrl ? '' : ' planned'}`}>
        {featuredUrl ? <span className="vid-play"><i /></span> : <span className="vid-soon">Recording coming soon</span>}
      </div>
      <div className="vid-featured-copy">
        <span className="pill-badge">{page.featuredBadge as string}</span>
        <h2>{page.featuredTitle as string}</h2>
        <p>{page.featuredDescription as string}</p>
        <span className="vid-meta">{page.featuredMeta as string}</span>
      </div>
    </>
  );

  return (
    <PageShell global={global} currentPath="/videos/">
      <section className="container page-head page-head-row">
        <div className="page-head-copy">
          <p className="eyebrow">{page.eyebrow as string}</p>
          <h1 className="page-title">{page.title as string}</h1>
          <p className="page-intro">{page.intro as string}</p>
        </div>
        {channelCta && (
          <a href={withBase(channelCta.url)} className="btn btn-secondary">
            {channelCta.label}
          </a>
        )}
      </section>

      <section className="container">
        {featuredUrl ? (
          <a href={withBase(featuredUrl)} className="vid-featured" id="featured">{featuredBody}</a>
        ) : (
          <div className="vid-featured planned" id="featured">{featuredBody}</div>
        )}
      </section>

      <VideoLibrary
        videos={collections.videos}
        footNote={page.footNote as string}
        footLink={page.footLink as Link | undefined}
      />
    </PageShell>
  );
}
