import type { ReactNode } from 'react'
import { StackSlide } from '../../src/templates/stack/StackSlide'
import type { SlideMeta } from '../../src/types/slide'

const TrainingStack = (): ReactNode => (
  <StackSlide
    levels={[
      {
        title: 'RLVR',
        tag: 'NEW IN 2025',
        description: 'Train on verifiable rewards — reasoning emerges spontaneously',
        color: '#22D3EE',
        items: [
          { label: 'Math puzzles', description: 'objective, non-gameable rewards' },
          { label: 'Code execution', description: 'pass/fail verification' },
        ],
      },
      {
        title: 'RLHF',
        tag: 'SINCE 2022',
        description: 'Human feedback shapes helpfulness and safety',
        color: '#818CF8',
        items: [
          { label: 'Preference ranking', description: 'humans pick better outputs' },
          { label: 'Reward model', description: 'trained on human votes' },
        ],
      },
      {
        title: 'Supervised Fine-Tuning',
        tag: 'SINCE 2022',
        description: 'Instruction following from curated examples',
        color: '#6EE7B7',
        items: [
          { label: 'Instruction pairs', description: 'prompt → ideal response' },
          { label: 'Chat format', description: 'conversational turn structure' },
        ],
      },
      {
        title: 'Pretraining',
        tag: 'SINCE 2020',
        description: "Compresses humanity's text into model weights",
        color: '#FCA5A5',
        items: [
          { label: 'Internet-scale text', description: 'books, code, web pages' },
          { label: 'Next-token prediction', description: 'the foundational objective' },
        ],
      },
    ]}
    groups={[
      { label: 'THE 2025 ADDITION', color: '#22D3EE', from: 0, to: 0 },
      { label: 'ESTABLISHED STACK', color: '#818CF8', from: 1, to: 3 },
    ]}
  />
)

TrainingStack.meta = {
  title: 'Training Stack',
  notes: 'RLVR is the new major stage added in 2025 on top of the existing SFT+RLHF stack.',
} satisfies SlideMeta

export default TrainingStack
