// Muestra una sola pantalla a la vez, según la dirección:
// #jugar          → pantalla "jugar"
// #punto/punto-2  → pantalla "punto", con el dato "punto-2"

// Lo que cada pantalla quiere hacer al abrirse (lo registran otros archivos)
const accionesAlMostrar = {}

export function alMostrar(nombrePantalla, accion) {
  accionesAlMostrar[nombrePantalla] = accion
}

// Separa la dirección en nombre de pantalla y dato extra
function leerDireccion() {
  const [nombre, dato] = location.hash.slice(1).split('/')
  return { nombre: nombre || 'inicio', dato }
}

function mostrarPantalla() {
  const { nombre, dato } = leerDireccion()
  const elemento = document.getElementById(nombre)
  const hayPantallaActiva = document.querySelector('.pantalla.activa')

  // Un enlace como "Saltar al contenido" no es una pantalla: no cambiamos nada
  if (elemento && !elemento.classList.contains('pantalla') && hayPantallaActiva) {
    return null
  }

  // Si la pantalla no existe, volvemos al inicio
  const pantalla = elemento && elemento.classList.contains('pantalla')
    ? elemento
    : document.getElementById('inicio')

  document.querySelectorAll('.pantalla').forEach((p) => p.classList.remove('activa'))
  pantalla.classList.add('activa')

  const accion = accionesAlMostrar[pantalla.id]
  if (accion) accion(dato)

  return pantalla
}

export function iniciarPantallas() {
  // Al abrir la página, mostramos la pantalla que diga la dirección
  mostrarPantalla()

  // Al cambiar de pantalla, el foco entra a la nueva
  // (así el lector de pantalla anuncia en qué pantalla estás)
  window.addEventListener('hashchange', () => {
    const pantalla = mostrarPantalla()
    if (pantalla) pantalla.focus()
  })
}
