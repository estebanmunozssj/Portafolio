// Analytics: cuenta cada clic en un botón de WhatsApp.
// En Google Analytics aparece como el evento "clic_whatsapp".
// "ubicacion" dice qué botón fue: inicio, servicios, contacto, pie de página o flotante.
document.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('a[href*="wa.me"]');
  if (!enlace || typeof gtag !== 'function') return;

  let ubicacion = 'otro';
  if (enlace.classList.contains('whatsapp-flotante')) ubicacion = 'flotante';
  else if (enlace.closest('footer')) ubicacion = 'pie-de-pagina';
  else if (enlace.closest('section')) ubicacion = enlace.closest('section').id;

  gtag('event', 'clic_whatsapp', { ubicacion: ubicacion });
});
