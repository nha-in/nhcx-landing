import type { Metadata } from 'next';
import { withBase } from '@/lib/paths';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import PmjayHero from '@/components/pmjay/PmjayHero';
import PmjayOnNhcx from '@/components/pmjay/PmjayOnNhcx';
import PmjayBenefits from '@/components/pmjay/PmjayBenefits';
import PmjayChanged from '@/components/pmjay/PmjayChanged';
import PmjayTravels from '@/components/pmjay/PmjayTravels';
import PmjaySides from '@/components/pmjay/PmjaySides';
import PmjayCta from '@/components/pmjay/PmjayCta';

export const metadata: Metadata = {
  title: 'PM-JAY on NHCX · National Health Claims Exchange',
  description: 'What PM-JAY is, and what its claims look like once they travel over NHCX: the cover, the benefits, what a hospital does differently, and how a scheme claim travels.',
  icons: { icon: withBase('/assets/animation/pmjay.svg') },
};

/*
 * PM-JAY: the scheme's own page, built the way the DevTools and AI Skill
 * pages are: its words in lib/pmjay-copy.ts, small section components, and
 * the shared page pieces in styles/tools.css (`.tl`), with what only this
 * page has in styles/pmjay.css (`.pj`). On this page the primary colour is
 * the scheme's orange.
 */
export default function PmjayPage() {
  return (
    <>
      <Header current="/pmjay/" />
      <main className="tl pj">
        <PmjayHero />
        <PmjayOnNhcx />
        <PmjayBenefits />
        <PmjayChanged />
        <PmjayTravels />
        <PmjaySides />
        <PmjayCta />
      </main>
      <Footer />
    </>
  );
}
