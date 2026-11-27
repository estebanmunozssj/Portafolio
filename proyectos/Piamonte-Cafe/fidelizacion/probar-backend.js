// Prueba fidelizacion/Codigo.gs en tu computador, imitando Google (no toca la hoja real).
// Uso, desde la carpeta Piamonte-Cafe:  node fidelizacion/probar-backend.js
const fs = require('fs');
const vm = require('vm');
const codigo = fs.readFileSync(require("path").join(__dirname, "Codigo.gs"), "utf8");

function hojaFalsa(nombre) {
  const filas = [];
  const h = {
    nombre, filas,
    getRange(a, b, c, d) {
      if (typeof a === 'string') return { setNumberFormat() {} };
      const fila = a, col = b, nf = c || 1, nc = d || 1;
      return {
        setValues(v) { for (let i = 0; i < nf; i++) { filas[fila - 1 + i] = filas[fila - 1 + i] || []; for (let j = 0; j < nc; j++) filas[fila - 1 + i][col - 1 + j] = v[i][j]; } return { setFontWeight() {} }; },
        setValue(v) { filas[fila - 1][col - 1] = v; }
      };
    },
    setFrozenRows() {},
    appendRow(r) { filas.push([...r]); },
    getDataRange() { return { getValues: () => filas.map((r) => [...r]) }; }
  };
  return h;
}
const hojas = {};
const memoria = {};
const props = {};
const ctx = {
  console, Date, JSON, String, Number, Math, Error,
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: (n) => hojas[n] || null, insertSheet: (n) => (hojas[n] = hojaFalsa(n)) }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] || null, setProperty: (k, v) => { props[k] = v; } }) },
  CacheService: { getScriptCache: () => ({ get: (k) => memoria[k] || null, put: (k, v) => { memoria[k] = v; } }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ setMimeType: () => ({ texto: t }) }) },
  Logger: { log() {} }
};
vm.createContext(ctx);
vm.runInContext(codigo, ctx);

const pedir = (datos) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(datos) } }).texto);
let fallas = 0;
function revisar(nombre, condicion, detalle) {
  console.log(`${condicion ? '✅' : '❌'} ${nombre}${condicion ? '' : '  → ' + JSON.stringify(detalle)}`);
  if (!condicion) fallas++;
}

ctx.instalar();
revisar('instalar crea Clientes e Historial', hojas.Clientes && hojas.Historial && hojas.Clientes.filas[0][0] === 'Celular');
let r = pedir({ accion: 'entrar', pin: '123456' });
revisar('sin PIN configurado avisa', r.error === 'sin_pin', r);
try { ctx.cambiarPin(); revisar('cambiarPin rechaza 000000', false); } catch (e) { revisar('cambiarPin rechaza 000000', true); }
props.PIN = '482913';

r = pedir({ accion: 'inscribir', nombre: 'Laura Gómez', celular: '316 555 1234', acepta: false });
revisar('sin autorización no inscribe', r.error === 'falta_autorizacion', r);
r = pedir({ accion: 'inscribir', nombre: 'L', celular: '3165551234', acepta: true });
revisar('nombre muy corto', r.error === 'nombre_invalido', r);
r = pedir({ accion: 'inscribir', nombre: 'Laura Gómez', celular: '12345', acepta: true });
revisar('celular inválido', r.error === 'celular_invalido', r);
r = pedir({ accion: 'inscribir', nombre: '  Laura   Gómez ', celular: '+57 316-555-1234', acepta: true });
revisar('inscribe con +57 y guiones', r.ok && r.tarjeta.nombre === 'Laura' && r.tarjeta.sellos === 0, r);
revisar('guarda celular limpio y nombre ordenado', hojas.Clientes.filas[1][0] === '3165551234' && hojas.Clientes.filas[1][1] === 'Laura Gómez', hojas.Clientes.filas[1]);
r = pedir({ accion: 'inscribir', nombre: 'Otra Persona', celular: '3165551234', acepta: true });
revisar('no duplica ni cambia el nombre', r.yaExistia && hojas.Clientes.filas.length === 2 && hojas.Clientes.filas[1][1] === 'Laura Gómez', r);

r = pedir({ accion: 'tarjeta', celular: '3165551234' });
revisar('tarjeta pública solo da primer nombre', r.ok && r.tarjeta.nombre === 'Laura' && !('celular' in r.tarjeta), r);
r = pedir({ accion: 'tarjeta', celular: '3000000000' });
revisar('tarjeta de celular desconocido', r.error === 'no_existe', r);

r = pedir({ accion: 'sellar', celular: '3165551234', pin: '000001' });
revisar('PIN equivocado no sella', r.error === 'pin_incorrecto' && hojas.Clientes.filas[1][2] === 0, r);
r = pedir({ accion: 'sellar', celular: '3165551234', pin: '482913' });
revisar('sella con PIN correcto', r.ok && r.cliente.sellos === 1 && r.cliente.nombre === 'Laura Gómez', r);
r = pedir({ accion: 'sellar', celular: '3165551234', pin: '482913' });
revisar('segundo sello seguido pide confirmar', r.error === 'muy_pronto' && r.cliente.sellos === 1, r);
r = pedir({ accion: 'sellar', celular: '3165551234', pin: '482913', forzar: true });
revisar('con confirmación sí sella', r.ok && r.cliente.sellos === 2, r);
r = pedir({ accion: 'quitar', celular: '3165551234', pin: '482913' });
revisar('quitar sello', r.ok && r.cliente.sellos === 1, r);
r = pedir({ accion: 'canjear', celular: '3165551234', pin: '482913' });
revisar('no canjea con tarjeta incompleta', r.error === 'faltan_sellos', r);
for (let i = 0; i < 9; i++) pedir({ accion: 'sellar', celular: '3165551234', pin: '482913', forzar: true });
r = pedir({ accion: 'buscar', celular: '3165551234', pin: '482913' });
revisar('llega a 10', r.cliente.sellos === 10, r);
r = pedir({ accion: 'sellar', celular: '3165551234', pin: '482913', forzar: true });
revisar('tarjeta llena no suma más', r.error === 'tarjeta_llena' && r.cliente.sellos === 10, r);
r = pedir({ accion: 'canjear', celular: '3165551234', pin: '482913' });
revisar('canjea: vuelve a 0 y suma premio', r.ok && r.cliente.sellos === 0 && r.cliente.premios === 1, r);
r = pedir({ accion: 'quitar', celular: '3165551234', pin: '482913' });
revisar('no quita bajo 0', r.error === 'sin_sellos', r);

const acciones = hojas.Historial.filas.slice(1).map((f) => f[3]);
revisar('historial anota todo', acciones[0] === 'Inscripción' && acciones.includes('Sello (confirmado)') && acciones.includes('Sello quitado') && acciones.at(-1) === 'Premio canjeado', acciones);

r = pedir({ accion: 'borrar_todo' });
revisar('acción desconocida', r.error === 'accion_desconocida', r);
r = JSON.parse(ctx.doPost({ postData: { contents: 'no es json' } }).texto);
revisar('petición basura', r.error === 'peticion_invalida', r);

for (let i = 0; i < 7; i++) pedir({ accion: 'entrar', pin: '111111' });
r = pedir({ accion: 'entrar', pin: '482913' });
revisar('tras 8 fallos bloquea incluso el PIN correcto', r.error === 'bloqueado', r);

console.log(fallas ? `\n${fallas} pruebas fallaron` : '\nTodas las pruebas pasaron');
process.exit(fallas ? 1 : 0);
