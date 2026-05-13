import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'
import { NumberedRows } from '../common/NumberedRows'

export interface BulletSlideProps {
  bullets: string[]
  header?: ReactNode
}

export function BulletSlide({ bullets, header }: BulletSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      <NumberedRows
        items={bullets}
        renderItem={(bullet) => (
          <p
            className="font-body text-slide-text leading-snug"
            style={{ fontSize: '21px', paddingTop: '1px' }}
          >
            {bullet}
          </p>
        )}
      />
    </SlideLayout>
  )
}
