'use strict';

/* =========================================================
   ANIMACIONES CON GSAP + ScrollTrigger (solo en el inicio)
   Igual que en Piamonte: si GSAP no carga, la página se ve normal, solo que sin efectos.
   Se cargan después de main.js, cuando "Elige por tipo" ya tiene sus precios.
   ========================================================= */

(function () {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Solo si la persona NO pidió "menos movimiento" en su teléfono
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    // Si tocó "Pausar movimiento" en la franja, tampoco se anima nada
    if (document.documentElement.classList.contains('sin-movimiento')) return;

    /* ----- "Elige por tipo": las luces de la vitrina se encienden ----- */
    // Por cada fila, en orden:
    //   1. se dibuja la línea dorada de arriba, de izquierda a derecha (como una luz que se prende)
    //   2. el nombre sube un poco y aparece
    //   3. el precio "Desde" aparece desde la izquierda
    // Pasa UNA sola vez, cuando la sección llega a la pantalla, y después todo queda quieto
    const filas = gsap.utils.toArray('.tipo');
    if (!filas.length) return;

    // Estado inicial (solo con GSAP: sin él, las filas se ven completas desde el principio)
    gsap.set(filas, { '--trazo': 0 });
    gsap.set('.tipo__nombre', { autoAlpha: 0, y: 18 });
    gsap.set('.tipo__desde', { autoAlpha: 0, x: -10 });

    // timeline: encadena las animaciones en orden
    const luces = gsap.timeline({
      scrollTrigger: { trigger: '.tipos__lista', start: 'top 80%', once: true },
      defaults: { ease: 'power3.out' }
    });

    filas.forEach(function (fila, i) {
      const empieza = i * 0.18; // cada fila arranca un poco después de la anterior
      luces
        .to(fila, { '--trazo': 1, duration: 0.6, ease: 'power2.inOut' }, empieza)
        .to(fila.querySelector('.tipo__nombre'), { autoAlpha: 1, y: 0, duration: 0.6 }, empieza + 0.2)
        .to(fila.querySelector('.tipo__desde'), { autoAlpha: 1, x: 0, duration: 0.5 }, empieza + 0.35);
    });

    // Si la persona toca "Pausar movimiento" a mitad de la animación, todo salta al final
    document.querySelector('.franja__pausa')?.addEventListener('click', function () {
      if (document.documentElement.classList.contains('sin-movimiento')) luces.progress(1);
    });
  });
})();
