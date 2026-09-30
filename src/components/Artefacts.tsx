import { artefacts } from '../content'

export function Artefacts() {
  return (
    <section id="artefacts" className="sbx-section sbx-ai" aria-labelledby="artefacts-title" tabIndex={-1}>
      <div className="marketing-container">
        <div className="sbx-section-intro">
          <p className="sbx-eyebrow">01 / {artefacts.eyebrow}</p>
          <h2 id="artefacts-title">{artefacts.title}</h2>
          <p className="sbx-section-description">{artefacts.description}</p>
        </div>
        <div className="sbx-ai-features">
          {artefacts.items.map((item, index) => (
            <div key={item.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
