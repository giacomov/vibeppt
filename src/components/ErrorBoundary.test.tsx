import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Slide exploded')
  return <div>All good</div>
}

describe('ErrorBoundary', () => {
  // Suppress the React error output in test logs
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('displays the error message when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Slide error')).toBeInTheDocument()
    expect(screen.getByText('Slide exploded')).toBeInTheDocument()
  })

  it('shows a Retry button when an error has been caught', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('clears the error state when Retry is clicked', async () => {
    const user = userEvent.setup()
    // First render with error, then clicking Retry should clear the error state.
    // The child will still throw on next render, but the error state itself resets.
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Slide exploded')).toBeInTheDocument()

    // Re-render with a non-throwing child before clicking Retry so the
    // boundary re-mounts cleanly after reset.
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(screen.getByText('All good')).toBeInTheDocument()
  })
})
