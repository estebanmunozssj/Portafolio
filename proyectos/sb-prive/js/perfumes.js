'use strict';

/* =========================================================
   PERFUMES DE S. B. PRIVÉ
   Aquí se cambian nombres, precios y fotos. Todo lo demás de la página
   (vitrina, tarjeta y mensajes de WhatsApp) sale de esta lista.

   Cada perfume lleva:
   - id: nombre corto sin espacios ni tildes (ej: 'afnan-supremacy'). No se repite.
   - nombre y marca: como se muestran en la página.
   - aroma: 'Dulce', 'Fresco', 'Amaderado' o 'Intenso' (los botones de la vitrina).
   - familia: cómo lo describe la marca (ej: 'Eau de Parfum · Unisex').
   - notas: una frase corta sobre cómo huele.
   - precio: número sin puntos (ej: 350000 → se ve $350.000). null = "[PRECIO]".
   - decant: { ml: 10, precio: 45000 } o null si no hay decant.
   - imagen: foto del frasco sin fondo, en img/perfumes/.

   La vitrina muestra hasta 12 perfumes, en el orden de esta lista.
   OJO: los de abajo son de prueba. Se reemplazan con los datos reales del cliente.
   ========================================================= */

const PERFUMES = [
  { id: 'dulce-1', nombre: '[PERFUME DULCE 1]', marca: '[MARCA]', aroma: 'Dulce', familia: 'Eau de Parfum', notas: 'Vainilla, caramelo y ámbar. Cálido, para la noche.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'fresco-1', nombre: '[PERFUME FRESCO 1]', marca: '[MARCA]', aroma: 'Fresco', familia: 'Eau de Toilette', notas: 'Bergamota, limón y notas marinas. Limpio, para el día.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'amaderado-1', nombre: '[PERFUME AMADERADO 1]', marca: '[MARCA]', aroma: 'Amaderado', familia: 'Eau de Parfum', notas: 'Cedro, sándalo y vetiver. Sereno, para la oficina.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },

  { id: 'intenso-1', nombre: '[PERFUME INTENSO 1]', marca: '[MARCA]', aroma: 'Intenso', familia: 'Extrait de Parfum', notas: 'Oud, cuero y especias. Se queda en la piel horas.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'dulce-2', nombre: '[PERFUME DULCE 2]', marca: '[MARCA]', aroma: 'Dulce', familia: 'Eau de Parfum', notas: 'Pera, jazmín y haba tonka. Suave y envolvente.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'fresco-2', nombre: '[PERFUME FRESCO 2]', marca: '[MARCA]', aroma: 'Fresco', familia: 'Eau de Parfum', notas: 'Menta, lavanda y almizcle. Ligero, para el calor.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },

  { id: 'amaderado-2', nombre: '[PERFUME AMADERADO 2]', marca: '[MARCA]', aroma: 'Amaderado', familia: 'Eau de Parfum', notas: 'Iris, pimienta y madera seca. Elegante y discreto.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'intenso-2', nombre: '[PERFUME INTENSO 2]', marca: '[MARCA]', aroma: 'Intenso', familia: 'Parfum', notas: 'Azafrán, rosa y ámbar. Para eventos de noche.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'dulce-3', nombre: '[PERFUME DULCE 3]', marca: '[MARCA]', aroma: 'Dulce', familia: 'Eau de Parfum', notas: 'Cacao, café y vainilla. Goloso y cálido.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },

  { id: 'fresco-3', nombre: '[PERFUME FRESCO 3]', marca: '[MARCA]', aroma: 'Fresco', familia: 'Eau de Toilette', notas: 'Pomelo, jengibre y té verde. Para el día a día.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'amaderado-3', nombre: '[PERFUME AMADERADO 3]', marca: '[MARCA]', aroma: 'Amaderado', familia: 'Eau de Parfum', notas: 'Pachulí, cuero suave y musgo. Serio y cálido.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' },
  { id: 'intenso-3', nombre: '[PERFUME INTENSO 3]', marca: '[MARCA]', aroma: 'Intenso', familia: 'Extrait de Parfum', notas: 'Tabaco, ciruela y oud. Profundo, para el frío.', precio: null, decant: { ml: 10, precio: null }, imagen: 'img/perfumes/afnan-supremacy-collectors-edition.webp' }
];
