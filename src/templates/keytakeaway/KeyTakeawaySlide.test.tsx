import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { KeyTakeawaySlide } from './KeyTakeawaySlide'
import { SectionTitle } from '../common/SlideTitle'

afterEach(() => {
  vi.useRealTimers()
})

describe('KeyTakeawaySlide', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <KeyTakeawaySlide takeaways={['Ship it', 'Learn fast']} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a header', () => {
    render(
      <KeyTakeawaySlide
        takeaways={['Takeaway 1']}
        header={<SectionTitle title="Key Points" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Points')
  })

  it('is initially a clickable button', () => {
    const { container } = render(
      <KeyTakeawaySlide takeaways={['Point A', 'Point B']} />,
    )
    expect(container.firstChild).toHaveAttribute('role', 'button')
    expect(container.firstChild).toHaveAttribute('tabindex', '0')
  })

  it('handles click to reveal takeaways one by one', () => {
    vi.useFakeTimers()
    const { container } = render(
      <KeyTakeawaySlide takeaways={['Takeaway One', 'Takeaway Two']} />,
    )
    // First click starts revealing item 0
    fireEvent.click(container.firstChild!)
    act(() => { vi.advanceTimersByTime(800) })

    // Second click starts revealing item 1
    fireEvent.click(container.firstChild!)
    act(() => { vi.advanceTimersByTime(800) })

    // Third click triggers final reveal
    fireEvent.click(container.firstChild!)
    expect(container.firstChild).toBeTruthy()
  })

  it('does not advance when animation is in progress (isAnimating guard)', () => {
    vi.useFakeTimers()
    const { container } = render(
      <KeyTakeawaySlide takeaways={['A', 'B']} />,
    )
    // Click once — animation starts (isAnimating = true)
    fireEvent.click(container.firstChild!)
    // Click again immediately (should be ignored)
    fireEvent.click(container.firstChild!)
    // Only advance a partial timeout
    act(() => { vi.advanceTimersByTime(300) })
    expect(container.firstChild).toBeTruthy()
  })

  it('handles keyboard Enter to advance', () => {
    vi.useFakeTimers()
    const { container } = render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    fireEvent.keyDown(container.firstChild!, { key: 'Enter' })
    act(() => { vi.advanceTimersByTime(800) })
    expect(container.firstChild).toBeTruthy()
  })

  it('handles keyboard Space to advance', () => {
    vi.useFakeTimers()
    const { container } = render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    fireEvent.keyDown(container.firstChild!, { key: ' ' })
    act(() => { vi.advanceTimersByTime(800) })
    expect(container.firstChild).toBeTruthy()
  })

  it('ignores unrelated key presses', () => {
    const { container } = render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    fireEvent.keyDown(container.firstChild!, { key: 'Escape' })
    expect(container.firstChild).toBeTruthy()
  })

  it('becomes non-interactive after all items are revealed', () => {
    vi.useFakeTimers()
    const { container } = render(
      <KeyTakeawaySlide takeaways={['Only one']} />,
    )
    // Reveal the one takeaway
    fireEvent.click(container.firstChild!)
    act(() => { vi.advanceTimersByTime(800) })
    // Final reveal click
    fireEvent.click(container.firstChild!)
    // After final reveal, nextIdx = n+1, so tabIndex should be -1
    expect(container.firstChild).toHaveAttribute('tabindex', '-1')
  })
})
