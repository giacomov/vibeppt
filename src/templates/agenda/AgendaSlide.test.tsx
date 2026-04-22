import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgendaSlide } from './AgendaSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('AgendaSlide', () => {
  it('renders without crashing', () => {
    const { container } = render(<AgendaSlide items={[{ label: 'Intro' }]} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders all item labels', () => {
    render(
      <AgendaSlide items={[{ label: 'Opening' }, { label: 'Deep Dive' }, { label: 'Wrap Up' }]} />
    )
    expect(screen.getByText('Opening')).toBeInTheDocument()
    expect(screen.getByText('Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Wrap Up')).toBeInTheDocument()
  })

  it('renders sequential number labels', () => {
    render(<AgendaSlide items={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('renders time when provided', () => {
    render(<AgendaSlide items={[{ label: 'Intro', time: '10 min' }]} />)
    expect(screen.getByText('10 min')).toBeInTheDocument()
  })

  it('does not render time column when time is omitted', () => {
    render(<AgendaSlide items={[{ label: 'Intro' }]} />)
    expect(screen.queryByText(/min/)).toBeNull()
  })

  it('renders header when provided', () => {
    render(
      <AgendaSlide
        items={[{ label: 'Item' }]}
        header={<SectionTitle title="Agenda" />}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Agenda')
  })

  it('renders without header when not provided', () => {
    render(<AgendaSlide items={[{ label: 'Item' }]} />)
    expect(screen.queryByRole('heading')).toBeNull()
  })
})
