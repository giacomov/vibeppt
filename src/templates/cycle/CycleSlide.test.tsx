import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { render, act } from '@testing-library/react'
import { CycleSlide } from './CycleSlide'
import { SectionTitle } from '../common/SlideTitle'
import { Search, Map, Rocket } from 'lucide-react'

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

afterEach(() => {
  vi.useRealTimers()
})

const threeItems = [
  { label: 'Plan', description: 'Define scope', icon: <Map size={22} /> },
  { label: 'Build', description: 'Write code', icon: <Search size={22} /> },
  { label: 'Ship', description: 'Deploy', icon: <Rocket size={22} /> },
]

describe('CycleSlide', () => {
  it('renders without crashing with basic items', () => {
    const { container } = render(<CycleSlide items={threeItems} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('returns null for empty items array', () => {
    const { container } = render(<CycleSlide items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with a header', () => {
    const { container } = render(
      <CycleSlide
        items={threeItems}
        header={<SectionTitle title="The Cycle" />}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with startAngle and ccw direction', () => {
    const { container } = render(
      <CycleSlide items={threeItems} startAngle={0} direction="ccw" />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with 2 items (small ring radii)', () => {
    const { container } = render(
      <CycleSlide items={[{ label: 'A' }, { label: 'B' }]} />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with 5 items (medium ring radii)', () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ label: `Item ${i}` }))
    const { container } = render(<CycleSlide items={items} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with 7 items (small ring radii, desc capped)', () => {
    const items = Array.from({ length: 7 }, (_, i) => ({
      label: `Item ${i}`,
      description: `Desc ${i}`,
    }))
    const { container } = render(<CycleSlide items={items} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('items with custom color override', () => {
    const { container } = render(
      <CycleSlide
        items={[
          { label: 'Red', color: '#FF0000' },
          { label: 'Blue', color: '#0000FF' },
        ]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('items without icons still render', () => {
    const { container } = render(
      <CycleSlide
        items={[{ label: 'No icon' }, { label: 'Also no icon' }]}
      />,
    )
    expect(container.firstChild).toBeTruthy()
  })

  it('advances animation state after initial timer', () => {
    vi.useFakeTimers()
    const { container } = render(<CycleSlide items={threeItems} />)
    act(() => { vi.advanceTimersByTime(400) })  // past initial 300ms delay
    expect(container.firstChild).toBeTruthy()
    act(() => { vi.advanceTimersByTime(1500) }) // trigger SEG_STAGGER
    expect(container.firstChild).toBeTruthy()
    act(() => { vi.advanceTimersByTime(1500) })
    expect(container.firstChild).toBeTruthy()
    act(() => { vi.advanceTimersByTime(1500) })
    expect(container.firstChild).toBeTruthy()
    // All done — wait for SEG_GROW
    act(() => { vi.advanceTimersByTime(1000) })
    // Now hold and fade-out
    act(() => { vi.advanceTimersByTime(6000) })
    expect(container.firstChild).toBeTruthy()
    // Fade out completes + restart pause
    act(() => { vi.advanceTimersByTime(2000) })
    expect(container.firstChild).toBeTruthy()
  })
})
