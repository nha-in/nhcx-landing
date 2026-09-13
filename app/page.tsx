import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import WhyBenefits from '@/components/landing/WhyBenefits';
import Stats from '@/components/landing/Stats';
import VideoBanner from '@/components/landing/VideoBanner';
import HowItWorks from '@/components/landing/HowItWorks';
import AiSection from '@/components/landing/AiSection';
import Journey from '@/components/landing/Journey';
import InsideTool from '@/components/landing/InsideTool';
import Benefits from '@/components/landing/Benefits';
import Faq from '@/components/landing/Faq';
import SandboxCta from '@/components/landing/SandboxCta';
import Footer from '@/components/landing/Footer';
import { getStats } from '@/lib/stats-file';

export default function HomePage() {
  const stats = getStats();
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats stats={stats} />
        <WhyBenefits />
        {/* The video banner is hidden for now. */}
        {false && <VideoBanner />}
        <HowItWorks />
        <AiSection />
        <Journey />
        <InsideTool />
        <Benefits />
        <Faq />
        <SandboxCta />
      </main>
      <Footer />
    </>
  );
}
