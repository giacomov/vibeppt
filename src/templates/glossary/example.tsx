import type { ReactNode } from 'react'
import { GlossarySlide } from './GlossarySlide'
import { SectionTitle } from '../common/SlideTitle'

export function GlossarySlideExample(): ReactNode {
  return (
    <GlossarySlide
      header={<SectionTitle title="Key Terms" icon="📖" />}
      terms={[
        {
          term: 'Prompt Engineering',
          icon: '🎯',
          definition:
            'The practice of crafting inputs to large language models to elicit desired outputs — combining clarity, context, and constraints.',
        },
        {
          term: 'Context Window',
          icon: '🪟',
          definition:
            'The maximum amount of text (measured in tokens) a model can read and generate in a single conversation turn.',
        },
        {
          term: 'Hallucination',
          icon: '🌀',
          definition:
            'When a model generates plausible-sounding but factually incorrect or fabricated information with apparent confidence.',
        },
        {
          term: 'Fine-Tuning',
          icon: '🔧',
          definition:
            'Adapting a pre-trained model to a specific task or domain by training it further on a curated dataset.',
        },
      ]}
    />
  )
}
