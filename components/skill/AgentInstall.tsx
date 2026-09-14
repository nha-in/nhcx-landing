'use client';

import { useState } from 'react';
import CopyButton from '@/components/shared/CopyButton';
import { CLOSE } from '@/lib/skill-copy';

/*
 * One install line per NHCX skill: pick the part of the exchange, copy its
 * `npx skills add` command. The skills installer sets the skill up for every
 * coding agent it finds in the project.
 */
export default function AgentInstall() {
  const [key, setKey] = useState(CLOSE.skills[0].key);
  const skill = CLOSE.skills.find((s) => s.key === key) ?? CLOSE.skills[0];

  return (
    <div className="sk-agents">
      <div className="sk-agent-tabs" role="tablist" aria-label={CLOSE.tabsLabel}>
        {CLOSE.skills.map((s) => (
          <button key={s.key} type="button" role="tab" aria-selected={s.key === key} className={`sk-agent${s.key === key ? ' is-on' : ''}`} onClick={() => setKey(s.key)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="tl-cmd" role="tabpanel" aria-label={`${CLOSE.installFor} ${skill.label}`}>
        <code>{skill.command}</code>
        <CopyButton text={skill.command} />
      </div>
    </div>
  );
}
