import type { SkillCopy } from '@/lib/site-copy';
import Rich from '@/components/Rich';
import { withBase } from '@/lib/paths';
import CopyButton from './CopyButton';

/**
 * The closing band: the one command that installs the skill, and the three
 * places to go next. Dark like the rest of the page, with the same drifting
 * lights as the hero so the page closes where it opened.
 */
export default function SkillClose({
  copy,
  install,
  skillUrl,
  applyHref,
  consoleUrl,
}: {
  copy: SkillCopy['close'];
  install: string;
  skillUrl: string;
  applyHref: string;
  consoleUrl: string;
}) {
  return (
    <section className="sk-close dk-band" aria-labelledby="sk-close-title">
      <span className="dk-aurora" aria-hidden="true" />
      <div className="container sk-close-inner">
        <p className="dk-eyebrow">{copy.eyebrow}</p>
        <h2 id="sk-close-title" className="dk-title sk-close-heading">
          {copy.titleLead} <span>{copy.titleAccent}</span>
        </h2>
        <p className="dk-lede">{copy.lede}</p>
        <div className="dk-cmd">
          <code>{install}</code>
          <CopyButton text={install} />
        </div>
        <div className="dk-cta">
          <a href={skillUrl} className="dk-btn dk-btn-primary" target="_blank" rel="noopener noreferrer">
            {copy.skillCtaLabel}
          </a>
          <a href={`${consoleUrl}/`} className="dk-btn" rel="noopener">
            {copy.consoleCtaLabel}
          </a>
          <a href={withBase(applyHref)} className="dk-btn">
            {copy.applyCtaLabel}
          </a>
        </div>
        <p className="dk-note">
          <Rich parts={copy.noteParts} />
        </p>
      </div>
    </section>
  );
}
