// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { ClosingSlide } from './ClosingSlide'

export function ClosingSlideExample(): ReactNode {
  return (
    <ClosingSlide
      cta="Get In Touch"
      headline="Thank You"
      subtitle="Questions? Let's keep the conversation going."
      contact={{
        email: 'ada@lovelace.io',
        website: 'lovelace.io',
        linkedIn: 'in/ada-lovelace',
      }}
    />
  )
}

export function ClosingSlideMinimal(): ReactNode {
  return (
    <ClosingSlide
      headline="Let's Build It"
      subtitle="Reach out to start the conversation."
    />
  )
}

export function ClosingSlideCustomHeadline(): ReactNode {
  return (
    <ClosingSlide
      headline="See You Next Quarter"
      cta="Q4 All Hands"
      contact={{
        website: 'company.com/roadmap',
      }}
    />
  )
}
