// Pantalla que se abre al escanear un QR: #sello/punto-1
// OJO: por ahora es de PRUEBA. Cualquiera podría escribir esta dirección a mano.
// Más adelante, el servidor revisará la clave secreta y el GPS antes de dar el sello.
import { alMostrar } from './pantallas.js'
import { puntos } from './datos/puntos.js'
import { tieneSello, ganarSello, cantidadSellos, ayudasAbiertas } from './almacen.js'

function mostrarSello(idPunto) {
  const punto = puntos.find((p) => p.id === idPunto)

  if (!punto) {
    location.replace('#ruta')
    return
  }

  const titulo = document.getElementById('titulo-sello')
  const texto = document.getElementById('texto-sello')
  const extra = document.getElementById('extra-sello')
  extra.textContent = ''

  if (tieneSello(punto.id)) {
    titulo.textContent = 'Ya tenías este sello'
  } else {
    ganarSello(punto.id)
    titulo.textContent = `¡Encontraste ${punto.nombre}!`

    if (ayudasAbiertas(punto.id) === 1) {
      extra.textContent = 'Y sin pedir ayuda: ¡ganaste el sello Explorador!'
    }

    // Vibración corta (solo en Android; en iPhone no hace nada)
    if (navigator.vibrate) navigator.vibrate(200)
  }

  // La postal del punto, si tiene
  const postal = document.getElementById('postal-sello')
  postal.hidden = !punto.postal
  if (punto.postal) {
    const imagen = document.getElementById('imagen-postal')
    imagen.src = punto.postal.imagen
    imagen.alt = punto.postal.descripcion
    document.getElementById('frase-postal').textContent = punto.postal.frase
  }

  const faltan = puntos.length - cantidadSellos()
  texto.textContent = faltan === 0
    ? '¡Completaste la ruta!'
    : `Llevas ${cantidadSellos()} de ${puntos.length}. Te faltan ${faltan}.`
}

alMostrar('sello', mostrarSello)
