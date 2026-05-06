import type { ReactNode } from 'react'

export interface OverlaySlideProps {
  children: ReactNode
  overlay: ReactNode
}

export function OverlaySlide({ children, overlay }: OverlaySlideProps): ReactNode {
  return (
    <div className="relative w-full h-full">
      {children}
      <div className="absolute inset-0 pointer-events-none">
        {overlay}
      </div>
    </div>
  )
}
