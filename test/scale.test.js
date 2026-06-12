// test/scale.test.js
import { describe, it, expect } from 'vitest'
import { scaleDistance, scaleRadius } from '../src/scale.js'

describe('scaleDistance', () => {
  it('mapea distancia 0 (Sol) a posición 0', () => {
    expect(scaleDistance(0)).toBe(0)
  })
  it('es monótona creciente', () => {
    expect(scaleDistance(57900000)).toBeLessThan(scaleDistance(149600000))
    expect(scaleDistance(149600000)).toBeLessThan(scaleDistance(4495100000))
  })
  it('comprime logarítmicamente (Neptuno no está 77x más lejos que Mercurio)', () => {
    const merc = scaleDistance(57900000)
    const nept = scaleDistance(4495100000)
    expect(nept / merc).toBeLessThan(20)
  })
})

describe('scaleRadius', () => {
  it('un planeta más grande tiene mayor radio de escena', () => {
    expect(scaleRadius(4879)).toBeLessThan(scaleRadius(139820))
  })
  it('devuelve un radio mínimo visible para cuerpos chicos', () => {
    expect(scaleRadius(4879)).toBeGreaterThanOrEqual(0.5)
  })
})
