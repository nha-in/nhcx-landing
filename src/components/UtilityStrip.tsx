import { useEffect, useState } from 'react'
import { links, site } from '../content'
import { BellIcon, ContrastIcon, PhoneIcon, ScreenReaderIcon, SitemapIcon } from './icons'

const FONT_STEPS = [90, 100, 112.5, 125]
const DEFAULT_STEP = 1

export function UtilityStrip() {
  const [step, setStep] = useState(DEFAULT_STEP)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    document.documentElement.style.fontSize = step === DEFAULT_STEP ? '' : `${FONT_STEPS[step]}%`
  }, [step])

  useEffect(() => {
    document.documentElement.toggleAttribute('data-contrast', highContrast)
  }, [highContrast])

  return (
    <div className="util-strip">
      <div className="marketing-container util-strip-inner">
        <p className="util-strip-phone">
          <PhoneIcon />
          <span>{site.tollFree}</span>
        </p>
        <div className="util-strip-tools">
          <a href={links.main}>Skip to Main Content</a>
          {links.notifications && (
            <a href={links.notifications} aria-label="Notifications">
              <BellIcon />
            </a>
          )}
          {links.sitemap && (
            <a href={links.sitemap} aria-label="Sitemap">
              <SitemapIcon />
            </a>
          )}
          {links.screenReader && (
            <a href={links.screenReader}>
              <ScreenReaderIcon /> Screen Reader
            </a>
          )}
          <span className="util-strip-fontsize" role="group" aria-label="Text size">
            <button
              type="button"
              aria-label="Increase text size"
              disabled={step === FONT_STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(s + 1, FONT_STEPS.length - 1))}
            >
              +A
            </button>
            <button type="button" aria-label="Reset text size" onClick={() => setStep(DEFAULT_STEP)}>
              A
            </button>
            <button
              type="button"
              aria-label="Decrease text size"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
            >
              -A
            </button>
          </span>
          <button
            type="button"
            aria-label="Toggle contrast"
            aria-pressed={highContrast}
            onClick={() => setHighContrast((on) => !on)}
          >
            <ContrastIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
