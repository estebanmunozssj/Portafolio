'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en el INICIO (index.html)
   Parte 1: selector de aroma, vitrina, tarjeta y WhatsApp.
   Los perfumes vienen de js/perfumes.js (la lista PERFUMES).
   El número de WhatsApp, los precios, el menú del celular y el aviso
   "Abriendo WhatsApp…" están en js/comun.js, porque los usan todas las páginas.
   ========================================================= */

/* ---------- Entrada elegante: tocarla (o Esc) la salta ---------- */
// La entrada se va sola con CSS; esto solo la adelanta para quien no quiere esperar
// "entrada-saltada" en <html> quita la entrada y también la subida de la vitrina y del título
const entrada = document.querySelector('.entrada');
if (entrada) {
  const raiz = document.documentElement;
  // Mientras dura la entrada (2,1 s) no se puede hacer scroll: así, al abrirse las puertas, la página está arriba
  const soltarScroll = function () { raiz.classList.remove('entrada-quieta'); };
  if (raiz.classList.contains('con-entrada')) {
    raiz.classList.add('entrada-quieta');
    setTimeout(soltarScroll, 2100);
  }
  const saltarEntrada = function () {
    raiz.classList.add('entrada-saltada');
    soltarScroll();
  };
  entrada.addEventListener('click', saltarEntrada);
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') saltarEntrada();
  }, { once: true });
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
  // El decant de 10 ml o, si no hay, el de 5 ml (tamanoDecant y datosTamano están en js/comun.js)
  const decant = datosTamano(perfume, tamanoDecant(perfume));
  tarjeta.decant.textContent = decant ? decant.texto + ': ' + precioTexto(decant.precio) : '';
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
  // La vitrina cambia de luz según el aroma (el CSS lee data-aroma: ámbar, verde frío, madera, rojo)
  document.querySelector('.armario').dataset.aroma = aroma;

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

/* ---------- Aromas sin perfumes en la vitrina ---------- */
// La vitrina muestra los primeros perfumes de la lista (uno por frasco). Si entre ellos no hay
// ninguno de un aroma (por ejemplo, ninguno "Fresco"), su botón se esconde:
// así nadie toca un aroma y ve todos los frascos apagados
const enVitrina = PERFUMES.slice(0, botonesFrasco.length);
botonesAroma.forEach(function (boton) {
  const aroma = boton.textContent.trim();
  const hayPerfumes = enVitrina.some(function (p) { return p.aroma === aroma; });
  boton.hidden = !hayPerfumes;
});

/* ---------- Al cargar: empieza con el aroma marcado en el HTML (o el primero que tenga perfumes) ---------- */
const aromaMarcado = document.querySelector('.aroma.activo:not([hidden])');
const primerAromaVisible = document.querySelector('.aroma:not([hidden])');
const aromaInicial = aromaMarcado || primerAromaVisible;
if (aromaInicial) {
  elegirAroma(aromaInicial.textContent.trim());
}

/* ---------- Deslizar en el celular: cambia de aroma ---------- */
// Pasar el dedo de lado sobre la vitrina pasa al aroma siguiente (o al anterior), como tocar su botón.
// Solo con el dedo (no con mouse). Si el gesto es más vertical que horizontal, es scroll y no se toca nada
const armarioVitrina = document.querySelector('.armario');
let dedo = null;
let seDeslizo = false;

armarioVitrina.addEventListener('pointerdown', function (evento) {
  seDeslizo = false; // un toque nuevo nunca se ignora
  if (evento.pointerType !== 'touch') return;
  dedo = { x: evento.clientX, y: evento.clientY };
});
armarioVitrina.addEventListener('pointercancel', function () { dedo = null; });
armarioVitrina.addEventListener('pointerup', function (evento) {
  if (!dedo) return;
  const dx = evento.clientX - dedo.x;
  const dy = evento.clientY - dedo.y;
  dedo = null;
  if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return; // muy corto, o era scroll
  seDeslizo = true;
  // Ese "toque" de rebote llega enseguida o no llega; en medio segundo se olvida,
  // para no tragarse el siguiente toque de verdad
  setTimeout(function () { seDeslizo = false; }, 500);
  cambiarAroma(dx < 0 ? 1 : -1); // a la izquierda: el siguiente; a la derecha: el anterior
});
// Si el dedo terminó sobre un frasco, el navegador también lo "toca": ese toque se ignora
armarioVitrina.addEventListener('click', function (evento) {
  if (!seDeslizo) return;
  seDeslizo = false;
  evento.preventDefault();
  evento.stopPropagation();
}, true);

function cambiarAroma(paso) {
  const visibles = Array.prototype.filter.call(botonesAroma, function (b) { return !b.hidden; });
  if (visibles.length < 2) return;
  const actual = visibles.findIndex(function (b) { return b.classList.contains('activo'); });
  visibles[(actual + paso + visibles.length) % visibles.length].click();
}

// En pantallas táctiles, el texto de ayuda cuenta que se puede deslizar
if (window.matchMedia('(pointer: coarse)').matches) {
  const ayuda = document.querySelector('.inicio__ayuda');
  if (ayuda) ayuda.textContent = 'Toca un frasco o desliza para cambiar de aroma.';
}

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
    const decant = datosTamano(p, tamanoDecant(p));
    if (decant) aviso.push('También en ' + decant.texto.toLowerCase().replace('decant ', 'decant de ')); // "También en decant de 10 ml"
    if (aviso.length) info.append(crear('p', 'producto__aviso', aviso.join(' · ')));

    const pedir = crear('a', 'boton-oscuro', 'Pedir este');
    pedir.href = enlacePedido(p);
    info.append(pedir);

    tarjetaProducto.append(vitrinaProducto, info);
    pistaPedidos.append(tarjetaProducto);
  });
}

/* ---------- "Ya les llegó": las capturas de los clientes (js/capturas.js) ---------- */
// Con capturas en la lista, la sección aparece; sin capturas, sigue escondida
const seccionCapturas = document.getElementById('ya-les-llego');
const listaCapturas = typeof CAPTURAS !== 'undefined' ? CAPTURAS.filter(function (c) { return c && c.imagen; }) : [];

if (seccionCapturas && listaCapturas.length) {
  const carrusel = seccionCapturas.querySelector('.capturas__lista');
  const puntos = seccionCapturas.querySelector('.capturas__puntos');
  const visor = document.querySelector('.visor');
  const fotoVisor = visor.querySelector('.visor__foto');

  listaCapturas.forEach(function (c) {
    const item = crear('li', 'captura');

    // La foto es un botón: al tocarla se ve en grande
    const abrir = crear('button', 'captura__abrir');
    abrir.type = 'button';
    abrir.setAttribute('aria-label', 'Ver en grande' + (c.texto ? ': ' + c.texto : ''));
    const foto = crear('img');
    foto.src = c.imagen;
    foto.alt = '';
    foto.width = 210;
    foto.height = 360;
    foto.loading = 'lazy';
    foto.addEventListener('error', function () { item.remove(); }); // si la foto no existe, esa captura no se muestra
    abrir.append(foto);
    abrir.addEventListener('click', function () {
      fotoVisor.src = c.imagen;
      fotoVisor.alt = c.texto || 'Captura de un cliente';
      visor.showModal();
    });
    item.append(abrir);

    if (c.texto) item.append(crear('p', 'captura__texto', '“' + c.texto + '”'));
    const perfume = c.perfume ? buscarPerfume(c.perfume) : null;
    if (perfume) {
      const enlace = crear('a', 'captura__perfume', perfume.nombre);
      enlace.href = 'perfume.html?id=' + encodeURIComponent(perfume.id);
      item.append(enlace);
    }

    carrusel.append(item);
    puntos.append(crear('span', 'punto'));
  });

  seccionCapturas.hidden = false;

  // Puntos: marcan qué captura se está viendo al deslizar (en celular)
  function marcarPunto() {
    const primera = carrusel.querySelector('.captura');
    if (!primera) return;
    const paso = primera.offsetWidth + (parseFloat(getComputedStyle(carrusel).columnGap) || 0);
    const actual = Math.round(carrusel.scrollLeft / paso);
    puntos.querySelectorAll('.punto').forEach(function (p, i) { p.classList.toggle('activo', i === actual); });
  }
  carrusel.addEventListener('scroll', marcarPunto, { passive: true });
  marcarPunto();

  // El visor se cierra con la X, con Esc (eso ya lo hace <dialog>) o tocando fuera de la foto
  visor.querySelector('.visor__cerrar').addEventListener('click', function () { visor.close(); });
  visor.addEventListener('click', function (evento) {
    if (evento.target === visor) visor.close();
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
    // La fila de Decants: el decant más barato (de 10 ml o de 5 ml)
    precios = [];
    PERFUMES.forEach(function (p) {
      if (p.decant) precios.push(p.decant.precio);
      if (p.decant5) precios.push(p.decant5.precio);
    });
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
