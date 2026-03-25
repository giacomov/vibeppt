import type { ReactNode } from 'react'
import { TitleChrome } from '../common/TitleChrome'

export interface TitleSlideProps {
  children: ReactNode
}

export function TitleSlide({ children }: TitleSlideProps): ReactNode {
  return (
    <div className="w-full h-full bg-background relative overflow-hidden flex">
      {/* Left accent bar */}
      <div className="w-1 bg-accent flex-shrink-0" />

      <TitleChrome />

      {/* Large ghosted numeral — decorative */}
      <div
        className="absolute right-0 bottom-0 font-display font-bold text-accent select-none pointer-events-none"
        style={{ fontSize: '480px', lineHeight: 0.85, opacity: 0.025, letterSpacing: '-0.05em' }}
        aria-hidden="true"
      >
        01
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col justify-center"
        style={{ padding: '64px 80px', maxWidth: '920px' }}
      >
        {children}
      </div>

    </div>
  )
}
