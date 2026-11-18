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

   La vitrina del inicio muestra los 6 PRIMEROS perfumes de esta lista (dos repisas de 3).
   Conviene que entre esos 6 haya al menos uno de cada aroma (Dulce, Fresco, Amaderado, Intenso):
   si falta alguno, su botón no aparece en la vitrina. El catálogo muestra todos.
   OJO: los de abajo son de prueba. Se reemplazan con los datos reales del cliente.
   ========================================================= */

const FOTO_PRUEBA = 'img/perfumes/afnan-supremacy-collectors-edition.webp';

const PERFUMES = [
  {
    id: 'dulce-1', nombre: '[PERFUME DULCE 1]', marca: '[MARCA]', tipo: 'Árabes', aroma: 'Dulce',
    familia: 'Eau de Parfum', notas: 'Vainilla, caramelo y ámbar. Cálido, para la noche.',
    piramide: { salida: 'Bergamota, pimienta', corazon: 'Vainilla, caramelo', fondo: 'Ámbar, almizcle' },
    duracion: 8, intensidad: 'Fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: true, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'fresco-1', nombre: '[PERFUME FRESCO 1]', marca: '[MARCA]', tipo: 'Diseñador', aroma: 'Fresco',
    familia: 'Eau de Toilette', notas: 'Bergamota, limón y notas marinas. Limpio, para el día.',
    piramide: { salida: 'Limón, menta', corazon: 'Notas marinas', fondo: 'Almizcle, cedro' },
    duracion: 5, intensidad: 'Cerca de la piel', precio: null, decant: { ml: 10, precio: null },
    masPedido: true, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'amaderado-1', nombre: '[PERFUME AMADERADO 1]', marca: '[MARCA]', tipo: 'Nicho', aroma: 'Amaderado',
    familia: 'Eau de Parfum', notas: 'Cedro, sándalo y vetiver. Sereno, para la oficina.',
    piramide: { salida: 'Pomelo, jengibre', corazon: 'Iris, pimienta', fondo: 'Vetiver, cedro' },
    duracion: 7, intensidad: 'Media', precio: null, decant: { ml: 10, precio: null },
    masPedido: true, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'intenso-1', nombre: '[PERFUME INTENSO 1]', marca: '[MARCA]', tipo: 'Árabes', aroma: 'Intenso',
    familia: 'Extrait de Parfum', notas: 'Oud, cuero y especias. Se queda en la piel horas.',
    piramide: { salida: 'Cardamomo, azafrán', corazon: 'Rosa, oud', fondo: 'Cuero, ámbar' },
    duracion: 10, intensidad: 'Muy fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: true, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'dulce-2', nombre: '[PERFUME DULCE 2]', marca: '[MARCA]', tipo: 'Diseñador', aroma: 'Dulce',
    familia: 'Eau de Parfum', notas: 'Pera, jazmín y haba tonka. Suave y envolvente.',
    piramide: { salida: 'Pera, mandarina', corazon: 'Jazmín, vainilla', fondo: 'Haba tonka, sándalo' },
    duracion: 7, intensidad: 'Media', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'fresco-2', nombre: '[PERFUME FRESCO 2]', marca: '[MARCA]', tipo: 'Árabes', aroma: 'Fresco',
    familia: 'Eau de Parfum', notas: 'Menta, lavanda y almizcle. Ligero, para el calor.',
    piramide: { salida: 'Menta, lima', corazon: 'Lavanda', fondo: 'Almizcle blanco' },
    duracion: 6, intensidad: 'Media', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'amaderado-2', nombre: '[PERFUME AMADERADO 2]', marca: '[MARCA]', tipo: 'Diseñador', aroma: 'Amaderado',
    familia: 'Eau de Parfum', notas: 'Iris, pimienta y madera seca. Elegante y discreto.',
    piramide: { salida: 'Pimienta rosa', corazon: 'Iris', fondo: 'Madera seca, pachulí' },
    duracion: 8, intensidad: 'Media', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'intenso-2', nombre: '[PERFUME INTENSO 2]', marca: '[MARCA]', tipo: 'Nicho', aroma: 'Intenso',
    familia: 'Parfum', notas: 'Azafrán, rosa y ámbar. Para eventos de noche.',
    piramide: { salida: 'Azafrán', corazon: 'Rosa, oud', fondo: 'Ámbar, cuero' },
    duracion: 12, intensidad: 'Muy fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'dulce-3', nombre: '[PERFUME DULCE 3]', marca: '[MARCA]', tipo: 'Nicho', aroma: 'Dulce',
    familia: 'Eau de Parfum', notas: 'Cacao, café y vainilla. Goloso y cálido.',
    piramide: { salida: 'Café', corazon: 'Cacao, canela', fondo: 'Vainilla, ámbar' },
    duracion: 9, intensidad: 'Fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'fresco-3', nombre: '[PERFUME FRESCO 3]', marca: '[MARCA]', tipo: 'Diseñador', aroma: 'Fresco',
    familia: 'Eau de Toilette', notas: 'Pomelo, jengibre y té verde. Para el día a día.',
    piramide: { salida: 'Pomelo, jengibre', corazon: 'Té verde', fondo: 'Cedro' },
    duracion: 5, intensidad: 'Cerca de la piel', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'amaderado-3', nombre: '[PERFUME AMADERADO 3]', marca: '[MARCA]', tipo: 'Árabes', aroma: 'Amaderado',
    familia: 'Eau de Parfum', notas: 'Pachulí, cuero suave y musgo. Serio y cálido.',
    piramide: { salida: 'Bergamota', corazon: 'Cuero suave', fondo: 'Pachulí, musgo' },
    duracion: 9, intensidad: 'Fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  },
  {
    id: 'intenso-3', nombre: '[PERFUME INTENSO 3]', marca: '[MARCA]', tipo: 'Nicho', aroma: 'Intenso',
    familia: 'Extrait de Parfum', notas: 'Tabaco, ciruela y oud. Profundo, para el frío.',
    piramide: { salida: 'Ciruela', corazon: 'Tabaco', fondo: 'Oud, vainilla' },
    duracion: 11, intensidad: 'Muy fuerte', precio: null, decant: { ml: 10, precio: null },
    masPedido: false, pocasPiezas: false, imagen: FOTO_PRUEBA
  }
];
