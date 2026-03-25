import type { ReactNode } from 'react'
import { KeyTakeawaySlide } from './KeyTakeawaySlide'
import { SectionTitle } from '../common/SlideTitle'

// ─── Example: 4 takeaways with header ────────────────────────────────────────
export default function KeyTakeawayExample(): ReactNode {
  return (
    <KeyTakeawaySlide
      header={<SectionTitle title="Key Takeaways" eyebrow="Workshop Recap" />}
      takeaways={[
        'Ship working software first',
        'AI amplifies your craft',
        'Constraints breed creativity',
        'Done beats perfect',
      ]}
    />
  )
}

// ─── Example: 3 takeaways, no header (big text) ──────────────────────────────
export function KeyTakeawayNoHeader(): ReactNode {
  return (
    <KeyTakeawaySlide
      takeaways={[
        'Context is everything',
        'Prompts are product decisions',
        'The loop is the product',
      ]}
    />
  )
}
