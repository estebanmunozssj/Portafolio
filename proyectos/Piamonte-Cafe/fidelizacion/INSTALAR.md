# Tarjeta de sellos de Piamonte: instalación

Guía para conectar la tarjeta de sellos con Google el día de la entrega. Toma unos 30 minutos.
Hazla **con la cuenta de Google del café** (no la tuya): la hoja con los datos de los clientes es de ellos.

## Cómo funciona (para entender qué estás instalando)

```
Cliente (fidelidad.html) ─┐
                          ├─► Google Apps Script ─► Hoja de Google Sheets
Barista (panel.html) ─────┘   (revisa PIN y reglas)   (Clientes + Historial)
```

| Archivo | Qué es |
|---|---|
| `fidelidad.html` + `js/fidelidad.js` | Página del cliente: inscribirse y ver su tarjeta |
| `panel.html` + `js/panel.js` | Panel del barista con PIN (entrada: "Equipo Piamonte" en el pie) |
| `js/fidelidad-api.js` | Conexión con Google. Aquí van la dirección y el dominio |
| `css/fidelidad.css` | Estilos de las dos páginas |
| `js/mensaje-del-dia.js` | Marquesina verde con un mensaje para la vida, distinto cada día (portada, menú y Mi tarjeta) |
| `js/granos.js` | Granos de café que flotan y giran con el scroll (portada, menú y Mi tarjeta). Sus estilos están en `css/estilos.css` |
| `fidelizacion/Codigo.gs` | El programa que se pega en Google Apps Script |
| `fidelizacion/probar-backend.js` | Prueba `Codigo.gs` en tu computador sin tocar la hoja real |
| `fidelizacion/cartel.html` | Cartel con QR para imprimir |

**Modo demo:** si la página no está en un dominio de la lista `DOMINIOS_REALES`, guarda todo en el navegador
y muestra "Modo demostración". Así el portafolio funciona como muestra sin escribir en la hoja del café.

---

## Antes de empezar, define con el dueño

- [ ] Cuántos sellos y cuál es el premio (hoy: 10 sellos → café gratis)
- [ ] Si una compra después de canjear el premio, en la misma visita, da sello
- [ ] Si los sellos se vencen (hoy: no)
- [ ] El PIN de 6 números (que no sea una fecha de cumpleaños ni 123456)
- [ ] En qué dominio va a quedar la página

Si cambia la cantidad de sellos: cambia `SELLOS_PARA_PREMIO` en `Codigo.gs`, `DEMO.meta` en `js/fidelidad-api.js`
y los textos "Diez cafés" / "Al llegar a 10" en `fidelidad.html`, `index.html` y `fidelizacion/cartel.html`.

---

## Paso 1. Crear la hoja

1. Entra a [sheets.google.com](https://sheets.google.com) con la cuenta del café.
2. Crea una hoja en blanco y llámala **Piamonte · Tarjeta de sellos**.

## Paso 2. Pegar el programa

1. En la hoja: **Extensiones → Apps Script**.
2. Borra lo que trae el editor y pega **todo** el contenido de `fidelizacion/Codigo.gs`.
3. Arriba a la izquierda, cambia "Proyecto sin título" por **Tarjeta Piamonte**.
4. Guarda (ícono del disquete o Cmd + S).

## Paso 3. Crear las pestañas

1. En la lista de funciones de arriba (junto a "Ejecutar"), elige **instalar** y toca **Ejecutar**.
2. Google pide permisos. Aparece **"Google no ha verificado esta aplicación"**: es normal, porque el programa es
   del mismo café y no está publicado en una tienda. Toca **Configuración avanzada → Ir a Tarjeta Piamonte (no seguro)**
   y luego **Permitir**.
3. Vuelve a la hoja: deben aparecer las pestañas **Clientes** e **Historial** con sus títulos.

## Paso 4. Poner el PIN

1. En el editor, busca la función `cambiarPin` y cambia `'000000'` por el PIN que eligió el dueño.
2. Elige **cambiarPin** en la lista y toca **Ejecutar**. En el registro debe salir "PIN guardado".
3. **Vuelve a poner `'000000'`** en el código y guarda: el PIN ya quedó guardado en Google y no debe verse en el código.

## Paso 5. Publicar el programa

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elige **Aplicación web**.
3. Llena así:
   - Descripción: `Tarjeta de sellos`
   - Ejecutar como: **Yo** (la cuenta del café)
   - Quién tiene acceso: **Cualquier usuario**
4. **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
5. Pruébala: pégala en el navegador. Debe salir `{"ok":true,"mensaje":"Tarjeta Piamonte funcionando"}`.

> "Cualquier usuario" significa que la página puede hablar con el programa sin que el cliente inicie sesión.
> Nadie ve la hoja: el programa solo responde lo que está en `Codigo.gs`, y todo lo del barista pide el PIN.

## Paso 6. Conectar la página

En `js/fidelidad-api.js`:

```js
const URL_TARJETA = 'https://script.google.com/macros/s/.../exec'; // La URL del paso 5
const DOMINIOS_REALES = ['piamontecafe.com', 'www.piamontecafe.com'];  // El dominio real del café
```

## Paso 7. Probar de verdad antes de publicar

1. En tu computador, abre `http://localhost:8767/fidelidad.html?real` (el `?real` usa Google aunque estés en localhost).
   No debe salir "Modo demostración".
2. Saca una tarjeta con tu celular.
3. Abre `http://localhost:8767/panel.html?real`, entra con el PIN, búscate y ponte un sello.
4. Mira la hoja: tu fila en **Clientes** y las líneas en **Historial**.
5. Prueba un PIN equivocado una vez: debe decir "PIN incorrecto".
6. **Borra tus filas de prueba** de las dos pestañas (deja los títulos).

La primera respuesta de Google puede tardar 2 o 3 segundos. Después es más rápida.

## Paso 8. Publicar

1. En la carpeta del portafolio: commit y push de `Portafolio Web`.
   En estebandev.online la tarjeta sigue en modo demo (el dominio no está en `DOMINIOS_REALES`).
2. Copia la carpeta al repositorio del sitio del café, revisa con `diff -rq` que queden iguales, y commit + push allá.
3. Abre la página en el dominio real: no debe salir "Modo demostración".

## Paso 9. En el café

1. **Cartel:** abre `https://<dominio del café>/fidelizacion/cartel.html` en el computador. La dirección se llena sola.
   **Escanea el QR con tu celular antes de imprimir** y confirma que abre "Mi tarjeta". Imprime en media carta.
2. **Celular de la caja:** abre el panel desde "Equipo Piamonte", entra con el PIN y agrégalo a la pantalla de inicio
   (iPhone: Compartir → Agregar a inicio. Android: ⋮ → Agregar a pantalla principal). Queda como "Sellos Piamonte".
3. Haz una prueba con el dueño: él saca su tarjeta con el QR y el barista le pone el primer sello.

---

## Después de la entrega

**Cambiar una regla o el código de Google:** edita `fidelizacion/Codigo.gs`, corre `node fidelizacion/probar-backend.js`
(deben pasar todas las pruebas), pega el código nuevo en Apps Script y publica así para que **no cambie la URL**:
**Implementar → Gestionar implementaciones → lápiz → Versión: Nueva versión → Implementar**.
(Si haces "Nueva implementación" sale otra URL y tendrías que cambiarla en la página.)

**Cambiar el PIN** (por ejemplo, cuando un barista se va): repite el paso 4. Los demás entran con el nuevo.

**Un cliente pide borrar sus datos (Ley 1581):** borra su fila en **Clientes**. Sus líneas en **Historial** también,
o reemplaza su nombre y celular por "Borrado".

**Un cliente cambió de número:** cambia el celular en su fila de **Clientes** (10 números, sin espacios).

**"Demasiados intentos" en el panel:** alguien falló el PIN 8 veces. Se desbloquea solo en 10 minutos.
Si pasa seguido, alguien está intentando adivinarlo: cambia el PIN.

**Límites de Google:** gratis y de sobra para un café. Solo hay que evitar editar la hoja a mano mientras el café
está atendiendo.
