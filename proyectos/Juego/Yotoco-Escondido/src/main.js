import './ruta.js'
import './sello.js'
import './marcadores.js'
import { iniciarPantallas } from './pantallas.js'
import { juego } from './datos/juego.js'

iniciarPantallas()

// Premios: los números salen de los datos del juego
document.querySelectorAll('[data-premios-restantes]').forEach((contador) => {
  contador.textContent = juego.premiosRestantes
})

document.querySelectorAll('[data-premios-totales]').forEach((contador) => {
  contador.textContent = juego.premiosTotales
})
