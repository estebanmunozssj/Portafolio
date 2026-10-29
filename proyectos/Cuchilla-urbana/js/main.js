/* ===== MENÚ HAMBURGUESA ===== */

(() => { // Cada bloque va envuelto para que sus variables no choquen con las de otros
  const toggle = document.querySelector('.menu-toggle'); // Botón de las tres rayas
  const menu = document.getElementById('menu'); // Contenedor de los enlaces
  if (!toggle || !menu) return; // Si falta alguno, no hace nada en vez de dar error

  toggle.addEventListener('click', () => { // Al tocar la hamburguesa...
    const open = menu.classList.toggle('open'); // ...abre o cierra el menú (true si quedó abierto)
    toggle.setAttribute('aria-expanded', open); // Avisa a lectores de pantalla
  });

  menu.querySelectorAll('a').forEach((a) => { // Recorre cada enlace del menú
    a.addEventListener('click', () => { // Al tocar uno...
      menu.classList.remove('open'); // ...cierra el menú
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ===== EFECTO 3D DE LA FOTO DEL HERO ===== */

(() => {
  const caja3d = document.querySelector('.hero-3d'); // Caja de la foto
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario desactivó animaciones
  if (!caja3d || sinMovimiento) return; // Sin foto o sin permiso de movimiento, no hace nada

  const foto3d = caja3d.querySelector('img');

  caja3d.addEventListener('mousemove', (e) => { // Al mover el mouse sobre la foto...
    const r = caja3d.getBoundingClientRect(); // Mide posición y tamaño de la caja
    const x = (e.clientX - r.left) / r.width - 0.5; // Posición horizontal, de -0.5 a 0.5
    const y = (e.clientY - r.top) / r.height - 0.5; // Posición vertical, de -0.5 a 0.5
    foto3d.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`; // Inclina la foto hacia el mouse
  });

  caja3d.addEventListener('mouseleave', () => { // Al salir el mouse...
    foto3d.style.transform = 'rotateY(0) rotateX(0)'; // ...vuelve a su posición
  });
})();

/* ===== VISOR DE FOTOS DE LA GALERÍA ===== */

(() => {
  const visor = document.getElementById('visor'); // Ventana emergente
  if (!visor) return;

  const fotos = Array.from(document.querySelectorAll('.galeria-foto img')); // Las 6 fotos de la galería
  const imagenGrande = visor.querySelector('.visor-img'); // La foto ampliada
  let actual = 0; // Cuál foto se está viendo

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length; // Da la vuelta: después de la última va la primera
    imagenGrande.src = fotos[actual].src; // Copia la ruta de la miniatura
    imagenGrande.alt = fotos[actual].alt; // Y su descripción
  }

  fotos.forEach((foto, i) => {
    const boton = foto.closest('.galeria-abrir'); // Botón que envuelve la foto
    if (!boton) return; // Si falta en el HTML, se salta esa foto
    boton.addEventListener('click', () => { // Al tocar una foto...
      mostrar(i);
      visor.showModal(); // ...abre el visor
    });
  });

  visor.querySelector('.visor-cerrar').addEventListener('click', () => visor.close()); // Cerrar
  visor.querySelector('.visor-prev').addEventListener('click', () => mostrar(actual - 1)); // Anterior
  visor.querySelector('.visor-next').addEventListener('click', () => mostrar(actual + 1)); // Siguiente

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
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario desactivó animaciones
  if (!rayas || sinMovimiento) return;

  const periodo = 16.97; // Alto de un ciclo de rayas (12px × √2); al repetirse, no se nota el salto

  function girar() {
    rayas.style.transform = `translateY(${(window.scrollY * 0.15) % periodo}px)`; // Se desplazan según lo que bajas
  }

  window.addEventListener('scroll', girar, { passive: true });
  girar();
})();

