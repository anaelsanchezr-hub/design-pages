// test/webgl-check.test.js
import { describe, it, expect, vi } from 'vitest'
import { isWebGLAvailable } from '../src/webgl-check.js'

describe('isWebGLAvailable', () => {
  it('true cuando el canvas da un contexto webgl', () => {
    expect(isWebGLAvailable({ getContext: vi.fn(() => ({})) })).toBe(true)
  })
  it('false cuando getContext devuelve null', () => {
    expect(isWebGLAvailable({ getContext: vi.fn(() => null) })).toBe(false)
  })
  it('false cuando getContext lanza', () => {
    expect(isWebGLAvailable({ getContext: vi.fn(() => { throw new Error('no gl') }) })).toBe(false)
  })
})
