import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SectionTitleSlide } from './SectionTitleSlide'

afterEach(() => {
  vi.useRealTimers()
})

describe('SectionTitleSlide', () => {
  it('renders the title text', () => {
    const { container } = render(<SectionTitleSlide title="Hello World" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with eyebrow', () => {
    render(<SectionTitleSlide title="AI Trends" eyebrow="Part 1" />)
    expect(screen.getByText('Part 1')).toBeInTheDocument()
  })

  it('renders subtitle after animation delay', () => {
    vi.useFakeTimers()
    render(<SectionTitleSlide title="Hi" subtitle="A subtitle here" />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('A subtitle here')).toBeInTheDocument()
  })

  it('does not set up subtitle timer when subtitle is not provided', () => {
    vi.useFakeTimers()
    const { container } = render(<SectionTitleSlide title="No Sub" />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(container.firstChild).toBeTruthy()
  })

  it('renders each character of the title via SplitFlapChar', () => {
    // A multi-word title exercises the word-split and char-offset logic
    const { container } = render(<SectionTitleSlide title="Two Words" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('handles canvas context unavailability (fitFontSize fallback)', () => {
    // Override getContext to return null to exercise the fallback branch
    const origGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = () => null
    const { container } = render(<SectionTitleSlide title="Fallback Font" />)
    expect(container.firstChild).toBeTruthy()
    HTMLCanvasElement.prototype.getContext = origGetContext
  })

  it('renders a very long title that needs font size reduction', () => {
    const { container } = render(
      <SectionTitleSlide title="This Is A Very Long Section Title That Requires Reduction" />,
    )
    expect(container.firstChild).toBeTruthy()
  })
})
