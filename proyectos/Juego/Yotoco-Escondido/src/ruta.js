// Llena las pantallas "Mi aventura" y "Punto" con los datos de los puntos
import { alMostrar } from './pantallas.js'
import { puntos } from './datos/puntos.js'
import { tieneSello, cantidadSellos, ayudasAbiertas, abrirOtraAyuda } from './almacen.js'

const PISTAS_POR_PUNTO = 3
let puntoActual = null

// ---------- MI AVENTURA ----------
function mostrarRuta() {
  const encontrados = cantidadSellos()

  document.getElementById('texto-progreso').textContent =
    `${encontrados} de ${puntos.length} puntos encontrados`

  const barra = document.getElementById('barra-progreso')
  barra.max = puntos.length
  barra.value = encontrados

  const lista = document.getElementById('lista-puntos')
  lista.replaceChildren()

  puntos.forEach((punto) => {
    const enlace = document.createElement('a')
    enlace.href = `#punto/${punto.id}`
    enlace.className = 'punto-enlace'

    const nombre = document.createElement('span')
    nombre.textContent = punto.nombre

    const estado = document.createElement('span')
    estado.className = 'punto-estado'
    estado.textContent = tieneSello(punto.id) ? '✓ Encontrado' : 'Por encontrar'

    enlace.append(nombre, estado)

    const item = document.createElement('li')
    item.append(enlace)
    lista.append(item)
  })
}

// ---------- UN PUNTO ----------
function mostrarPunto(idPunto) {
  puntoActual = puntos.find((punto) => punto.id === idPunto)

  // Si el punto no existe, volvemos a la ruta
  if (!puntoActual) {
    location.replace('#ruta')
    return
  }

  document.getElementById('titulo-punto').textContent = puntoActual.nombre
  pintarLogro()
  pintarPistas()
}

// Si ya ganaste el sello de este punto, se muestra el logro
// en lugar del aviso "¿Encontraste el lugar?"
function pintarLogro() {
  const encontrado = tieneSello(puntoActual.id)
  document.getElementById('logro-punto').hidden = !encontrado
  document.getElementById('aviso-qr').hidden = encontrado

  if (!encontrado) return

  // El sello lleva la foto de la postal; si el punto no tiene, un ✓
  const postal = puntoActual.postal
  const imagen = document.getElementById('logro-imagen')
  imagen.hidden = !postal
  document.getElementById('logro-icono').hidden = Boolean(postal)

  if (postal) {
    imagen.src = postal.imagen
    imagen.alt = postal.descripcion
  }

  document.getElementById('logro-frase').textContent = postal
    ? postal.frase
    : 'Ya encontraste este punto.'
}

function pintarPistas() {
  const abiertas = ayudasAbiertas(puntoActual.id)
  const lista = document.getElementById('lista-pistas')
  lista.replaceChildren()

  puntoActual.pistas.slice(0, abiertas).forEach((pista) => {
    const item = document.createElement('li')
    item.tabIndex = -1

    // Una pista puede ser solo texto, o texto con foto
    if (typeof pista === 'string') {
      item.textContent = pista
    } else {
      const texto = document.createElement('p')
      texto.textContent = pista.texto

      const foto = document.createElement('img')
      foto.src = pista.imagen
      foto.alt = pista.descripcion
      foto.width = pista.ancho
      foto.height = pista.alto
      foto.className = 'pista-foto'

      item.append(texto, foto)
    }

    lista.append(item)
  })

  // El botón de ayuda desaparece con las 3 pistas abiertas o con el sello ganado
  const botonAyuda = document.getElementById('boton-ayuda')
  botonAyuda.hidden = abiertas >= PISTAS_POR_PUNTO || tieneSello(puntoActual.id)
  botonAyuda.textContent = `Necesito otra ayuda (${abiertas} de ${PISTAS_POR_PUNTO})`

  const nota = document.getElementById('nota-explorador')
  nota.textContent = abiertas === 1 && !tieneSello(puntoActual.id)
    ? 'Si lo encuentras sin pedir ayuda, ganas el sello Explorador.'
    : ''
}

document.getElementById('boton-ayuda').addEventListener('click', () => {
  abrirOtraAyuda(puntoActual.id)
  pintarPistas()

  // El foco va a la pista nueva, para que el lector de pantalla la lea
  document.querySelector('#lista-pistas li:last-child').focus()
})

alMostrar('ruta', mostrarRuta)
alMostrar('punto', mostrarPunto)
