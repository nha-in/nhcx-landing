import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import { getSiteCopy } from '@/lib/site-copy';
import { consoleUrl } from '@/lib/links';
import { PageShell } from '@/components/SiteChrome';
import SkillHero from '@/components/pages/SkillHero';
import SkillLoop from '@/components/pages/SkillLoop';
import { SkillKnows, SkillRules } from '@/components/pages/SkillKnows';
import SkillPrompts from '@/components/pages/SkillPrompts';
import SkillClose from '@/components/pages/SkillClose';
import '@/styles/dark.css';
import '@/styles/skill.css';

/**
 * The AI skill page — "NHCX is one prompt away".
 *
 * Where the DevTools page is about the two tools a person drives, this one is
 * about the exchange being reachable by asking for it: an agent skill that
 * carries the protocol, the FHIR profiles, the envelope and the sandbox into
 * whichever assistant a developer already codes with. It sits on the dark
 * surface the site shares (styles/dark.css) with what only this page needs on
 * top of it (styles/skill.css).
 *
 * Every word — the headline, the four terminal transcripts, the prompts, the
 * install line and the repository they point at — is `skill` in
 * content/site.json, editable in the CMS (cms/app.py, "Page copy").
 *
 * The repository and the install command are still placeholders: point
 * `skill.skillUrl` and `skill.install` at the real distribution before this
 * page is announced. Nothing else on the page depends on what they turn out
 * to be.
 */
function skill() {
  const { global } = getContent();
  const console_ = consoleUrl(global);
  return { global, console_, copy: getSiteCopy(console_, global.docsUrl).skill };
}

export function generateMetadata(): Metadata {
  const { copy } = skill();
  return { title: copy.meta.title, description: copy.meta.description };
}

export default function SkillPage() {
  const { global, console_, copy } = skill();
  const applyHref = global.applyCta?.url || '/apply/';

  return (
    <PageShell global={global} currentPath="/skill/">
      <div className="dark-page">
        <SkillHero copy={copy.hero} terminal={copy.terminal} skillUrl={copy.skillUrl} consoleUrl={console_} />
        <SkillLoop copy={copy.loop} />
        <SkillKnows copy={copy.knows} />
        <SkillPrompts copy={copy.prompts} />
        <SkillRules copy={copy.rules} />
        <SkillClose
          copy={copy.close}
          install={copy.install}
          skillUrl={copy.skillUrl}
          applyHref={applyHref}
          consoleUrl={console_}
        />
      </div>
    </PageShell>
  );
}
