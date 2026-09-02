import { withBase } from '@/lib/paths';
import { docsHref } from '@/lib/links';

/**
 * "Specifications and policies" — the documents that govern the exchange.
 *
 * Every one of them is reproduced in the documentation corpus on this site, so
 * each row leads there first: `doc` is the chapter that covers the document,
 * and the published original stays one click away as the source. A reader who
 * wants the text gets a searchable page with the assistant beside it; a reader
 * who needs to cite the authority still has the link to nhcx.abdm.gov.in.
 */

const NHCX = 'https://nhcx.abdm.gov.in/#/NHCX_Specifications';

interface SpecItem {
  label: string;
  /** The published document this row is about. */
  href: string;
  note?: string;
  /** Documentation chapter covering it, e.g. `08.04` — see public/docs. */
  doc?: string;
}

const groups = (): Array<{ title: string; items: SpecItem[] }> => [
  {
    title: 'Technical specifications',
    items: [
      { label: 'Implementation guide', href: `${NHCX}/Implementation_Guide`, note: 'Protocol, message envelope, API pattern', doc: '03.01' },
      { label: 'Domain data models', href: `${NHCX}/Domain_Data_Models`, note: 'FHIR R4 bundles per use case', doc: '05.03' },
      { label: 'Domain specifications', href: `${NHCX}/Domain_Specifications`, note: 'The five use cases, request to callback', doc: '04.01' },
      { label: 'Terminologies', href: `${NHCX}/Terminologies`, note: 'ICD-10, SNOMED CT, national code directories', doc: '05.04' },
      { label: 'Transport security', href: `${NHCX}/Transport_Security`, note: 'TLS, JWS API keys, JWE payloads', doc: '08.04' },
      { label: 'Audit reporting', href: `${NHCX}/Audit_Reporting`, note: 'What is logged, and what a regulator sees', doc: '08.03' },
    ],
  },
  {
    title: 'Policies and guidelines',
    items: [
      { label: 'Participant onboarding', href: `${NHCX}/Guidlines_for_Participant_Onboarding`, note: 'Sandbox, certification, then production', doc: '10.01' },
      { label: 'Beneficiary authentication', href: `${NHCX}/Guidlines_for_Beneficiary`, note: 'Authenticating a patient through ABHA', doc: '03.04' },
      { label: 'Event audits', href: `${NHCX}/Guidlines_for_Event_Audits`, note: 'The event trail behind every exchange', doc: '04.10' },
      { label: 'Grievance redressal', href: `${NHCX}/Guidlines_for_Grievance_Redressal`, note: 'Raising and answering a query', doc: '04.07' },
      { label: 'Health care operation policy', href: `${NHCX}/Health_Care_Operation_Policy`, note: 'How a settlement is meant to run', doc: '01.04' },
    ],
  },
  {
    title: 'Sandbox, code and this site',
    items: [
      { label: 'HCX sandbox documents', href: 'https://hcxsbx.abdm.gov.in/#/documents', note: 'Swagger for every service', doc: '03.06' },
      { label: 'ABDM sandbox, getting started', href: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=getting-started', note: 'Registering and reaching the sandbox', doc: '10.02' },
      { label: 'Postman collections', href: 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation?doc=postman_collections', note: 'Ready-made requests for the sandbox APIs', doc: '07.01' },
      { label: 'NHA-ABDM on GitHub', href: 'https://github.com/NHA-ABDM', note: 'Reference implementations and sample code' },
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
        <p className="lp-specs-lede" data-reveal="" data-delay="80">
          Every one of these is reproduced in the documentation on this site, searchable and with the assistant beside
          it. Each row opens the chapter that covers it; the published original is linked underneath as the source.
        </p>
        <div className="lp-specs-grid">
          {GROUPS.map((g, i) => (
            <div key={g.title} className="lp-specs-col" data-reveal="" data-delay={String(100 + i * 60)}>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((item) => {
                  const chapter = docsHref(item.doc);
                  return (
                    <li key={item.label}>
                      <a href={chapter ?? item.href}>{item.label}</a>
                      {item.note && <span>{item.note}</span>}
                      {chapter && (
                        <a className="lp-specs-src" href={item.href} rel="noopener">
                          Published source
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
