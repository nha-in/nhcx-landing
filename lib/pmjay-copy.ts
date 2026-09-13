/*
 * Every word on the PM-JAY page, in one place, the way the DevTools and AI
 * Skill pages keep theirs (lib/devtools-copy.ts, lib/skill-copy.ts).
 */

export type PmjayIcon = 'cover' | 'cashless' | 'states' | 'hmis' | 'biometric' | 'settle';

export const HERO = {
  kicker: 'PMJAY | Pradhan Mantri Jan Arogya Yojana',
  titleLead: 'The world’s largest health scheme, is on',
  titleAccent: 'NHCX',
  lede: 'Pradhan Mantri Jan Arogya Yojana gives eligible families cashless secondary and tertiary treatment at empanelled hospitals.',
  knowMore: { label: 'Know more', href: 'https://beneficiary.nha.gov.in/' },
  about: { label: 'About PM-JAY', href: '#pmjay-on-nhcx' },
  emblemAlt: 'Ayushman Bharat PM-JAY emblem',
};

export const FACTS = {
  title: 'PMJAY sits on NHCX like any other payer - same cover, same cashless treatment, raised and settled through the exchange',
  items: [
    { icon: 'cover', lead: '₹5 lakh per family, per year', text: 'Cover for secondary and tertiary hospitalisation for every eligible family, with no premium to pay at the point of care.', link: 'About the cover', href: '#pmjay-benefits' },
    { icon: 'cashless', lead: 'Cashless at the hospital', text: 'An empanelled hospital treats and discharges the patient, then raises the claim over NHCX instead of a payer-specific portal.', link: 'How a claim travels', href: '#pmjay-travels' },
    { icon: 'states', lead: 'Run by NHA with the states', text: 'The National Health Authority runs PM-JAY and the exchange nationally; each State Health Agency runs the scheme in its own state.', link: 'Read the specification', href: '/docs/' },
  ] as Array<{ icon: PmjayIcon; lead: string; text: string; link: string; href: string }>,
};

export const BENEFITS = {
  title: 'PMJAY Benefits',
  items: [
    { icon: 'cover', title: 'Cover a family can use', text: 'Up to ₹5 lakh per family per year for secondary and tertiary hospitalisation, with no premium to pay at the point of care.' },
    { icon: 'cashless', title: 'Cashless at the hospital', text: 'An eligible patient is treated and discharged without paying the hospital; the claim is settled between the hospital and the scheme afterwards.' },
    { icon: 'states', title: 'Run by NHA with the states', text: 'The National Health Authority runs PM-JAY nationally, and each State Health Agency runs it in its own state, with its own empanelment and its own claim processing.' },
  ] as Array<{ icon: PmjayIcon; title: string; text: string }>,
  card: { cover: 500000, claimed: 142500, hintFront: 'Hover the card to flip it', hintBack: 'Balance after two claims', backLabel: 'Cover used this year', note: 'Illustrative figures. No beneficiary details are shown on this page.' },
};

export const CHANGED = {
  title: 'Three things a hospital does differently',
  sub: 'The scheme is the same and so is the cover. What changes is where the claim is raised, how the patient is proved to be the beneficiary, and what happens to a claim that arrives clean.',
  items: [
    { icon: 'hmis', title: 'Raised in your HMIS', text: 'The claim is composed in the software the hospital already runs, from the diagnosis, procedure and bill lines it already holds. No second data entry, no staff switching systems to submit what has just been recorded.' },
    { icon: 'biometric', title: 'Beneficiary verified by biometrics', text: 'The patient is authenticated against their Ayushman record at the hospital, so who was treated is settled at the point of care rather than queried weeks later against a paper trail.' },
    { icon: 'settle', title: 'Prioritised settlement', text: 'A claim that arrives coded, complete and validated can be priced against the scheme’s rules as it lands, so the straightforward majority settle first and human review is spent on the cases that need it.' },
  ] as Array<{ icon: PmjayIcon; title: string; text: string }>,
};

export type TravelIcon = 'diagnosis' | 'procedure' | 'drugs' | 'bill' | 'sign' | 'lock' | 'route' | 'delivered' | 'sent' | 'decision' | 'amount' | 'settle';
export type TravelItem = { title: string; detail: string; icon?: TravelIcon; resource?: string };
/* What the window beside the moves plays for one move. `kind` picks the
   scene: the record gathered into a bundle, the bundle's trip across the
   exchange, the payer's checks and approval, the payment arriving. Each
   scene runs its four items one after another, then shows `ready`. */
export type TravelWindow = {
  kind: 'collect' | 'travel' | 'approve' | 'payment';
  heading?: string;
  subheading?: string;
  amount?: number;
  nodes?: string[];
  stampLabel?: string;
  stamp?: string;
  items: TravelItem[];
  ready: { title: string; summary: string };
};
export type TravelStep = { title: string; text: string; window: TravelWindow };

export const TRAVELS: { titleLead: string; titleAccent: string; sub: string; steps: TravelStep[] } = {
  titleLead: 'How a scheme claim',
  titleAccent: 'travels',
  sub: 'The same four moves every claim makes, with the standards doing the work in between. Nothing here is particular to one hospital’s software or one state’s claim system.',
  steps: [
    {
      title: 'The hospital raises the claim',
      text: 'The HMIS gathers what the ward already recorded (diagnosis, procedure, drugs and implants, bill lines) into one structured FHIR bundle, rather than a folder of scans.',
      window: {
        kind: 'collect',
        heading: 'Patient record',
        subheading: 'FHIR claim bundle',
        items: [
          { icon: 'diagnosis', title: 'Diagnosis', detail: 'Osteoarthritis of the knee', resource: 'Condition' },
          { icon: 'procedure', title: 'Procedure', detail: 'Total knee replacement', resource: 'Procedure' },
          { icon: 'drugs', title: 'Drugs and implants', detail: 'An implant and 5 drugs', resource: 'Medication' },
          { icon: 'bill', title: 'Bill lines', detail: '12 lines · ₹1,42,500', resource: 'Claim' },
        ],
        ready: { title: 'Claim bundle ready', summary: 'Composed from records already on file' },
      },
    },
    {
      title: 'NHCX carries it',
      text: 'The bundle is signed and encrypted, and the exchange routes it to the right payer for that patient and that state, handing the hospital a receipt it can quote later.',
      window: {
        kind: 'travel',
        nodes: ['Hospital', 'NHCX', 'Payer'],
        items: [
          { icon: 'sign', title: 'Signed', detail: 'As the hospital' },
          { icon: 'lock', title: 'Encrypted', detail: 'Only the payer can open it' },
          { icon: 'route', title: 'Routed', detail: 'To the State Health Agency' },
          { icon: 'delivered', title: 'Delivered', detail: 'Receipt back to the hospital' },
        ],
        ready: { title: 'Delivered to the payer', summary: 'Receipt kept against the claim ID' },
      },
    },
    {
      title: 'The payer approves',
      text: 'The State Health Agency or its insurer reads a machine-readable claim, so a routine case is checked and priced by rules, and only the ones that need a person get one.',
      window: {
        kind: 'approve',
        heading: 'CLM-2026-004217',
        subheading: 'Total knee replacement',
        amount: 142500,
        stampLabel: 'Decision',
        stamp: 'Approved',
        items: [
          { title: 'Beneficiary', detail: 'E-card active, cover left' },
          { title: 'Package rules', detail: 'Within package limits' },
          { title: 'Documents', detail: 'All mandatory documents' },
          { title: 'Pricing', detail: 'At the package rate' },
        ],
        ready: { title: 'Approved in full', summary: 'A routine case, checked and priced by rules' },
      },
    },
    {
      title: 'The payment comes home',
      text: 'The payment notice returns on the same rail against the same claim ID. The HMIS acknowledges it and marks the claim settled, without a phone call.',
      window: {
        kind: 'payment',
        heading: 'Payment received',
        subheading: 'CLM-2026-004217 · Total knee replacement',
        amount: 142500,
        items: [
          { icon: 'sent', title: 'Claim sent', detail: 'Over NHCX' },
          { icon: 'decision', title: 'Approved', detail: 'By the payer' },
          { icon: 'amount', title: 'Payment notice', detail: 'Read by the HMIS' },
          { icon: 'settle', title: 'Acknowledged', detail: 'Claim settled' },
        ],
        ready: { title: 'Claim settled', summary: 'Payment credited to the hospital' },
      },
    },
  ],
};

export const SIDES = {
  title: 'What each side gets',
  hospitalsTitle: 'For hospitals',
  // The diagram's labels: the hospital, the exchange, and the payers one bundle reaches.
  art: { hospital: 'Hospital', hub: 'NHCX', hubNote: 'one bundle', payers: ['PM-JAY', 'State scheme', 'Private Payer'] },
  hospitals: [
    'One integration, not one per payer: the same bundle format serves PM-JAY, state schemes and private insurers.',
    'Claims validated before they leave, so incomplete ones are caught at the desk instead of coming back as queries weeks later.',
    'A readable trail for every claim, which is what a disputed settlement actually turns on.',
  ],
};

export const CTA = {
  title: 'Connecting a PM-JAY hospital or payer',
  sub: 'Integration is the same for a scheme claim as for any other: read the specification, build a bundle that validates, rehearse the whole flow against the sandbox, then apply for the environment you need.',
  label: 'Apply for access',
  href: '/apply/',
};
