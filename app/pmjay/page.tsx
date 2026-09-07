import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import PmjayHero from '@/components/pages/PmjayHero';
import { PmjayChanged, PmjayFacts, PmjayJourney, PmjaySides, PmjayStart } from '@/components/pages/PmjaySections';
import '@/styles/dark.css';
import '@/styles/pmjay.css';

/**
 * PM-JAY.
 *
 * The scheme's own page on this site: what PM-JAY is, and what its claims
 * look like once they travel over NHCX rather than over a per-payer portal.
 * It is written for the two ends of a scheme claim — the empanelled hospital
 * that raises it and the State Health Agency or insurer that settles it —
 * and it sends both to the same sandbox as every other participant.
 *
 * The page describes what the exchange is for, not a migration that has
 * happened: it carries no rollout dates, no adoption figures and no claim
 * volumes, because those belong to the programme to state and to change.
 * pmjay.gov.in remains the scheme's own front door and the hero links to it.
 *
 * The copy is `pmjay` in content/site.json, like the landing sections and the
 * DevTools page, rather than a Strapi single type: it is a designed page, and
 * the CMS (cms/app.py) edits that file directly.
 */

function pmjay() {
  const { global } = getContent();
  const console_ = consoleUrl(global);
  return { global, console_, copy: getSiteCopy(console_, global.docsUrl).pmjay };
}

export function generateMetadata(): Metadata {
  const { copy } = pmjay();
  return { title: copy.meta.title, description: copy.meta.description };
}

export default function PmjayPage() {
  const { global, console_, copy } = pmjay();
  const applyHref = global.applyCta?.url || '/apply/';

  return (
    <PageShell global={global} currentPath="/pmjay/">
      <PmjayHero copy={copy.hero} applyHref={applyHref} />
      <PmjayFacts copy={copy.facts} />
      <PmjayChanged copy={copy.changed} />
      <PmjayJourney copy={copy.journey} />
      <PmjaySides copy={copy.sides} />
      <PmjayStart copy={copy.start} applyHref={applyHref} consoleUrl={console_} />
    </PageShell>
  );
}
