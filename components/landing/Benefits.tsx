import type { BenefitCard, HomeCopy } from '@/lib/site-copy';

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0B7A62" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" />
      <path pathLength="1" d="M5.3 8.2l1.9 1.9 3.5-4" />
    </svg>
  );
}

function Points({ items }: { items: BenefitCard['points'] }) {
  return (
    <ul className="lp-points">
      {items.map((p) => (
        <li key={p.title}>
          <Check />
          <div>
            <b>{p.title}</b>
            {p.text && <span>{p.text}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Dots() {
  return (
    <span className="lp-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/** The face of a card: the illustration differs per card, the frame does not. */
function Face({ card }: { card: BenefitCard }) {
  return (
    <div className="lp-card-base">
      <div className="lp-card-title">{card.tag}</div>
      <div className="lp-card-sub">
        {card.sub.lead} <span>{card.sub.accent}</span>
        {card.sub.tail}
      </div>

      {card.register && card.phone && (
        <div className="lp-mock-wrap" aria-hidden="true">
          <div className="lp-mock">
            <div className="lp-mock-bar">
              <Dots />
              <span className="lp-mock-url">{card.register.url}</span>
            </div>
            <div className="lp-mock-head">
              <b>{card.register.title}</b>
              <i>{card.register.standard}</i>
            </div>
            <div className="lp-rows">
              {card.register.rows.map((row) => (
                <div className="lp-row" key={row.id}>
                  <code>{row.id}</code>
                  <span className={`lp-pill ${row.tone}`}>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-phone">
            <div className="lp-phone-screen">
              <div className="lp-phone-notch">
                <span />
              </div>
              <div className="lp-phone-body">
                <div className="lp-phone-label">{card.phone.label}</div>
                <div className="lp-phone-amount">{card.phone.amount}</div>
                <div className="lp-phone-facts">
                  {card.phone.facts.map((fact) => (
                    <div key={fact.label}>
                      <span>{fact.label}</span>
                      <span>{fact.value}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-phone-btn">{card.phone.button}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {card.table && (
        <div className="lp-mock" aria-hidden="true">
          <div className="lp-mock-bar">
            <Dots />
          </div>
          <div className="lp-table">
            <div className="lp-table-head">
              {card.table.head.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {card.table.rows.map((row) => (
              <div className="lp-table-row" key={row.label}>
                <span>{row.label}</span>
                <code>{row.code}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.bars && (
        <div className="lp-mock" aria-hidden="true">
          <div className="lp-mock-bar">
            <Dots />
          </div>
          <div className="lp-bars">
            {card.bars.items.map((bar) => (
              <div key={bar.label}>
                <div className="lp-bar-label">
                  <span>{bar.label}</span>
                  <b>{bar.percent}%</b>
                </div>
                <div className="lp-bar">
                  <i className={bar.tone || undefined} style={{ width: `${bar.percent}%` }} />
                </div>
              </div>
            ))}
            <div className="lp-mock-note">{card.bars.note}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** What the card says once it flips: the claim, the reasoning and the proof points. */
function Over({ card }: { card: BenefitCard }) {
  return (
    <div className="lp-card-over">
      <h3>
        {card.over.before}
        <strong>{card.over.strong}</strong>
        {card.over.after}
      </h3>
      <p>{card.text}</p>
      <Points items={card.points} />
    </div>
  );
}

/** "Why does this benefit" — three cards that flip to their explanation on hover or focus. */
export default function Benefits({ copy }: { copy: HomeCopy['benefits'] }) {
  const [lead, ...rest] = copy.cards;
  return (
    <section id="benefits" className="lp-benefits" aria-labelledby="benefits-title">
      <div className="lp-wrap">
        <p className="lp-eyebrow" data-reveal="">
          {copy.eyebrow}
        </p>
        <h2 id="benefits-title" data-reveal="" data-delay="60">
          {copy.title} <span>{copy.titleAccent}</span>
        </h2>

        <div className="lp-bgrid">
          <article className={`lp-card ${lead.tone}`} data-reveal="" data-delay="120" tabIndex={0} aria-label={lead.ariaLabel}>
            <Face card={lead} />
            <Over card={lead} />
          </article>

          <div className="lp-bstack">
            {rest.map((card, i) => (
              <article
                key={card.tag}
                className={`lp-card ${card.tone}`}
                data-reveal=""
                data-delay={String(180 + i * 60)}
                tabIndex={0}
                aria-label={card.ariaLabel}
              >
                <Face card={card} />
                <Over card={card} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
