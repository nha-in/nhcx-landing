import { FinalCta } from '../components/FinalCta'
import { LinkDirectory } from '../components/LinkDirectory'
import { Shell } from './Shell'

export function LinksPage() {
  return (
    <Shell page="links">
      <LinkDirectory />
      <FinalCta />
    </Shell>
  )
}
