import { getContent, type SectionsFaq, type SectionsHero } from '@/lib/content';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import Reveal from '@/components/landing/Reveal';
import Hero from '@/components/landing/Hero';
import Banner from '@/components/landing/Banner';
import Guarantees from '@/components/landing/Guarantees';
import Understand, { Glance } from '@/components/landing/Understand';
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
 * The landing page follows the "NHCX Homepage" design: its sections and
 * copy live in components/landing. Two things still come from the CMS
 * landing single type — the apply link of the hero, and the FAQ questions
 * (grouped by topic) — so editors keep those without a redeploy. The other
 * landing sections the CMS carries are synced but no longer rendered.
 */
export default function Home() {
  const { global, landing } = getContent();
  const sections = landing.sections ?? [];
  const hero = sections.find((s): s is SectionsHero => s.__component === 'sections.hero');
  const faq = sections.find((s): s is SectionsFaq => s.__component === 'sections.faq');
  const applyHref = hero?.primaryCta?.url || global.applyCta?.url || '/apply/';
  const console_ = consoleUrl(global);

  return (
    <PageShell global={global} currentPath="/">
      <Reveal />
      <Hero applyHref={applyHref} />
      <Banner />
      <Guarantees />
      <Glance />
      <Benefits />
      <HowItWorks />
      <Journey />
      <Onboarding />
      <Understand />
      <Tools consoleUrl={console_} />
      <Integration consoleUrl={console_} />
      <SandboxCta applyHref={applyHref} />
      <Specs />
      {faq && <Faq title={faq.title || 'FAQ'} items={faq.items ?? []} />}
    </PageShell>
  );
}
