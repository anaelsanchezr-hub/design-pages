# Sistema Solar — Scrollytelling 3D

**Fecha:** 2026-06-11
**Estado:** Diseño aprobado, listo para plan de implementación

## Resumen

Web de scrollytelling sobre el sistema solar, pensada como prueba para desplegar en
GitHub Pages. El usuario scrollea y la cámara recorre el sistema solar: empieza con una
vista cenital de todo el sistema, hace zoom hacia cada cuerpo (Sol + 8 planetas) mostrando
sus datos, y termina con un zoom out que enfatiza la escala real de las distancias.

Combina dos ángulos narrativos:
- **Tour de planetas** — recorrido ordenado de Mercurio a Neptuno con datos de cada uno.
- **Escala y distancias** — la vista cenital inicial y final transmiten lo grande que es
  el sistema solar.

## Objetivo y criterios de éxito

- Que el usuario entienda, al terminar de scrollear, qué planetas hay, sus datos básicos
  y la escala relativa entre ellos.
- Experiencia inmersiva y "super avanzada" visualmente (3D real, no imágenes estáticas).
- 100% estático, desplegable en GitHub Pages sin backend.
- Funciona en desktop; degradación aceptable en mobile (ver Riesgos).

## Decisiones de diseño (tomadas en brainstorming)

| Decisión | Elección |
|---|---|
| Tema | Sistema solar |
| Ángulo narrativo | Tour de planetas + escala/distancias |
| Estilo visual | Espacio profundo: fondo negro, planetas fotorrealistas (texturas NASA), brillos |
| Tecnología de render | Three.js / WebGL 3D |
| Mecánica de cámara | Vista cenital + zoom hacia cada planeta |
| Arquitectura | Escena única continua (un solo canvas, cámara atada al scroll) |
| Información por planeta | Datos básicos: nombre, diámetro, distancia al Sol, lunas, dato curioso |
| Layout del panel | Panel inferior centrado (Opción B): planeta centrado, nombre arriba-izquierda, barra de datos en el fondo |

## Stack tecnológico

- **Three.js** (r160+) — escena 3D: planetas, estrellas, órbitas, anillos.
- **GSAP + ScrollTrigger** — timeline de cámara atada al progreso del scroll.
- **HTML/CSS puro** — overlays de datos (sin framework de UI).
- **Vite** — bundler y dev server local; `build` produce `dist/` para GitHub Pages.
- Sin backend. Todo estático.

## Arquitectura

### Estructura de archivos

```
/
├── index.html
├── src/
│   ├── main.js          ← init de Three.js + GSAP, loop de render
│   ├── scene.js         ← setup de escena: cámara, luces, renderer, starfield
│   ├── planets.js       ← geometría, materiales, texturas y posiciones de cada cuerpo
│   ├── scroll.js        ← timeline de ScrollTrigger → keyframes de cámara
│   ├── ui.js            ← mostrar/ocultar paneles de datos según la sección activa
│   └── data/
│       └── planets.json ← datos de los 8 planetas + Sol
├── textures/            ← imágenes NASA (dominio público)
├── vite.config.js       ← base path configurado para GitHub Pages
└── .github/workflows/   ← (opcional) deploy automático a Pages
```

### Modelo de escena

- Un único canvas Three.js a pantalla completa, fijo, detrás de los overlays HTML.
- Starfield de fondo (partículas o skybox).
- 9 cuerpos: Sol + Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano, Neptuno.
- Posiciones en un eje lineal con escala **logarítmica** de distancias (las distancias
  reales son inviables de mostrar 1:1 sin que los planetas queden invisibles). La sección
  final usa la escala para comunicar el dato real.
- Tamaños de planetas también escalados para que sean visibles, con los ratios relativos
  preservados donde sea posible.
- Saturno con anillos en 3D (TorusGeometry o geometría de anillo con textura).

### Flujo de la cámara (atada al scroll)

GSAP ScrollTrigger mapea el progreso de scroll (0–100%) a una secuencia de keyframes de
posición/target de cámara. Entre keyframes la cámara interpola suavemente.

## Timeline narrativo (11 secciones)

| # | Sección | Scroll aprox. | Qué pasa |
|---|---|---|---|
| 0 | Intro | 0% | Vista cenital del sistema completo. Título "Nuestro sistema solar". Invitación a scrollear. |
| 1 | Sol | ~10% | Zoom al Sol, corona animada (shader/partículas). Panel: masa, temperatura, edad. |
| 2–5 | Planetas interiores | ~15–45% | Mercurio → Venus → Tierra → Marte. Zoom in, planeta centrado, rotación lenta, barra de datos con fade. |
| — | Cinturón de asteroides (interstitial, **opcional**) | ~48% | Cámara atraviesa partículas, texto breve. Se puede omitir si complejiza demasiado. |
| 6–9 | Planetas exteriores | ~50–85% | Júpiter (Gran Mancha Roja sutil) → Saturno (anillos 3D) → Urano → Neptuno. |
| 10 | Finale / escala | ~90–100% | Zoom out a vista cenital. Aparecen distancias reales. Texto: "Si el Sol fuera una pelota de básquet, la Tierra sería un guisante a 26 metros." Fade a negro. |

## Layout de pantalla (por planeta)

Opción B — Panel inferior centrado:

- **Planeta** centrado en el canvas, ocupando el protagonismo visual.
- **Nombre + numeral** (ej. "PLANETA VI / Saturno") arriba a la izquierda, tipografía
  serif fina para el nombre, monospace para el label.
- **Barra de datos** en el fondo, sobre un gradiente que oscurece hacia abajo. Grid con:
  diámetro (+ comparación con la Tierra), distancia al Sol, número de lunas, y un dato
  curioso a la derecha separado por un divisor.
- Indicador de "SCROLL" sutil.
- Acento de color cálido (`#e0c87a`) para los valores numéricos.

## Datos por cuerpo (`planets.json`)

Cada entrada: `nombre`, `numeral`, `diametro_km`, `diametro_vs_tierra`,
`distancia_sol_km`, `lunas`, `dato_curioso`, más campos de render
(`textura`, `radio_escena`, `posicion_escena`, `color_acento`).

## Manejo de errores y robustez

- **WebGL no disponible:** detectar y mostrar un fallback HTML (imagen estática + texto)
  en lugar de pantalla negra.
- **Carga de texturas:** loader con estado de "cargando"; no iniciar el scroll-driven
  hasta que las texturas críticas estén listas.
- **Resize:** actualizar aspect ratio de cámara y tamaño de renderer en `resize`.
- **Scroll en mobile:** ScrollTrigger funciona, pero el rendimiento WebGL puede sufrir;
  ver Riesgos.

## Testing / verificación

- Verificación manual en navegador (desktop Chrome/Firefox) recorriendo el scroll completo.
- Checklist: cada sección hace el movimiento de cámara correcto, cada panel muestra los
  datos correctos, no hay saltos bruscos, el fallback de WebGL funciona.
- Build de Vite genera `dist/` correctamente y se sirve en GitHub Pages con el base path
  correcto.

## Riesgos y mitigaciones

- **Rendimiento WebGL en mobile** → mantener polígonos y texturas moderados; considerar
  reducir partículas/efectos en pantallas chicas. Plan B documentado: Opción C del
  brainstorming (canvas sticky + overlays, sin viaje de cámara) si la Opción A no rinde.
- **Peso de texturas NASA** → comprimir, usar resoluciones razonables, lazy-load de las
  texturas de planetas exteriores.
- **Complejidad del cinturón de asteroides** → marcado como opcional; recortable sin
  afectar la narrativa.
- **Base path de GitHub Pages** → configurar `base` en `vite.config.js` (nombre del repo).

## Fuera de alcance (YAGNI)

- Controles interactivos de cámara con mouse/touch (solo scroll).
- Lunas individuales navegables.
- Audio / música.
- Internacionalización (la web es en español).
- Datos en tiempo real / API.
```
