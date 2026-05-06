import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { SlideContext } from './types'
import ChatPanel from './ChatPanel'

export default function App(): ReactNode {
  const [slideContext, setSlideContext] = useState<SlideContext | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'vibeppt:context') {
        setSlideContext(e.data as SlideContext)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className="layout">
      <div className="deck-panel">
        <iframe
          src="http://localhost:5173"
          title="VibePPT Preview"
          allowFullScreen
        />
      </div>
      <div className="chat-panel">
        <ChatPanel slideContext={slideContext} />
      </div>
    </div>
  )
}
