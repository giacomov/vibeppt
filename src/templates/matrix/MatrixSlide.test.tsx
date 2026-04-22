import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatrixSlide } from './MatrixSlide'

const baseProps = {
  xAxis: { label: 'Impact' },
  yAxis: { label: 'Effort' },
  topLeft: { title: 'Fill-ins' },
  topRight: { title: 'Big Bets', highlight: true },
  bottomLeft: { title: 'Drop' },
  bottomRight: { title: 'Quick Wins' },
}

describe('MatrixSlide', () => {
  it('renders all four quadrant titles', () => {
    render(<MatrixSlide {...baseProps} />)
    expect(screen.getByText('Fill-ins')).toBeInTheDocument()
    expect(screen.getByText('Big Bets')).toBeInTheDocument()
    expect(screen.getByText('Drop')).toBeInTheDocument()
    expect(screen.getByText('Quick Wins')).toBeInTheDocument()
  })

  it('renders both axis labels', () => {
    render(<MatrixSlide {...baseProps} />)
    expect(screen.getByText('Impact')).toBeInTheDocument()
    expect(screen.getByText('Effort')).toBeInTheDocument()
  })

  it('renders with only lowLabel on xAxis without crashing', () => {
    render(
      <MatrixSlide
        {...baseProps}
        xAxis={{ label: 'Impact', lowLabel: 'Low' }}
      />
    )
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Impact')).toBeInTheDocument()
  })

  it('renders with only highLabel on yAxis without crashing', () => {
    render(
      <MatrixSlide
        {...baseProps}
        yAxis={{ label: 'Effort', highLabel: 'High' }}
      />
    )
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Effort')).toBeInTheDocument()
  })

  it('renders all four endpoint labels when both low and high are provided', () => {
    render(
      <MatrixSlide
        {...baseProps}
        xAxis={{ label: 'Impact', lowLabel: 'Low', highLabel: 'High' }}
        yAxis={{ label: 'Effort', lowLabel: 'Small', highLabel: 'Large' }}
      />
    )
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('renders quadrant items with bullet prefix', () => {
    render(
      <MatrixSlide
        {...baseProps}
        topRight={{ title: 'Big Bets', items: ['Real-time collab'] }}
      />
    )
    expect(screen.getByText('· Real-time collab')).toBeInTheDocument()
  })
})
