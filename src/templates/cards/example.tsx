// Reference example — not rendered by the app, just a filled-in model to copy from.
import type { ReactNode } from 'react'
import { CardSlide } from './CardSlide'
import { SectionTitle } from '../common/SlideTitle'

export function CardSlideExample(): ReactNode {
  return (
    <CardSlide
      header={<SectionTitle eyebrow="Limitations" title="Voice Agents" subtitle="Amazing — but limited." />}
      cards={[
        { rank: '10', suit: '♠', emoji: '💰', headline: 'Expensive',           body: 'Real-time inference at scale adds up fast',                  rotation: -3 },
        { rank: '10', suit: '♥', emoji: '⏰', headline: '~10 min max',         body: 'Hard session length ceiling, by design',                    rotation: -1 },
        { rank: '8',  suit: '♦', emoji: '🌀', headline: 'Prompt sensitive',    body: 'Long or complex prompts cause confusion and drift',          rotation: 0  },
        { rank: '8',  suit: '♣', emoji: '📦', headline: 'No structured output',body: "Can't reliably return JSON or typed data",                   rotation: 2  },
        { rank: '4',  suit: '♠', emoji: '🔧', headline: 'Limited tool use',    body: 'Tool calls and API calls are constrained in real-time voice', rotation: 2  },
        { rank: '3',  suit: '♥', emoji: '🎲', headline: 'Hallucination-prone', body: 'Audio modality amplifies confabulation risk',                rotation: 3  },
      ]}
    />
  )
}
