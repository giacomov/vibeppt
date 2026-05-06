import type { ReactNode, HTMLAttributes } from 'react'

export interface SlideBaseProps extends HTMLAttributes<HTMLDivElement> {}

export function SlideBase({ children, className, style, ...rest }: SlideBaseProps): ReactNode {
  return (
    <div
      className={['w-full h-full bg-background relative overflow-hidden', className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}
