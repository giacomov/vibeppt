import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartSlide } from './ChartSlide'
import { SectionTitle } from '../common/SlideTitle'

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const data = [
  { label: 'Q1', value: 100 },
  { label: 'Q2', value: 150 },
  { label: 'Q3', value: 130 },
]

describe('ChartSlide', () => {
  it('renders a bar chart without crashing', () => {
    const { container } = render(<ChartSlide chartType="bar" data={data} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a line chart without crashing', () => {
    const { container } = render(<ChartSlide chartType="line" data={data} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a pie chart without crashing', () => {
    const { container } = render(<ChartSlide chartType="pie" data={data} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders a header when provided', () => {
    render(
      <ChartSlide
        chartType="bar"
        data={data}
        header={<SectionTitle title="Revenue" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Revenue')
  })

  it('renders a pie chart with multiple data points to exercise Cell coloring', () => {
    const manyPoints = Array.from({ length: 7 }, (_, i) => ({
      label: `Item ${i}`,
      value: (i + 1) * 10,
    }))
    const { container } = render(<ChartSlide chartType="pie" data={manyPoints} />)
    expect(container.firstChild).toBeTruthy()
  })
})
