# Sistema Solar Scrollytelling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una web de scrollytelling 3D del sistema solar (Three.js + GSAP) con calidad visual alta (bloom, atmósferas, parallax), desplegable en GitHub Pages, donde la cámara recorre del Sol a Neptuno con vista cenital + zoom y paneles de datos por planeta.

**Architecture:** Una única escena Three.js a pantalla completa detrás de overlays HTML. Post-procesado con UnrealBloomPass para el resplandor del Sol. GSAP ScrollTrigger mapea el progreso de scroll a keyframes de cámara interpolados con smoothstep. Datos de planetas en JS, render data-driven. Build estático con Vite hacia `dist/` para GitHub Pages.

**Tech Stack:** Three.js (r160+) + addons (EffectComposer, UnrealBloomPass), GSAP + ScrollTrigger, Vite, HTML/CSS puro, JavaScript (ES modules). Sin backend.

**Deploy target:** Repo `anaelsanchezr-hub/design-pages` → `https://anaelsanchezr-hub.github.io/design-pages/`

**Nota sobre verificación:** Experiencia visual/WebGL. La lógica pura (escala, keyframes, detección WebGL) se cubre con tests Vitest; lo visual se verifica con un checklist manual en navegador por cada tarea.

---

## File Structure

```
/
├── index.html                  ← markup base + canvas mount (sin <link> CSS)
├── package.json
├── vite.config.js              ← base: '/design-pages/'
├── .gitignore
├── src/
│   ├── main.js                 ← entry: importa CSS, init escena/scroll/ui, render loop
│   ├── scene.js                ← renderer, composer(bloom), cámara, luces, starfield+parallax
│   ├── planets.js              ← meshes data-driven, anillos Saturno, atmósfera Tierra, rotación
│   ├── scale.js                ← funciones puras de escala — TESTEABLE
│   ├── camera-path.js          ← keyframes de cámara + sampleCamera — TESTEABLE
│   ├── scroll.js               ← ScrollTrigger → cámara + sección activa + progreso
│   ├── ui.js                   ← paneles de datos, intro/finale, dots de navegación, barra progreso
│   ├── webgl-check.js          ← detección WebGL + fallback — TESTEABLE
│   └── data/
│       └── planets.js          ← array de datos de Sol + 8 planetas
├── public/
│   └── textures/               ← texturas NASA
├── styles/
│   └── main.css                ← estilos de overlays, paneles, dots, progreso
├── test/
│   ├── scale.test.js
│   ├── camera-path.test.js
│   └── webgl-check.test.js
└── .github/workflows/deploy.yml
```

---

## Task 1: Scaffolding del proyecto

**Files:** Create `package.json`, `vite.config.js`, `.gitignore`, `index.html`, `src/main.js`, `styles/main.css`

- [ ] **Step 1: Inicializar npm (git ya existe con el remote del repo)**

```bash
npm init -y
```

- [ ] **Step 2: Instalar dependencias**

```bash
npm install three gsap
npm install -D vite vitest
```

- [ ] **Step 3: Crear `.gitignore`**

```
node_modules/
dist/
.superpowers/
.DS_Store
*.log
```

- [ ] **Step 4: En `package.json`, reemplazar el bloque `"scripts"` por:**

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 5: Crear `vite.config.js`**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/design-pages/',
  build: { outDir: 'dist' },
})
```

- [ ] **Step 6: Crear `index.html`** (sin `<link>` — el CSS lo importa main.js para respetar el base path)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuestro Sistema Solar</title>
</head>
<body>
  <canvas id="scene"></canvas>
  <div id="overlay"></div>
  <div id="scroll-container">
    <div class="scroll-spacer"></div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 7: Crear `styles/main.css`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: #020208; color: #fff; font-family: system-ui, sans-serif; }
#scene { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 0; }
#overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
#scroll-container { position: relative; z-index: 2; }
/* La altura define cuánto scroll hay (~120vh por sección, 11 secciones). */
.scroll-spacer { height: 1100vh; }
```

- [ ] **Step 8: Crear `src/main.js` placeholder**

```js
import '../styles/main.css'
console.log('Sistema solar — init')
```

- [ ] **Step 9: Verificar que arranca**

Run: `npm run dev`
Expected: Vite imprime un URL local. Abrir: fondo negro, consola "Sistema solar — init", sin errores.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold proyecto sistema solar con Vite + Three.js + GSAP"
```

---

## Task 2: Datos de los planetas

**Files:** Create `src/data/planets.js`

- [ ] **Step 1: Crear `src/data/planets.js`**

```js
// Datos de los cuerpos del sistema solar.
// distanciaSolKm: distancia media al Sol (0 para el Sol).
// diametroKm: diámetro ecuatorial. diametroVsTierra: ratio (Tierra = 1).
// textura: nombre del archivo en public/textures/.
export const BODIES = [
  {
    id: 'sol', nombre: 'Sol', numeral: 'ESTRELLA',
    diametroKm: 1392700, diametroVsTierra: 109.2,
    distanciaSolKm: 0, lunas: 0,
    datoCurioso: 'Contiene el 99,86 % de toda la masa del sistema solar.',
    colorAcento: '#f4c06f', textura: 'sol.jpg',
  },
  {
    id: 'mercurio', nombre: 'Mercurio', numeral: 'PLANETA I',
    diametroKm: 4879, diametroVsTierra: 0.38,
    distanciaSolKm: 57900000, lunas: 0,
    datoCurioso: 'Un día en Mercurio dura 59 días terrestres.',
    colorAcento: '#c4a882', textura: 'mercurio.jpg',
  },
  {
    id: 'venus', nombre: 'Venus', numeral: 'PLANETA II',
    diametroKm: 12104, diametroVsTierra: 0.95,
    distanciaSolKm: 108200000, lunas: 0,
    datoCurioso: 'Es el planeta más caliente: 465 °C en superficie.',
    colorAcento: '#e8c87a', textura: 'venus.jpg',
  },
  {
    id: 'tierra', nombre: 'Tierra', numeral: 'PLANETA III',
    diametroKm: 12742, diametroVsTierra: 1,
    distanciaSolKm: 149600000, lunas: 1,
    datoCurioso: 'El único lugar conocido del universo con vida.',
    colorAcento: '#6b8cba', textura: 'tierra.jpg', atmosfera: '#5a9bd4',
  },
  {
    id: 'marte', nombre: 'Marte', numeral: 'PLANETA IV',
    diametroKm: 6779, diametroVsTierra: 0.53,
    distanciaSolKm: 227900000, lunas: 2,
    datoCurioso: 'Alberga el volcán más alto del sistema solar: Monte Olimpo, 22 km.',
    colorAcento: '#d46b4a', textura: 'marte.jpg',
  },
  {
    id: 'jupiter', nombre: 'Júpiter', numeral: 'PLANETA V',
    diametroKm: 139820, diametroVsTierra: 10.97,
    distanciaSolKm: 778600000, lunas: 95,
    datoCurioso: 'La Gran Mancha Roja es una tormenta más grande que la Tierra.',
    colorAcento: '#d8a878', textura: 'jupiter.jpg',
  },
  {
    id: 'saturno', nombre: 'Saturno', numeral: 'PLANETA VI',
    diametroKm: 116460, diametroVsTierra: 9.14,
    distanciaSolKm: 1433500000, lunas: 146,
    datoCurioso: 'Sus anillos tienen ~20 m de grosor pero se extienden 282.000 km.',
    colorAcento: '#c8a45a', textura: 'saturno.jpg', tieneAnillos: true,
  },
  {
    id: 'urano', nombre: 'Urano', numeral: 'PLANETA VII',
    diametroKm: 50724, diametroVsTierra: 3.98,
    distanciaSolKm: 2872500000, lunas: 28,
    datoCurioso: 'Rota de lado: su eje está inclinado casi 98°.',
    colorAcento: '#a8d8e0', textura: 'urano.jpg',
  },
  {
    id: 'neptuno', nombre: 'Neptuno', numeral: 'PLANETA VIII',
    diametroKm: 49244, diametroVsTierra: 3.86,
    distanciaSolKm: 4495100000, lunas: 16,
    datoCurioso: 'Tiene los vientos más rápidos: hasta 2.100 km/h.',
    colorAcento: '#4a6ed0', textura: 'neptuno.jpg',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/planets.js
git commit -m "feat: datos de los cuerpos del sistema solar"
```

---

## Task 3: Funciones de escala (lógica pura, TDD)

**Files:** Create `src/scale.js`, Test `test/scale.test.js`

- [ ] **Step 1: Escribir el test que falla**

```js
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
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run: `npm test`
Expected: FAIL — "Cannot find module '../src/scale.js'".

- [ ] **Step 3: Implementar `src/scale.js`**

```js
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
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run: `npm test`
Expected: PASS — 5 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/scale.js test/scale.test.js
git commit -m "feat: funciones de escala logarítmica con tests"
```

---

## Task 4: Detección de WebGL (lógica pura, TDD)

**Files:** Create `src/webgl-check.js`, Test `test/webgl-check.test.js`

- [ ] **Step 1: Escribir el test que falla**

```js
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
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run: `npm test`
Expected: FAIL — "Cannot find module '../src/webgl-check.js'".

- [ ] **Step 3: Implementar `src/webgl-check.js`**

```js
export function isWebGLAvailable(canvas = document.createElement('canvas')) {
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl != null
  } catch (e) {
    return false
  }
}

export function showWebGLFallback(container) {
  container.innerHTML = `
    <div style="position:fixed;inset:0;display:flex;align-items:center;
                justify-content:center;text-align:center;padding:2rem;">
      <div>
        <h1 style="font-weight:200;letter-spacing:2px;">Nuestro Sistema Solar</h1>
        <p style="opacity:0.6;margin-top:1rem;max-width:32rem;">
          Esta experiencia necesita WebGL, que tu navegador no soporta o tiene
          deshabilitado. Probá con una versión reciente de Chrome o Firefox.
        </p>
      </div>
    </div>`
}
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run: `npm test`
Expected: PASS — 3 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/webgl-check.js test/webgl-check.test.js
git commit -m "feat: detección de WebGL con fallback y tests"
```

---

## Task 5: Escena Three.js con bloom y starfield parallax

**Files:** Create `src/scene.js`, Modify `src/main.js`

- [ ] **Step 1: Crear `src/scene.js`**

```js
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
```

- [ ] **Step 2: Conectar en `src/main.js`** (reemplazar todo el contenido)

```js
import '../styles/main.css'
import * as THREE from 'three'
import { createScene, handleResize } from './scene.js'
import { isWebGLAvailable, showWebGLFallback } from './webgl-check.js'

const canvas = document.getElementById('scene')

if (!isWebGLAvailable(canvas)) {
  showWebGLFallback(document.getElementById('overlay'))
} else {
  const ctx = createScene(canvas)
  handleResize(ctx)

  const clock = new THREE.Clock()
  function animate() {
    requestAnimationFrame(animate)
    const delta = clock.getDelta()
    // Parallax sutil del starfield (rotación muy lenta)
    ctx.starfield.rotation.y += delta * 0.005
    ctx.composer.render()
  }
  animate()
}
```

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`
Checklist:
- [ ] Fondo negro azulado con estrellas blancas que rotan muy lentamente.
- [ ] Sin errores en consola (verificar que los addons de three cargan).

- [ ] **Step 4: Commit**

```bash
git add src/scene.js src/main.js
git commit -m "feat: escena Three.js con bloom (UnrealBloomPass) y starfield parallax"
```

---

## Task 6: Crear los planetas (data-driven, anillos, atmósfera)

**Files:** Create `src/planets.js`, Modify `src/main.js`

- [ ] **Step 1: Crear `src/planets.js`**

> Materiales de color sólido como placeholder; las texturas se cargan en Task 12. El Sol usa material básico brillante (lo recoge el bloom). La Tierra recibe un halo de atmósfera.

```js
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
```

- [ ] **Step 2: Conectar en `src/main.js`**

Agregar import tras los existentes:

```js
import { createPlanets, rotatePlanets } from './planets.js'
```

Dentro del `else`, tras `handleResize(ctx)`:

```js
  const bodies = createPlanets(ctx.scene)
```

Y en `animate`, antes de `ctx.composer.render()`:

```js
    rotatePlanets(bodies, delta)
```

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`
Checklist:
- [ ] Desde la vista cenital se ven los cuerpos alineados sobre el eje X.
- [ ] El Sol irradia (bloom visible). Saturno tiene anillo. La Tierra tiene un halo azul tenue.
- [ ] Tamaños relativos coherentes (Júpiter grande, Mercurio chico).
- [ ] Sin errores en consola.

- [ ] **Step 4: Commit**

```bash
git add src/planets.js src/main.js
git commit -m "feat: cuerpos data-driven con anillos de Saturno, atmósfera terrestre y eje de Urano"
```

---

## Task 7: Keyframes de cámara (lógica pura, TDD)

**Files:** Create `src/camera-path.js`, Test `test/camera-path.test.js`

- [ ] **Step 1: Escribir el test que falla**

```js
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
```

- [ ] **Step 2: Correr el test (debe fallar)**

Run: `npm test`
Expected: FAIL — "Cannot find module '../src/camera-path.js'".

- [ ] **Step 3: Implementar `src/camera-path.js`**

```js
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
```

- [ ] **Step 4: Correr el test (debe pasar)**

Run: `npm test`
Expected: PASS — 6 tests de camera-path verdes (más los anteriores).

- [ ] **Step 5: Commit**

```bash
git add src/camera-path.js test/camera-path.test.js
git commit -m "feat: keyframes de cámara con interpolación smoothstep y tests"
```

---

## Task 8: Conectar scroll a la cámara (GSAP ScrollTrigger)

**Files:** Create `src/scroll.js`, Modify `src/main.js`

- [ ] **Step 1: Crear `src/scroll.js`**

```js
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
```

- [ ] **Step 2: Conectar en `src/main.js`**

Agregar import:

```js
import { setupScroll } from './scroll.js'
```

Dentro del `else`, tras `const bodies = createPlanets(ctx.scene)`:

```js
  setupScroll(ctx, bodies, (sectionId, progress, changed) => {
    if (changed) console.log('Sección activa:', sectionId)
  })
```

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`
Checklist:
- [ ] Al scrollear, la cámara baja de la vista cenital y vuela al Sol, luego Mercurio, Venus… en orden.
- [ ] Movimiento suave (scrub), sin saltos.
- [ ] Al final, la cámara vuelve a vista cenital (finale).
- [ ] La consola loguea las secciones al avanzar.

- [ ] **Step 4: Commit**

```bash
git add src/scroll.js src/main.js
git commit -m "feat: cámara atada al scroll con GSAP ScrollTrigger"
```

---

## Task 9: Paneles de datos, intro/finale, navegación y progreso

**Files:** Create `src/ui.js`, Modify `src/main.js`, `styles/main.css`

- [ ] **Step 1: Estilos en `styles/main.css`** (agregar al final)

```css
/* ---- Panel de datos por planeta (layout B) ---- */
.panel { position: absolute; inset: 0; opacity: 0; transition: opacity 0.6s ease; }
.panel.visible { opacity: 1; }
.panel-name { position: absolute; top: 2rem; left: 2.2rem; }
.panel-name .numeral { font-family: monospace; font-size: 0.7rem; letter-spacing: 3px; color: rgba(255,255,255,0.35); }
.panel-name .nombre { font-family: Georgia, serif; font-weight: 200; font-size: 2.6rem; letter-spacing: 3px; color: #fff; }
.panel-data {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 1.4rem 2.2rem 2rem;
  background: linear-gradient(to top, rgba(2,2,8,0.95) 55%, transparent);
  display: grid; grid-template-columns: 1fr 1fr 1fr 2fr; gap: 1.4rem; align-items: end;
}
.panel-data .label { font-family: monospace; font-size: 0.62rem; letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 0.3rem; }
.panel-data .value { font-family: monospace; font-weight: 300; font-size: 1.1rem; color: #e0c87a; }
.panel-data .sub { font-family: monospace; font-size: 0.7rem; color: rgba(255,255,255,0.25); }
.panel-data .curioso { border-left: 1px solid rgba(255,255,255,0.08); padding-left: 1.2rem; font-size: 0.78rem; font-style: italic; line-height: 1.5; color: rgba(255,255,255,0.55); }

/* ---- Mensajes fullscreen (intro / finale) ---- */
.fullscreen-msg { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; opacity: 0; transition: opacity 0.8s ease; padding: 2rem; }
.fullscreen-msg.visible { opacity: 1; }
.fullscreen-msg h1 { font-family: Georgia, serif; font-weight: 200; font-size: 3rem; letter-spacing: 4px; }
.fullscreen-msg p { opacity: 0.55; margin-top: 1rem; max-width: 34rem; line-height: 1.6; }
.fullscreen-msg .hint { margin-top: 2.5rem; font-family: monospace; font-size: 0.7rem; letter-spacing: 3px; opacity: 0.4; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 0.25; } 50% { opacity: 0.6; } }

/* ---- Dots de navegación lateral ---- */
.nav-dots { position: absolute; top: 50%; right: 1.6rem; transform: translateY(-50%); display: flex; flex-direction: column; gap: 0.7rem; }
.nav-dots .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: all 0.3s ease; }
.nav-dots .dot.active { background: #e0c87a; transform: scale(1.5); box-shadow: 0 0 8px rgba(224,200,122,0.8); }

/* ---- Barra de progreso superior ---- */
.progress-bar { position: absolute; top: 0; left: 0; height: 2px; width: 0%; background: linear-gradient(90deg, #f4c06f, #6b8cba); transition: width 0.1s linear; }

@media (max-width: 720px) {
  .panel-data { grid-template-columns: 1fr 1fr; }
  .panel-name .nombre { font-size: 1.8rem; }
  .fullscreen-msg h1 { font-size: 2rem; }
  .nav-dots { display: none; }
}
```

- [ ] **Step 2: Crear `src/ui.js`**

```js
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
```

- [ ] **Step 3: Conectar en `src/main.js`**

Agregar import:

```js
import { setupUI } from './ui.js'
```

Dentro del `else`, reemplazar el callback de `setupScroll` por:

```js
  const ui = setupUI(document.getElementById('overlay'))
  setupScroll(ctx, bodies, (sectionId, progress) => {
    ui.update(sectionId, progress)
  })
```

- [ ] **Step 4: Verificación manual**

Run: `npm run dev`
Checklist:
- [ ] Al cargar aparece el título "Nuestro Sistema Solar" + hint pulsante.
- [ ] Al llegar a cada planeta: panel con fade (nombre arriba-izq, datos abajo). Datos correctos (ej. Saturno 116.460 km, 146 lunas).
- [ ] Dots a la derecha: el del cuerpo activo se ilumina y agranda.
- [ ] Barra de progreso arriba crece con el scroll.
- [ ] Al final aparece el mensaje de escala.
- [ ] Números con separador de miles español (puntos).

- [ ] **Step 5: Commit**

```bash
git add src/ui.js src/main.js styles/main.css
git commit -m "feat: paneles de datos, intro/finale, dots de navegación y barra de progreso"
```

---

## Task 10: Texturas NASA

**Files:** Create `public/textures/*.jpg`, Modify `src/planets.js`

- [ ] **Step 1: Conseguir texturas equirectangulares de dominio público**

Guardar en `public/textures/` con nombres exactos:
`sol.jpg, mercurio.jpg, venus.jpg, tierra.jpg, marte.jpg, jupiter.jpg, saturno.jpg, urano.jpg, neptuno.jpg`
(Fuente: solarsystemscope.com/textures — licencia CC, o mapas NASA dominio público.)

> Si no hay acceso a las texturas al implementar, este paso es **opcional/diferible**: el render con `colorAcento` (Task 6) ya es funcional. La carga tiene fallback (ver Step 2): si la textura falla, el material conserva su color.

- [ ] **Step 2: Cargar texturas en `src/planets.js`** respetando el base path

Al tope del archivo, tras los imports, agregar el loader y una helper:

```js
const loader = new THREE.TextureLoader()
const texUrl = (file) => `${import.meta.env.BASE_URL}textures/${file}`
```

Reemplazar la creación de `mat` dentro del `for` por (mantiene el color como fallback hasta que la textura cargue):

```js
    const mat = data.id === 'sol'
      ? new THREE.MeshBasicMaterial({ color: data.colorAcento })
      : new THREE.MeshStandardMaterial({ color: data.colorAcento, roughness: 0.9, metalness: 0.0 })
    loader.load(
      texUrl(data.textura),
      (tex) => { mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true },
      undefined,
      () => { /* textura faltante: se conserva colorAcento */ }
    )
    const mesh = new THREE.Mesh(geo, mat)
```

- [ ] **Step 3: Verificación manual**

Run: `npm run dev`
Checklist:
- [ ] Cada planeta muestra su textura envolviendo la esfera y rota lentamente.
- [ ] Si falta una textura, el planeta conserva su color sólido sin romper la escena.

- [ ] **Step 4: Commit**

```bash
git add public/textures src/planets.js
git commit -m "feat: texturas NASA con fallback a color sólido"
```

---

## Task 11: Build local y workflow de deploy

**Files:** Create `.github/workflows/deploy.yml`

- [ ] **Step 1: Verificar el build local**

Run: `npm run build`
Expected: genera `dist/` sin errores.

Run: `npm run preview`
Expected: sirve `dist/` en un URL local con base `/design-pages/`; la experiencia funciona igual que en dev.

- [ ] **Step 2: Crear `.github/workflows/deploy.yml`**

```yaml
name: Deploy a GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy automático a GitHub Pages"
```

---

## Task 12: Push, habilitar Pages y verificar producción

**Files:** ninguno (operaciones de git/GitHub)

- [ ] **Step 1: Asegurar branch main y remote**

```bash
git branch -M main
git remote -v   # debe mostrar origin → anaelsanchezr-hub/design-pages
```

(Si falta el remote: `git remote add origin https://github.com/anaelsanchezr-hub/design-pages.git`)

- [ ] **Step 2: Push inicial**

```bash
git push -u origin main
```

- [ ] **Step 3: Habilitar Pages con source = GitHub Actions**

Vía gh CLI (si está disponible y autenticado):

```bash
gh api -X POST repos/anaelsanchezr-hub/design-pages/pages -f build_type=workflow
```

Si el comando falla o `gh` no está, hacerlo manual en GitHub: Settings → Pages → Source: "GitHub Actions". (Pedir al usuario que lo haga si no hay acceso por CLI.)

- [ ] **Step 4: Verificar el deploy**

- [ ] El workflow corre verde en la pestaña Actions.
- [ ] `https://anaelsanchezr-hub.github.io/design-pages/` carga la experiencia completa.
- [ ] Scroll, cámara, bloom del Sol, planetas, texturas, paneles, dots y barra funcionan en producción.
- [ ] Probar en mobile: si rinde mal, documentar para el Plan B (spec, Riesgos).

---

## Verificación final contra el spec

- [ ] Tour de planetas (Sol → Neptuno en orden): Tasks 6, 8, 9.
- [ ] Escala/distancias (vista cenital + mensaje final): Tasks 5, 7, 9.
- [ ] Estilo espacio profundo (negro, texturas, brillos/bloom): Tasks 5, 6, 10.
- [ ] Three.js / WebGL 3D: Tasks 5, 6.
- [ ] Vista cenital + zoom: Tasks 7, 8.
- [ ] Datos básicos por planeta (layout B): Task 9.
- [ ] Estático en GitHub Pages: Tasks 1, 11, 12.
- [ ] Fallback WebGL: Task 4.
- [ ] Calidad visual "genial": bloom (5), atmósfera Tierra (6), starfield parallax (5), dots + progreso (9), easing smoothstep (7).
- [ ] Cinturón de asteroides: opcional en spec — NO incluido (YAGNI, recortable).
