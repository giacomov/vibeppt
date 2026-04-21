import type { ReactNode } from 'react'
import { SplitFlapChar } from '../common/SplitFlapChar'
import { SlideLayout } from '../common/SlideLayout'

export interface SplitFlapBulletSlideProps {
  bullets: string[]
  header?: ReactNode
}

export function SplitFlapBulletSlide({ bullets, header }: SplitFlapBulletSlideProps): ReactNode {
  // Compute base delay for each bullet: sum of preceding bullets' char counts × 40ms + 600ms gap each
  const bulletBaseDelays: number[] = []
  let cumulative = 0
  bullets.forEach((bullet, i) => {
    bulletBaseDelays.push(cumulative)
    if (i < bullets.length - 1) {
      cumulative += bullet.length * 40 + 600
    }
  })

  return (
    <SlideLayout header={header}>
      {/* Bullets */}
      <div className="flex flex-col justify-center flex-1 gap-0">
        {bullets.map((bullet, bulletIdx) => {
          const baseDelay = bulletBaseDelays[bulletIdx]
          return (
            <div key={bulletIdx} className="flex items-start gap-6 py-5 border-b border-surface first:border-t">
              {/* Row number — static */}
              <div className="flex-shrink-0 w-12">
                <span
                  className="font-mono font-medium text-accent"
                  style={{ fontSize: '13px', letterSpacing: '0.12em', opacity: 0.8 }}
                >
                  {String(bulletIdx + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Split-flap characters — grouped by word so flex-wrap never breaks mid-word */}
              <div
                className="flex items-center flex-wrap"
                style={{ fontSize: '21px', paddingTop: '1px', gap: '0.4em', rowGap: '0.3em' }}
              >
                {bullet.split(' ').map((word, wordIdx, words) => {
                  const charOffset = words.slice(0, wordIdx).reduce((acc, w) => acc + w.length + 1, 0)
                  return (
                    <div key={wordIdx} className="flex items-center" style={{ gap: '1px' }}>
                      {word.split('').map((char, charIdx) => (
                        <SplitFlapChar
                          key={charIdx}
                          target={char}
                          delay={baseDelay + (charOffset + charIdx) * 40}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </SlideLayout>
  )
}
