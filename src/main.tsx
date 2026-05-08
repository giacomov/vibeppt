import './index.css'
import '@xyflow/react/dist/base.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AnimationProvider } from './contexts/AnimationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimationProvider>
      <App />
    </AnimationProvider>
  </StrictMode>,
)
