import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { KeyTakeawaySlide } from './KeyTakeawaySlide'
import { SectionTitle } from '../common/SlideTitle'
import { AnimationProvider, useAnimationContext } from '../../contexts/AnimationContext'

afterEach(() => {
  vi.useRealTimers()
})

// Capture advance/retreat from the provider after the slide registers its controller
let capturedAdvance: () => boolean = () => false
let capturedRetreat: () => boolean = () => false

function ContextCapture() {
  const ctx = useAnimationContext()
  capturedAdvance = ctx.advance
  capturedRetreat = ctx.retreat
  return null
}

function renderSlide(props: { takeaways: string[]; header?: React.ReactNode }) {
  return render(
    <AnimationProvider>
      <ContextCapture />
      <KeyTakeawaySlide {...props} />
    </AnimationProvider>
  )
}

describe('KeyTakeawaySlide', () => {
  it('renders without crashing', () => {
    const { container } = renderSlide({ takeaways: ['Ship it', 'Learn fast'] })
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a header', () => {
    renderSlide({
      takeaways: ['Takeaway 1'],
      header: <SectionTitle title="Key Points" />,
    })
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Points')
  })

  it('advance() returns true while steps remain', () => {
    renderSlide({ takeaways: ['Point A', 'Point B'] })
    expect(capturedAdvance()).toBe(true)
  })

  it('advance() returns true during animation (isAnimating guard)', () => {
    vi.useFakeTimers()
    renderSlide({ takeaways: ['A', 'B'] })
    act(() => { capturedAdvance() })
    // Animation in flight — should return true (consumed) but not double-advance
    expect(capturedAdvance()).toBe(true)
  })

  it('advance() returns false after all items are revealed', () => {
    vi.useFakeTimers()
    renderSlide({ takeaways: ['Only one'] })
    // Reveal item 0 (nextIdx: 0 → 1)
    act(() => { capturedAdvance() })
    act(() => { vi.advanceTimersByTime(800) })
    // Final reveal (nextIdx: 1 === n → nextIdx becomes n+1=2)
    act(() => { capturedAdvance() })
    expect(capturedAdvance()).toBe(false)
  })

  it('retreat() returns false when no steps taken', () => {
    renderSlide({ takeaways: ['A', 'B'] })
    expect(capturedRetreat()).toBe(false)
  })

  it('retreat() returns true after advancing', () => {
    vi.useFakeTimers()
    renderSlide({ takeaways: ['A', 'B'] })
    act(() => { capturedAdvance() })
    act(() => { vi.advanceTimersByTime(800) })
    expect(capturedRetreat()).toBe(true)
  })

  it('retreat() during animation is consumed without reverting', () => {
    vi.useFakeTimers()
    renderSlide({ takeaways: ['A', 'B'] })
    act(() => { capturedAdvance() })
    // While animation runs, retreat should return true (consumed) but do nothing
    expect(capturedRetreat()).toBe(true)
  })
})
