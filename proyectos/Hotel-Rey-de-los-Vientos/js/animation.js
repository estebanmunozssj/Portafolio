'use strict';

/* ===== EFECTOS AL HACER SCROLL ===== */
/* Un solo momento protagonista (la foto de Alrededores) y entradas sutiles en lo demás.
   Usa la Web Animations API (element.animate), así no choca con las transiciones :hover del CSS. */

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario pidió menos movimiento
const SALIDA = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva que arranca rápido y frena suave al final

(() => {
  if (sinMovimiento || !('IntersectionObserver' in window) || !Element.prototype.animate) return; // Sin soporte o sin movimiento: todo se ve normal

  // Tipos de entrada: de dónde parte cada elemento y cuánto dura
  const efectos = {
    sutil:   { cuadros: [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], duracion: 700 },
    tarjeta: { cuadros: [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], duracion: 800 },
    foto:    { cuadros: [{ opacity: 0, transform: 'translateY(20px) scale(.96)' }, { opacity: 1, transform: 'none' }], duracion: 900 },
    cta:     { cuadros: [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], duracion: 900 }
  };

  // [qué elementos, qué efecto, ms entre uno y otro cuando entran juntos]
  const grupos = [
    ['#habitaciones > .etiqueta, #habitaciones > h2, #habitaciones > .nota', 'sutil', 80],
    ['.grid--tarifas > .tarifa', 'tarjeta', 90],
    ['.alrededores__texto > .etiqueta, .alrededores__texto > h2', 'sutil', 80],
    ['.alrededores .mini', 'foto', 140],
    ['#ventajas .etiqueta, #ventajas h2, #ventajas .tarjeta', 'sutil', 70],
    ['.cta', 'cta', 0]
  ];

  const yaSeVe = (el) => el.getBoundingClientRect().top < window.innerHeight; // Lo que ya está en pantalla al cargar no se anima

  /* Si alguien salta con un enlace del menú, algunos elementos quedan arriba sin haberse visto.
     Esta revisión los muestra sin animar para que nunca queden ocultos. */
  const pendientes = new Map(); // elemento -> función que lo muestra sin animar
  let revisando = false;
  const revisarSaltados = () => {
    revisando = false;
    pendientes.forEach((mostrar, el) => {
      if (el.getBoundingClientRect().bottom < 0) { mostrar(); pendientes.delete(el); }
    });
    if (!pendientes.size) window.removeEventListener('scroll', alHacerScroll);
  };
  const alHacerScroll = () => {
    if (revisando) return;
    revisando = true;
    requestAnimationFrame(revisarSaltados); // Como mucho una revisión por cuadro
  };
  window.addEventListener('scroll', alHacerScroll, { passive: true });

  /* --- Momento protagonista: la foto de Alrededores se descubre de abajo hacia arriba --- */
  const paisaje = document.querySelector('.foto--paisaje');
  const paisajeImg = paisaje && paisaje.querySelector('img');

  if (paisaje && paisajeImg && !yaSeVe(paisaje)) {
    paisajeImg.style.clipPath = 'inset(100% 0 0 0)'; // Se recorta la foto; el contenedor queda visible para poder vigilarlo

    const verPaisaje = new IntersectionObserver((entradas) => {
      if (!entradas[0].isIntersecting) return; // Aún no llega
      verPaisaje.disconnect();
      pendientes.delete(paisaje);
      paisajeImg.style.clipPath = '';
      paisajeImg.animate( // Se descubre de abajo hacia arriba mientras se aleja un poco
        [{ clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.15)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }],
        { duration: 1400, easing: SALIDA }
      );
    }, { threshold: 0.2 });

    verPaisaje.observe(paisaje);
    pendientes.set(paisaje, () => { verPaisaje.disconnect(); paisajeImg.style.clipPath = ''; });
  }

  /* --- Entradas sutiles para el resto --- */
  grupos.forEach(([selector, tipo, paso]) => {
    const elementos = [...document.querySelectorAll(selector)].filter((el) => !yaSeVe(el));
    if (!elementos.length) return;

    const { cuadros, duracion } = efectos[tipo];

    const observador = new IntersectionObserver((entradas) => {
      const visibles = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
      visibles.forEach((el, i) => { // Los que entran juntos salen uno tras otro
        observador.unobserve(el);
        pendientes.delete(el);
        el.style.opacity = ''; // Quita el escondite; 'backwards' lo mantiene oculto durante el retraso
        el.animate(cuadros, { duration: duracion, delay: i * paso, easing: SALIDA, fill: 'backwards' });
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    elementos.forEach((el) => {
      el.style.opacity = '0'; // Escondido hasta que llegue a la pantalla
      observador.observe(el);
      pendientes.set(el, () => { observador.unobserve(el); el.style.opacity = ''; });
    });
  });
})();
