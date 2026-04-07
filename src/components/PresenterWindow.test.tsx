import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { PresenterWindow } from './PresenterWindow'

// Build a minimal fake popup window that satisfies PresenterWindow's DOM interactions
function makeMockWindow() {
  const div = document.createElement('div')
  document.body.appendChild(div)

  return {
    closed: false,
    close: vi.fn(),
    document: {
      head: {
        querySelectorAll: vi.fn((_sel: string) => [] as Element[]),
        appendChild: vi.fn(),
      },
      body: {
        appendChild: vi.fn(),
        style: { margin: '', padding: '' } as CSSStyleDeclaration,
      },
      createElement: vi.fn((_tag: string) => div),
      title: '',
    },
  }
}

describe('PresenterWindow', () => {
  let originalOpen: typeof window.open

  beforeEach(() => {
    originalOpen = window.open
  })

  afterEach(() => {
    window.open = originalOpen
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('calls onClose immediately when the popup is blocked (window.open returns null)', () => {
    window.open = vi.fn().mockReturnValue(null)
    const onClose = vi.fn()
    render(
      <PresenterWindow onClose={onClose}>
        <span>content</span>
      </PresenterWindow>,
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('opens a new window with the correct target and features', () => {
    const mockWin = makeMockWindow()
    window.open = vi.fn().mockReturnValue(mockWin)
    const onClose = vi.fn()
    render(
      <PresenterWindow onClose={onClose}>
        <span>Test</span>
      </PresenterWindow>,
    )
    expect(window.open).toHaveBeenCalledWith(
      '',
      'presenter-view',
      expect.stringContaining('width=900'),
    )
  })

  it('closes the popup window on unmount', () => {
    const mockWin = makeMockWindow()
    window.open = vi.fn().mockReturnValue(mockWin)
    const onClose = vi.fn()
    const { unmount } = render(
      <PresenterWindow onClose={onClose}>
        <span>content</span>
      </PresenterWindow>,
    )
    unmount()
    expect(mockWin.close).toHaveBeenCalled()
  })

  it('calls onClose when the popup is closed externally (interval check)', () => {
    vi.useFakeTimers()
    const mockWin = makeMockWindow()
    window.open = vi.fn().mockReturnValue(mockWin)
    const onClose = vi.fn()
    render(
      <PresenterWindow onClose={onClose}>
        <span>content</span>
      </PresenterWindow>,
    )
    // Simulate the user closing the popup window
    mockWin.closed = true
    act(() => { vi.advanceTimersByTime(600) })
    expect(onClose).toHaveBeenCalled()
  })

  it('copies parent stylesheets to the popup window', () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://example.com/style.css'
    document.head.appendChild(link)

    const mockWin = makeMockWindow()
    window.open = vi.fn().mockReturnValue(mockWin)
    const onClose = vi.fn()
    render(
      <PresenterWindow onClose={onClose}>
        <span>content</span>
      </PresenterWindow>,
    )
    // The component iterates document.head's stylesheets and appends them
    expect(mockWin.document.head.appendChild).toHaveBeenCalled()

    document.head.removeChild(link)
  })

  it('does not close window on unmount if already closed', () => {
    const mockWin = makeMockWindow()
    mockWin.closed = true
    window.open = vi.fn().mockReturnValue(mockWin)
    const onClose = vi.fn()
    const { unmount } = render(
      <PresenterWindow onClose={onClose}>
        <span>content</span>
      </PresenterWindow>,
    )
    unmount()
    // win.close should NOT be called since win.closed is already true
    expect(mockWin.close).not.toHaveBeenCalled()
  })
})
