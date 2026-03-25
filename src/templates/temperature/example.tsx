import type { ReactNode } from 'react'
import { TemperatureSlide } from './TemperatureSlide'
import { SectionTitle } from '../common/SlideTitle'

export function TemperatureSlideExample(): ReactNode {
  return (
    <TemperatureSlide
      header={<SectionTitle title="Vibe Coding Temperature" />}
      leftLabel="Manual"
      rightLabel="Only Vibes"
      points={[
        {
          position: 15,
          content: (
            <div>
              <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Architecture</p>
              <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Manual decisions, full control</p>
            </div>
          ),
        },
        {
          position: 55,
          content: (
            <div>
              <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Core Logic</p>
              <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>AI-assisted, human-reviewed</p>
            </div>
          ),
        },
        {
          position: 85,
          content: (
            <div>
              <p className="font-display font-bold text-slide-text" style={{ fontSize: '14px' }}>Boilerplate</p>
              <p className="font-body text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>Mostly AI-generated</p>
            </div>
          ),
        },
      ]}
    />
  )
}
