import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StackSlide } from './StackSlide'
import { SectionTitle } from '../common/SlideTitle'

const levels = [
  { title: 'Application', tag: 'TOP', description: 'User-facing layer', color: '#F6AD55', items: [{ label: 'UI', description: 'Frontend' }] },
  { title: 'Platform', tag: 'MID', description: 'Infrastructure' },
  { title: 'Data', tag: 'BOTTOM', description: 'Storage', color: '#68D391' },
]

const groups = [
  { label: 'Runtime', color: '#F6AD55', from: 0, to: 1 },
  { label: 'Foundation', color: '#68D391', from: 2, to: 2 },
]

describe('StackSlide (static)', () => {
  it('renders all level titles', () => {
    render(<StackSlide levels={levels} />)
    expect(screen.getByText('Application')).toBeInTheDocument()
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
  })

  it('renders level tags', () => {
    render(<StackSlide levels={levels} />)
    expect(screen.getByText('TOP')).toBeInTheDocument()
  })

  it('renders level items', () => {
    render(<StackSlide levels={levels} />)
    expect(screen.getByText('UI')).toBeInTheDocument()
  })

  it('renders a footer when provided', () => {
    render(<StackSlide levels={levels} footer="TOP = FAST · BOTTOM = SLOW" />)
    expect(screen.getByText('TOP = FAST · BOTTOM = SLOW')).toBeInTheDocument()
  })

  it('renders group labels when groups are provided', () => {
    render(<StackSlide levels={levels} groups={groups} />)
    expect(screen.getByText('Runtime')).toBeInTheDocument()
    expect(screen.getByText('Foundation')).toBeInTheDocument()
  })

  it('renders a header when provided', () => {
    render(<StackSlide levels={levels} header={<SectionTitle title="Tech Stack" />} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Tech Stack')
  })
})

describe('StackSlide (animated)', () => {
  it('renders as a button when animated and not fully revealed', () => {
    render(<StackSlide levels={levels} animated />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('reveals levels on click', () => {
    render(<StackSlide levels={levels} animated />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('advances on Enter keypress', () => {
    render(<StackSlide levels={levels} animated />)
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('advances on Space keypress', () => {
    render(<StackSlide levels={levels} animated />)
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('becomes non-interactive (tabIndex -1) after all levels are revealed', () => {
    const singleLevel = [{ title: 'Only Layer', description: 'desc' }]
    render(<StackSlide levels={singleLevel} animated />)
    // One click reveals the single level; schedule.total === 1 so one click finishes it
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1')
  })
})
