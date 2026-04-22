import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionDividerSlide } from './SectionDividerSlide'

describe('SectionDividerSlide', () => {
  it('renders without crashing', () => {
    const { container } = render(<SectionDividerSlide title="Chapter One" />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the title', () => {
    render(<SectionDividerSlide title="The Data Layer" />)
    expect(screen.getByText('The Data Layer')).toBeInTheDocument()
  })

  it('renders eyebrow when provided', () => {
    render(<SectionDividerSlide title="T" eyebrow="Part 2" />)
    expect(screen.getByText('Part 2')).toBeInTheDocument()
  })

  it('does not render eyebrow when omitted', () => {
    render(<SectionDividerSlide title="T" />)
    expect(screen.queryByText('Part 2')).toBeNull()
  })

  it('renders subtitle when provided', () => {
    render(<SectionDividerSlide title="T" subtitle="A short description." />)
    expect(screen.getByText('A short description.')).toBeInTheDocument()
  })

  it('does not render subtitle when omitted', () => {
    render(<SectionDividerSlide title="T" />)
    expect(screen.queryByText('A short description.')).toBeNull()
  })

  it('applies no dark overlay when no custom background is set', () => {
    const { container } = render(<SectionDividerSlide title="T" />)
    // No overlay element should contain an rgba background-color
    expect(container.innerHTML).not.toContain('rgba(0, 0, 0')
  })

  it('renders a dark overlay when backgroundColor is provided', () => {
    const { container } = render(
      <SectionDividerSlide title="T" backgroundColor="#123456" />
    )
    expect(container.innerHTML).toContain('rgba(0, 0, 0')
  })

  it('renders a dark overlay when backgroundImage is provided', () => {
    const { container } = render(
      <SectionDividerSlide title="T" backgroundImage="/img/bg.jpg" />
    )
    expect(container.innerHTML).toContain('rgba(0, 0, 0')
  })
})
