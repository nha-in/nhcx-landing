'use client';

import { useState } from 'react';
import CopyButton from '@/components/shared/CopyButton';
import { CLOSE, SKILL_URL } from '@/lib/skill-copy';

/*
 * One install line per coding agent. The first tab is the generic one: the
 * skills installer finds the agents in a project and installs for each. The
 * others clone the skill into the folder that agent reads skills from. Copy
 * copies the plain command.
 */
export default function AgentInstall() {
  const [key, setKey] = useState(CLOSE.agents[0].key);
  const agent = CLOSE.agents.find((a) => a.key === key) ?? CLOSE.agents[0];
  const command = agent.command ?? `git clone ${SKILL_URL} ${agent.folder}`;

  return (
    <div className="sk-agents">
      <div className="sk-agent-tabs" role="tablist" aria-label="Coding agent">
        {CLOSE.agents.map((a) => (
          <button key={a.key} type="button" role="tab" aria-selected={a.key === key} className={`sk-agent${a.key === key ? ' is-on' : ''}`} onClick={() => setKey(a.key)}>
            {a.label}
          </button>
        ))}
      </div>
      <div className="tl-cmd" role="tabpanel" aria-label={`Install for ${agent.label}`}>
        <code>{command}</code>
        <CopyButton text={command} />
      </div>
      <p className="sk-agent-note">
        {agent.folder ? (
          <>
            {agent.label} reads skills from <code>{agent.folder.replace(/[^/]+$/, '')}</code> in your repository.
          </>
        ) : (
          agent.note
        )}
      </p>
    </div>
  );
}
