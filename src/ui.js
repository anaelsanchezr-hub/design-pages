import { BODIES } from './data/planets.js'

// Construye paneles, intro/finale, dots de navegación y barra de progreso.
// Devuelve { update(sectionId, progress) }.
export function setupUI(overlayEl) {
  const panels = new Map()

  // Intro
  const intro = document.createElement('div')
  intro.className = 'fullscreen-msg'
  intro.innerHTML = `
    <h1>Nuestro Sistema Solar</h1>
    <p>Un viaje a escala desde el Sol hasta los confines de Neptuno.</p>
    <div class="hint">SCROLL PARA EMPEZAR ↓</div>`
  overlayEl.appendChild(intro)
  panels.set('intro', intro)

  // Un panel por cuerpo
  for (const d of BODIES) {
    const el = document.createElement('div')
    el.className = 'panel'
    el.innerHTML = panelMarkup(d)
    overlayEl.appendChild(el)
    panels.set(d.id, el)
  }

  // Finale
  const finale = document.createElement('div')
  finale.className = 'fullscreen-msg'
  finale.innerHTML = `
    <h1>Una escala difícil de imaginar</h1>
    <p>Si el Sol fuera una pelota de básquet, la Tierra sería un guisante
       a 26 metros — y Neptuno, un grano de arena a casi 800.</p>`
  overlayEl.appendChild(finale)
  panels.set('finale', finale)

  // Dots de navegación (uno por cuerpo)
  const navDots = document.createElement('div')
  navDots.className = 'nav-dots'
  const dotEls = new Map()
  for (const d of BODIES) {
    const dot = document.createElement('div')
    dot.className = 'dot'
    dot.title = d.nombre
    navDots.appendChild(dot)
    dotEls.set(d.id, dot)
  }
  overlayEl.appendChild(navDots)

  // Barra de progreso
  const progress = document.createElement('div')
  progress.className = 'progress-bar'
  overlayEl.appendChild(progress)

  function update(sectionId, p) {
    for (const [pid, el] of panels) el.classList.toggle('visible', pid === sectionId)
    for (const [did, dot] of dotEls) dot.classList.toggle('active', did === sectionId)
    progress.style.width = `${Math.round(p * 100)}%`
  }

  return { update }
}

function fmt(n) { return n.toLocaleString('es-ES') }

function panelMarkup(d) {
  const distancia = d.distanciaSolKm === 0 ? '—' : `${fmt(Math.round(d.distanciaSolKm / 1_000_000))} M km`
  const vsTierra = d.id === 'tierra' ? '' : `<div class="sub">${d.diametroVsTierra}× la Tierra</div>`
  return `
    <div class="panel-name">
      <div class="numeral">${d.numeral}</div>
      <div class="nombre">${d.nombre}</div>
    </div>
    <div class="panel-data">
      <div><div class="label">DIÁMETRO</div><div class="value">${fmt(d.diametroKm)} km</div>${vsTierra}</div>
      <div><div class="label">DISTANCIA AL SOL</div><div class="value">${distancia}</div></div>
      <div><div class="label">LUNAS</div><div class="value">${d.lunas}</div></div>
      <div class="curioso"><div class="label">DATO CURIOSO</div>${d.datoCurioso}</div>
    </div>`
}
