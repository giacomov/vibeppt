import type { ReactNode } from 'react'
import { SlideLayout } from '../common/SlideLayout'
import { NumberedRows } from '../common/NumberedRows'

export interface AgendaItem {
  label: string
  time?: string
}

export interface AgendaSlideProps {
  header?: ReactNode
  items: AgendaItem[]
}

export function AgendaSlide({ header, items }: AgendaSlideProps): ReactNode {
  return (
    <SlideLayout header={header}>
      <NumberedRows
        items={items}
        align="center"
        renderItem={(item) => (
          <>
            <p
              className="font-body text-slide-text leading-snug flex-1"
              style={{ fontSize: '21px', paddingTop: '1px' }}
            >
              {item.label}
            </p>
            {item.time && (
              <span
                className="font-mono text-muted flex-shrink-0"
                style={{ fontSize: '13px', letterSpacing: '0.08em' }}
              >
                {item.time}
              </span>
            )}
          </>
        )}
      />
    </SlideLayout>
  )
}
