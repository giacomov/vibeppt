import type { Deck } from '../../src/types/slide'

import Title from './01-title'
import Agenda from './02-agenda'
import SectionRlvr from './03-section-rlvr'
import TrainingStack from './04-training-stack'
import RlvrPower from './05-rlvr-power'
import SectionIntelligence from './06-section-intelligence'
import GhostsVsAnimals from './07-ghosts-vs-animals'
import Jagged from './08-jagged'
import SectionApps from './09-section-apps'
import Cursor from './10-cursor'
import ClaudeCode from './11-claude-code'
import SectionVibe from './12-section-vibe'
import VibeCoding from './13-vibe-coding'
import LlmGui from './14-llm-gui'
import Takeaways from './15-takeaways'
import End from './16-end'

export const deck: Deck = {
  title: '2025 LLM Year in Review',
  theme: { accent: '#22D3EE' },
  slides: [
    Title,
    Agenda,
    SectionRlvr,
    TrainingStack,
    RlvrPower,
    SectionIntelligence,
    GhostsVsAnimals,
    Jagged,
    SectionApps,
    Cursor,
    ClaudeCode,
    SectionVibe,
    VibeCoding,
    LlmGui,
    Takeaways,
    End,
  ],
}
