'use strict';

/* =========================================================
   S. B. PRIVÉ — lo que se mueve en el CATÁLOGO (catalogo.html)
   Usa la lista PERFUMES (js/perfumes.js) y lo compartido (js/comun.js).
   Parte 1: tarjetas, buscador, filtros y orden.
   Parte 2: Mi lista (varios perfumes en un solo mensaje de WhatsApp).
   ========================================================= */

/* ---------- Ajustes que se cambian con los datos del cliente ---------- */

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
const cuenta = document.querySelector('.catalogo__cuenta');
const vacio = document.querySelector('.catalogo__vacio');
const vacioWhatsApp = vacio.querySelector('.boton-whatsapp');

// Con JavaScript la lista cambia sola: el botón "Ver perfumes" ya no hace falta
document.querySelector('.filtros__aplicar').hidden = true;

// Los filtros empiezan plegados (también en computador), para que los perfumes se vean primero.
// "Filtros (2)" avisa cuando hay alguno puesto
const quitarFiltros = document.querySelector('.filtros .filtros__quitar');

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
// Sin precios (el cliente los da por WhatsApp), ordenar por precio no hace nada: esas opciones se esconden
if (!hayPrecios) {
  formulario.querySelectorAll('select[name="orden"] option[value$="-precio"]').forEach(function (opcion) { opcion.remove(); });
  // Queda solo "Más pedidos": un selector de una sola opción no sirve, así que se esconde
  formulario.querySelector('.filtros__ordenar').hidden = true;
}
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

// Las marcas del menú "Marca", en orden alfabético y con cuántos perfumes tiene cada una
const selectorMarca = formulario.querySelector('select[name="marca"]');
const cuentaMarcas = {};
PERFUMES.forEach(function (p) { cuentaMarcas[p.marca] = (cuentaMarcas[p.marca] || 0) + 1; });
Object.keys(cuentaMarcas).sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (marca) {
  const opcion = crear('option', null, marca + ' (' + cuentaMarcas[marca] + ')');
  opcion.value = marca;
  selectorMarca.append(opcion);
});
if (cuentaMarcas[parametros.get('marca')]) selectorMarca.value = parametros.get('marca');
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
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/* ---------- Qué perfumes pasan los filtros ---------- */
function elegidos() {
  const datos = new FormData(formulario);
  const busqueda = sinTildes(datos.get('q'));
  const tipo = TIPOS[datos.get('tipo')];
  const genero = filtroGenero.hidden ? '' : datos.get('genero');
  const tamano = datos.get('tamano');
  const marca = datos.get('marca');
  const rango = filtroPrecio.hidden ? null : RANGOS_PRECIO[datos.get('precio')];

  const resultado = PERFUMES.filter(function (p) {
    if (busqueda && sinTildes(p.nombre + ' ' + p.marca).indexOf(busqueda) === -1) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (marca && p.marca !== marca) return false;
    if (genero && sinTildes(p.genero) !== genero) return false;
    if (tamano === 'decant' && !tamanoDecant(p)) return false; // decant de 10 ml o de 5 ml
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

// La tarjeta de cada perfume (tarjetaPerfume) se arma en js/comun.js: la usa también la página de cada perfume

/* ---------- Pintar la lista ---------- */
function mostrarCatalogo() {
  const resultado = elegidos();

  lista.replaceChildren();
  resultado.forEach(function (p) {
    lista.append(tarjetaPerfume(p, 'h2'));
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
  }).length + (selectorMarca.value ? 1 : 0);
  resumenFiltros.textContent = puestos ? 'Filtros (' + puestos + ')' : 'Filtros';

  // La dirección guarda los filtros (sin recargar), por si recarga o comparte el enlace
  const nuevos = new URLSearchParams();
  new FormData(formulario).forEach(function (valor, clave) {
    if (valor && !(clave === 'orden' && valor === 'mas-pedidos')) nuevos.set(clave, valor);
  });
  const texto = nuevos.toString();
  // "Quitar filtros" solo aparece cuando hay algo que quitar (búsqueda, filtro u orden distinto)
  quitarFiltros.hidden = !texto;
  // location.hash (#mi-lista, #buscar) se conserva: sin él, la bolsa y la lupa no llevarían a su lugar
  history.replaceState(null, '', (texto ? '?' + texto : location.pathname) + location.hash);
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
   Guardar, agregar, quitar y armar el mensaje está en js/comun.js
   (así funciona igual en el catálogo y en la página de cada perfume).
   Aquí solo se pinta la sección "Mi lista" y la barra de abajo
   ========================================================= */

const panelLista = document.getElementById('mi-lista');
const filasLista = panelLista.querySelector('.mi-lista__perfumes');
const listaVacia = panelLista.querySelector('.mi-lista__vacia');
const totalLista = panelLista.querySelector('.mi-lista__total');
const enviarLista = panelLista.querySelector('.mi-lista__enviar');
const barraWhatsApp = document.querySelector('.barra-whatsapp');
const barraOriginal = { href: barraWhatsApp.href, texto: barraWhatsApp.textContent };

// Qué tamaño agrega cada tarjeta: si está filtrando por decant y el perfume viene en decant, el decant
// (el de 10 ml o, si no hay, el de 5 ml); si no, el frasco. comun.js usa esta función en las tarjetas
function tamanoAlAgregar(id) {
  const decant = tamanoDecant(buscarPerfume(id));
  return new FormData(formulario).get('tamano') === 'decant' && decant ? decant : 'frasco';
}

function pintarLista() {
  filasLista.replaceChildren();

  miLista.forEach(function (item) {
    const p = buscarPerfume(item.id);
    const fila = crear('li', 'mi-lista__fila');
    fila.append(crear('span', 'mi-lista__nombre', p.nombre));
    fila.append(crear('span', 'mi-lista__detalle', tamanoTexto(item) + ' · ' + precioTexto(precioDe(item))));

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
    mas.disabled = item.cantidad >= 10;
    menos.addEventListener('click', function () { cambiarCantidad(item, -1); });
    mas.addEventListener('click', function () { cambiarCantidad(item, 1); });
    cantidad.append(menos, numero, mas);
    fila.append(cantidad);

    const quitar = crear('button', 'mi-lista__quitar', 'Quitar');
    quitar.type = 'button';
    quitar.setAttribute('aria-label', 'Quitar ' + p.nombre + ' (' + tamanoTexto(item) + ') de mi lista');
    quitar.addEventListener('click', function () { quitarConAviso(item.id, item.tamano); });
    fila.append(quitar);

    filasLista.append(fila);
  });

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

  // El botón flotante de WhatsApp: con perfumes en la lista, los envía todos.
  // data-cuenta pone el numerito sobre el círculo (lo dibuja el CSS)
  if (hayAlgo) {
    barraWhatsApp.href = enlaceWhatsApp(mensajeLista());
    barraWhatsApp.textContent = 'Enviar mi lista (' + unidadesLista() + ')';
    barraWhatsApp.dataset.cuenta = unidadesLista();
  } else {
    barraWhatsApp.href = barraOriginal.href;
    barraWhatsApp.textContent = barraOriginal.texto;
    delete barraWhatsApp.dataset.cuenta;
  }
}

// Cada vez que la lista cambia (aquí o en otra pestaña), se vuelve a pintar
alCambiarLista(pintarLista);

/* ---------- Llegar a un lugar de la página: catalogo.html#buscar (lupa) o #mi-lista (bolsa) ---------- */
// El navegador salta al # antes de que estén las tarjetas, y después las tarjetas empujan todo hacia abajo.
// Por eso, ya con las tarjetas puestas, se vuelve a ir al lugar. En #buscar además queda listo para escribir
function irAlLugar() {
  if (location.hash === '#buscar') {
    campoBuscar.focus();
    return;
  }
  const lugar = location.hash && document.getElementById(location.hash.slice(1));
  if (lugar) lugar.scrollIntoView({ behavior: 'instant' }); // al llegar, salto directo (el deslizamiento se cortaba mientras carga)
}
window.addEventListener('hashchange', irAlLugar);

// La lupa del encabezado aquí mismo: si la dirección ya termina en #buscar, tocarla no cambia nada
// y no hay "hashchange"; por eso también se escucha el toque, y el buscador queda listo para escribir
document.querySelectorAll('a[href="#buscar"]').forEach(function (lupa) {
  lupa.addEventListener('click', function () { campoBuscar.focus(); });
});

/* ---------- Al cargar ---------- */
mostrarCatalogo();
pintarLista();
irAlLugar();
