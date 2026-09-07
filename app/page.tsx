import { getContent, type SectionsFaq, type SectionsHero } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { consoleUrl } from '@/lib/links';
import { getStats } from '@/lib/stats-file';
import { PageShell } from '@/components/SiteChrome';
import Reveal from '@/components/landing/Reveal';
import Hero from '@/components/landing/Hero';
import Understand from '@/components/landing/Understand';
import Stats from '@/components/landing/Stats';
import Onboarding from '@/components/landing/Onboarding';
import Specs from '@/components/landing/Specs';
import Benefits from '@/components/landing/Benefits';
import HowItWorks from '@/components/landing/HowItWorks';
import Journey from '@/components/landing/Journey';
import Tools from '@/components/landing/Tools';
import Integration from '@/components/landing/Integration';
import SandboxCta from '@/components/landing/SandboxCta';
import Faq from '@/components/landing/Faq';
import '@/styles/landing.css';

/**
 * Home.
 *
 * The landing page follows the "NHCX Homepage" design: its sections live in
 * components/landing and every word they render comes from `home` in
 * content/site.json, which the CMS edits. Two things still come from the
 * Strapi landing single type — the apply link of the hero, and the FAQ
 * questions (grouped by topic) — so editors keep those without a redeploy.
 * The other landing sections the CMS carries are synced but no longer
 * rendered.
 */
export default function Home() {
  const { global, landing } = getContent();
  const sections = landing.sections ?? [];
  const hero = sections.find((s): s is SectionsHero => s.__component === 'sections.hero');
  const faq = sections.find((s): s is SectionsFaq => s.__component === 'sections.faq');
  const applyHref = hero?.primaryCta?.url || global.applyCta?.url || '/apply/';
  const console_ = consoleUrl(global);
  const copy = getSiteCopy(console_, global.docsUrl).home;
  // Production figures from the NHA dashboard (npm run sync:stats); null
  // until one has been synced, and the section simply does not render.
  const stats = getStats();

  return (
    <PageShell global={global} currentPath="/">
      <Reveal />
      <Hero copy={copy.hero} />
      {stats && <Stats copy={copy.stats} stats={stats} />}
      <Benefits copy={copy.benefits} />
      <HowItWorks copy={copy.howItWorks} />
      <Journey copy={copy.journey} />
      <Onboarding copy={copy.onboarding} />
      <Understand copy={copy.understand} />
      <Tools copy={copy.tools} />
      <Integration copy={copy.integration} />
      <SandboxCta copy={copy.sandbox} applyHref={applyHref} />
      <Specs copy={copy.specs} />
      {faq && <Faq copy={copy.faq} title={faq.title || copy.faq.fallbackTitle} items={faq.items ?? []} />}
    </PageShell>
  );
}
