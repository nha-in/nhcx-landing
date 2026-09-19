import type { ReactNode } from 'react'
import type { ParticipantIcon, SocialIcon } from '../content'

/** Text-presentation arrow, so it never renders as a colour emoji. */
export const ARROW_OUT = '↗︎'

export function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" />
    </svg>
  )
}

export function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a6 6 0 0 0-6 6v3.1c0 .5-.2 1-.6 1.4L4 14v1h16v-1l-1.4-1.5c-.4-.4-.6-.9-.6-1.4V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" />
    </svg>
  )
}

export function SitemapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="19" r="2.2" />
      <circle cx="19" cy="19" r="2.2" />
      <path d="M12 7.2V13M12 13 6 17M12 13l6 4" />
    </svg>
  )
}

export function ScreenReaderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 3l18 18M9.9 5.1A9.4 9.4 0 0 1 12 5c5 0 8.5 3.5 9.5 5-.4.6-1.4 2-3 3.2M6.5 6.6C4.8 7.8 3.7 9.3 2.5 10c1 1.5 4.5 5 9.5 5 1 0 1.9-.1 2.7-.4M9.9 12.1a2.5 2.5 0 0 0 3.5 3.5" />
    </svg>
  )
}

export function ContrastIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20V2Z" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

const participantPaths: Record<ParticipantIcon, ReactNode> = {
  provider: (
    <>
      <path d="M5 28V8a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v20M3 28h26" />
      <path d="M16 10v7M12.5 13.5h7M13 28v-6h6v6" />
    </>
  ),
  payer: (
    <>
      <path d="m16 3 11 4v9c0 7-11 13-11 13S5 23 5 16V7l11-4Z" />
      <path d="m11 16 4 4 7-8" />
    </>
  ),
  beneficiary: (
    <>
      <circle cx="16" cy="10" r="5" />
      <path d="M5 28c1-6 5.5-9 11-9s10 3 11 9" />
    </>
  ),
}

export function ParticipantSymbol({ icon }: { icon: ParticipantIcon }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {participantPaths[icon]}
    </svg>
  )
}

export function SparkleIcon() {
  return (
    // Two stars as separate paths so they can twinkle out of step.
    <svg className="sbx-sparkle" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2Z" />
      <path d="m19 14 .9 2.8 2.8 1.2-2.8.9-.9 2.8-.9-2.8-2.8-.9 2.8-1.2L19 14Z" />
    </svg>
  )
}

export function IdentityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M15 10h3M15 14h3" />
    </svg>
  )
}

const socialIcons: Record<SocialIcon, ReactNode> = {
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.98H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.89h-2.4v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.8 15.5V8.5L16 12z" />
    </svg>
  ),
  x: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.24 3H21l-6.55 7.49L22 21h-6.19l-4.84-6.33L5.4 21H2.63l7.02-8.03L2 3h6.34l4.37 5.78L18.24 3Zm-1.08 16h1.53L7 5h-1.6l11.76 14Z" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" />
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.65 4.78 6.1V21H17.4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9.6V9Z" />
    </svg>
  ),
}

export function SocialGlyph({ icon }: { icon: SocialIcon }) {
  return <span aria-hidden="true">{socialIcons[icon]}</span>
}
