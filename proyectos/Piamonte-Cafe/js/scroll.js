'use strict';

/* =========================================================
   EFECTOS DE SCROLL con GSAP + ScrollTrigger
   - gsap.to(elemento, {...})       → anima desde como está AHORA hacia lo que le digas
   - gsap.from(elemento, {...})     → anima DESDE lo que le digas hacia como está ahora
   - scrollTrigger: {...}           → la animación empieza cuando el elemento llega a la pantalla
   - start: 'top 85%'               → "cuando la parte de arriba del elemento llegue al 85% de la pantalla"
   Si GSAP no carga (sin internet), la página se ve normal, solo que sin efectos
   ========================================================= */

(() => {
  if (!window.gsap || !window.ScrollTrigger) return; // Sin GSAP, no hacemos nada (todo queda visible)

  gsap.registerPlugin(ScrollTrigger); // Le decimos a GSAP que vamos a usar ScrollTrigger

  // matchMedia: estos efectos SOLO corren si la persona NO pidió "menos movimiento" en su celular
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    /* ----- 1. Títulos, textos y listas aparecen al llegar a ellos ----- */
    // Ojo: no animamos los botones con clase .boton porque ya tienen su propio efecto al tocarlos
    const aparecen = gsap.utils.toArray(
      '.seccion h2, .historia > p, .menu-ayuda, .categorias, .lista-experiencias li, .visitanos h2, .datos > div'
    );

    gsap.set(aparecen, { autoAlpha: 0, y: 28 }); // Empiezan invisibles y un poco más abajo

    // batch: agrupa los que entran a la pantalla al mismo tiempo y los anima uno tras otro
    ScrollTrigger.batch(aparecen, {
      start: 'top 88%',
      once: true, // Solo la primera vez: al volver a subir no se repite
      onEnter: (grupo) =>
        gsap.to(grupo, {
          autoAlpha: 1, // autoAlpha = opacidad + visibilidad (mejor que solo opacity)
          y: 0,
          duration: 0.8,
          ease: 'power3.out', // Arranca rápido y frena suave
          stagger: 0.08, // 80 ms entre cada uno
          overwrite: true,
        }),
    });

    /* ----- 2. Los 4 pasos aparecen y se "iluminan" uno por uno ----- */
    // timeline: una línea de tiempo para encadenar animaciones en orden
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
        backgroundColor: '#e6bd85', // Caramelo claro: el círculo se "enciende"
        borderColor: '#e6bd85',
        color: '#3b2418', // Número en café oscuro (se lee bien sobre el caramelo)
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.25, // Uno por uno: siembra → cosecha → tostión → tu taza
      }, '-=0.2'); // '-=0.2' = empieza 0,2 s antes de que termine lo anterior

    /* ----- 3. La foto de la finca se revela de abajo hacia arriba ----- */
    // clip-path "recorta" la foto: inset(100% ...) = todo recortado; inset(0% ...) = se ve toda
    gsap.fromTo('.foto-pendiente',
      { clipPath: 'inset(100% 0% 0% 0% round 1.25rem)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 1.25rem)',
        duration: 1.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.foto-pendiente', start: 'top 85%', once: true },
      }
    );

    /* ----- 4. Parallax en la portada: el logo y la frase bajan más lento que la página ----- */
    // Movemos el bloque completo (.portada-centro) para que el logo nunca se monte sobre la frase
    // scrub: true = la animación sigue tu dedo. Si subes, se devuelve
    gsap.to('.portada-centro', {
      y: 100, // Baja 100 px mientras la portada sale de la pantalla
      ease: 'none', // En efectos "pegados" al scroll se usa movimiento parejo
      scrollTrigger: {
        trigger: '.portada',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Cuando cargan las letras, las medidas de la página cambian: recalculamos las posiciones
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
