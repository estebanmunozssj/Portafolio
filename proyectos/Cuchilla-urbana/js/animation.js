
import { animate, stagger } from 'https://esm.sh/animejs';

// Animación del logo
animate('.logo', {
    opacity: [0, 1],
    x: [-20, 0],
    duration: 800,
    ease: 'outCubic'
});

// Enlaces del menú, uno por uno
animate('.nav-links li', {
    opacity: [0, 1],
    y: [15, 0],
    delay: stagger(150, { start: 200 }),
    duration: 600,
    ease: 'outCubic'
});


/* Animación del botón de reserva */
animate('.btn-reservar', {
    opacity: [0, 1],
    scale: [0.85, 1],
    duration: 700,
    delay: 900,
    ease: 'outBack'
});

/* ===== ANIMACIÓN DEL LOGO ===== */

animate('.logo', { // Selecciona el elemento HTML que tiene la clase logo
    opacity: [0, 1], // Hace que el logo pase de transparente a visible
    x: [-20, 0], // Mueve el logo desde 20px a la izquierda hasta su posición original
    duration: 800, // Establece una duración de 800 milisegundos
    ease: 'outCubic' // Hace que el movimiento termine suavemente
});

/* ===== ANIMACIÓN DE LOS ENLACES DEL MENÚ ===== */

animate('.nav-links li', { // Selecciona cada elemento li dentro de la lista de navegación
    opacity: [0, 1], // Hace que cada enlace aparezca gradualmente
    y: [15, 0], // Desplaza cada enlace desde abajo hasta su posición original
    delay: stagger(150, { start: 200 }), // Inicia las animaciones con 150ms de diferencia, comenzando después de 200ms
    duration: 600, // Hace que cada enlace tarde 600 milisegundos en animarse
    ease: 'outCubic' // Suaviza el final del movimiento
});

/* ===== ANIMACIÓN DEL BOTÓN DE RESERVA ===== */

animate('.btn-reservar', { // Selecciona el botón que tiene la clase btn-reservar
    opacity: [0, 1], // Hace aparecer el botón gradualmente
    scale: [0.85, 1], // Aumenta el botón desde el 85% hasta su tamaño normal
    duration: 700, // Establece una duración de 700 milisegundos
    delay: 900, // Espera 900 milisegundos antes de comenzar
    ease: 'outBack' // Añade un pequeño efecto de rebote al final
});

/* ===== ANIMACIÓN DE LA ETIQUETA SUPERIOR ===== */

animate('.intro-etiqueta', { // Selecciona el texto superior de la introducción
    opacity: [0, 1], // Hace que el texto aparezca gradualmente
    y: [10, 0], // Lo mueve 10px hacia arriba hasta su posición original
    duration: 700, // Establece una duración de 700 milisegundos
    delay: 300, // Espera 300 milisegundos antes de comenzar
    ease: 'outCubic' // Hace que el movimiento termine suavemente
});

/* ===== ANIMACIÓN DEL TÍTULO PRINCIPAL ===== */

animate('.intro-titulo', { // Selecciona el título CUCHILLA URBANA
    opacity: [0, 1], // Hace que el título aparezca desde transparente
    y: [35, 0], // Lo desplaza desde 35px más abajo hasta su posición original
    scale: [0.96, 1], // Lo hace crecer ligeramente hasta su tamaño normal
    duration: 1100, // Hace que la animación dure 1.1 segundos
    delay: 450, // Espera 450 milisegundos antes de comenzar
    ease: 'outCubic' // Suaviza el final de la animación
});

/* ===== ANIMACIÓN DEL ENLACE DESCUBRE ===== */

animate('.intro-descubre', { // Selecciona el enlace DESCUBRE y su flecha
    opacity: [0, 1], // Hace que el conjunto aparezca gradualmente
    y: [15, 0], // Lo desplaza desde abajo hasta su posición original
    duration: 700, // Establece una duración de 700 milisegundos
    delay: 1000, // Espera un segundo antes de comenzar
    ease: 'outCubic' // Hace que el movimiento termine suavemente
});
