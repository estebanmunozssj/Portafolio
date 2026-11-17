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
