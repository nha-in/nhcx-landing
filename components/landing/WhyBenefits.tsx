/*
 * "Why does this benefit": three cards carried over from the previous
 * landing page. Each shows a small mock of the product on its face and flips
 * to its claim, reasoning and proof points on hover or keyboard focus. The
 * flip is CSS only (styles/landing.css, "why does this benefit").
 */

type Point = { title: string; text?: string };
type Card = {
  tone: 'warm' | 'cool' | 'mint';
  tag: string;
  ariaLabel: string;
  sub: { lead: string; accent: string; tail: string };
  over: { before: string; strong: string; after: string };
  text: string;
  points: Point[];
};

const CARDS: Card[] = [
  {
    tone: 'warm',
    tag: 'Standardisation',
    ariaLabel: 'Standardisation: every claim speaks the same language',
    sub: { lead: 'One standard for every', accent: 'claim', tail: '' },
    over: { before: 'Every ', strong: 'claim', after: ' speaks the same language' },
    text: 'NHCX uses FHIR-based standards and internationally accepted coding practices, so provider and payer systems can exchange health information in a common, machine-readable format, without losing its meaning across systems.',
    points: [
      { title: 'One common structure', text: 'Health information follows a consistent FHIR-based format.' },
      { title: 'Zero ambiguity', text: 'Standardised codes preserve the meaning of clinical information.' },
      { title: 'Works across systems', text: 'Different technology stacks exchange the same information.' },
    ],
  },
  {
    tone: 'cool',
    tag: 'Structured data',
    ariaLabel: 'Structured data: data a system can read, not a page to re-type',
    sub: { lead: 'Send', accent: 'data', tail: ', not documents' },
    over: { before: 'Data a system can ', strong: 'read', after: ', not a page to re-type' },
    text: 'Diagnoses, procedures, drugs and bill lines travel as coded values: priced and checked automatically instead of opened and read.',
    points: [{ title: 'Coded at source' }, { title: 'Nothing lost in transit' }, { title: 'Signed and audit-ready' }],
  },
  {
    tone: 'mint',
    tag: 'Automation & AI assistance',
    ariaLabel: 'Automation and AI assistance: fewer queries, faster decisions',
    sub: { lead: 'More accuracy,', accent: 'less', tail: ' resistance' },
    over: { before: 'Fewer queries, ', strong: 'faster', after: ' decisions' },
    text: 'Validated claims in line with Payer expectations; reducing gaps in communication leading to quick and accurate adjudication.',
    points: [{ title: 'Fair and transparent cycles' }, { title: 'Minimal query and rejection' }, { title: 'Lower TAT, better patient care and reap the benefits of NHCX' }],
  },
];

const REGISTER = {
  url: 'nhcx.abdm.gov.in/claims',
  title: 'Claim register',
  standard: 'FHIR R4',
  rows: [
    ['CLM-40912', 'ok', 'Approved'],
    ['CLM-40913', 'review', 'In review'],
    ['CLM-40915', 'ok', 'Approved'],
    ['CLM-40921', 'query', 'Query'],
    ['CLM-40928', 'ok', 'Approved'],
    ['CLM-40931', 'review', 'In review'],
    ['CLM-40934', 'ok', 'Approved'],
    ['CLM-40940', 'ok', 'Approved'],
  ],
};
const PHONE = {
  label: 'Pre-auth',
  amount: '₹48,600',
  facts: [
    ['Package', 'HBP 2.0'],
    ['Room', 'Semi-private'],
    ['Stay', '3 days'],
  ],
  button: 'Submit',
};
const TABLE = {
  head: ['Field', 'Coded value'],
  rows: [
    ['Diagnosis', 'ICD-10 · I21.0'],
    ['Procedure', 'SNOMED · 232717009'],
    ['Creatinine', 'LOINC · 2160-0'],
  ],
};
const BARS = {
  items: [
    ['Auto-adjudicated', 78, ''],
    ['Queries raised', 9, 'teal'],
  ] as Array<[string, number, string]>,
  note: 'Bundle checked against payer rules before it leaves the hospital.',
};

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" />
      <path d="M5.3 8.2l1.9 1.9 3.5-4" />
    </svg>
  );
}

function Dots() {
  return (
    <span className="bx-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function Mock({ card }: { card: Card }) {
  if (card.tone === 'warm') {
    return (
      <div className="bx-mock-wrap" aria-hidden="true">
        <div className="bx-mock">
          <div className="bx-mock-bar">
            <Dots />
            <span className="bx-mock-url">{REGISTER.url}</span>
          </div>
          <div className="bx-mock-head">
            <b>{REGISTER.title}</b>
            <i>{REGISTER.standard}</i>
          </div>
          <div className="bx-rows">
            {REGISTER.rows.map(([id, tone, label]) => (
              <div className="bx-row" key={id}>
                <code>{id}</code>
                <span className={`bx-pill ${tone}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bx-phone">
          <div className="bx-phone-screen">
            <div className="bx-phone-notch">
              <span />
            </div>
            <div className="bx-phone-body">
              <div className="bx-phone-label">{PHONE.label}</div>
              <div className="bx-phone-amount">{PHONE.amount}</div>
              <div className="bx-phone-facts">
                {PHONE.facts.map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <div className="bx-phone-btn">{PHONE.button}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (card.tone === 'cool') {
    return (
      <div className="bx-mock" aria-hidden="true">
        <div className="bx-mock-bar">
          <Dots />
        </div>
        <div className="bx-table">
          <div className="bx-table-head">
            {TABLE.head.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {TABLE.rows.map(([label, code]) => (
            <div className="bx-table-row" key={label}>
              <span>{label}</span>
              <code>{code}</code>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bx-mock" aria-hidden="true">
      <div className="bx-mock-bar">
        <Dots />
      </div>
      <div className="bx-bars">
        {BARS.items.map(([label, percent, tone]) => (
          <div key={label}>
            <div className="bx-bar-label">
              <span>{label}</span>
              <b>{percent}%</b>
            </div>
            <div className="bx-bar">
              <i className={tone || undefined} style={{ width: `${percent}%` }} />
            </div>
          </div>
        ))}
        <div className="bx-mock-note">{BARS.note}</div>
      </div>
    </div>
  );
}

function CardView({ card }: { card: Card }) {
  return (
    <article className={`bx-card is-${card.tone}`} tabIndex={0} aria-label={card.ariaLabel}>
      <div className="bx-face">
        <div className="bx-tag">{card.tag}</div>
        <div className="bx-sub">
          {card.sub.lead} <span>{card.sub.accent}</span>
          {card.sub.tail}
        </div>
        <Mock card={card} />
      </div>
      <div className="bx-over">
        <h3>
          {card.over.before}
          <strong>{card.over.strong}</strong>
          {card.over.after}
        </h3>
        <p>{card.text}</p>
        <ul className="bx-points">
          {card.points.map((p) => (
            <li key={p.title}>
              <Check />
              <div>
                <b>{p.title}</b>
                {p.text && <span>{p.text}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function WhyBenefits() {
  const [lead, ...rest] = CARDS;
  return (
    <section className="bx" aria-labelledby="bx-title">
      <div className="wrap">
        <h2 className="bx-title" id="bx-title">
          NHCX for every Hospital, every Insurance company, every Insurance scheme. <span>Embrace the future in cashless claims settlement, save on time, cost and efforts.</span>
        </h2>
        <div className="bx-grid">
          <CardView card={lead} />
          <div className="bx-stack">
            {rest.map((card) => (
              <CardView card={card} key={card.tag} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
