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
    render(<GlossarySlide terms={terms} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('A unit of text processed by the model.')).toBeInTheDocument()
  })

  it('removes the button role once all terms are revealed', () => {
    render(<GlossarySlide terms={[{ term: 'T', definition: 'D' }]} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
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
    render(<GlossarySlide terms={terms} />)
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('A unit of text processed by the model.')).toBeInTheDocument()
  })
})
