import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { PageShell } from '@/components/SiteChrome';
import ApplyForm from '@/components/pages/ApplyForm';

export function generateMetadata(): Metadata {
  const { pages } = getContent();
  return {
    title: pages.apply.seo?.metaTitle ?? 'Apply for Sandbox Access — NHCX',
    description: pages.apply.seo?.metaDescription ?? '',
  };
}

export default function ApplyPage() {
  const { global, pages } = getContent();
  const page = pages.apply;

  return (
    <PageShell global={global} currentPath="/apply/">
      <section className="container page-head">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1 className="page-title">{page.title}</h1>
        <p className="page-intro">{page.intro}</p>
      </section>

      <section className="container ap-wrap">
        <ApplyForm page={page} />
        <aside className="ap-aside">
          <div className="news-aside-card" id="privacy">
            <b>{page.privacyTitle}</b>
            <span className="ap-legal">{page.privacyText}</span>
          </div>
          <div className="news-aside-card" id="terms">
            <b>{page.termsTitle}</b>
            <span className="ap-legal">{page.termsText}</span>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
