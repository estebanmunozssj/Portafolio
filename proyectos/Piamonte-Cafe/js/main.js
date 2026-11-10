'use strict'; // Modo estricto: el navegador avisa de errores que de otro modo pasarían callados

const NUMERO = '573026402521'; // WhatsApp de domicilios de Piamonte: 57 (Colombia) + 302 640 2521, sin + ni espacios

/* =========================================================
   MENÚ: aquí cambias productos y precios (sacado del menú oficial de Piamonte)
   - precio: número sin puntos (ej: 6500 → se ve $6.500). Si es null se ve "Precio pronto"
   - detalle: tamaño o ingredientes. Se muestra en la tarjeta grande
   - recipiente: 'taza' (caliente), 'vaso' (frío), 'dulce', 'salado' o 'bolsa' (café para llevar)
   - capas: de abajo hacia arriba. [ingrediente, cuánto llena] (1 = llena todo)
   - tipo (opcional): subgrupo con título dentro de la categoría (ej: 'Con leche')
   - bebidas: true en la categoría → la tarjeta de la taza se queda pegada arriba al bajar
   OJO: las capas son aproximadas. Se ajustan cuando tengamos el recetario
   ========================================================= */

// Capas que se repiten en varias bebidas (así no las escribimos muchas veces)
const CAPUCHINO = [['espresso', 0.3], ['leche', 0.35], ['espuma', 0.25]];
const MOCCACCINO = [['chocolate', 0.2], ['espresso', 0.25], ['leche', 0.3], ['espuma', 0.15]];
const AMERICANO = [['espresso', 0.3], ['agua', 0.55]];
const CHAI = [['te', 0.5], ['leche', 0.3], ['espuma', 0.1]];

const MENU = [
  {
    categoria: 'Calientes',
    bebidas: true, // La tarjeta con la taza se queda pegada arriba mientras bajas
    // tipo: el subgrupo donde aparece el producto (los productos del mismo tipo van seguidos)
    productos: [
      { tipo: 'Café negro', nombre: 'Espresso', precio: 4000, detalle: 'Taza pequeña', recipiente: 'taza', capas: [['espresso', 0.4]] },
      { tipo: 'Café negro', nombre: 'Americano', precio: 5000, detalle: 'Taza mediana', recipiente: 'taza', capas: AMERICANO },
      { tipo: 'Café negro', nombre: 'Americano grande', precio: 7000, detalle: 'Taza grande', recipiente: 'taza', capas: AMERICANO },
      { tipo: 'Café negro', nombre: 'Café campesino', precio: 8000, detalle: 'Receta de la casa', recipiente: 'taza', capas: [['casa', 0.85]] },
      { tipo: 'Café negro', nombre: 'Drips café Piamonte', precio: 5000, detalle: 'Café filtrado de la casa', recipiente: 'taza', capas: [['filtrado', 0.8]] },

      { tipo: 'Con leche', nombre: 'Capuchino', precio: 8000, detalle: 'Taza mediana', recipiente: 'taza', capas: CAPUCHINO },
      { tipo: 'Con leche', nombre: 'Capuchino grande', precio: 13000, detalle: 'Taza grande', recipiente: 'taza', capas: CAPUCHINO },
      { tipo: 'Con leche', nombre: 'Capuchino con leche de almendras', precio: 9000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.3], ['almendra', 0.35], ['espuma', 0.25]] },
      { tipo: 'Con leche', nombre: 'Capuchino con chantilly', precio: 10000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.3], ['leche', 0.35], ['chantilly', 0.25]] },
      { tipo: 'Con leche', nombre: 'Capuchino con esencias', precio: 10000, detalle: 'Con la esencia que prefieras', recipiente: 'taza', capas: CAPUCHINO },
      { tipo: 'Con leche', nombre: 'Flat white', precio: 8000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.35], ['leche', 0.5], ['espuma', 0.05]] },
      { tipo: 'Con leche', nombre: 'Latte', precio: 8000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.25], ['leche', 0.55], ['espuma', 0.1]] },
      { tipo: 'Con leche', nombre: 'Moccaccino', precio: 9000, detalle: 'Taza mediana', recipiente: 'taza', capas: MOCCACCINO },
      { tipo: 'Con leche', nombre: 'Moccaccino grande', precio: 14000, detalle: 'Taza grande', recipiente: 'taza', capas: MOCCACCINO },

      { tipo: 'Con licor', nombre: 'Espresso con licor', precio: 9000, detalle: 'Taza pequeña', recipiente: 'taza', capas: [['espresso', 0.35], ['licor', 0.15]] },
      { tipo: 'Con licor', nombre: 'Espresso doble licor', precio: 16000, detalle: 'Taza pequeña', recipiente: 'taza', capas: [['espresso', 0.35], ['licor', 0.3]] },
      { tipo: 'Con licor', nombre: 'Capuchino con licor', precio: 14000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.25], ['licor', 0.1], ['leche', 0.3], ['espuma', 0.25]] },

      { tipo: 'Sin café', nombre: 'Chocolate', precio: 8000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['chocolate', 0.85]] },
      { tipo: 'Sin café', nombre: 'Milo caliente', precio: 8000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['milo', 0.85]] },
      { tipo: 'Sin café', nombre: 'Té chai', precio: 9500, detalle: 'Té especiado con leche', recipiente: 'taza', capas: CHAI },
      { tipo: 'Sin café', nombre: 'Aromática', precio: 4000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['aromatica', 0.8]] },
      { tipo: 'Sin café', nombre: 'Aromática de frutas', precio: 6000, detalle: 'Taza mediana', recipiente: 'taza', capas: [['frutas', 0.8]] },
    ],
  },
  {
    categoria: 'Fríos',
    bebidas: true,
    productos: [
      { tipo: 'Con café', nombre: 'Granizado de café', precio: 13000, detalle: 'Vaso grande', recipiente: 'vaso', capas: [['granizado', 0.75]] },
      { tipo: 'Con café', nombre: 'Granizado de mocca', precio: 14000, detalle: 'Vaso grande', recipiente: 'vaso', capas: [['chocolate', 0.15], ['granizado', 0.6]] },
      { tipo: 'Con café', nombre: 'Malteada de café', precio: 15000, detalle: 'Vaso grande', recipiente: 'vaso', capas: [['malteada', 0.8]] },
      { tipo: 'Con café', nombre: 'Latte frío', precio: 12000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['leche', 0.55], ['espresso', 0.25]] },
      { tipo: 'Con café', nombre: 'Ice americano', precio: 9000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['aguafria', 0.5], ['espresso', 0.3]] },
      { tipo: 'Con café', nombre: 'Espresso tonic', precio: 9000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['tonica', 0.5], ['espresso', 0.3]] },
      { tipo: 'Con café', nombre: 'Limonada de café', precio: 11000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['limonada', 0.5], ['espresso', 0.3]] },
      { tipo: 'Con café', nombre: 'Tres notas café', precio: 12000, detalle: 'Receta de la casa', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { tipo: 'Con café', nombre: 'Passion coffee', precio: 13000, detalle: 'Receta de la casa', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { tipo: 'Con café', nombre: 'Affogato', precio: 13000, detalle: 'Helado con espresso', recipiente: 'taza', capas: [['helado', 0.5], ['espresso', 0.25]] },

      { tipo: 'Cremosos', nombre: 'Malteada de Baileys', precio: 17000, detalle: 'Vaso grande', recipiente: 'vaso', capas: [['baileys', 0.8]] },
      { tipo: 'Cremosos', nombre: 'Malteada de chocolate', precio: 15000, detalle: 'Vaso grande', recipiente: 'vaso', capas: [['chocolate', 0.8]] },
      { tipo: 'Cremosos', nombre: 'Té chai frío', precio: 12000, detalle: 'Con hielo', recipiente: 'vaso', capas: CHAI },
      { tipo: 'Cremosos', nombre: 'Milo frío', precio: 8000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['milo', 0.8]] },
      { tipo: 'Cremosos', nombre: 'Chocolate frío', precio: 8000, detalle: 'Con hielo', recipiente: 'vaso', capas: [['chocolate', 0.8]] },

      { tipo: 'Sodas y jugos', nombre: 'Soda de frutos rojos', precio: 13000, detalle: 'Soda artesanal', recipiente: 'vaso', capas: [['frutosrojos', 0.35], ['soda', 0.45]] },
      { tipo: 'Sodas y jugos', nombre: 'Soda de frutos amarillos', precio: 13000, detalle: 'Soda artesanal', recipiente: 'vaso', capas: [['frutosamarillos', 0.35], ['soda', 0.45]] },
      { tipo: 'Sodas y jugos', nombre: 'Soda de tamarindo', precio: 11000, detalle: 'Soda artesanal', recipiente: 'vaso', capas: [['tamarindo', 0.4], ['soda', 0.4]] },
      { tipo: 'Sodas y jugos', nombre: 'Soda de gulupa', precio: 11000, detalle: 'Soda artesanal', recipiente: 'vaso', capas: [['gulupa', 0.35], ['soda', 0.45]] },
      { tipo: 'Sodas y jugos', nombre: 'Jugo natural en agua', precio: 6000, detalle: 'Fruta del día', recipiente: 'vaso', capas: [['jugo', 0.8]] },
      { tipo: 'Sodas y jugos', nombre: 'Jugo natural en leche', precio: 8000, detalle: 'Fruta del día', recipiente: 'vaso', capas: [['jugoleche', 0.8]] },
    ],
  },
  {
    categoria: 'Cócteles',
    bebidas: true,
    productos: [
      { nombre: 'Limonada envenenada', precio: 16000, detalle: 'Con licor', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { nombre: 'Tres notas café vodka', precio: 18000, detalle: 'Con vodka', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { nombre: 'Mojito café', precio: 17000, detalle: 'Con licor', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { nombre: 'Orgasmo', precio: 19000, detalle: 'Con licor', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { nombre: 'Passion fruit', precio: 16000, detalle: 'Con licor', recipiente: 'vaso', capas: [['casa', 0.8]] },
      { nombre: 'Sprite cold brew', precio: 17000, detalle: 'Con licor', recipiente: 'vaso', capas: [['soda', 0.45], ['coldbrew', 0.35]] },
    ],
  },
  {
    categoria: 'Comida',
    productos: [
      { nombre: 'Waffle de pandebono + topping', precio: 11000, detalle: 'Queso crema, chocolate, arequipe o mermelada de fresa, mora o guayaba', recipiente: 'salado' },
      { nombre: 'Waffle de jamón y queso', precio: 15000, detalle: 'Tomate horneado, lechuga, jamón, queso mozzarella y salsa de la casa', recipiente: 'salado' },
      { nombre: 'Waffle de pollo', precio: 20000, detalle: 'Filete de pollo gratinado, tomate horneado, lechuga y salsa de la casa', recipiente: 'salado' },
      { nombre: 'Waffle hawaiano', precio: 16000, detalle: 'Kétchup, piña calada, tomate horneado, jamón y queso doble crema', recipiente: 'salado' },
      { nombre: 'Waffle con helado', precio: 16000, detalle: 'Waffle, 2 bolas de helado de vainilla y salsa de chocolate', recipiente: 'salado' },
      { nombre: 'Sándwich italiano', precio: 20000, detalle: 'Pan de especias, mozzarella, salsa de la casa, tomate cherry, rúgula, jamón serrano, chorizo vela y pepperoni', recipiente: 'salado' },
      { nombre: 'Sándwich de ropa vieja', precio: 18000, detalle: 'Pan de especias, mozzarella, salsa de la casa, tomate horneado, lechuga y carne desmechada', recipiente: 'salado' },
      { nombre: 'Sándwich de atún', precio: 15500, detalle: 'Pan tajado, atún en lomitos cremoso, tomate, lechuga y queso mozzarella', recipiente: 'salado' },
      { nombre: 'Luna serrana', precio: 14000, detalle: 'Croissant horneado con especias, jamón serrano, tomate cherry, albahaca, dip de pimentón y pepperoni', recipiente: 'salado' },
      { nombre: 'Tapa artesanal', precio: 8000, detalle: 'Tajada de pan a las finas hierbas, dip de pimentón y pepperoni', recipiente: 'salado' },
      { nombre: 'Tapa ibérica', precio: 9000, detalle: 'Pan a las finas hierbas, mermelada de frutos rojos, manzana, mozzarella, jamón serrano y miel', recipiente: 'salado' },
    ],
  },
  {
    categoria: 'Repostería',
    productos: [
      { nombre: 'Torta vasca', precio: 14000, detalle: 'Porción', recipiente: 'dulce', color: '#d9a85b' },
      { nombre: 'Torta de chocolate', precio: 10000, detalle: 'Porción', recipiente: 'dulce', color: '#4a2616' },
      { nombre: 'Torta de almojábana', precio: 8000, detalle: 'Porción', recipiente: 'dulce', color: '#e2b46a' },
      { nombre: 'Torta de zanahoria', precio: 7000, detalle: 'Porción', recipiente: 'dulce', color: '#c46a2b' },
      { nombre: 'Torta de banano', precio: 6000, detalle: 'Porción', recipiente: 'dulce', color: '#c9934f' },
      { nombre: 'Postre del día', precio: 9000, detalle: 'Pregunta cuál hay hoy', recipiente: 'dulce', color: '#a8774f' },
    ],
  },
  {
    categoria: 'Café de la finca',
    productos: [
      { nombre: 'Método V-60', precio: 14000, detalle: 'Café filtrado · 2 tazas', recipiente: 'taza', capas: [['filtrado', 0.8]] },
      { nombre: 'Café molido 250 g', precio: 25000, detalle: 'Para llevar a casa', recipiente: 'bolsa' },
      { nombre: 'Café en grano 250 g', precio: 25000, detalle: 'Tostado, para llevar a casa', recipiente: 'bolsa' },
      { nombre: 'Café molido 500 g', precio: 50000, detalle: 'Para llevar a casa', recipiente: 'bolsa' },
      { nombre: 'Café en grano 500 g', precio: 50000, detalle: 'Tostado, para llevar a casa', recipiente: 'bolsa' },
    ],
  },
];

// Nombre y color de cada ingrediente (para el dibujo y la leyenda)
const INGREDIENTES = {
  espresso: { nombre: 'Espresso', color: '#2b170e' },
  agua: { nombre: 'Agua caliente', color: '#8a5634' },
  aguafria: { nombre: 'Agua', color: '#9a6a45' },
  filtrado: { nombre: 'Café filtrado', color: '#5e3219' },
  leche: { nombre: 'Leche', color: '#e8d7bd' },
  almendra: { nombre: 'Leche de almendras', color: '#efe0c4' },
  espuma: { nombre: 'Espuma', color: '#fbf6ee' },
  chantilly: { nombre: 'Chantilly', color: '#fffdf7' },
  licor: { nombre: 'Licor', color: '#7a3b1f' },
  chocolate: { nombre: 'Chocolate', color: '#5a2c18' },
  milo: { nombre: 'Milo', color: '#6e4128' },
  te: { nombre: 'Té especiado', color: '#b9773f' },
  aromatica: { nombre: 'Aromática', color: '#c99a4e' },
  frutas: { nombre: 'Frutas', color: '#c7643a' },
  granizado: { nombre: 'Granizado de café', color: '#a87a58' },
  malteada: { nombre: 'Malteada de café', color: '#c49a74' },
  baileys: { nombre: 'Malteada de Baileys', color: '#d4b48e' },
  helado: { nombre: 'Helado de vainilla', color: '#f7edd8' },
  tonica: { nombre: 'Agua tónica', color: '#ece7d2' },
  limonada: { nombre: 'Limonada', color: '#ecd977' },
  coldbrew: { nombre: 'Cold brew', color: '#4a2a17' },
  tamarindo: { nombre: 'Tamarindo', color: '#8b4a22' },
  frutosrojos: { nombre: 'Frutos rojos', color: '#a8283c' },
  frutosamarillos: { nombre: 'Frutos amarillos', color: '#e7b13a' },
  gulupa: { nombre: 'Gulupa', color: '#6e2f5a' },
  soda: { nombre: 'Soda', color: '#f2e2c4' },
  jugo: { nombre: 'Jugo de fruta', color: '#e8973a' },
  jugoleche: { nombre: 'Jugo en leche', color: '#efc28f' },
  casa: { nombre: 'Receta de la casa', color: '#9c5a2e' }, // Para bebidas cuya receta aún no tenemos
};

/* =========================================================
   DIBUJOS (SVG): taza, vaso y platos al estilo Piamonte
   ========================================================= */

// Dibuja las capas de líquido de abajo hacia arriba dentro de un espacio
function dibujarCapas(capas, abajo, alto) {
  let y = abajo; // Empezamos desde el fondo
  return capas
    .map(([ingrediente, cuanto]) => {
      const h = alto * cuanto; // Alto de esta capa
      y -= h; // Subimos
      return `<rect x="0" y="${y}" width="160" height="${h + 0.5}" fill="${INGREDIENTES[ingrediente].color}"/>`;
    })
    .join('');
}

function dibujoTaza(capas) {
  return `
  <svg viewBox="0 0 160 140" class="dibujo" aria-hidden="true">
    <defs><clipPath id="dentro-taza"><path d="M35 44H117V78C117 100 101 113 76 113C51 113 35 100 35 78Z"/></clipPath></defs>
    <g class="vapor"><path d="M62 30c-6-6 6-10 0-18"/><path d="M78 32c-6-6 6-10 0-18"/><path d="M94 30c-6-6 6-10 0-18"/></g>
    <ellipse cx="78" cy="122" rx="64" ry="10" class="plato"/>
    <path d="M120 54c24 0 24 40-2 42" class="oreja"/>
    <path d="M30 39H122V78C122 105 103 118 76 118C49 118 30 105 30 78Z" class="ceramica"/>
    <g clip-path="url(#dentro-taza)"><g class="liquido">${dibujarCapas(capas, 113, 69)}</g></g>
    <path d="M30 39H122" class="borde"/>
  </svg>`;
}

function dibujoVaso(capas) {
  return `
  <svg viewBox="0 0 160 140" class="dibujo" aria-hidden="true">
    <defs><clipPath id="dentro-vaso"><path d="M49 16H111L104 124H56Z"/></clipPath></defs>
    <line x1="100" y1="2" x2="88" y2="112" class="pitillo"/>
    <g clip-path="url(#dentro-vaso)">
      <g class="liquido">${dibujarCapas(capas, 124, 108)}</g>
      <rect x="58" y="44" width="18" height="18" rx="3" transform="rotate(-12 67 53)" class="hielo"/>
      <rect x="80" y="54" width="17" height="17" rx="3" transform="rotate(10 88 62)" class="hielo"/>
      <rect x="64" y="70" width="16" height="16" rx="3" transform="rotate(6 72 78)" class="hielo"/>
    </g>
    <path d="M45 12H115L107 128H53Z" class="cristal"/>
  </svg>`;
}

function dibujoDulce(color) {
  return `
  <svg viewBox="0 0 160 140" class="dibujo" aria-hidden="true">
    <ellipse cx="80" cy="112" rx="66" ry="14" class="plato"/>
    <g class="liquido">
      <path d="M38 102L114 102L114 64L38 82Z" fill="${color}"/>
      <path d="M38 82L114 64L114 72L38 90Z" fill="#fbf6ee"/>
      <path d="M38 102L114 102L114 64L38 82Z" class="contorno"/>
      <circle cx="102" cy="58" r="6" fill="#9e2b2f"/>
    </g>
  </svg>`;
}

function dibujoSalado() {
  return `
  <svg viewBox="0 0 160 140" class="dibujo" aria-hidden="true">
    <ellipse cx="80" cy="112" rx="66" ry="14" class="plato"/>
    <g class="liquido">
      <rect x="40" y="62" width="80" height="42" rx="8" fill="#e2b46a" class="contorno"/>
      <path d="M60 62V104M80 62V104M100 62V104M40 76H120M40 90H120" stroke="#b9823f" stroke-width="3"/>
      <path d="M52 60c8-14 48-14 56 0" fill="#c8793e" class="contorno"/>
    </g>
  </svg>`;
}

function dibujoBolsa() {
  return `
  <svg viewBox="0 0 160 140" class="dibujo" aria-hidden="true">
    <g class="liquido">
      <path d="M50 30H110L116 126H44Z" fill="#c9a27a" class="contorno"/>
      <path d="M50 30L56 16H104L110 30" fill="#b58b62" class="contorno"/>
      <rect x="60" y="62" width="40" height="36" rx="6" fill="#f6efe4" class="contorno"/>
      <ellipse cx="80" cy="80" rx="8" ry="12" transform="rotate(25 80 80)" fill="#3b2418"/>
      <path d="M78 70c5 5-3 13 3 20" stroke="#f6efe4" stroke-width="2" fill="none"/>
    </g>
  </svg>`;
}

function dibujar(producto) {
  if (producto.recipiente === 'taza') return dibujoTaza(producto.capas);
  if (producto.recipiente === 'vaso') return dibujoVaso(producto.capas);
  if (producto.recipiente === 'dulce') return dibujoDulce(producto.color);
  if (producto.recipiente === 'bolsa') return dibujoBolsa();
  return dibujoSalado();
}

/* =========================================================
   LOGO ANIMADO DE LA PORTADA
   Espera a que carguen las letras (si no, el nombre se escribiría con otra letra
   y luego cambiaría). Si tardan más de 1,5 segundos, arranca igual
   ========================================================= */

(() => {
  const portada = document.getElementById('inicio');
  if (!portada) return;

  const arrancar = () => portada.classList.add('lista'); // La clase "lista" inicia la animación (ver CSS)
  const espera = new Promise((listo) => setTimeout(listo, 1500));
  const letras = document.fonts ? document.fonts.ready : espera;

  Promise.race([letras, espera]).then(arrancar);
})();

/* =========================================================
   MENÚ INTERACTIVO
   ========================================================= */

(() => {
  const cajaCategorias = document.getElementById('categorias');
  const cajaProductos = document.getElementById('productos');
  const dibujo = document.getElementById('destacado-dibujo');
  const nombre = document.getElementById('destacado-nombre');
  const precio = document.getElementById('destacado-precio');
  const capas = document.getElementById('destacado-capas');
  if (!cajaCategorias || !cajaProductos) return; // Si falta algo, no hace nada

  const textoPrecio = (p) => (p ? '$' + p.toLocaleString('es-CO') : 'Precio pronto'); // 6500 → $6.500

  // ¿La persona pidió menos movimiento en su celular? Entonces solo fundidos, sin desplazamientos
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textoDestacado = document.querySelector('.destacado-texto');

  function mostrarProducto(producto, boton) {
    dibujo.innerHTML = dibujar(producto); // Al cambiar el dibujo, la animación de llenado se repite

    // El texto aparece con un fundido corto y un poco de desenfoque, para que no "salte" de golpe
    if (textoDestacado && textoDestacado.animate) {
      textoDestacado.animate(
        menosMovimiento.matches
          ? [{ opacity: 0.4 }, { opacity: 1 }]
          : [{ opacity: 0.4, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0)' }],
        { duration: 200, easing: 'ease-out' }
      );
    }
    // Si el nombre termina en gramos (ej: "250 g"), la "g" va en minúscula aunque el título esté en mayúsculas
    nombre.innerHTML = producto.nombre.replace(/(\d+) g$/, '$1 <span class="unidad">g</span>');
    precio.innerHTML = `<strong>${textoPrecio(producto.precio)}</strong> · ${producto.detalle}`;

    // Leyenda con los ingredientes (de arriba hacia abajo, como se ven en la taza)
    capas.innerHTML = (producto.capas || [])
      .slice()
      .reverse()
      .map(([ing]) => `<li><span style="background:${INGREDIENTES[ing].color}"></span>${INGREDIENTES[ing].nombre}</li>`)
      .join('');

    cajaProductos.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
  }

  function mostrarCategoria(indice) {
    const grupo = MENU[indice];

    cajaCategorias.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === indice)));

    // La tarjeta grande solo se queda pegada arriba en las categorías de bebidas
    document.getElementById('destacado').classList.toggle('fijo', Boolean(grupo.bebidas));

    cajaProductos.innerHTML = ''; // Borra los productos de la categoría anterior
    const botones = []; // Guardamos los botones aparte (en la caja también hay subtítulos)
    let tipoAnterior = '';

    grupo.productos.forEach((producto, i) => {
      // Si el producto empieza un subgrupo nuevo, ponemos su subtítulo antes
      if (producto.tipo && producto.tipo !== tipoAnterior) {
        const subtitulo = document.createElement('h4');
        subtitulo.className = 'subgrupo';
        subtitulo.textContent = producto.tipo;
        cajaProductos.appendChild(subtitulo);
        tipoAnterior = producto.tipo;
      }

      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'producto';
      boton.innerHTML = `<span>${producto.nombre}</span><strong>${textoPrecio(producto.precio)}</strong>`;
      boton.addEventListener('click', () => {
        mostrarProducto(producto, boton);
        // Si la tarjeta no está pegada arriba (comida, repostería...), la traemos a la vista
        // para que la persona vea los ingredientes del producto que tocó
        if (!grupo.bebidas) {
          document.getElementById('destacado').scrollIntoView({
            behavior: menosMovimiento.matches ? 'auto' : 'smooth',
            block: 'nearest', // Solo se mueve si hace falta
          });
        }
      });
      cajaProductos.appendChild(boton);
      botones.push(boton);

      // Entran uno tras otro (40 ms entre cada uno). Se pueden tocar desde el primer momento
      if (boton.animate && !menosMovimiento.matches) {
        boton.animate(
          [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 250, delay: i * 40, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' }
        );
      }
    });

    // Muestra el capuchino al inicio; en otras categorías, el primer producto
    const inicial = grupo.productos.findIndex((p) => p.nombre === 'Capuchino');
    const i = inicial >= 0 ? inicial : 0;
    mostrarProducto(grupo.productos[i], botones[i]);

    // Cada categoría tiene distinta cantidad de productos, así que la página cambia de alto.
    // Le pedimos a GSAP (js/scroll.js) que vuelva a medir dónde empieza cada efecto de scroll.
    // Si no lo hacemos, secciones como "Visítanos" se pueden quedar sin aparecer
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  // Crea los botones de categorías
  MENU.forEach((grupo, i) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = grupo.categoria;
    boton.addEventListener('click', () => {
      mostrarCategoria(i);
      boton.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); // Centra el botón si estaba cortado
    });
    cajaCategorias.appendChild(boton);
  });

  mostrarCategoria(0); // Empieza en "Café"
})();

/* =========================================================
   ENCABEZADO: cambia de color al bajar y marca la sección actual
   ========================================================= */

(() => {
  const encabezado = document.getElementById('encabezado');
  const portada = document.getElementById('inicio');
  if (!encabezado || !portada) return;

  const enlaces = document.querySelectorAll('.nav-enlaces a');
  const secciones = ['historia', 'menu', 'experiencias', 'visitanos']
    .map((id) => document.getElementById(id))
    .filter(Boolean); // Quita las que no existan

  function revisar() {
    const y = window.scrollY; // Cuánto ha bajado la persona

    // Cuando la portada sale de la pantalla, el encabezado se vuelve crema
    // ">=" y "- 1": si llegas justo al borde (por ejemplo con el menú), también cuenta
    encabezado.classList.toggle('solido', y >= portada.offsetHeight - encabezado.offsetHeight - 1);

    // La sección actual es la última cuyo inicio ya pasó la mitad de la pantalla
    const mitad = y + window.innerHeight / 2;
    let actual = '';
    secciones.forEach((s) => { if (s.offsetTop <= mitad) actual = s.id; });

    // Subraya "Menú" o "Visítanos" si estás en esa sección
    enlaces.forEach((a) => a.classList.toggle('activo', a.dataset.seccion === actual));
  }

  window.addEventListener('scroll', revisar, { passive: true }); // passive: no hace lento el desplazamiento
  window.addEventListener('resize', revisar);
  revisar(); // Revisa una vez al cargar (por si la página abre a mitad)
})();

/* ===== BOTONES DE WHATSAPP ===== */
// Todos los enlaces con la clase "js-whatsapp" abren el chat con su mensaje (data-mensaje)

(() => {
  document.querySelectorAll('.js-whatsapp').forEach((enlace) => {
    if (!NUMERO) { // Mientras no tengamos el número, el botón lleva al Instagram
      enlace.href = 'https://www.instagram.com/piamonte.cafe/';
      return;
    }
    const mensaje = enlace.dataset.mensaje || 'Hola Piamonte';
    enlace.href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`; // encodeURIComponent convierte espacios y tildes para la URL
  });
})();

/* ===== AÑO DEL PIE DE PÁGINA ===== */

(() => {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear(); // Se actualiza solo cada año
})();
