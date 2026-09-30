// All copy on the page, taken from the approved HTML template
// (home-nhcx-sandbox-updated1.2). Components only lay this out.

/** The separate links page. Components resolve it, and the home-page anchors
 * below, through useHref() so they work from either page. */
export const LINKS_PAGE = '@links'

/** Link targets. An empty string is a destination nobody has supplied yet:
 * the item then renders as plain text, or is left out, never as a dead link. */
export const links = {
  home: '#top',
  main: '#main-content',
  participants: '#participants',
  artefacts: '#artefacts',
  stages: '#stages',
  pmjaySection: '#pmjay',
  journey: '#journey',
  register: 'https://sbxai.abdm.gov.in/accounts/signup/',
  documentation: 'https://docs.abdm.gov.in/docs/nhcx/v1/',
  nha: 'https://nha.gov.in/',
  abdm: 'https://abdm.gov.in/',
  github: 'https://github.com/nha-in',
  notifications: '',
  sitemap: '',
  screenReader: '',
}

export const site = {
  tollFree: 'Toll Free Number : NHA/PM-JAY 14555 | ABDM 14477',
  brandLabel:
    'National Health Authority, Ayushman Bharat Digital Mission — ABDM-NHCX',
  headerLogoAlt:
    'National Health Authority · Ayushman Bharat Digital Mission · ABDM-NHCX',
  footerLogoAlt: 'National Health Authority · Ayushman Bharat Digital Mission · PM-JAY',
  registerCta: 'Register for Sandbox',
}

export const nav = [
  { label: 'Home', href: links.home },
  { label: 'AI Artefacts', href: links.artefacts },
  { label: 'Claim Lifecycle', href: links.stages },
  { label: 'Journey', href: links.journey },
  { label: 'Links', href: LINKS_PAGE },
  { label: 'Documentation', href: links.documentation },
]

export const hero = {
  eyebrow: 'National Health Claims Exchange',
  titleLead: 'One standardised rail for India’s ',
  titleEm: 'health insurance claims',
  subtitle: 'Integrate with NHCX faster with Agentic AI',
  // { b } segments are set in bold.
  lede: [
    'A controlled, self-service sandbox where providers, payers and health-tech partners build and validate claims integrations with the National Health Claims Exchange. Instead of every hospital connecting to every insurer directly, participants exchange standard ',
    { b: 'FHIR R4' },
    ' bundles over NHCX. Purpose-built ',
    { b: 'Agentic AI artefacts' },
    ', assistants, code generators, simulators and validators, guide you through every step, from ',
    { b: 'eligibility checks' },
    ' and ',
    { b: 'pre-authorisation' },
    ' to ',
    { b: 'claim submission' },
    ' and ',
    { b: 'payment reconciliation' },
    ', so you go live faster and with fewer errors.',
  ] as Array<string | { b: string }>,
  primaryCta: 'Register for the Sandbox',
  secondaryCta: 'See the integration journey',
  artefactsCta: 'Explore AI artefacts',
  trust: [
    { value: '3', label: 'participant roles', href: links.participants },
    { value: '4', label: 'claim lifecycle stages', href: links.stages },
    { value: 'Agentic AI', label: 'assistants for every flow', href: links.artefacts },
    { value: 'FHIR R4', label: 'compliant · ABHA linked', href: links.journey },
  ],
}

export type ParticipantIcon = 'provider' | 'payer' | 'beneficiary'

export const participants: Array<{
  num: string
  icon: ParticipantIcon
  name: string
  full: string
  description: string
  cta: string
  href: string
}> = [
  {
    num: '01',
    icon: 'provider',
    name: 'Provider',
    full: 'Hospitals, nursing homes & day-care/OPD clinics',
    description:
      'Check patient coverage, raise pre-authorisation and submit claims to any registered payer over a single, standardised connection to NHCX.',
    cta: 'Explore artefacts',
    href: links.artefacts,
  },
  {
    num: '02',
    icon: 'payer',
    name: 'Payer',
    full: 'Insurers, TPAs, state agencies & govt. schemes',
    description:
      'Receive standardised claim and pre-auth requests, respond with queries, approvals and payment notices, and settle faster with less manual paperwork.',
    cta: 'Explore artefacts',
    href: links.artefacts,
  },
  {
    num: '03',
    icon: 'beneficiary',
    name: 'Beneficiary',
    full: 'Patients & policy holders',
    description:
      'Experience transparent, trackable claims linked to an ABHA identity, with fewer delays between admission, discharge and settlement.',
    cta: 'Learn more',
    href: links.pmjaySection,
  },
]

export const artefacts = {
  eyebrow: 'Agentic AI Artefacts',
  title: 'AI assistants that do the groundwork of claims integration',
  description:
    'The sandbox now has AI artefacts for NHCX Integration. Instead of reading claims specifications end-to-end, integrators describe what they want to build and the agents generate, wire up, test and validate the eligibility, pre-authorisation, claim and communication exchanges, compressing weeks of trial-and-error into guided, verifiable steps that take just days.',
  items: [
    {
      title: 'Integration Assistant',
      description:
        'A conversational agent that explains each claim flow in plain language, recommends the right APIs for your role, and answers specific questions in context.',
    },
    {
      title: 'FHIR & Payload Generator',
      description:
        'Generates client code, FHIR R4 claim bundles, pre-auth requests and NHCX participant configuration in your stack of choice.',
    },
    {
      title: 'Payer / Provider Simulator',
      description:
        'Spins up simulated payers and providers so you can run end-to-end eligibility, pre-auth, claim and payment scenarios in a fully simulated environment.',
    },
    {
      title: 'Standards Compliance',
      description:
        'Validates your bundles against NHCX specifications and FHIR R4, flags gaps, and confirms readiness before you connect to live payers.',
    },
    {
      title: 'Debug & Error Explainer',
      description:
        'Reads exchange responses and error codes, pinpoints the root cause, and suggests the exact fix, no more decoding cryptic claim rejections alone.',
    },
    {
      title: 'Go-Live Tracker',
      description:
        'Tracks your progress, tells you what evidence each stage needs, and helps you prepare your participant onboarding and go-live submission.',
    },
  ],
}

export const lifecycle = {
  eyebrow: 'The Claim Lifecycle',
  title: 'Four stages, end to end',
  description:
    'An NHCX workflow moves through a standard sequence for one patient and payer. Integrators implement the stages relevant to their role, exchanging machine-readable, auditable and verifiable FHIR bundles at each step.',
  stages: [
    {
      badge: 'S1',
      tag: 'Coverage check',
      title: 'Eligibility',
      description:
        'Confirm the patient’s policy, coverage and benefits against a payer before treatment begins.',
    },
    {
      badge: 'S2',
      tag: 'Prior approval',
      title: 'Pre-authorisation',
      description:
        'Obtain approval for the planned treatment, with support for enhancements and cancellation where needed.',
    },
    {
      badge: 'S3',
      tag: 'Submit & reprocess',
      title: 'Claim',
      description:
        'Submit the final claim for reimbursement, including newborn claims, and reprocess partially paid or erroneous claims.',
    },
    {
      badge: 'S4',
      tag: 'Queries & notices',
      title: 'Communication',
      description:
        'Respond to payer queries and track payment notices so both sides stay in sync throughout settlement.',
    },
  ],
  note: 'Identity across every stage is anchored to the patient’s ABHA number, and each participant connects with a unique NHCX participant code.',
}

export const pmjay = {
  eyebrow: 'PM-JAY on NHCX',
  title: 'The world’s largest government health assurance scheme is on NHCX',
  description:
    'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana gives eligible families cashless secondary and tertiary treatment at empanelled hospitals. On NHCX it sits like any other payer, same cover, same cashless treatment, raised and settled through the exchange.',
  facts: [
    { value: '₹5 lakh', label: 'Cover per family, per year · no premium at point of care' },
    { value: 'Cashless', label: 'At the hospital · claim raised over NHCX afterward' },
  ],
  cta: 'Know more about PM-JAY',
}

export const journey = {
  eyebrow: 'The Journey',
  title: 'From sandbox registration to go-live: end to end',
  description:
    'Here is the full lifecycle an integrator follows in the NHCX Agentic AI Sandbox. Each step is supported by the AI artefacts so you always know what to do next and whether you have done it correctly.',
  steps: [
    {
      phase: 'Onboard',
      title: 'Register & create your sandbox account',
      description:
        'Sign up as an eligible entity (provider, payer, TPA or health-tech), verify your organisation details, and accept the sandbox terms of use.',
      ai: 'Once confirmed, access guided claim journeys and NHCX APIs for your role.',
    },
    {
      phase: 'Access',
      title: 'Get your participant code & connect',
      description:
        'Receive your NHCX participant code, client IDs, keys and session tokens, then establish your first authenticated connection to the exchange.',
      ai: 'FHIR & Payload Generator produces working auth code and your first eligibility request.',
    },
    {
      phase: 'Build',
      title: 'Implement the core claim flows',
      description:
        'Integrate eligibility, pre-authorisation, claim submission and communication APIs as per the requirements of your solution and role.',
      ai: 'Integration Assistant generates stage-based journeys, FHIR payloads, skill files and error scenarios.',
    },
    {
      phase: 'Test',
      title: 'Simulate & validate end to end',
      description:
        'Run complete functional testing against simulated payers and providers, cover error paths, and ensure compliance against FHIR R4 checks.',
      ai: 'Payer / Provider Simulator runs simulated claim workflows for end-to-end testing.',
    },
    {
      phase: 'Certify · Go-Live',
      title: 'Onboard as a live participant',
      description:
        'Package and submit evidence of successful integration for review, then receive production participant access upon approval.',
      ai: 'Go-Live Tracker assembles the evidence pack and readiness checklist; Assistant outlines the differences between sandbox and production.',
    },
    {
      phase: 'Explore',
      title: 'Continue using the sandbox',
      description:
        'Keep using the sandbox after going live to test new claim scenarios, onboard new payers, join events, and explore new use cases.',
      ai: 'Assistant surfaces new workflows, upcoming events and use cases you can explore in the sandbox.',
    },
  ],
}

// The links page. The first group is the sandbox's own tools; the rest is the
// catalogue NHA published on the earlier NHCX landing's Links page.
export const linkDirectory: {
  eyebrow: string
  title: string
  description: string
  groups: Array<{
    title: string
    description?: string
    items: Array<{ title: string; description?: string; url: string; type: string }>
  }>
} = {
  eyebrow: 'Links',
  title: 'Specifications, policies and guides',
  description:
    'Everything the programme publishes about NHCX, in one place: the open specification and its data models, the policies and guidelines that govern participation, and the guides for getting onto the sandbox.',
  groups: [
    {
      title: 'Build and test',
      description: 'The documentation and the sandbox tools you work with day to day.',
      items: [
        {
          title: 'NHCX documentation',
          description: 'Concepts, claim flows and API reference for NHCX integrators.',
          url: links.documentation,
          type: 'Docs',
        },
        {
          title: 'AI Artefacts',
          description:
            'A backend-free console for the NHCX sandbox: encrypt and send FHIR bundles, search policies and generate certificates, all in your browser.',
          url: '/dev/',
          type: 'Tool',
        },
        {
          title: 'NHCX UAT',
          description:
            'The sandbox payer and provider: one sign-in for the provider EMR, the payer desk and the PM-JAY scheme payer.',
          url: '/uat/',
          type: 'Tool',
        },
        {
          title: 'HCX sandbox',
          description: 'The NHCX sandbox gateway, with its API documents and Swagger.',
          url: 'https://hcxsbx.abdm.gov.in/',
          type: 'Web page',
        },
        {
          title: 'NRCeS',
          description:
            'National Resource Centre for EHR Standards: the FHIR implementation guide, profiles and terminology behind ABDM and NHCX bundles.',
          url: 'https://nrces.in/',
          type: 'Web page',
        },
        {
          title: 'Register for the Agentic AI Sandbox',
          description: 'Create your sandbox account and begin your integration.',
          url: links.register,
          type: 'Web page',
        },
      ],
    },
    {
      title: 'Specifications',
      description:
        'The NHCX specifications as published by the National Health Authority on nhcx.abdm.gov.in.',
      items: [
        {
          title: 'Implementation guide',
          description:
            'The open protocol: message envelope, API pattern, authentication and the onward and return journey of every use case.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Implementation_Guide',
          type: 'Web page',
        },
        {
          title: 'Domain data models',
          description:
            'The HL7 FHIR R4 bundles for coverage eligibility, pre-authorisation, claim, payment notice and communication.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Domain_Data_Models',
          type: 'Web page',
        },
        {
          title: 'Terminologies',
          description: 'ICD-10, SNOMED CT and the national code directories used for coded values.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Terminologies',
          type: 'Web page',
        },
        {
          title: 'Transport security',
          description:
            'TLS, JWS-signed API keys and JWE-encrypted payloads between participants and the exchange.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Transport_Security',
          type: 'Web page',
        },
      ],
    },
    {
      title: 'Policies and guidelines',
      items: [
        {
          title: 'Guidelines for participant onboarding',
          description:
            'Who can join, the documents required, sandbox certification and the production onboarding steps.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Guidlines_for_Participant_Onboarding',
          type: 'Web page',
        },
        {
          title: 'Guidelines for beneficiary authentication',
          description: 'How providers and payers authenticate a beneficiary through ABHA.',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Guidlines_for_Beneficiary',
          type: 'Web page',
        },
        {
          title: 'Guidelines for grievance redressal',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Guidlines_for_Grievance_Redressal',
          type: 'Web page',
        },
        {
          title: 'Health care operation policy',
          url: 'https://nhcx.abdm.gov.in/#/NHCX_Specifications/Health_Care_Operation_Policy',
          type: 'Web page',
        },
        {
          title: 'Health Data Management Policy',
          url: 'https://abdm.gov.in/publications/policies_regulations/health_data_management_policy',
          type: 'Web page',
        },
        {
          title: 'ABDM Health Records (PHR) Mobile App Privacy Policy',
          url: 'https://abdm.gov.in/abha-PRIVACY-POLICY-english',
          type: 'Web page',
        },
        { title: 'ABDM website policy', url: 'https://abdm.gov.in/website-policy', type: 'Web page' },
        { title: 'ABDM terms and conditions', url: 'https://abdm.gov.in/terms-condition', type: 'Web page' },
      ],
    },
    {
      title: 'Sandbox and developer resources',
      items: [
        {
          title: 'ABDM sandbox registration',
          description:
            'Register your organisation on the ABDM sandbox: the first step before NHCX integration.',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/sandbox-registration',
          type: 'Web page',
        },
        {
          title: 'ABDM sandbox: getting started',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=getting-started',
          type: 'Web page',
        },
        {
          title: 'Milestone M1 (ABHA) integration',
          description:
            'Beneficiary authentication through ABHA: needed for production, not for sandbox testing.',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=Milestone_one',
          type: 'Web page',
        },
        {
          title: 'Postman collections',
          description: 'Ready-made requests for the sandbox APIs.',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=postman_collections',
          type: 'Web page',
        },
        {
          title: 'Sandbox test cases',
          description: 'The functional test cases to clear for sandbox certification.',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=TestCases',
          type: 'Web page',
        },
        {
          title: 'HCX sandbox documents and Swagger',
          description:
            'API documentation for the claim, pre-auth, coverage-eligibility, communication and participant services.',
          url: 'https://hcxsbx.abdm.gov.in/#/documents',
          type: 'Web page',
        },
        {
          title: 'NHA-ABDM on GitHub',
          description: 'Reference implementations and sample code from the National Health Authority.',
          url: 'https://github.com/NHA-ABDM',
          type: 'Repository',
        },
        {
          title: 'NHCX repositories on GitHub',
          url: links.github,
          type: 'Repository',
        },
        {
          title: 'ABDM sandbox webinars',
          url: 'https://sandbox.abdm.gov.in/sandbox/v3/webinars',
          type: 'Web page',
        },
      ],
    },
    {
      title: 'Programme',
      items: [
        { title: 'National Health Authority', url: links.nha, type: 'Web page' },
        { title: 'Ayushman Bharat Digital Mission', url: links.abdm, type: 'Web page' },
      ],
    },
  ],
}

export const finalCta = {
  title: 'Ready to start integrating?',
  description:
    'Register for the NHCX Agentic AI Sandbox and let the AI artefacts guide you from your first eligibility check to go-live.',
  primary: 'Register for Sandbox',
  secondary: 'Read the overview',
}

export type SocialIcon = 'facebook' | 'youtube' | 'x' | 'instagram' | 'linkedin'

export const footer = {
  contactTitle: 'Contact',
  contact: [
    {
      label: 'Address',
      lines: [{ text: '9th Floor, Tower-I, Jeevan Bharati Building, Connaught Place, New Delhi – 110001' }],
    },
    { label: 'Toll-Free Call Center No', lines: [{ text: '14555', href: 'tel:14555' }] },
    {
      label: 'Email',
      lines: [
        { text: 'abdm@nha.gov.in', href: 'mailto:abdm@nha.gov.in' },
        { text: 'hcx.integration@nha.gov.in', href: 'mailto:hcx.integration@nha.gov.in' },
      ],
    },
  ] as Array<{ label: string; lines: Array<{ text: string; href?: string }> }>,
  socialTitle: 'Social Media',
  social: [
    { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/AyushmanNHA' },
    { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/channel/UCkd7w2rww0HQB4lZ-l3dB6g' },
    { label: 'X', icon: 'x', href: 'https://x.com/AyushmanNHA' },
    { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/ayushmannha/' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/company/ayushmannha' },
  ] satisfies Array<{ label: string; icon: SocialIcon; href: string }>,
  columns: [
    {
      title: 'Important Links',
      links: [
        { label: 'PM-JAY', href: links.nha },
        { label: 'ABDM', href: links.abdm },
        { label: 'NHA', href: links.nha },
        { label: 'Home', href: links.home },
        { label: 'Links', href: LINKS_PAGE },
        { label: 'Apply For Sandbox', href: links.register },
        { label: 'GitHub', href: links.github },
      ],
    },
    {
      title: 'Policies',
      links: [
        { label: 'Terms & Conditions', href: 'https://abdm.gov.in/terms-condition' },
        { label: 'Website Policy', href: 'https://abdm.gov.in/website-policy' },
        { label: 'Data Privacy Policy', href: '' },
        {
          label: 'Health Data Management Policy',
          href: 'https://abdm.gov.in/publications/policies_regulations/health_data_management_policy',
        },
        {
          label: 'ABDM Health Records (PHR) Mobile App Privacy Policy',
          href: 'https://abdm.gov.in/abha-PRIVACY-POLICY-english',
        },
        { label: 'ABDM Health Records (PHR) Mobile App Privacy Policy (Hindi)', href: '' },
      ],
    },
  ],
  copyright:
    '© 2026 National Health Authority, Government of India. All rights reserved.',
  lastUpdated: 'Last updated: 18/09/2026',
  bottomLinks: [
    { label: 'Terms', href: 'https://abdm.gov.in/terms-condition' },
    { label: 'Privacy Policy', href: '' },
    { label: 'Copyright Policy', href: '' },
    { label: 'Sitemap', href: '' },
  ],
}
