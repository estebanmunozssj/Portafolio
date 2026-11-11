// =============================================
// Lógica de la agenda: horas, fechas y citas guardadas.
// La usan las dos páginas (paciente y consultorio).
// =============================================

const CLAVE_CITAS = 'sonrisa-yotoco-citas';

// ---------- Horas ----------

// '08:30' -> 510 (minutos desde la medianoche)
function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// 510 -> '08:30'
function aHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// '14:30' -> '2:30' (corta, para la ficha, donde ya dice MAÑANA o TARDE)
function horaCorta(hora) {
  const [h, m] = hora.split(':').map(Number);
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')}`;
}

// '14:30' -> '2:30 p. m.' (completa, para resúmenes)
function horaLarga(hora) {
  const h = Number(hora.split(':')[0]);
  //   es un espacio que no deja partir "9:00 a. m." en dos líneas
  const sufijo = h < 12 ? 'a. m.' : h === 12 ? 'm.' : 'p. m.';
  return `${horaCorta(hora)} ${sufijo}`;
}

// ---------- Fechas ----------
// Guardamos las fechas como texto 'AAAA-MM-DD' para no tener líos de zona horaria.

function fechaATexto(fecha) {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

function textoAFecha(texto) {
  const [a, m, d] = texto.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function hoyTexto() {
  return fechaATexto(new Date());
}

// 'martes 10 de noviembre'
function fechaLarga(texto) {
  return textoAFecha(texto).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// Bloques de atención de una fecha, en minutos: [[480, 720], [840, 1080]]
function bloquesDelDia(texto) {
  const diaSemana = textoAFecha(texto).getDay();
  return HORARIO[diaSemana].map(([inicio, fin]) => [aMinutos(inicio), aMinutos(fin)]);
}

// Los próximos días en que el consultorio abre (empezando hoy).
function proximosDiasHabiles(cantidad) {
  const dias = [];
  const fecha = new Date();
  while (dias.length < cantidad) {
    const texto = fechaATexto(fecha);
    if (bloquesDelDia(texto).length > 0) dias.push(texto);
    fecha.setDate(fecha.getDate() + 1);
  }
  return dias;
}

// ---------- Servicios ----------

function buscarServicio(id) {
  return SERVICIOS.find((s) => s.id === id);
}

// 80000 -> '$80.000'  ·  0 -> 'Gratis'
function precioTexto(precio) {
  if (precio === 0) return 'Gratis';
  return '$' + precio.toLocaleString('es-CO');
}

// ---------- Citas guardadas (localStorage) ----------

function leerCitas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CITAS)) || [];
  } catch (error) {
    return []; // si el navegador bloquea el guardado, seguimos sin citas
  }
}

function guardarCitas(citas) {
  try {
    localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));
    return true;
  } catch (error) {
    return false;
  }
}

// Citas de una fecha, ordenadas por hora.
function citasDelDia(texto) {
  return leerCitas()
    .filter((c) => c.fecha === texto)
    .sort((a, b) => aMinutos(a.hora) - aMinutos(b.hora));
}

// Cada cita ocupa desde su hora hasta su hora + duración del servicio.
function rangoDeCita(cita) {
  const inicio = aMinutos(cita.hora);
  return [inicio, inicio + buscarServicio(cita.servicio).minutos];
}

// ---------- La ficha: qué horas sirven ----------
// Devuelve los bloques del día con cada hora y su estado:
//   'libre'    -> se puede reservar
//   'ocupada'  -> ya hay una cita encima
//   'no-alcanza' -> el servicio no termina antes del almuerzo o del cierre
//   'pasada'   -> la hora ya pasó (solo pasa hoy)
function horasDelDia(texto, minutosServicio) {
  const ocupados = citasDelDia(texto).map(rangoDeCita);
  const esHoy = texto === hoyTexto();
  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  return bloquesDelDia(texto).map(([inicioBloque, finBloque]) => {
    const horas = [];
    for (let m = inicioBloque; m < finBloque; m += PASO_MINUTOS) {
      const fin = m + minutosServicio;
      let estado = 'libre';

      // ¿Se cruza con alguna cita? (empieza antes de que la otra termine
      // y termina después de que la otra empiece)
      const choca = ocupados.some(([ini, f]) => m < f && fin > ini);
      // ¿Hay una cita que empieza justo en esta hora?
      const tapada = ocupados.some(([ini, f]) => m >= ini && m < f);

      if (esHoy && m <= minutosAhora) estado = 'pasada';
      else if (tapada) estado = 'ocupada';
      else if (fin > finBloque || choca) estado = 'no-alcanza';

      horas.push({ hora: aHora(m), estado });
    }
    return { nombre: inicioBloque < 720 ? 'Mañana' : 'Tarde', horas };
  });
}

// ---------- Citas de ejemplo ----------
// La primera vez, llenamos algunos días con citas inventadas
// para que la ficha no se vea vacía. Van marcadas como ejemplo.
function sembrarEjemplos() {
  try {
    if (localStorage.getItem(CLAVE_CITAS + '-ejemplos')) return;
  } catch (error) {
    return; // sin guardado no hay ejemplos
  }

  const patrones = [
    [['08:30', 'limpieza'], ['11:00', 'valoracion'], ['15:00', 'resina']],
    [['08:00', 'extraccion'], ['10:00', 'blanqueamiento'], ['14:30', 'valoracion'], ['16:00', 'limpieza']],
    [['09:00', 'resina'], ['11:00', 'limpieza'], ['15:30', 'valoracion']],
  ];
  const nombres = ['Ana Ruiz', 'Carlos Pérez', 'Luz Marina Gómez', 'Jhon Fredy Ortiz', 'Sofía Castaño', 'Don Álvaro Mejía', 'Valentina Rojas', 'Martha Lucía Cano'];

  const citas = leerCitas();
  let n = 0;
  proximosDiasHabiles(6).forEach((fecha, i) => {
    const cierre = Math.max(...bloquesDelDia(fecha).map(([, fin]) => fin));
    patrones[i % patrones.length].forEach(([hora, servicio]) => {
      if (aMinutos(hora) >= cierre) return; // el sábado no hay tarde
      citas.push({
        id: `ejemplo-${fecha}-${hora}`,
        fecha, hora, servicio,
        nombre: nombres[n % nombres.length],
        telefono: '3000000000',
        ejemplo: true,
      });
      n++;
    });
  });

  guardarCitas(citas);
  try { localStorage.setItem(CLAVE_CITAS + '-ejemplos', 'si'); } catch (e) {}
}
