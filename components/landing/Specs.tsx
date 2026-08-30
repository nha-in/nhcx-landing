import { withBase } from '@/lib/paths';

/**
 * "Specifications and policies" — the documents that govern the exchange,
 * as published on nhcx.abdm.gov.in, plus where the code and sandbox live.
 */

const NHCX = 'https://nhcx.abdm.gov.in/#/NHCX_Specifications';

const groups = (): Array<{ title: string; items: Array<{ label: string; href: string; note?: string }> }> => [
  {
    title: 'Technical specifications',
    items: [
      { label: 'Implementation guide', href: `${NHCX}/Implementation_Guide`, note: 'Protocol, message envelope, API pattern' },
      { label: 'Domain data models', href: `${NHCX}/Domain_Data_Models`, note: 'FHIR R4 bundles per use case' },
      { label: 'Domain specifications', href: `${NHCX}/Domain_Specifications` },
      { label: 'Terminologies', href: `${NHCX}/Terminologies`, note: 'ICD-10, SNOMED CT, national code directories' },
      { label: 'Transport security', href: `${NHCX}/Transport_Security`, note: 'TLS, JWS API keys, JWE payloads' },
      { label: 'Audit reporting', href: `${NHCX}/Audit_Reporting` },
    ],
  },
  {
    title: 'Policies and guidelines',
    items: [
      { label: 'Participant onboarding', href: `${NHCX}/Guidlines_for_Participant_Onboarding` },
      { label: 'Beneficiary authentication', href: `${NHCX}/Guidlines_for_Beneficiary` },
      { label: 'Event audits', href: `${NHCX}/Guidlines_for_Event_Audits` },
      { label: 'Grievance redressal', href: `${NHCX}/Guidlines_for_Grievance_Redressal` },
      { label: 'Health care operation policy', href: `${NHCX}/Health_Care_Operation_Policy` },
    ],
  },
  {
    title: 'Sandbox, code and this site',
    items: [
      { label: 'HCX sandbox documents', href: 'https://hcxsbx.abdm.gov.in/#/documents', note: 'Swagger for every service' },
      { label: 'ABDM sandbox — getting started', href: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=getting-started' },
      { label: 'Postman collections', href: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=postman_collections' },
      { label: 'NHA-ABDM on GitHub', href: 'https://github.com/NHA-ABDM' },
      { label: 'Documentation reader with assistant', href: withBase('/documentation/'), note: 'The corpus, searchable, on this site' },
      { label: 'Downloads', href: withBase('/download/'), note: 'Documents, templates and links' },
    ],
  },
];

export default function Specs() {
  const GROUPS = groups();
  return (
    <section id="specs" className="lp-specs" aria-labelledby="specs-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          Specifications and policies
        </p>
        <h2 id="specs-title" data-reveal="" data-delay="60">
          The documents the exchange runs on
        </h2>
        <div className="lp-specs-grid">
          {GROUPS.map((g, i) => (
            <div key={g.title} className="lp-specs-col" data-reveal="" data-delay={String(100 + i * 60)}>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href}>{item.label}</a>
                    {item.note && <span>{item.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
