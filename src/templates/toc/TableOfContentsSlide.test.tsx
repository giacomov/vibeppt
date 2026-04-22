import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TableOfContentsSlide } from './TableOfContentsSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('TableOfContentsSlide', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TableOfContentsSlide items={[{ title: 'Section One' }]} />
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders all section titles', () => {
    render(
      <TableOfContentsSlide
        items={[{ title: 'Architecture' }, { title: 'Performance' }, { title: 'Security' }]}
      />
    )
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  it('renders auto-numbered labels', () => {
    render(
      <TableOfContentsSlide items={[{ title: 'A' }, { title: 'B' }]} />
    )
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <TableOfContentsSlide items={[{ title: 'Intro', subtitle: 'How it starts' }]} />
    )
    expect(screen.getByText('How it starts')).toBeInTheDocument()
  })

  it('does not render subtitle when omitted', () => {
    render(<TableOfContentsSlide items={[{ title: 'Intro' }]} />)
    expect(screen.queryByText('How it starts')).toBeNull()
  })

  it('renders header when provided', () => {
    render(
      <TableOfContentsSlide
        items={[{ title: 'One' }]}
        header={<SectionTitle title="Contents" />}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Contents')
  })

  it('renders without header when not provided', () => {
    render(<TableOfContentsSlide items={[{ title: 'One' }]} />)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('defaults to 3 columns', () => {
    const { container } = render(
      <TableOfContentsSlide items={[{ title: 'One' }]} />
    )
    // JSDOM serialises React camelCase styles as kebab-case in the attribute
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
  })

  it('renders 2-column grid when columns=2', () => {
    const { container } = render(
      <TableOfContentsSlide items={[{ title: 'One' }]} columns={2} />
    )
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, 1fr)')
  })
})
