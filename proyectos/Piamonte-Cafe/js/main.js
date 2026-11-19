'use strict';

const NUMERO = '573168798017'; // WhatsApp de domicilios: 57 (Colombia) + número, sin + ni espacios

// Feed de Instagram (Behold). Cuando lo tengas, pega aquí la dirección del feed, ej: 'https://feeds.behold.so/AbC123'
// Vacío = la sección de Instagram muestra solo el botón al perfil
const FEED_INSTAGRAM = '';

/* =========================================================
   LOGO ANIMADO (portada y cabecera del menú)
   Espera a que carguen las letras (si no, el nombre se escribiría con otra letra
   y luego cambiaría). Si tardan más de 1,5 segundos, arranca igual
   ========================================================= */

(() => {
  // La portada (index.html) y la cabecera del menú (menu.html) llevan el mismo logo animado
  const contenedores = document.querySelectorAll('.portada, .menu-cabecera');
  if (!contenedores.length) return;

  // La clase "lista" inicia la animación (ver CSS)
  const arrancar = () => contenedores.forEach((c) => c.classList.add('lista'));
  const espera = new Promise((listo) => setTimeout(listo, 1500));
  const letras = document.fonts ? document.fonts.ready : espera;

  Promise.race([letras, espera]).then(arrancar);
})();

/* =========================================================
   ENCABEZADO: al bajar muestra su línea y el logo pequeño, y marca la sección actual
   ========================================================= */

(() => {
  const encabezado = document.getElementById('encabezado');
  const portada = document.getElementById('inicio');
  if (!encabezado || !portada) return;

  const enlaces = document.querySelectorAll('.nav-enlaces a');
  const secciones = ['historia', 'experiencias', 'visitanos'] // El menú ya no está aquí: tiene su página
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function revisar() {
    const y = window.scrollY;

    // Clase "solido" al salir de la portada: muestra la línea y el logo pequeño (">= ... - 1" cuenta también el borde exacto)
    encabezado.classList.toggle('solido', y >= portada.offsetHeight - encabezado.offsetHeight - 1);

    // La sección actual es la última cuyo inicio ya pasó la mitad de la pantalla
    const mitad = y + window.innerHeight / 2;
    let actual = '';
    secciones.forEach((s) => { if (s.offsetTop <= mitad) actual = s.id; });

    enlaces.forEach((a) => a.classList.toggle('activo', a.dataset.seccion === actual));
  }

  window.addEventListener('scroll', revisar, { passive: true }); // passive: no hace lento el desplazamiento
  window.addEventListener('resize', revisar);
  revisar(); // Revisa una vez al cargar (por si la página abre a mitad)
})();

/* =========================================================
   CAFETERA DEL ENCABEZADO: aparece al bajar y se va llenando
   según cuánto llevas de la página (vacía arriba, llena al final)
   La crea este código para no repetir el SVG en index.html y menu.html
   ========================================================= */

(() => {
  const logo = document.querySelector('.encabezado .logo');
  if (!logo) return;

  // Jarra de vidrio con asa, en capas: fondo de vidrio → café → contorno encima.
  // El café es un rectángulo recortado con la forma de la jarra (clipPath)
  // y su altura se cambia desde aquí con scaleY. viewBox 0 0 26 32: 26 de ancho por 32 de alto
  logo.insertAdjacentHTML('beforeend', `
    <svg class="cafetera" viewBox="0 0 26 32" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="dentro-cafetera"><path d="M5 9H18L19 27C19 29 18 30 16 30H7C5 30 4 29 4 27Z"/></clipPath>
      </defs>
      <path class="cafetera-fondo" d="M5 9H18L19 27C19 29 18 30 16 30H7C5 30 4 29 4 27Z"/>
      <g clip-path="url(#dentro-cafetera)">
        <rect class="cafetera-cafe" x="0" y="9" width="26" height="21"/>
      </g>
      <path class="cafetera-vidrio" d="M5 9H18L19 27C19 29 18 30 16 30H7C5 30 4 29 4 27Z"/>
      <path class="cafetera-tapa" d="M4 9H19M7 9L8 5H16L17 9M10 5V3H14V5"/>
      <path class="cafetera-asa" d="M18.6 13C23 13 24 15 24 18.5C24 22 23 24 19 24"/>
    </svg>`);

  const encabezado = logo.closest('.encabezado');
  const cafe = logo.querySelector('.cafetera-cafe');
  let pendiente = false;

  function llenar() {
    pendiente = false;
    const total = document.documentElement.scrollHeight - window.innerHeight; // Cuánto se puede bajar en total
    const avance = total > 0 ? Math.min(1, window.scrollY / total) : 0;      // De 0 (arriba) a 1 (al final)
    cafe.style.transform = `scaleY(${avance})`;
    encabezado.classList.toggle('bajando', window.scrollY > 40); // Aparece cuando ya bajaste un poco
  }

  // requestAnimationFrame: el scroll avisa muchísimas veces por segundo; así llenamos máximo una vez por cuadro
  window.addEventListener('scroll', () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(llenar); }
  }, { passive: true });
  window.addEventListener('resize', llenar);
  llenar();
})();

/* =========================================================
   INSTAGRAM EN VIVO (Behold): las últimas 6 publicaciones de @piamonte.cafe
   Plan gratis de Behold: 1.200 consultas al mes. Para no gastarlas, cada visitante
   guarda el feed 12 horas en su navegador (localStorage) y no lo vuelve a pedir
   ========================================================= */

(() => {
  const lista = document.getElementById('instagram-fotos');
  if (!lista || !FEED_INSTAGRAM) return;

  const CLAVE = 'piamonte-instagram';
  const DOCE_HORAS = 12 * 60 * 60 * 1000;

  // localStorage puede fallar (modo privado, bloqueado): por eso va dentro de try/catch
  function leerGuardado() {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE));
      if (guardado && Date.now() - guardado.fecha < DOCE_HORAS) return guardado.datos;
    } catch (e) { /* Sin guardado: se pide de nuevo */ }
    return null;
  }
  function guardar(datos) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ fecha: Date.now(), datos })); } catch (e) { /* No pasa nada */ }
  }

  function mostrar(datos) {
    const posts = (datos.posts || []).slice(0, 6);
    if (!posts.length) return;
    lista.innerHTML = '';
    posts.forEach((post) => {
      const tam = post.sizes && (post.sizes.medium || post.sizes.small);
      // Seguridad: los datos vienen de otro sitio. Solo aceptamos enlaces a Instagram
      // (así nadie puede colar un enlace peligroso tipo "javascript:..." en la página)
      if (!tam || !String(post.permalink).startsWith('https://www.instagram.com/')) return;
      const li = document.createElement('li');
      const enlace = document.createElement('a');
      enlace.href = post.permalink;
      enlace.target = '_blank';
      enlace.rel = 'noopener';
      const img = document.createElement('img');
      img.src = tam.mediaUrl;
      img.width = tam.width;
      img.height = tam.height;
      img.loading = 'lazy';
      img.decoding = 'async';
      // Texto alternativo: el que puso Piamonte en Instagram o, si no hay, el comienzo de la publicación
      img.alt = post.altText || (post.prunedCaption || 'Publicación de Piamonte Café en Instagram').slice(0, 120);
      enlace.appendChild(img);
      li.appendChild(enlace);
      lista.appendChild(li);
    });
    lista.hidden = false;
  }

  const guardado = leerGuardado();
  if (guardado) { mostrar(guardado); return; }

  fetch(FEED_INSTAGRAM)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((datos) => { guardar(datos); mostrar(datos); })
    .catch(() => { /* Si Behold no responde (o se acabaron las consultas del mes), queda el botón al perfil */ });
})();

/* ===== BOTONES DE WHATSAPP ===== */
// Todos los enlaces con la clase "js-whatsapp" abren el chat con su mensaje (data-mensaje)

(() => {
  document.querySelectorAll('.js-whatsapp').forEach((enlace) => {
    if (!NUMERO) { // Sin número, el botón lleva al Instagram
      enlace.href = 'https://www.instagram.com/piamonte.cafe/';
      return;
    }
    const mensaje = enlace.dataset.mensaje || 'Hola Piamonte';
    enlace.href = `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`; // encodeURIComponent convierte espacios y tildes para la URL
  });
})();

/* ===== AÑO DEL PIE DE PÁGINA ===== */

(() => {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();

/* ===== VIDEO DE LA COSECHA ===== */
// Se reproduce solo cuando está en pantalla (ahorra datos y batería) y se pausa al salir.
// Con "reducir movimiento" activado no se reproduce: queda la imagen de portada.

(() => {
  const video = document.querySelector('.video-finca-clip');
  if (!video || !('IntersectionObserver' in window)) return;

  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

  new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting && !quieto.matches) {
      video.play().catch(() => {}); // Si el navegador no deja reproducir, se queda la portada
    } else {
      video.pause();
    }
  }, { threshold: 0.3 }).observe(video); // 0.3 = cuando se ve al menos el 30 % del video
})();
