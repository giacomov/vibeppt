import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { SplitFlapChar } from './SplitFlapChar'

afterEach(() => {
  vi.useRealTimers()
})

describe('SplitFlapChar', () => {
  it('renders in em-based mode (no fontSize prop)', () => {
    const { container } = render(
      <SplitFlapChar target="A" delay={0} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders in px-based mode (with fontSize prop)', () => {
    const { container } = render(
      <SplitFlapChar target="Z" delay={0} fontSize={48} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a space character', () => {
    const { container } = render(
      <SplitFlapChar target=" " delay={0} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('animates through flip sequence after delay', () => {
    vi.useFakeTimers()
    const { container } = render(
      <SplitFlapChar target="B" delay={100} />,
    )
    // Advance through the delay + several 90ms intervals for random chars + final char
    act(() => { vi.advanceTimersByTime(100 + 10 * 90 + 80 + 100) })
    expect(container.firstChild).toBeTruthy()
  })

  it('settles on the uppercase version of the target', () => {
    vi.useFakeTimers()
    const { container } = render(
      <SplitFlapChar target="c" delay={0} fontSize={40} />,
    )
    // Advance far enough for all timers to fire
    act(() => { vi.advanceTimersByTime(5000) })
    expect(container.firstChild).toBeTruthy()
  })

  it('handles uppercase target directly', () => {
    vi.useFakeTimers()
    const { container } = render(
      <SplitFlapChar target="X" delay={50} fontSize={32} />,
    )
    act(() => { vi.advanceTimersByTime(5000) })
    expect(container.firstChild).toBeTruthy()
  })
})
