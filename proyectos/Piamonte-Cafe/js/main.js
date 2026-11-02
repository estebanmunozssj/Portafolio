'use strict'; // Modo estricto: el navegador avisa de errores que de otro modo pasarían callados

const NUMERO = ''; // 57 + número de Piamonte, sin + ni espacios (ej: '573001234567'). CONFIRMAR con tu amigo

/* =========================================================
   MENÚ: aquí cambias productos y precios
   - precio: número sin puntos (ej: 6500). Si es null se ve "Precio pronto"
   - recipiente: 'taza' (caliente), 'vaso' (frío), 'dulce' o 'salado'
   - capas: de abajo hacia arriba. [ingrediente, cuánto llena] (1 = llena todo)
   CONFIRMAR todos los precios y las recetas con tu amigo
   ========================================================= */

const MENU = [
  {
    categoria: 'Café',
    productos: [
      { nombre: 'Expreso', precio: null, detalle: 'Taza pequeña', recipiente: 'taza', capas: [['espresso', 0.4]] },
      { nombre: 'Americano', precio: null, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.3], ['agua', 0.55]] },
      { nombre: 'Capuchino', precio: null, detalle: 'Taza mediana', recipiente: 'taza', capas: [['espresso', 0.3], ['leche', 0.35], ['espuma', 0.25]] },
      { nombre: 'Mocca', precio: null, detalle: 'Taza mediana', recipiente: 'taza', capas: [['chocolate', 0.2], ['espresso', 0.25], ['leche', 0.3], ['espuma', 0.15]] },
      { nombre: 'Té chai', precio: null, detalle: 'Té especiado', recipiente: 'taza', capas: [['te', 0.5], ['leche', 0.3], ['espuma', 0.1]] },
    ],
  },
  {
    categoria: 'Fríos',
    productos: [
      { nombre: 'Limonada de café', precio: null, detalle: 'Vaso con hielo', recipiente: 'vaso', capas: [['limonada', 0.5], ['espresso', 0.3]] },
      { nombre: 'Lemonade Brew', precio: null, detalle: 'Cold brew afrutado', recipiente: 'vaso', capas: [['coldbrew', 0.45], ['limonada', 0.35]] },
      { nombre: 'Soda de tamarindo', precio: null, detalle: 'Soda artesanal', recipiente: 'vaso', capas: [['tamarindo', 0.4], ['soda', 0.4]] },
    ],
  },
  {
    categoria: 'Dulces',
    productos: [
      { nombre: 'Torta red velvet', precio: null, detalle: 'Porción', recipiente: 'dulce', color: '#9e2b2f' },
      { nombre: 'Torta de chocolate', precio: null, detalle: 'Porción', recipiente: 'dulce', color: '#4a2616' },
      { nombre: 'Cheesecake de limón', precio: null, detalle: 'Porción', recipiente: 'dulce', color: '#e9d77a' },
      { nombre: 'Mousse de café', precio: null, detalle: 'Porción', recipiente: 'dulce', color: '#a8774f' },
      { nombre: 'Torta de almojábana', precio: null, detalle: 'Porción', recipiente: 'dulce', color: '#e2b46a' },
    ],
  },
  {
    categoria: 'Salado',
    productos: [
      { nombre: 'Waffle de pollo', precio: null, detalle: 'Plato', recipiente: 'salado' },
      { nombre: 'Sándwich italiano', precio: null, detalle: 'Plato', recipiente: 'salado' },
    ],
  },
];

// Nombre y color de cada ingrediente (para el dibujo y la leyenda)
const INGREDIENTES = {
  espresso: { nombre: 'Espresso', color: '#2b170e' },
  agua: { nombre: 'Agua caliente', color: '#8a5634' },
  leche: { nombre: 'Leche', color: '#e8d7bd' },
  espuma: { nombre: 'Espuma', color: '#fbf6ee' },
  chocolate: { nombre: 'Chocolate', color: '#5a2c18' },
  te: { nombre: 'Té especiado', color: '#b9773f' },
  limonada: { nombre: 'Limonada', color: '#ecd977' },
  coldbrew: { nombre: 'Cold brew', color: '#4a2a17' },
  tamarindo: { nombre: 'Tamarindo', color: '#8b4a22' },
  soda: { nombre: 'Soda', color: '#f2e2c4' },
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

function dibujar(producto) {
  if (producto.recipiente === 'taza') return dibujoTaza(producto.capas);
  if (producto.recipiente === 'vaso') return dibujoVaso(producto.capas);
  if (producto.recipiente === 'dulce') return dibujoDulce(producto.color);
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
    nombre.textContent = producto.nombre;
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

    cajaProductos.innerHTML = ''; // Borra los productos de la categoría anterior
    grupo.productos.forEach((producto, i) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'producto';
      boton.innerHTML = `<span>${producto.nombre}</span><strong>${textoPrecio(producto.precio)}</strong>`;
      boton.addEventListener('click', () => mostrarProducto(producto, boton));
      cajaProductos.appendChild(boton);

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
    mostrarProducto(grupo.productos[i], cajaProductos.children[i]);
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
