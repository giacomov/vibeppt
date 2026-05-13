import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import ChatPanel from './ChatPanel'

function makeStreamingResponse(events: Array<Record<string, unknown>>, opts: { holdOpen?: boolean } = {}): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const ev of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n`))
      }
      if (!opts.holdOpen) controller.close()
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}

function setupFetchMock(): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url === '/chat') return Promise.resolve(makeStreamingResponse([]))
    return Promise.resolve(new Response('', { status: 200 }))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  localStorage.clear()
  // jsdom doesn't implement scrollIntoView; ChatPanel calls it after every render.
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn() as unknown as Element['scrollIntoView']
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ChatPanel — initial render', () => {
  it('renders welcome hints when there are no messages', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    expect(screen.getByText(/What would you like to do/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /presentation/i }).length).toBeGreaterThan(0)
  })

  it('restores chat history from localStorage on mount', () => {
    setupFetchMock()
    localStorage.setItem(
      'vibeppt-chat',
      JSON.stringify([{ id: '1', role: 'user', text: 'hi from yesterday' }])
    )
    render(<ChatPanel slideContext={null} />)
    expect(screen.getByText('hi from yesterday')).toBeInTheDocument()
    // Welcome hints are hidden when there are existing messages.
    expect(screen.queryByText(/What would you like to do/i)).not.toBeInTheDocument()
  })

  it('Send is disabled when input is empty', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    expect(screen.getByRole('button', { name: /^Send$/ })).toBeDisabled()
  })

  it('Send is enabled once the user types', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i)
    fireEvent.change(textarea, { target: { value: 'hello' } })
    expect(screen.getByRole('button', { name: /^Send$/ })).toBeEnabled()
  })
})

describe('ChatPanel — suggestion chips', () => {
  it('clicking a suggestion fills the textarea', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const chip = screen.getByRole('button', { name: /Create a presentation about/ })
    fireEvent.click(chip)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i) as HTMLTextAreaElement
    expect(textarea.value).toMatch(/Create a presentation about/)
  })
})

describe('ChatPanel — sending', () => {
  it('clicking Send posts to /chat with the typed message and current model/effort', async () => {
    const fetchMock = setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i)
    fireEvent.change(textarea, { target: { value: 'Hello Claude' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const chatCall = fetchMock.mock.calls.find((c) => c[0] === '/chat')
    expect(chatCall).toBeDefined()
    const body = JSON.parse((chatCall![1] as RequestInit).body as string)
    expect(body).toMatchObject({
      message: 'Hello Claude',
      sessionId: null,
      model: 'sonnet',
      effort: 'medium',
    })
  })

  it('Cmd+Enter triggers send', async () => {
    const fetchMock = setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i)
    fireEvent.change(textarea, { target: { value: 'via keybind' } })

    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true })
    })

    await waitFor(() =>
      expect(fetchMock.mock.calls.some((c) => c[0] === '/chat')).toBe(true)
    )
  })

  it('Ctrl+Enter also triggers send', async () => {
    const fetchMock = setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i)
    fireEvent.change(textarea, { target: { value: 'via ctrl' } })

    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
    })

    await waitFor(() =>
      expect(fetchMock.mock.calls.some((c) => c[0] === '/chat')).toBe(true)
    )
  })

  it('plain Enter does NOT trigger send (so the user can insert a newline)', async () => {
    const fetchMock = setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i)
    fireEvent.change(textarea, { target: { value: 'no send' } })

    fireEvent.keyDown(textarea, { key: 'Enter' })
    // Wait a tick — no /chat call should be queued.
    await new Promise((r) => setTimeout(r, 10))
    expect(fetchMock.mock.calls.some((c) => c[0] === '/chat')).toBe(false)
  })

  it('clears the input and shows the user message after sending', async () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const textarea = screen.getByPlaceholderText(/Ask Claude/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'echo me' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    expect(textarea.value).toBe('')
    expect(screen.getByText('echo me')).toBeInTheDocument()
  })

  it('persists the sent message to localStorage', async () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'persist me' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => {
      const raw = localStorage.getItem('vibeppt-chat')
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!)
      expect(parsed.some((m: { text: string }) => m.text === 'persist me')).toBe(true)
    })
  })
})

describe('ChatPanel — Stop while streaming', () => {
  it('Stop button appears while loading and calls /stop on click', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') return Promise.resolve(makeStreamingResponse([], { holdOpen: true }))
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'stream' } })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    // The send button is replaced by a Stop button while loading.
    const stopBtn = await screen.findByRole('button', { name: /Stop/i })
    expect(stopBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(stopBtn)
    })

    await waitFor(() =>
      expect(fetchMock.mock.calls.some((c) => c[0] === '/stop')).toBe(true)
    )
  })
})

describe('ChatPanel — settings popover', () => {
  it('opens and closes when toggled', async () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    const toggle = screen.getByRole('button', { name: /Model settings/i })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(toggle)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(toggle)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes on an outside mousedown', async () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Model settings/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('changing the model persists to localStorage', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Model settings/i }))

    const modelSelect = screen.getByRole('combobox', { name: /Model/i }) as HTMLSelectElement
    fireEvent.change(modelSelect, { target: { value: 'haiku' } })

    expect(localStorage.getItem('vibeppt-model')).toBe('haiku')
  })

  it('toggling auto-approve-web persists "1" / "0" to localStorage', () => {
    setupFetchMock()
    render(<ChatPanel slideContext={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Model settings/i }))

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(localStorage.getItem('vibeppt-auto-approve-web')).toBe('1')

    fireEvent.click(checkbox)
    expect(localStorage.getItem('vibeppt-auto-approve-web')).toBe('0')
  })

  it('reads the stored model/effort/auto-approve on mount', () => {
    setupFetchMock()
    localStorage.setItem('vibeppt-model', 'opus')
    localStorage.setItem('vibeppt-effort', 'high')
    localStorage.setItem('vibeppt-auto-approve-web', '1')

    render(<ChatPanel slideContext={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Model settings/i }))

    expect((screen.getByRole('combobox', { name: /Model/i }) as HTMLSelectElement).value).toBe('opus')
    expect((screen.getByRole('combobox', { name: /Effort/i }) as HTMLSelectElement).value).toBe('high')
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('falls back to defaults when localStorage contains an unknown value', () => {
    setupFetchMock()
    localStorage.setItem('vibeppt-model', 'bogus')
    localStorage.setItem('vibeppt-effort', 'extreme')

    render(<ChatPanel slideContext={null} />)
    fireEvent.click(screen.getByRole('button', { name: /Model settings/i }))

    expect((screen.getByRole('combobox', { name: /Model/i }) as HTMLSelectElement).value).toBe('sonnet')
    expect((screen.getByRole('combobox', { name: /Effort/i }) as HTMLSelectElement).value).toBe('medium')
  })
})

describe('ChatPanel — New session reset', () => {
  it('calls /reset, clears localStorage, and empties messages', async () => {
    const fetchMock = setupFetchMock()
    localStorage.setItem(
      'vibeppt-chat',
      JSON.stringify([{ id: '1', role: 'user', text: 'old turn' }])
    )
    localStorage.setItem('vibeppt-session-id', 'sess-123')

    render(<ChatPanel slideContext={null} />)
    expect(screen.getByText('old turn')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /New session/i }))
    })

    await waitFor(() =>
      expect(fetchMock.mock.calls.some((c) => c[0] === '/reset')).toBe(true)
    )
    expect(localStorage.getItem('vibeppt-session-id')).toBeNull()
    expect(screen.queryByText('old turn')).not.toBeInTheDocument()
    // Welcome hints reappear once the message list is empty.
    expect(screen.getByText(/What would you like to do/i)).toBeInTheDocument()
  })
})

describe('ChatPanel — streaming events from /chat', () => {
  it('appends an assistant text block to the message list', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') {
        return Promise.resolve(
          makeStreamingResponse([
            {
              type: 'assistant',
              session_id: 'sess-abc',
              message: { role: 'assistant', content: [{ type: 'text', text: 'hello world' }] },
            },
          ])
        )
      }
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'hi' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => expect(screen.getByText('hello world')).toBeInTheDocument())
    expect(localStorage.getItem('vibeppt-session-id')).toBe('sess-abc')
  })

  it('renders an error event as an error message', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') {
        return Promise.resolve(
          makeStreamingResponse([{ type: 'error', message: 'something blew up' }])
        )
      }
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'go' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => expect(screen.getByText('something blew up')).toBeInTheDocument())
  })

  it('surfaces a Bash permission_request as an approval card with Allow / Deny', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') {
        return Promise.resolve(
          makeStreamingResponse(
            [
              {
                type: 'permission_request',
                id: 'req-1',
                toolName: 'Bash',
                input: { command: 'ls -la' },
              },
            ],
            { holdOpen: true }
          )
        )
      }
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'go' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => expect(screen.getByText(/wants to run a shell command/i)).toBeInTheDocument())
    expect(screen.getByText('ls -la')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Allow$/ }))
    })

    await waitFor(() => {
      const approveCall = fetchMock.mock.calls.find((c) => c[0] === '/approve')
      expect(approveCall).toBeDefined()
      const body = JSON.parse((approveCall![1] as RequestInit).body as string)
      expect(body).toMatchObject({ id: 'req-1', behavior: 'allow' })
    })
  })

  it('auto-approves WebFetch when the toggle is on (no card shown)', async () => {
    localStorage.setItem('vibeppt-auto-approve-web', '1')
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') {
        return Promise.resolve(
          makeStreamingResponse(
            [
              {
                type: 'permission_request',
                id: 'req-2',
                toolName: 'WebFetch',
                input: { url: 'https://example.com', prompt: 'fetch this' },
              },
            ],
            { holdOpen: true }
          )
        )
      }
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'go' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => {
      const approveCall = fetchMock.mock.calls.find((c) => c[0] === '/approve')
      expect(approveCall).toBeDefined()
      const body = JSON.parse((approveCall![1] as RequestInit).body as string)
      expect(body).toMatchObject({ id: 'req-2', behavior: 'allow' })
    })

    // No card surfaced.
    expect(screen.queryByText(/wants to fetch a URL/i)).not.toBeInTheDocument()
  })

  it('renders a file_picker_request as a picker card', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === '/chat') {
        return Promise.resolve(
          makeStreamingResponse(
            [{ type: 'file_picker_request', id: 'fp-1', fileType: 'image' }],
            { holdOpen: true }
          )
        )
      }
      return Promise.resolve(new Response('', { status: 200 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<ChatPanel slideContext={null} />)
    fireEvent.change(screen.getByPlaceholderText(/Ask Claude/i), { target: { value: 'go' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Send$/ }))
    })

    await waitFor(() => expect(screen.getByText(/Pick an image/i)).toBeInTheDocument())
    expect(screen.getByPlaceholderText(/Path .*\bor URL/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })
})
