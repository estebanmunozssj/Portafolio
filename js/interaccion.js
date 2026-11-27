'use strict';

/* ===== INTERACCIÓN CON GSAP ===== */
/* GSAP 3.13 + ScrollTrigger se cargan desde cdnjs antes de este archivo (ver index.html).
   Si no cargan (sin internet, bloqueador), la página sigue funcionando: las cintas usan su
   animación de CSS, los números se ven completos y los botones quedan quietos.

   1. Cintas: corren solas y se aceleran con la velocidad del scroll. La de servicios va al revés.
   2. Contadores: las cifras de S. B. Privé suben desde 0 la primera vez que se ven.
   3. Botones magnéticos: los botones principales se acercan un poco al ratón (solo con ratón).
   4. Brillo: las tarjetas tienen una luz cian que sigue el ratón (solo con ratón). Este no usa GSAP.
   5. Menú digital: el menú de Piamonte se desplaza dentro del celular mientras bajas. */

(() => {
  const conRaton = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* --- 4. Brillo que sigue el ratón: dos variables CSS, el resto lo hace estilos.css --- */
  if (conRaton.matches) {
    document.querySelectorAll('.con-brillo').forEach((tarjeta) => {
      tarjeta.addEventListener('pointermove', (e) => {
        const caja = tarjeta.getBoundingClientRect();
        tarjeta.style.setProperty('--mx', `${e.clientX - caja.left}px`);
        tarjeta.style.setProperty('--my', `${e.clientY - caja.top}px`);
      }, { passive: true });
    });
  }

  if (!window.gsap || !window.ScrollTrigger) return; // Sin GSAP: se queda la versión de CSS
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-activo'); // apaga la animación CSS de las cintas

  const mm = gsap.matchMedia();

  /* --- 1. Cintas que reaccionan al scroll --- */
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const cintas = [...document.querySelectorAll('.cinta p')].map((texto) => {
      const alReves = texto.closest('.cinta').classList.contains('cinta-servicios');
      // El texto está repetido dos veces: mover -50 % y volver a empezar no se nota
      const vuelta = alReves
        ? gsap.fromTo(texto, { xPercent: -50 }, { xPercent: 0, duration: 34, ease: 'none', repeat: -1 })
        : gsap.to(texto, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      return vuelta;
    });

    // Al bajar rápido, las cintas corren más; al subir, giran hacia el otro lado. Luego vuelven a su ritmo.
    let direccion = 1;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const velocidad = self.getVelocity();
        direccion = self.direction;
        const empuje = 1 + Math.min(Math.abs(velocidad) / 300, 5);
        cintas.forEach((t) => {
          gsap.to(t, { timeScale: empuje * direccion, duration: 0.2, overwrite: true });
          gsap.to(t, { timeScale: direccion, duration: 1.2, delay: 0.25, ease: 'power2.out', overwrite: false });
        });
      },
    });

    // Al pasar el ratón por encima, la cinta frena para poder leerla
    document.querySelectorAll('.cinta').forEach((cinta, i) => {
      cinta.addEventListener('pointerenter', () => gsap.to(cintas[i], { timeScale: 0.15 * direccion, duration: 0.5, overwrite: true }));
      cinta.addEventListener('pointerleave', () => gsap.to(cintas[i], { timeScale: direccion, duration: 0.8, overwrite: true }));
    });

    return () => trigger.kill();
  });

  /* --- 2. Contadores de S. B. Privé --- */
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.logros strong').forEach((cifra) => {
      const final = parseInt(cifra.textContent, 10);
      if (!final || final < 10) return; // "1 mensaje" se queda como está
      const valor = { n: 0 };
      gsap.to(valor, {
        n: final,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: cifra, start: 'top 85%', once: true },
        onStart: () => { cifra.textContent = '0'; },
        onUpdate: () => { cifra.textContent = Math.round(valor.n); },
      });
    });
  });

  /* --- 5. El menú de Piamonte se desplaza dentro del celular mientras bajas --- */
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const pantalla = document.querySelector('.celular-pantalla');
    const img = pantalla && pantalla.querySelector('img');
    if (!img) return;
    const recorrer = () => -(img.offsetHeight - pantalla.clientHeight); // cuánto le sobra a la imagen
    gsap.fromTo(img, { y: 0 }, {
      y: () => recorrer(),
      ease: 'none',
      scrollTrigger: { trigger: '.celular', start: 'top 85%', end: 'bottom 15%', scrub: 0.6, invalidateOnRefresh: true },
    });
  });

  /* --- 3. Botones magnéticos (solo con ratón y sin movimiento reducido) --- */
  mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
    const botones = document.querySelectorAll('#inicio .acciones .btn, .acciones-caso .btn:first-child, .plan-principal .btn, #contacto .btn');
    const limpiar = [];
    botones.forEach((boton) => {
      const x = gsap.quickTo(boton, 'x', { duration: 0.4, ease: 'power3.out' });
      const y = gsap.quickTo(boton, 'y', { duration: 0.4, ease: 'power3.out' });
      const mover = (e) => {
        const caja = boton.getBoundingClientRect();
        x((e.clientX - (caja.left + caja.width / 2)) * 0.25);
        y((e.clientY - (caja.top + caja.height / 2)) * 0.35);
      };
      const soltar = () => { x(0); y(0); };
      boton.addEventListener('pointermove', mover);
      boton.addEventListener('pointerleave', soltar);
      limpiar.push(() => { boton.removeEventListener('pointermove', mover); boton.removeEventListener('pointerleave', soltar); gsap.set(boton, { x: 0, y: 0 }); });
    });
    return () => limpiar.forEach((f) => f());
  });
})();
