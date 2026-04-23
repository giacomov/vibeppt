import type { ReactNode } from 'react'
import { ProblemSolutionSlide } from '../../src/templates/problemsolution/ProblemSolutionSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const ProblemSolutionDemo = (): ReactNode => (
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

ProblemSolutionDemo.meta = {
  title: 'ProblemSolutionSlide Demo',
  notes: 'ProblemSolutionSlide frames two panes side-by-side. Problem items render with X icons in muted; solution items render with Check icons in accent. Optional label per pane overrides defaults.',
} satisfies SlideMeta

export default ProblemSolutionDemo
