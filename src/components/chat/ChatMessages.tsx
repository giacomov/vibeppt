import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ChatMessage } from '../../types/chat'
import Message from '../Message'
import ThinkingIndicator from '../ThinkingIndicator'

interface Props {
  messages: ChatMessage[]
  loading: boolean
  showThinking: boolean
  onSuggestionClick: (text: string) => void
  approvalCard: ReactNode
  filePickerCard: ReactNode
  scrollTrigger: unknown
}

export default function ChatMessages({
  messages,
  loading,
  showThinking,
  onSuggestionClick,
  approvalCard,
  filePickerCard,
  scrollTrigger,
}: Props): ReactNode {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scrollTrigger])

  return (
    <div className="messages">
      {messages.length === 0 && !loading && (
        <div className="welcome-hints">
          <p className="welcome-tagline">What would you like to do?</p>
          <div className="suggestion-chips">
            <button className="chip" onClick={() => onSuggestionClick('Open a presentation and ask me to modify it')}>
              Open a presentation and ask me to modify it
            </button>
            <button className="chip" onClick={() => onSuggestionClick('Create a presentation about ')}>
              Create a presentation about …
            </button>
          </div>
        </div>
      )}
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
      {showThinking && (
        <div className="thinking-indicator">
          <ThinkingIndicator />
        </div>
      )}
      {approvalCard}
      {filePickerCard}
      <div ref={endRef} />
    </div>
  )
}
