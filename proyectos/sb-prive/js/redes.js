'use strict';

/* =========================================================
   REDES: INSTAGRAM Y TIKTOK (sección "Síguenos" del inicio)
   Mientras la lista esté vacía, la sección muestra marcos de ejemplo para ver cómo va a quedar.

   1. Los datos de la cuenta (los da el cliente):
      - usuario: el nombre en Instagram, sin @ (ej: 'sbprive')
      - instagram y tiktok: la dirección completa de cada perfil
   2. Cada publicación que agregues aparece en la cuadrícula:
      - imagen: la portada en img/redes/ (vertical 4:5, de preferencia .webp, ~600 px de ancho)
      - enlace: la dirección del reel o la publicación en Instagram (o del video en TikTok)
      - tipo: 'reel' (lleva el ícono de reproducir) o 'foto'
      - texto: una frase corta de qué se ve (es el texto para quien no ve la imagen)

   Ejemplo:
   { imagen: 'img/redes/asad-reel.webp', enlace: 'https://www.instagram.com/reel/XXXX/', tipo: 'reel', texto: 'Asad de Lattafa en 15 segundos' },

   Las publicaciones son enlaces: al tocarlas se abre Instagram. La página no carga nada de Instagram
   (ni sus scripts ni sus cookies): por eso es rápida y la política de privacidad no cambia.
   ========================================================= */

const REDES = {
  usuario: 'sbprive',
  instagram: 'https://www.instagram.com/sbprive/',
  tiktok: 'https://www.tiktok.com/@sbprive'
};

const PUBLICACIONES = [
  // Aquí van las publicaciones reales del cliente
];
