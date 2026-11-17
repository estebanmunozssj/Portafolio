# S. B. Privé — Marca y diseño de la web

Resumen del manual de marca del cliente y de las decisiones de diseño de la página.
La marca es del cliente: **no se cambia**, la web se adapta a ella.

---

## 1. La marca

- **Nombre:** S. B. Privé — Alta perfumería.
- **Qué vende:** perfumes originales de otras casas (árabes, de diseñador y de nicho) y decants.
- **Lema:** *Perfume que se lleva como un secreto.*
- **Otra frase de la marca:** *Un aroma que se recuerda antes de olvidar el nombre.*
- **"Privé"** significa privado: fragancias para quien no necesita que todos sepan lo que lleva, solo quien se acerca.

**Es:** elegante, cálida, segura, paciente, íntima, discreta.
**No es:** ostentosa, fría, de oferta, apurada, ruidosa.

Atributos del manual: **Exclusiva** (pocas piezas, nunca masiva) · **Sensorial** (piel, textura, memoria) · **Discreta** (susurra) · **Artesanal** (detalles a mano).

---

## 2. Colores

Proporción guía: **70 % verde · 20 % marfil · 10 % oro**. El oro es acento, nunca un fondo grande.

| Nombre | Hex | Uso |
| --- | --- | --- |
| Verde Privé | `#0E2A1C` | Color principal, fondos |
| Verde Noche | `#071810` | Profundidad, sombras, franjas |
| Oro Privé | `#C8A45C` | Logo, botón principal, detalles |
| Champaña | `#E6CF98` | Texto sobre verde |
| Marfil | `#F4EEDF` | Secciones claras, respiro |

Colores de apoyo usados en el diseño web:

| Uso | Hex |
| --- | --- |
| Texto secundario sobre verde | `#B9B29C` |
| Texto sobre marfil | `#2E3B33` |
| Oro viejo (etiquetas sobre marfil) | `#7A5D26` |
| Tarjetas sobre marfil | `#FBF8F1` |
| Líneas finas sobre verde | `#2A4234` |

Contraste medido (mínimo exigido 4,5 : 1): oro sobre verde 6,5 · champaña sobre verde 10 · oro viejo sobre marfil 5,3 · texto sobre marfil 10. Todas pasan.

---

## 3. Letras (Google Fonts, gratis)

| Letra | Trabajo |
| --- | --- |
| **Cinzel** (500) | Nombre de la marca y de los perfumes. Siempre en mayúsculas, espaciado 0,25–0,5 em |
| **Cormorant Garamond** (500, 600, cursiva 400) | Títulos, frases y notas olfativas. La cursiva, para lo emotivo |
| **Jost** (300, 400, 500) | Textos, precios, datos y botones. Light para el texto corrido |

---

## 4. Logo

Archivos en `img/logo/` (sacados del original del cliente, `logo-original.jpg`, con fondo transparente):

| Archivo | Uso |
| --- | --- |
| `logo-dorado.png` | Principal (monograma + "S. B. Privé, Alta perfumería") sobre verde. Sección "¿No sabes cuál elegir?", piezas grandes |
| `logo-verde.png` | El mismo, en verde, sobre marfil |
| `logo-horizontal-dorado.png` | Monograma + nombre al lado. **Encabezado de la web** |
| `logo-horizontal-verde.png` | El mismo, en verde, sobre fondos claros |
| `monograma-dorado.png` / `monograma-verde.png` | Monograma solo: patrón de fondo, sello de la entrada animada |
| `icono-32.png` / `icono-180.png` / `icono-512.png` | Ícono de la pestaña (favicon), ícono del celular y vista previa |

Reglas:
- Siempre el logo original, nunca redibujado.
- Dorado sobre verde; verde sobre marfil.
- Espacio de respiro alrededor: la altura de la "S" del monograma. Nada entra en ese margen.
- Tamaño mínimo: logo completo 160 px de ancho; monograma 24 px.

---

## 5. Voz

- Frases cortas, **de tú**, sensoriales. La marca habla como **"nosotros"** (te respondemos, escríbenos).
- Describe lo que se siente, no lo que cuesta.
- **Nunca** signos de exclamación ni mayúsculas para gritar.

| Decimos | No decimos |
| --- | --- |
| Una fragancia para quien se acerca. | ¡¡El perfume más increíble del mercado!! |
| Descúbrela en tu piel. | 50 % OFF, solo por hoy |

En la web: **sin precios tachados, sin "solo por hoy", sin contadores falsos.** "Pocas piezas" y "Más pedido" solo si son ciertos (además, el Estatuto del Consumidor, Ley 1480, prohíbe la publicidad engañosa).

---

## 6. Empaque (el "ritual de la caja") — CONFIRMAR CON EL CLIENTE

Del manual: papel de seda con el patrón del monograma, sticker dorado de cierre, tarjeta de agradecimiento escrita a mano, tarjeta con muestra de 2 ml, cinta de raso con texto en foil, etiqueta de cuello. La sección "Llega como un regalo" de la web depende de que de verdad empaque así.

---

## 7. Decisiones de diseño de la web

- **Celular primero.** Todo se diseña a 390 px y luego se amplía.
- **Vitrina:** foto del arco verde con repisas doradas (`img/repisa-cel.webp`, 687 × 1024). La misma para celular y computador. Encima van los frascos; en el arco, el perfume destacado. Los frascos serán fotos reales del cliente sin fondo.
- **Selector "¿Cómo quieres oler hoy?":** Dulce, Fresco, Amaderado, Intenso. Cambia los frascos de la vitrina. El frasco elegido crece un poco y los demás se atenúan; debajo, la tarjeta con nombre, notas, precio, decant y "Pedir este por WhatsApp".
- **Botones:** el principal ("Pedir por WhatsApp") en oro con texto verde; los secundarios con borde dorado; dentro de secciones claras, fondo verde con texto marfil.
- **Barra fija de WhatsApp** abajo, solo en celular.
- **Entrada animada (primera visita, ~2,7 s):** pantalla verde con el patrón del monograma → sello dorado SB y lema → el sello se parte y la caja se abre como dos puertas → la luz de la vitrina se enciende titilando → los frascos suben → aparece el contenido. Se salta con un toque y no se muestra con "reducir movimiento".
- **Secciones en orden:** inicio y vitrina · lo que te prometemos · elige por tipo · kit de 3 decants · los más pedidos (carrusel con "1 de 6" y flechas, notas, duración e intensidad) · llega como un regalo · ya les llegó (oculta hasta tener capturas reales) · así pides · preguntas · ¿no sabes cuál elegir? · pie.

---

## 8. Páginas y cómo se vende

**Venta solo por WhatsApp. Sin pasarela de pago, sin carrito con pago en línea, sin cuentas de usuario.**

| Página | Qué tiene |
| --- | --- |
| `index.html` — Inicio | Todo lo de la sección 7 |
| `catalogo.html` — Catálogo | Buscador por nombre o marca · filtros por tipo (árabe, diseñador, nicho), género (hombre, mujer, unisex), tamaño (frasco, decant) y precio · ordenar (más pedidos, precio) · tarjetas con "Agregar a mi lista" |
| `perfume.html?id=…` — Un perfume | Fotos · marca y nombre · selector de tamaño (frasco 100 ml, decant 10 ml, decant 5 ml) con su precio · cantidad · "Agregar a mi lista" y "Pedir por WhatsApp" · fecha estimada de entrega · pirámide de notas · duración e intensidad · momentos ideales · descripción · guía "¿frasco o decant?" · "También te puede gustar" |

**Lista de pedido:** la persona agrega varios perfumes (con tamaño y cantidad) y los envía en **un solo mensaje de WhatsApp** ya escrito. La lista se guarda en el navegador (`localStorage`) para que no se pierda al cambiar de página.

**Una sola lista de datos:** todos los perfumes viven en un archivo JavaScript (`js/perfumes.js`), como el menú de Piamonte. De ahí salen la vitrina, "Los más pedidos", el catálogo y la página de cada perfume. Un precio se cambia en un solo lugar.

Cada perfume lleva: `id`, nombre, marca, tipo, género, familia olfativa (dulce, fresco, amaderado, intenso), tamaños con precio, notas de salida, corazón y fondo, duración, intensidad, momentos ideales, descripción, fotos, si es "más pedido" y si hay pocas piezas.

**Más adelante:** lista de marcas para explorar, página de error 404, videos de TikTok.

## 9. Pendientes para el código

- Barra fija de WhatsApp: dejar abajo un espacio igual a su alto para que nunca tape nada.
- Imágenes en WebP, con `width` y `height`, varios tamaños (`srcset`) y `loading="lazy"` fuera de la primera pantalla.
- La página carga detrás de la entrada animada: la entrada nunca retrasa el contenido.
- Mensaje de WhatsApp ya escrito con el perfume elegido; el botón muestra "Abriendo WhatsApp…".
- Carruseles con `scroll-snap`.

## 10. Datos que faltan del cliente

Ciudad · lista de perfumes con precios y tamaños · género de cada perfume · tamaños que vende de cada uno · regla para los decants (¿mínimo de unidades?) · días hábiles de entrega por ciudad · ml y precio de los decants · envío sin costo desde cuánto · medios de pago · hora de corte para despachar el mismo día · fotos de los frascos sin fondo · cómo demuestran que son originales · política de cambios · horario en que responde WhatsApp · redes sociales.
