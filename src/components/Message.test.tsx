import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Message from './Message'
import type { ChatMessage } from '../types/chat'

function makeMessage(overrides: Partial<ChatMessage> & Pick<ChatMessage, 'role' | 'text'>): ChatMessage {
  return { id: 'msg-1', ...overrides }
}

describe('Message', () => {
  it('renders user role as plain text inside a user-styled container', () => {
    const { container } = render(<Message message={makeMessage({ role: 'user', text: 'hello' })} />)
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(container.querySelector('.msg-user')).not.toBeNull()
    // No markdown processing for user messages — no <p> wrapping expected.
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders error role with error-styled container', () => {
    const { container } = render(<Message message={makeMessage({ role: 'error', text: 'oops' })} />)
    expect(screen.getByText('oops')).toBeInTheDocument()
    expect(container.querySelector('.msg-error')).not.toBeNull()
  })

  it('renders assistant role through react-markdown with GFM (fenced code → <code>)', () => {
    const md = 'before\n\n```\ncode block\n```\n\nafter'
    const { container } = render(<Message message={makeMessage({ role: 'assistant', text: md })} />)
    expect(container.querySelector('.msg-assistant')).not.toBeNull()
    expect(container.querySelector('.msg-markdown')).not.toBeNull()
    expect(container.querySelector('code')).not.toBeNull()
    expect(screen.getByText('code block')).toBeInTheDocument()
  })

  it('renders assistant role with GFM tables (remark-gfm enabled)', () => {
    const md = '| a | b |\n|---|---|\n| 1 | 2 |'
    const { container } = render(<Message message={makeMessage({ role: 'assistant', text: md })} />)
    expect(container.querySelector('table')).not.toBeNull()
  })

  it('renders tool role with the matching icon and text', () => {
    const { container } = render(
      <Message message={makeMessage({ role: 'tool', text: 'Running bash', icon: 'bash' })} />
    )
    expect(screen.getByText('Running bash')).toBeInTheDocument()
    expect(container.querySelector('.msg-tool')).not.toBeNull()
    // Lucide icons render as inline SVG; the icon presence is the contract.
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders tool role without an icon when icon is omitted', () => {
    const { container } = render(<Message message={makeMessage({ role: 'tool', text: 'no icon' })} />)
    expect(screen.getByText('no icon')).toBeInTheDocument()
    expect(container.querySelector('.msg-tool')).not.toBeNull()
    expect(container.querySelector('svg')).toBeNull()
  })

  it.each(['read', 'write', 'edit', 'bash', 'search', 'folder', 'bot', 'wrench'] as const)(
    'renders an svg icon for tool icon "%s"',
    (icon) => {
      const { container } = render(
        <Message message={makeMessage({ role: 'tool', text: icon, icon })} />
      )
      expect(container.querySelector('svg')).not.toBeNull()
    }
  )
})
