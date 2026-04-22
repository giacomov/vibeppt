import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineSlide } from './TimelineSlide'

const items = [
  { date: 'Q1 2022', label: 'Launch', description: 'First release' },
  { date: 'Q3 2022', label: 'Growth', highlight: true },
]

describe('TimelineSlide', () => {
  it('renders each item label exactly once in horizontal mode', () => {
    render(<TimelineSlide items={items} direction="horizontal" />)
    expect(screen.getAllByText('Launch')).toHaveLength(1)
    expect(screen.getAllByText('Growth')).toHaveLength(1)
  })

  it('renders each item date exactly once in horizontal mode', () => {
    render(<TimelineSlide items={items} direction="horizontal" />)
    expect(screen.getAllByText('Q1 2022')).toHaveLength(1)
    expect(screen.getAllByText('Q3 2022')).toHaveLength(1)
  })

  it('renders optional description exactly once', () => {
    render(<TimelineSlide items={items} direction="horizontal" />)
    expect(screen.getAllByText('First release')).toHaveLength(1)
  })

  it('renders all items in vertical mode', () => {
    render(<TimelineSlide items={items} direction="vertical" />)
    expect(screen.getByText('Launch')).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    const { container } = render(
      <TimelineSlide
        items={items}
        header={<h2>Milestones</h2>}
      />
    )
    expect(container.querySelector('h2')).toHaveTextContent('Milestones')
  })
})
