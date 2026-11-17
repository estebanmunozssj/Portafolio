'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en el CATÁLOGO (catalogo.html)
   Usa la lista PERFUMES (js/perfumes.js) y lo compartido (js/comun.js).
   Parte 1: tarjetas, buscador, filtros y orden.
   Parte 2: Mi lista (varios perfumes en un solo mensaje de WhatsApp).
   ========================================================= */

/* ---------- Ajustes que se cambian con los datos del cliente ---------- */

// Mientras perfume.html no exista, la foto y el nombre de cada tarjeta NO son enlace
// (así nadie cae en una página de error). Cuando exista, cambiar a true.
const HAY_PAGINA_PERFUME = false;

// Rangos del filtro "Precio" (en pesos, sin puntos). Con alguno en null, el filtro de precio no se muestra.
// Ejemplo: bajo: { desde: 0, hasta: 200000 }, medio: { desde: 200000, hasta: 400000 }, alto: { desde: 400000, hasta: Infinity }
const RANGOS_PRECIO = {
  bajo: { desde: 0, hasta: null },
  medio: { desde: null, hasta: null },
  alto: { desde: null, hasta: Infinity }
};

/* ---------- Piezas de la página ---------- */
const formulario = document.querySelector('.filtros');
const campoBuscar = document.getElementById('buscar');
const detallesFiltros = document.querySelector('.filtros__mas');
const resumenFiltros = detallesFiltros.querySelector('summary');
const lista = document.querySelector('.catalogo__lista');
const plantilla = document.getElementById('plantilla-perfume');
const cuenta = document.querySelector('.catalogo__cuenta');
const vacio = document.querySelector('.catalogo__vacio');
const vacioWhatsApp = vacio.querySelector('.boton-whatsapp');

// Con JavaScript la lista cambia sola: el botón "Ver perfumes" ya no hace falta
document.querySelector('.filtros__aplicar').hidden = true;

// En computador hay espacio: los filtros empiezan abiertos. En celular, plegados
if (window.matchMedia('(min-width: 1024px)').matches) {
  detallesFiltros.open = true;
}

/* =========================================================
   Parte 1: tarjetas, buscador, filtros y orden
   ========================================================= */

/* ---------- Filtros que no tienen datos todavía se esconden ---------- */
// "Para" necesita el dato genero en cada perfume. Si ninguno lo tiene, el grupo no se muestra
const filtroGenero = formulario.querySelector('input[name="genero"]').closest('fieldset');
filtroGenero.hidden = !PERFUMES.some(function (p) { return p.genero; });

// "Precio" necesita los rangos de arriba y precios en la lista
const filtroPrecio = formulario.querySelector('input[name="precio"]').closest('fieldset');
const rangosListos = Object.values(RANGOS_PRECIO).every(function (r) { return r.desde != null && r.hasta != null; });
const hayPrecios = PERFUMES.some(function (p) { return p.precio != null; });
filtroPrecio.hidden = !(rangosListos && hayPrecios);
if (!filtroPrecio.hidden) {
  // Los textos de las opciones salen de los rangos: "Hasta $200.000", "De $200.000 a $400.000", "Más de $400.000"
  const textos = {
    bajo: 'Hasta ' + precioTexto(RANGOS_PRECIO.bajo.hasta),
    medio: 'De ' + precioTexto(RANGOS_PRECIO.medio.desde) + ' a ' + precioTexto(RANGOS_PRECIO.medio.hasta),
    alto: 'Más de ' + precioTexto(RANGOS_PRECIO.alto.desde)
  };
  Object.keys(textos).forEach(function (clave) {
    const opcion = formulario.querySelector('input[name="precio"][value="' + clave + '"]');
    opcion.parentElement.lastChild.textContent = ' ' + textos[clave];
  });
}

/* ---------- Leer lo que viene en la dirección (catalogo.html?tipo=arabes&q=afnan) ---------- */
// Así los enlaces del inicio llegan con el filtro marcado, y si alguien comparte la dirección, se ve lo mismo
const parametros = new URLSearchParams(location.search);
campoBuscar.value = parametros.get('q') || '';
['tipo', 'genero', 'tamano', 'precio'].forEach(function (nombre) {
  const valor = parametros.get(nombre) || '';
  const opcion = formulario.querySelector('input[name="' + nombre + '"][value="' + CSS.escape(valor) + '"]');
  if (opcion && !opcion.closest('fieldset').hidden) opcion.checked = true;
});
const ordenInicial = parametros.get('orden');
if (ordenInicial && formulario.querySelector('option[value="' + CSS.escape(ordenInicial) + '"]')) {
  formulario.elements.orden.value = ordenInicial;
}

/* ---------- Buscar sin importar tildes ni mayúsculas ---------- */
// "lattafa" encuentra "Lattafa"; "arabe" encuentra "Árabe"
function sinTildes(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/* ---------- Qué perfumes pasan los filtros ---------- */
function elegidos() {
  const datos = new FormData(formulario);
  const busqueda = sinTildes(datos.get('q'));
  const tipo = TIPOS[datos.get('tipo')];
  const genero = filtroGenero.hidden ? '' : datos.get('genero');
  const tamano = datos.get('tamano');
  const rango = filtroPrecio.hidden ? null : RANGOS_PRECIO[datos.get('precio')];

  const resultado = PERFUMES.filter(function (p) {
    if (busqueda && sinTildes(p.nombre + ' ' + p.marca).indexOf(busqueda) === -1) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (genero && sinTildes(p.genero) !== genero) return false;
    if (tamano === 'decant' && !p.decant) return false;
    if (rango && (p.precio == null || p.precio < rango.desde || p.precio >= rango.hasta)) return false;
    return true;
  });

  // Ordenar. Los que no tienen precio van al final cuando se ordena por precio
  const orden = datos.get('orden');
  const posicion = new Map(PERFUMES.map(function (p, i) { return [p.id, i]; }));
  resultado.sort(function (a, b) {
    if (orden === 'menor-precio' || orden === 'mayor-precio') {
      if (a.precio == null && b.precio == null) return posicion.get(a.id) - posicion.get(b.id);
      if (a.precio == null) return 1;
      if (b.precio == null) return -1;
      return orden === 'menor-precio' ? a.precio - b.precio : b.precio - a.precio;
    }
    // "Más pedidos": primero los marcados como más pedidos, después en el orden de la lista
    return (b.masPedido ? 1 : 0) - (a.masPedido ? 1 : 0) || posicion.get(a.id) - posicion.get(b.id);
  });
  return resultado;
}

/* ---------- Una tarjeta, copiada de la plantilla del HTML ---------- */
function tarjetaPerfume(p) {
  const copia = plantilla.content.cloneNode(true);
  const enlace = copia.querySelector('.perfume__enlace');

  if (HAY_PAGINA_PERFUME) {
    enlace.href = 'perfume.html?id=' + encodeURIComponent(p.id);
  } else {
    enlace.removeAttribute('href'); // sin href deja de ser un enlace: no lleva a ninguna parte
  }

  const foto = copia.querySelector('.perfume__foto img');
  foto.alt = p.nombre + ' de ' + p.marca;
  foto.addEventListener('error', function () { foto.remove(); }); // mejor fondo vacío que un ícono roto
  foto.src = p.imagen;
  if (!p.masPedido) copia.querySelector('.perfume__sello').remove();

  copia.querySelector('.perfume__datos').textContent = [p.marca, p.tipo].filter(Boolean).join(' · ');
  copia.querySelector('.perfume__nombre').textContent = p.nombre;
  const aroma = [p.aroma, p.intensidad].filter(Boolean).join(' · ');
  if (aroma) {
    copia.querySelector('.perfume__aroma').textContent = aroma;
  } else {
    copia.querySelector('.perfume__aroma').remove();
  }

  copia.querySelector('.perfume__precio').textContent = precioTexto(p.precio);
  if (p.decant) {
    copia.querySelector('.perfume__decant').textContent = 'Decant ' + p.decant.ml + ' ml: ' + precioTexto(p.decant.precio);
  } else {
    copia.querySelector('.perfume__decant').remove();
  }
  if (!p.pocasPiezas) copia.querySelector('.perfume__aviso').remove();

  const agregar = copia.querySelector('.perfume__agregar');
  agregar.dataset.id = p.id;
  marcarBotonAgregar(agregar);

  copia.querySelector('.perfume__botones .boton-oscuro').href = enlacePedido(p);
  return copia;
}

/* ---------- Pintar la lista ---------- */
function mostrarCatalogo() {
  const resultado = elegidos();

  lista.replaceChildren();
  resultado.forEach(function (p) {
    lista.append(tarjetaPerfume(p));
  });

  cuenta.textContent = resultado.length === 1 ? '1 perfume' : resultado.length + ' perfumes';

  // Sin resultados: se muestra el aviso, y su botón pregunta por lo que la persona buscó
  vacio.hidden = resultado.length > 0;
  lista.hidden = resultado.length === 0;
  const busqueda = campoBuscar.value.trim();
  vacioWhatsApp.href = enlaceWhatsApp(busqueda
    ? 'Hola, ¿tienen ' + busqueda + '?'
    : 'Hola, busco un perfume y no lo encontré en la página.');

  // "Filtros (2)": cuántos filtros hay puestos, para que se note aunque estén plegados
  const puestos = ['tipo', 'genero', 'tamano', 'precio'].filter(function (nombre) {
    const marcado = formulario.querySelector('input[name="' + nombre + '"]:checked');
    return marcado && marcado.value && !marcado.closest('fieldset').hidden;
  }).length;
  resumenFiltros.textContent = puestos ? 'Filtros (' + puestos + ')' : 'Filtros';

  // La dirección guarda los filtros (sin recargar), por si recarga o comparte el enlace
  const nuevos = new URLSearchParams();
  new FormData(formulario).forEach(function (valor, clave) {
    if (valor && !(clave === 'orden' && valor === 'mas-pedidos')) nuevos.set(clave, valor);
  });
  const texto = nuevos.toString();
  history.replaceState(null, '', texto ? '?' + texto : location.pathname);
}

// Cada letra que escribe y cada opción que toca actualiza la lista al instante
formulario.addEventListener('input', mostrarCatalogo);
formulario.addEventListener('change', mostrarCatalogo);
formulario.addEventListener('submit', function (evento) {
  evento.preventDefault(); // "Enter" en el buscador no recarga la página
  campoBuscar.blur(); // en el celular, cierra el teclado para ver los resultados
});

/* =========================================================
   Parte 2: Mi lista
   Se guarda en el navegador (localStorage) para que no se pierda al recargar.
   Cada elemento: { id, tamano: 'frasco' o 'decant', cantidad }
   ========================================================= */

const CLAVE_LISTA = 'sbprive-mi-lista';
const panelLista = document.getElementById('mi-lista');
const filasLista = panelLista.querySelector('.mi-lista__perfumes');
const listaVacia = panelLista.querySelector('.mi-lista__vacia');
const totalLista = panelLista.querySelector('.mi-lista__total');
const enviarLista = panelLista.querySelector('.mi-lista__enviar');
const botonBolsa = document.querySelector('.boton-lista');
const numeroBolsa = document.querySelector('.boton-lista__cuenta');
const barraWhatsApp = document.querySelector('.barra-whatsapp');
const barraOriginal = { href: barraWhatsApp.href, texto: barraWhatsApp.textContent };

// Leer y guardar. Con try porque en modo incógnito o con el almacenamiento bloqueado puede fallar:
// en ese caso la lista funciona igual, solo que no se guarda al recargar
function leerLista() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_LISTA)) || [];
    // Solo los perfumes que siguen existiendo en perfumes.js
    return guardada.filter(function (item) { return buscarPerfume(item.id); });
  } catch (error) {
    return [];
  }
}
let miLista = leerLista();

function guardarLista() {
  try {
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(miLista));
  } catch (error) {
    // sin almacenamiento: se queda solo en esta visita
  }
  pintarLista();
}

function estaEnLista(id) {
  return miLista.some(function (item) { return item.id === id; });
}

// El botón de la tarjeta dice si el perfume ya está en la lista
function marcarBotonAgregar(boton) {
  const dentro = estaEnLista(boton.dataset.id);
  boton.setAttribute('aria-pressed', dentro ? 'true' : 'false');
  boton.textContent = dentro ? 'En mi lista ✓' : 'Agregar a mi lista';
}

// Precio de un elemento según su tamaño
function precioDe(item) {
  const p = buscarPerfume(item.id);
  return item.tamano === 'decant' ? (p.decant ? p.decant.precio : null) : p.precio;
}
function tamanoTexto(item) {
  const p = buscarPerfume(item.id);
  return item.tamano === 'decant' && p.decant ? 'Decant ' + p.decant.ml + ' ml' : 'Frasco 100 ml';
}

// El mensaje de WhatsApp con toda la lista
function mensajeLista() {
  const lineas = miLista.map(function (item) {
    const p = buscarPerfume(item.id);
    return '• ' + item.cantidad + ' × ' + p.nombre + ' de ' + p.marca + ' (' + tamanoTexto(item).toLowerCase() + ')';
  });
  const total = totalDeLista();
  return 'Hola, quiero pedir estos perfumes:\n' + lineas.join('\n') +
    (total != null ? '\nTotal: ' + precioTexto(total) : '');
}

// Total solo si todos tienen precio; si falta alguno, se confirma por WhatsApp
function totalDeLista() {
  let suma = 0;
  for (const item of miLista) {
    const precio = precioDe(item);
    if (precio == null) return null;
    suma += precio * item.cantidad;
  }
  return suma;
}

/* ---------- Pintar Mi lista, la bolsa del encabezado y la barra de abajo ---------- */
function pintarLista() {
  filasLista.replaceChildren();

  miLista.forEach(function (item) {
    const p = buscarPerfume(item.id);
    const fila = crear('li', 'mi-lista__fila');
    fila.append(crear('span', 'mi-lista__nombre', p.nombre));

    const precio = precioDe(item);
    fila.append(crear('span', 'mi-lista__detalle', tamanoTexto(item) + ' · ' + precioTexto(precio)));

    // − 1 +
    const cantidad = crear('div', 'mi-lista__cantidad');
    const menos = crear('button', null, '−');
    menos.type = 'button';
    menos.setAttribute('aria-label', 'Uno menos de ' + p.nombre);
    menos.disabled = item.cantidad <= 1;
    const numero = crear('output', null, String(item.cantidad));
    numero.setAttribute('aria-label', 'Cantidad');
    const mas = crear('button', null, '+');
    mas.type = 'button';
    mas.setAttribute('aria-label', 'Uno más de ' + p.nombre);
    menos.addEventListener('click', function () { cambiarCantidad(item, -1); });
    mas.addEventListener('click', function () { cambiarCantidad(item, 1); });
    cantidad.append(menos, numero, mas);
    fila.append(cantidad);

    const quitar = crear('button', 'mi-lista__quitar', 'Quitar');
    quitar.type = 'button';
    quitar.setAttribute('aria-label', 'Quitar ' + p.nombre + ' de mi lista');
    quitar.addEventListener('click', function () { quitarDeLista(item.id); });
    fila.append(quitar);

    filasLista.append(fila);
  });

  const unidades = miLista.reduce(function (suma, item) { return suma + item.cantidad; }, 0);
  const hayAlgo = miLista.length > 0;

  listaVacia.hidden = hayAlgo;
  enviarLista.hidden = !hayAlgo;
  totalLista.hidden = !hayAlgo;
  if (hayAlgo) {
    const total = totalDeLista();
    totalLista.replaceChildren(
      crear('span', null, 'Total'),
      crear('span', null, total != null ? precioTexto(total) : 'Se confirma por WhatsApp')
    );
    enviarLista.href = enlaceWhatsApp(mensajeLista());
  }

  // La bolsa del encabezado: el número y lo que dice el lector de pantalla
  numeroBolsa.textContent = unidades;
  botonBolsa.setAttribute('aria-label', 'Mi lista: ' + (unidades === 1 ? '1 perfume' : unidades + ' perfumes'));

  // La barra fija de abajo: con perfumes en la lista, los envía todos
  if (hayAlgo) {
    barraWhatsApp.href = enlaceWhatsApp(mensajeLista());
    barraWhatsApp.textContent = 'Enviar mi lista (' + unidades + ')';
  } else {
    barraWhatsApp.href = barraOriginal.href;
    barraWhatsApp.textContent = barraOriginal.texto;
  }

  // Los botones "Agregar a mi lista" de las tarjetas que se ven
  lista.querySelectorAll('.perfume__agregar').forEach(marcarBotonAgregar);
}

function agregarALista(id) {
  // Si está filtrando por decant y el perfume tiene decant, se agrega el decant; si no, el frasco
  const tamano = new FormData(formulario).get('tamano') === 'decant' && buscarPerfume(id).decant ? 'decant' : 'frasco';
  miLista.push({ id: id, tamano: tamano, cantidad: 1 });
  guardarLista();
}

function quitarDeLista(id) {
  miLista = miLista.filter(function (item) { return item.id !== id; });
  guardarLista();
}

function cambiarCantidad(item, cambio) {
  item.cantidad = Math.max(1, Math.min(10, item.cantidad + cambio));
  guardarLista();
}

// Un solo oyente para todos los botones "Agregar a mi lista" (las tarjetas se crean y se borran al filtrar)
lista.addEventListener('click', function (evento) {
  const boton = evento.target.closest('.perfume__agregar');
  if (!boton) return;
  if (estaEnLista(boton.dataset.id)) {
    quitarDeLista(boton.dataset.id);
  } else {
    agregarALista(boton.dataset.id);
  }
});

/* ---------- Al cargar ---------- */
mostrarCatalogo();
pintarLista();
