'use strict';

// Arma el QR del cartel con la dirección de fidelidad.html del mismo sitio donde se abrió el cartel
(() => {
  const campo = document.getElementById('direccion');
  const caja = document.getElementById('qr');
  const texto = document.getElementById('direccion-texto');

  // Este archivo está en /fidelizacion/: la tarjeta queda una carpeta arriba
  campo.value = new URL('../fidelidad.html', location.href).href;

  function dibujar() {
    const direccion = campo.value.trim();
    texto.textContent = direccion.replace(/^https?:\/\//, '');
    if (!window.qrcode) {
      caja.textContent = 'No cargó el generador de QR. Revisa el internet y recarga.';
      return;
    }
    // Nivel de corrección M: aguanta manchas o rayones pequeños en el cartel impreso
    const qr = qrcode(0, 'M');
    qr.addData(direccion);
    qr.make();
    caja.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  campo.addEventListener('input', dibujar);
  document.getElementById('imprimir').addEventListener('click', () => window.print());
  dibujar();
})();
