/*
 * Every word on the AI Skill page, carried over from the previous site
 * (`skill` in content/site.json there). The repository and install line are
 * the previous site's; point them at the real distribution before the page
 * is announced.
 */

export const SKILL_URL = 'https://github.com/nha-in/nhcx-skill';

export const HERO = {
  kicker: 'Agentic AI for NHCX',
  titleLead: 'NHCX is',
  titleAccent: 'just one prompt away',
  lede: 'An agent skill that teaches the coding assistant you already use what the exchange actually is: its endpoints and callbacks, the FHIR bundle behind each flow, the envelope that carries it, and a sandbox to try the whole thing against. You describe the claim. It writes the integration and proves it.',
  skillCtaLabel: 'Get the skill',
};

export type StepIcon = 'database' | 'layout' | 'server' | 'flask' | 'list' | 'code' | 'check' | 'play' | 'shield' | 'send' | 'receipt' | 'file' | 'search' | 'bug' | 'wrench';
export type Step = { icon: StepIcon; title: string; doing: string; done: string };
export type Transcript = { prompt: string; reply: string; steps: Step[]; ready: { title: string; summary: string } };

/* The hero terminal's requests, played the way the home page's AI demo plays
   its one: the request, a streamed reply, four step cards and a ready line. */
export const TERMINAL = {
  hint: 'Ask anything about NHCX',
  transcripts: [
    {
      prompt: 'Integrate my HMIS with the NHCX sandbox.',
      reply: 'On it. Four steps, and your HMIS is talking to NHCX.',
      steps: [
        { icon: 'database', title: 'Understanding HMIS', doing: 'Reading your schema and workflows', done: '12 entities mapped to FHIR R4' },
        { icon: 'layout', title: 'Adding pages', doing: 'Eligibility, pre-auth, claim, payment', done: '4 pages added to your HMIS' },
        { icon: 'server', title: 'Building backend', doing: 'Wiring the NHCX gateway calls', done: '6 endpoints and callbacks wired' },
        { icon: 'flask', title: 'Running tests', doing: 'Against the NHCX sandbox', done: '38 of 38 tests passed' },
      ],
      ready: { title: 'Integration ready', summary: 'FHIR R4 valid · Encrypted end to end · Sandbox certified' },
    },
    {
      prompt: 'Write an NHCX test script that covers every PM-JAY use case.',
      reply: 'On it. One test for every PM-JAY use case.',
      steps: [
        { icon: 'list', title: 'Listing use cases', doing: 'Reading the PM-JAY flows', done: '5 use cases found' },
        { icon: 'code', title: 'Writing tests', doing: 'One test per use case', done: '5 tests with sandbox fixtures' },
        { icon: 'check', title: 'Adding checks', doing: 'On every callback', done: '20 assertions added' },
        { icon: 'play', title: 'Running the suite', doing: 'Against the NHCX sandbox', done: '5 of 5 passed' },
      ],
      ready: { title: 'Test suite ready', summary: 'tests/pmjay.spec.ts · Runs in CI' },
    },
    {
      prompt: 'Run an end-to-end test against the sandbox payer.',
      reply: 'Running the whole claim journey against the sandbox payer.',
      steps: [
        { icon: 'shield', title: 'Eligibility', doing: 'Asking the sandbox payer', done: 'Coverage active' },
        { icon: 'send', title: 'Pre-authorisation', doing: 'Submitting the request', done: 'Approved in 4.2 seconds' },
        { icon: 'receipt', title: 'Claim and payment', doing: 'Raising the claim', done: 'Payment notice received' },
        { icon: 'file', title: 'Validation', doing: 'Checking every callback', done: 'All FHIR R4 valid' },
      ],
      ready: { title: 'End to end passed', summary: 'Every request and callback saved to nhcx/e2e/' },
    },
    {
      prompt: 'Check why my last request failed and fix it.',
      reply: 'Looking into your last request.',
      steps: [
        { icon: 'search', title: 'Reading the error', doing: 'Decrypting the callback', done: 'Error block found' },
        { icon: 'bug', title: 'Finding the cause', doing: 'Matching the error code', done: 'One bill line had no code' },
        { icon: 'wrench', title: 'Fixing the bundle', doing: 'Coding the product', done: 'Bundle patched' },
        { icon: 'check', title: 'Revalidating', doing: 'Against the FHIR profiles', done: 'Valid, ready to resend' },
      ],
      ready: { title: 'Fixed and revalidated', summary: 'Ready to resend' },
    },
  ] as Transcript[],
};

export const LOOP = {
  titleLead: 'It reads before it writes, and',
  titleAccent: 'runs before it claims',
  text: 'An answer you cannot check is worth little on a network that settles money. The skill works in a loop: study the rule, build the request, test it against the ABDM profiles, run it against the sandbox, and go round again until the flow passes or it can tell you exactly why it will not.',
  ringNodes: ['study', 'build', 'test', 'run'],
  phases: [
    { title: 'Study', text: 'It pulls the part of the specification the task needs: the flow, the endpoints it uses, the profile each bundle has to satisfy. Nothing is answered from memory.' },
    { title: 'Build', text: 'It writes the request in your project, in the language and the shape already there, instead of pasting a sample that assumes somebody else’s stack.' },
    { title: 'Test', text: 'The bundle goes against the ABDM profiles and the envelope against the protocol at your desk, so a malformed claim is caught before it is anyone else’s problem.' },
    { title: 'Run', text: 'It sends to the sandbox, waits for the asynchronous callback, decrypts it and reads it. A failure is the next input rather than the end of the attempt.' },
  ],
};

/* What the skill is, read from the skill itself (skills/nhcx-builder): a
   ladder of eleven gated stages, and the references each stage reads. */
export type LadderStage = { n: number; title: string; writes: string; gate: string; modules?: number };

export const KNOWS: {
  titleLead: string;
  titleAccent: string;
  lede: string;
  phases: Array<{ title: string; stages: LadderStage[] }>;
  gateLabel: string;
  carriesTitle: string;
  carries: Array<{ title: string; text: string }>;
  note: string;
} = {
  titleLead: 'A ladder, not a chat.',
  titleAccent: 'Eleven stages, each closed on evidence',
  lede: 'Point the skill at a working HMIS and it adds a claims module beside it, or at an empty folder and it builds a claims desk of its own. Either way it climbs the same eleven stages. Each one reads the stage before it, writes one file into nhcx-build/ in your project, and ends at a gate that closes only on evidence: a file, a line, a command and its output.',
  phases: [
    {
      title: 'Agree',
      stages: [
        { n: 1, title: 'Idea', writes: '1-idea.md', gate: 'The mode, the payers and the scope, agreed with you' },
        { n: 2, title: 'Planning', writes: '2-planning.md', gate: 'Every later stage has an owner, an estimate and a test' },
      ],
    },
    {
      title: 'Understand',
      stages: [
        { n: 3, title: 'Discovery', writes: '3-discovery.md', gate: 'Every answer points at the file or table that proves it' },
        { n: 4, title: 'Flow and data mapping', writes: '4-flow-data-mapping.md', gate: 'Every leg has a home and its three correlation ids' },
        { n: 5, title: 'Screen plan', writes: '5-screen-plan.md', gate: 'Every value on screen traced to a received message' },
        { n: 6, title: 'Code plan', writes: '6-code-plan.md', gate: 'Every module has its files and the pin it is held to' },
      ],
    },
    {
      title: 'Build',
      stages: [
        { n: 7, title: 'Write the code', writes: '7-modules/', gate: 'Thirteen modules, each done in order', modules: 13 },
        { n: 8, title: 'Validate the modules', writes: '8-validation.md', gate: 'Every module passes, or carries a named exception' },
      ],
    },
    {
      title: 'Prove',
      stages: [
        { n: 9, title: 'Write the tests', writes: '9-tests.md', gate: 'Every row of the test matrix has a test' },
        { n: 10, title: 'Run the tests', writes: '10-test-run.md', gate: 'The offline rung passes; live rungs only when you start them' },
        { n: 11, title: 'The report', writes: '11-report.md', gate: 'Every gap named, so a stranger could pick it up' },
      ],
    },
  ],
  gateLabel: 'Gate',
  carriesTitle: 'What every stage reads from',
  carries: [
    { title: 'The flow', text: 'One path from policy search to settlement: steps F1 to F13, the case screen’s eight tabs in order, and the guard before every send. Copied, never redesigned.' },
    { title: 'Every bundle, pinned', text: 'Each bundle the software sends matches its reference pin byte for byte, the created time excepted, with a builder and a reader for every leg.' },
    { title: 'The adapter contract', text: 'Your software speaks plain FHIR to the NHCX Adapter, which does the encryption, tokens and certificates. The callback answers fast, dedupes and archives first.' },
    { title: 'Errors and their fixes', text: 'The PAYR and ERR codes met live, with what each means and how to fix it, and how to read a ledger thread when a send goes quiet.' },
    { title: 'Screens that stay honest', text: 'Nothing the exchange already knows is typed again, and no screen shows a decision the exchange has not sent.' },
    { title: 'The test pyramid', text: 'A test-case matrix per use case, an offline suite held to the pins, and a report that says which rungs were really climbed.' },
  ],
  note: 'Stop and come back any time. Nothing lives in the agent’s memory; everything lives in nhcx-build/, where the next session picks up at the first open gate.',
};

export const PROMPTS = {
  titleLead: 'Prompts that are',
  titleAccent: 'a whole task',
  text: 'Copy one into the assistant in your editor. Each of these ends in something you can run, not in a paragraph explaining what you could run.',
  items: [
    'Integrate my HMIS with the NHCX sandbox.',
    'Write an NHCX test script that covers every PM-JAY use case.',
    'Run an end-to-end test against the sandbox payer.',
    'Check why my last request failed and fix it.',
  ],
};

export const RULES = {
  titleLead: 'The rules it',
  titleAccent: 'works under',
  text: 'An agent with credentials on a national network needs a shorter leash than one writing a landing page. These are the four it is held to.',
  items: [
    { title: 'Sandbox until you say otherwise', text: 'The skill points at the sandbox. Production is a thing you ask for in words, not a default it can wander into.' },
    { title: 'Your machine, your data', text: 'It works in your repository with your credentials. Nothing about a patient goes anywhere except to the exchange you addressed it to.' },
    { title: 'Every rule comes with its source', text: 'A field is required because a named section of the specification says so, and the answer says which section. You can check it without trusting it.' },
    { title: 'It stops rather than invents', text: 'Where the specification is silent or the sandbox disagrees with it, the skill says so and hands the decision back, instead of filling the gap with a plausible field name.' },
  ],
};

export const CLOSE = {
  titleLead: 'Bring it into',
  titleAccent: 'the agent you use',
  lede: 'The skill is a folder of instructions and specifications. Install it for every agent in your project with one command, or clone it into the folder your agent reads skills from; nothing else about your setup changes.',
  skillCtaLabel: 'The skill on GitHub',
  note: 'You still need credentials to send anything: the skill writes and validates without them, and the sandbox answers once your application is through.',
  agents: [
    { key: 'any', label: 'Any agent', command: 'npx skills add nha-in/nhcx-skill', note: 'The skills installer finds the coding agents in your project and installs the skill for each of them.' },
    { key: 'claude', label: 'Claude Code', folder: '.claude/skills/nhcx' },
    { key: 'codex', label: 'OpenAI Codex', folder: '.codex/skills/nhcx' },
    { key: 'copilot', label: 'GitHub Copilot', folder: '.github/skills/nhcx' },
    { key: 'cursor', label: 'Cursor', folder: '.cursor/skills/nhcx' },
    { key: 'gemini', label: 'Gemini CLI', folder: '.gemini/skills/nhcx' },
  ] as Array<{ key: string; label: string; command?: string; folder?: string; note?: string }>,
};
