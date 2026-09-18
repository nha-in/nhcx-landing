import section from '@/content/site.yaml?skill';
import type { Meta } from '@/lib/site-copy';

/*
 * Every word and link on the AI Skill page. They live in content/site.yaml
 * (`skill`); this file gives them their types. The repository link and the
 * install lines point at the NHCX skills in nha-in/docs.
 */

export type StepIcon = 'database' | 'layout' | 'server' | 'flask' | 'list' | 'code' | 'check' | 'play' | 'shield' | 'send' | 'receipt' | 'file' | 'search' | 'bug' | 'wrench';
type Step = { icon: StepIcon; title: string; doing: string; done: string };
/* One request the hero terminal plays: the prompt, a streamed reply, four step cards and a ready line. */
type Transcript = { prompt: string; reply: string; steps: Step[]; ready: { title: string; summary: string } };
type Heading = { titleLead: string; titleAccent: string };
type Block = { label: string; title: string; text: string; badge?: string };
type Tab = { key: string; label: string };
type Part = { title: string; text: string };

type SkillContent = {
  meta: Meta;
  url: string;
  hero: Heading & { kicker: string; lede: string; skillCtaLabel: string };
  terminal: { hint: string; transcripts: Transcript[] };
  loop: Heading & { text: string; ringNodes: string[]; phases: Array<{ title: string; text: string }> };
  knows: Heading & {
    lede: string;
    /* The skill's build steps (skills/nhcx-builder), in six blocks. */
    stages: Array<{ range: string; title: string; text: string }>;
    carriesTitle: string;
    carries: Array<{ title: string; text: string }>;
  };
  prompts: Heading & { text: string; items: string[] };
  rules: Heading & { text: string; items: Array<{ title: string; text: string }> };
  close: Heading & {
    lede: string;
    note: string;
    tabsLabel: string;
    agentsLabel: string;
    installFor: string;
    /* Block 1: one skill, by git alone, by `npx skills`, or from GitHub. */
    skill: Block & {
      skills: Array<{ key: string; label: string; name: string; command: string; builds: string; usecases: string[] }>;
      table: { skill: string; builds: string; usecases: string; pick: string };
      /* `href` holds {anchor}: the use case's heading on the docs catalogue page. */
      usecaseLinks: { href: string; hint: string };
      /* The use-case family by the code's first letter. */
      series: Record<string, string>;
      usecases: Record<string, { title: string; text: string }>;
      /* Where each agent reads project skills from. */
      agents: Array<Tab & { dir: string }>;
      /* `command` holds {skill} and {dir}. */
      git: Part & { command: string };
      npx: Part;
      github: Part & { label: string };
    };
    /* Block 2: the plugin, with an install line (and a note) per agent. */
    /* `prompt` marks a line to paste into the agent rather than a shell command. */
    plugin: Block & { agents: Array<Tab & { command?: string; prompt?: boolean; text?: string }> };
    /* Block 3: the docs MCP server; each `command` holds {name} and {url}, and `file` marks a config file. */
    mcp: Block & { name: string; url: string; agents: Array<Tab & { command: string; file?: string }> };
  };
};

const c = section as SkillContent;

export const SKILL_URL = c.url;
export const { meta: META, hero: HERO, terminal: TERMINAL, loop: LOOP, knows: KNOWS, prompts: PROMPTS, rules: RULES, close: CLOSE } = c;
