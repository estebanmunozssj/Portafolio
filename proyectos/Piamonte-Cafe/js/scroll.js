'use strict';

/* =========================================================
   EFECTOS DE SCROLL (GSAP + ScrollTrigger)
   start: 'top 85%' = cuando la parte de arriba del elemento llega al 85% de la pantalla.
   Si GSAP no carga, la página se ve normal, solo que sin efectos
   ========================================================= */

(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Solo si la persona NO pidió "menos movimiento" en su celular
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    /* ----- 1. Títulos, textos y listas aparecen al llegar a ellos ----- */
    // Los .boton no van aquí: ya tienen su propio efecto al tocarlos
    const aparecen = gsap.utils.toArray(
      '.seccion h2, .cita-granos, .cita p, .historia > p, .menu-ayuda, .categorias, .galeria-intro, .galeria-fila li, .lista-experiencias li, .visitanos h2, .datos > div'
    );

    gsap.set(aparecen, { autoAlpha: 0, y: 28 });

    // batch: anima en cascada los que entran a la pantalla al mismo tiempo
    ScrollTrigger.batch(aparecen, {
      start: 'top 88%',
      once: true,
      onEnter: (grupo) =>
        gsap.to(grupo, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          overwrite: true,
        }),
    });

    /* ----- 2. Los 4 pasos aparecen y se "iluminan" uno por uno ----- */
    // timeline: encadena animaciones en orden
    const pasos = gsap.timeline({
      scrollTrigger: { trigger: '.pasos', start: 'top 85%', once: true },
    });

    pasos
      .from('.pasos li', {
        autoAlpha: 0,
        y: 16,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.12,
      })
      .to('.pasos span', {
        backgroundColor: '#e6bd85',
        borderColor: '#e6bd85',
        color: '#3b2418',
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.25,
      }, '-=0.2'); // Empieza 0,2 s antes de que termine lo anterior

    /* ----- 3. La foto de la finca se revela de abajo hacia arriba ----- */
    // inset(100% ...) = foto oculta; inset(0% ...) = foto completa
    gsap.fromTo('.foto-historia',
      { clipPath: 'inset(100% 0% 0% 0% round 1.25rem)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.foto-historia', start: 'top 85%', once: true },
      }
    );

    /* ----- 4. Parallax en la portada: el logo y la frase bajan más lento que la página ----- */
    // Se mueve el bloque completo para que el logo no se monte sobre la frase.
    // scrub: la animación sigue el scroll (si subes, se devuelve)
    gsap.to('.portada-centro', {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.portada',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Las letras cambian las medidas al cargar: recalculamos las posiciones
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
