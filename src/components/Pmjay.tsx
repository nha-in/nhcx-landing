import { links, pmjay } from '../content'
import { ARROW_OUT } from './icons'

export function Pmjay() {
  return (
    <section id="pmjay" className="sbx-section sbx-ai sbx-pmjay" aria-labelledby="pmjay-title" tabIndex={-1}>
      <div className="marketing-container sbx-pmjay-grid">
        <div>
          <p className="sbx-eyebrow">{pmjay.eyebrow}</p>
          <h2 id="pmjay-title">{pmjay.title}</h2>
          <p className="sbx-section-description">{pmjay.description}</p>
          <div className="marketing-actions">
            <a
              className="marketing-button marketing-button--primary"
              href={links.nha}
              target="_blank"
              rel="noopener"
            >
              {pmjay.cta}
              <span aria-hidden="true">{ARROW_OUT}</span>
            </a>
          </div>
        </div>
        <dl className="sbx-pmjay-facts">
          {pmjay.facts.map((fact) => (
            <div key={fact.value}>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
