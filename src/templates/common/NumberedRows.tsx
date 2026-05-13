import type { ReactNode } from 'react'

export interface NumberedRowsProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  // Row vertical alignment. AgendaSlide uses 'center' so its optional time
  // column aligns to the label baseline; bullets default to 'start'.
  align?: 'start' | 'center'
}

export function NumberedRows<T>({
  items,
  renderItem,
  align = 'start',
}: NumberedRowsProps<T>): ReactNode {
  const alignClass = align === 'center' ? 'items-center' : 'items-start'
  return (
    <div className="flex flex-col justify-center flex-1 gap-0">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex ${alignClass} gap-6 py-5 border-b border-surface first:border-t`}
        >
          <div className="flex-shrink-0 w-12">
            <span
              className="font-mono font-medium text-accent"
              style={{ fontSize: '13px', letterSpacing: '0.12em', opacity: 0.8 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  )
}
