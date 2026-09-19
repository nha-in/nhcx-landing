import { finalCta, links } from '../content'
import { ARROW_OUT } from './icons'

export function FinalCta() {
  return (
    <section id="register" className="sbx-final" aria-labelledby="register-title" tabIndex={-1}>
      <div className="marketing-container">
        <div className="sbx-final-panel">
          <div>
            <h2 id="register-title">{finalCta.title}</h2>
            <p>{finalCta.description}</p>
          </div>
          <div className="sbx-final-actions">
            <a className="marketing-button marketing-button--primary" href={links.register}>
              {finalCta.primary}
              <span aria-hidden="true">→</span>
            </a>
            <a className="marketing-button marketing-button--secondary" href={links.documentation}>
              {finalCta.secondary}
              <span aria-hidden="true">{ARROW_OUT}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
