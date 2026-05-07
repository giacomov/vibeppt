import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { SlideContext } from './types'
import ChatPanel from './ChatPanel'

// In Electron the viewer is served via the viewer:// custom protocol.
// In dev/browser it runs as a Vite server on 5173.
const VIEWER_SRC = navigator.userAgent.includes('Electron')
  ? 'viewer://app/'
  : 'http://localhost:5173'

export default function App(): ReactNode {
  const [slideContext, setSlideContext] = useState<SlideContext | null>(null)
  const [chatHidden, setChatHidden] = useState(false)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'vibeppt:context') {
        setSlideContext(e.data as SlideContext)
      }
      if (e.data?.type === 'vibeppt:focus-mode') {
        setChatHidden(e.data.active as boolean)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div className={`layout${chatHidden ? ' layout--focus' : ''}`}>
      <div className="deck-panel">
        <iframe
          src={VIEWER_SRC}
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
