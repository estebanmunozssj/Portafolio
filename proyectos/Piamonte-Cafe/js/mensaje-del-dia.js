'use strict';

// Ícono del grano: la copia dentro de la página si existe (Mi tarjeta), si no el archivo img/iconos.svg
const GRANO_MARQUESINA = document.getElementById('i-grano') ? '#i-grano' : 'img/iconos.svg#grano';

/* =========================================================
   MENSAJE DEL DÍA (marquesina de fidelidad.html)
   Mensajes para la vida, no del café: uno distinto cada día.
   Son 31 para que no se repitan en un mes. Para cambiar o agregar, edita la lista
   (cortos: se leen mientras se mueven)
   ========================================================= */

const MENSAJES_DEL_DIA = [
  'Hoy no tienes que tenerlo todo resuelto. Con dar el siguiente paso basta.',
  'Lo que siembras despacio también da fruto. Ten paciencia contigo.',
  'Llama hoy a alguien que quieres. Esa llamada les alegra el día a los dos.',
  'Descansar también es avanzar.',
  'Celebra lo pequeño: llegaste hasta aquí.',
  'Una sonrisa a tiempo le cambia el día a alguien.',
  'Eres más fuerte de lo que te dijiste ayer.',
  'Los días difíciles también terminan. Mañana se vuelve a empezar.',
  'Agradece algo hoy, aunque sea pequeño.',
  'Hacer las cosas con cariño siempre se nota.',
  'Pide ayuda sin pena. Nadie llega lejos solo.',
  'Tu ritmo es tu ritmo. No te compares con nadie.',
  'Hoy es un buen día para perdonarte un error.',
  'Las buenas noticias también existen. Hoy puedes ser una.',
  'Sal un rato, mira el cielo y respira hondo.',
  'Lo que hoy te cuesta, mañana te sale solo.',
  'Escuchar con calma a alguien es un regalo enorme.',
  'No dejes para después el abrazo que puedes dar hoy.',
  'Aquí siempre hay un lugar para ti.',
  'Un paso chiquito sigue siendo un paso.',
  'Cuida tus palabras: alguien las va a recordar.',
  'Las cosas buenas toman tiempo. Tú también.',
  'Hoy prueba algo nuevo, aunque sea otro camino a casa.',
  'Rodéate de gente que te haga reír.',
  'Lo que haces con amor nunca es tiempo perdido.',
  'Mereces las cosas bonitas que te pasan.',
  'Si hoy no salió, mañana hay otra oportunidad.',
  'Dile a alguien cuánto lo aprecias. Nunca sobra.',
  'La vida se disfruta más despacio.',
  'Tus sueños no tienen fecha de vencimiento.',
  'Que hoy tengas más motivos para sonreír que para preocuparte.'
];

(() => {
  const marquesina = document.getElementById('mensaje-del-dia');
  if (!marquesina) return;

  // Día del año según la hora de Colombia del celular: cambia a medianoche, igual para todos ese día
  const hoy = new Date();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((hoy - inicioAnio) / 86400000);
  const mensaje = MENSAJES_DEL_DIA[diaDelAnio % MENSAJES_DEL_DIA.length];

  // Dos copias iguales seguidas: la pista se corre la mitad y vuelve a empezar sin que se note el salto.
  // La segunda copia es solo para la animación: los lectores de pantalla la ignoran
  const grupo = (copia) => `
    <ul class="marquesina-grupo"${copia ? ' aria-hidden="true"' : ''}>
      ${[0, 1].map((n) => `
        <li${n ? ' aria-hidden="true"' : ''}>
          <span class="mensaje-etiqueta">Mensaje del día</span>
          <svg class="marquesina-grano" aria-hidden="true"><use href="${GRANO_MARQUESINA}"/></svg>
          <span class="mensaje-texto">${mensaje}</span>
        </li>`).join('')}
    </ul>`;

  marquesina.querySelector('.marquesina-pista').innerHTML = grupo(false) + grupo(true);
  marquesina.hidden = false;
})();
