'use strict';

/* =========================================================
   ENTRADA ELEGANTE (solo el inicio)
   Corre ANTES de que se dibuje la página (por eso se carga en el <head> sin defer),
   para decidir si se muestra la entrada animada. Solo la primera vez por visita, y nunca
   a quien pidió menos movimiento o pausó el movimiento. Si falla, la página se ve sin entrada.
   Antes estaba escrito dentro del HTML; vive aquí para que la política de seguridad (CSP)
   pueda bloquear todo el código escrito dentro de las páginas
   ========================================================= */
try {
  if (!sessionStorage.getItem('sbprive-entrada') &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      localStorage.getItem('sbprive-sin-movimiento') !== 'si') {
    document.documentElement.classList.add('con-entrada');
    sessionStorage.setItem('sbprive-entrada', 'vista');
  }
} catch (error) {}
