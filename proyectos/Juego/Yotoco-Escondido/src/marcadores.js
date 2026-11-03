// Los marcadores de la pantalla "Jugar": premios que quedan y tu colección de sellos.
// Todo es real: nada de números inventados para presionar a la gente.
import { alMostrar } from './pantallas.js'
import { juego } from './datos/juego.js'
import { puntos } from './datos/puntos.js'
import { tieneSello, cantidadSellos } from './almacen.js'

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// El número "sube" rápido desde 0 hasta el valor real
function contarHasta(elemento, valorFinal) {
  if (sinMovimiento) {
    elemento.textContent = valorFinal
    return
  }

  const duracion = 800
  const inicio = performance.now()

  function paso(ahora) {
    const avance = Math.min((ahora - inicio) / duracion, 1)
    const suave = 1 - Math.pow(1 - avance, 3) // empieza rápido y frena al final
    elemento.textContent = Math.round(valorFinal * suave)
    if (avance < 1) requestAnimationFrame(paso)
  }

  requestAnimationFrame(paso)
}

function mensajePremios(restantes) {
  if (restantes === 0) return 'Los premios se acabaron, pero aún puedes completar tu colección.'
  if (restantes <= 5) return `¡Solo quedan ${restantes}! Es ahora o nunca.`
  if (restantes <= 15) return 'Se están acabando. ¡Apúrate!'
  return `¡Aún estás a tiempo! Los primeros ${juego.premiosTotales} en completar la ruta ganan.`
}

function mensajeColeccion(encontrados) {
  const faltan = puntos.length - encontrados
  if (encontrados === 0) return '¡Empieza y gana tu primer sello!'
  if (faltan === 0) return '¡Colección completa! Eres un explorador de Yotoco.'
  if (faltan === 1) return '¡Te falta solo 1! Ya casi lo logras.'
  return `¡Vas bien! Te faltan ${faltan} para completar la ruta.`
}

function mostrarMarcadores() {
  // ----- Premios -----
  const restantes = juego.premiosRestantes
  contarHasta(document.getElementById('numero-premios'), restantes)

  const relleno = document.getElementById('relleno-premios')
  // La barra empieza vacía y se llena con animación
  relleno.style.width = '0%'
  void relleno.offsetWidth // obliga al navegador a "ver" el 0% antes de cambiarlo
  relleno.style.width = `${(restantes / juego.premiosTotales) * 100}%`

  document.getElementById('urgencia-premios').textContent = mensajePremios(restantes)

  // ----- Colección -----
  const lista = document.getElementById('coleccion-sellos')
  lista.replaceChildren()

  puntos.forEach((punto, indice) => {
    const item = document.createElement('li')
    item.style.setProperty('--orden', indice)

    if (tieneSello(punto.id)) {
      item.className = 'lleno'
      if (punto.postal) {
        const foto = document.createElement('img')
        foto.src = punto.postal.imagen
        foto.alt = ''
        item.append(foto)
      } else {
        item.textContent = '✓'
      }
      item.setAttribute('aria-label', `${punto.nombre}: sello conseguido`)
    } else {
      item.textContent = '?'
      item.setAttribute('aria-label', `Sello ${indice + 1}: por encontrar`)
    }

    lista.append(item)
  })

  document.getElementById('texto-coleccion').textContent = mensajeColeccion(cantidadSellos())
}

alMostrar('jugar', mostrarMarcadores)
