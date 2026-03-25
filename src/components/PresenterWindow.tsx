import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface PresenterWindowProps {
  children: ReactNode
  onClose: () => void
}

export function PresenterWindow({ children, onClose }: PresenterWindowProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const winRef = useRef<Window | null>(null)
  // Keep a ref to the latest onClose so the interval never holds a stale closure
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    const win = window.open('', 'presenter-view', 'width=900,height=360,resizable=yes')
    if (!win) {
      console.warn('PresenterWindow: popup was blocked by the browser.')
      onCloseRef.current()
      return
    }
    winRef.current = win

    // Copy stylesheets from parent so Tailwind classes work in the popup
    document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
      win.document.head.appendChild(el.cloneNode(true))
    })

    // Mirror any stylesheets injected after mount (Vite HMR, lazy chunks, slide inline styles).
    // Deduplicate by checking href (for <link>) or text content (for <style>) before cloning.
    const observer = new MutationObserver((mutations) => {
      if (win.closed) return
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
            const alreadyPresent = Array.from(win.document.head.querySelectorAll('link[rel="stylesheet"]'))
              .some(el => (el as HTMLLinkElement).href === node.href)
            if (!alreadyPresent) win.document.head.appendChild(node.cloneNode(true))
          } else if (node instanceof HTMLStyleElement) {
            const text = node.textContent ?? ''
            const alreadyPresent = Array.from(win.document.head.querySelectorAll('style'))
              .some(el => el.textContent === text)
            if (!alreadyPresent) win.document.head.appendChild(node.cloneNode(true))
          }
        }
      }
    })
    observer.observe(document.head, { childList: true })

    win.document.title = 'Presenter View'
    win.document.body.style.margin = '0'
    win.document.body.style.padding = '0'

    const div = win.document.createElement('div')
    win.document.body.appendChild(div)
    setContainer(div)

    // Detect user manually closing the popup
    const interval = setInterval(() => {
      if (win.closed) {
        clearInterval(interval)
        onCloseRef.current()
      }
    }, 500)

    return () => {
      clearInterval(interval)
      observer.disconnect()
      if (!win.closed) win.close()
    }
  }, [])

  if (!container) return null
  return createPortal(children, container)
}
