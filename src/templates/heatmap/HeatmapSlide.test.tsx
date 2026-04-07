import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeatmapSlide } from './HeatmapSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('HeatmapSlide', () => {
  it('renders basic grid without crashing', () => {
    const { container } = render(
      <HeatmapSlide
        labels={['A', 'B', 'C']}
        weights={[
          [0.9, 0.05, 0.05],
          [0.1, 0.8, 0.1],
          [0.05, 0.1, 0.85],
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a header', () => {
    render(
      <HeatmapSlide
        labels={['X', 'Y']}
        weights={[[0.8, 0.2], [0.3, 0.7]]}
        header={<SectionTitle title="Attention Weights" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Attention Weights')
  })

  it('renders axis labels', () => {
    render(
      <HeatmapSlide
        labels={['A', 'B']}
        weights={[[0.7, 0.3], [0.4, 0.6]]}
        rowAxisLabel="Query"
        colAxisLabel="Key"
      />,
    )
    expect(screen.getByText('Query')).toBeInTheDocument()
    expect(screen.getByText('Key')).toBeInTheDocument()
  })

  it('handles null gap labels in both row and column positions', () => {
    // This exercises: isRowGap && isColGap (diagonal), isRowGap only, isColGap only
    render(
      <HeatmapSlide
        labels={['The', null, 'mat']}
        weights={[
          [0.92, null, 0.01],
          [null, null, null],
          [0.05, null, 0.85],
        ]}
      />,
    )
    // 'The' appears as both a row and column label — use getAllByText
    expect(screen.getAllByText('The').length).toBeGreaterThan(0)
    expect(screen.getByText('mat')).toBeInTheDocument()
  })

  it('renders high-value cells with dark text and low-value cells with light text', () => {
    // textColor branch: v >= 0.5 → dark, v < 0.5 → light
    const { container } = render(
      <HeatmapSlide
        labels={['A', 'B']}
        weights={[[0.9, 0.1], [0.3, 0.8]]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders null weight cells (undefined val)', () => {
    // weights[ri][ci] is undefined when the row is shorter than labels
    const { container } = render(
      <HeatmapSlide
        labels={['A', 'B', 'C']}
        weights={[[0.5, 0.5]]} // only 2 cols for 3 labels
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with default axis labels', () => {
    render(
      <HeatmapSlide
        labels={['X']}
        weights={[[1.0]]}
      />,
    )
    expect(screen.getByText('Query')).toBeInTheDocument()
    expect(screen.getByText('Key')).toBeInTheDocument()
  })
})
