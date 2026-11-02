// Formulario de contacto: arma un correo con los datos y abre la app de correo del visitante.
// Sin JavaScript, el formulario usa su action="mailto:" como respaldo.
const formulario = document.getElementById('form-contacto');
const estado = document.getElementById('estado-form');
const CORREO = 'estebanmunozssj@gmail.com';

if (formulario) {
  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const datos = new FormData(formulario);
    const nombre = datos.get('nombre').trim();
    const email = datos.get('email').trim();
    const mensaje = datos.get('mensaje').trim();

    if (!nombre || !mensaje) {
      estado.textContent = 'Escribe tu nombre y tu mensaje antes de enviarlo.';
      return;
    }

    const asunto = `Mensaje desde el portafolio: ${nombre}`;
    const cuerpo = `Nombre: ${nombre}\nCorreo: ${email}\n\n${mensaje}`;

    window.location.href =
      `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

    estado.textContent =
      `Tu mensaje está listo en tu app de correo; solo falta darle enviar. Si no se abrió, escríbeme a ${CORREO}.`;
  });
}

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
