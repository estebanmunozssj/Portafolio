# Esteban DEV · Estudio de presencia digital de Esteban Muñoz

Hago páginas web a la medida para negocios locales: menú o catálogo, ubicación y pedidos por WhatsApp, todo en una sola página. También hago reels y carruseles para sus redes. Estoy en Yotoco, Valle del Cauca, y trabajo con negocios de toda Colombia.

**Ver en vivo:** [estebandev.online](https://estebandev.online)

## Cliente

| Proyecto | Qué hice | Sitio |
|---|---|---|
| S. B. Privé | Perfumería de Cali. Catálogo de 178 perfumes de 56 marcas con filtros por tipo, género y tamaño, página por perfume y lista de pedido que llega armada en un solo mensaje de WhatsApp. Sin pasarela de pagos. También le hice 2 reels y un carrusel para Instagram. | [sbprive.com](https://sbprive.com) |

## Otros proyectos

| Proyecto | Estado | Qué es | Sitio |
|---|---|---|---|
| Mundos en Lienzos | En construcción (cliente real) | Página para Dahiana Ortega, artista de Yotoco que pinta retratos a mano: carrusel y galería de obras reales, precios de lienzos, retablos y fundas, proceso de pedido y pedidos por WhatsApp. | [Ver](https://estebandev.online/proyectos/Mundos-en-Lienzos/) |
| Piamonte Café | En construcción (cliente real) | Página para un café de Yotoco: menú, ubicación y reservas por WhatsApp. | [Ver](https://estebandev.online/proyectos/Piamonte-Cafe/) |
| Juego de rutas por Yotoco | En construcción | Recorrido por el pueblo con códigos QR, sellos y álbum de postales. Está en su propio repositorio. | Pronto |

## Servicios

- **Página web**, desde $500.000, pago único. Entrega en una semana o menos.
- **Mantenimiento**, desde $50.000 al mes: cambio precios, fotos y textos.
- **Contenido para redes**, desde $50.000 por reel: reels y carruseles para Instagram, TikTok y estados de WhatsApp.

## Tecnologías

- HTML, CSS y JavaScript puro, sin frameworks ni paso de compilación. Lo decidí así para aprender bien las bases.
- Diseño pensado primero para celular, con animaciones sutiles que respetan la opción de movimiento reducido.
- SEO: título y descripción por página, `canonical`, `robots.txt`, `sitemap.xml` y datos estructurados (JSON-LD).
- Google Analytics 4, con un evento `clic_whatsapp` que dice desde qué sección escribió la persona.
- Publicado con GitHub Pages y dominio propio (`CNAME`).

## Estructura

```
index.html          Página principal
privacidad.html     Política de privacidad (Ley 1581 de 2012)
404.html            Página para direcciones que no existen (GitHub Pages la usa sola)
css/estilos.css     Estilos. Colores y fuentes en variables al inicio (:root)
js/script.js        Cuenta en Analytics los clics a WhatsApp
js/scroll.js        Las secciones aparecen al bajar
js/menu.js          Menú hamburguesa del celular
js/iguana.js        El ojo de la iguana sigue el dedo o el ratón
js/recorrido.js     La iguanita que camina por el borde mientras bajas
img/                Capturas de los proyectos e imagen para compartir
video/              Reel de muestra (versión liviana)
icon/               Ícono de la pestaña
proyectos/          Cada proyecto en su carpeta, con su propio html, css, js e img
md/                 Notas del producto
llms.txt            Resumen en texto simple para las IAs (ChatGPT, Claude, Perplexity)
precios.md          Precios en texto simple para las IAs
robots.txt          Le dice a Google que puede revisar todo el sitio
sitemap.xml         Lista de páginas para Google
CNAME               Dominio estebandev.online (debe quedarse en la raíz)
```

## Verlo en tu computador

No necesita instalar nada. Descarga el repositorio y abre `index.html` en el navegador.

Para ver la página `404.html` como en internet, hay que abrir el sitio con un servidor local, por ejemplo `python3 -m http.server`, porque usa rutas que empiezan con `/`.

## Cómo trabajo

- `main` es lo que está publicado en el dominio.
- Los cambios nuevos se prueban en la rama `pruebas` y se unen a `main` cuando están listos.

## Contacto

- WhatsApp y correo: sección de contacto de [estebandev.online](https://estebandev.online/#contacto)
- Instagram: [@estebanssj.dev_](https://www.instagram.com/estebanssj.dev_/)
- GitHub: [estebanmunozssj](https://github.com/estebanmunozssj)
