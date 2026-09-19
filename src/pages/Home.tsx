import { Artefacts } from '../components/Artefacts'
import { FinalCta } from '../components/FinalCta'
import { Hero } from '../components/Hero'
import { Journey } from '../components/Journey'
import { Lifecycle } from '../components/Lifecycle'
import { Participants } from '../components/Participants'
import { Pmjay } from '../components/Pmjay'
import { Shell } from './Shell'

export function Home() {
  return (
    <Shell page="home">
      <Hero />
      <Participants />
      <Artefacts />
      <Lifecycle />
      <Pmjay />
      <Journey />
      <FinalCta />
    </Shell>
  )
}
