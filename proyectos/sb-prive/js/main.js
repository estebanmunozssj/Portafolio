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

/* ---------- 1. La vitrina: muestra 6 frascos del aroma o la marca elegida ---------- */
// Solo entran perfumes con foto recortada (campo "vitrina" en js/perfumes.js).
// "grupo" es la lista elegida (todos los dulces, o todos los de Lattafa...) y "pagina" cuál tanda de 6 se ve
const armario = document.querySelector('.armario');
const conFrascoRecortado = PERFUMES.filter(function (p) { return p.vitrina; });
const cajaOtras = document.querySelector('.vitrina__mas');
const botonOtras = document.querySelector('.vitrina__otras');
const textoPagina = document.querySelector('.vitrina__pagina');
const enlaceTodos = document.querySelector('.vitrina__todos');
let grupo = [];
let pagina = 0;
let marcaElegida = null;       // la marca elegida, o null si se eligió un aroma
let barraPendiente = false;    // true: al terminar de cambiar la vitrina, la barra de WhatsApp pide el perfume nuevo
let esperaCambio = null;

function totalPaginas() {
  return Math.max(1, Math.ceil(grupo.length / botonesFrasco.length));
}

// Pone en las repisas la tanda actual. Al cambiar, los frascos se desvanecen y aparecen los nuevos
function llenarVitrina() {
  const tanda = grupo.slice(pagina * botonesFrasco.length, (pagina + 1) * botonesFrasco.length);
  const cambiar = function () {
    botonesFrasco.forEach(function (boton, i) {
      const perfume = tanda[i];
      boton.hidden = !perfume;
      if (!perfume) return;
      boton.dataset.id = perfume.id;
      boton.setAttribute('aria-label', perfume.nombre + ', ' + perfume.marca);
      const foto = boton.querySelector('img');
      foto.src = perfume.vitrina;
    });
    armario.classList.remove('vitrina--cambiando');
    if (tanda[0]) {
      mostrarPerfume(tanda[0]);
      // La barra se actualiza aquí, justo cuando la vitrina ya cambió (no con un reloj aparte)
      if (barraPendiente) barraConPerfume(tanda[0]);
    }
    barraPendiente = false;

    // "Otras opciones" solo si hay más de una tanda; el contador dice en cuál va
    const paginas = totalPaginas();
    botonOtras.hidden = paginas < 2;
    textoPagina.hidden = paginas < 2;
    textoPagina.textContent = (pagina + 1) + ' de ' + paginas;
    // Con una marca elegida: "Ver los 5 de Dior" (en el catálogo están todos, también los que no tienen frasco aquí)
    const total = marcaElegida ? cuentaTotalMarca[marcaElegida] : 0;
    enlaceTodos.hidden = !marcaElegida;
    if (marcaElegida) {
      enlaceTodos.textContent = (total === 1 ? 'Ver en el catálogo' : 'Ver los ' + total + ' de ' + marcaElegida);
      enlaceTodos.href = 'catalogo.html?marca=' + encodeURIComponent(marcaElegida);
    }
    cajaOtras.hidden = botonOtras.hidden && enlaceTodos.hidden;
  };
  // Si ya había un cambio en camino (toques muy seguidos), se reemplaza: solo cuenta el último
  clearTimeout(esperaCambio);
  if (quiereQuietud() || !armario.dataset.lleno) {
    cambiar();
  } else {
    armario.classList.add('vitrina--cambiando'); // el CSS desvanece los frascos
    esperaCambio = setTimeout(cambiar, 220);
  }
  armario.dataset.lleno = 'si';
}

// Si la foto recortada de un frasco no carga (por ejemplo, un navegador viejo sin AVIF), usa la foto normal
botonesFrasco.forEach(function (boton) {
  const foto = boton.querySelector('img');
  foto.addEventListener('error', function () {
    const perfume = buscarPerfume(boton.dataset.id);
    if (perfume && foto.getAttribute('src') !== perfume.imagen) foto.src = perfume.imagen;
    else boton.hidden = true;
  });
});

/* ---------- 2. Mostrar un perfume en la tarjeta ---------- */
function mostrarPerfume(perfume) {
  tarjeta.datos.textContent = [perfume.marca, perfume.ml ? perfume.ml + ' ml' : '', perfume.familia || perfume.tipo].filter(Boolean).join(' · ');
  tarjeta.nombre.textContent = perfume.nombre;
  tarjeta.notas.textContent = perfume.notas || '';
  tarjeta.notas.hidden = !perfume.notas; // sin notas en perfumes.js, esa línea no se muestra
  // Si las notas son muy largas, el CSS las corta a 3 líneas. Al tocarlas se abren completas (ver sección 4)
  tarjeta.notas.classList.remove('tarjeta__notas--completas');
  tarjeta.precio.textContent = precioTexto(perfume.precio);
  // El decant de 10 ml o, si no hay, el de 5 ml (tamanoDecant y datosTamano están en js/comun.js)
  const decant = datosTamano(perfume, tamanoDecant(perfume));
  if (!decant) tarjeta.decant.textContent = '';
  // Sin precios, no se repite "Precio por WhatsApp" dos veces: solo se cuenta que también viene en decant
  else if (decant.precio == null && perfume.precio == null) tarjeta.decant.textContent = 'También en ' + decant.texto.replace('Decant', 'decant de');
  else tarjeta.decant.textContent = decant.texto + ': ' + precioTexto(decant.precio);
  tarjeta.boton.href = enlacePedido(perfume);

  // La luz de la vitrina toma el color del aroma de este perfume (ámbar, verde frío, madera, rojo)
  armario.dataset.aroma = perfume.aroma;

  // Marcar cuál frasco está elegido: crece y se ilumina (lo hace el CSS con .activo)
  botonesFrasco.forEach(function (boton) {
    const elegido = boton.dataset.id === perfume.id;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });
}

/* ---------- 3. Elegir un aroma o una marca ---------- */
const listaMarcas = document.querySelector('.marcas__lista');
let botonesMarca = [];

// Marca como elegido el botón que corresponde (y desmarca los demás, de aromas y de marcas)
function marcarEleccion(tipo, valor) {
  botonesAroma.forEach(function (boton) {
    const elegido = tipo === 'aroma' && boton.dataset.aroma === valor;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });
  botonesMarca.forEach(function (boton) {
    const elegido = tipo === 'marca' && boton.dataset.marca === valor;
    boton.classList.toggle('activo', elegido);
    boton.setAttribute('aria-pressed', elegido ? 'true' : 'false');
  });
}

// Reparte las marcas: un perfume de cada marca por turno, así cada tanda de 6 se ve variada
// (si no, saldrían cinco de Ariana Grande seguidos). El orden de la lista se respeta dentro de cada marca
function intercalarMarcas(lista) {
  const porMarca = {};
  lista.forEach(function (p) { (porMarca[p.marca] = porMarca[p.marca] || []).push(p); });
  const filas = Object.values(porMarca);
  const resultado = [];
  for (let i = 0; resultado.length < lista.length; i++) {
    filas.forEach(function (fila) { if (fila[i]) resultado.push(fila[i]); });
  }
  return resultado;
}

function elegirAroma(aroma) {
  marcaElegida = null;
  marcarEleccion('aroma', aroma);
  grupo = intercalarMarcas(conFrascoRecortado.filter(function (p) { return p.aroma === aroma; }));
  pagina = 0;
  llenarVitrina();
}

function elegirMarca(marca) {
  marcaElegida = marca;
  marcarEleccion('marca', marca);
  grupo = conFrascoRecortado.filter(function (p) { return p.marca === marca; });
  pagina = 0;
  llenarVitrina();
}

// Los botones de marca: solo las marcas con algún frasco en la vitrina, de la que más perfumes tiene a la que menos.
// El número pequeño dorado es cuántos perfumes tiene en TODO el catálogo (el mismo número que sale allá)
const cuentaTotalMarca = {};
PERFUMES.forEach(function (p) { cuentaTotalMarca[p.marca] = (cuentaTotalMarca[p.marca] || 0) + 1; });
const cuentaMarcas = {};
conFrascoRecortado.forEach(function (p) { cuentaMarcas[p.marca] = cuentaTotalMarca[p.marca]; });
const marcasOrdenadas = Object.keys(cuentaMarcas)
  .sort(function (a, b) { return cuentaMarcas[b] - cuentaMarcas[a] || a.localeCompare(b, 'es'); });

function botonMarca(marca, esCopia) {
  const boton = crear('button', 'marca', marca);
  boton.type = 'button';
  boton.dataset.marca = marca;
  boton.append(crear('span', 'marca__cuenta', String(cuentaMarcas[marca])));
  if (esCopia) {
    // La copia solo existe para que la fila se desplace sin fin: el lector de pantalla y el tabulador la saltan
    boton.setAttribute('aria-hidden', 'true');
    boton.tabIndex = -1;
  } else {
    boton.setAttribute('aria-label', marca + ', ' + cuentaMarcas[marca] + (cuentaMarcas[marca] === 1 ? ' perfume' : ' perfumes'));
    boton.setAttribute('aria-pressed', 'false');
  }
  listaMarcas.append(boton);
  botonesMarca.push(boton);
}
marcasOrdenadas.forEach(function (marca) { botonMarca(marca, false); });
marcasOrdenadas.forEach(function (marca) { botonMarca(marca, true); }); // la segunda vuelta, igual a la primera
if (botonesMarca.length) document.querySelector('.marcas').hidden = false;

/* ---------- Las marcas se desplazan solas, despacio ---------- */
// La fila avanza sola para que se vayan viendo todas las marcas. Como las marcas están dos veces seguidas,
// al terminar la primera vuelta salta al inicio sin que se note. Se detiene:
// - mientras el mouse está encima, o el dedo la toca, o el teclado está en ella (y sigue 3 s después);
// - para siempre, en cuanto la persona elige una marca (así la marca elegida no se va de la pantalla);
// - si la persona pidió menos movimiento, si la fila no está en pantalla o si la pestaña está oculta.
// La fila sigue siendo un scroll normal: se puede deslizar con el dedo o la rueda del mouse
// La pausa al tocar (pausaAlTocar) está en js/comun.js: la usan también las tarjetas de marca del catálogo.
// El cuadro a cuadro (requestAnimationFrame) solo corre mientras la fila se mueve: quieta, no gasta nada
const VELOCIDAD_MARCAS = 26; // píxeles por segundo
let marcasDetenidas = false;
let marcasCorriendo = false;
let posicionMarcas = 0;
let tiempoAnterior = null;
const pausaMarcas = botonesMarca.length ? pausaAlTocar(listaMarcas, 3000, arrancarMarcas) : null;

function arrancarMarcas() {
  if (marcasCorriendo || marcasDetenidas || !pausaMarcas.puedeMoverse()) return;
  marcasCorriendo = true;
  tiempoAnterior = null;
  posicionMarcas = listaMarcas.scrollLeft; // si la persona la movió, sigue desde ahí
  requestAnimationFrame(moverMarcas);
}

function moverMarcas(tiempo) {
  if (marcasDetenidas || !pausaMarcas.puedeMoverse()) {
    marcasCorriendo = false; // se detiene; arrancarMarcas la vuelve a poner en marcha
    return;
  }
  if (tiempoAnterior !== null) {
    const vuelta = listaMarcas.scrollWidth / 2; // el ancho de una sola vuelta de marcas
    posicionMarcas += VELOCIDAD_MARCAS * Math.min(tiempo - tiempoAnterior, 100) / 1000;
    if (posicionMarcas >= vuelta) posicionMarcas -= vuelta;
    listaMarcas.scrollLeft = posicionMarcas;
  }
  tiempoAnterior = tiempo;
  requestAnimationFrame(moverMarcas);
}

if (pausaMarcas) arrancarMarcas();

/* ---------- 4. Escuchar los toques ---------- */
// La barra fija de abajo empieza con un mensaje general ("quiero pedir un perfume").
// Cuando la persona elige un aroma, una marca o un frasco, la barra pide ese perfume,
// así el cliente no tiene que preguntarle "¿cuál?". Al cargar no se cambia: nadie ha elegido nada todavía
const barraWhatsApp = document.querySelector('.barra-whatsapp');
function barraConPerfume(perfume) {
  if (barraWhatsApp && perfume) {
    barraWhatsApp.href = enlacePedido(perfume);
  }
}
// La vitrina tarda un momento en cambiar (se desvanece): la barra se actualiza cuando termina (ver llenarVitrina)
function barraConElegido() {
  barraPendiente = true;
}

botonesAroma.forEach(function (boton) {
  boton.addEventListener('click', function () {
    barraConElegido();
    elegirAroma(boton.dataset.aroma);
  });
});
botonesMarca.forEach(function (boton) {
  boton.addEventListener('click', function () {
    marcasDetenidas = true; // ya eligió: la fila se queda quieta
    barraConElegido();
    elegirMarca(boton.dataset.marca);
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

// "Otras opciones": la tanda siguiente; después de la última, vuelve a la primera
function otrasOpciones(paso) {
  pagina = (pagina + paso + totalPaginas()) % totalPaginas();
  barraConElegido();
  llenarVitrina();
}
botonOtras.addEventListener('click', function () { otrasOpciones(1); });

// Notas cortadas: en el celular no hay mouse, así que al tocarlas se abren o se vuelven a cortar
tarjeta.notas.addEventListener('click', function () {
  tarjeta.notas.classList.toggle('tarjeta__notas--completas');
});

/* ---------- Aromas sin perfumes recortados ---------- */
// Si ningún perfume de un aroma tiene foto recortada, su botón se esconde (no habría nada que mostrar)
botonesAroma.forEach(function (boton) {
  const aroma = boton.dataset.aroma;
  boton.hidden = !conFrascoRecortado.some(function (p) { return p.aroma === aroma; });
});

/* ---------- Al cargar: empieza con el aroma marcado en el HTML (o el primero que tenga perfumes) ---------- */
const aromaMarcado = document.querySelector('.aroma.activo:not([hidden])');
const primerAromaVisible = document.querySelector('.aroma:not([hidden])');
const aromaInicial = aromaMarcado || primerAromaVisible;
if (aromaInicial) {
  elegirAroma(aromaInicial.dataset.aroma);
}

/* ---------- Deslizar en el celular: otras opciones ---------- */
// Pasar el dedo de lado sobre la vitrina trae la tanda siguiente (o la anterior), como "Otras opciones".
// Solo con el dedo (no con mouse). Si el gesto es más vertical que horizontal, es scroll y no se toca nada
let dedo = null;
let seDeslizo = false;

armario.addEventListener('pointerdown', function (evento) {
  seDeslizo = false; // un toque nuevo nunca se ignora
  if (evento.pointerType !== 'touch') return;
  dedo = { x: evento.clientX, y: evento.clientY };
});
armario.addEventListener('pointercancel', function () { dedo = null; });
armario.addEventListener('pointerup', function (evento) {
  if (!dedo) return;
  const dx = evento.clientX - dedo.x;
  const dy = evento.clientY - dedo.y;
  dedo = null;
  if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return; // muy corto, o era scroll
  if (totalPaginas() < 2) return;
  seDeslizo = true;
  // Ese "toque" de rebote llega enseguida o no llega; en medio segundo se olvida,
  // para no tragarse el siguiente toque de verdad
  setTimeout(function () { seDeslizo = false; }, 500);
  otrasOpciones(dx < 0 ? 1 : -1); // a la izquierda: las siguientes; a la derecha: las anteriores
});
// Si el dedo terminó sobre un frasco, el navegador también lo "toca": ese toque se ignora
armario.addEventListener('click', function (evento) {
  if (!seDeslizo) return;
  seDeslizo = false;
  evento.preventDefault();
  evento.stopPropagation();
}, true);

// En pantallas táctiles, el texto de ayuda cuenta que se puede deslizar
if (window.matchMedia('(pointer: coarse)').matches) {
  const ayuda = document.querySelector('.inicio__ayuda');
  if (ayuda) ayuda.textContent = 'Toca un frasco o desliza para ver otras opciones.';
}

/* =========================================================
   Parte 1b: secciones que salen de la lista de perfumes
   Así un precio se cambia en un solo lugar (js/perfumes.js)
   ========================================================= */

// BARRA_INTENSIDAD (qué tan fuerte se siente → largo de la barra) está en js/comun.js

/* ---------- 8. "Los más pedidos": una tarjeta por cada perfume con masPedido: true ---------- */
const pistaPedidos = document.querySelector('.pedidos__pista');
const masPedidos = PERFUMES.filter(function (p) { return p.masPedido; });
// Mientras ningún perfume tenga masPedido: true, la sección no se muestra (así no queda vacía)
const seccionPedidos = document.getElementById('mas-pedidos');
if (seccionPedidos && !masPedidos.length) seccionPedidos.hidden = true;

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
    info.append(crear('p', 'producto__datos', [p.marca, p.ml ? p.ml + ' ml' : ''].filter(Boolean).join(' · ')));
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

    // Lleva a la ficha (como las tarjetas del catálogo): allí se elige el tamaño y el pedido sale completo
    const ver = crear('a', 'boton-oscuro', 'Ver perfume');
    ver.href = 'perfume.html?id=' + encodeURIComponent(p.id);
    info.append(ver);

    tarjetaProducto.append(vitrinaProducto, info);
    pistaPedidos.append(tarjetaProducto);
  });
}

/* ---------- "Ya les llegó": las capturas de los clientes (js/capturas.js) ---------- */
// Con capturas en la lista, salen las capturas. Sin capturas todavía, salen marcos de ejemplo
// que dicen qué va en cada lugar (nunca reseñas inventadas)
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
  // Con una sola captura no hay nada que deslizar: sin puntos ni "Desliza para ver más"
  if (listaCapturas.length < 2) seccionCapturas.querySelector('.capturas__guia').hidden = true;

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
} else if (seccionCapturas) {
  // Sin capturas todavía, la sección no se muestra (la página ya está publicada: nada de marcos de ejemplo).
  // Para ver cómo se vería con marcos de ejemplo mientras se diseña, abrir la página con ?ejemplos
  if (new URLSearchParams(location.search).has('ejemplos')) {
    const carrusel = seccionCapturas.querySelector('.capturas__lista');
    for (let i = 0; i < 4; i++) {
      const item = crear('li', 'captura captura--ejemplo');
      item.setAttribute('aria-hidden', 'true');
      const marco = crear('div', 'captura__abrir captura__marco');
      marco.append(crear('span', 'captura__aviso', '[Captura de cliente]'));
      item.append(marco);
      item.append(crear('p', 'captura__texto', '[Frase corta del cliente]'));
      item.append(crear('span', 'captura__perfume', '[Perfume que pidió]'));
      carrusel.append(item);
    }
    seccionCapturas.querySelector('.capturas__guia').hidden = true;
  } else {
    seccionCapturas.hidden = true;
  }
}

/* ---------- "Síguenos": publicaciones de Instagram (js/redes.js) ---------- */
// Cada publicación es un enlace a Instagram con su portada. Sin publicaciones todavía,
// salen 6 marcos de ejemplo (reels y fotos) para ver cómo queda
const seccionRedes = document.getElementById('redes');
if (seccionRedes && typeof PUBLICACIONES !== 'undefined') {
  const listaRedes = seccionRedes.querySelector('.redes__lista');
  const publicaciones = PUBLICACIONES.filter(function (p) { return p && p.imagen && p.enlace; });
  const iconoReel = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';

  if (publicaciones.length) {
    publicaciones.slice(0, 6).forEach(function (p) {
      const item = crear('li');
      const enlace = crear('a', 'publicacion' + (p.tipo === 'reel' ? ' publicacion--reel' : ''));
      enlace.href = p.enlace;
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
      enlace.setAttribute('aria-label', (p.tipo === 'reel' ? 'Reel: ' : 'Publicación: ') + (p.texto || 'ver en Instagram'));
      const foto = crear('img');
      foto.src = p.imagen;
      foto.alt = '';
      foto.width = 300;
      foto.height = 375;
      foto.loading = 'lazy';
      foto.addEventListener('error', function () { item.remove(); });
      enlace.append(foto);
      if (p.tipo === 'reel') enlace.insertAdjacentHTML('beforeend', '<span class="publicacion__reel">' + iconoReel + '</span>');
      item.append(enlace);
      listaRedes.append(item);
    });
  } else if (!new URLSearchParams(location.search).has('ejemplos')) {
    // Sin publicaciones todavía: queda el título, el usuario y los botones a Instagram y TikTok, sin cuadrícula
    listaRedes.hidden = true;
  } else {
    ['reel', 'foto', 'reel', 'foto', 'reel', 'foto'].forEach(function (tipo) {
      const item = crear('li');
      item.setAttribute('aria-hidden', 'true'); // es solo de muestra
      const marco = crear('div', 'publicacion publicacion--ejemplo' + (tipo === 'reel' ? ' publicacion--reel' : ''));
      marco.append(crear('span', 'publicacion__aviso', tipo === 'reel' ? '[Reel]' : '[Publicación]'));
      if (tipo === 'reel') marco.insertAdjacentHTML('beforeend', '<span class="publicacion__reel">' + iconoReel + '</span>');
      item.append(marco);
      listaRedes.append(item);
    });
  }

  // El usuario y los enlaces a los perfiles los pone js/comun.js con los datos de js/redes.js (igual que en el pie)
}

/* ---------- "Ver catálogo" dice cuántos perfumes hay ---------- */
// Un número concreto ("Ver los 162 perfumes") dice más que "Ver catálogo". Se cuenta solo de js/perfumes.js
const botonCatalogo = document.querySelector('.inicio__catalogo');
if (botonCatalogo && PERFUMES.length > 20) botonCatalogo.textContent = 'Ver los ' + PERFUMES.length + ' perfumes';

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
  let cuantos;
  if (fila.getAttribute('href') === '#kit') {
    // La fila de Decants: el decant más barato (de 10 ml o de 5 ml)
    precios = [];
    cuantos = 0;
    PERFUMES.forEach(function (p) {
      if (p.decant) precios.push(p.decant.precio);
      if (p.decant5) precios.push(p.decant5.precio);
      if (p.decant || p.decant5) cuantos++;
    });
  } else {
    // Cada fila dice su tipo en data-tipo="arabes" (así no depende de a dónde lleve el enlace)
    const tipo = TIPOS[fila.dataset.tipo];
    if (!tipo) return; // fila nueva que no está en TIPOS: se deja el texto del HTML
    const delTipo = PERFUMES.filter(function (p) { return p.tipo === tipo; });
    precios = delTipo.map(function (p) { return p.precio; });
    cuantos = delTipo.length;
  }
  const minimo = precioMinimo(precios);
  // Con precios: "Desde $X". Sin precios: cuántos perfumes hay (decir "Precio por WhatsApp" en las cuatro filas no aporta)
  if (minimo != null) desde.textContent = 'Desde ' + precioTexto(minimo);
  else if (cuantos) desde.textContent = cuantos + (cuantos === 1 ? ' perfume' : ' perfumes');
  else desde.textContent = 'Precio por WhatsApp';
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

/* ---------- Preguntas: abrir la que viene en la dirección ----------
   El pie de página enlaza a index.html#envios y #cambios. Las preguntas son un acordeón cerrado,
   así que al llegar por ese enlace (o al tocarlo estando aquí) se abre la pregunta */
function abrirPreguntaDeLaDireccion() {
  const destino = location.hash && document.getElementById(location.hash.slice(1));
  if (destino && destino.tagName === 'DETAILS') destino.open = true;
}
abrirPreguntaDeLaDireccion();
window.addEventListener('hashchange', abrirPreguntaDeLaDireccion);
