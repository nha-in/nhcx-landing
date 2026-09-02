import { withBase } from "@/lib/paths";
import CountUp from "@/components/landing/CountUp";

/**
 * "NHCX at a glance" + "Understand NHCX" — the facts a first-time visitor
 * needs, drawn from the programme's own site (nhcx.abdm.gov.in): what the
 * exchange is, who takes part, what moves over it and where it stands.
 */

const FIGURES = [
  {
    value: "34",
    label: "insurers and TPAs live on NHCX",
    note: "as of 21 Jul 2024",
  },
  {
    value: "~300",
    label: "hospitals onboarding to send claims",
    note: "as of 21 Jul 2024",
  },
  {
    value: "5",
    label: "claim use cases on one protocol",
    note: "eligibility · pre-auth · claim · payment notice · communication",
  },
  {
    value: "1",
    label: "integration for every payer",
    note: "the exchange routes by participant code",
  },
];

const PARTICIPANTS: Array<{ title: string; who: string }> = [
  {
    title: "Providers",
    who: "Hospitals, nursing homes, diagnostic centres and clinics, and the HMIS or TMS vendors that build for them.",
  },
  {
    title: "Payers",
    who: "Insurance companies, TPAs, state health agencies and government schemes such as PM-JAY.",
  },
  {
    title: "Sponsors and regulators",
    who: "Scheme planners with payer-equivalent access; IRDAI and auditors with aggregate, anonymised views.",
  },
  {
    title: "Beneficiaries",
    who: "Patients, authenticated through ABHA in production (not required in the sandbox), whose consent governs what an ISNP or app may see.",
  },
];

const USE_CASES: Array<{ name: string; path: string; what: string }> = [
  {
    name: "Coverage eligibility",
    path: "/coverageeligibility/check",
    what: "Is this person covered for this treatment, today?",
  },
  {
    name: "Pre-authorisation",
    path: "/preauth/submit",
    what: "Approve a package and amount before admission.",
  },
  {
    name: "Claim",
    path: "/claim/submit",
    what: "The discharge bundle: diagnosis, procedures, bill lines.",
  },
  {
    name: "Payment notice",
    path: "/paymentnotice/request",
    what: "Settlement advice, from payer to provider.",
  },
  {
    name: "Communication",
    path: "/communication/request",
    what: "Queries and supporting documents, both ways.",
  },
];

/** The four figures under "What NHCX guarantees". */
export function Glance() {
  return (
    <section className="lp-glance" aria-label="NHCX at a glance">
      <div className="lp-wrap">
        <dl className="lp-figures" data-reveal="">
          {FIGURES.map((f) => (
            <div key={f.label} className="lp-figure">
              <dt>
                <span className="lp-figure-value">
                  <CountUp value={f.value} />
                </span>
                <span className="lp-figure-label">{f.label}</span>
              </dt>
              <dd>{f.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** The explainer, placed after the onboarding steps. */
export default function Understand() {
  return (
    <section
      id="understand"
      className="lp-understand"
      aria-labelledby="understand-title"
    >
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          Understand NHCX
        </p>
        <h2 id="understand-title" data-reveal="" data-delay="60">
          A national exchange for health-claim data, run by the National Health
          Authority under ABDM
        </h2>
        <p className="lp-understand-intro" data-reveal="" data-delay="100">
          The National Health Claims Exchange is the digital gateway between the
          people who deliver care and the people who pay for it. A hospital
          submits a claim once, as coded FHIR data; the exchange checks and
          signs it, finds the payer, and delivers it. The decision comes back
          the same way. It began as the Health Claims Platform (HCP) and was
          renamed NHCX on the industry&rsquo;s suggestion; its specifications
          were developed in the open with insurers, TPAs and state health
          agencies.
        </p>

        <div className="lp-understand-grid">
          <div className="lp-und-col" data-reveal="" data-delay="120">
            <h3>Who takes part</h3>
            <ul className="lp-und-list">
              {PARTICIPANTS.map((p) => (
                <li key={p.title}>
                  <b>{p.title}</b>
                  <span>{p.who}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-und-col" data-reveal="" data-delay="180">
            <h3>What moves over it</h3>
            <ul className="lp-und-apis">
              {USE_CASES.map((u) => (
                <li key={u.name}>
                  <b>{u.name}</b>
                  <code>{u.path}</code>
                  <span>{u.what}</span>
                </li>
              ))}
            </ul>
            <p className="lp-und-note">
              Every request has an <code>on_</code> callback, and every message
              is a signed, encrypted envelope (JWE) around an HL7 FHIR R4
              bundle.{" "}
              <a href={withBase("/documentation/")}>
                Read the protocol in the documentation →
              </a>
            </p>
          </div>
          <div className="lp-und-col" data-reveal="" data-delay="240">
            <h3>Why it matters</h3>
            <ul className="lp-und-list">
              <li>
                <b>Structured, not scanned</b>
                <span>
                  Claims travel as coded data rather than PDFs and images, so
                  payers can auto-adjudicate routine cases and both sides see
                  fewer queries.
                </span>
              </li>
              <li>
                <b>Lower cost and time</b>
                <span>
                  Automation cuts processing cost and turnaround, reduces manual
                  error and gives the data quality that fraud control and
                  analytics need.
                </span>
              </li>
              <li>
                <b>Records stay with the hospital</b>
                <span>
                  Clinical and financial records remain in hospital systems;
                  claim data flows natively into billing and accounts,
                  simplifying audits and reconciliation.
                </span>
              </li>
              <li>
                <b>Open and non-repudiable</b>
                <span>
                  Open APIs, digital signatures on every event, an audit log
                  every participant can query, and a public registry of who is
                  on the exchange.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
