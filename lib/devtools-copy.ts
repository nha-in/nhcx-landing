/*
 * Every word on the DevTools page, carried over from the previous site
 * (`devtools` in content/site.json there).
 */

/** The DevTools console, which runs in a browser. */
export const DEVTOOLS_URL = 'https://nhcx.sbxstage.in/dev';

export type IconName = 'book' | 'braces' | 'play' | 'search' | 'plug' | 'rocket' | 'layers' | 'ledger';
export type UseCase = { icon: IconName; title: string; text: string };

export const HERO = {
  kicker: 'Developer tools for NHCX',
  titleLead: 'Build against NHCX',
  titleAccent: 'before you connect to it',
  intro: 'Two tools and no third thing to choose between: one that teaches and rehearses the exchange in a browser tab, one that carries it in production.',
  consoleCard: {
    title: 'DevTools',
    copy: 'The exchange end to end, in a tab: read how an endpoint behaves, build a bundle that validates, and trade claims with a mock payer until every flow passes. Nothing you do here touches your servers.',
    ctaLabel: 'Open DevTools',
  },
  adapterCard: {
    title: 'NHCX Adapter',
    copy: 'The piece you actually deploy. Post a FHIR bundle to it, read a plain callback back, and it does the headers, the encryption, the certificates and the acknowledgements in between. One JSON config, no database.',
    downloadPrefix: 'Download',
    repoLabel: 'GitHub',
  },
  flow: ['Your system', 'NHCX Adapter', 'NHCX'] as const,
};

export const CONSOLE = {
  title: 'DevTools',
  intro: 'The whole exchange in a browser tab. Nothing you do here touches your servers.',
  ctaLabel: 'Open DevTools',
  useCasesTitle: 'What you’d use DevTools for',
  useCases: [
    { icon: 'book', title: 'Starting from zero', text: 'Fourteen chapters across two tracks, from what the exchange is to how a claim settles, each ending in a short check that remembers where you got to.' },
    { icon: 'braces', title: 'Preparing your first claim', text: 'Compose eligibility, pre-authorisation, claim and payment bundles against the ABDM profiles, and find what is wrong before a real send does.' },
    { icon: 'play', title: 'Testing with no counterparty', text: 'A mock payer answers, so a whole flow runs end to end before anyone assigns you a partner. When one fails, the decrypted request and callback are both there.' },
  ] as UseCase[],
};

export const ADAPTER = {
  title: 'NHCX Adapter',
  introBefore: 'One binary between your system and NHCX. Your software posts a FHIR bundle to it and reads a plain callback back; the adapter does the ',
  introCode: 'x-hcx-*',
  introAfter: ' headers, the encryption, the certificates and the acknowledgements. Nothing else about your system changes.',
  useCasesTitle: 'What you’d use the adapter for',
  useCases: [
    { icon: 'plug', title: 'Put an existing system on NHCX', text: 'Your HMIS or claims software posts a bundle to one local endpoint and reads plain JSON back. Nothing inside it learns the protocol, and one adapter can carry several participant codes.' },
    { icon: 'rocket', title: 'Move from sandbox to production', text: 'One switch in config.json. The same calls and the same endpoints, pointed at the other environment’s registry and credentials.' },
    { icon: 'search', title: 'Settle a disputed claim', text: 'Pull the exact request and callback for a correlation id months later, decrypted and readable, and replay it if the payer asks.' },
  ] as UseCase[],
  downloadsTitle: 'Download the NHCX Adapter',
  releasedPrefix: 'released',
};

export type Shell = { key: string; label: string; note: string; lines: string[] };
export type QuickStartCopy = { title: string; shellGroupLabel: string; copyLabel: string; copiedLabel: string; shells: Shell[] };

export const QUICKSTART: QuickStartCopy = {
  title: 'Run it',
  shellGroupLabel: 'Shell',
  copyLabel: 'Copy',
  copiedLabel: 'Copied',
  shells: [
    {
      key: 'bash',
      label: 'bash',
      note: 'macOS · Linux',
      lines: [
        'tar xzf {name}_<os>_<arch>.tar.gz',
        'cd {name}_<os>_<arch>',
        './nhcx-adapter config edit    # writes config.json',
        './nhcx-adapter serve          # checks, then listens',
        './nhcx-adapter ledger follow  # the traffic, live',
      ],
    },
    {
      key: 'powershell',
      label: 'PowerShell',
      note: 'Windows',
      lines: [
        'Expand-Archive {name}_windows_amd64.zip -DestinationPath .',
        'Set-Location {name}_windows_amd64',
        '.\\nhcx-adapter.exe config edit    # writes config.json',
        '.\\nhcx-adapter.exe serve          # checks, then listens',
        '.\\nhcx-adapter.exe ledger follow  # the traffic, live',
      ],
    },
    {
      key: 'cmd',
      label: 'Command Prompt',
      note: 'Windows',
      lines: ['tar -xf {name}_windows_amd64.zip', 'cd {name}_windows_amd64', 'nhcx-adapter.exe config edit', 'nhcx-adapter.exe serve', 'nhcx-adapter.exe ledger follow'],
    },
  ],
};

export type DownloadCopy = typeof DOWNLOAD;

export const DOWNLOAD = {
  recommendedLabel: 'Recommended for this machine',
  selectedLabel: 'Selected build',
  osLabel: 'Operating system',
  archLabel: 'Architecture',
  getLabel: 'Download',
  archiveLabel: 'Archive',
  sizeLabel: 'Size',
  shaLabel: 'SHA-256',
};
