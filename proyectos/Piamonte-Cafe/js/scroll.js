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
      '.seccion h2, .cita-granos, .cita p, .historia > p, .menu-ayuda, .categorias, .galeria-intro, .galeria-fila li, .resenas-nota, .resenas-lista li, .ig-perfil, .instagram-fotos li, .cafe-ficha, .lista-experiencias li, .visitanos h2, .datos > div'
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

    /* ----- 2. Los pasos aparecen uno por uno y luego entran las fotos del proceso ----- */
    // Solo si hay pasos (están en la portada, no en menu.html).
    // Los colores de los pasos NO se animan aquí: los maneja main.js según la foto que estás viendo
    if (document.querySelector('.pasos')) {
      // timeline: encadena animaciones en orden
      gsap.timeline({ scrollTrigger: { trigger: '.proceso', start: 'top 85%', once: true } })
        .from('.pasos li', {
          autoAlpha: 0,
          y: 16,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.1,
        })
        .from('.proceso-fotos li', {
          autoAlpha: 0,
          x: 40, // Entran de lado: así se entiende que la fila se desliza
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'opacity,visibility,transform', // Al terminar, devuelve la opacidad al CSS (fotos suaves / activa)
        }, '-=0.25'); // Empieza 0,25 s antes de que termine lo anterior
    }

    /* ----- 3. La foto de la fachada se revela de abajo hacia arriba ----- */
    // inset(100% ...) = foto oculta; inset(0% ...) = foto completa
    // forEach: cada foto tiene su propio trigger y se revela cuando ELLA llega a la pantalla
    gsap.utils.toArray('.foto-fachada').forEach((foto) => {
      gsap.fromTo(foto,
        { clipPath: 'inset(100% 0% 0% 0% round 1.25rem)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: foto, start: 'top 85%', once: true },
        }
      );
    });

  });

  /* ----- 4. Parallax en la portada: el logo y la frase bajan más lento que la página ----- */
  // Solo en computador: ahí las fotos van al lado. En celular van DEBAJO del texto
  // y, si el texto bajara, se montaría sobre la foto de la finca
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 900px)', () => {
    // Se mueve el bloque completo para que el logo no se monte sobre la frase.
    // scrub: la animación sigue el scroll (si subes, se devuelve)
    // Solo en la portada (index.html): en menu.html no existe y GSAP avisaría en la consola
    if (document.querySelector('.portada')) gsap.to('.portada-centro', {
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
