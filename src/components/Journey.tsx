import { journey } from '../content'

/** Keeps hyphenated words such as "go-live:" on one line. */
function keepHyphenated(text: string) {
  return text.split(' ').map((word, index) => (
    <span key={index} className={word.includes('-') ? 'sbx-nowrap' : undefined}>
      {index > 0 && ' '}
      {word}
    </span>
  ))
}

export function Journey() {
  return (
    <section id="journey" className="sbx-section sbx-journey" aria-labelledby="journey-title" tabIndex={-1}>
      <div className="marketing-container sbx-journey-grid">
        <div className="sbx-journey-intro">
          <p className="sbx-eyebrow">03 / {journey.eyebrow}</p>
          <h2 id="journey-title">{keepHyphenated(journey.title)}</h2>
          <p className="sbx-section-description">{journey.description}</p>
        </div>
        <ol className="sbx-journey-steps" role="list">
          {journey.steps.map((step, index) => (
            <li key={step.title}>
              <span className="sbx-step-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <span className="sbx-step-phase">{step.phase}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <p className="sbx-step-ai">
                  <span aria-hidden="true">✦</span>
                  {step.ai}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
