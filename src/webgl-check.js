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
