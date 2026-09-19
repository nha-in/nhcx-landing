import { participants } from '../content'
import { ARROW_OUT, ParticipantSymbol } from './icons'

export function Participants() {
  return (
    <section
      id="participants"
      className="sbx-section sbx-participants"
      aria-labelledby="participants-title"
      tabIndex={-1}
    >
      <div className="marketing-container">
        <h2 id="participants-title" className="sr-only">
          Participant roles
        </h2>
        <div className="sbx-gateway-grid">
          {participants.map((role) => (
            <a key={role.name} className="sbx-gateway" href={role.href}>
              <div className="sbx-gateway-top">
                <span className="sbx-gateway-symbol" aria-hidden="true">
                  <ParticipantSymbol icon={role.icon} />
                </span>
                <span className="sbx-gateway-category">{role.num}</span>
                <span className="sbx-card-arrow" aria-hidden="true">
                  {ARROW_OUT}
                </span>
              </div>
              <h3>{role.name}</h3>
              <p className="sbx-gateway-full">{role.full}</p>
              <p className="sbx-gateway-description">{role.description}</p>
              <div className="sbx-gateway-bottom">
                <strong>
                  {role.cta}
                  <span aria-hidden="true">→</span>
                </strong>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
