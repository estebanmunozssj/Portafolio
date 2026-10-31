'use strict'; // Modo estricto: el navegador avisa de errores que de otro modo pasarían callados

const NUMERO = '573147772991'; // 57 + número del dueño, sin + ni espacios. CONFIRMAR que es el del hospedaje

/* ===== MENÚ HAMBURGUESA (celular) ===== */

(() => { // Cada bloque va envuelto para que sus variables no choquen con las de otros
  const boton = document.getElementById('menu-btn'); // Botón de las tres rayas
  const menu = document.getElementById('nav-menu'); // Contenedor de los enlaces
  if (!boton || !menu) return; // Si falta alguno, no hace nada en vez de dar error

  function ponerEstado(abierto) { // Deja el menú y el botón siempre en el mismo estado
    menu.classList.toggle('abierto', abierto); // Muestra u oculta el menú
    boton.classList.toggle('activo', abierto); // Convierte la hamburguesa en X
    boton.setAttribute('aria-expanded', String(abierto)); // Avisa a lectores de pantalla
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú'); // El botón dice lo que hará
  }

  boton.addEventListener('click', () => { // Al tocar la hamburguesa...
    ponerEstado(!menu.classList.contains('abierto')); // ...abre si estaba cerrado, cierra si estaba abierto
  });

  menu.querySelectorAll('a').forEach((a) => { // Recorre cada enlace del menú
    a.addEventListener('click', () => ponerEstado(false)); // Al tocar uno, cierra el menú
  });

  document.addEventListener('keydown', (e) => { // Con la tecla Esc...
    if (e.key !== 'Escape' || !menu.classList.contains('abierto')) return;
    ponerEstado(false); // ...cierra el menú
    boton.focus(); // Y devuelve el foco al botón
  });

  document.addEventListener('click', (e) => { // Al tocar fuera del menú...
    if (!menu.classList.contains('abierto')) return;
    if (menu.contains(e.target) || boton.contains(e.target)) return; // (si tocó dentro, no hace nada)
    ponerEstado(false); // ...lo cierra
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { // Si la pantalla pasa a ser de computador...
    if (e.matches) ponerEstado(false); // ...deja el botón en estado "cerrado"
  });
})();

/* ===== AÑO DEL PIE DE PÁGINA ===== */

(() => {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear(); // Se actualiza solo cada año
})();

/* ===== BUSCADOR: CONSULTAR DISPONIBILIDAD POR WHATSAPP ===== */

(() => {
  const form = document.getElementById('reserva-form');
  const llegada = document.getElementById('llegada');
  const salida = document.getElementById('salida');
  const huespedes = document.getElementById('huespedes');
  if (!form || !llegada || !salida || !huespedes) return;

  // Fechas en formato AAAA-MM-DD usando la hora LOCAL (toISOString usa hora UTC y en Colombia, de noche, daría "mañana")
  const aTexto = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const sumarDias = (texto, dias) => { // Devuelve la fecha 'texto' más 'dias' días
    const [a, m, d] = texto.split('-').map(Number);
    return aTexto(new Date(a, m - 1, d + dias));
  };

  const noches = (desde, hasta) => { // Cuántas noches hay entre dos fechas
    const [a1, m1, d1] = desde.split('-').map(Number);
    const [a2, m2, d2] = hasta.split('-').map(Number);
    return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
  };

  const formatear = (f) => f.split('-').reverse().join('/'); // 2026-11-10 → 10/11/2026

  // No permitir fechas pasadas, y la salida mínimo un día después de la llegada
  const hoy = aTexto(new Date());
  llegada.min = hoy;
  salida.min = sumarDias(hoy, 1);

  llegada.addEventListener('change', () => { // Al elegir la llegada...
    if (!llegada.value) return;
    salida.min = sumarDias(llegada.value, 1); // ...la salida solo puede ser desde el día siguiente
    if (salida.value && salida.value < salida.min) salida.value = ''; // Si ya no sirve, la borra
    salida.setCustomValidity(''); // Quita cualquier aviso anterior
  });

  salida.addEventListener('input', () => salida.setCustomValidity('')); // Al corregir la salida, quita el aviso

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (salida.value <= llegada.value) { // Por si el navegador dejó pasar fechas incoherentes
      salida.setCustomValidity('La salida debe ser después de la llegada.');
      salida.reportValidity(); // Muestra el aviso junto al campo, sin alert()
      return;
    }

    const mensaje =
      `Hola, quiero consultar disponibilidad en Rey de los Vientos.\n` +
      `Llegada: ${formatear(llegada.value)}\n` +
      `Salida: ${formatear(salida.value)}\n` +
      `Noches: ${noches(llegada.value, salida.value)}\n` +
      `Huéspedes: ${huespedes.value}`;

    window.open(
      `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`,
      '_blank',
      'noopener,noreferrer'
    );
  });
})();