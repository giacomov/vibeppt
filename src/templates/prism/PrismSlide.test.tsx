import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrismSlide } from './PrismSlide'
import { SectionTitle } from '../common/SlideTitle'
import { Target } from 'lucide-react'

describe('PrismSlide', () => {
  it('renders without crashing with basic items', () => {
    const { container } = render(
      <PrismSlide
        subject="Context"
        items={[
          { label: 'System Prompt', description: 'Core instructions' },
          { label: 'User Input', description: 'The request' },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with exactly 1 item (special single-item layout)', () => {
    const { container } = render(
      <PrismSlide
        subject="Single"
        items={[{ label: 'Solo Part' }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a header', () => {
    render(
      <PrismSlide
        subject="LLM"
        items={[{ label: 'Tokens' }, { label: 'Weights' }]}
        header={<SectionTitle title="Decomposed" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Decomposed')
  })

  it('renders with an emoji string subjectIcon', () => {
    const { container } = render(
      <PrismSlide
        subject="Brain"
        subjectIcon="🧠"
        items={[{ label: 'Memory' }, { label: 'Reasoning' }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a ReactNode subjectIcon', () => {
    const { container } = render(
      <PrismSlide
        subject="Target"
        subjectIcon={<Target size={22} />}
        items={[{ label: 'Focus' }, { label: 'Direction' }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders items with emoji string icons', () => {
    const { container } = render(
      <PrismSlide
        subject="Parts"
        items={[
          { label: 'Alpha', icon: '⚙️' },
          { label: 'Beta', icon: '🔧' },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders items with ReactNode icons', () => {
    const { container } = render(
      <PrismSlide
        subject="Parts"
        items={[
          { label: 'One', icon: <Target size={18} /> },
          { label: 'Two', icon: <Target size={18} /> },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with reverseColors=true', () => {
    const { container } = render(
      <PrismSlide
        subject="Rainbow"
        reverseColors
        items={[
          { label: 'A' },
          { label: 'B' },
          { label: 'C' },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders 7+ items (large item count for small icon radius)', () => {
    const items = Array.from({ length: 7 }, (_, i) => ({
      label: `Part ${i + 1}`,
      description: `Desc ${i + 1}`,
    }))
    const { container } = render(
      <PrismSlide subject="Many" items={items} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders items without description', () => {
    const { container } = render(
      <PrismSlide
        subject="Minimal"
        items={[{ label: 'No Desc' }, { label: 'Also None' }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })
})
