// Guarda el avance del jugador.
// Por ahora en el celular (localStorage). Más adelante, en el servidor:
// cuando llegue ese momento, solo cambia este archivo.

const CLAVE = 'yotoco-escondido-avance'

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || { sellos: [], ayudas: {} }
  } catch {
    // Si el navegador no deja guardar (modo privado), empezamos de cero
    return { sellos: [], ayudas: {} }
  }
}

function guardar(avance) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(avance))
  } catch {
    // Si no se puede guardar, el juego sigue funcionando sin recordar
  }
}

export function tieneSello(idPunto) {
  return leer().sellos.includes(idPunto)
}

export function ganarSello(idPunto) {
  const avance = leer()
  if (!avance.sellos.includes(idPunto)) {
    avance.sellos.push(idPunto)
    guardar(avance)
  }
}

export function cantidadSellos() {
  return leer().sellos.length
}

// Cuántas pistas abrió el jugador en un punto (mínimo 1: la primera)
export function ayudasAbiertas(idPunto) {
  return leer().ayudas[idPunto] || 1
}

export function abrirOtraAyuda(idPunto) {
  const avance = leer()
  avance.ayudas[idPunto] = (avance.ayudas[idPunto] || 1) + 1
  guardar(avance)
  return avance.ayudas[idPunto]
}
