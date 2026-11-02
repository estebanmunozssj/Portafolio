'use strict';

/* ===== ENTRADAS AL HACER SCROLL ===== */
/* Cada bloque aparece con un desvanecido y una subida corta (12px) cuando llega a la pantalla.
   Usa la Web Animations API (element.animate), así no choca con las transiciones :hover del CSS. */

(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return; // Sin soporte: todo se ve normal

  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

  // Con movimiento reducido: solo un desvanecido corto, sin desplazamiento
  const cuadros = reducir
    ? [{ opacity: 0 }, { opacity: 1 }]
    : [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }];
  const duracion = reducir ? 200 : 500;

  // [qué elementos, ms entre uno y otro cuando entran juntos]
  const grupos = [
    ['#proyectos > h2, #proyectos > .nota-proyectos', 60],
    ['#proyectos article', 60],
    ['#servicios > *', 60],
    ['#sobre-mi > *', 60],
    ['#habilidades > h2, #habilidades li', 40],
    ['#contacto > *', 60]
  ];

  const yaSeVe = (el) => el.getBoundingClientRect().top < window.innerHeight; // Lo visible al cargar no se anima

  // Si alguien salta con un enlace del menú, lo que quedó arriba se muestra sin animar
  const pendientes = new Map();
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
    requestAnimationFrame(revisarSaltados);
  };
  window.addEventListener('scroll', alHacerScroll, { passive: true });

  grupos.forEach(([selector, paso]) => {
    const elementos = [...document.querySelectorAll(selector)].filter((el) => !yaSeVe(el));
    if (!elementos.length) return;

    const observador = new IntersectionObserver((entradas) => {
      const visibles = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
      visibles.forEach((el, i) => { // Los que entran juntos aparecen uno tras otro
        observador.unobserve(el);
        pendientes.delete(el);
        el.style.opacity = ''; // 'backwards' lo mantiene oculto durante el retraso
        el.animate(cuadros, { duration: duracion, delay: reducir ? 0 : i * paso, easing: EASE_OUT, fill: 'backwards' });
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    elementos.forEach((el) => {
      el.style.opacity = '0';
      observador.observe(el);
      pendientes.set(el, () => { observador.unobserve(el); el.style.opacity = ''; });
    });
  });
})();
