import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildKeyframes, sampleCamera } from './camera-path.js'

gsap.registerPlugin(ScrollTrigger)

// Conecta el progreso de scroll al movimiento de cámara.
// onUpdate(sectionId, progress) se llama en cada frame de scroll.
export function setupScroll({ camera }, bodies, onUpdate) {
  const keyframes = buildKeyframes([...bodies.values()])
  let lastSection = null

  ScrollTrigger.create({
    trigger: '#scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
    onUpdate: (self) => {
      const { camera: camPos, target } = sampleCamera(keyframes, self.progress)
      camera.position.set(camPos.x, camPos.y, camPos.z)
      camera.lookAt(target.x, target.y, target.z)

      const active = nearestKeyframe(keyframes, self.progress)
      const changed = active !== lastSection
      lastSection = active
      onUpdate(active, self.progress, changed)
    },
  })
}

function nearestKeyframe(keyframes, progress) {
  let best = keyframes[0], bestDist = Infinity
  for (const kf of keyframes) {
    const d = Math.abs(kf.progress - progress)
    if (d < bestDist) { bestDist = d; best = kf }
  }
  return best.id
}
