'use strict';

/* =========================================================
   S. B. PRIVÉ — la página de UN perfume (perfume.html?id=...)
   Lee el id de la dirección, busca ese perfume en PERFUMES (js/perfumes.js)
   y llena la página. Lo compartido (precios, WhatsApp, Mi lista, tarjetas) está en js/comun.js.
   Se llama ficha.js para no confundirlo con perfumes.js.
   ========================================================= */

const idPerfume = new URLSearchParams(location.search).get('id');
const perfume = buscarPerfume(idPerfume);

/* ---------- Si el perfume no existe: aviso y nada más ---------- */
if (!perfume) {
  document.title = 'Perfume no encontrado | S. B. Privé';
  // Que Google no guarde esta página de error
  const noIndexar = document.createElement('meta');
  noIndexar.name = 'robots';
  noIndexar.content = 'noindex';
  document.head.append(noIndexar);

  document.querySelectorAll('.ficha > :not(.ficha__no-existe):not(template)').forEach(function (parte) {
    parte.hidden = true;
  });
  document.querySelector('.ficha__no-existe').hidden = false;
} else {
  llenarFicha(perfume);
}

function llenarFicha(p) {
  /* ---------- Título de la pestaña y lo que muestra Google ---------- */
  document.title = p.nombre + ' de ' + p.marca + ' | S. B. Privé';
  const descripcionCorta = (p.descripcion || p.notas || '') + ' En frasco' + (p.decant ? ' y en decant' : '') + '. Pide por WhatsApp.';
  document.querySelector('meta[name="description"]').content = descripcionCorta.trim();
  const canonica = document.createElement('link');
  canonica.rel = 'canonical';
  canonica.href = 'https://estebandev.online/proyectos/sb-prive/perfume.html?id=' + encodeURIComponent(p.id);
  document.head.append(canonica);

  /* ---------- Migas ---------- */
  const claveTipo = Object.keys(TIPOS).find(function (clave) { return TIPOS[clave] === p.tipo; });
  const migaTipo = document.querySelector('.migas__tipo');
  if (claveTipo) {
    migaTipo.href = 'catalogo.html?tipo=' + claveTipo;
    migaTipo.textContent = p.tipo;
  } else {
    migaTipo.closest('li').remove();
  }
  document.querySelector('.migas [aria-current="page"]').textContent = p.nombre;

  /* ---------- Fotos ---------- */
  const fotos = (p.fotos && p.fotos.length) ? p.fotos : [p.imagen];
  const fotoGrande = document.querySelector('.ficha__foto img');
  fotoGrande.alt = p.nombre + ' de ' + p.marca;
  fotoGrande.addEventListener('error', function () { fotoGrande.hidden = true; });
  fotoGrande.src = fotos[0];
  if (!p.masPedido) document.querySelector('.ficha__sello').remove();

  // Miniaturas solo si hay más de una foto
  const miniaturas = document.querySelector('.ficha__miniaturas');
  if (fotos.length > 1) {
    fotos.forEach(function (ruta, i) {
      const boton = crear('button');
      boton.type = 'button';
      boton.setAttribute('aria-label', 'Ver foto ' + (i + 1) + ' de ' + fotos.length);
      if (i === 0) boton.setAttribute('aria-current', 'true');
      const mini = crear('img');
      mini.src = ruta;
      mini.alt = '';
      mini.width = 52;
      mini.height = 52;
      boton.append(mini);
      boton.addEventListener('click', function () {
        fotoGrande.hidden = false;
        fotoGrande.src = ruta;
        miniaturas.querySelectorAll('button').forEach(function (b) { b.removeAttribute('aria-current'); });
        boton.setAttribute('aria-current', 'true');
      });
      const item = crear('li');
      item.append(boton);
      miniaturas.append(item);
    });
  } else {
    miniaturas.remove();
  }

  /* ---------- Nombre y datos ---------- */
  document.querySelector('.ficha__marca').textContent = p.marca;
  document.querySelector('.ficha__nombre').textContent = p.nombre;
  document.querySelector('.ficha__datos').textContent = [p.tipo, p.familia, p.aroma].filter(Boolean).join(' · ');
  if (!p.pocasPiezas) document.querySelector('.ficha__aviso').remove();

  /* ---------- Tamaños: cada opción con su precio; las que el perfume no tiene se quitan ---------- */
  document.querySelectorAll('.tamano').forEach(function (opcion) {
    const radio = opcion.querySelector('input');
    const datos = datosTamano(p, radio.value);
    if (!datos) {
      opcion.remove();
      return;
    }
    opcion.querySelector('.tamano__nombre').textContent = datos.texto;
    opcion.querySelector('.tamano__precio').textContent = precioTexto(datos.precio);
  });
  // Si llega desde el catálogo filtrando decants (?tamano=decant), empieza con el decant elegido
  const tamanoPedido = new URLSearchParams(location.search).get('tamano');
  const radioPedido = tamanoPedido && document.querySelector('.tamano input[value="' + CSS.escape(tamanoPedido) + '"]');
  (radioPedido || document.querySelector('.tamano input')).checked = true;

  /* ---------- Cantidad, total, botones y barra de abajo ---------- */
  let cantidad = 1;
  const controlCantidad = document.querySelector('.ficha__cantidad .mi-lista__cantidad');
  const [botonMenos, botonMas] = controlCantidad.querySelectorAll('button');
  const numeroCantidad = controlCantidad.querySelector('output');
  const totalPrecio = document.querySelector('.ficha__total-precio');
  const botonPedir = document.querySelector('.ficha__pedir');
  const botonAgregar = document.querySelector('.ficha__agregar');
  const barraWhatsApp = document.querySelector('.barra-whatsapp');

  function tamanoElegido() {
    return document.querySelector('.tamano input:checked').value;
  }

  function actualizarCompra() {
    const tamano = tamanoElegido();
    const datos = datosTamano(p, tamano);

    numeroCantidad.textContent = cantidad;
    botonMenos.disabled = cantidad <= 1;
    botonMas.disabled = cantidad >= 10;

    totalPrecio.textContent = datos.precio == null ? 'Se confirma por WhatsApp' : precioTexto(datos.precio * cantidad);

    // "Hola, quiero pedir 2 × Supremacy de Afnan (decant 10 ml)."
    const mensaje = 'Hola, quiero pedir ' + cantidad + ' × ' + p.nombre + ' de ' + p.marca + ' (' + datos.texto.toLowerCase() + ').';
    botonPedir.href = enlaceWhatsApp(mensaje);
    barraWhatsApp.href = enlaceWhatsApp(mensaje);

    // "Agregar a mi lista" dice si este perfume, en este tamaño, ya está en la lista
    const dentro = estaEnLista(p.id, tamano);
    botonAgregar.setAttribute('aria-pressed', dentro ? 'true' : 'false');
    botonAgregar.textContent = dentro ? 'En mi lista ✓ · Quitar' : 'Agregar a mi lista';
  }

  botonMenos.addEventListener('click', function () { cantidad = Math.max(1, cantidad - 1); actualizarCompra(); });
  botonMas.addEventListener('click', function () { cantidad = Math.min(10, cantidad + 1); actualizarCompra(); });
  document.querySelector('.ficha__tamanos').addEventListener('change', actualizarCompra);

  botonAgregar.addEventListener('click', function () {
    const tamano = tamanoElegido();
    if (estaEnLista(p.id, tamano)) {
      quitarDeLista(p.id, tamano);
    } else {
      agregarALista(p.id, tamano, cantidad);
    }
  });

  // Si la lista cambia (aquí, en una tarjeta de abajo o en otra pestaña), el botón se actualiza
  alCambiarLista(actualizarCompra);
  actualizarCompra();

  /* ---------- Cuándo llega ---------- */
  const entrega = document.querySelector('.ficha__entrega');
  const fechas = fechasDeEntrega();
  if (fechas) {
    const formato = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    entrega.textContent = 'Si pides hoy, llega entre el ' + formato.format(fechas.desde) + ' y el ' + formato.format(fechas.hasta) + '.';
  } else {
    entrega.remove(); // sin días de entrega del cliente, mejor no mostrar fechas inventadas
  }

  /* ---------- Cómo huele ---------- */
  document.querySelector('.ficha__descripcion').textContent = p.descripcion || p.notas || '';

  const piramide = document.querySelector('.ficha__piramide');
  const notas = p.piramide || {};
  const valores = [notas.salida, notas.corazon, notas.fondo];
  piramide.querySelectorAll(':scope > div').forEach(function (fila, i) {
    if (valores[i]) {
      fila.querySelector('dd').textContent = valores[i];
    } else {
      fila.remove();
    }
  });
  if (!piramide.children.length) piramide.remove();

  const medidas = document.querySelector('.ficha__medidas');
  const filas = medidas.querySelectorAll('.medida');
  const barras = medidas.querySelectorAll('.barra');
  if (typeof p.duracion === 'number' && p.duracion > 0) {
    filas[0].lastElementChild.textContent = p.duracion + ' h';
    barras[0].firstElementChild.style.width = Math.min(100, Math.round(p.duracion / 12 * 100)) + '%';
  } else {
    filas[0].remove();
    barras[0].remove();
  }
  if (BARRA_INTENSIDAD[p.intensidad]) {
    filas[1].lastElementChild.textContent = p.intensidad;
    barras[1].firstElementChild.style.width = BARRA_INTENSIDAD[p.intensidad] + '%';
  } else {
    filas[1].remove();
    barras[1].remove();
  }
  if (!medidas.querySelector('.medida')) medidas.remove();

  /* ---------- Cuándo usarlo ---------- */
  const seccionMomentos = document.querySelector('.ficha__momentos');
  if (p.momentos && p.momentos.length) {
    const listaMomentos = seccionMomentos.querySelector('ul');
    listaMomentos.replaceChildren();
    p.momentos.forEach(function (momento) {
      listaMomentos.append(crear('li', null, momento));
    });
  } else {
    seccionMomentos.remove();
  }

  // La guía "¿Frasco o decant?" solo tiene sentido si el perfume viene en decant
  if (!p.decant && !p.decant5) document.querySelector('.ficha__guia').remove();

  /* ---------- También te puede gustar: primero el mismo aroma, después el mismo tipo (4 en total) ---------- */
  const mismoAroma = PERFUMES.filter(function (otro) { return otro.id !== p.id && otro.aroma === p.aroma; });
  const mismoTipo = PERFUMES.filter(function (otro) {
    return otro.id !== p.id && otro.aroma !== p.aroma && otro.tipo === p.tipo;
  });
  const parecidos = mismoAroma.concat(mismoTipo).slice(0, 4);
  const seccionParecidos = document.querySelector('.ficha__relacionados');
  if (parecidos.length) {
    const listaParecidos = seccionParecidos.querySelector('.catalogo__lista');
    parecidos.forEach(function (otro) {
      listaParecidos.append(tarjetaPerfume(otro));
    });
  } else {
    seccionParecidos.remove();
  }
}

/* ---------- Fechas de entrega: días hábiles (lunes a viernes) desde hoy ---------- */
// Si ya pasó la hora de corte, se empieza a contar desde mañana.
// OJO: no cuenta festivos de Colombia; por eso el mensaje dice "entre" dos fechas
function fechasDeEntrega() {
  if (ENTREGA.diasMin == null || ENTREGA.diasMax == null || ENTREGA.horaCorte == null) return null;
  const hoy = new Date();
  const inicio = new Date(hoy);
  if (hoy.getHours() >= ENTREGA.horaCorte) inicio.setDate(inicio.getDate() + 1);

  function sumarHabiles(desde, dias) {
    const fecha = new Date(desde);
    let contados = 0;
    while (contados < dias) {
      fecha.setDate(fecha.getDate() + 1);
      const dia = fecha.getDay();
      if (dia !== 0 && dia !== 6) contados++;
    }
    return fecha;
  }
  return { desde: sumarHabiles(inicio, ENTREGA.diasMin), hasta: sumarHabiles(inicio, ENTREGA.diasMax) };
}
