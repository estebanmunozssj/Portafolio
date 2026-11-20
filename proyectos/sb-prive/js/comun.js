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
  return enlaceWhatsApp('Hola, quiero pedir ' + perfume.nombre + ' de ' + perfume.marca + ' (' + textoFrasco(perfume).toLowerCase() + ').');
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

/* ---------- Avisos ---------- */
// Texto escondido a la vista que el lector de pantalla lee en voz alta cuando cambia
const anuncio = crear('p', 'solo-lector');
anuncio.setAttribute('aria-live', 'polite');
document.body.append(anuncio);
function anunciar(texto) {
  anuncio.textContent = '';
  setTimeout(function () { anuncio.textContent = texto; }, 50); // vaciar y volver a poner: así lo lee aunque se repita
}

// Aviso corto abajo de la pantalla: "Agregado a tu lista · Ver mi lista" o "Quitado · Deshacer".
// accion: { texto: 'Ver mi lista', href: '...' } o { texto: 'Deshacer', alTocar: funcion }
const cajaAviso = crear('div', 'aviso');
cajaAviso.setAttribute('role', 'status');
cajaAviso.hidden = true;
document.body.append(cajaAviso);
let relojAviso;
function avisar(texto, accion) {
  cajaAviso.replaceChildren(crear('span', 'aviso__texto', texto));
  if (accion) {
    const boton = crear(accion.href ? 'a' : 'button', 'aviso__accion', accion.texto);
    if (accion.href) {
      boton.href = accion.href;
    } else {
      boton.type = 'button';
    }
    boton.addEventListener('click', function () {
      cajaAviso.hidden = true;
      if (accion.alTocar) accion.alTocar();
    });
    cajaAviso.append(boton);
  }
  cajaAviso.hidden = false;
  clearTimeout(relojAviso);
  relojAviso = setTimeout(function () { cajaAviso.hidden = true; }, 5000); // se va solo a los 5 segundos
}

// "Ver mi lista": en el catálogo baja a la lista; en las demás páginas lleva al catálogo
function accionVerLista() {
  return { texto: 'Ver mi lista', href: document.getElementById('mi-lista') ? '#mi-lista' : 'catalogo.html#mi-lista' };
}

/* ---------- Respuesta al tocar cualquier botón de WhatsApp ---------- */
// Por un momento dice "Abriendo WhatsApp…", para que la persona sepa que funcionó.
// Se escucha en toda la página (no enlace por enlace) para que también sirva
// en los botones que se crean después con JavaScript (tarjetas, Mi lista)
document.addEventListener('click', function (evento) {
  const enlace = evento.target.closest('a[href^="https://wa.me/"]');
  if (!enlace) return;
  // WhatsApp se abre en otra pestaña: en el computador la tienda (con sus filtros y su lista) sigue abierta
  enlace.target = '_blank';
  enlace.rel = 'noopener';
  if (enlace.dataset.abriendo) return;
  anunciar('Abriendo WhatsApp');
  // Se guardan las piezas de adentro (no solo el texto): algunos enlaces tienen dos partes
  const contenidoOriginal = Array.from(enlace.childNodes);
  enlace.dataset.abriendo = 'si';
  enlace.textContent = 'Abriendo WhatsApp…';
  setTimeout(function () {
    // Solo se devuelve el texto de antes si nadie lo cambió mientras tanto
    // (por ejemplo, la barra del catálogo pasa de "Enviar mi lista (2)" a "(3)")
    if (enlace.textContent === 'Abriendo WhatsApp…') {
      enlace.replaceChildren.apply(enlace, contenidoOriginal);
    }
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

// Entrega (datos del cliente). Con alguno en null, la página del perfume no muestra la fecha.
// diasMin y diasMax: días hábiles que tarda en llegar. horaCorte: hasta qué hora sale el mismo día, en 24 h (14 = 2 p. m.)
const ENTREGA = { diasMin: null, diasMax: null, horaCorte: null };

/* ---------- Tamaños de un perfume ---------- */
// "Frasco 100 ml" si el perfume tiene ml anotados; si no, solo "Frasco" (los tamaños del proveedor varían)
function textoFrasco(perfume) {
  return perfume && perfume.ml ? 'Frasco ' + perfume.ml + ' ml' : 'Frasco';
}

// 'frasco', 'decant' o 'decant-5' → { texto: 'Decant 10 ml', precio: 45000 }, o null si ese perfume no lo tiene
function datosTamano(perfume, tamano) {
  if (!perfume) return null;
  if (tamano === 'frasco') return { texto: textoFrasco(perfume), precio: perfume.precio };
  if (tamano === 'decant' && perfume.decant) return { texto: 'Decant ' + perfume.decant.ml + ' ml', precio: perfume.decant.precio };
  if (tamano === 'decant-5' && perfume.decant5) return { texto: 'Decant ' + perfume.decant5.ml + ' ml', precio: perfume.decant5.precio };
  return null;
}

// El decant que se muestra en tarjetas y filtros: el de 10 ml si existe; si no, el de 5 ml.
// Devuelve el nombre del tamaño ('decant' o 'decant-5'), o null si el perfume no viene en decant
function tamanoDecant(perfume) {
  if (perfume.decant) return 'decant';
  if (perfume.decant5) return 'decant-5';
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

// Sin tamaño se quitan todos los tamaños de ese perfume.
// Devuelve lo que quitó (con su posición), para poder deshacerlo
function quitarDeLista(id, tamano) {
  const quitados = [];
  miLista = miLista.filter(function (item, posicion) {
    const sale = item.id === id && (!tamano || item.tamano === tamano);
    if (sale) quitados.push({ item: item, posicion: posicion });
    return !sale;
  });
  guardarLista();
  return quitados;
}

// "Deshacer": vuelve a poner lo quitado en el mismo lugar.
// Si mientras tanto ese perfume con ese tamaño volvió a la lista (por ejemplo, desde otra pestaña),
// se suman las cantidades en vez de quedar dos filas iguales
function devolverALista(quitados) {
  quitados.forEach(function (q) {
    const ya = miLista.find(function (item) { return item.id === q.item.id && item.tamano === q.item.tamano; });
    if (ya) {
      ya.cantidad = Math.min(10, ya.cantidad + q.item.cantidad);
    } else {
      miLista.splice(Math.min(q.posicion, miLista.length), 0, q.item);
    }
  });
  guardarLista();
}

// Quitar y ofrecer deshacer con el aviso de abajo
function quitarConAviso(id, tamano) {
  const quitados = quitarDeLista(id, tamano);
  avisar('Quitado de tu lista', { texto: 'Deshacer', alTocar: function () { devolverALista(quitados); } });
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

// La bolsa del encabezado: el número y lo que dice el lector de pantalla (si la página no tiene bolsa, no hace nada)
function pintarBolsa() {
  const bolsa = document.querySelector('.boton-lista');
  if (!bolsa) return;
  const unidades = unidadesLista();
  bolsa.querySelector('.boton-lista__cuenta').textContent = unidades;
  bolsa.setAttribute('aria-label', 'Mi lista: ' + (unidades === 1 ? '1 perfume' : unidades + ' perfumes'));
}

// Qué tamaño agrega una tarjeta: el frasco, salvo que la página diga otra cosa.
// El catálogo puede decirlo con una función tamanoAlAgregar(id) (por ejemplo, el decant si se filtra por decants)
function tamanoDeTarjeta(id) {
  return typeof tamanoAlAgregar === 'function' ? tamanoAlAgregar(id) : 'frasco';
}

// El botón "Agregar a mi lista" de una tarjeta dice si SU tamaño ya está en la lista.
// Así no toca lo que se agregó con otro tamaño desde la página del perfume
function marcarBotonAgregar(boton) {
  const dentro = estaEnLista(boton.dataset.id, tamanoDeTarjeta(boton.dataset.id));
  boton.setAttribute('aria-pressed', dentro ? 'true' : 'false');
  // El corazón no lleva texto: lo que dice va en aria-label (lo lee el lector de pantalla)
  if (boton.classList.contains('perfume__corazon')) {
    const nombre = buscarPerfume(boton.dataset.id)?.nombre || '';
    boton.setAttribute('aria-label', (dentro ? 'Quitar de mi lista: ' : 'Agregar a mi lista: ') + nombre);
    boton.title = dentro ? 'En mi lista' : 'Agregar a mi lista';
    return;
  }
  boton.textContent = dentro ? 'En mi lista ✓' : 'Agregar a mi lista';
}

// Un solo oyente para todos los "Agregar a mi lista" de las tarjetas (las tarjetas se crean y se borran).
// Agrega o quita solo el tamaño de la tarjeta
document.addEventListener('click', function (evento) {
  const boton = evento.target.closest('.perfume__agregar');
  if (!boton) return;
  const id = boton.dataset.id;
  const tamano = tamanoDeTarjeta(id);
  if (estaEnLista(id, tamano)) {
    quitarConAviso(id, tamano);
  } else {
    agregarALista(id, tamano, 1);
    avisar('Agregado a tu lista', accionVerLista());
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
   Se arma aquí, en un solo lugar (antes era una plantilla copiada en dos HTML).
   nivelTitulo: 'h2' en el catálogo; 'h3' donde la sección ya tiene su h2
   Devuelve el <li> listo para poner en una lista .catalogo__lista
   ========================================================= */
function tarjetaPerfume(p, nivelTitulo) {
  const item = crear('li');
  const tarjeta = crear('article', 'perfume');
  tarjeta.dataset.aroma = p.aroma || ''; // el CSS pinta el punto del color de ese aroma

  // Foto, marca, nombre y aroma: un solo enlace a la página del perfume
  const enlace = crear('a', 'perfume__enlace');
  enlace.href = 'perfume.html?id=' + encodeURIComponent(p.id);

  const marco = crear('div', 'perfume__foto');
  // Etiquetas arriba a la izquierda: el tipo (Árabe, Nicho, Diseñador) y, si aplica, "Más pedido"
  const etiquetas = crear('div', 'perfume__etiquetas');
  const tipoCorto = { 'Árabes': 'Árabe' }[p.tipo] || p.tipo;
  if (tipoCorto) etiquetas.append(crear('span', 'perfume__tipo', tipoCorto));
  if (p.masPedido) etiquetas.append(crear('span', 'perfume__sello', 'Más pedido'));
  marco.append(etiquetas);
  const foto = crear('img');
  foto.alt = p.nombre + ' de ' + p.marca;
  foto.width = 240;
  foto.height = 288;
  foto.loading = 'lazy';
  foto.addEventListener('error', function () { foto.remove(); }); // mejor fondo vacío que un ícono roto
  foto.src = p.imagen;
  marco.append(foto);
  enlace.append(marco);

  enlace.append(crear('p', 'perfume__marca', p.marca));
  enlace.append(crear(nivelTitulo || 'h2', 'perfume__nombre', p.nombre));
  // El aroma como etiqueta con su punto de color. Cuando el cliente pase las notas, aquí pueden ir 2 o 3
  if (p.aroma) enlace.append(crear('p', 'perfume__aroma', p.aroma));
  tarjeta.append(enlace);

  // Tamaños: "Frasco · Decant 10 ml" (con precio solo si el perfume ya tiene precio)
  const decant = datosTamano(p, tamanoDecant(p));
  const tamanos = [textoFrasco(p) + (p.precio ? ' ' + precioTexto(p.precio) : '')];
  if (decant) tamanos.push(decant.texto + (decant.precio ? ' ' + precioTexto(decant.precio) : ''));
  tarjeta.append(crear('p', 'perfume__tamanos', tamanos.join(' · ')));
  if (p.pocasPiezas) tarjeta.append(crear('p', 'perfume__aviso', 'Pocas piezas'));

  // Corazón arriba a la derecha de la foto: agrega o quita de Mi lista
  const agregar = crear('button', 'perfume__agregar perfume__corazon');
  agregar.type = 'button';
  agregar.dataset.id = p.id;
  agregar.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.4 3 5 6.4 5c2 0 3.3 1.1 4 2.3h3.2C14.3 6.1 15.6 5 17.6 5 21 5 22.7 8.4 21.2 11.4 19 15.6 12 20 12 20z"/></svg>';
  marcarBotonAgregar(agregar);
  tarjeta.append(agregar);

  // Pedir por WhatsApp directo, con el mensaje de ese perfume
  const botones = crear('div', 'perfume__botones');
  const pedir = crear('a', 'perfume__pedir', 'Pedir por WhatsApp');
  pedir.href = enlacePedido(p);
  pedir.target = '_blank';
  pedir.rel = 'noopener';
  botones.append(pedir);
  tarjeta.append(botones);

  item.append(tarjeta);
  return item;
}

/* ---------- Al cargar cualquier página: el número de la bolsa ---------- */
pintarBolsa();

/* =========================================================
   La barra fija de WhatsApp se esconde cuando ya hay otro botón de WhatsApp a la vista
   (el de la tarjeta, el de la ficha, "Enviar mi lista"...), y vuelve sola cuando ese botón
   sale de la pantalla. Así siempre hay UN botón de WhatsApp a mano: nunca cero, nunca dos.
   ========================================================= */
function esconderBarraConOtroBoton() {
  const barra = document.querySelector('.barra-whatsapp');
  if (!barra || !('IntersectionObserver' in window)) return;

  const otrosBotones = document.querySelectorAll('a[href^="https://wa.me/"]:not(.barra-whatsapp)');
  const aLaVista = new Set();

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) aLaVista.add(entrada.target);
      else aLaVista.delete(entrada.target);
    });
    const esconder = aLaVista.size > 0;
    document.body.classList.toggle('con-otro-whatsapp', esconder);
    barra.inert = esconder; // escondida, tampoco se llega a ella con el teclado
  }, { rootMargin: '0px 0px -64px 0px' }); // la franja de abajo (donde está la barra) no cuenta

  // Un botón con "hidden" (ej: "Enviar mi lista" con la lista vacía) nunca cuenta como visible
  otrosBotones.forEach(function (boton) { observador.observe(boton); });
}
esconderBarraConOtroBoton();

/* =========================================================
   Movimiento: la franja de arriba que alterna mensajes y el botón "Pausar movimiento"
   ========================================================= */
const CLAVE_MOVIMIENTO = 'sbprive-sin-movimiento';
const pideMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

// ¿La persona pausó el movimiento antes? (se recuerda entre páginas)
function leerPausa() {
  try {
    return localStorage.getItem(CLAVE_MOVIMIENTO) === 'si';
  } catch (error) {
    return false;
  }
}

// La clase .sin-movimiento en <html> apaga las partículas de la vitrina (humo.js) y la franja (abajo)
function ponerPausa(pausado) {
  document.documentElement.classList.toggle('sin-movimiento', pausado);
  const boton = document.querySelector('.franja__pausa');
  if (boton) {
    boton.setAttribute('aria-pressed', pausado ? 'true' : 'false');
    boton.setAttribute('aria-label', pausado ? 'Reanudar movimiento' : 'Pausar movimiento');
    // Ⅱ cuando se mueve, ▶ cuando está pausado
    boton.querySelector('svg').innerHTML = pausado
      ? '<path d="M4 2l8 5-8 5z"></path>'
      : '<rect x="3" y="2" width="3" height="10"></rect><rect x="8" y="2" width="3" height="10"></rect>';
  }
  try {
    localStorage.setItem(CLAVE_MOVIMIENTO, pausado ? 'si' : 'no');
  } catch (error) {
    // sin almacenamiento: la pausa dura solo en esta página
  }
}
ponerPausa(leerPausa());

const botonPausa = document.querySelector('.franja__pausa');
if (botonPausa) {
  botonPausa.addEventListener('click', function () {
    ponerPausa(!document.documentElement.classList.contains('sin-movimiento'));
  });
}

// Franja: cada 5 segundos pasa al siguiente mensaje, con un fundido (el CSS hace el fundido).
// Se detiene si: la persona pidió menos movimiento, tocó "Pausar", o tiene el mouse o el foco encima
const mensajesFranja = document.querySelectorAll('.franja__mensaje');
if (mensajesFranja.length > 1) {
  let actual = 0;
  let encima = false;
  const franja = document.querySelector('.franja');
  franja.addEventListener('mouseenter', function () { encima = true; });
  franja.addEventListener('mouseleave', function () { encima = false; });
  franja.addEventListener('focusin', function () { encima = true; });
  franja.addEventListener('focusout', function () { encima = false; });

  setInterval(function () {
    const quieto = pideMenosMovimiento.matches || document.documentElement.classList.contains('sin-movimiento') || encima;
    if (quieto || document.hidden) return;
    mensajesFranja[actual].classList.remove('activo');
    actual = (actual + 1) % mensajesFranja.length;
    mensajesFranja[actual].classList.add('activo');
  }, 5000);
}
