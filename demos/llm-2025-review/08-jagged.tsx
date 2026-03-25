import type { ReactNode } from 'react'
import { TemperatureSlide } from '../../src/templates/temperature/TemperatureSlide'
import { SectionTitle } from '../../src/templates/common/SlideTitle'
import type { SlideMeta } from '../../src/types/slide'

const Jagged = (): ReactNode => (
  <TemperatureSlide
    header={<SectionTitle title="Jagged Intelligence" subtitle="Same model — vastly different capability by domain" />}
    leftLabel="Superhuman"
    rightLabel="Grade School"
    coldColor="#22D3EE"
    warmColor="#EF4444"
    points={[
      {
        position: 5,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Competition math</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Beats world champions</p>
          </div>
        ),
      },
      {
        position: 22,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Code generation</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Ships production software</p>
          </div>
        ),
      },
      {
        position: 55,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Common sense</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Inconsistent, trips up</p>
          </div>
        ),
      },
      {
        position: 85,
        content: (
          <div>
            <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Simple jailbreaks</p>
            <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Easily fooled</p>
          </div>
        ),
      },
    ]}
  />
)

Jagged.meta = {
  title: 'Jagged Intelligence',
  notes: 'The same model that beats competition math can be jailbroken by a grade schooler.',
} satisfies SlideMeta

export default Jagged
