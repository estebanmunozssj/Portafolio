'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que comparten todas las páginas
   Se carga después de js/perfumes.js y antes del archivo de cada página
   (main.js en el inicio, catalogo.js en el catálogo).
   Todo lo de aquí se escribe una sola vez: si cambia el número de WhatsApp
   o el formato de los precios, se cambia aquí y sirve en todas las páginas.
   ========================================================= */

// Número de WhatsApp del cliente: 57 (Colombia) + número, sin + ni espacios
const WHATSAPP = '573158599499';

// Convierte 350000 en "$350.000" (sin el espacio que pone el navegador después del $).
// Si un perfume no tiene precio en la lista, el cliente ve "Precio por WhatsApp", nunca "[PRECIO]"
const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
function precioTexto(numero) {
  return numero == null ? 'Precio por WhatsApp' : formatoPesos.format(numero).replace(/\s/g, '');
}

// Arma el enlace de WhatsApp con el mensaje ya escrito
function enlaceWhatsApp(mensaje) {
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);
}

// El mensaje para pedir un perfume, escrito en un solo lugar
function enlacePedido(perfume) {
  return enlaceWhatsApp('Hola, quiero pedir ' + perfume.nombre + ' de ' + perfume.marca + ' (100 ml).');
}

// Busca un perfume de la lista por su id
function buscarPerfume(id) {
  return PERFUMES.find(function (p) { return p.id === id; });
}

// Crea una etiqueta HTML con su clase y su texto (el texto nunca se interpreta como HTML)
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto != null) el.textContent = texto;
  return el;
}

// Cómo se escribe cada tipo en los enlaces (?tipo=arabes) → cómo está escrito en perfumes.js
const TIPOS = { arabes: 'Árabes', disenador: 'Diseñador', nicho: 'Nicho' };

/* ---------- Respuesta al tocar cualquier botón de WhatsApp ---------- */
// Por un momento dice "Abriendo WhatsApp…", para que la persona sepa que funcionó.
// Se escucha en toda la página (no enlace por enlace) para que también sirva
// en los botones que se crean después con JavaScript (tarjetas, Mi lista)
document.addEventListener('click', function (evento) {
  const enlace = evento.target.closest('a[href^="https://wa.me/"]');
  if (!enlace || enlace.dataset.abriendo) return;
  // Se guardan las piezas de adentro (no solo el texto): algunos enlaces tienen dos partes
  const contenidoOriginal = Array.from(enlace.childNodes);
  enlace.dataset.abriendo = 'si';
  enlace.textContent = 'Abriendo WhatsApp…';
  setTimeout(function () {
    enlace.replaceChildren.apply(enlace, contenidoOriginal);
    delete enlace.dataset.abriendo;
  }, 1600);
});

/* ---------- Menú del celular: abrir y cerrar ---------- */
const botonMenu = document.querySelector('.boton-menu');
const menu = document.getElementById('menu');

if (botonMenu && menu) {
  const iconoMenu = botonMenu.querySelector('path');
  const RAYAS = 'M4 8h16M4 16h16';
  const EQUIS = 'M6 6l12 12M18 6L6 18';

  function ponerMenu(abierto) {
    menu.classList.toggle('abierto', abierto);
    botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    iconoMenu.setAttribute('d', abierto ? EQUIS : RAYAS);
  }

  botonMenu.addEventListener('click', function () {
    ponerMenu(!menu.classList.contains('abierto'));
  });

  // Se cierra al elegir una sección, al tocar fuera del menú o con la tecla Esc
  menu.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', function () { ponerMenu(false); });
  });
  document.addEventListener('click', function (evento) {
    if (menu.classList.contains('abierto') && !menu.contains(evento.target) && !botonMenu.contains(evento.target)) {
      ponerMenu(false);
    }
  });
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('abierto')) {
      ponerMenu(false);
      botonMenu.focus();
    }
  });
}

/* =========================================================
   Datos y piezas que usan varias páginas
   ========================================================= */

// Qué tan fuerte se siente → largo de la barra (de 0 a 100)
const BARRA_INTENSIDAD = { 'Cerca de la piel': 30, 'Media': 55, 'Fuerte': 75, 'Muy fuerte': 95 };

// Las tarjetas del catálogo y de "También te puede gustar" llevan a la página de cada perfume
const HAY_PAGINA_PERFUME = true;

// Entrega (datos del cliente). Con alguno en null, la página del perfume no muestra la fecha.
// diasMin y diasMax: días hábiles que tarda en llegar. horaCorte: hasta qué hora sale el mismo día, en 24 h (14 = 2 p. m.)
const ENTREGA = { diasMin: null, diasMax: null, horaCorte: null };

/* ---------- Tamaños de un perfume ---------- */
// 'frasco', 'decant' o 'decant-5' → { texto: 'Decant 10 ml', precio: 45000 }, o null si ese perfume no lo tiene
function datosTamano(perfume, tamano) {
  if (!perfume) return null;
  if (tamano === 'frasco') return { texto: 'Frasco 100 ml', precio: perfume.precio };
  if (tamano === 'decant' && perfume.decant) return { texto: 'Decant ' + perfume.decant.ml + ' ml', precio: perfume.decant.precio };
  if (tamano === 'decant-5' && perfume.decant5) return { texto: 'Decant ' + perfume.decant5.ml + ' ml', precio: perfume.decant5.precio };
  return null;
}

/* =========================================================
   Mi lista: varios perfumes en un solo mensaje de WhatsApp
   Se guarda en el navegador (localStorage), así se ve igual en el catálogo y en cada perfume.
   Cada elemento: { id, tamano: 'frasco' | 'decant' | 'decant-5', cantidad }
   ========================================================= */

const CLAVE_LISTA = 'sbprive-mi-lista';

// Con try porque en modo incógnito o con el almacenamiento bloqueado puede fallar:
// en ese caso la lista funciona igual, solo que no se guarda al recargar
function leerLista() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_LISTA)) || [];
    // Solo lo que sigue existiendo en perfumes.js (si un perfume o un tamaño se quitó, se descarta)
    return guardada.filter(function (item) {
      return datosTamano(buscarPerfume(item.id), item.tamano) && item.cantidad >= 1;
    });
  } catch (error) {
    return [];
  }
}
let miLista = leerLista();

// Cada página puede pedir que le avisen cuando la lista cambia (el catálogo repinta "Mi lista")
const oyentesLista = [];
function alCambiarLista(funcion) {
  oyentesLista.push(funcion);
}
function avisarLista() {
  pintarBolsa();
  document.querySelectorAll('.perfume__agregar').forEach(marcarBotonAgregar);
  oyentesLista.forEach(function (funcion) { funcion(); });
}

function guardarLista() {
  try {
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(miLista));
  } catch (error) {
    // sin almacenamiento: se queda solo en esta visita
  }
  avisarLista();
}

// ¿Está este perfume en la lista? (con tamaño: ese tamaño exacto; sin tamaño: cualquiera)
function estaEnLista(id, tamano) {
  return miLista.some(function (item) { return item.id === id && (!tamano || item.tamano === tamano); });
}

// Si ya está con ese tamaño, se suma la cantidad (máximo 10)
function agregarALista(id, tamano, cantidad) {
  const ya = miLista.find(function (item) { return item.id === id && item.tamano === tamano; });
  if (ya) {
    ya.cantidad = Math.min(10, ya.cantidad + cantidad);
  } else {
    miLista.push({ id: id, tamano: tamano, cantidad: Math.min(10, cantidad) });
  }
  guardarLista();
}

// Sin tamaño se quitan todos los tamaños de ese perfume
function quitarDeLista(id, tamano) {
  miLista = miLista.filter(function (item) { return !(item.id === id && (!tamano || item.tamano === tamano)); });
  guardarLista();
}

function cambiarCantidad(item, cambio) {
  item.cantidad = Math.max(1, Math.min(10, item.cantidad + cambio));
  guardarLista();
}

function precioDe(item) {
  return datosTamano(buscarPerfume(item.id), item.tamano).precio;
}
function tamanoTexto(item) {
  return datosTamano(buscarPerfume(item.id), item.tamano).texto;
}

// Total solo si todos tienen precio; si falta alguno, se confirma por WhatsApp
function totalDeLista() {
  let suma = 0;
  for (const item of miLista) {
    const precio = precioDe(item);
    if (precio == null) return null;
    suma += precio * item.cantidad;
  }
  return suma;
}

function unidadesLista() {
  return miLista.reduce(function (suma, item) { return suma + item.cantidad; }, 0);
}

// El mensaje de WhatsApp con toda la lista
function mensajeLista() {
  const lineas = miLista.map(function (item) {
    const p = buscarPerfume(item.id);
    return '• ' + item.cantidad + ' × ' + p.nombre + ' de ' + p.marca + ' (' + tamanoTexto(item).toLowerCase() + ')';
  });
  const total = totalDeLista();
  return 'Hola, quiero pedir estos perfumes:\n' + lineas.join('\n') +
    (total != null ? '\nTotal: ' + precioTexto(total) : '');
}

// La bolsa del encabezado: el número y lo que dice el lector de pantalla (en el inicio no hay bolsa)
function pintarBolsa() {
  const bolsa = document.querySelector('.boton-lista');
  if (!bolsa) return;
  const unidades = unidadesLista();
  bolsa.querySelector('.boton-lista__cuenta').textContent = unidades;
  bolsa.setAttribute('aria-label', 'Mi lista: ' + (unidades === 1 ? '1 perfume' : unidades + ' perfumes'));
}

// El botón "Agregar a mi lista" de una tarjeta dice si el perfume ya está en la lista
function marcarBotonAgregar(boton) {
  const dentro = estaEnLista(boton.dataset.id);
  boton.setAttribute('aria-pressed', dentro ? 'true' : 'false');
  boton.textContent = dentro ? 'En mi lista ✓' : 'Agregar a mi lista';
}

// Un solo oyente para todos los "Agregar a mi lista" de las tarjetas (las tarjetas se crean y se borran).
// El catálogo puede decir qué tamaño agregar con una función tamanoAlAgregar(id); si no, se agrega el frasco
document.addEventListener('click', function (evento) {
  const boton = evento.target.closest('.perfume__agregar');
  if (!boton) return;
  const id = boton.dataset.id;
  if (estaEnLista(id)) {
    quitarDeLista(id);
  } else {
    const tamano = typeof tamanoAlAgregar === 'function' ? tamanoAlAgregar(id) : 'frasco';
    agregarALista(id, tamano, 1);
  }
});

// Si la persona tiene el sitio abierto en otra pestaña y cambia la lista allá, aquí también se actualiza
window.addEventListener('storage', function (evento) {
  if (evento.key === CLAVE_LISTA) {
    miLista = leerLista();
    avisarLista();
  }
});

/* =========================================================
   Tarjeta de un perfume (catálogo y "También te puede gustar")
   Copia la plantilla <template id="plantilla-perfume"> del HTML y la llena
   ========================================================= */
function tarjetaPerfume(p) {
  const copia = document.getElementById('plantilla-perfume').content.cloneNode(true);
  const enlace = copia.querySelector('.perfume__enlace');

  if (HAY_PAGINA_PERFUME) {
    enlace.href = 'perfume.html?id=' + encodeURIComponent(p.id);
  } else {
    enlace.removeAttribute('href'); // sin href deja de ser un enlace: no lleva a ninguna parte
  }

  const foto = copia.querySelector('.perfume__foto img');
  foto.alt = p.nombre + ' de ' + p.marca;
  foto.addEventListener('error', function () { foto.remove(); }); // mejor fondo vacío que un ícono roto
  foto.src = p.imagen;
  if (!p.masPedido) copia.querySelector('.perfume__sello').remove();

  copia.querySelector('.perfume__datos').textContent = [p.marca, p.tipo].filter(Boolean).join(' · ');
  copia.querySelector('.perfume__nombre').textContent = p.nombre;
  const aroma = [p.aroma, p.intensidad].filter(Boolean).join(' · ');
  if (aroma) {
    copia.querySelector('.perfume__aroma').textContent = aroma;
  } else {
    copia.querySelector('.perfume__aroma').remove();
  }

  copia.querySelector('.perfume__precio').textContent = precioTexto(p.precio);
  if (p.decant) {
    copia.querySelector('.perfume__decant').textContent = 'Decant ' + p.decant.ml + ' ml: ' + precioTexto(p.decant.precio);
  } else {
    copia.querySelector('.perfume__decant').remove();
  }
  if (!p.pocasPiezas) copia.querySelector('.perfume__aviso').remove();

  const agregar = copia.querySelector('.perfume__agregar');
  agregar.dataset.id = p.id;
  marcarBotonAgregar(agregar);

  copia.querySelector('.perfume__botones .boton-oscuro').href = enlacePedido(p);
  return copia;
}

/* ---------- Al cargar cualquier página: el número de la bolsa ---------- */
pintarBolsa();
