// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { ProblemSolutionSlide } from './ProblemSolutionSlide'
import { SectionTitle } from '../common/SlideTitle'

export function ProblemSolutionSlideExample(): ReactNode {
  return (
    <ProblemSolutionSlide
      header={<SectionTitle title="Why We're Rebuilding Search" />}
      problem={{
        points: [
          'Results take 4+ seconds to load',
          'No semantic understanding — exact match only',
          'Zero personalization across sessions',
        ],
      }}
      solution={{
        points: [
          'Sub-200ms latency via edge caching',
          'Vector embeddings for intent matching',
          'Session-aware ranking model',
        ],
      }}
    />
  )
}
