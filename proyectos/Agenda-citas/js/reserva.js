// =============================================
// Página del paciente: reservar en 4 pasos.
// =============================================

sembrarEjemplos();

// Lo que el paciente va eligiendo
const eleccion = { servicio: null, fecha: null, hora: null };

const formulario = document.getElementById('formulario-cita');
const pasos = document.querySelectorAll('.paso');
const barras = document.querySelectorAll('.progreso i');
const textoPaso = document.getElementById('paso-n');
let pasoActual = 1;

// ---------- Paso 1: dibujar los servicios ----------
const listaServicios = document.getElementById('lista-servicios');
listaServicios.innerHTML = SERVICIOS.map((s) => `
  <label class="servicio">
    <input type="radio" name="servicio" value="${s.id}">
    <span class="servicio-nombre">${s.nombre}</span>
    <span class="servicio-datos">${s.minutos} min · ${precioTexto(s.precio)}</span>
  </label>
`).join('');

listaServicios.addEventListener('change', (e) => {
  eleccion.servicio = e.target.value;
  eleccion.hora = null; // otra duración: la hora elegida puede ya no servir
  ocultarError(1);
});

// ---------- Paso 2: dibujar los días ----------
const listaDias = document.getElementById('lista-dias');

// Cada día muestra cuántas horas libres tiene para el servicio elegido,
// así nadie tiene que entrar a un día lleno para descubrirlo.
function dibujarDias() {
  const servicio = buscarServicio(eleccion.servicio);
  listaDias.innerHTML = proximosDiasHabiles(DIAS_A_MOSTRAR).map((texto) => {
    const fecha = textoAFecha(texto);
    const corto = fecha.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
    const esHoy = texto === hoyTexto();
    const libres = horasDelDia(texto, servicio.minutos)
      .reduce((total, b) => total + b.horas.filter((h) => h.estado === 'libre').length, 0);
    const disponibilidad = libres === 0 ? 'Lleno' : `${libres} libres`;
    return `
      <label class="dia ${libres === 0 ? 'lleno' : ''}">
        <input type="radio" name="dia" value="${texto}"
          aria-label="${fechaLarga(texto)}, ${libres === 0 ? 'sin horas libres' : libres + ' horas libres'}"
          ${libres === 0 ? 'disabled' : ''} ${texto === eleccion.fecha ? 'checked' : ''}>
        <span class="dia-semana">${esHoy ? 'Hoy' : corto}</span>
        <span class="dia-numero">${fecha.getDate()}</span>
        <span class="dia-libres">${disponibilidad}</span>
      </label>
    `;
  }).join('');
}

listaDias.addEventListener('change', (e) => {
  eleccion.fecha = e.target.value;
  eleccion.hora = null;
  ocultarError(2);
});

// ---------- Paso 3: dibujar la ficha de horas ----------
const ficha = document.getElementById('ficha-horas');

function dibujarFicha() {
  const servicio = buscarServicio(eleccion.servicio);
  const bloques = horasDelDia(eleccion.fecha, servicio.minutos);
  const hayLibres = bloques.some((b) => b.horas.some((h) => h.estado === 'libre'));

  const textoEstado = {
    'ocupada': 'ocupada',
    'no-alcanza': 'no alcanza el tiempo',
    'pasada': 'ya pasó',
  };

  const partes = bloques.map((bloque, i) => {
    const celdas = bloque.horas.map((h) => {
      const libre = h.estado === 'libre';
      const marcada = libre && h.hora === eleccion.hora ? 'checked' : '';
      return `
        <label class="celda ${h.estado}">
          <input type="radio" name="hora" value="${h.hora}" ${libre ? '' : 'disabled'} ${marcada}>
          <span>${horaCorta(h.hora)}</span>
          ${libre ? '' : `<span class="oculto">, ${textoEstado[h.estado]}</span>`}
        </label>`;
    }).join('');

    // Entre la mañana y la tarde va la línea del almuerzo
    const linea = i > 0 ? '<p class="linea-almuerzo">Almuerzo · 12:00 m. a 2:00 p. m.</p>' : '';
    return `${linea}
      <div class="fila" role="group" aria-label="${bloque.nombre}">
        <p class="fila-titulo">${bloque.nombre}</p>
        <div class="celdas">${celdas}</div>
      </div>`;
  }).join('');

  ficha.innerHTML = hayLibres
    ? partes
    : `${partes}<p class="vacio">Este día ya no tiene horas para ${servicio.nombre.toLowerCase()}. Prueba con otro día.</p>`;
}

ficha.addEventListener('change', (e) => {
  eleccion.hora = e.target.value;
  ocultarError(3);
  actualizarBotonHora();
});

// El botón Seguir del paso 3 repite el día y la hora elegidos
function actualizarBotonHora() {
  const boton = document.querySelector('[data-paso="3"] .boton');
  boton.textContent = eleccion.hora
    ? `Seguir: ${fechaCorta(eleccion.fecha)}, ${horaLarga(eleccion.hora)}`
    : 'Seguir';
}

function fechaCorta(texto) {
  // En el celular, 'mar 10' (corta, para que quepa en el botón).
  // En pantallas más anchas, 'martes 10'.
  const fecha = textoAFecha(texto);
  const ancho = window.matchMedia('(min-width: 560px)').matches ? 'long' : 'short';
  const dia = fecha.toLocaleDateString('es-CO', { weekday: ancho }).replace('.', '');
  return `${dia} ${fecha.getDate()}`;
}

// ---------- Resúmenes de lo elegido ----------
function textoServicio() {
  const s = buscarServicio(eleccion.servicio);
  return `${s.nombre} · ${s.minutos} min · ${precioTexto(s.precio)}`;
}

function escribirResumenes() {
  if (eleccion.servicio) {
    document.getElementById('resumen-2').textContent = textoServicio();
  }
  if (eleccion.servicio && eleccion.fecha) {
    document.getElementById('resumen-3').textContent = `${textoServicio()} · ${fechaLarga(eleccion.fecha)}`;
  }
  if (eleccion.hora) {
    document.getElementById('resumen-4').textContent =
      `${buscarServicio(eleccion.servicio).nombre} · ${fechaLarga(eleccion.fecha)} · ${horaLarga(eleccion.hora)}`;
  }
}

// ---------- Moverse entre pasos ----------
function mostrarError(paso) {
  document.getElementById(`error-${paso}`).hidden = false;
}

function ocultarError(paso) {
  document.getElementById(`error-${paso}`).hidden = true;
}

// Antes de avanzar, revisamos que el paso actual esté completo
function pasoCompleto(paso) {
  if (paso === 1) return Boolean(eleccion.servicio);
  if (paso === 2) return Boolean(eleccion.fecha);
  if (paso === 3) return Boolean(eleccion.hora);
  return true;
}

function irAPaso(destino) {
  // Solo se puede avanzar si el paso actual está completo (retroceder siempre se puede)
  if (destino > pasoActual && !pasoCompleto(pasoActual)) {
    mostrarError(pasoActual);
    return;
  }

  if (destino === 2) {
    // Si el día elegido ya no sirve para el nuevo servicio, se borra
    dibujarDias();
    if (eleccion.fecha && !listaDias.querySelector('input:checked')) eleccion.fecha = null;
  }
  if (destino === 3) {
    dibujarFicha();
    actualizarBotonHora();
  }
  escribirResumenes();

  pasos.forEach((p) => { p.hidden = Number(p.dataset.paso) !== destino; });
  barras.forEach((b, i) => b.classList.toggle('activa', i < destino));
  textoPaso.textContent = `Paso ${destino} de 4`;
  pasoActual = destino;

  // Llevamos el foco al título del paso (ayuda a lectores de pantalla y teclado)
  document.querySelector(`[data-paso="${destino}"] h2`).focus();
}

formulario.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-ir]');
  if (boton) irAPaso(Number(boton.dataset.ir));
});

// ---------- Paso 4: validar y reservar ----------
const campoNombre = document.getElementById('nombre');
const campoTelefono = document.getElementById('telefono');

function soloNumeros(texto) {
  return texto.replace(/\D/g, '');
}

function validarCampo(campo, valido, idError) {
  document.getElementById(idError).hidden = valido;
  campo.setAttribute('aria-invalid', String(!valido));
  return valido;
}

function nombreValido() {
  return validarCampo(campoNombre, campoNombre.value.trim().length >= 3, 'error-nombre');
}

function telefonoValido() {
  return validarCampo(campoTelefono, /^3\d{9}$/.test(soloNumeros(campoTelefono.value)), 'error-telefono');
}

// Validamos al salir del campo, no mientras la persona escribe
campoNombre.addEventListener('blur', () => { if (campoNombre.value) nombreValido(); });
campoTelefono.addEventListener('blur', () => { if (campoTelefono.value) telefonoValido(); });

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  const okNombre = nombreValido();
  const okTelefono = telefonoValido();
  if (!okNombre) { campoNombre.focus(); return; }
  if (!okTelefono) { campoTelefono.focus(); return; }

  // Revisamos otra vez que la hora siga libre (pudo ocuparse mientras tanto)
  const servicio = buscarServicio(eleccion.servicio);
  const sigueLibre = horasDelDia(eleccion.fecha, servicio.minutos)
    .some((b) => b.horas.some((h) => h.hora === eleccion.hora && h.estado === 'libre'));

  const errorFinal = document.getElementById('error-4');
  if (!sigueLibre) {
    errorFinal.textContent = 'Esa hora se acaba de ocupar. Vuelve al paso 3 y elige otra.';
    errorFinal.hidden = false;
    return;
  }

  const cita = {
    id: String(Date.now()),
    fecha: eleccion.fecha,
    hora: eleccion.hora,
    servicio: eleccion.servicio,
    nombre: campoNombre.value.trim(),
    telefono: soloNumeros(campoTelefono.value),
  };

  if (!guardarCitas([...leerCitas(), cita])) {
    errorFinal.textContent = 'Tu navegador no deja guardar la cita. Prueba sin modo incógnito.';
    errorFinal.hidden = false;
    return;
  }

  mostrarConfirmacion(cita);
});

// ---------- Confirmación ----------
function mostrarConfirmacion(cita) {
  const servicio = buscarServicio(cita.servicio);

  document.getElementById('resumen-cita').innerHTML = `
    <div><dt>Servicio</dt><dd>${servicio.nombre} · ${precioTexto(servicio.precio)}</dd></div>
    <div><dt>Día</dt><dd>${fechaLarga(cita.fecha)}</dd></div>
    <div><dt>Hora</dt><dd>${horaLarga(cita.hora)} (${servicio.minutos} min)</dd></div>
    <div><dt>Paciente</dt><dd></dd></div>
  `;
  // El nombre lo escribe la persona: lo ponemos como texto, nunca como HTML
  document.querySelector('#resumen-cita div:last-child dd').textContent = cita.nombre;

  const mensaje =
    `Hola, soy ${cita.nombre}. Tengo cita de ${servicio.nombre.toLowerCase()} en Sonrisa Yotoco ` +
    `el ${fechaLarga(cita.fecha)} a las ${horaLarga(cita.hora)}. Dirección: Calle 5 # 4-20, Yotoco.`;
  document.getElementById('enviar-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  formulario.hidden = true;
  document.querySelector('.progreso').hidden = true;
  textoPaso.hidden = true;
  const confirmacion = document.getElementById('confirmacion');
  confirmacion.hidden = false;
  confirmacion.querySelector('h2').focus();
}

// Empezar de nuevo
document.getElementById('otra-cita').addEventListener('click', () => {
  formulario.reset();
  Object.keys(eleccion).forEach((k) => { eleccion[k] = null; });
  formulario.hidden = false;
  document.querySelector('.progreso').hidden = false;
  textoPaso.hidden = false;
  document.getElementById('confirmacion').hidden = true;
  irAPaso(1);
});

// Al cargar: paso 1
barras[0].classList.add('activa');
