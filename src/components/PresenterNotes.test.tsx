import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PresenterNotes } from './PresenterNotes'

describe('PresenterNotes', () => {
  it('renders notes text when notes are provided', () => {
    render(<PresenterNotes notes="Remember to pause here." />)
    expect(screen.getByText('Remember to pause here.')).toBeInTheDocument()
  })

  it('renders the fallback message when notes are omitted', () => {
    render(<PresenterNotes />)
    expect(screen.getByText(/no notes for this slide/i)).toBeInTheDocument()
  })

  it('renders the fallback message when notes is an empty string', () => {
    render(<PresenterNotes notes="" />)
    expect(screen.getByText(/no notes for this slide/i)).toBeInTheDocument()
  })

  it('always renders the Notes label', () => {
    render(<PresenterNotes notes="Some notes" />)
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })
})
