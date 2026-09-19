import { linkDirectory } from '../content'
import { ARROW_OUT } from './icons'

/** Links to other sites open in a new tab; the sandbox's own tools do not. */
const isExternal = (url: string) => /^https?:/.test(url)

export function LinkDirectory() {
  return (
    <>
      <section id="top" className="sbx-hero sbx-page-hero" aria-labelledby="links-title" tabIndex={-1}>
        <div className="marketing-container">
          <p className="sbx-eyebrow">{linkDirectory.eyebrow}</p>
          <h1 id="links-title">{linkDirectory.title}</h1>
          <p className="sbx-hero-description">{linkDirectory.description}</p>
        </div>
      </section>
      <section className="sbx-section sbx-links" aria-label={linkDirectory.eyebrow}>
        <div className="marketing-container sbx-links-grid">
          {linkDirectory.groups.map((group) => (
            <section key={group.title} className="sbx-links-group" aria-label={group.title}>
              <h2>{group.title}</h2>
              {group.description && <p className="sbx-links-group-description">{group.description}</p>}
              <ul role="list">
                {group.items.map((item) => (
                  <li key={item.title}>
                    <a href={item.url} {...(isExternal(item.url) ? { target: '_blank', rel: 'noopener' } : {})}>
                      <span className="sbx-links-text">
                        <strong>{item.title}</strong>
                        {item.description && <span>{item.description}</span>}
                      </span>
                      <span className="sbx-links-type">{item.type}</span>
                      <span className="sbx-links-arrow" aria-hidden="true">
                        {isExternal(item.url) ? ARROW_OUT : '→'}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  )
}
