import type { ReactNode } from 'react'
import type { SlideMeta } from '../../src/types/slide'
import { TemperatureSlide } from '../../src/templates/temperature/TemperatureSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'

const TemperatureDemo = (): ReactNode => (
  <TemperatureSlide
    header={<SectionTitle title="Complexity Spectrum" subtitle="From simple config to rich interaction" />}
    leftLabel="Minimal"
    rightLabel="Complex"
    points={[
      {
        position: 10,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '15px' }}>Design Tokens</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Plain object, five color keys
            </p>
          </div>
        ),
        examples: (
          <p className="font-mono text-muted" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            accent, background,<br />surface, text, muted
          </p>
        ),
      },
      {
        position: 35,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '15px' }}>deck.ts</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Import slides, set a theme, done
            </p>
          </div>
        ),
        examples: (
          <p className="font-mono text-muted" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            title, theme, slides[]
          </p>
        ),
      },
      {
        position: 65,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '15px' }}>Templates</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Typed props, layout logic, animation
            </p>
          </div>
        ),
        examples: (
          <p className="font-mono text-muted" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            FlowSlide, PrismSlide,<br />TemperatureSlide
          </p>
        ),
      },
      {
        position: 92,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '15px' }}>App Chrome</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Renderer, navigation, presenter view
            </p>
          </div>
        ),
        examples: (
          <p className="font-mono text-muted" style={{ fontSize: '11px', lineHeight: 1.5 }}>
            SlideWrapper,<br />DeckPicker, Navigation
          </p>
        ),
      },
    ]}
  />
)
TemperatureDemo.meta = {
  title: 'TemperatureSlide',
  notes: 'Gauge with positioned markers and content cards. Points appear with staggered animation on mount.',
} satisfies SlideMeta
export default TemperatureDemo
