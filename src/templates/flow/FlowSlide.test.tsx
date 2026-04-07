import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { FlowSlide, defaultNodeStyle } from './FlowSlide'
import type { FlowNode, Edge } from './FlowSlide'
import { SectionTitle } from '../common/SlideTitle'

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // jsdom doesn't include navigator.clipboard — define it so vi.spyOn can target it
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: () => Promise.resolve() },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

const nodes: FlowNode[] = [
  { id: 'a', data: { label: 'Node A' }, style: defaultNodeStyle },
  { id: 'b', data: { label: 'Node B' }, style: defaultNodeStyle },
]
const edges: Edge[] = [{ id: 'e1', source: 'a', target: 'b' }]

describe('FlowSlide (read-only)', () => {
  it('renders without crashing', () => {
    const { container } = render(<FlowSlide nodes={nodes} edges={edges} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with a header', () => {
    render(
      <FlowSlide
        nodes={nodes}
        edges={edges}
        header={<SectionTitle title="Pipeline" />}
      />,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pipeline')
  })

  it('renders with TB direction', () => {
    const { container } = render(
      <FlowSlide nodes={nodes} edges={edges} direction="TB" />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders nodes with pre-set positions (bypasses Dagre)', () => {
    const positioned: FlowNode[] = [
      { id: 'x', data: { label: 'X' }, position: { x: 100, y: 200 }, style: defaultNodeStyle },
      { id: 'y', data: { label: 'Y' }, position: { x: 300, y: 200 }, style: defaultNodeStyle },
    ]
    const { container } = render(
      <FlowSlide nodes={positioned} edges={[]} />,
    )
    expect(container.firstChild).toBeTruthy()
  })
})

describe('FlowSlide (editMode)', () => {
  it('renders a Copy positions button in editMode', () => {
    render(<FlowSlide nodes={nodes} edges={edges} editMode />)
    expect(screen.getByRole('button', { name: /copy positions/i })).toBeInTheDocument()
  })

  it('clicking Copy positions writes to clipboard and shows Copied!', async () => {
    vi.useFakeTimers()
    const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
    render(<FlowSlide nodes={nodes} edges={edges} editMode />)

    const btn = screen.getByRole('button', { name: /copy positions/i })
    fireEvent.click(btn)

    expect(clipboardSpy).toHaveBeenCalled()
    await act(async () => { await Promise.resolve() }) // flush promises
    expect(screen.getByText('Copied!')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(2500) })
    expect(screen.getByRole('button', { name: /copy positions/i })).toBeInTheDocument()
  })

  it('falls back to console.log when clipboard is unavailable', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    render(<FlowSlide nodes={nodes} edges={edges} editMode />)

    const btn = screen.getByRole('button', { name: /copy positions/i })
    fireEvent.click(btn)

    await act(async () => { await Promise.resolve() }) // flush rejection
    expect(consoleSpy).toHaveBeenCalled()
  })
})
