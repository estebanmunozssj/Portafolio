const URL_ANIME = 'https://esm.sh/animejs@4'; // Librería de animaciones

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario desactivó animaciones

/* ===== EFECTO AL HACER SCROLL ===== */
/* Va primero y no depende de la librería: si Anime.js no carga, este efecto sigue funcionando */

(() => { // Envuelto para que sus variables no choquen con otros bloques
    if (sinMovimiento || !('IntersectionObserver' in window)) return; // Sin animaciones, todo se ve normal

    const elementos = document.querySelectorAll('.hero-texto, .hero-3d, .Servicios-encabezado, .Servicios-card, .galeria-encabezado, .galeria-foto, .testimonio-encabezado, .testimonio-grid, .nosotros-encabezado, .barbero-card, .productos-encabezado, .producto-card, .contacto-info, .contacto-mapa'); // Lo que se anima al llegar (cada clase lleva su punto)

    const observador = new IntersectionObserver((entradas) => { // Vigila cuándo entra cada elemento en pantalla
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return; // Si aún no se ve, no hace nada
            const el = entrada.target;
            el.classList.add('visible'); // Lo muestra
            observador.unobserve(el); // Ya no hace falta vigilarlo

            let limpio = false; // Para limpiar una sola vez
            const alTerminarTransicion = (e) => {
                if (e.target === el) limpiar(); // Ignora transiciones de elementos internos
            };
            const limpiar = () => {
                if (limpio) return;
                limpio = true;
                el.removeEventListener('transitionend', alTerminarTransicion);
                clearTimeout(respaldo);
                el.classList.remove('reveal', 'visible'); // Quita las clases para que los efectos hover funcionen normal
                el.style.transitionDelay = '';
            };
            el.addEventListener('transitionend', alTerminarTransicion);
            const respaldo = setTimeout(limpiar, 1600); // Por si la transición nunca avisa que terminó
        });
    }, { threshold: 0.15 }); // Se activa cuando se ve el 15% del elemento

    elementos.forEach((el) => {
        const posicion = Array.from(el.parentElement.children).indexOf(el); // Qué número de hijo es dentro de su grupo
        el.style.transitionDelay = `${Math.min(posicion, 4) * 0.1}s`; // Retraso de 0.1 s por elemento, hasta 0.4 s
        el.classList.add('reveal'); // Lo esconde para animarlo después
        observador.observe(el);
    });
})();

/* ===== ANIMACIONES DE ENTRADA (MENÚ E INTRO) ===== */

async function animarEntrada() {
    const objetivos = document.querySelectorAll('.logo, .nav-links li, .btn-reservar, .intro-etiqueta, .intro-titulo, .intro-descubre'); // Lo que entra animado
    objetivos.forEach((el) => { el.style.opacity = '0'; }); // Lo esconde ya, para que no parpadee mientras carga la librería

    try {
        const { animate, stagger } = await import(URL_ANIME); // Carga la librería (si falla, salta al catch)

        /* ===== MENÚ ===== */

        animate('.logo', { // Logo del menú
            opacity: [0, 1], // De transparente a visible
            x: [-20, 0], // Entra desde 20px a la izquierda
            duration: 800,
            ease: 'outCubic'
        });

        animate('.nav-links li', { // Enlaces del menú, uno por uno
            opacity: [0, 1],
            y: [15, 0], // Suben 15px
            delay: stagger(150, { start: 200 }), // 150 ms de diferencia entre cada uno
            duration: 600,
            ease: 'outCubic'
        });

        animate('.btn-reservar', { // Botón de reserva
            opacity: [0, 1],
            scale: [0.85, 1], // Crece hasta su tamaño normal
            duration: 700,
            delay: 900,
            ease: 'outBack' // Con un pequeño rebote
        });

        /* ===== INTRO ===== */

        animate('.intro-etiqueta', { // Texto superior
            opacity: [0, 1],
            y: [10, 0],
            duration: 700,
            delay: 300,
            ease: 'outCubic'
        });

        animate('.intro-titulo', { // CUCHILLA URBANA
            opacity: [0, 1],
            y: [35, 0],
            scale: [0.96, 1],
            duration: 1100,
            delay: 450,
            ease: 'outCubic'
        });

        animate('.intro-descubre', { // Enlace DESCUBRE y su flecha
            opacity: [0, 1],
            y: [15, 0],
            duration: 700,
            delay: 1000,
            ease: 'outCubic'
        });
    } catch (error) {
        console.warn('No se pudo cargar la librería de animaciones; la página se muestra sin ellas.', error);
        objetivos.forEach((el) => { el.style.opacity = ''; }); // Si falló, vuelve a mostrar todo normal
    }
}

if (!sinMovimiento) { // Las animaciones de entrada solo corren si no pidió reducir movimiento
    animarEntrada();
}
