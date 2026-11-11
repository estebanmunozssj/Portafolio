// =============================================
// Datos del consultorio (ficticios)
// Si cambias un precio o un horario, se cambia aquí y nada más.
// =============================================

// Servicios: cada uno con su duración en minutos.
// La duración decide qué horas quedan libres.
const SERVICIOS = [
  { id: 'valoracion',     nombre: 'Valoración',     minutos: 30, precio: 0 },
  { id: 'limpieza',       nombre: 'Limpieza',       minutos: 45, precio: 80000 },
  { id: 'resina',         nombre: 'Resina (calza)', minutos: 60, precio: 120000 },
  { id: 'extraccion',     nombre: 'Extracción',     minutos: 45, precio: 150000 },
  { id: 'blanqueamiento', nombre: 'Blanqueamiento', minutos: 60, precio: 350000 },
];

// Horario por día de la semana (0 = domingo, 6 = sábado).
// Cada día tiene uno o dos bloques: [inicio, fin].
const HORARIO = {
  0: [],                                     // domingo: cerrado
  1: [['08:00', '12:00'], ['14:00', '18:00']],
  2: [['08:00', '12:00'], ['14:00', '18:00']],
  3: [['08:00', '12:00'], ['14:00', '18:00']],
  4: [['08:00', '12:00'], ['14:00', '18:00']],
  5: [['08:00', '12:00'], ['14:00', '18:00']],
  6: [['08:00', '12:00']],                   // sábado: solo mañana
};

// Las citas pueden empezar cada 30 minutos.
const PASO_MINUTOS = 30;

// Cuántos días hábiles mostramos para elegir.
const DIAS_A_MOSTRAR = 12;
