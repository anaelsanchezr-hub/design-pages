// Keyframes de cámara para el recorrido del scroll.
// Cada keyframe: { id, progress (0..1), camera {x,y,z}, target {x,y,z} }.
export function buildKeyframes(bodies) {
  const last = bodies[bodies.length - 1]
  const overviewY = Math.max(40, last.position.x * 1.4)
  const centerX = last.position.x / 2

  const intro = {
    id: 'intro', progress: 0,
    camera: { x: centerX, y: overviewY, z: 0.001 },
    target: { x: centerX, y: 0, z: 0 },
  }
  const finale = {
    id: 'finale', progress: 1,
    camera: { x: centerX, y: overviewY, z: 0.001 },
    target: { x: centerX, y: 0, z: 0 },
  }

  const n = bodies.length
  const bodyFrames = bodies.map((b, i) => {
    const progress = (i + 1) / (n + 1)
    const dist = Math.max(b.radius * 3, 2)
    return {
      id: b.id, progress,
      camera: { x: b.position.x + b.radius * 0.4, y: b.radius * 0.7, z: dist },
      target: { x: b.position.x, y: 0, z: 0 },
    }
  })

  return [intro, ...bodyFrames, finale]
}

// Estado interpolado de cámara/target para un progress global (0..1).
export function sampleCamera(keyframes, progress) {
  const p = Math.min(1, Math.max(0, progress))
  let a = keyframes[0], b = keyframes[keyframes.length - 1]
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (p >= keyframes[i].progress && p <= keyframes[i + 1].progress) {
      a = keyframes[i]; b = keyframes[i + 1]; break
    }
  }
  const span = b.progress - a.progress || 1
  const t = (p - a.progress) / span
  const ease = t * t * (3 - 2 * t) // smoothstep
  return { camera: lerpVec(a.camera, b.camera, ease), target: lerpVec(a.target, b.target, ease) }
}

function lerpVec(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }
}
