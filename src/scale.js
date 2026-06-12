// Funciones puras de escala. Las distancias reales abarcan 5 órdenes de
// magnitud — se comprimen con log para que todos los cuerpos sean visibles.
const DISTANCE_UNIT = 8

export function scaleDistance(distanciaSolKm) {
  if (distanciaSolKm <= 0) return 0
  return Math.log10(distanciaSolKm / 1_000_000 + 1) * DISTANCE_UNIT
}

const MIN_RADIUS = 0.5
const RADIUS_SCALE = 0.0008

export function scaleRadius(diametroKm) {
  const r = (diametroKm / 2) * RADIUS_SCALE
  return Math.max(MIN_RADIUS, r)
}
