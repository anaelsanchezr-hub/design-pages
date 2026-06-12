import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020208)

  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight, 0.1, 3000
  )
  camera.position.set(0, 60, 0.001)
  camera.lookAt(0, 0, 0)

  // Luz del Sol (puntual en el origen) + ambiente tenue para que el lado oscuro no sea negro puro
  const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0.6)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  scene.add(new THREE.AmbientLight(0x223044, 0.6))

  const starfield = createStarfield()
  scene.add(starfield)

  // Post-procesado: bloom para que el Sol y los brillos irradien
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.9,  // strength
    0.6,  // radius
    0.85  // threshold (solo lo muy brillante hace bloom → el Sol)
  )
  composer.addPass(bloom)

  return { renderer, scene, camera, composer, starfield }
}

function createStarfield() {
  const count = 2500
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 500 + Math.random() * 800
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, sizeAttenuation: true })
  return new THREE.Points(geo, mat)
}

export function handleResize({ renderer, camera, composer }) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  })
}
