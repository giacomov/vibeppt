import type { ReactNode } from 'react'

export interface SplitSlideProps {
  left: ReactNode
  right: ReactNode
  ratio?: '50/50' | '40/60' | '60/40'
}

const RATIO_COLUMNS: Record<string, string> = {
  '50/50': '1fr 1px 1fr',
  '40/60': '2fr 1px 3fr',
  '60/40': '3fr 1px 2fr',
}

export function SplitSlide({ left, right, ratio = '50/50' }: SplitSlideProps): ReactNode {
  return (
    <div
      className="w-full h-full bg-background overflow-hidden"
      style={{ display: 'grid', gridTemplateColumns: RATIO_COLUMNS[ratio] }}
    >
      {/* Left panel */}
      <div
        className="overflow-hidden flex flex-col justify-center"
        style={{ padding: '60px 72px' }}
      >
        {left}
      </div>

      {/* Accent divider */}
      <div
        className="bg-accent self-stretch"
        style={{ margin: '52px 0', opacity: 0.3 }}
      />

      {/* Right panel */}
      <div
        className="overflow-hidden flex flex-col justify-center"
        style={{ padding: '60px 72px' }}
      >
        {right}
      </div>
    </div>
  )
}
