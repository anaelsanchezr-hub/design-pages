import '../styles/main.css'
import * as THREE from 'three'
import { createScene, handleResize } from './scene.js'
import { isWebGLAvailable, showWebGLFallback } from './webgl-check.js'
import { createPlanets, rotatePlanets } from './planets.js'

const canvas = document.getElementById('scene')

if (!isWebGLAvailable(canvas)) {
  showWebGLFallback(document.getElementById('overlay'))
} else {
  const ctx = createScene(canvas)
  handleResize(ctx)

  const bodies = createPlanets(ctx.scene)

  const clock = new THREE.Clock()
  function animate() {
    requestAnimationFrame(animate)
    const delta = clock.getDelta()
    // Parallax sutil del starfield (rotación muy lenta)
    ctx.starfield.rotation.y += delta * 0.005
    rotatePlanets(bodies, delta)
    ctx.composer.render()
  }
  animate()
}
