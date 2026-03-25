import type { ReactNode } from 'react'

export interface SlideMeta {
  title?: string
  notes?: string
}

export interface ThemeOverride {
  accent?: string
  background?: string
  surface?: string
  text?: string
  muted?: string
  fontDisplay?: string
  fontBody?: string
}

export type SlideComponent = (() => ReactNode) & { meta?: SlideMeta }

export interface Deck {
  title: string
  theme?: ThemeOverride
  slides: SlideComponent[]
}
