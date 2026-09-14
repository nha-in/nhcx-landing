/*
 * "Why does this benefit": three cards carried over from the previous
 * landing page. Each shows a small mock of the product on its face and flips
 * to its claim, reasoning and proof points on hover or keyboard focus. The
 * flip is CSS only (styles/landing.css, "why does this benefit").
 */

import { WHY, type WhyCard } from '@/lib/home-copy';

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

function Mock({ card }: { card: WhyCard }) {
  const { register, phone, table, bars } = WHY;
  if (card.tone === 'warm') {
    return (
      <div className="bx-mock-wrap" aria-hidden="true">
        <div className="bx-mock">
          <div className="bx-mock-bar">
            <Dots />
            <span className="bx-mock-url">{register.url}</span>
          </div>
          <div className="bx-mock-head">
            <b>{register.title}</b>
            <i>{register.standard}</i>
          </div>
          <div className="bx-rows">
            {register.rows.map((row) => (
              <div className="bx-row" key={row.id}>
                <code>{row.id}</code>
                <span className={`bx-pill ${row.tone}`}>{row.label}</span>
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
              <div className="bx-phone-label">{phone.label}</div>
              <div className="bx-phone-amount">{phone.amount}</div>
              <div className="bx-phone-facts">
                {phone.facts.map((fact) => (
                  <div key={fact.label}>
                    <span>{fact.label}</span>
                    <span>{fact.value}</span>
                  </div>
                ))}
              </div>
              <div className="bx-phone-btn">{phone.button}</div>
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
            {table.head.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {table.rows.map((row) => (
            <div className="bx-table-row" key={row.field}>
              <span>{row.field}</span>
              <code>{row.code}</code>
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
        {bars.items.map((bar) => (
          <div key={bar.label}>
            <div className="bx-bar-label">
              <span>{bar.label}</span>
              <b>{bar.percent}%</b>
            </div>
            <div className="bx-bar">
              <i className={bar.tone || undefined} style={{ width: `${bar.percent}%` }} />
            </div>
          </div>
        ))}
        <div className="bx-mock-note">{bars.note}</div>
      </div>
    </div>
  );
}

function CardView({ card }: { card: WhyCard }) {
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
  const [lead, ...rest] = WHY.cards;
  return (
    <section className="bx" aria-labelledby="bx-title">
      <div className="wrap">
        <h2 className="bx-title" id="bx-title">
          {WHY.titleLead} <span>{WHY.titleAccent}</span>
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
