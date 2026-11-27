'use strict';

/* =========================================================
   PANEL DEL BARISTA (panel.html): entrar con PIN, buscar, sellar, canjear
   Las reglas de verdad (PIN, 10 minutos, tarjeta llena) las revisa Google: fidelizacion/Codigo.gs
   ========================================================= */

(() => {
  const $ = (id) => document.getElementById(id);
  const CLAVE_PIN = 'piamonte-panel-pin'; // sessionStorage: se borra al cerrar la pestaña

  let pin = null;
  let cliente = null; // El cliente que está en pantalla

  if (MODO_DEMO) $('aviso-demo').hidden = false;

  // sessionStorage con try: en modo privado puede fallar y el panel sigue funcionando
  const sesion = {
    leer() { try { return sessionStorage.getItem(CLAVE_PIN); } catch (e) { return null; } },
    guardar(valor) { try { valor ? sessionStorage.setItem(CLAVE_PIN, valor) : sessionStorage.removeItem(CLAVE_PIN); } catch (e) { /* nada */ } }
  };

  function mostrar(nombre) {
    $('pantalla-pin').hidden = nombre !== 'pin';
    $('pantalla-panel').hidden = nombre !== 'panel';
    $('panel-salir').hidden = nombre !== 'panel';
    const campo = nombre === 'pin' ? $('pin') : $('buscar-celular');
    campo.focus();
  }

  function cargando(boton, activo) {
    if (activo) {
      boton.dataset.contenido = boton.innerHTML; // innerHTML: así vuelve también el ícono
      boton.textContent = 'Un momento...';
    } else if (boton.dataset.contenido) {
      boton.innerHTML = boton.dataset.contenido;
    }
    boton.disabled = activo;
  }

  // Mensaje corto abajo que se va solo
  let temporizador;
  function avisar(texto) {
    const aviso = $('panel-aviso');
    aviso.textContent = texto;
    aviso.classList.add('visible');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => aviso.classList.remove('visible'), 2500);
  }

  // Envía una acción con el PIN. Si el PIN dejó de servir (lo cambiaron), vuelve a pedirlo
  async function pedirConPin(accion, datos) {
    const respuesta = await pedirTarjeta(accion, { ...datos, pin });
    if (respuesta.error === 'pin_incorrecto') {
      salir();
      $('pin-error').textContent = 'El PIN cambió. Escríbelo otra vez.';
    }
    return respuesta;
  }

  // ===== ENTRAR =====
  $('form-pin').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const boton = evento.currentTarget.querySelector('button');
    const escrito = $('pin').value.trim();
    $('pin-error').textContent = '';

    cargando(boton, true);
    const respuesta = await pedirTarjeta('entrar', { pin: escrito });
    cargando(boton, false);

    if (!respuesta.ok) {
      $('pin-error').textContent = mensajeError(respuesta.error);
      $('pin').select();
      return;
    }
    pin = escrito;
    sesion.guardar(pin);
    $('pin').value = '';
    mostrar('panel');
  });

  function salir() {
    pin = null;
    sesion.guardar(null);
    limpiar();
    mostrar('pin');
  }
  $('panel-salir').addEventListener('click', salir);

  // ===== BUSCAR =====
  // Al tocar el campo, el número anterior queda seleccionado: se escribe encima para el siguiente cliente
  $('buscar-celular').addEventListener('focus', (evento) => evento.target.select());

  $('form-buscar').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const boton = evento.currentTarget.querySelector('button');
    const celular = $('buscar-celular').value;
    ocultarCliente();
    $('buscar-error').textContent = '';

    cargando(boton, true);
    const respuesta = await pedirConPin('buscar', { celular });
    cargando(boton, false);

    if (respuesta.ok) return pintarCliente(respuesta.cliente);
    if (respuesta.error === 'no_existe') {
      $('form-nuevo').hidden = false;
      $('nuevo-nombre').focus();
      return;
    }
    $('buscar-error').textContent = mensajeError(respuesta.error);
  });

  // ===== EL CLIENTE EN PANTALLA =====
  // selloNuevo = true cuando el barista acaba de sellar: ese sello cae con su animación
  function pintarCliente(datos, selloNuevo = false) {
    cliente = datos;
    const { nombre, celular, sellos, meta, premios } = datos;
    $('form-nuevo').hidden = true;
    $('confirmar-reciente').hidden = true;
    $('panel-cliente').hidden = false;

    $('cliente-nombre').textContent = nombre;
    $('cliente-celular').textContent =
      `${celular.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}${premios ? ` · ${premios} ${premios === 1 ? 'premio' : 'premios'} antes` : ''}`;

    // Las mismas casillas que ve el cliente: logo de Piamonte en las selladas (js/fidelidad-api.js)
    const casillas = casillasSellos($('cliente-sellos'), sellos, meta);
    if (selloNuevo && sellos > 0) casillas[sellos - 1].classList.add('nuevo');

    const llena = sellos >= meta;
    $('cliente-mensaje').textContent = `Dile: «${mensajeSellos(sellos, meta, premios)}»`;
    $('cliente-conteo').textContent = llena ? '¡Tarjeta llena! Entrégale su café gratis.' : `${sellos} de ${meta} sellos`;
    $('sellar').hidden = llena;
    $('canjear').hidden = !llena;
    $('quitar').hidden = sellos === 0;
  }

  function ocultarCliente() {
    cliente = null;
    $('panel-cliente').hidden = true;
    $('form-nuevo').hidden = true;
  }

  // Deja el panel listo para el siguiente cliente
  function limpiar() {
    ocultarCliente();
    $('buscar-celular').value = '';
    $('buscar-error').textContent = '';
  }

  // ===== SELLAR =====
  async function sellar(forzar) {
    const boton = forzar ? $('confirmar-si') : $('sellar');
    cargando(boton, true);
    const respuesta = await pedirConPin('sellar', { celular: cliente.celular, forzar });
    cargando(boton, false);

    if (respuesta.ok) {
      pintarCliente(respuesta.cliente, true);
      avisar(`Sello puesto a ${primerNombre(respuesta.cliente.nombre)}: ${respuesta.cliente.sellos} de ${respuesta.cliente.meta}`);
      return;
    }
    if (respuesta.error === 'muy_pronto') {
      const minutos = Math.max(1, Math.round((Date.now() - Date.parse(respuesta.cliente.ultimoSello)) / 60000));
      $('confirmar-texto').textContent = `Le pusieron un sello hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}. ¿Es otra compra?`;
      $('confirmar-reciente').hidden = false;
      $('sellar').hidden = true;
      $('confirmar-si').focus();
      return;
    }
    if (respuesta.cliente) pintarCliente(respuesta.cliente);
    avisar(mensajeError(respuesta.error));
  }

  $('sellar').addEventListener('click', () => sellar(false));
  $('confirmar-si').addEventListener('click', () => sellar(true));
  $('confirmar-no').addEventListener('click', () => pintarCliente(cliente));

  // ===== CANJEAR =====
  $('canjear').addEventListener('click', async () => {
    const boton = $('canjear');
    cargando(boton, true);
    const respuesta = await pedirConPin('canjear', { celular: cliente.celular });
    cargando(boton, false);

    if (respuesta.cliente) pintarCliente(respuesta.cliente);
    avisar(respuesta.ok ? 'Premio entregado. La tarjeta empieza de nuevo.' : mensajeError(respuesta.error));
  });

  // ===== QUITAR (con confirmación del navegador: es para corregir errores) =====
  $('quitar').addEventListener('click', async () => {
    if (!window.confirm(`¿Quitarle un sello a ${cliente.nombre}?`)) return;
    const respuesta = await pedirConPin('quitar', { celular: cliente.celular });
    if (respuesta.cliente) pintarCliente(respuesta.cliente);
    avisar(respuesta.ok ? 'Sello quitado.' : mensajeError(respuesta.error));
  });

  // ===== INSCRIBIR DESDE EL PANEL =====
  $('form-nuevo').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const boton = evento.currentTarget.querySelector('button');
    const celular = $('buscar-celular').value;
    $('nuevo-error').textContent = '';

    cargando(boton, true);
    const inscrito = await pedirTarjeta('inscribir', {
      nombre: $('nuevo-nombre').value,
      celular,
      acepta: $('nuevo-acepta').checked
    });
    if (!inscrito.ok) {
      cargando(boton, false);
      $('nuevo-error').textContent = mensajeError(inscrito.error);
      return;
    }
    // Recién creada: se busca para traer los datos completos y poder sellar de una
    const respuesta = await pedirConPin('buscar', { celular });
    cargando(boton, false);
    $('nuevo-nombre').value = '';
    $('nuevo-acepta').checked = false;
    if (respuesta.ok) {
      pintarCliente(respuesta.cliente);
      avisar('Tarjeta creada. Ya puedes ponerle el sello.');
    }
  });

  function primerNombre(nombre) {
    return String(nombre).split(' ')[0];
  }

  // ===== AL ABRIR: si la pestaña ya tenía PIN, entra directo =====
  pin = sesion.leer();
  mostrar(pin ? 'panel' : 'pin');
})();
