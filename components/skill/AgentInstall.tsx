'use client';

import { useState } from 'react';
import CopyButton from '@/components/shared/CopyButton';
import { CLOSE, SKILL_URL } from '@/lib/skill-copy';

/*
 * Three ways to bring NHCX into a coding agent, one block each:
 *   Skill  - one skill, by git alone (per agent), by `npx skills`, or from GitHub
 *   Plugin - all seven skills at once, with the install line for each agent
 *   MCP    - the docs server, with the connect line (or config file) for each agent
 */

const { skill: SKILL, plugin: PLUGIN, mcp: MCP } = CLOSE;

/* The docs catalogue's heading id for a use case, as its page builds one: "B1 Check coverage eligibility" -> "b1-check-coverage-eligibility". */
const anchorOf = (code: string, title: string) =>
  `${code} ${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

function Tabs<T extends { key: string; label: string }>({ items, value, onChange, label }: { items: T[]; value: string; onChange: (key: string) => void; label: string }) {
  return (
    <div className="sk-agent-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button key={item.key} type="button" role="tab" aria-selected={item.key === value} className={`sk-agent${item.key === value ? ' is-on' : ''}`} onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* A line to copy: a shell command, a config file's contents under its name, or a line to paste into an agent. */
function Command({ text, file, prompt, label }: { text: string; file?: string; prompt?: boolean; label: string }) {
  return (
    <div className={`tl-cmd${file ? ' is-file' : ''}${prompt ? ' is-prompt' : ''}`} role="tabpanel" aria-label={label}>
      {file && <span className="sk-cmd-file">{file}</span>}
      <code>{text}</code>
      <CopyButton text={text} />
    </div>
  );
}

function BlockHead({ index, block }: { index: number; block: { label: string; title: string; text: string; badge?: string } }) {
  return (
    <header className="sk-block-head">
      <span className="sk-block-tag">
        {String(index).padStart(2, '0')} · {block.label}
      </span>
      {block.badge && <span className="sk-block-badge">{block.badge}</span>}
      <h3>{block.title}</h3>
      <p>{block.text}</p>
    </header>
  );
}

/* A use-case code that shows its title on hover or focus and opens the use case on GitHub. */
function UseCase({ code }: { code: string }) {
  const uc = SKILL.usecases[code];
  if (!uc) return <span className="sk-uc">{code}</span>;
  const href = fill(SKILL.usecaseLinks.href, { anchor: anchorOf(code, uc.title) });
  const series = SKILL.series[code[0]];
  return (
    <a className="sk-uc" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${code}: ${uc.title}. ${SKILL.usecaseLinks.hint}`}>
      {code}
      <span className="sk-uc-tip" role="tooltip">
        <span className="sk-uc-series">
          {code}
          {series && ` · ${series}`}
        </span>
        <b>{uc.title}</b>
        <span>{uc.text}</span>
        <span className="sk-uc-go">
          {SKILL.usecaseLinks.hint} <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  );
}

/* The seven skills: what each builds and its use cases. A skill's name picks it for the install commands below. */
function SkillTable({ value, onPick }: { value: string; onPick: (key: string) => void }) {
  const t = SKILL.table;
  return (
    <table className="sk-table">
      <thead>
        <tr>
          <th scope="col">{t.skill}</th>
          <th scope="col">{t.builds}</th>
          <th scope="col">{t.usecases}</th>
        </tr>
      </thead>
      <tbody>
        {SKILL.skills.map((s) => (
          <tr key={s.key} className={s.key === value ? 'is-on' : undefined}>
            <th scope="row" data-label={t.skill}>
              <button type="button" className="sk-table-skill" aria-pressed={s.key === value} aria-label={`${t.pick} ${s.name}`} onClick={() => onPick(s.key)}>
                {s.name}
              </button>
            </th>
            <td data-label={t.builds}>{s.builds}</td>
            <td data-label={t.usecases}>
              <span className="sk-ucs">
                {s.usecases.map((code) => (
                  <UseCase key={code} code={code} />
                ))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SkillBlock() {
  const [skillKey, setSkillKey] = useState(SKILL.skills[0].key);
  const [agentKey, setAgentKey] = useState(SKILL.agents[0].key);
  const skill = SKILL.skills.find((s) => s.key === skillKey) ?? SKILL.skills[0];
  const agent = SKILL.agents.find((a) => a.key === agentKey) ?? SKILL.agents[0];

  return (
    <article className="sk-block">
      <BlockHead index={1} block={SKILL} />
      <SkillTable value={skill.key} onPick={setSkillKey} />
      <Tabs items={SKILL.skills} value={skill.key} onChange={setSkillKey} label={CLOSE.tabsLabel} />
      <ol className="sk-ways">
        <li className="sk-way">
          <h4>{SKILL.git.title}</h4>
          <p>{SKILL.git.text}</p>
          <Tabs items={SKILL.agents} value={agent.key} onChange={setAgentKey} label={CLOSE.agentsLabel} />
          <Command text={fill(SKILL.git.command, { skill: skill.name, dir: agent.dir })} label={`${CLOSE.installFor} ${skill.label}, ${agent.label}`} />
        </li>
        <li className="sk-way">
          <h4>{SKILL.npx.title}</h4>
          <p>{SKILL.npx.text}</p>
          <Command text={skill.command} label={`${CLOSE.installFor} ${skill.label}`} />
        </li>
        <li className="sk-way">
          <h4>{SKILL.github.title}</h4>
          <p>{SKILL.github.text}</p>
          <a className="btn btn--outline sk-way-link" href={SKILL_URL} target="_blank" rel="noopener noreferrer">
            {SKILL.github.label} <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ol>
    </article>
  );
}

function PluginBlock() {
  const [key, setKey] = useState(PLUGIN.agents[0].key);
  const agent = PLUGIN.agents.find((a) => a.key === key) ?? PLUGIN.agents[0];
  return (
    <article className="sk-block">
      <BlockHead index={2} block={PLUGIN} />
      <Tabs items={PLUGIN.agents} value={agent.key} onChange={setKey} label={CLOSE.agentsLabel} />
      {agent.command && <Command text={agent.command} prompt={agent.prompt} label={`${CLOSE.installFor} ${PLUGIN.label}, ${agent.label}`} />}
      {agent.text && <p className="sk-block-note">{agent.text}</p>}
    </article>
  );
}

function McpBlock() {
  const [key, setKey] = useState(MCP.agents[0].key);
  const agent = MCP.agents.find((a) => a.key === key) ?? MCP.agents[0];
  return (
    <article className="sk-block is-featured">
      <BlockHead index={3} block={MCP} />
      <Tabs items={MCP.agents} value={agent.key} onChange={setKey} label={CLOSE.agentsLabel} />
      <Command text={fill(agent.command, { name: MCP.name, url: MCP.url })} file={agent.file} label={`${MCP.label}, ${agent.label}`} />
    </article>
  );
}

export default function AgentInstall() {
  return (
    <div className="sk-blocks">
      <SkillBlock />
      <PluginBlock />
      <McpBlock />
    </div>
  );
}
