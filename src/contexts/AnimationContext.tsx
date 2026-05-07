import { createContext, useContext, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface AnimationController {
  advance: () => boolean  // true = consumed; false = animation done, caller should navigate
  retreat: () => boolean  // true = consumed; false = at step 0, caller should navigate
}

interface AnimationContextValue {
  register: (ctrl: AnimationController) => void
  unregister: () => void
  advance: () => boolean
  retreat: () => boolean
}

const AnimationContext = createContext<AnimationContextValue>({
  register: () => {},
  unregister: () => {},
  advance: () => false,
  retreat: () => false,
})

export function AnimationProvider({ children }: { children: ReactNode }) {
  const controllerRef = useRef<AnimationController | null>(null)

  const register = useCallback((ctrl: AnimationController) => {
    controllerRef.current = ctrl
  }, [])

  const unregister = useCallback(() => {
    controllerRef.current = null
  }, [])

  const advance = useCallback(() => controllerRef.current?.advance() ?? false, [])
  const retreat = useCallback(() => controllerRef.current?.retreat() ?? false, [])

  return (
    <AnimationContext.Provider value={{ register, unregister, advance, retreat }}>
      {children}
    </AnimationContext.Provider>
  )
}

export const useAnimationContext = () => useContext(AnimationContext)
