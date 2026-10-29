
import { animate, stagger } from 'https://esm.sh/animejs@4'; // Librería de animaciones, con versión fija

const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches; // true si el usuario desactivó animaciones

if (!sinMovimiento) { // Todas las animaciones de entrada solo corren si no pidió reducir movimiento

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
}

/* ===== EFECTO AL HACER SCROLL ===== */

(() => { // Envuelto para que sus variables no choquen con otros bloques
    if (sinMovimiento || !('IntersectionObserver' in window)) return; // Sin animaciones, todo se ve normal

    const elementos = document.querySelectorAll('.hero-texto, .hero-3d, .Servicios-encabezado, .Servicios-card, .galeria-encabezado, .galeria-foto, .testimonio-encabezado, .testimonio-grid, .nosotros-encabezado, .barbero-card, productos-encabezado, producto-card, contacto-info, contacto-mapa'); // Lo que se anima al llegar

    const observador = new IntersectionObserver((entradas) => { // Vigila cuándo entra cada elemento en pantalla
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return; // Si aún no se ve, no hace nada
            const el = entrada.target;
            el.classList.add('visible'); // Lo muestra
            observador.unobserve(el); // Ya no hace falta vigilarlo

            const terminar = (e) => {
                if (e.target !== el) return; // Ignora transiciones de elementos internos
                el.removeEventListener('transitionend', terminar);
                el.classList.remove('reveal', 'visible'); // Quita las clases para que los efectos hover funcionen normal
                el.style.transitionDelay = '';
            };
            el.addEventListener('transitionend', terminar);
        });
    }, { threshold: 0.15 }); // Se activa cuando se ve el 15% del elemento

    elementos.forEach((el) => {
        const posicion = Array.from(el.parentElement.children).indexOf(el); // Qué número de hijo es dentro de su grupo
        el.style.transitionDelay = `${Math.min(posicion, 4) * 0.1}s`; // Retraso de 0.1 s por elemento, hasta 0.4 s
        el.classList.add('reveal'); // Lo esconde para animarlo después
        observador.observe(el);
    });
})();

