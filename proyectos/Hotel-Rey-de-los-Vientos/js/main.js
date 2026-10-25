const form = document.getElementById('reserva-form');
const llegada = document.getElementById('llegada');
const salida = document.getElementById('salida');
const huespedes = document.getElementById('huespedes');

const NUMERO = '573147772991'; // 57 + número del dueño, sin + ni espacios

// no permitir fechas pasadas
const hoy = new Date().toISOString().split('T')[0];
llegada.min = hoy;

// la salida no puede ser antes de la llegada
llegada.addEventListener('change', () => {
  salida.min = llegada.value;
  if (salida.value && salida.value < llegada.value) salida.value = '';
});

const formatear = f => f.split('-').reverse().join('/'); // 2026-11-10 → 10/11/2026

form.addEventListener('submit', e => {
  e.preventDefault();

  if (salida.value <= llegada.value) {
    alert('La salida debe ser después de la llegada.');
    return;
  }

  const mensaje =
    `Hola, quiero consultar disponibilidad en Rey de los Vientos.\n` +
    `Llegada: ${formatear(llegada.value)}\n` +
    `Salida: ${formatear(salida.value)}\n` +
    `Huéspedes: ${huespedes.value}`;

  window.open(
    `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`,
    '_blank'
  );
});


