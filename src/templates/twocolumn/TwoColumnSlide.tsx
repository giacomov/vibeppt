import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'

export interface ColumnContent {
  title?: string
  items: string[] | ReactNode
}

export interface TwoColumnSlideProps {
  header?: ReactNode
  left: ColumnContent
  right: ColumnContent
  ratio?: '50/50' | '40/60' | '60/40'
}

function ColumnItems({ items }: { items: string[] | ReactNode }) {
  if (Array.isArray(items)) {
    return (
      <div className="flex flex-col gap-0">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-5 py-4 border-b border-surface first:border-t">
            <span
              className="font-mono font-medium text-accent flex-shrink-0 w-10"
              style={{ fontSize: '13px', letterSpacing: '0.12em', opacity: 0.8 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="font-body text-slide-text leading-snug" style={{ fontSize: '20px' }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return <>{items}</>
}

const RATIO_CLASSES: Record<'50/50' | '40/60' | '60/40', string> = {
  '50/50': 'grid-cols-2',
  '40/60': 'grid-cols-[2fr_3fr]',
  '60/40': 'grid-cols-[3fr_2fr]',
}

export function TwoColumnSlide({ header, left, right, ratio = '50/50' }: TwoColumnSlideProps): ReactNode {
  const gridClass = RATIO_CLASSES[ratio]
  const showDivider = ratio === '50/50'

  return (
    <SlideLayout header={header}>
      <div className={`grid ${gridClass} flex-1 gap-0`}>
        <div className={showDivider ? 'pr-10' : 'pr-8'}>
          {left.title && (
            <div className="mb-6">
              <h3 className="font-display font-bold text-slide-text" style={{ fontSize: '22px' }}>
                {left.title}
              </h3>
              <div className="bg-accent mt-2" style={{ height: '2px', width: '32px' }} />
            </div>
          )}
          <ColumnItems items={left.items} />
        </div>

        <div className={showDivider ? 'pl-10 border-l border-surface' : 'pl-8'}>
          {right.title && (
            <div className="mb-6">
              <h3 className="font-display font-bold text-slide-text" style={{ fontSize: '22px' }}>
                {right.title}
              </h3>
              <div className="bg-accent mt-2" style={{ height: '2px', width: '32px' }} />
            </div>
          )}
          <ColumnItems items={right.items} />
        </div>
      </div>
    </SlideLayout>
  )
}
