import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoadmapSlide } from './RoadmapSlide'

describe('RoadmapSlide', () => {
  it('renders all phase headers', () => {
    render(
      <RoadmapSlide
        phases={['Q1', 'Q2', 'Q3']}
        rows={[{ label: 'Platform', items: [] }]}
      />
    )
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByText('Q2')).toBeInTheDocument()
    expect(screen.getByText('Q3')).toBeInTheDocument()
  })

  it('renders all row labels', () => {
    render(
      <RoadmapSlide
        phases={['Q1', 'Q2']}
        rows={[
          { label: 'Platform', items: [] },
          { label: 'Mobile', items: [] },
        ]}
      />
    )
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('renders item labels', () => {
    render(
      <RoadmapSlide
        phases={['Q1', 'Q2']}
        rows={[{
          label: 'Platform',
          items: [
            { phase: 0, label: 'Auth overhaul', status: 'done' },
            { phase: 1, label: 'API v2', status: 'in-progress' },
          ],
        }]}
      />
    )
    expect(screen.getByText('Auth overhaul')).toBeInTheDocument()
    expect(screen.getByText('API v2')).toBeInTheDocument()
  })

  it('renders a multi-phase span item without crashing', () => {
    render(
      <RoadmapSlide
        phases={['Q1', 'Q2', 'Q3']}
        rows={[{
          label: 'Platform',
          items: [{ phase: 0, label: 'Big project', status: 'in-progress', span: 2 }],
        }]}
      />
    )
    expect(screen.getByText('Big project')).toBeInTheDocument()
  })

  it('renders items at the same phase in different rows without key conflict', () => {
    render(
      <RoadmapSlide
        phases={['Q1', 'Q2']}
        rows={[
          { label: 'Platform', items: [{ phase: 0, label: 'Auth', status: 'done' }] },
          { label: 'Mobile', items: [{ phase: 0, label: 'iOS beta', status: 'planned' }] },
        ]}
      />
    )
    expect(screen.getByText('Auth')).toBeInTheDocument()
    expect(screen.getByText('iOS beta')).toBeInTheDocument()
  })
})
