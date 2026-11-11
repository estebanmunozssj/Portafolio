// =============================================
// Página del consultorio: ver y cancelar las citas de un día.
// =============================================

sembrarEjemplos();

const listaDias = document.getElementById('lista-dias');
const ficha = document.getElementById('ficha-dia');
const listaCitas = document.getElementById('lista-citas');
const resumenDia = document.getElementById('resumen-dia');

let fechaElegida = proximosDiasHabiles(1)[0];

// ---------- Días ----------
listaDias.innerHTML = proximosDiasHabiles(DIAS_A_MOSTRAR).map((texto) => {
  const fecha = textoAFecha(texto);
  const corto = fecha.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '');
  const mes = fecha.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return `
    <label class="dia">
      <input type="radio" name="dia" value="${texto}" aria-label="${fechaLarga(texto)}" ${texto === fechaElegida ? 'checked' : ''}>
      <span class="dia-semana">${texto === hoyTexto() ? 'Hoy' : corto}</span>
      <span class="dia-numero">${fecha.getDate()}</span>
      <span class="dia-mes">${mes}</span>
    </label>`;
}).join('');

listaDias.addEventListener('change', (e) => {
  fechaElegida = e.target.value;
  dibujarDia();
});

// ---------- Ficha y lista del día ----------
function dibujarDia() {
  const citas = citasDelDia(fechaElegida);

  // Resumen: cuántas citas y cuánto tiempo ocupado
  const minutos = citas.reduce((total, c) => total + buscarServicio(c.servicio).minutos, 0);
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  const tiempo = horas ? `${horas} h ${resto ? resto + ' min' : ''}` : `${resto} min`;
  resumenDia.textContent = citas.length
    ? `${fechaLarga(fechaElegida)} · ${citas.length} ${citas.length === 1 ? 'cita' : 'citas'} · ${tiempo.trim()} ocupados`
    : `${fechaLarga(fechaElegida)} · Sin citas todavía`;

  // Ficha: cada media hora, libre u ocupada (de solo lectura)
  // Ficha de solo lectura: las horas libres se ven tranquilas (no son botones)
  // y cada hora ocupada es un enlace a la tarjeta de su paciente.
  ficha.innerHTML = bloquesDelDia(fechaElegida).map(([inicio, fin], i) => {
    const celdas = [];
    for (let m = inicio; m < fin; m += PASO_MINUTOS) {
      const cita = citas.find((c) => {
        const [ini, f] = rangoDeCita(c);
        return m >= ini && m < f;
      });
      celdas.push(cita
        ? `<a class="celda ocupada" href="#cita-${cita.id}">
             <span>${horaCorta(aHora(m))}</span><span class="oculto">, ocupada: ver paciente</span>
           </a>`
        : `<span class="celda registro">
             <span>${horaCorta(aHora(m))}</span><span class="oculto">, libre</span>
           </span>`);
    }
    const linea = i > 0 ? '<p class="linea-almuerzo">Almuerzo · 12:00 m. a 2:00 p. m.</p>' : '';
    return `${linea}
      <div class="fila">
        <p class="fila-titulo">${inicio < 720 ? 'Mañana' : 'Tarde'}</p>
        <div class="celdas">${celdas.join('')}</div>
      </div>`;
  }).join('');

  // Lista de pacientes
  if (!citas.length) {
    listaCitas.innerHTML = '<li class="vacio">No hay citas para este día. Cuando un paciente reserve, aparece aquí.</li>';
    return;
  }

  listaCitas.innerHTML = '';
  citas.forEach((cita) => {
    const servicio = buscarServicio(cita.servicio);
    const [ini, fin] = rangoDeCita(cita);
    const item = document.createElement('li');
    item.className = 'cita';
    item.id = `cita-${cita.id}`;
    item.innerHTML = `
      <p class="cita-hora">${horaCorta(aHora(ini))} – ${horaLarga(aHora(fin))}</p>
      <p class="cita-nombre"></p>
      <p class="cita-servicio">${servicio.nombre} · ${servicio.minutos} min · ${precioTexto(servicio.precio)}</p>
      <p class="cita-contacto">
        <a class="enlace" href="tel:+57${cita.telefono}">Llamar</a>
        <a class="enlace" href="https://wa.me/57${cita.telefono}" target="_blank" rel="noopener">WhatsApp</a>
      </p>
      <div class="cita-peligro">
        <button type="button" class="boton-cancelar" data-id="${cita.id}">Cancelar cita</button>
      </div>`;
    // El nombre lo escribió el paciente: va como texto, nunca como HTML
    const nombre = item.querySelector('.cita-nombre');
    nombre.textContent = cita.nombre;
    if (cita.ejemplo) {
      const marca = document.createElement('span');
      marca.className = 'marca-ejemplo';
      marca.textContent = 'ejemplo';
      nombre.append(' ', marca);
    }
    // Las citas de ejemplo tienen un teléfono inventado: sin enlaces
    if (cita.ejemplo) item.querySelector('.cita-contacto').remove();
    listaCitas.append(item);
  });
}

// ---------- Cancelar (con confirmación, porque no se puede deshacer) ----------
listaCitas.addEventListener('click', (e) => {
  const boton = e.target.closest('.boton-cancelar');
  if (!boton) return;
  const cita = leerCitas().find((c) => c.id === boton.dataset.id);
  const seguro = confirm(`¿Cancelar la cita de ${cita.nombre} a las ${horaLarga(cita.hora)}? No se puede deshacer.`);
  if (!seguro) return;
  guardarCitas(leerCitas().filter((c) => c.id !== cita.id));
  dibujarDia();
  resumenDia.focus();
});

dibujarDia();
