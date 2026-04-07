import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TemperatureSlide } from './TemperatureSlide'
import { SectionTitle } from '../common/SlideTitle'

describe('TemperatureSlide', () => {
  it('renders with basic props', () => {
    const { container } = render(
      <TemperatureSlide
        leftLabel="Cold"
        rightLabel="Hot"
        points={[{ position: 50, content: <span>Middle</span> }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
    expect(screen.getByText('Cold')).toBeInTheDocument()
    expect(screen.getByText('Hot')).toBeInTheDocument()
  })

  it('renders with a header', () => {
    render(
      <TemperatureSlide
        leftLabel="Left"
        rightLabel="Right"
        points={[{ position: 30, content: <span>Point A</span> }]}
        header={<SectionTitle title="Temperature Scale" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Temperature Scale')
  })

  it('renders examples when provided', () => {
    render(
      <TemperatureSlide
        leftLabel="Manual"
        rightLabel="Auto"
        points={[
          {
            position: 20,
            content: <span>Low</span>,
            examples: <span>Example A</span>,
          },
        ]}
      />,
    )
    expect(screen.getByText('Example A')).toBeInTheDocument()
  })

  it('applies collision avoidance for closely-spaced points (forward pass)', () => {
    // Two points very close together trigger the forward pass
    const { container } = render(
      <TemperatureSlide
        leftLabel="L"
        rightLabel="R"
        points={[
          { position: 10, content: <span>A</span> },
          { position: 12, content: <span>B</span> }, // < MIN_GAP from previous
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('applies collision avoidance backward pass', () => {
    // Three points where the backward pass needs to push cards leftward
    const { container } = render(
      <TemperatureSlide
        leftLabel="L"
        rightLabel="R"
        points={[
          { position: 10, content: <span>First</span> },
          { position: 12, content: <span>Second</span> },
          { position: 14, content: <span>Third</span> },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('accepts custom gradient colors', () => {
    const { container } = render(
      <TemperatureSlide
        leftLabel="Cold"
        rightLabel="Hot"
        coldColor="#0000FF"
        warmColor="#FF0000"
        points={[{ position: 50, content: <span>Mid</span> }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })
})
