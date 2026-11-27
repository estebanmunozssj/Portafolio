/* =========================================
   PIAMONTE CAFÉ - Tarjeta de sellos (backend)
   Este archivo NO va en la página: se pega en Google Apps Script,
   dentro de la hoja de Google Sheets del café (Extensiones > Apps Script).
   La guía paso a paso está en fidelizacion/INSTALAR.md
   ========================================= */

// ===== REGLAS DEL PROGRAMA (cámbialas aquí) =====
const SELLOS_PARA_PREMIO = 10;     // Sellos que llenan la tarjeta
const MINUTOS_ENTRE_SELLOS = 10;   // Evita dos sellos seguidos al mismo cliente por error
const INTENTOS_PIN = 8;            // PIN equivocado tantas veces...
const MINUTOS_BLOQUEO = 10;        // ...bloquea el panel estos minutos

const HOJA_CLIENTES = 'Clientes';
const HOJA_HISTORIAL = 'Historial';

// ===== INSTALACIÓN: ejecutar UNA vez desde el editor =====
// Crea las dos pestañas con sus títulos
function instalar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let clientes = libro.getSheetByName(HOJA_CLIENTES);
  if (!clientes) clientes = libro.insertSheet(HOJA_CLIENTES);
  clientes.getRange(1, 1, 1, 7).setValues([[
    'Celular', 'Nombre', 'Sellos', 'Premios canjeados', 'Inscrito', 'Último sello', 'Acepta datos'
  ]]).setFontWeight('bold');
  clientes.getRange('A:A').setNumberFormat('@'); // El celular como texto (si no, Sheets lo vuelve número)
  clientes.setFrozenRows(1);

  let historial = libro.getSheetByName(HOJA_HISTORIAL);
  if (!historial) historial = libro.insertSheet(HOJA_HISTORIAL);
  historial.getRange(1, 1, 1, 5).setValues([[
    'Fecha', 'Celular', 'Nombre', 'Acción', 'Sellos después'
  ]]).setFontWeight('bold');
  historial.getRange('B:B').setNumberFormat('@');
  historial.setFrozenRows(1);
}

// ===== PIN DEL PANEL: cambia el número y ejecuta esta función =====
// El PIN queda guardado en Google, no en la página
function cambiarPin() {
  const PIN_NUEVO = '000000'; // <- Escribe aquí el PIN (6 números) y ejecuta
  if (!/^\d{6}$/.test(PIN_NUEVO) || PIN_NUEVO === '000000') {
    throw new Error('Escribe un PIN de 6 números distinto a 000000');
  }
  PropertiesService.getScriptProperties().setProperty('PIN', PIN_NUEVO);
  Logger.log('PIN guardado. Ahora borra el número de esta función.');
}

// ===== PUERTA DE ENTRADA: todas las peticiones de la página llegan aquí =====
function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, error: 'peticion_invalida' });
  }

  try {
    switch (datos.accion) {
      // Del cliente (sin PIN)
      case 'inscribir': return responder(inscribir(datos));
      case 'tarjeta':   return responder(verTarjeta(datos));
      // Del barista (con PIN)
      case 'entrar':    return responder(conPin(datos, () => ({ ok: true })));
      case 'buscar':    return responder(conPin(datos, () => buscar(datos)));
      case 'sellar':    return responder(conPin(datos, () => sellar(datos)));
      case 'quitar':    return responder(conPin(datos, () => quitar(datos)));
      case 'canjear':   return responder(conPin(datos, () => canjear(datos)));
      default:          return responder({ ok: false, error: 'accion_desconocida' });
    }
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: 'error_servidor' });
  }
}

// Abrir la dirección en el navegador muestra esto (sirve para probar que está publicado)
function doGet() {
  return responder({ ok: true, mensaje: 'Tarjeta Piamonte funcionando' });
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== ACCIONES DEL CLIENTE =====

function inscribir(datos) {
  const celular = limpiarCelular(datos.celular);
  const nombre = String(datos.nombre || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  if (!celular) return { ok: false, error: 'celular_invalido' };
  if (nombre.length < 2) return { ok: false, error: 'nombre_invalido' };
  if (datos.acepta !== true) return { ok: false, error: 'falta_autorizacion' }; // Ley 1581 de 2012

  return conCandado(() => {
    const fila = buscarFila(celular);
    if (fila) return { ok: true, yaExistia: true, tarjeta: tarjetaPublica(fila) };

    const ahora = new Date();
    hoja(HOJA_CLIENTES).appendRow([celular, nombre, 0, 0, ahora, '', 'Sí']);
    anotar(celular, nombre, 'Inscripción', 0);
    return { ok: true, tarjeta: { nombre: primerNombre(nombre), sellos: 0, meta: SELLOS_PARA_PREMIO, premios: 0 } };
  });
}

function verTarjeta(datos) {
  const celular = limpiarCelular(datos.celular);
  if (!celular) return { ok: false, error: 'celular_invalido' };
  const fila = buscarFila(celular);
  if (!fila) return { ok: false, error: 'no_existe' };
  return { ok: true, tarjeta: tarjetaPublica(fila) };
}

// Lo que ve cualquiera que escriba el celular: solo el primer nombre y los sellos
function tarjetaPublica(fila) {
  return {
    nombre: primerNombre(fila.valores[1]),
    sellos: Number(fila.valores[2]) || 0,
    meta: SELLOS_PARA_PREMIO,
    premios: Number(fila.valores[3]) || 0
  };
}

// ===== ACCIONES DEL BARISTA =====

function buscar(datos) {
  const celular = limpiarCelular(datos.celular);
  if (!celular) return { ok: false, error: 'celular_invalido' };
  const fila = buscarFila(celular);
  if (!fila) return { ok: false, error: 'no_existe' };
  return { ok: true, cliente: clienteCompleto(fila) };
}

function sellar(datos) {
  const celular = limpiarCelular(datos.celular);
  if (!celular) return { ok: false, error: 'celular_invalido' };

  return conCandado(() => {
    const fila = buscarFila(celular);
    if (!fila) return { ok: false, error: 'no_existe' };
    const sellos = Number(fila.valores[2]) || 0;
    if (sellos >= SELLOS_PARA_PREMIO) return { ok: false, error: 'tarjeta_llena', cliente: clienteCompleto(fila) };

    // Si ya le pusieron sello hace poco, pide confirmar (datos.forzar) por si fue un doble toque
    const ultimo = fila.valores[5];
    if (!datos.forzar && ultimo instanceof Date &&
        Date.now() - ultimo.getTime() < MINUTOS_ENTRE_SELLOS * 60 * 1000) {
      return { ok: false, error: 'muy_pronto', cliente: clienteCompleto(fila) };
    }

    const ahora = new Date();
    const clientes = hoja(HOJA_CLIENTES);
    clientes.getRange(fila.numero, 3).setValue(sellos + 1);
    clientes.getRange(fila.numero, 6).setValue(ahora);
    fila.valores[2] = sellos + 1;
    fila.valores[5] = ahora;
    anotar(celular, fila.valores[1], datos.forzar ? 'Sello (confirmado)' : 'Sello', sellos + 1);
    return { ok: true, cliente: clienteCompleto(fila) };
  });
}

// Para corregir un sello puesto por error
function quitar(datos) {
  const celular = limpiarCelular(datos.celular);
  if (!celular) return { ok: false, error: 'celular_invalido' };

  return conCandado(() => {
    const fila = buscarFila(celular);
    if (!fila) return { ok: false, error: 'no_existe' };
    const sellos = Number(fila.valores[2]) || 0;
    if (sellos <= 0) return { ok: false, error: 'sin_sellos', cliente: clienteCompleto(fila) };

    hoja(HOJA_CLIENTES).getRange(fila.numero, 3).setValue(sellos - 1);
    fila.valores[2] = sellos - 1;
    anotar(celular, fila.valores[1], 'Sello quitado', sellos - 1);
    return { ok: true, cliente: clienteCompleto(fila) };
  });
}

function canjear(datos) {
  const celular = limpiarCelular(datos.celular);
  if (!celular) return { ok: false, error: 'celular_invalido' };

  return conCandado(() => {
    const fila = buscarFila(celular);
    if (!fila) return { ok: false, error: 'no_existe' };
    const sellos = Number(fila.valores[2]) || 0;
    if (sellos < SELLOS_PARA_PREMIO) return { ok: false, error: 'faltan_sellos', cliente: clienteCompleto(fila) };

    const premios = (Number(fila.valores[3]) || 0) + 1;
    hoja(HOJA_CLIENTES).getRange(fila.numero, 3, 1, 2).setValues([[0, premios]]);
    fila.valores[2] = 0;
    fila.valores[3] = premios;
    anotar(celular, fila.valores[1], 'Premio canjeado', 0);
    return { ok: true, cliente: clienteCompleto(fila) };
  });
}

function clienteCompleto(fila) {
  const ultimo = fila.valores[5];
  return {
    celular: String(fila.valores[0]), // Texto siempre: si alguien edita la hoja, Sheets puede volverlo número
    nombre: String(fila.valores[1]),
    sellos: Number(fila.valores[2]) || 0,
    meta: SELLOS_PARA_PREMIO,
    premios: Number(fila.valores[3]) || 0,
    ultimoSello: ultimo instanceof Date ? ultimo.toISOString() : null
  };
}

// ===== SEGURIDAD DEL PIN =====
// Cuenta los intentos fallidos. Al pasar el límite, el panel se bloquea unos minutos
// (Apps Script no ve quién hace la petición, así que el bloqueo es para todos)
function conPin(datos, accion) {
  const memoria = CacheService.getScriptCache();
  const fallos = Number(memoria.get('fallos_pin')) || 0;
  if (fallos >= INTENTOS_PIN) return { ok: false, error: 'bloqueado', minutos: MINUTOS_BLOQUEO };

  const pinReal = PropertiesService.getScriptProperties().getProperty('PIN');
  if (!pinReal) return { ok: false, error: 'sin_pin' };
  if (String(datos.pin || '') !== pinReal) {
    memoria.put('fallos_pin', String(fallos + 1), MINUTOS_BLOQUEO * 60);
    return { ok: false, error: 'pin_incorrecto' };
  }
  return accion();
}

// Evita que dos baristas escriban la misma fila al mismo tiempo
function conCandado(accion) {
  const candado = LockService.getScriptLock();
  candado.waitLock(10000);
  try {
    return accion();
  } finally {
    candado.releaseLock();
  }
}

// ===== AYUDANTES =====

function hoja(nombre) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
}

// Deja solo los 10 números de un celular colombiano (acepta +57, espacios y guiones)
function limpiarCelular(texto) {
  let numeros = String(texto || '').replace(/\D/g, '');
  if (numeros.length === 12 && numeros.startsWith('57')) numeros = numeros.slice(2);
  return /^3\d{9}$/.test(numeros) ? numeros : null;
}

function buscarFila(celular) {
  const valores = hoja(HOJA_CLIENTES).getDataRange().getValues();
  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === celular) return { numero: i + 1, valores: valores[i] };
  }
  return null;
}

function anotar(celular, nombre, accion, sellosDespues) {
  hoja(HOJA_HISTORIAL).appendRow([new Date(), celular, nombre, accion, sellosDespues]);
}

function primerNombre(nombre) {
  return String(nombre || '').trim().split(' ')[0];
}
