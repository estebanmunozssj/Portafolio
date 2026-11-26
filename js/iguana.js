'use strict';

/* ===== IGUANA: la pupila sigue el dedo o el ratón ===== */
/* Solo mueve el grupo #pup unos pocos pasos dentro del ojo. El parpadeo va en el CSS. */

(() => {
  const iguana = document.getElementById('sv');
  const pupila = document.getElementById('pup');
  if (!iguana || !pupila) return;

  // Con movimiento reducido, la pupila se queda quieta
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX_X = 10; // cuánto se puede mover a los lados (en unidades del SVG)
  const MAX_Y = 3;  // y hacia arriba o abajo
  let pendiente = false;
  let ultimo = null;

  const mover = () => {
    pendiente = false;
    const caja = iguana.getBoundingClientRect();
    // El ojo está más o menos al 37 % del ancho y al 39 % del alto del dibujo
    const ojoX = caja.left + caja.width * 0.37;
    const ojoY = caja.top + caja.height * 0.39;
    const limitar = (n) => Math.max(-1, Math.min(1, n));
    const dx = limitar((ultimo.clientX - ojoX) / 250);
    const dy = limitar((ultimo.clientY - ojoY) / 250);
    pupila.setAttribute('transform', `translate(${dx * MAX_X} ${dy * MAX_Y})`);
  };

  // pointermove sirve para ratón y dedo; requestAnimationFrame evita calcular de más
  window.addEventListener('pointermove', (e) => {
    ultimo = e;
    if (!pendiente) { pendiente = true; requestAnimationFrame(mover); }
  }, { passive: true });
})();
