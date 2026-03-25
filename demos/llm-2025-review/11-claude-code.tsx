import type { ReactNode } from 'react'
import { CardSlide } from '../../src/templates/cards/CardSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const ClaudeCode = (): ReactNode => (
  <CardSlide
    header={<SectionTitle title="Claude Code" eyebrow="Paradigm 4" subtitle="AI that lives on your computer" />}
    cards={[
      { rank: 'A', suit: '♠', emoji: '🏠', headline: 'Runs on localhost',  body: 'Your env, secrets, config — already there',           rotation: -4 },
      { rank: 'K', suit: '♥', emoji: '🔄', headline: 'Loops & reasons',   body: 'Strings tool use into extended problem solving',      rotation: -1 },
      { rank: 'Q', suit: '♦', emoji: '👻', headline: 'A new paradigm',    body: "Not a website you visit — a spirit that lives with you", rotation: 1 },
      { rank: 'J', suit: '♣', emoji: '⌨️', headline: 'Minimal CLI',       body: 'Delightful form factor changes what AI feels like',   rotation: 4 },
    ]}
  />
)

ClaudeCode.meta = {
  title: 'Claude Code',
  notes: 'Claude Code is the first convincing LLM agent. localhost > cloud containers at current capability levels.',
} satisfies SlideMeta

export default ClaudeCode
