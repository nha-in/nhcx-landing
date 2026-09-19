import { lifecycle } from '../content'
import { IdentityIcon } from './icons'

export function Lifecycle() {
  return (
    <section id="stages" className="sbx-section sbx-milestones" aria-labelledby="stages-title" tabIndex={-1}>
      <div className="marketing-container">
        <div className="sbx-section-intro">
          <p className="sbx-eyebrow">02 / {lifecycle.eyebrow}</p>
          <h2 id="stages-title">{lifecycle.title}</h2>
          <p className="sbx-section-description">{lifecycle.description}</p>
        </div>
        <div className="sbx-milestone-grid">
          {lifecycle.stages.map((stage) => (
            <article key={stage.badge} className="sbx-milestone">
              <div className="sbx-milestone-marker">
                <span>{stage.badge}</span>
              </div>
              <span className="sbx-milestone-role">{stage.tag}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </article>
          ))}
        </div>
        <div className="sbx-phr-note">
          <span className="sbx-phr-icon" aria-hidden="true">
            <IdentityIcon />
          </span>
          <p>{lifecycle.note}</p>
        </div>
      </div>
    </section>
  )
}
