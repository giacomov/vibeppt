import type { ReactNode } from 'react'

export interface BulletSlideProps {
  bullets: string[]
  header?: ReactNode
}

export function BulletSlide({ bullets, header }: BulletSlideProps): ReactNode {
  return (
    <div className="w-full h-full bg-background flex flex-col overflow-hidden" style={{ padding: '60px 80px' }}>
      {header && <div className="flex-shrink-0 mb-10">{header}</div>}

      {/* Bullets */}
      <div className="flex flex-col justify-center flex-1 gap-0">
        {bullets.map((bullet, i) => (
          <div key={i} className="flex items-start gap-6 py-5 border-b border-surface first:border-t">
            {/* Number */}
            <div className="flex-shrink-0 w-12">
              <span
                className="font-mono font-medium text-accent"
                style={{ fontSize: '13px', letterSpacing: '0.12em', opacity: 0.8 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Text */}
            <p
              className="font-body text-slide-text leading-snug"
              style={{ fontSize: '21px', paddingTop: '1px' }}
            >
              {bullet}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
