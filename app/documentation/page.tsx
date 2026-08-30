import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { PageShell } from '@/components/SiteChrome';
import { DocsReader } from '@/components/docs/DocsReader';
import '@/styles/docs.css';

/**
 * Documentation.
 *
 * The page is the corpus itself — the same documentation set the HCX Kit
 * console reads, staged into public/docs at build time — with the NHCX
 * assistant docked beside it. The assistant answers only from that corpus and
 * cites the pages it used, and those citations open in the reader on the left,
 * which is why the two live on one page rather than two.
 *
 * Everything below the chrome is a client component: the corpus is fetched at
 * runtime rather than bundled, so a rebuilt docs release can be dropped in
 * without rebuilding the site. The page has no CMS single type of its own —
 * its title and description are fixed here, and everything else is the corpus.
 */

export function generateMetadata(): Metadata {
  return {
    title: 'Documentation — NHCX',
    description:
      'The NHCX documentation set — claim flows, endpoint specifications, JWE header keys and mapping rules — with an assistant that answers from it.',
  };
}

export default function DocumentationPage() {
  const { global } = getContent();

  return (
    <PageShell global={global} currentPath="/documentation/" wide>
      <DocsReader />
    </PageShell>
  );
}
