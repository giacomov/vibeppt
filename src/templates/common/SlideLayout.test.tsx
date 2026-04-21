import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideLayout } from './SlideLayout'

describe('SlideLayout', () => {
  it('renders children', () => {
    render(<SlideLayout><span>slide content</span></SlideLayout>)
    expect(screen.getByText('slide content')).toBeInTheDocument()
  })

  it('renders header when provided', () => {
    render(
      <SlideLayout header={<h2>My Header</h2>}>
        <span>content</span>
      </SlideLayout>,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Header')
  })

  it('does not render header wrapper when header is omitted', () => {
    const { container } = render(
      <SlideLayout><span>content</span></SlideLayout>,
    )
    expect(container.querySelector('.flex-shrink-0')).not.toBeInTheDocument()
  })

  it('applies uniform padding to root div', () => {
    const { container } = render(
      <SlideLayout><span>content</span></SlideLayout>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.padding).toBe('60px 80px')
  })

  it('merges style prop with base padding', () => {
    const { container } = render(
      <SlideLayout style={{ cursor: 'pointer' }}><span>content</span></SlideLayout>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.padding).toBe('60px 80px')
    expect(root.style.cursor).toBe('pointer')
  })

  it('spreads extra props onto root div', () => {
    render(
      <SlideLayout role="button" tabIndex={0}><span>content</span></SlideLayout>,
    )
    const root = screen.getByRole('button')
    expect(root).toBeInTheDocument()
    expect(root.tabIndex).toBe(0)
  })

  it('has the correct structural classes on root div', () => {
    const { container } = render(
      <SlideLayout><span>content</span></SlideLayout>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('w-full')
    expect(root.className).toContain('h-full')
    expect(root.className).toContain('bg-background')
    expect(root.className).toContain('flex-col')
  })

  it('does not allow style prop to override base padding', () => {
    const { container } = render(
      <SlideLayout style={{ padding: '0px' }}><span>content</span></SlideLayout>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.style.padding).toBe('60px 80px')
  })
})
