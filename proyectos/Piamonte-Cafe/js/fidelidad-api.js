'use strict';

/* =========================================================
   TARJETA DE SELLOS: conexión con Google
   La usan fidelidad.html (cliente) y panel.html (barista)
   ========================================================= */

// Dirección del Apps Script publicado (termina en /exec). Guía: fidelizacion/INSTALAR.md
const URL_TARJETA = '';

// Dominios donde la tarjeta es DE VERDAD (guarda en la hoja de Google del café), ej: ['piamontecafe.com', 'www.piamontecafe.com']
// En cualquier otro (el portafolio, localhost) funciona en MODO DEMO: todo se guarda en ese navegador.
// Así los mismos archivos sirven en el portafolio sin que los visitantes escriban en la hoja del café
const DOMINIOS_REALES = [];

// Para probar la conexión real desde tu computador antes de publicar: abre la página con ?real al final
// (ej. http://localhost:8767/fidelidad.html?real). Los datos de prueba quedan en la hoja: bórralos después
const PRUEBA_REAL = new URLSearchParams(location.search).has('real');

const MODO_DEMO = !URL_TARJETA || !(DOMINIOS_REALES.includes(location.hostname) || PRUEBA_REAL);

// Envía una acción y devuelve la respuesta, ej: await pedirTarjeta('tarjeta', { celular: '3168798017' })
async function pedirTarjeta(accion, datos = {}) {
  if (MODO_DEMO) return demo(accion, datos);

  try {
    const respuesta = await fetch(URL_TARJETA, {
      method: 'POST',
      // text/plain y no application/json: así el navegador no hace una pregunta previa que Google no responde
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ accion, ...datos })
    });
    return await respuesta.json();
  } catch (error) {
    return { ok: false, error: 'sin_conexion' };
  }
}

// Mensajes para la persona según el error que devuelve Google
const MENSAJES_ERROR = {
  celular_invalido: 'Revisa el celular: deben ser 10 números y empezar por 3.',
  nombre_invalido: 'Escribe tu nombre.',
  falta_autorizacion: 'Para guardar tus sellos necesitamos tu autorización.',
  no_existe: 'Ese celular no tiene tarjeta todavía.',
  tarjeta_llena: 'La tarjeta está llena: primero canjea el premio.',
  muy_pronto: 'A este cliente le pusieron un sello hace menos de 10 minutos.',
  faltan_sellos: 'Todavía no completa la tarjeta.',
  sin_sellos: 'No tiene sellos para quitar.',
  pin_incorrecto: 'PIN incorrecto.',
  bloqueado: 'Demasiados intentos. Espera 10 minutos.',
  sin_pin: 'Falta configurar el PIN (ver guía de instalación).',
  sin_conexion: 'No hay conexión. Revisa el internet e intenta otra vez.'
};

function mensajeError(codigo) {
  return MENSAJES_ERROR[codigo] || 'Algo salió mal. Intenta otra vez.';
}

/* =========================================================
   MENSAJES DE LA TARJETA: uno según cuántos sellos lleva la persona
   Hay 2 por cada número y cambian según el día, para que no se vuelvan paisaje.
   Escritos para 10 sellos: si cambia la meta, revisa los números que se mencionan
   ========================================================= */
const MENSAJES_SELLOS = {
  0: ['Tu tarjeta ya está lista. El primer sello llega con tu próximo café.',
      'Qué bueno tenerte aquí. Este café viene de nuestra finca en Dopo.'],
  1: ['Primer grano en tu tarjeta. Así empiezan las buenas costumbres.',
      'Arrancaste. Ya vas en camino a tu café por la casa.'],
  2: ['Dos cafés con nosotros. Ya te vamos conociendo el gusto.',
      'Dos sellos. Esa tarde de café te quedó sonando, ¿cierto?'],
  3: ['Tres de diez. Vas a muy buen ritmo.',
      'Tres sellos. Ya eres de los que vuelven.'],
  4: ['Cuatro sellos. Tu próxima tarde de café también suma.',
      'Vas en cuatro. La tarjeta se está poniendo bonita.'],
  5: ['Mitad de la tarjeta. De aquí pa’llá es bajada.',
      'Cinco sellos. Ya hiciste la mitad del camino.'],
  6: ['Seis sellos. Cada uno, una taza de la finca de la familia.',
      'Vas en seis. El café gratis ya se ve cerquita.'],
  7: ['Siete. Ya casi se siente el aroma de tu café por la casa.',
      'Siete sellos. Tres visitas más y te invitamos nosotros.'],
  8: ['Ocho sellos. Dos cafés más y el siguiente corre por nuestra cuenta.',
      'Vas en ocho. Esto ya es costumbre, y de las buenas.'],
  9: ['Te falta un solo sello. En tu próxima visita llenas la tarjeta.',
      'Nueve de diez. El próximo café te deja la tarjeta llena.'],
  llena: ['Diez visitas, diez sellos. Tu próximo café va por la casa.',
          'Gracias por volver tantas veces. El próximo café lo invitamos nosotros.']
};
// Después de canjear un premio (la tarjeta vuelve a 0)
const MENSAJES_OTRA_VEZ = ['Ya disfrutaste un café por la casa. Vamos por el siguiente.',
                           'Tarjeta nueva, mismas ganas. Gracias por seguir viniendo.'];

function mensajeSellos(sellos, meta, premios = 0) {
  let lista;
  if (sellos >= meta) lista = MENSAJES_SELLOS.llena;
  else if (sellos === 0 && premios > 0) lista = MENSAJES_OTRA_VEZ;
  else lista = MENSAJES_SELLOS[sellos] || MENSAJES_SELLOS[Math.min(sellos, 9)];
  const dia = Math.floor(Date.now() / 86400000); // Cambia de versión cada día
  return lista[(dia + sellos) % lista.length];
}

/* =========================================================
   LAS CASILLAS DE LA TARJETA (las arma igual el cliente y el barista)
   - Con sello: los 3 granos del logo de Piamonte (img/logo-piamonte.svg, recortado a los granos)
   - Vacía: un grano tenue esperando su sello
   - La última: la taza del premio
   ========================================================= */
const SELLO_LOGO = '<svg class="sello-logo" aria-hidden="true"><use href="#i-logo-granos"/></svg>'; // Símbolo dentro de la página

function casillasSellos(lista, sellos, meta) {
  lista.innerHTML = '';
  const casillas = [];
  for (let i = 1; i <= meta; i++) {
    const casilla = document.createElement('li');
    const esPremio = i === meta;
    const lleno = i <= sellos;
    const siguiente = i === sellos + 1; // La casilla que se llena con la próxima compra: late suave
    casilla.className = `sello${esPremio ? ' premio' : ''}${lleno ? ' lleno' : ''}${siguiente ? ' siguiente' : ''}`;
    casilla.setAttribute('aria-label', esPremio
      ? `Casilla ${i}: café gratis${lleno ? ', ganado' : ''}`
      : `Casilla ${i}${lleno ? ': sellada' : ': vacía'}`);
    // El premio: la taza con su etiqueta "Gratis" colgando
    if (esPremio) casilla.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-paso-taza"/></svg><span class="sello-etiqueta" aria-hidden="true">Gratis</span>';
    else if (lleno) casilla.innerHTML = SELLO_LOGO;
    else casilla.innerHTML = '<svg class="icono sello-vacio" aria-hidden="true"><use href="#i-grano"/></svg>';
    lista.appendChild(casilla);
    casillas.push(casilla);
  }
  return casillas;
}

// Guardar y leer del navegador sin romper la página (en modo privado puede fallar)
function leerLocal(clave) {
  try { return localStorage.getItem(clave); } catch (e) { return null; }
}
function guardarLocal(clave, valor) {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch (e) { /* Sin espacio o bloqueado: la página sigue funcionando */ }
}

/* =========================================================
   MODO DEMO: copia simple de las reglas de fidelizacion/Codigo.gs
   PIN de prueba: 123456
   ========================================================= */

const DEMO = { meta: 10, pin: '123456', minutos: 10 };

function demo(accion, datos) {
  const base = JSON.parse(leerLocal('piamonte-demo') || '{}');
  const guardar = () => guardarLocal('piamonte-demo', JSON.stringify(base));
  const celular = limpiarCelularDemo(datos.celular);
  const cliente = celular && base[celular];
  const publico = (c) => ({ nombre: c.nombre.split(' ')[0], sellos: c.sellos, meta: DEMO.meta, premios: c.premios });
  const completo = (c) => ({ celular: c.celular, nombre: c.nombre, sellos: c.sellos, meta: DEMO.meta, premios: c.premios, ultimoSello: c.ultimoSello });

  let resultado;
  if (['entrar', 'buscar', 'sellar', 'quitar', 'canjear'].includes(accion) && datos.pin !== DEMO.pin) {
    resultado = { ok: false, error: 'pin_incorrecto' };
  } else if (accion === 'entrar') {
    resultado = { ok: true };
  } else if (!celular) {
    resultado = { ok: false, error: 'celular_invalido' };
  } else if (accion === 'inscribir') {
    const nombre = String(datos.nombre || '').trim().replace(/\s+/g, ' ').slice(0, 60);
    if (nombre.length < 2) resultado = { ok: false, error: 'nombre_invalido' };
    else if (datos.acepta !== true) resultado = { ok: false, error: 'falta_autorizacion' };
    else if (cliente) resultado = { ok: true, yaExistia: true, tarjeta: publico(cliente) };
    else {
      base[celular] = { celular, nombre, sellos: 0, premios: 0, ultimoSello: null };
      guardar();
      resultado = { ok: true, tarjeta: publico(base[celular]) };
    }
  } else if (!cliente) {
    resultado = { ok: false, error: 'no_existe' };
  } else if (accion === 'tarjeta') {
    resultado = { ok: true, tarjeta: publico(cliente) };
  } else if (accion === 'buscar') {
    resultado = { ok: true, cliente: completo(cliente) };
  } else if (accion === 'sellar') {
    const reciente = cliente.ultimoSello && Date.now() - Date.parse(cliente.ultimoSello) < DEMO.minutos * 60000;
    if (cliente.sellos >= DEMO.meta) resultado = { ok: false, error: 'tarjeta_llena', cliente: completo(cliente) };
    else if (reciente && !datos.forzar) resultado = { ok: false, error: 'muy_pronto', cliente: completo(cliente) };
    else {
      cliente.sellos += 1;
      cliente.ultimoSello = new Date().toISOString();
      guardar();
      resultado = { ok: true, cliente: completo(cliente) };
    }
  } else if (accion === 'quitar') {
    if (cliente.sellos <= 0) resultado = { ok: false, error: 'sin_sellos', cliente: completo(cliente) };
    else { cliente.sellos -= 1; guardar(); resultado = { ok: true, cliente: completo(cliente) }; }
  } else if (accion === 'canjear') {
    if (cliente.sellos < DEMO.meta) resultado = { ok: false, error: 'faltan_sellos', cliente: completo(cliente) };
    else { cliente.sellos = 0; cliente.premios += 1; guardar(); resultado = { ok: true, cliente: completo(cliente) }; }
  } else {
    resultado = { ok: false, error: 'accion_desconocida' };
  }

  // Una pequeña espera, como si fuera a internet, para ver los estados de "cargando"
  return new Promise((listo) => setTimeout(() => listo(resultado), 350));
}

function limpiarCelularDemo(texto) {
  let numeros = String(texto || '').replace(/\D/g, '');
  if (numeros.length === 12 && numeros.startsWith('57')) numeros = numeros.slice(2);
  return /^3\d{9}$/.test(numeros) ? numeros : null;
}
