import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CompareSlide } from './CompareSlide'
import { SectionTitle } from '../common/SlideTitle'

const rows = [
  { label: 'Speed', winner: 'left' as const },
  { label: 'Accuracy', winner: 'right' as const },
]

afterEach(() => {
  vi.useRealTimers()
})

describe('CompareSlide', () => {
  it('renders both entity names', () => {
    render(
      <CompareSlide left="Claude" right="GPT-4" rows={rows} />,
    )
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
  })

  it('renders all row labels', () => {
    render(
      <CompareSlide left="A" right="B" rows={rows} />,
    )
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
  })

  it('renders a header when provided', () => {
    render(
      <CompareSlide
        left="A"
        right="B"
        rows={rows}
        header={<SectionTitle title="Head to Head" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Head to Head')
  })

  it('handles a single row', () => {
    render(
      <CompareSlide
        left="Option A"
        right="Option B"
        rows={[{ label: 'Performance', winner: 'left' }]}
      />,
    )
    expect(screen.getByText('Performance')).toBeInTheDocument()
  })

  it('lets animation run past the start delay', () => {
    vi.useFakeTimers()
    const { container } = render(
      <CompareSlide left="A" right="B" rows={rows} />,
    )
    act(() => { vi.advanceTimersByTime(700) })
    expect(container.firstChild).toBeTruthy()
    act(() => { vi.advanceTimersByTime(7000) })
    expect(container.firstChild).toBeTruthy()
  })
})
