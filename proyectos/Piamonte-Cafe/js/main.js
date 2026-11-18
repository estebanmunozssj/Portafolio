'use strict';

const NUMERO = '573168798017'; // WhatsApp de domicilios: 57 (Colombia) + número, sin + ni espacios

/* =========================================================
   LOGO ANIMADO DE LA PORTADA
   Espera a que carguen las letras (si no, el nombre se escribiría con otra letra
   y luego cambiaría). Si tardan más de 1,5 segundos, arranca igual
   ========================================================= */

(() => {
  const portada = document.getElementById('inicio');
  if (!portada) return;

  const arrancar = () => portada.classList.add('lista'); // La clase "lista" inicia la animación (ver CSS)
  const espera = new Promise((listo) => setTimeout(listo, 1500));
  const letras = document.fonts ? document.fonts.ready : espera;

  Promise.race([letras, espera]).then(arrancar);
})();

/* =========================================================
   ENCABEZADO: cambia de color al bajar y marca la sección actual
   ========================================================= */

(() => {
  const encabezado = document.getElementById('encabezado');
  const portada = document.getElementById('inicio');
  if (!encabezado || !portada) return;

  const enlaces = document.querySelectorAll('.nav-enlaces a');
  const secciones = ['historia', 'experiencias', 'visitanos'] // El menú ya no está aquí: tiene su página
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function revisar() {
    const y = window.scrollY;

    // Encabezado crema al salir de la portada (">= ... - 1" cuenta también el borde exacto)
    encabezado.classList.toggle('solido', y >= portada.offsetHeight - encabezado.offsetHeight - 1);

    // La sección actual es la última cuyo inicio ya pasó la mitad de la pantalla
    const mitad = y + window.innerHeight / 2;
    let actual = '';
    secciones.forEach((s) => { if (s.offsetTop <= mitad) actual = s.id; });

    enlaces.forEach((a) => a.classList.toggle('activo', a.dataset.seccion === actual));
  }

  window.addEventListener('scroll', revisar, { passive: true }); // passive: no hace lento el desplazamiento
  window.addEventListener('resize', revisar);
  revisar(); // Revisa una vez al cargar (por si la página abre a mitad)
})();

/* ===== BOTONES DE WHATSAPP ===== */
// Todos los enlaces con la clase "js-whatsapp" abren el chat con su mensaje (data-mensaje)

(() => {
  document.querySelectorAll('.js-whatsapp').forEach((enlace) => {
    if (!NUMERO) { // Sin número, el botón lleva al Instagram
      enlace.href = 'https://www.instagram.com/piamonte.cafe/';
      return;
    }
    const mensaje = enlace.dataset.mensaje || 'Hola Piamonte';
    enlace.href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`; // encodeURIComponent convierte espacios y tildes para la URL
  });
})();

/* ===== AÑO DEL PIE DE PÁGINA ===== */

(() => {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();

/* ===== VIDEO DE LA COSECHA ===== */
// Se reproduce solo cuando está en pantalla (ahorra datos y batería) y se pausa al salir.
// Con "reducir movimiento" activado no se reproduce: queda la imagen de portada.

(() => {
  const video = document.querySelector('.video-finca-clip');
  if (!video || !('IntersectionObserver' in window)) return;

  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

  new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting && !quieto.matches) {
      video.play().catch(() => {}); // Si el navegador no deja reproducir, se queda la portada
    } else {
      video.pause();
    }
  }, { threshold: 0.3 }).observe(video); // 0.3 = cuando se ve al menos el 30 % del video
})();
