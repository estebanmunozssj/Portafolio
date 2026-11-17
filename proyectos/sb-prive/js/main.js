'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en el INICIO (index.html)
   Parte 1: selector de aroma, vitrina, tarjeta y WhatsApp.
   Los perfumes vienen de js/perfumes.js (la lista PERFUMES).
   El número de WhatsApp, los precios, el menú del celular y el aviso
   "Abriendo WhatsApp…" están en js/comun.js, porque los usan todas las páginas.
   ========================================================= */

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
// La barra fija de abajo empieza con un mensaje general ("quiero pedir un perfume").
// Cuando la persona elige un aroma o un frasco, la barra pide ese perfume,
// así el cliente no tiene que preguntarle "¿cuál?". Al cargar no se cambia: nadie ha elegido nada todavía
const barraWhatsApp = document.querySelector('.barra-whatsapp');
function barraConPerfume(perfume) {
  if (barraWhatsApp && perfume) {
    barraWhatsApp.href = enlacePedido(perfume);
  }
}

botonesAroma.forEach(function (boton) {
  boton.addEventListener('click', function () {
    elegirAroma(boton.textContent.trim());
    barraConPerfume(buscarPerfume(document.querySelector('.frasco.activo')?.dataset.id));
  });
});

botonesFrasco.forEach(function (boton) {
  boton.addEventListener('click', function () {
    const perfume = buscarPerfume(boton.dataset.id);
    if (perfume) {
      mostrarPerfume(perfume);
      barraConPerfume(perfume);
    }
  });
});

// Notas cortadas: en el celular no hay mouse, así que al tocarlas se abren o se vuelven a cortar
tarjeta.notas.addEventListener('click', function () {
  tarjeta.notas.classList.toggle('tarjeta__notas--completas');
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

// BARRA_INTENSIDAD (qué tan fuerte se siente → largo de la barra) está en js/comun.js

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

// TIPOS (data-tipo="arabes" → 'Árabes') está en js/comun.js
document.querySelectorAll('.tipo').forEach(function (fila) {
  const desde = fila.querySelector('.tipo__desde');
  if (!desde) return;
  let precios;
  if (fila.getAttribute('href') === '#kit') {
    // La fila de Decants: el decant más barato
    precios = PERFUMES.filter(function (p) { return p.decant; }).map(function (p) { return p.decant.precio; });
  } else {
    // Cada fila dice su tipo en data-tipo="arabes" (así no depende de a dónde lleve el enlace)
    const tipo = TIPOS[fila.dataset.tipo];
    if (!tipo) return; // fila nueva que no está en TIPOS: se deja el texto del HTML
    precios = PERFUMES.filter(function (p) { return p.tipo === tipo; }).map(function (p) { return p.precio; });
  }
  const minimo = precioMinimo(precios);
  desde.textContent = minimo == null ? 'Precio por WhatsApp' : 'Desde ' + precioTexto(minimo);
});

/* =========================================================
   Parte 2: carrusel de "Los más pedidos"
   (el menú del celular está en js/comun.js)
   ========================================================= */

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

  // Quien pidió "reducir movimiento" en su teléfono ve el salto directo, sin deslizamiento
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  function comoMoverse() {
    return sinMovimiento.matches ? 'auto' : 'smooth';
  }

  flechaAnterior.addEventListener('click', function () {
    ventana.scrollBy({ left: -paso(), behavior: comoMoverse() });
  });
  flechaSiguiente.addEventListener('click', function () {
    ventana.scrollBy({ left: paso(), behavior: comoMoverse() });
  });
  ventana.addEventListener('scroll', actualizarCarrusel, { passive: true });
  window.addEventListener('resize', actualizarCarrusel);
  actualizarCarrusel();
}
