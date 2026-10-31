'use strict'; // Modo estricto: el navegador avisa de errores que de otro modo pasarían callados

const prefiereSinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario desactivó animaciones

/* ===== MENÚ HAMBURGUESA ===== */

(() => { // Cada bloque va envuelto para que sus variables no choquen con las de otros
  const toggle = document.querySelector('.menu-toggle'); // Botón de las tres rayas
  const menu = document.getElementById('menu'); // Contenedor de los enlaces
  if (!toggle || !menu) return; // Si falta alguno, no hace nada en vez de dar error

  function ponerEstado(abierto) { // Deja el menú y el botón siempre en el mismo estado
    menu.classList.toggle('open', abierto); // Muestra u oculta el menú
    toggle.setAttribute('aria-expanded', String(abierto)); // Avisa a lectores de pantalla
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú'); // El botón dice lo que hará
  }

  toggle.addEventListener('click', () => { // Al tocar la hamburguesa...
    ponerEstado(!menu.classList.contains('open')); // ...abre si estaba cerrado, cierra si estaba abierto
  });

  menu.querySelectorAll('a').forEach((a) => { // Recorre cada enlace del menú
    a.addEventListener('click', () => ponerEstado(false)); // Al tocar uno, cierra el menú
  });

  document.addEventListener('keydown', (e) => { // Con la tecla Esc...
    if (e.key !== 'Escape' || !menu.classList.contains('open')) return;
    ponerEstado(false); // ...cierra el menú
    toggle.focus(); // Y devuelve el foco al botón
  });

  document.addEventListener('click', (e) => { // Al tocar fuera del menú...
    if (!menu.classList.contains('open')) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return; // (si tocó dentro, no hace nada)
    ponerEstado(false); // ...lo cierra
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { // Si la pantalla pasa a ser de computador...
    if (e.matches) ponerEstado(false); // ...deja el botón en estado "cerrado"
  });
})();

/* ===== EFECTO 3D DE LA FOTO DEL HERO ===== */

(() => {
  const caja3d = document.querySelector('.hero-3d'); // Caja de la foto
  const hayMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches; // true solo si hay mouse (no en celulares)
  if (!caja3d || prefiereSinMovimiento() || !hayMouse) return; // Sin foto, sin permiso de movimiento o sin mouse, no hace nada

  const foto3d = caja3d.querySelector('img');
  if (!foto3d) return; // Si falta la imagen, no hace nada en vez de dar error

  let cuadro = null; // Guarda el dibujo pendiente, para dibujar una sola vez por cuadro

  caja3d.addEventListener('mousemove', (e) => { // Al mover el mouse sobre la foto...
    const r = caja3d.getBoundingClientRect(); // Mide posición y tamaño de la caja
    const x = (e.clientX - r.left) / r.width - 0.5; // Posición horizontal, de -0.5 a 0.5
    const y = (e.clientY - r.top) / r.height - 0.5; // Posición vertical, de -0.5 a 0.5
    if (cuadro) cancelAnimationFrame(cuadro); // Si había un dibujo pendiente, lo reemplaza por el más reciente
    cuadro = requestAnimationFrame(() => { // Dibuja en el siguiente cuadro de pantalla
      foto3d.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`; // Inclina la foto hacia el mouse
      cuadro = null;
    });
  });

  caja3d.addEventListener('mouseleave', () => { // Al salir el mouse...
    if (cuadro) cancelAnimationFrame(cuadro); // ...cancela cualquier dibujo pendiente
    cuadro = null;
    foto3d.style.transform = 'rotateY(0) rotateX(0)'; // ...y vuelve a su posición
  });
})();

/* ===== VISOR DE FOTOS DE LA GALERÍA ===== */

(() => {
  const visor = document.getElementById('visor'); // Ventana emergente
  if (!visor) return;

  const fotos = Array.from(document.querySelectorAll('.galeria-foto img')); // Las 6 fotos de la galería
  const imagenGrande = visor.querySelector('.visor-img'); // La foto ampliada
  if (!imagenGrande || fotos.length === 0) return; // Sin foto grande o sin miniaturas, no hay nada que mostrar

  let actual = 0; // Cuál foto se está viendo

  function rutaGrande(i) { // Qué archivo mostrar al ampliar la foto i
    return fotos[i].dataset.grande || fotos[i].src; // Usa la versión grande (data-grande en el HTML); si no hay, la miniatura
  }

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length; // Da la vuelta: después de la última va la primera
    imagenGrande.src = rutaGrande(actual); // Pone la ruta de la foto
    imagenGrande.alt = fotos[actual].alt; // Y su descripción
    [actual - 1, actual + 1].forEach((vecina) => { // Descarga de antemano la anterior y la siguiente
      new Image().src = rutaGrande((vecina + fotos.length) % fotos.length);
    });
  }

  fotos.forEach((foto, i) => {
    const boton = foto.closest('.galeria-abrir'); // Botón que envuelve la foto
    if (!boton) return; // Si falta en el HTML, se salta esa foto
    boton.addEventListener('click', () => { // Al tocar una foto...
      mostrar(i);
      visor.showModal(); // ...abre el visor
    });
  });

  visor.querySelector('.visor-cerrar')?.addEventListener('click', () => visor.close()); // Cerrar
  visor.querySelector('.visor-prev')?.addEventListener('click', () => mostrar(actual - 1)); // Anterior
  visor.querySelector('.visor-next')?.addEventListener('click', () => mostrar(actual + 1)); // Siguiente

  visor.addEventListener('click', (e) => { // Clic en el fondo oscuro
    if (e.target === visor) visor.close(); // Cierra
  });

  visor.addEventListener('keydown', (e) => { // Teclas con el visor abierto
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
})();

/* ===== POSTE JUNTO AL LOGO ===== */

(() => {
  const rayas = document.querySelector('.poste-mini-rayas'); // Las rayas que se mueven
  if (!rayas || prefiereSinMovimiento()) return;

  const periodo = 16.97; // Alto de un ciclo de rayas (12px × √2); al repetirse, no se nota el salto

  function girar() {
    rayas.style.transform = `translateY(${(window.scrollY * 0.15) % periodo}px)`; // Se desplazan según lo que bajas
  }

  window.addEventListener('scroll', girar, { passive: true });
  girar();
})();
