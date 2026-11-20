'use strict';

/* =========================================================
   ANIMACIONES CON GSAP + ScrollTrigger (el inicio y la página de cada perfume)
   Igual que en Piamonte: si GSAP no carga, la página se ve normal, solo que sin efectos.
   Se cargan después de main.js, cuando "Elige por tipo" ya tiene sus precios.

   Un solo lenguaje para todo el inicio: "las luces de la vitrina se encienden".
   Pasa UNA sola vez por sección, cuando llega a la pantalla, y después todo queda quieto.
   ========================================================= */

(function () {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- La animación, escrita una vez y usada en varias secciones ---------- */
  // Por cada elemento de la lista, en orden:
  //   1. se dibuja la línea de arriba, de izquierda a derecha (como una luz que se prende)
  //   2. el título sube un poco y aparece
  //   3. el texto aparece (desde abajo, o desde la izquierda si desdeIzquierda es true)
  //   4. si tiene ícono, el ícono se dibuja solo, trazo por trazo, al mismo tiempo que la línea
  // Devuelve la línea de tiempo, para poder terminarla de golpe si la persona pausa el movimiento
  function encenderLuces(opciones) {
    const elementos = gsap.utils.toArray(opciones.elementos);
    if (!elementos.length) return null;

    const titulos = elementos.map(function (el) { return el.querySelector(opciones.titulo); }).filter(Boolean);
    const textos = elementos.map(function (el) { return el.querySelector(opciones.texto); }).filter(Boolean);
    const iconos = opciones.icono
      ? elementos.map(function (el) { return el.querySelector(opciones.icono); }).filter(Boolean)
      : [];
    iconos.forEach(prepararTrazo);
    const desplazamiento = opciones.desdeIzquierda ? { x: -10 } : { y: 12 };

    // Estado inicial (solo con GSAP: sin él, todo se ve completo desde el principio)
    gsap.set(elementos, { '--trazo': 0 });
    gsap.set(titulos, { autoAlpha: 0, y: 18 });
    gsap.set(textos, Object.assign({ autoAlpha: 0 }, desplazamiento));

    const luces = gsap.timeline({
      scrollTrigger: { trigger: opciones.contenedor, start: 'top 80%', once: true },
      defaults: { ease: 'power3.out' }
    });

    elementos.forEach(function (el, i) {
      const empieza = i * 0.18; // cada elemento arranca un poco después del anterior
      luces.to(el, { '--trazo': 1, duration: 0.6, ease: 'power2.inOut' }, empieza);
      const titulo = el.querySelector(opciones.titulo);
      const texto = el.querySelector(opciones.texto);
      if (titulo) luces.to(titulo, { autoAlpha: 1, y: 0, duration: 0.6 }, empieza + 0.2);
      if (texto) luces.to(texto, { autoAlpha: 1, x: 0, y: 0, duration: 0.5 }, empieza + 0.35);
      const icono = opciones.icono && el.querySelector(opciones.icono);
      if (icono) luces.to(icono.querySelectorAll('[data-largo]'), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', stagger: 0.08, clearProps: 'strokeDasharray,strokeDashoffset' }, empieza + 0.1);
    });
    return luces;
  }

  /* ---------- Íconos que se dibujan solos ----------
     Truco clásico de SVG: la línea de cada trazo se vuelve un "guion" tan largo como el trazo entero,
     y se corre hasta esconderlo (strokeDashoffset). Al devolverlo a 0, el trazo se va dibujando */
  function prepararTrazo(icono) {
    icono.querySelectorAll('path, rect, circle').forEach(function (trazo) {
      const largo = Math.ceil(trazo.getTotalLength());
      trazo.dataset.largo = largo;
      gsap.set(trazo, { strokeDasharray: largo, strokeDashoffset: largo });
    });
  }

  /* ---------- El kit que se abre ----------
     Los tres decants suben uno tras otro, como si salieran del estuche, y aparecen con un fundido.
     GSAP respeta la inclinación que les da el CSS a los de los lados */
  function abrirKit() {
    const decants = gsap.utils.toArray('.kit__trio img');
    if (!decants.length) return null;
    gsap.set(decants, { y: 28, autoAlpha: 0 });
    return gsap.timeline({ scrollTrigger: { trigger: '.kit__trio', start: 'top 80%', once: true } })
      .to(decants, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.16 });
  }

  /* ---------- La evolución del aroma (página del perfume) ----------
     Un perfume cambia en la piel: primero se sienten las notas de salida, después las de corazón
     y al final las de fondo. Una línea dorada baja por la pirámide y cada nota se enciende
     cuando la línea llega a ella */
  function evolucionDelAroma() {
    const piramide = document.querySelector('.ficha__piramide');
    if (!piramide) return null;
    const notas = gsap.utils.toArray(piramide.children);
    gsap.set(piramide, { '--recorrido': 0 });
    gsap.set(notas, { autoAlpha: 0.25 });
    const evolucion = gsap.timeline({ scrollTrigger: { trigger: piramide, start: 'top 75%', once: true } })
      .to(piramide, { '--recorrido': 1, duration: 1.8, ease: 'none' }, 0);
    notas.forEach(function (nota, i) {
      // cada nota se enciende cuando la línea pasa por su punto
      evolucion.to(nota, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, (i / notas.length) * 1.8 + 0.1);
    });
    return evolucion;
  }

  // Solo si la persona NO pidió "menos movimiento" en su teléfono
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    // Si tocó "Pausar movimiento" en la franja, tampoco se anima nada
    if (document.documentElement.classList.contains('sin-movimiento')) return;

    const animaciones = [
      // Lo que te prometemos
      encenderLuces({ contenedor: '.promesas__lista', elementos: '.promesa', titulo: '.promesa__nombre', texto: '.promesa__texto', icono: '.promesa__icono' }),
      // Elige por tipo (el precio "Desde" entra desde la izquierda, hacia el nombre)
      encenderLuces({ contenedor: '.tipos__lista', elementos: '.tipo', titulo: '.tipo__nombre', texto: '.tipo__desde', desdeIzquierda: true }),
      // Así pides: en computador los 4 pasos en fila parecen una sola línea que recorre el camino
      encenderLuces({ contenedor: '.pasos__lista', elementos: '.paso', titulo: '.paso__verbo', texto: '.paso__texto', icono: '.paso__icono' }),
      // El kit de decants
      abrirKit(),
      // Página del perfume: cómo cambia el aroma en la piel
      evolucionDelAroma()
    ].filter(Boolean);

    // Si la persona toca "Pausar movimiento" a mitad de una animación, todas saltan al final
    const pausa = document.querySelector('.franja__pausa');
    if (pausa) {
      pausa.addEventListener('click', function () {
        if (!document.documentElement.classList.contains('sin-movimiento')) return;
        animaciones.forEach(function (luces) { luces.progress(1); });
      });
    }
  });
})();
