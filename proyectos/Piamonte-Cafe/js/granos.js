'use strict';

// Ícono del grano: la copia dentro de la página si existe (Mi tarjeta), si no el archivo img/iconos.svg
const GRANO_FLOTA = document.getElementById('i-grano') ? '#i-grano' : 'img/iconos.svg#grano';

/* =========================================================
   GRANOS DE CAFÉ QUE FLOTAN (portada, menú y Mi tarjeta)
   Decorativos, detrás del contenido de <main class="con-granos">. Con GSAP + ScrollTrigger:
   - Aparecen al llegar a ellos
   - Mientras pasan por la pantalla suben y giran, cada uno a su velocidad
     (los grandes, más rápido: así se siente la profundidad)
   - Quietos, flotan suave (eso lo hace el CSS en estilos.css)
   Si la persona pidió "menos movimiento", quedan quietos
   ========================================================= */

(() => {
  const main = document.querySelector('main.con-granos');
  if (!main) return;

  // Uno cada ~320 px de alto de la página (entre 8 y 28): la portada, que es larga, lleva más
  const cantidad = Math.max(8, Math.min(28, Math.round(main.offsetHeight / 320)));

  // Tamaños y profundidades que se repiten en ese orden (0.4 = lejos: pequeño, borroso, lento; 1.1 = cerca)
  const TAMANOS = [26, 40, 22, 48, 26, 24, 54, 34, 28, 40, 24];
  const PROFUNDIDAD = [0.6, 1.0, 0.4, 1.1, 0.5, 0.4, 1.1, 0.8, 0.6, 0.9, 0.4];

  // Siempre en el mismo lugar (no al azar en cada visita): la página se ve igual cada vez
  const granos = Array.from({ length: cantidad }, (_, i) => {
    const izquierda = i % 2 === 0;
    // Pegados al borde: en celular se asoman desde afuera y no pasan por detrás de los textos
    const x = izquierda ? -4 + ((i * 7) % 4) : 94 + ((i * 5) % 3);
    const y = ((i + 0.5) / cantidad) * 100 + (((i * 37) % 7) - 3); // Repartidos de arriba a abajo
    return { x, y, tam: TAMANOS[i % TAMANOS.length], prof: PROFUNDIDAD[i % PROFUNDIDAD.length] };
  });

  const capa = document.createElement('div');
  capa.className = 'granos-fondo';
  capa.setAttribute('aria-hidden', 'true');
  capa.innerHTML = granos.map(({ x, y, tam, prof }, i) => `
    <span class="grano-flota ${x < 50 ? 'izq' : 'der'}${prof < 0.55 ? ' lejos' : ''}" data-prof="${prof}"
          style="--x:${x}; top:${y.toFixed(1)}%; width:${tam}px; height:${tam}px; --i:${i % 11}">
      <svg><use href="${GRANO_FLOTA}"/></svg>
    </span>`).join('');
  main.prepend(capa);

  if (!window.gsap || !window.ScrollTrigger) return; // Sin GSAP quedan quietos, igual se ven
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const elementos = gsap.utils.toArray('.grano-flota');

    // 1. Aparecen al llegar a ellos (scale y opacidad; el scroll mueve y y rotation: no chocan)
    gsap.set(elementos, { autoAlpha: 0, scale: 0.4 });
    ScrollTrigger.batch(elementos, {
      start: 'top 95%',
      once: true,
      onEnter: (grupo) => gsap.to(grupo, {
        autoAlpha: 1, scale: 1, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: 'auto'
      })
    });

    // 2. Mientras cada grano cruza la pantalla, sube y gira según su profundidad
    elementos.forEach((grano, i) => {
      const prof = Number(grano.dataset.prof);
      gsap.fromTo(grano,
        { y: 90 * prof, rotation: 0 },
        {
          y: -90 * prof,
          rotation: (i % 2 ? 1 : -1) * 200 * prof,
          ease: 'none', // Parejo con el dedo: el scroll ya da el ritmo
          scrollTrigger: { trigger: grano, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
    });

    // 3. Mi tarjeta: los pasos de "cómo funciona" aparecen al llegar a ellos
    const pasos = gsap.utils.toArray('.pasos-tarjeta li');
    if (pasos.length) {
      gsap.set(pasos, { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch(pasos, {
        start: 'top 92%',
        once: true,
        onEnter: (grupo) => gsap.to(grupo, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, overwrite: true })
      });
    }
  });

  // El alto de la página cambia (pantallas de Mi tarjeta, filtros del menú, fotos que cargan):
  // recalcula dónde está cada grano. Espera un momento para no recalcular de más
  let espera;
  const recalcular = () => {
    clearTimeout(espera);
    espera = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  new MutationObserver(recalcular).observe(main, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['hidden']
  });
  window.addEventListener('load', recalcular);
  if (document.fonts) document.fonts.ready.then(recalcular);
})();
