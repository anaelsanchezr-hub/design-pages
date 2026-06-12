// test/camera-path.test.js
import { describe, it, expect } from 'vitest'
import { buildKeyframes, sampleCamera } from '../src/camera-path.js'

const fakeBodies = [
  { id: 'sol',      position: { x: 0,  y: 0, z: 0 }, radius: 4 },
  { id: 'mercurio', position: { x: 8,  y: 0, z: 0 }, radius: 0.5 },
  { id: 'neptuno',  position: { x: 30, y: 0, z: 0 }, radius: 2 },
]

describe('buildKeyframes', () => {
  it('genera intro + un keyframe por cuerpo + finale', () => {
    const kf = buildKeyframes(fakeBodies)
    expect(kf.length).toBe(5)
    expect(kf[0].id).toBe('intro')
    expect(kf[kf.length - 1].id).toBe('finale')
  })
  it('progress va de 0 a 1 monótonamente', () => {
    const kf = buildKeyframes(fakeBodies)
    expect(kf[0].progress).toBe(0)
    expect(kf[kf.length - 1].progress).toBe(1)
    for (let i = 1; i < kf.length; i++) {
      expect(kf[i].progress).toBeGreaterThan(kf[i - 1].progress)
    }
  })
  it('en cada cuerpo la cámara mira al cuerpo y se separa más que su radio', () => {
    const kf = buildKeyframes(fakeBodies)
    const m = kf.find(k => k.id === 'mercurio')
    expect(m.target.x).toBe(8)
    expect(m.camera.z).toBeGreaterThan(0.5)
  })
  it('intro y finale usan vista cenital elevada', () => {
    const kf = buildKeyframes(fakeBodies)
    expect(kf[0].camera.y).toBeGreaterThan(10)
    expect(kf[kf.length - 1].camera.y).toBeGreaterThan(10)
  })
})

describe('sampleCamera', () => {
  it('en progress 0 devuelve el keyframe de intro', () => {
    const kf = buildKeyframes(fakeBodies)
    const s = sampleCamera(kf, 0)
    expect(s.camera.y).toBeCloseTo(kf[0].camera.y)
  })
  it('interpola entre keyframes (valor intermedio)', () => {
    const kf = buildKeyframes(fakeBodies)
    const s = sampleCamera(kf, 0.5)
    expect(typeof s.camera.x).toBe('number')
    expect(typeof s.target.x).toBe('number')
  })
})
