import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AnimationProvider, useAnimationContext, type AnimationController } from './AnimationContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AnimationProvider>{children}</AnimationProvider>
}

function makeController(overrides: Partial<AnimationController> = {}): AnimationController {
  return {
    advance: () => true,
    retreat: () => true,
    ...overrides,
  }
}

describe('AnimationContext', () => {
  it('returns false from advance/retreat when no controller is registered', () => {
    const { result } = renderHook(() => useAnimationContext(), { wrapper })
    expect(result.current.advance()).toBe(false)
    expect(result.current.retreat()).toBe(false)
  })

  it('routes advance() and retreat() to the registered controller', () => {
    let advanceCalls = 0
    let retreatCalls = 0
    const ctrl = makeController({
      advance: () => { advanceCalls++; return true },
      retreat: () => { retreatCalls++; return true },
    })

    const { result } = renderHook(() => useAnimationContext(), { wrapper })
    act(() => result.current.register(ctrl))

    expect(result.current.advance()).toBe(true)
    expect(result.current.retreat()).toBe(true)
    expect(advanceCalls).toBe(1)
    expect(retreatCalls).toBe(1)
  })

  it('propagates the controller return value (false means "navigate")', () => {
    const ctrl = makeController({
      advance: () => false,
      retreat: () => false,
    })
    const { result } = renderHook(() => useAnimationContext(), { wrapper })
    act(() => result.current.register(ctrl))

    expect(result.current.advance()).toBe(false)
    expect(result.current.retreat()).toBe(false)
  })

  it('stops routing after unregister()', () => {
    let advanceCalls = 0
    const ctrl = makeController({ advance: () => { advanceCalls++; return true } })
    const { result } = renderHook(() => useAnimationContext(), { wrapper })

    act(() => result.current.register(ctrl))
    expect(result.current.advance()).toBe(true)
    expect(advanceCalls).toBe(1)

    act(() => result.current.unregister())
    expect(result.current.advance()).toBe(false)
    expect(advanceCalls).toBe(1) // controller no longer invoked
  })

  it('register() replaces the previously registered controller', () => {
    let firstCalls = 0
    let secondCalls = 0
    const first = makeController({ advance: () => { firstCalls++; return true } })
    const second = makeController({ advance: () => { secondCalls++; return true } })

    const { result } = renderHook(() => useAnimationContext(), { wrapper })
    act(() => result.current.register(first))
    act(() => result.current.register(second))

    result.current.advance()
    expect(firstCalls).toBe(0)
    expect(secondCalls).toBe(1)
  })

  it('default context (no provider) is a no-op that returns false', () => {
    // Calling useAnimationContext without AnimationProvider falls back to the
    // default value declared at module level — register/unregister are no-ops
    // and advance/retreat return false.
    const { result } = renderHook(() => useAnimationContext())
    expect(() => result.current.register(makeController())).not.toThrow()
    expect(() => result.current.unregister()).not.toThrow()
    expect(result.current.advance()).toBe(false)
    expect(result.current.retreat()).toBe(false)
  })
})
