import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from './Navigation'

describe('Navigation', () => {
  it('disables the previous button at index 0', () => {
    render(<Navigation total={5} current={0} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByLabelText('Previous slide')).toBeDisabled()
  })

  it('disables the next button at the last slide', () => {
    render(<Navigation total={5} current={4} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByLabelText('Next slide')).toBeDisabled()
  })

  it('enables both buttons in the middle of the deck', () => {
    render(<Navigation total={5} current={2} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByLabelText('Previous slide')).not.toBeDisabled()
    expect(screen.getByLabelText('Next slide')).not.toBeDisabled()
  })

  it('displays the counter as "current + 1 / total"', () => {
    render(<Navigation total={10} current={3} onPrev={vi.fn()} onNext={vi.fn()} />)
    expect(screen.getByText('4 / 10')).toBeInTheDocument()
  })

  it('fires onPrev when the previous button is clicked', async () => {
    const user = userEvent.setup()
    const onPrev = vi.fn()
    render(<Navigation total={5} current={2} onPrev={onPrev} onNext={vi.fn()} />)
    await user.click(screen.getByLabelText('Previous slide'))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('fires onNext when the next button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<Navigation total={5} current={2} onPrev={vi.fn()} onNext={onNext} />)
    await user.click(screen.getByLabelText('Next slide'))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
