'use strict';

/* ===== MENÚ HAMBURGUESA (celular) ===== */
/* El CSS mira aria-expanded del botón para abrir el menú y convertir las rayas en X.
   Este archivo solo cambia ese valor: al tocar el botón, al elegir un enlace o con la tecla Escape. */

(() => {
  const boton = document.querySelector('.menu-boton');
  const menu = document.getElementById('menu-principal');
  if (!boton || !menu) return;

  const abrirOCerrar = (abrir) => {
    boton.setAttribute('aria-expanded', String(abrir));
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  };

  // Tocar el botón: si está abierto lo cierra, si está cerrado lo abre
  boton.addEventListener('click', () => {
    abrirOCerrar(boton.getAttribute('aria-expanded') !== 'true');
  });

  // Elegir un enlace cierra el menú
  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) abrirOCerrar(false);
  });

  // Escape cierra el menú y devuelve el foco al botón (para quien usa teclado)
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
      abrirOCerrar(false);
      boton.focus();
    }
  });
})();
