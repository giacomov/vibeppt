import type { ReactNode } from 'react'
import { SplitFlapBulletSlide } from '../../src/templates/splitflap/SplitFlapBulletSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Agenda = (): ReactNode => (
  <SplitFlapBulletSlide
    header={<SectionTitle title="Six Paradigm Shifts" eyebrow="2025" />}
    bullets={[
      'RLVR — teaching machines to reason',
      'Ghosts vs. Animals — a new kind of intelligence',
      'Cursor — the LLM app layer',
      'Claude Code — AI on your computer',
      'Vibe coding — everyone is a programmer',
      'Nano banana — the LLM GUI',
    ]}
  />
)

Agenda.meta = {
  title: 'Agenda',
  notes: 'Six paradigm changes from Karpathy\'s review. Split-flap reveals each one.',
} satisfies SlideMeta

export default Agenda
