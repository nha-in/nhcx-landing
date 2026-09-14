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
    skillCtaLabel: string;
    note: string;
    tabsLabel: string;
    installFor: string;
    /* One tab per NHCX skill, each with its `npx skills add` line. */
    skills: Array<{ key: string; label: string; command: string }>;
  };
};

const c = section as SkillContent;

export const SKILL_URL = c.url;
export const { meta: META, hero: HERO, terminal: TERMINAL, loop: LOOP, knows: KNOWS, prompts: PROMPTS, rules: RULES, close: CLOSE } = c;
