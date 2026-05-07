import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { StackSlide } from './StackSlide'
import { SectionTitle } from '../common/SlideTitle'
import { AnimationProvider, useAnimationContext } from '../../contexts/AnimationContext'

const levels = [
  { title: 'Application', tag: 'TOP', description: 'User-facing layer', color: '#F6AD55', items: [{ label: 'UI', description: 'Frontend' }] },
  { title: 'Platform', tag: 'MID', description: 'Infrastructure' },
  { title: 'Data', tag: 'BOTTOM', description: 'Storage', color: '#68D391' },
]

const groups = [
  { label: 'Runtime', color: '#F6AD55', from: 0, to: 1 },
  { label: 'Foundation', color: '#68D391', from: 2, to: 2 },
]

// Capture advance/retreat from the provider after the slide registers its controller
let capturedAdvance: () => boolean = () => false
let capturedRetreat: () => boolean = () => false

function ContextCapture() {
  const ctx = useAnimationContext()
  capturedAdvance = ctx.advance
  capturedRetreat = ctx.retreat
  return null
}

function renderAnimated(props: Parameters<typeof StackSlide>[0]) {
  return render(
    <AnimationProvider>
      <ContextCapture />
      <StackSlide {...props} animated />
    </AnimationProvider>
  )
}

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
  it('advance() returns true while levels remain unrevealed', () => {
    renderAnimated({ levels })
    expect(capturedAdvance()).toBe(true)
  })

  it('advance() returns false after all levels are revealed', () => {
    const singleLevel = [{ title: 'Only Layer', description: 'desc' }]
    renderAnimated({ levels: singleLevel })
    act(() => { capturedAdvance() }) // reveal the one level
    expect(capturedAdvance()).toBe(false)
  })

  it('advances through all levels step by step', () => {
    renderAnimated({ levels }) // 3 levels → 3 steps
    let r1: boolean, r2: boolean, r3: boolean
    act(() => { r1 = capturedAdvance() })
    act(() => { r2 = capturedAdvance() })
    act(() => { r3 = capturedAdvance() })
    expect(r1!).toBe(true)
    expect(r2!).toBe(true)
    expect(r3!).toBe(true)
    expect(capturedAdvance()).toBe(false)
  })

  it('retreat() returns false when no steps taken', () => {
    renderAnimated({ levels })
    expect(capturedRetreat()).toBe(false)
  })

  it('retreat() returns true after advancing', () => {
    renderAnimated({ levels })
    act(() => { capturedAdvance() })
    expect(capturedRetreat()).toBe(true)
  })
})
