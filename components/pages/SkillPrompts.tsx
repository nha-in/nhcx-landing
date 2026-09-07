import type { SkillCopy } from '@/lib/site-copy';
import CopyButton from './CopyButton';

/**
 * "Prompts to try": whole tasks, not questions.
 *
 * Each is copyable, because the point of the page is that a reader can take
 * one line from here into their own editor and get an integration out of it.
 */
export default function SkillPrompts({ copy }: { copy: SkillCopy['prompts'] }) {
  return (
    <section className="dk-section" aria-labelledby="sk-prompts-title">
      <div className="container">
        <div className="dk-head">
          <p className="dk-eyebrow">{copy.eyebrow}</p>
          <h2 id="sk-prompts-title">
            {copy.titleLead} <span>{copy.titleAccent}</span>
          </h2>
          <p>{copy.text}</p>
        </div>
        <ul className="sk-prompts">
          {copy.items.map((prompt) => (
            <li key={prompt} className="sk-prompt">
              <span className="sk-prompt-text">{prompt}</span>
              <CopyButton text={prompt} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
