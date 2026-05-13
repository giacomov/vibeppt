import { forwardRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Square } from 'lucide-react'

interface Props {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
}

const ChatInput = forwardRef<HTMLTextAreaElement, Props>(function ChatInput(
  { value, loading, onChange, onSend, onStop },
  ref,
) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <footer className="input-area">
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Claude to modify your presentation… (⌘↵ to send)"
        rows={3}
        disabled={loading}
      />
      {loading ? (
        <button
          className="send-btn stop-btn"
          onClick={onStop}
          aria-label="Stop"
        >
          <Square size={14} fill="currentColor" />
          Stop
        </button>
      ) : (
        <button
          className="send-btn"
          onClick={onSend}
          disabled={!value.trim()}
        >
          Send
        </button>
      )}
    </footer>
  )
})

export default ChatInput
