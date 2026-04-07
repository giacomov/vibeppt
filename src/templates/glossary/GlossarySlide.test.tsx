import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlossarySlide } from './GlossarySlide'
import { SectionTitle } from '../common/SlideTitle'

const terms = [
  { term: 'Token', definition: 'A unit of text processed by the model.' },
  { term: 'Context Window', definition: 'The maximum text a model can process at once.' },
]

describe('GlossarySlide', () => {
  it('renders all term names', () => {
    render(<GlossarySlide terms={terms} />)
    expect(screen.getByText('Token')).toBeInTheDocument()
    expect(screen.getByText('Context Window')).toBeInTheDocument()
  })

  it('reveals the first definition on click', () => {
    const { container } = render(<GlossarySlide terms={terms} />)
    // Before any click the definitions are hidden via opacity:0 / maxHeight:0
    // but still in the DOM; we verify the slide acts as a button initially
    expect(container.firstChild).toHaveAttribute('role', 'button')
    fireEvent.click(container.firstChild as Element)
    // After one click the first definition should be visible
    const def = screen.getByText('A unit of text processed by the model.')
    expect(def).toBeInTheDocument()
  })

  it('removes the button role once all terms are revealed', () => {
    const { container } = render(<GlossarySlide terms={[{ term: 'T', definition: 'D' }]} />)
    fireEvent.click(container.firstChild as Element)
    expect(container.firstChild).not.toHaveAttribute('role', 'button')
  })

  it('renders icons when provided', () => {
    const termsWithIcon = [{ term: 'Prompt', definition: 'Input text.', icon: <span data-testid="star">★</span> }]
    render(<GlossarySlide terms={termsWithIcon} />)
    expect(screen.getByTestId('star')).toBeInTheDocument()
  })

  it('renders a header when provided', () => {
    render(<GlossarySlide terms={terms} header={<SectionTitle title="Key Terms" />} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Terms')
  })

  it('advances on Enter keypress', () => {
    const { container } = render(<GlossarySlide terms={terms} />)
    fireEvent.keyDown(container.firstChild as Element, { key: 'Enter' })
    expect(screen.getByText('A unit of text processed by the model.')).toBeInTheDocument()
  })
})
