import type { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { SkillClose, SkillHero, SkillKnows, SkillLoop, SkillPrompts, SkillRules } from '@/components/skill/SkillSections';

export const metadata: Metadata = {
  title: 'NHCX is just one prompt away · AI skill',
  description: 'An agent skill that teaches your coding assistant the National Health Claim Exchange: the protocol, the FHIR bundles, the envelope and the sandbox, so an integration can be asked for rather than assembled by hand.',
};

/*
 * The AI skill page, "NHCX is one prompt away", carried over from the
 * previous site on this site's theme: an agent skill that carries the
 * protocol, the FHIR profiles, the envelope and the sandbox into whichever
 * assistant a developer already codes with.
 */
export default function SkillPage() {
  return (
    <>
      <Header current="/skill/" />
      <main className="tl">
        <SkillHero />
        <SkillLoop />
        <SkillKnows />
        <SkillPrompts />
        <SkillRules />
        <SkillClose />
      </main>
      <Footer />
    </>
  );
}
