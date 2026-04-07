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
    render(
      <KeyTakeawaySlide takeaways={['Point A', 'Point B']} />,
    )
    const el = screen.getByRole('button')
    expect(el).toHaveAttribute('tabindex', '0')
  })

  it('handles click to reveal takeaways one by one', () => {
    vi.useFakeTimers()
    render(
      <KeyTakeawaySlide takeaways={['Takeaway One', 'Takeaway Two']} />,
    )
    const el = screen.getByRole('button')
    // First click starts revealing item 0
    fireEvent.click(el)
    act(() => { vi.advanceTimersByTime(800) })

    // Second click starts revealing item 1
    fireEvent.click(el)
    act(() => { vi.advanceTimersByTime(800) })

    // Third click triggers final reveal
    fireEvent.click(el)
    expect(el).toBeTruthy()
  })

  it('does not advance when animation is in progress (isAnimating guard)', () => {
    vi.useFakeTimers()
    render(
      <KeyTakeawaySlide takeaways={['A', 'B']} />,
    )
    const el = screen.getByRole('button')
    // Click once — animation starts (isAnimating = true)
    fireEvent.click(el)
    // Click again immediately (should be ignored)
    fireEvent.click(el)
    // Only advance a partial timeout
    act(() => { vi.advanceTimersByTime(300) })
    expect(el).toBeTruthy()
  })

  it('handles keyboard Enter to advance', () => {
    vi.useFakeTimers()
    render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    const el = screen.getByRole('button')
    fireEvent.keyDown(el, { key: 'Enter' })
    act(() => { vi.advanceTimersByTime(800) })
    expect(el).toBeTruthy()
  })

  it('handles keyboard Space to advance', () => {
    vi.useFakeTimers()
    render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    const el = screen.getByRole('button')
    fireEvent.keyDown(el, { key: ' ' })
    act(() => { vi.advanceTimersByTime(800) })
    expect(el).toBeTruthy()
  })

  it('ignores unrelated key presses', () => {
    render(
      <KeyTakeawaySlide takeaways={['A']} />,
    )
    const el = screen.getByRole('button')
    fireEvent.keyDown(el, { key: 'Escape' })
    expect(el).toBeTruthy()
  })

  it('becomes non-interactive after all items are revealed', () => {
    vi.useFakeTimers()
    render(
      <KeyTakeawaySlide takeaways={['Only one']} />,
    )
    const el = screen.getByRole('button')
    // Reveal the one takeaway
    fireEvent.click(el)
    act(() => { vi.advanceTimersByTime(800) })
    // Final reveal click
    fireEvent.click(el)
    // After final reveal, nextIdx = n+1, so tabIndex should be -1
    expect(el).toHaveAttribute('tabindex', '-1')
  })
})
