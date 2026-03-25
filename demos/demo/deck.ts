import type { Deck } from '../../src/types/slide'
import Title from './title'
import HowItWorks from './how-it-works'
import Templates from './templates'
import Theming from './theming'
import DeckContract from './deck-contract'
import GetStarted from './get-started'
import SplitFlap from './splitflap'
import Flow from './flow'
import ImageDemo from './image'
import ChartDemo from './chart'
import CardsDemo from './cards'
import CompareDemo from './compare'
import EmbedDemo from './embed'
import PrismDemo from './prism'
import StackDemo from './stack'
import GlossaryDemo from './glossary'
import HeatmapDemo from './heatmap'
import TemperatureDemo from './temperature'
import CycleDemo from './cycle'
import KeyTakeawayDemo from './keytakeaway'
import SectionTitleDemo from './sectiontitle'
import TheEndDemo from './theend'

export const deck: Deck = {
  title: 'VibePPT',
  theme: { accent: '#6EE7B7' },
  slides: [Title, HowItWorks, Templates, Theming, DeckContract, GetStarted, SplitFlap, Flow, ImageDemo, ChartDemo, CardsDemo, CompareDemo, EmbedDemo, PrismDemo, StackDemo, GlossaryDemo, HeatmapDemo, TemperatureDemo, CycleDemo, KeyTakeawayDemo, SectionTitleDemo, TheEndDemo],
}
