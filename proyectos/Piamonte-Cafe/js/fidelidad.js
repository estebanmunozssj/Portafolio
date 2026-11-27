'use strict';

/* =========================================================
   TARJETA DE SELLOS (fidelidad.html): consultar, inscribirse y ver la tarjeta
   La conexión con Google está en js/fidelidad-api.js
   ========================================================= */

(() => {
  const pantallas = {
    consultar: document.getElementById('pantalla-consultar'),
    inscribir: document.getElementById('pantalla-inscribir'),
    tarjeta: document.getElementById('pantalla-tarjeta')
  };
  if (!pantallas.tarjeta) return;

  const CLAVE_CELULAR = 'piamonte-celular'; // El celular recordado en este navegador
  const CLAVE_SELLOS = 'piamonte-sellos-vistos'; // Para animar solo los sellos nuevos
  let celularActual = null;

  if (MODO_DEMO) document.getElementById('aviso-demo').hidden = false;

  function mostrar(nombre, enfocar = true) {
    Object.entries(pantallas).forEach(([clave, pantalla]) => { pantalla.hidden = clave !== nombre; });
    if (nombre !== 'tarjeta') pintarMuestra(); // Sin sesión, la tarjeta vuelve a ser el ejemplo
    window.scrollTo({ top: 0, behavior: 'instant' }); // La pantalla nueva empieza arriba, no donde quedó la anterior
    // Lleva el foco al primer campo (en la tarjeta no: no hay nada que escribir)
    const campo = pantallas[nombre].querySelector('input');
    if (enfocar && campo) campo.focus();
  }

  // Botones "Saca tu tarjeta" / "Búscala con tu celular": pasan el celular escrito a la otra pantalla
  document.querySelectorAll('[data-ir]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const destino = boton.dataset.ir;
      const origen = destino === 'inscribir' ? 'consultar' : 'inscribir';
      const escrito = document.getElementById(`${origen}-celular`).value;
      if (escrito) document.getElementById(`${destino}-celular`).value = escrito;
      mostrar(destino);
    });
  });

  // Mientras espera a Google: botón desactivado con "Un momento..."
  function cargando(boton, activo) {
    if (activo) {
      boton.dataset.contenido = boton.innerHTML; // innerHTML: así vuelve también el ícono
      boton.textContent = 'Un momento...';
    } else if (boton.dataset.contenido) {
      boton.innerHTML = boton.dataset.contenido;
    }
    boton.disabled = activo;
  }

  // ===== CONSULTAR =====
  document.getElementById('form-consultar').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const error = document.getElementById('consultar-error');
    const boton = formulario.querySelector('button[type="submit"]');
    const celular = formulario.celular.value;

    error.textContent = '';
    cargando(boton, true);
    const respuesta = await pedirTarjeta('tarjeta', { celular });
    cargando(boton, false);

    if (respuesta.ok) return abrirTarjeta(celular, respuesta.tarjeta);
    error.textContent = mensajeError(respuesta.error);
    if (respuesta.error === 'no_existe') {
      error.textContent += ' Sácala abajo, es gratis.';
    }
  });

  // ===== INSCRIBIRSE =====
  document.getElementById('form-inscribir').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const error = document.getElementById('inscribir-error');
    const boton = formulario.querySelector('button[type="submit"]');
    const datos = {
      nombre: formulario.nombre.value,
      celular: formulario.celular.value,
      acepta: document.getElementById('inscribir-acepta').checked
    };

    error.textContent = '';
    cargando(boton, true);
    const respuesta = await pedirTarjeta('inscribir', datos);
    cargando(boton, false);

    if (respuesta.ok) return abrirTarjeta(datos.celular, respuesta.tarjeta);
    error.textContent = mensajeError(respuesta.error);
  });

  // ===== LA TARJETA =====
  function abrirTarjeta(celular, tarjeta) {
    celularActual = celular;
    guardarLocal(CLAVE_CELULAR, celular);
    pintar(tarjeta);
    mostrar('tarjeta', false);
  }

  // Tarjeta de ejemplo antes de entrar: 3 sellos para que se entienda la idea
  function pintarMuestra() {
    pintar({ nombre: '', sellos: 3, meta: 10, premios: 0 }, true);
  }

  function pintar(tarjeta, esMuestra = false) {
    const { nombre, sellos, meta, premios } = tarjeta;
    const elTarjeta = document.getElementById('tarjeta');
    // Cuando el ejemplo se vuelve TU tarjeta, un brillo la cruza una vez (no en cada actualización)
    if (!esMuestra && elTarjeta.classList.contains('muestra')) {
      elTarjeta.classList.remove('brilla');
      void elTarjeta.offsetWidth; // Reinicia la animación si ya había pasado
      elTarjeta.classList.add('brilla');
    }
    elTarjeta.classList.toggle('muestra', esMuestra);
    document.getElementById('tarjeta-nota').hidden = !esMuestra;

    // Solo se animan los sellos que no había visto la última vez (si es la primera vez o el ejemplo, ninguno)
    let desde = sellos;
    if (!esMuestra) {
      const antes = leerLocal(CLAVE_SELLOS);
      if (antes !== null && Number(antes) < sellos) desde = Number(antes);
      guardarLocal(CLAVE_SELLOS, String(sellos));
    }

    // Casillas: logo de Piamonte en las selladas, grano tenue en las vacías (js/fidelidad-api.js)
    const casillas = casillasSellos(document.getElementById('sellos'), sellos, meta);
    // Los sellos nuevos caen uno detrás de otro
    casillas.forEach((casilla, i) => {
      if (i + 1 <= sellos && i + 1 > desde) {
        casilla.classList.add('nuevo');
        casilla.style.animationDelay = `${(i - desde) * 120}ms`;
      }
    });

    const completa = sellos >= meta;
    const faltan = meta - sellos;
    document.getElementById('tarjeta').classList.toggle('completa', completa);
    document.getElementById('tarjeta-hola').textContent =
      esMuestra ? 'Tu tarjeta' : completa ? `¡Lo lograste, ${nombre}!` : `Hola, ${nombre}`;
    // En el ejemplo no va mensaje: la tarjeta queda más corta y el botón entra en la primera pantalla del celular
    const mensaje = document.getElementById('tarjeta-mensaje');
    mensaje.hidden = esMuestra;
    mensaje.textContent = esMuestra ? '' : mensajeSellos(sellos, meta, premios);
    document.getElementById('tarjeta-estado').textContent = completa
      ? 'Tarjeta llena: muestra esta pantalla en caja.'
      : `Te ${faltan === 1 ? 'falta 1 sello' : `faltan ${faltan} sellos`} para tu café gratis.`;

    // Barra de avance (se llena con transición) y conteo "3/10"
    const barra = document.getElementById('tarjeta-barra');
    barra.style.setProperty('--avance', sellos / meta);
    barra.setAttribute('aria-valuenow', sellos);
    barra.setAttribute('aria-valuemax', meta);
    document.getElementById('tarjeta-conteo').textContent = `${sellos}/${meta}`;

    // Recién llenó la tarjeta (no cada vez que la abre llena): lluvia de granos desde la taza
    if (completa && !esMuestra && desde < sellos) {
      setTimeout(() => celebrar(casillas[meta - 1]), (sellos - desde) * 120 + 350);
    }
    document.getElementById('tarjeta-premios').textContent =
      premios > 0 ? `${premios} ${premios === 1 ? 'café ganado' : 'cafés ganados'}` : '';
  }

  // Celebración de tarjeta llena: 14 granos salen de la taza del premio y se desvanecen.
  // Solo transform y opacity (no traban la página). Con "menos movimiento" no sale: queda el mensaje
  function celebrar(taza) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const tarjeta = document.getElementById('tarjeta');
    const caja = tarjeta.getBoundingClientRect();
    const origen = taza.getBoundingClientRect();
    const x = origen.left - caja.left + origen.width / 2;
    const y = origen.top - caja.top + origen.height / 2;

    for (let i = 0; i < 14; i++) {
      const grano = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      grano.setAttribute('class', 'grano-celebra');
      grano.setAttribute('aria-hidden', 'true');
      grano.innerHTML = '<use href="#i-grano"/>';
      grano.style.left = `${x}px`;
      grano.style.top = `${y}px`;
      tarjeta.appendChild(grano);

      // Hacia arriba y a los lados, cada uno con su distancia y su giro
      const angulo = (-160 + (140 / 13) * i + (Math.random() * 10 - 5)) * (Math.PI / 180);
      const distancia = 70 + Math.random() * 90;
      const dx = Math.cos(angulo) * distancia;
      const dy = Math.sin(angulo) * distancia;
      const giro = Math.random() * 300 - 150;
      grano.animate([
        { transform: 'translate(-50%, -50%) scale(0.6) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${giro}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy * 1.15 + 30}px)) scale(0.9) rotate(${giro * 1.3}deg)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 300, delay: i * 25, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' })
        .finished.then(() => grano.remove());
    }
  }

  async function actualizar(boton) {
    if (!celularActual) return;
    if (boton) cargando(boton, true);
    const respuesta = await pedirTarjeta('tarjeta', { celular: celularActual });
    if (boton) cargando(boton, false);
    if (respuesta.ok) pintar(respuesta.tarjeta);
  }

  const botonActualizar = document.getElementById('actualizar');
  botonActualizar.addEventListener('click', () => actualizar(botonActualizar));

  // Al volver a la pestaña (ej. después de pagar), trae los sellos nuevos solo
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !pantallas.tarjeta.hidden) actualizar();
  });

  // "No soy yo": olvida el celular de este navegador
  document.getElementById('salir').addEventListener('click', () => {
    celularActual = null;
    guardarLocal(CLAVE_CELULAR, null);
    guardarLocal(CLAVE_SELLOS, null);
    document.getElementById('consultar-celular').value = '';
    mostrar('consultar');
  });

  // ===== AL ABRIR LA PÁGINA: si ya conocemos el celular, directo a la tarjeta =====
  pintarMuestra();
  const recordado = leerLocal(CLAVE_CELULAR);
  if (recordado) {
    pedirTarjeta('tarjeta', { celular: recordado }).then((respuesta) => {
      if (respuesta.ok) abrirTarjeta(recordado, respuesta.tarjeta);
      else guardarLocal(CLAVE_CELULAR, null);
    });
  }
})();
