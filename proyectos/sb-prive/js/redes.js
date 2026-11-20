'use strict';

/* =========================================================
   REDES: INSTAGRAM Y TIKTOK (sección "Síguenos" del inicio)
   Mientras la lista esté vacía, la sección muestra marcos de ejemplo para ver cómo va a quedar.

   1. Los datos de la cuenta (los da el cliente):
      - usuario: el nombre en Instagram, sin @ (ej: 's.b.prive')
      - instagram y tiktok: la dirección completa de cada perfil
   2. Cada publicación que agregues aparece en la cuadrícula (se muestran las primeras 9):
      - imagen: la portada en img/redes/ (vertical 4:5, .avif o .webp, ~600 px de ancho)
      - enlace: opcional, la dirección de la publicación en Instagram. Sin enlace, lleva al perfil
      - tipo: 'reel' (lleva el ícono de reproducir) o 'foto'
      - video: opcional, solo para reels: el video en img/redes/ (.mp4 de ~540 × 960, liviano).
        Con video, al tocarlo se ve en la misma página, con sonido. El primero va más grande
      - texto: una frase corta de qué se ve (es el texto para quien no ve la imagen)

   Ejemplo:
   { imagen: 'img/redes/asad-reel.webp', enlace: 'https://www.instagram.com/reel/XXXX/', tipo: 'reel', texto: 'Asad de Lattafa en 15 segundos' },

   Las publicaciones son enlaces: al tocarlas se abre Instagram. La página no carga nada de Instagram
   (ni sus scripts ni sus cookies): por eso es rápida y la política de privacidad no cambia.
   ========================================================= */

const REDES = {
  usuario: 's.b.prive',
  instagram: 'https://www.instagram.com/s.b.prive/',
  tiktok: 'https://www.tiktok.com/@s.b.prive2'
};

const PUBLICACIONES = [
  { imagen: 'img/redes/secretos-perfume-portada.avif', video: 'img/redes/secretos-perfume.mp4', tipo: 'reel', texto: 'Tres secretos de perfume: si ya no hueles tu perfume, tu nariz te está engañando' },
  { imagen: 'img/redes/mancera-amber-fever.avif', tipo: 'foto', texto: 'Amber Fever de Mancera' },
  { imagen: 'img/redes/ysl-libre.avif', tipo: 'foto', texto: 'Libre de Yves Saint Laurent' },
  { imagen: 'img/redes/creed-wind-flowers.avif', tipo: 'foto', texto: 'Wind Flowers de Creed' },
  { imagen: 'img/redes/nicho-disenador-arabes.avif', tipo: 'foto', texto: 'Fragancias de nicho, de diseñador y árabes' },
  { imagen: 'img/redes/dior-addict.avif', tipo: 'foto', texto: 'Dior Addict' },
  { imagen: 'img/redes/louis-vuitton-fantasmagory.avif', tipo: 'foto', texto: 'Fantasmagory de Louis Vuitton' },
  { imagen: 'img/redes/moschino-toy-2.avif', tipo: 'foto', texto: 'Moschino Toy 2 Gummy y Toy 2 Yummy' },
  { imagen: 'img/redes/armaf-odyssey.avif', tipo: 'foto', texto: 'Odyssey de Armaf: Candee, Marshmallow y Dubai Chocolat' },
];
