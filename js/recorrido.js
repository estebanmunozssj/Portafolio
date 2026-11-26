'use strict';

/* ===== RECORRIDO: la iguanita baja por el borde derecho mientras haces scroll ===== */
/* Calcula cuánto has bajado (de 0 a 1) y se lo pasa al CSS en la variable --avance.
   Además avisa con clases: .visible (ya bajaste un poco), .subiendo (vas hacia arriba)
   y .caminando (estás haciendo scroll ahora mismo, para mover las patas). */

(() => {
  const recorrido = document.querySelector('.recorrido');
  if (!recorrido) return;

  let ultimaY = window.scrollY;
  let pendiente = false;
  let quieta; // temporizador para dejar de caminar

  const actualizar = () => {
    pendiente = false;
    const y = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const avance = total > 0 ? Math.min(1, Math.max(0, y / total)) : 0;

    recorrido.style.setProperty('--avance', avance.toFixed(4));
    recorrido.classList.toggle('visible', y > 80); // arriba del todo no se ve: no compite con el inicio

    if (y !== ultimaY) recorrido.classList.toggle('subiendo', y < ultimaY);
    ultimaY = y;

    // Camina mientras haya scroll; 150 ms después de parar, se queda quieta
    recorrido.classList.add('caminando');
    clearTimeout(quieta);
    quieta = setTimeout(() => recorrido.classList.remove('caminando'), 150);
  };

  // requestAnimationFrame: calcula como mucho una vez por cuadro, aunque el scroll dispare muchos eventos
  window.addEventListener('scroll', () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
  }, { passive: true });

  // Si cambia el tamaño de la pantalla (girar el celular), recalcula
  window.addEventListener('resize', actualizar, { passive: true });

  actualizar();
  recorrido.classList.remove('caminando');
})();
