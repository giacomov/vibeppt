import type { ReactNode, CSSProperties, HTMLAttributes } from 'react'

export interface SlideLayoutProps {
  children: ReactNode
  header?: ReactNode
  [key: string]: unknown
}

/**
 * Shared root wrapper for content slide templates.
 * Provides uniform padding and optional header rendering.
 * Extra props are spread onto the root div (e.g. onClick, role, tabIndex).
 * Pass `style` to add additional styles — they merge with the base padding.
 */
export function SlideLayout({ children, header, style, ...rest }: SlideLayoutProps): ReactNode {
  return (
    <div
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      style={{ padding: '60px 80px', ...(style as CSSProperties | undefined) }}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {header && <div className="flex-shrink-0 mb-8">{header}</div>}
      {children}
    </div>
  )
}
