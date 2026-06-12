import * as THREE from 'three'
import { BODIES } from './data/planets.js'
import { scaleDistance, scaleRadius } from './scale.js'

// Crea todos los cuerpos. Devuelve Map id -> { mesh, group, data, position, radius }.
export function createPlanets(scene) {
  const bodies = new Map()

  for (const data of BODIES) {
    const radius = scaleRadius(data.diametroKm)
    const x = scaleDistance(data.distanciaSolKm)
    const group = new THREE.Group()
    group.position.set(x, 0, 0)

    const geo = new THREE.SphereGeometry(radius, 64, 64)
    const mat = data.id === 'sol'
      ? new THREE.MeshBasicMaterial({ color: data.colorAcento })
      : new THREE.MeshStandardMaterial({ color: data.colorAcento, roughness: 0.9, metalness: 0.0 })
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)

    if (data.tieneAnillos) group.add(createRings(radius))
    if (data.atmosfera) group.add(createAtmosphere(radius, data.atmosfera))
    // Inclinación de eje característica de Urano
    if (data.id === 'urano') mesh.rotation.z = Math.PI / 2

    scene.add(group)
    bodies.set(data.id, { mesh, group, data, position: new THREE.Vector3(x, 0, 0), radius })
  }

  return bodies
}

function createRings(planetRadius) {
  const geo = new THREE.RingGeometry(planetRadius * 1.3, planetRadius * 2.2, 96)
  const mat = new THREE.MeshBasicMaterial({
    color: 0xc8b478, side: THREE.DoubleSide, transparent: true, opacity: 0.6,
  })
  const ring = new THREE.Mesh(geo, mat)
  ring.rotation.x = -Math.PI / 2.2
  return ring
}

function createAtmosphere(planetRadius, color) {
  const geo = new THREE.SphereGeometry(planetRadius * 1.12, 64, 64)
  const mat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.18, side: THREE.BackSide,
  })
  return new THREE.Mesh(geo, mat)
}

// Rotación lenta de cada planeta sobre su eje (llamar en el loop).
export function rotatePlanets(bodies, delta) {
  for (const { mesh, data } of bodies.values()) {
    if (data.id !== 'sol') mesh.rotation.y += delta * 0.1
  }
}
