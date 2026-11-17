'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en la página
   Parte 1: selector de aroma, vitrina, tarjeta y WhatsApp.
   Los perfumes vienen de js/perfumes.js (la lista PERFUMES).
   ========================================================= */

// Número de WhatsApp del cliente: 57 (Colombia) + número, sin + ni espacios
const WHATSAPP = '57[NUMERO]';

// Convierte 350000 en "$350.000". Si no hay precio todavía, muestra "[PRECIO]"
const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
function precioTexto(numero) {
  return numero == null ? '[PRECIO]' : formatoPesos.format(numero);
}

// Arma el enlace de WhatsApp con el mensaje ya escrito
function enlaceWhatsApp(mensaje) {
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);
}

/* ---------- Piezas de la página que vamos a cambiar ---------- */
const botonesAroma = document.querySelectorAll('.aroma');
const botonesFrasco = document.querySelectorAll('.frasco');
const tarjeta = {
  datos: document.querySelector('.tarjeta__datos'),
  nombre: document.querySelector('.tarjeta__nombre'),
  notas: document.querySelector('.tarjeta__notas'),
  precio: document.querySelector('.tarjeta__precio'),
  decant: document.querySelector('.tarjeta__decant'),
  boton: document.querySelector('.tarjeta .boton-whatsapp')
};

/* ---------- 1. Llenar la vitrina con los perfumes de la lista ---------- */
// Cada botón .frasco del HTML recibe un perfume. Si sobran botones, se esconden.
botonesFrasco.forEach(function (boton, i) {
  const perfume = PERFUMES[i];
  if (!perfume) {
    boton.hidden = true;
    return;
  }
  boton.dataset.id = perfume.id;
  boton.setAttribute('aria-label', perfume.nombre + ', ' + perfume.marca);
  const foto = boton.querySelector('img');
  foto.src = perfume.imagen;
});

function buscarPerfume(id) {
  return PERFUMES.find(function (p) { return p.id === id; });
}

/* ---------- 2. Mostrar un perfume en la tarjeta ---------- */
function mostrarPerfume(perfume) {
  tarjeta.datos.textContent = perfume.marca + ' · 100 ml · ' + perfume.familia;
  tarjeta.nombre.textContent = perfume.nombre;
  tarjeta.notas.textContent = perfume.notas;
  tarjeta.precio.textContent = precioTexto(perfume.precio);
  tarjeta.decant.textContent = perfume.decant
    ? 'Decant ' + perfume.decant.ml + ' ml: ' + precioTexto(perfume.decant.precio)
    : '';
  tarjeta.boton.href = enlaceWhatsApp('Hola, quiero pedir ' + perfume.nombre + ' de ' + perfume.marca + ' (100 ml).');

  // Marcar cuál frasco está elegido: crece y se ilumina (lo hace el CSS con .activo)
  botonesFrasco.forEach(function (boton) {
    const elegido = boton.dataset.id === perfume.id;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });
}

/* ---------- 3. Elegir un aroma ---------- */
// Los frascos de ese aroma se quedan encendidos y los demás se apagan un poco.
// La tarjeta muestra el primer perfume de ese aroma.
function elegirAroma(aroma) {
  botonesAroma.forEach(function (boton) {
    const elegido = boton.textContent.trim() === aroma;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });

  botonesFrasco.forEach(function (boton) {
    const perfume = buscarPerfume(boton.dataset.id);
    boton.classList.toggle('apagado', !!perfume && perfume.aroma !== aroma);
  });

  const primero = PERFUMES.find(function (p) { return p.aroma === aroma; });
  if (primero) {
    mostrarPerfume(primero);
  }
}

/* ---------- 4. Escuchar los toques ---------- */
botonesAroma.forEach(function (boton) {
  boton.addEventListener('click', function () {
    elegirAroma(boton.textContent.trim());
  });
});

botonesFrasco.forEach(function (boton) {
  boton.addEventListener('click', function () {
    const perfume = buscarPerfume(boton.dataset.id);
    if (perfume) {
      mostrarPerfume(perfume);
    }
  });
});

/* ---------- 5. Respuesta al tocar cualquier botón de WhatsApp ---------- */
// Por un momento dice "Abriendo WhatsApp…", para que la persona sepa que funcionó
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (enlace) {
  enlace.addEventListener('click', function () {
    const textoOriginal = enlace.textContent;
    if (enlace.dataset.abriendo) return;
    enlace.dataset.abriendo = 'si';
    enlace.textContent = 'Abriendo WhatsApp…';
    setTimeout(function () {
      enlace.textContent = textoOriginal;
      delete enlace.dataset.abriendo;
    }, 1600);
  });
});

/* ---------- Al cargar: empieza con el aroma que está marcado en el HTML ---------- */
const aromaInicial = document.querySelector('.aroma.activo');
elegirAroma(aromaInicial ? aromaInicial.textContent.trim() : 'Dulce');
