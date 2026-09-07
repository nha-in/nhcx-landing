import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import GetStarted from '@/components/pages/GetStarted';
import '@/styles/get-started.css';

/**
 * Get started.
 *
 * The hero used to send a first-time reader straight at the application form,
 * which asks for a role before anything has explained what the roles do. This
 * page sits in between: it asks which side of a claim you are on and then
 * shows the four stages written for that side, ending at the form.
 *
 * Every word is `getStarted` in content/site.json.
 */
function page() {
  const { global } = getContent();
  return getSiteCopy(consoleUrl(global), global.docsUrl).getStarted;
}

export function generateMetadata(): Metadata {
  const { meta } = page();
  return { title: meta.title, description: meta.description };
}

export default function GetStartedPage() {
  const { global } = getContent();
  const copy = page();

  return (
    <PageShell global={global} currentPath="/get-started/">
      <section className="gs-hero">
        <div className="container">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.lede}</p>
        </div>
      </section>
      <GetStarted copy={copy} />
    </PageShell>
  );
}
