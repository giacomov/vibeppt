// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { QuoteSlide } from './QuoteSlide'

export function QuoteSlideExample(): ReactNode {
  return (
    <QuoteSlide
      quote="The best way to predict the future is to invent it."
      attribution="Alan Kay"
      role="Computer Scientist"
    />
  )
}

export function QuoteSlideNoRole(): ReactNode {
  return (
    <QuoteSlide
      quote="Move fast and learn things."
      attribution="Engineering Principles, 2024"
    />
  )
}

export function QuoteSlideShort(): ReactNode {
  return (
    <QuoteSlide
      quote="Done beats perfect."
      attribution="Internal Maxim"
      role="Product Team"
    />
  )
}
