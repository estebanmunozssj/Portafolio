'use strict';

/* =========================================================
   PERFUMES DE S. B. PRIVÉ
   Aquí se cambian nombres, precios y fotos. Todo lo demás de la página
   (vitrina, tarjeta, "Los más pedidos", "Elige por tipo" y los mensajes
   de WhatsApp) sale de esta lista.

   Cada perfume lleva:
   - id: nombre corto sin espacios ni tildes (ej: 'afnan-supremacy'). No se repite.
   - nombre y marca: como se muestran en la página.
   - tipo: 'Árabes', 'Diseñador' o 'Nicho' (las filas de "Elige por tipo").
   - aroma: 'Dulce', 'Fresco', 'Amaderado' o 'Intenso' (los botones de la vitrina).
   - familia: cómo lo describe la marca (ej: 'Eau de Parfum · Unisex').
   - notas: una frase corta sobre cómo huele (la tarjeta de la vitrina).
   - piramide: notas de salida, corazón y fondo (las tarjetas de "Los más pedidos").
   - duracion: horas que dura en la piel (ej: 8).
   - intensidad: 'Cerca de la piel', 'Media', 'Fuerte' o 'Muy fuerte'.
   - precio: número sin puntos (ej: 350000 → se ve $350.000). null = "Precio por WhatsApp".
   - decant: { ml: 10, precio: 45000 } o null si no hay decant.
   - masPedido: true si va en "Los más pedidos" (solo si de verdad es de los más pedidos).
   - pocasPiezas: true solo si de verdad quedan pocas unidades.
   - imagen: foto del frasco sin fondo, en img/perfumes/.

   Opcionales (si no están, esa parte de la página del perfume no se muestra):
   - descripcion: dos o tres frases sobre cómo huele y para quién es. Si falta, se usa "notas".
   - momentos: ['Noche', 'Oficina', 'Clima frío']
   - fotos: ['img/perfumes/x-1.webp', 'img/perfumes/x-2.webp'] (más de una foto; la primera es la principal)
   - decant5: { ml: 5, precio: 25000 } si también lo vende en 5 ml.
   - genero: 'hombre', 'mujer' o 'unisex' (para el filtro "Para" del catálogo).
   - color: el color de las partículas que salen del frasco en la vitrina (ej: '#2F5D9E').
     Si no se pone, se saca solo de la foto del frasco; si el frasco es plateado o transparente, sale perla.

   La vitrina del inicio muestra los 6 PRIMEROS perfumes de esta lista (dos repisas de 3).
   Conviene que entre esos 6 haya al menos uno de cada aroma (Dulce, Fresco, Amaderado, Intenso):
   si falta alguno, su botón no aparece en la vitrina. El catálogo muestra todos.
   Campos nuevos:
   - vitrina: foto del frasco SIN fondo (PNG) para las repisas del inicio. Solo los 6 primeros la necesitan;
     el catálogo y la ficha usan "imagen" (foto con fondo blanco).
   - ml: opcional, los mililitros del frasco (ej: 100). Si no está, la página dice solo "Frasco".
   - descripcion, notas, piramide, duracion, intensidad, momentos: opcionales. Si faltan, esa parte no se muestra.
   Fotos: una carpeta por marca en img/perfumes/ (ej: img/perfumes/lattafa/khamrah.jpg).
   ========================================================= */

// Decant que se ofrece en todos los perfumes (el proveedor los vende de todos).
// Si un día deja de haber decants, se cambia aquí por null y desaparecen de toda la página
const DECANT = { ml: 10, precio: null };

const PERFUMES = [
  { id: 'lattafa-bade-e-al-oud-sublime', nombre: 'Bade\'e Al Oud Sublime', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/bade-e-al-oud-sublime.jpg', vitrina: 'img/perfumes/vitrina/lattafa-bade-e-al-oud-sublime.png' },
  { id: 'creed-millesime-imperial', nombre: 'Millésime Impérial', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/millesime-imperial.jpg', vitrina: 'img/perfumes/vitrina/creed-millesime-imperial.png' },
  { id: 'bond-no-9-nomad', nombre: 'NoMad', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/nomad.jpg', vitrina: 'img/perfumes/vitrina/bond-no-9-nomad.png' },
  { id: 'lattafa-asad', nombre: 'Asad', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/asad.jpg', vitrina: 'img/perfumes/vitrina/lattafa-asad.png' },
  { id: 'versace-yellow-diamond', nombre: 'Yellow Diamond', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/yellow-diamond.jpg', vitrina: 'img/perfumes/vitrina/versace-yellow-diamond.png' },
  { id: 'borntostandout-angels-powder', nombre: 'Angels\' Powder', marca: 'Borntostandout', tipo: 'Nicho', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/borntostandout/angels-powder.jpg', vitrina: 'img/perfumes/vitrina/borntostandout-angels-powder.png' },
  { id: 'afnan-9-pm', nombre: '9 PM', marca: 'Afnan', tipo: 'Árabes', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/afnan/9-pm.jpg' },
  { id: 'ahli-ursa', nombre: 'Ursa', marca: 'Ahli', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ahli/ursa.jpg' },
  { id: 'al-haramain-amber-oud-bleu-edition', nombre: 'Amber Oud Bleu Edition', marca: 'Al Haramain', tipo: 'Árabes', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/al-haramain/amber-oud-bleu-edition.jpg' },
  { id: 'anarchy-no-rules', nombre: 'No Rules', marca: 'Anarchy', tipo: 'Árabes', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/anarchy/no-rules.jpg' },
  { id: 'anarchy-renegade', nombre: 'Renegade', marca: 'Anarchy', tipo: 'Árabes', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/anarchy/renegade.jpg' },
  { id: 'ariana-grande-god-is-a-woman', nombre: 'God Is a Woman', marca: 'Ariana Grande', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ariana-grande/god-is-a-woman.jpg' },
  { id: 'ariana-grande-mod-vanilla', nombre: 'MOD Vanilla', marca: 'Ariana Grande', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ariana-grande/mod-vanilla.jpg' },
  { id: 'ariana-grande-moonlight', nombre: 'Moonlight', marca: 'Ariana Grande', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ariana-grande/moonlight.jpg' },
  { id: 'ariana-grande-sweet-like-candy', nombre: 'Sweet Like Candy', marca: 'Ariana Grande', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ariana-grande/sweet-like-candy.jpg' },
  { id: 'ariana-grande-thank-u-next', nombre: 'Thank U, Next', marca: 'Ariana Grande', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ariana-grande/thank-u-next.jpg' },
  { id: 'armaf-club-de-nuit-intense-man', nombre: 'Club de Nuit Intense Man', marca: 'Armaf', tipo: 'Árabes', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/club-de-nuit-intense-man.jpg' },
  { id: 'armaf-club-de-nuit-milestone', nombre: 'Club de Nuit Milestone', marca: 'Armaf', tipo: 'Árabes', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/club-de-nuit-milestone.jpg' },
  { id: 'armaf-club-de-nuit-precieux-i', nombre: 'Club de Nuit Précieux I', marca: 'Armaf', tipo: 'Árabes', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/club-de-nuit-precieux-i.jpg' },
  { id: 'armaf-odyssey-mandarin-sky', nombre: 'Odyssey Mandarin Sky', marca: 'Armaf', tipo: 'Árabes', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/odyssey-mandarin-sky.jpg' },
  { id: 'armaf-odyssey-mandarin-sky-elixir', nombre: 'Odyssey Mandarin Sky Elixir', marca: 'Armaf', tipo: 'Árabes', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/odyssey-mandarin-sky-elixir.jpg' },
  { id: 'armaf-odyssey-spectra', nombre: 'Odyssey Spectra', marca: 'Armaf', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/odyssey-spectra.jpg', fotos: ['img/perfumes/armaf/odyssey-spectra.jpg', 'img/perfumes/armaf/odyssey-spectra-2.jpg'] },
  { id: 'armaf-yum-yum', nombre: 'Yum Yum', marca: 'Armaf', tipo: 'Árabes', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/armaf/yum-yum.jpg' },
  { id: 'atkinsons-mint-tonic', nombre: 'Mint & Tonic', marca: 'Atkinsons', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/atkinsons/mint-tonic.jpg' },
  { id: 'bharara-enigma', nombre: 'Enigma', marca: 'Bharara', tipo: 'Árabes', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bharara/enigma.jpg' },
  { id: 'bon-parfumeur-riviera-absolue-005', nombre: 'Riviera Absolue 005', marca: 'Bon Parfumeur', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bon-parfumeur/riviera-absolue-005.jpg' },
  { id: 'bond-no-9-beekman-place', nombre: 'Beekman Place', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/beekman-place.jpg' },
  { id: 'bond-no-9-bryant-park', nombre: 'Bryant Park', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/bryant-park.jpg' },
  { id: 'bond-no-9-chelsea-nights', nombre: 'Chelsea Nights', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/chelsea-nights.jpg' },
  { id: 'bond-no-9-dubai-gold', nombre: 'Dubai Gold', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/dubai-gold.jpg' },
  { id: 'bond-no-9-fidi', nombre: 'FiDi', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/fidi.jpg' },
  { id: 'bond-no-9-hamptons', nombre: 'Hamptons', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/hamptons.jpg' },
  { id: 'bond-no-9-off-broadway', nombre: 'Off-Broadway', marca: 'Bond No. 9', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bond-no-9/off-broadway.jpg' },
  { id: 'britney-spears-blissful-fantasy', nombre: 'Blissful Fantasy', marca: 'Britney Spears', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/britney-spears/blissful-fantasy.jpg' },
  { id: 'bvlgari-omnia-amethyste', nombre: 'Omnia Amethyste', marca: 'Bvlgari', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bvlgari/omnia-amethyste.jpg' },
  { id: 'bvlgari-omnia-coral', nombre: 'Omnia Coral', marca: 'Bvlgari', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/bvlgari/omnia-coral.jpg' },
  { id: 'calvin-klein-ck-in2u-her', nombre: 'CK IN2U Her', marca: 'Calvin Klein', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/calvin-klein/ck-in2u-her.jpg' },
  { id: 'calvin-klein-ck-in2u-him', nombre: 'CK IN2U Him', marca: 'Calvin Klein', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/calvin-klein/ck-in2u-him.jpg' },
  { id: 'calvin-klein-obsession-for-women', nombre: 'Obsession for Women', marca: 'Calvin Klein', tipo: 'Diseñador', aroma: 'Intenso', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/calvin-klein/obsession-for-women.jpg' },
  { id: 'creed-absolu-aventus', nombre: 'Absolu Aventus', marca: 'Creed', tipo: 'Nicho', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/absolu-aventus.jpg' },
  { id: 'creed-aventus', nombre: 'Aventus', marca: 'Creed', tipo: 'Nicho', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/aventus.jpg' },
  { id: 'creed-aventus-for-her', nombre: 'Aventus for Her', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/aventus-for-her.jpg' },
  { id: 'creed-carmina', nombre: 'Carmina', marca: 'Creed', tipo: 'Nicho', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/carmina.jpg' },
  { id: 'creed-centaurus', nombre: 'Centaurus', marca: 'Creed', tipo: 'Nicho', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/centaurus.jpg' },
  { id: 'creed-love-in-white', nombre: 'Love in White', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/love-in-white.jpg' },
  { id: 'creed-original-santal', nombre: 'Original Santal', marca: 'Creed', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/original-santal.jpg' },
  { id: 'creed-oud-zarian', nombre: 'Oud Zarian', marca: 'Creed', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/oud-zarian.jpg' },
  { id: 'creed-queen-of-wands', nombre: 'Queen of Wands', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/queen-of-wands.jpg' },
  { id: 'creed-silver-mountain-water', nombre: 'Silver Mountain Water', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/silver-mountain-water.jpg' },
  { id: 'creed-spring-flower', nombre: 'Spring Flower', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/spring-flower.jpg' },
  { id: 'creed-wind-flowers', nombre: 'Wind Flowers', marca: 'Creed', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/creed/wind-flowers.jpg' },
  { id: 'davidoff-cool-water', nombre: 'Cool Water', marca: 'Davidoff', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/davidoff/cool-water.jpg' },
  { id: 'dior-addict-eau-fraiche', nombre: 'Addict Eau Fraîche', marca: 'Dior', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/dior/addict-eau-fraiche.jpg' },
  { id: 'dior-fahrenheit', nombre: 'Fahrenheit', marca: 'Dior', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/dior/fahrenheit.jpg' },
  { id: 'dior-j-adore', nombre: 'J\'adore', marca: 'Dior', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/dior/j-adore.jpg' },
  { id: 'dior-miss-dior', nombre: 'Miss Dior', marca: 'Dior', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/dior/miss-dior.jpg', fotos: ['img/perfumes/dior/miss-dior.jpg', 'img/perfumes/dior/miss-dior-2.jpg'] },
  { id: 'dior-sauvage', nombre: 'Sauvage', marca: 'Dior', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/dior/sauvage.jpg', fotos: ['img/perfumes/dior/sauvage.jpg', 'img/perfumes/dior/sauvage-2.jpg'] },
  { id: 'elivi-beiroud', nombre: 'Beiroud', marca: 'Elivi', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/elivi/beiroud.jpg' },
  { id: 'elivi-ville-de-geneve', nombre: 'Ville de Genève', marca: 'Elivi', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/elivi/ville-de-geneve.jpg' },
  { id: 'elizabeth-arden-5th-avenue', nombre: '5th Avenue', marca: 'Elizabeth Arden', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/elizabeth-arden/5th-avenue.jpg' },
  { id: 'emir-stallion-53', nombre: 'Stallion 53', marca: 'Emir', tipo: 'Árabes', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/emir/stallion-53.jpg', fotos: ['img/perfumes/emir/stallion-53.jpg', 'img/perfumes/emir/stallion-53-2.jpg'] },
  { id: 'givenchy-gentleman-reserve-privee', nombre: 'Gentleman Réserve Privée', marca: 'Givenchy', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/givenchy/gentleman-reserve-privee.jpg' },
  { id: 'givenchy-gentleman-society', nombre: 'Gentleman Society', marca: 'Givenchy', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/givenchy/gentleman-society.jpg' },
  { id: 'hugo-boss-boss-in-motion', nombre: 'Boss in Motion', marca: 'Hugo Boss', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/hugo-boss/boss-in-motion.jpg' },
  { id: 'hugo-boss-hugo-xy', nombre: 'Hugo XY', marca: 'Hugo Boss', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/hugo-boss/hugo-xy.jpg' },
  { id: 'issey-miyake-l-eau-d-issey-pour-homme-set-de-regalo', nombre: 'L\'Eau d\'Issey pour Homme (set de regalo)', marca: 'Issey Miyake', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/issey-miyake/l-eau-d-issey-pour-homme-set-de-regalo.jpg' },
  { id: 'jean-paul-gaultier-gaultier-divine', nombre: 'Gaultier Divine', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/gaultier-divine.jpg', fotos: ['img/perfumes/jean-paul-gaultier/gaultier-divine.jpg', 'img/perfumes/jean-paul-gaultier/gaultier-divine-2.jpg'] },
  { id: 'jean-paul-gaultier-le-beau-le-parfum', nombre: 'Le Beau Le Parfum', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/le-beau-le-parfum.jpg' },
  { id: 'jean-paul-gaultier-le-beau-paradise-garden', nombre: 'Le Beau Paradise Garden', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/le-beau-paradise-garden.jpg' },
  { id: 'jean-paul-gaultier-le-male', nombre: 'Le Male', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/le-male.jpg' },
  { id: 'jean-paul-gaultier-le-male-le-parfum', nombre: 'Le Male Le Parfum', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/le-male-le-parfum.jpg' },
  { id: 'jean-paul-gaultier-scandal-absolu', nombre: 'Scandal Absolu', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/scandal-absolu.jpg' },
  { id: 'jean-paul-gaultier-scandal-intense', nombre: 'Scandal Intense', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Intenso', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/scandal-intense.jpg' },
  { id: 'jean-paul-gaultier-scandal-le-parfum', nombre: 'Scandal Le Parfum', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/scandal-le-parfum.jpg' },
  { id: 'jean-paul-gaultier-scandal-pour-homme-absolu', nombre: 'Scandal pour Homme Absolu', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/scandal-pour-homme-absolu.jpg' },
  { id: 'jean-paul-gaultier-scandal-pour-homme-le-parfum', nombre: 'Scandal pour Homme Le Parfum', marca: 'Jean Paul Gaultier', tipo: 'Diseñador', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jean-paul-gaultier/scandal-pour-homme-le-parfum.jpg' },
  { id: 'jimmy-choo-i-want-choo-forever', nombre: 'I Want Choo Forever', marca: 'Jimmy Choo', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jimmy-choo/i-want-choo-forever.jpg' },
  { id: 'jimmy-choo-man-intense', nombre: 'Man Intense', marca: 'Jimmy Choo', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jimmy-choo/man-intense.jpg' },
  { id: 'jimmy-choo-urban-hero-gold-edition', nombre: 'Urban Hero Gold Edition', marca: 'Jimmy Choo', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/jimmy-choo/urban-hero-gold-edition.jpg' },
  { id: 'kajal-topaz', nombre: 'Topaz', marca: 'Kajal', tipo: 'Nicho', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/kajal/topaz.jpg' },
  { id: 'katy-perry-meow', nombre: 'Meow', marca: 'Katy Perry', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/katy-perry/meow.jpg' },
  { id: 'king-of-kings-royal-crown', nombre: 'Royal Crown', marca: 'King of Kings', tipo: 'Árabes', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/king-of-kings/royal-crown.jpg' },
  { id: 'lacoste-essential', nombre: 'Essential', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/essential.jpg' },
  { id: 'lacoste-l-12-12-blanc', nombre: 'L.12.12 Blanc', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/l-12-12-blanc.jpg' },
  { id: 'lacoste-l-12-12-pour-elle-magnetic', nombre: 'L.12.12 pour Elle Magnetic', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/l-12-12-pour-elle-magnetic.jpg' },
  { id: 'lacoste-l-12-12-rose-eau-intense', nombre: 'L.12.12 Rose Eau Intense', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/l-12-12-rose-eau-intense.jpg' },
  { id: 'lacoste-original', nombre: 'Original', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/original.jpg' },
  { id: 'lacoste-red', nombre: 'Red', marca: 'Lacoste', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lacoste/red.jpg' },
  { id: 'lancome-la-vie-est-belle', nombre: 'La Vie Est Belle', marca: 'Lancôme', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lancome/la-vie-est-belle.jpg' },
  { id: 'lattafa-ajayeb-dubai', nombre: 'Ajayeb Dubai', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/ajayeb-dubai.jpg' },
  { id: 'lattafa-ajwad', nombre: 'Ajwad', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/ajwad.jpg' },
  { id: 'lattafa-ajwad-pink-to-pink', nombre: 'Ajwad Pink to Pink', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/ajwad-pink-to-pink.jpg' },
  { id: 'lattafa-asad-bourbon', nombre: 'Asad Bourbon', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Intenso', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/asad-bourbon.jpg' },
  { id: 'lattafa-bade-e-al-oud-amethyst', nombre: 'Bade\'e Al Oud Amethyst', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/bade-e-al-oud-amethyst.jpg' },
  { id: 'lattafa-bade-e-al-oud-for-glory', nombre: 'Bade\'e Al Oud for Glory', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/bade-e-al-oud-for-glory.jpg' },
  { id: 'lattafa-emeer', nombre: 'Emeer', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/emeer.jpg' },
  { id: 'lattafa-fakhar', nombre: 'Fakhar', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/fakhar.jpg' },
  { id: 'lattafa-fakhar-rose', nombre: 'Fakhar Rose', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/fakhar-rose.jpg' },
  { id: 'lattafa-gharam', nombre: 'Gharam', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/gharam.jpg' },
  { id: 'lattafa-khamrah', nombre: 'Khamrah', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/khamrah.jpg' },
  { id: 'lattafa-maahir-legacy', nombre: 'Maahir Legacy', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/maahir-legacy.jpg' },
  { id: 'lattafa-shaheen-gold', nombre: 'Shaheen Gold', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/shaheen-gold.jpg' },
  { id: 'lattafa-yara', nombre: 'Yara', marca: 'Lattafa', tipo: 'Árabes', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/lattafa/yara.jpg' },
  { id: 'le-falcone-al-majd', nombre: 'Al Majd', marca: 'Le Falcone', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/le-falcone/al-majd.jpg' },
  { id: 'le-falcone-mirsaal-love-letter', nombre: 'Mirsaal Love Letter', marca: 'Le Falcone', tipo: 'Árabes', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/le-falcone/mirsaal-love-letter.jpg' },
  { id: 'louis-vuitton-stellar-times', nombre: 'Stellar Times', marca: 'Louis Vuitton', tipo: 'Nicho', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/louis-vuitton/stellar-times.jpg' },
  { id: 'maison-alhambra-sceptre-malachite', nombre: 'Sceptre Malachite', marca: 'Maison Alhambra', tipo: 'Árabes', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/maison-alhambra/sceptre-malachite.jpg' },
  { id: 'mancera-amber-fever', nombre: 'Amber Fever', marca: 'Mancera', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/mancera/amber-fever.jpg' },
  { id: 'matiere-premiere-santal-austral', nombre: 'Santal Austral', marca: 'Matière Première', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/matiere-premiere/santal-austral.jpg' },
  { id: 'matiere-premiere-vanilla-powder', nombre: 'Vanilla Powder', marca: 'Matière Première', tipo: 'Nicho', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/matiere-premiere/vanilla-powder.jpg' },
  { id: 'michael-malul-ocean-noir', nombre: 'Ocean Noir', marca: 'Michael Malul', tipo: 'Nicho', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/michael-malul/ocean-noir.jpg' },
  { id: 'michael-malul-sangria-embers', nombre: 'Sangria+ Embers', marca: 'Michael Malul', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/michael-malul/sangria-embers.jpg', fotos: ['img/perfumes/michael-malul/sangria-embers.jpg', 'img/perfumes/michael-malul/sangria-embers-2.jpg'] },
  { id: 'michael-malul-sangria-saffron', nombre: 'Sangria+ Saffron', marca: 'Michael Malul', tipo: 'Nicho', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/michael-malul/sangria-saffron.jpg', fotos: ['img/perfumes/michael-malul/sangria-saffron.jpg', 'img/perfumes/michael-malul/sangria-saffron-2.jpg'] },
  { id: 'michael-malul-vanilla-creme', nombre: 'Vanilla+ Crème', marca: 'Michael Malul', tipo: 'Nicho', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/michael-malul/vanilla-creme.jpg', fotos: ['img/perfumes/michael-malul/vanilla-creme.jpg', 'img/perfumes/michael-malul/vanilla-creme-2.jpg'] },
  { id: 'montale-vanilla-cake', nombre: 'Vanilla Cake', marca: 'Montale', tipo: 'Nicho', aroma: 'Dulce', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/montale/vanilla-cake.jpg' },
  { id: 'montblanc-emblem', nombre: 'Emblem', marca: 'Montblanc', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/montblanc/emblem.jpg' },
  { id: 'moschino-cheap-chic-i-love-love', nombre: 'Cheap & Chic I Love Love', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/cheap-chic-i-love-love.jpg' },
  { id: 'moschino-fresh-couture-gold', nombre: 'Fresh Couture Gold', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/fresh-couture-gold.jpg' },
  { id: 'moschino-funny', nombre: 'Funny!', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/funny.jpg' },
  { id: 'moschino-toy-2', nombre: 'Toy 2', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-2.jpg' },
  { id: 'moschino-toy-2-bubble-gum', nombre: 'Toy 2 Bubble Gum', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-2-bubble-gum.jpg' },
  { id: 'moschino-toy-2-pearl', nombre: 'Toy 2 Pearl', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-2-pearl.jpg' },
  { id: 'moschino-toy-2-pearl-set-de-regalo', nombre: 'Toy 2 Pearl (set de regalo)', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-2-pearl-set-de-regalo.jpg' },
  { id: 'moschino-toy-boy', nombre: 'Toy Boy', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-boy.jpg' },
  { id: 'moschino-toy-boy-set-de-regalo', nombre: 'Toy Boy (set de regalo)', marca: 'Moschino', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/moschino/toy-boy-set-de-regalo.jpg' },
  { id: 'mural-de-ruitz-energetic-sport', nombre: 'Energetic Sport', marca: 'Mural de Ruitz', tipo: 'Árabes', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/mural-de-ruitz/energetic-sport.jpg' },
  { id: 'omanluxury-caden', nombre: 'Caden', marca: 'Omanluxury', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/omanluxury/caden.jpg' },
  { id: 'orientica-oud-saffron', nombre: 'Oud Saffron', marca: 'Orientica', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/orientica/oud-saffron.jpg' },
  { id: 'paco-rabanne-1-million-lucky', nombre: '1 Million Lucky', marca: 'Paco Rabanne', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/paco-rabanne/1-million-lucky.jpg' },
  { id: 'paco-rabanne-black-xs', nombre: 'Black XS', marca: 'Paco Rabanne', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/paco-rabanne/black-xs.jpg' },
  { id: 'parfums-de-marly-althair', nombre: 'Althaïr', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/althair.jpg' },
  { id: 'parfums-de-marly-delina', nombre: 'Delina', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/delina.jpg' },
  { id: 'parfums-de-marly-delina-exclusif', nombre: 'Delina Exclusif', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/delina-exclusif.jpg' },
  { id: 'parfums-de-marly-delina-la-rosee', nombre: 'Delina La Rosée', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/delina-la-rosee.jpg' },
  { id: 'parfums-de-marly-godolphin', nombre: 'Godolphin', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/godolphin.jpg' },
  { id: 'parfums-de-marly-kalan', nombre: 'Kalan', marca: 'Parfums de Marly', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/parfums-de-marly/kalan.jpg', fotos: ['img/perfumes/parfums-de-marly/kalan.jpg', 'img/perfumes/parfums-de-marly/kalan-2.jpg'] },
  { id: 'rayhaan-vantage', nombre: 'Vantage', marca: 'Rayhaan', tipo: 'Árabes', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/rayhaan/vantage.jpg' },
  { id: 'superz-abu-dhabi', nombre: 'Abu Dhabi', marca: 'Superz', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/abu-dhabi.jpg' },
  { id: 'superz-dominance', nombre: 'Dominance', marca: 'Superz', tipo: 'Nicho', aroma: 'Intenso', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/dominance.jpg' },
  { id: 'superz-flamingo-fizz', nombre: 'Flamingo Fizz', marca: 'Superz', tipo: 'Nicho', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/flamingo-fizz.jpg' },
  { id: 'superz-lake-balaton', nombre: 'Lake Balaton', marca: 'Superz', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/lake-balaton.jpg' },
  { id: 'superz-memories', nombre: 'Memories', marca: 'Superz', tipo: 'Nicho', aroma: 'Amaderado', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/memories.jpg' },
  { id: 'superz-tenerife', nombre: 'Tenerife', marca: 'Superz', tipo: 'Nicho', aroma: 'Fresco', genero: 'unisex', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/superz/tenerife.jpg' },
  { id: 'ted-lapidus-pour-homme', nombre: 'Pour Homme', marca: 'Ted Lapidus', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/ted-lapidus/pour-homme.jpg' },
  { id: 'tous-kids-boy', nombre: 'Kids Boy', marca: 'Tous', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/tous/kids-boy.jpg' },
  { id: 'tous-kids-girl', nombre: 'Kids Girl', marca: 'Tous', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/tous/kids-girl.jpg' },
  { id: 'valentino-born-in-roma-donna', nombre: 'Born in Roma Donna', marca: 'Valentino', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/valentino/born-in-roma-donna.jpg' },
  { id: 'versace-blue-jeans', nombre: 'Blue Jeans', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/blue-jeans.jpg' },
  { id: 'versace-crystal-noir', nombre: 'Crystal Noir', marca: 'Versace', tipo: 'Diseñador', aroma: 'Intenso', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/crystal-noir.jpg' },
  { id: 'versace-eros', nombre: 'Eros', marca: 'Versace', tipo: 'Diseñador', aroma: 'Dulce', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/eros.jpg' },
  { id: 'versace-eros-pour-femme-set-de-regalo', nombre: 'Eros pour Femme (set de regalo)', marca: 'Versace', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/eros-pour-femme-set-de-regalo.jpg' },
  { id: 'versace-man-eau-fraiche', nombre: 'Man Eau Fraîche', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/man-eau-fraiche.jpg' },
  { id: 'versace-pour-femme-dylan-blue', nombre: 'Pour Femme Dylan Blue', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/pour-femme-dylan-blue.jpg' },
  { id: 'versace-pour-femme-dylan-purple', nombre: 'Pour Femme Dylan Purple', marca: 'Versace', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/pour-femme-dylan-purple.jpg' },
  { id: 'versace-pour-homme', nombre: 'Pour Homme', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/pour-homme.jpg' },
  { id: 'versace-yellow-diamond-set-de-regalo', nombre: 'Yellow Diamond (set de regalo)', marca: 'Versace', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/versace/yellow-diamond-set-de-regalo.jpg' },
  { id: 'yves-saint-laurent-black-opium', nombre: 'Black Opium', marca: 'Yves Saint Laurent', tipo: 'Diseñador', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/yves-saint-laurent/black-opium.jpg' },
  { id: 'yves-saint-laurent-libre', nombre: 'Libre', marca: 'Yves Saint Laurent', tipo: 'Diseñador', aroma: 'Fresco', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/yves-saint-laurent/libre.jpg' },
  { id: 'yves-saint-laurent-myslf', nombre: 'MYSLF', marca: 'Yves Saint Laurent', tipo: 'Diseñador', aroma: 'Amaderado', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/yves-saint-laurent/myslf.jpg' },
  { id: 'yves-saint-laurent-y-eau-de-parfum', nombre: 'Y Eau de Parfum', marca: 'Yves Saint Laurent', tipo: 'Diseñador', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/yves-saint-laurent/y-eau-de-parfum.jpg' },
  { id: 'zakat-z10', nombre: 'Z10', marca: 'Zakat', tipo: 'Árabes', aroma: 'Dulce', genero: 'mujer', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/zakat/z10.jpg' },
  { id: 'zakat-z9', nombre: 'Z9', marca: 'Zakat', tipo: 'Árabes', aroma: 'Fresco', genero: 'hombre', precio: null, decant: DECANT, masPedido: false, imagen: 'img/perfumes/zakat/z9.jpg' }
];
