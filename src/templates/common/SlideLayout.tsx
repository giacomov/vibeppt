import type { ReactNode, HTMLAttributes } from 'react'

export interface SlideLayoutProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode
}

/**
 * Shared root wrapper for content slide templates.
 * Provides uniform padding (60px 80px) and optional header rendering (mb-8).
 * Extra props are spread onto the root div (e.g. onClick, role, tabIndex).
 * Pass `style` to add additional styles — padding is always enforced and
 * cannot be overridden by callers.
 */
export function SlideLayout({ children, header, style, ...rest }: SlideLayoutProps): ReactNode {
  return (
    <div
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      style={{ ...style, padding: '60px 80px' }}
      {...rest}
    >
      {header && <div className="flex-shrink-0 mb-8">{header}</div>}
      {children}
    </div>
  )
}
