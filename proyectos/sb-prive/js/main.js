'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en la página
   Parte 1: selector de aroma, vitrina, tarjeta y WhatsApp.
   Los perfumes vienen de js/perfumes.js (la lista PERFUMES).
   ========================================================= */

// Número de WhatsApp del cliente: 57 (Colombia) + número, sin + ni espacios
const WHATSAPP = '57[NUMERO]';

// Convierte 350000 en "$350.000" (sin el espacio que pone el navegador después del $).
// Si un perfume no tiene precio en la lista, el cliente ve "Precio por WhatsApp", nunca "[PRECIO]"
const formatoPesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
function precioTexto(numero) {
  return numero == null ? 'Precio por WhatsApp' : formatoPesos.format(numero).replace(/\s/g, '');
}

// Arma el enlace de WhatsApp con el mensaje ya escrito
function enlaceWhatsApp(mensaje) {
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje);
}

// El mensaje para pedir un perfume, escrito en un solo lugar (lo usan la tarjeta y "Los más pedidos")
function enlacePedido(perfume) {
  return enlaceWhatsApp('Hola, quiero pedir ' + perfume.nombre + ' de ' + perfume.marca + ' (100 ml).');
}

/* ---------- Piezas de la página que vamos a cambiar ---------- */
const botonesAroma = document.querySelectorAll('.aroma');
const botonesFrasco = document.querySelectorAll('.frasco');
const tarjeta = {
  datos: document.querySelector('.tarjeta__datos'),
  nombre: document.querySelector('.tarjeta__nombre'),
  notas: document.querySelector('.tarjeta__notas'),
  precio: document.querySelector('.tarjeta__precio'),
  decant: document.querySelector('.tarjeta__decant'),
  boton: document.querySelector('.tarjeta .boton-whatsapp')
};

/* ---------- 1. Llenar la vitrina con los perfumes de la lista ---------- */
// Cada botón .frasco del HTML recibe un perfume. Si sobran botones, se esconden.
botonesFrasco.forEach(function (boton, i) {
  const perfume = PERFUMES[i];
  if (!perfume) {
    boton.hidden = true;
    return;
  }
  boton.dataset.id = perfume.id;
  boton.setAttribute('aria-label', perfume.nombre + ', ' + perfume.marca);
  const foto = boton.querySelector('img');
  // Si la foto no existe (nombre mal escrito, archivo sin subir), el frasco se esconde
  // en vez de mostrar el ícono de imagen rota
  foto.addEventListener('error', function () {
    boton.hidden = true;
    revisarVitrinaCorta(); // al esconderse un frasco puede que ya quepan todos en la vitrina corta
  });
  foto.src = perfume.imagen;
});

function buscarPerfume(id) {
  return PERFUMES.find(function (p) { return p.id === id; });
}

/* ---------- 2. Mostrar un perfume en la tarjeta ---------- */
function mostrarPerfume(perfume) {
  tarjeta.datos.textContent = perfume.marca + ' · 100 ml · ' + perfume.familia;
  tarjeta.nombre.textContent = perfume.nombre;
  tarjeta.notas.textContent = perfume.notas;
  // Si las notas son muy largas, el CSS las corta a 3 líneas. Al tocarlas se abren completas (ver sección 4)
  tarjeta.notas.classList.remove('tarjeta__notas--completas');
  tarjeta.precio.textContent = precioTexto(perfume.precio);
  tarjeta.decant.textContent = perfume.decant
    ? 'Decant ' + perfume.decant.ml + ' ml: ' + precioTexto(perfume.decant.precio)
    : '';
  tarjeta.boton.href = enlacePedido(perfume);

  // Marcar cuál frasco está elegido: crece y se ilumina (lo hace el CSS con .activo)
  botonesFrasco.forEach(function (boton) {
    const elegido = boton.dataset.id === perfume.id;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });
}

/* ---------- 3. Elegir un aroma ---------- */
// Los frascos de ese aroma se quedan encendidos y los demás se apagan un poco.
// La tarjeta muestra el primer perfume de ese aroma.
function elegirAroma(aroma) {
  botonesAroma.forEach(function (boton) {
    const elegido = boton.textContent.trim() === aroma;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });

  botonesFrasco.forEach(function (boton) {
    const perfume = buscarPerfume(boton.dataset.id);
    boton.classList.toggle('apagado', !!perfume && perfume.aroma !== aroma);
  });

  // El primero de ese aroma que se vea en la vitrina (si su foto falló, se salta)
  const primero = PERFUMES.find(function (p) {
    const boton = document.querySelector('.frasco[data-id="' + p.id + '"]');
    return p.aroma === aroma && boton && !boton.hidden;
  }) || PERFUMES.find(function (p) { return p.aroma === aroma; });
  if (primero) {
    mostrarPerfume(primero);
  }
}

/* ---------- 4. Escuchar los toques ---------- */
botonesAroma.forEach(function (boton) {
  boton.addEventListener('click', function () {
    elegirAroma(boton.textContent.trim());
  });
});

botonesFrasco.forEach(function (boton) {
  boton.addEventListener('click', function () {
    const perfume = buscarPerfume(boton.dataset.id);
    if (perfume) {
      mostrarPerfume(perfume);
    }
  });
});

// Notas cortadas: en el celular no hay mouse, así que al tocarlas se abren o se vuelven a cortar
tarjeta.notas.addEventListener('click', function () {
  tarjeta.notas.classList.toggle('tarjeta__notas--completas');
});

/* ---------- 5. Respuesta al tocar cualquier botón de WhatsApp ---------- */
// Por un momento dice "Abriendo WhatsApp…", para que la persona sepa que funcionó.
// Se escucha en toda la página (no enlace por enlace) para que también sirva
// en los botones que se crean después con JavaScript, como los de "Los más pedidos"
document.addEventListener('click', function (evento) {
  const enlace = evento.target.closest('a[href^="https://wa.me/"]');
  if (!enlace || enlace.dataset.abriendo) return;
  const textoOriginal = enlace.textContent;
  enlace.dataset.abriendo = 'si';
  enlace.textContent = 'Abriendo WhatsApp…';
  setTimeout(function () {
    enlace.textContent = textoOriginal;
    delete enlace.dataset.abriendo;
  }, 1600);
});

/* ---------- Aromas sin perfumes ---------- */
// Si en la lista no hay ningún perfume de un aroma (por ejemplo, ninguno "Fresco"),
// su botón se esconde: así nadie toca un aroma y ve un perfume de otro tipo
botonesAroma.forEach(function (boton) {
  const aroma = boton.textContent.trim();
  const hayPerfumes = PERFUMES.some(function (p) { return p.aroma === aroma; });
  boton.hidden = !hayPerfumes;
});

/* ---------- Al cargar: empieza con el aroma marcado en el HTML (o el primero que tenga perfumes) ---------- */
const aromaMarcado = document.querySelector('.aroma.activo:not([hidden])');
const primerAromaVisible = document.querySelector('.aroma:not([hidden])');
const aromaInicial = aromaMarcado || primerAromaVisible;
if (aromaInicial) {
  elegirAroma(aromaInicial.textContent.trim());
}

/* ---------- Pocos perfumes: vitrina corta ---------- */
// Con 6 frascos visibles o menos, las repisas de abajo quedarían vacías.
// La clase "armario--corto" hace que el CSS muestre solo el arco y las dos primeras repisas, también en computador.
// Es una función porque se vuelve a revisar cada vez que una foto falla y su frasco se esconde
function revisarVitrinaCorta() {
  const frascosVisibles = Array.prototype.filter.call(botonesFrasco, function (b) { return !b.hidden; }).length;
  document.querySelector('.armario').classList.toggle('armario--corto', frascosVisibles <= 6);
}
revisarVitrinaCorta();

/* =========================================================
   Parte 1b: secciones que salen de la lista de perfumes
   Así un precio se cambia en un solo lugar (js/perfumes.js)
   ========================================================= */

// Crea una etiqueta HTML con su clase y su texto (el texto nunca se interpreta como HTML)
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto != null) el.textContent = texto;
  return el;
}

// Qué tan fuerte se siente → largo de la barra (de 0 a 100)
const BARRA_INTENSIDAD = { 'Cerca de la piel': 30, 'Media': 55, 'Fuerte': 75, 'Muy fuerte': 95 };

/* ---------- 8. "Los más pedidos": una tarjeta por cada perfume con masPedido: true ---------- */
const pistaPedidos = document.querySelector('.pedidos__pista');
const masPedidos = PERFUMES.filter(function (p) { return p.masPedido; });

if (pistaPedidos && masPedidos.length) {
  pistaPedidos.textContent = ''; // quita las tarjetas de ejemplo del HTML

  masPedidos.forEach(function (p) {
    const tarjetaProducto = crear('article', 'producto');

    const vitrinaProducto = crear('div', 'producto__vitrina');
    vitrinaProducto.append(crear('span', 'producto__sello', 'Más pedido'));
    const foto = crear('img', 'producto__foto');
    foto.src = p.imagen;
    foto.alt = '';
    foto.width = 120;
    foto.height = 144;
    foto.loading = 'lazy';
    // Si la foto no carga, se quita (mejor fondo verde vacío que un ícono roto)
    foto.addEventListener('error', function () { foto.remove(); });
    vitrinaProducto.append(foto);

    const info = crear('div', 'producto__info');
    info.append(crear('p', 'producto__datos', p.marca + ' · 100 ml'));
    info.append(crear('h3', 'producto__nombre', p.nombre));

    // Si al perfume le falta un dato (pirámide, duración o intensidad), esa línea no se muestra.
    // Así un dato olvidado en perfumes.js no rompe el resto de la página
    const piramide = p.piramide || {};
    const filasNotas = [['Salida', piramide.salida], ['Corazón', piramide.corazon], ['Fondo', piramide.fondo]]
      .filter(function (par) { return par[1]; });
    if (filasNotas.length) {
      const notas = crear('dl', 'producto__notas');
      filasNotas.forEach(function (par) {
        notas.append(crear('dt', null, par[0]), crear('dd', null, par[1]));
      });
      info.append(notas);
    }

    const filasMedidas = [];
    if (typeof p.duracion === 'number' && p.duracion > 0) {
      filasMedidas.push(['Dura', p.duracion + ' h', Math.min(100, Math.round(p.duracion / 12 * 100))]);
    }
    if (BARRA_INTENSIDAD[p.intensidad]) {
      filasMedidas.push(['Se siente', p.intensidad, BARRA_INTENSIDAD[p.intensidad]]);
    }
    if (filasMedidas.length) {
      const medidas = crear('div', 'producto__medidas');
      filasMedidas.forEach(function (m) {
        const fila = crear('div', 'medida');
        fila.append(crear('span', null, m[0]), crear('span', null, m[1]));
        const barra = crear('div', 'barra');
        barra.setAttribute('aria-hidden', 'true');
        const relleno = crear('span', 'barra__relleno');
        relleno.style.width = m[2] + '%';
        barra.append(relleno);
        medidas.append(fila, barra);
      });
      info.append(medidas);
    }

    info.append(crear('p', 'producto__precio', precioTexto(p.precio)));
    const aviso = [];
    if (p.pocasPiezas) aviso.push('Pocas piezas');
    if (p.decant) aviso.push('También en decant de ' + p.decant.ml + ' ml');
    if (aviso.length) info.append(crear('p', 'producto__aviso', aviso.join(' · ')));

    const pedir = crear('a', 'boton-oscuro', 'Pedir este');
    pedir.href = enlacePedido(p);
    info.append(pedir);

    tarjetaProducto.append(vitrinaProducto, info);
    pistaPedidos.append(tarjetaProducto);
  });
}

/* ---------- 9. "Elige por tipo": el precio "desde" sale de la lista ---------- */
// Cada fila busca el precio más bajo de su tipo. La de Decants busca el decant más barato.
function precioMinimo(precios) {
  const conPrecio = precios.filter(function (n) { return n != null; });
  return conPrecio.length ? Math.min.apply(null, conPrecio) : null;
}

// Lo que dice el enlace (catalogo.html?tipo=arabes) → el tipo como está escrito en perfumes.js
const TIPOS = { arabes: 'Árabes', disenador: 'Diseñador', nicho: 'Nicho' };

document.querySelectorAll('.tipo').forEach(function (fila) {
  const desde = fila.querySelector('.tipo__desde');
  if (!desde) return;
  const href = fila.getAttribute('href') || '';
  let precios;
  if (href === '#kit') {
    // La fila de Decants: el decant más barato
    precios = PERFUMES.filter(function (p) { return p.decant; }).map(function (p) { return p.decant.precio; });
  } else {
    const tipo = TIPOS[new URL(href, location.href).searchParams.get('tipo')];
    if (!tipo) return; // fila nueva que no está en TIPOS: se deja el texto del HTML
    precios = PERFUMES.filter(function (p) { return p.tipo === tipo; }).map(function (p) { return p.precio; });
  }
  const minimo = precioMinimo(precios);
  desde.textContent = minimo == null ? 'Precio por WhatsApp' : 'Desde ' + precioTexto(minimo);
});

/* =========================================================
   Parte 2: menú del celular y carrusel de "Los más pedidos"
   ========================================================= */

/* ---------- 6. Abrir y cerrar el menú del celular ---------- */
const botonMenu = document.querySelector('.boton-menu');
const menu = document.getElementById('menu');
const iconoMenu = botonMenu.querySelector('path');
const RAYAS = 'M4 8h16M4 16h16';
const EQUIS = 'M6 6l12 12M18 6L6 18';

function ponerMenu(abierto) {
  menu.classList.toggle('abierto', abierto);
  botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  iconoMenu.setAttribute('d', abierto ? EQUIS : RAYAS);
}

botonMenu.addEventListener('click', function () {
  ponerMenu(!menu.classList.contains('abierto'));
});

// Se cierra al elegir una sección, al tocar fuera del menú o con la tecla Esc
menu.querySelectorAll('a').forEach(function (enlace) {
  enlace.addEventListener('click', function () { ponerMenu(false); });
});
document.addEventListener('click', function (evento) {
  if (menu.classList.contains('abierto') && !menu.contains(evento.target) && !botonMenu.contains(evento.target)) {
    ponerMenu(false);
  }
});
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && menu.classList.contains('abierto')) {
    ponerMenu(false);
    botonMenu.focus();
  }
});

/* ---------- 7. Carrusel de "Los más pedidos" ---------- */
// La ventana se desliza con el dedo; las flechas la mueven una tarjeta a la vez
// y el contador dice en cuál vas ("1 de 6")
const ventana = document.querySelector('.pedidos__ventana');
const tarjetasProducto = ventana ? ventana.querySelectorAll('.producto') : [];
const contador = document.querySelector('.pedidos__contador');
const flechas = document.querySelectorAll('.boton-flecha');

if (ventana && tarjetasProducto.length && flechas.length === 2) {
  const flechaAnterior = flechas[0];
  const flechaSiguiente = flechas[1];

  // Cuánto se mueve con cada flecha: el ancho de una tarjeta más el espacio entre ellas
  function paso() {
    const pista = ventana.querySelector('.pedidos__pista');
    const espacio = parseFloat(getComputedStyle(pista).columnGap) || 0;
    return tarjetasProducto[0].offsetWidth + espacio;
  }

  function actualizarCarrusel() {
    const total = tarjetasProducto.length;
    const actual = Math.min(total, Math.round(ventana.scrollLeft / paso()) + 1);
    contador.textContent = actual + ' de ' + total;
    flechaAnterior.disabled = ventana.scrollLeft <= 2;
    flechaSiguiente.disabled = ventana.scrollLeft + ventana.clientWidth >= ventana.scrollWidth - 2;
  }

  flechaAnterior.addEventListener('click', function () {
    ventana.scrollBy({ left: -paso(), behavior: 'smooth' });
  });
  flechaSiguiente.addEventListener('click', function () {
    ventana.scrollBy({ left: paso(), behavior: 'smooth' });
  });
  ventana.addEventListener('scroll', actualizarCarrusel, { passive: true });
  window.addEventListener('resize', actualizarCarrusel);
  actualizarCarrusel();
}
