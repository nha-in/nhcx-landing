import { useId, useState } from 'react'
import { agentInstall, type AgentCommand } from '../content'
import { ARROW_OUT } from './icons'

const { skill: SKILL, plugin: PLUGIN, mcp: MCP } = agentInstall

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

/** navigator.clipboard needs a secure context, so plain http falls back to a
 * hidden textarea and execCommand. */
async function copyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')
  const copy = async () => {
    setState((await copyText(text)) ? 'done' : 'failed')
    window.setTimeout(() => setState('idle'), 1600)
  }
  return (
    <button type="button" className="sbx-install-copy" onClick={copy} aria-live="polite">
      {agentInstall.copy[state]}
    </button>
  )
}

function Tabs<T extends { key: string; label: string }>({
  items,
  value,
  onChange,
  label,
}: {
  items: T[]
  value: string
  onChange: (key: string) => void
  label: string
}) {
  return (
    <div className="sbx-install-tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={item.key === value}
          className={item.key === value ? 'is-on' : undefined}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/** A line to copy: a shell command, a config file's contents under its name,
 * or a line to paste into an agent. */
function Command({ text, file, prompt }: { text: string; file?: string; prompt?: boolean }) {
  return (
    <div className={`sbx-install-cmd${file ? ' is-file' : ''}${prompt ? ' is-prompt' : ''}`}>
      {file && <span className="sbx-install-file">{file}</span>}
      <code>{text}</code>
      <CopyButton text={text} />
    </div>
  )
}

function BlockHead({
  index,
  block,
  titleId,
}: {
  index: number
  block: { label: string; title: string; text: string; badge?: string }
  titleId: string
}) {
  return (
    <header className="sbx-install-head">
      <p className="sbx-install-tag">
        <span>
          {String(index).padStart(2, '0')} · {block.label}
        </span>
        {block.badge && <span className="sbx-install-badge">{block.badge}</span>}
      </p>
      <h4 id={titleId}>{block.title}</h4>
      <p>{block.text}</p>
    </header>
  )
}

function SkillBlock() {
  const titleId = useId()
  const [skillKey, setSkillKey] = useState(SKILL.skills[0].key)
  const [agentKey, setAgentKey] = useState(SKILL.agents[0].key)
  const skill = SKILL.skills.find((s) => s.key === skillKey) ?? SKILL.skills[0]
  const agent = SKILL.agents.find((a) => a.key === agentKey) ?? SKILL.agents[0]

  return (
    <article className="sbx-install-block sbx-install-block--wide" aria-labelledby={titleId}>
      <BlockHead index={1} block={SKILL} titleId={titleId} />
      <Tabs items={SKILL.skills} value={skill.key} onChange={setSkillKey} label={agentInstall.skillsLabel} />
      <p className="sbx-install-builds">
        <code>{skill.name}</code> {skill.builds}
      </p>
      <div className="sbx-install-ways">
        <div>
          <h5>{SKILL.npx.title}</h5>
          <p>{SKILL.npx.text}</p>
          <Command text={fill(SKILL.npx.command, { skill: skill.name })} />
        </div>
        <div>
          <h5>{SKILL.git.title}</h5>
          <p>{SKILL.git.text}</p>
          <Tabs items={SKILL.agents} value={agent.key} onChange={setAgentKey} label={agentInstall.agentsLabel} />
          <Command text={fill(SKILL.git.command, { skill: skill.name, dir: agent.dir })} />
        </div>
      </div>
      <a className="sbx-install-link" href={SKILL.github.href} target="_blank" rel="noopener noreferrer">
        {SKILL.github.label} <span aria-hidden="true">{ARROW_OUT}</span>
      </a>
    </article>
  )
}

function AgentBlock({
  index,
  block,
  values,
  featured,
}: {
  index: number
  block: { label: string; title: string; text: string; badge?: string; agents: AgentCommand[] }
  values?: Record<string, string>
  featured?: boolean
}) {
  const titleId = useId()
  const [key, setKey] = useState(block.agents[0].key)
  const agent = block.agents.find((a) => a.key === key) ?? block.agents[0]
  return (
    <article className={`sbx-install-block${featured ? ' is-featured' : ''}`} aria-labelledby={titleId}>
      <BlockHead index={index} block={block} titleId={titleId} />
      <Tabs items={block.agents} value={agent.key} onChange={setKey} label={agentInstall.agentsLabel} />
      <Command text={values ? fill(agent.command, values) : agent.command} file={agent.file} prompt={agent.prompt} />
      {agent.text && <p className="sbx-install-note">{agent.text}</p>}
    </article>
  )
}

export function AgentInstall() {
  return (
    <div className="sbx-install">
      <div className="sbx-install-intro">
        <h3>{agentInstall.title}</h3>
        <p>{agentInstall.description}</p>
      </div>
      <div className="sbx-install-blocks">
        <SkillBlock />
        <AgentBlock index={2} block={PLUGIN} />
        <AgentBlock index={3} block={MCP} values={{ name: MCP.name, url: MCP.url }} featured />
      </div>
      <p className="sbx-install-footnote">{agentInstall.note}</p>
    </div>
  )
}
