'use strict';

/* =========================================================
   MI LISTA (solo menu.html)
   El cliente va añadiendo lo que se le antoja. Al llegar a la barra toca
   "Mostrar al barista" y la lista se ve en letra grande para leerla.
   - No es un pedido en línea: nada se envía a ningún lado
   - Se guarda en el celular (localStorage) para que no se pierda si cierra la página
   - Usa MENU y dibujar() de js/menu.js, por eso se carga DESPUÉS de menu.js.
     menu.js pone el botón "+" en cada cuadro y "Añadir a mi lista" en la ventana de detalle
   ========================================================= */

const ListaPedido = (() => {
  const CLAVE = 'piamonte-mi-lista';
  const textoPrecio = (p) => (p ? '$' + p.toLocaleString('es-CO') : 'Precio pronto');
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Buscar un producto del menú por su nombre (el nombre es lo que se guarda)
  const PRODUCTOS = new Map();
  MENU.forEach((g) => g.productos.forEach((p) => PRODUCTOS.set(p.nombre, p)));

  /* ----- Guardar y leer (en modo privado o sin permiso puede fallar: la lista sigue funcionando en memoria) ----- */
  let items = []; // [{ nombre, cantidad }], en el orden en que se añadieron
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    if (Array.isArray(guardado)) {
      // Si un producto ya no está en el menú, se descarta
      items = guardado.filter((i) => i && PRODUCTOS.has(i.nombre) && i.cantidad > 0)
        .map((i) => ({ nombre: i.nombre, cantidad: Math.min(Math.floor(i.cantidad), 20) }));
    }
  } catch { items = []; }

  const guardar = () => {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento: no pasa nada */ }
  };

  const cantidad = (nombre) => (items.find((i) => i.nombre === nombre) || {}).cantidad || 0;
  const totalUnidades = () => items.reduce((s, i) => s + i.cantidad, 0);

  function cambiar(nombre, diferencia) {
    let item = items.find((i) => i.nombre === nombre);
    if (!item && diferencia > 0) { item = { nombre, cantidad: 0 }; items.push(item); }
    if (!item) return;
    item.cantidad = Math.min(item.cantidad + diferencia, 20); // Tope de 20 por producto (evita toques de más)
    if (item.cantidad <= 0) items = items.filter((i) => i !== item);
    guardar();
    pintar();
  }

  /* ----- Piezas de la página ----- */
  const barra = document.getElementById('lista-barra');
  const barraCantidad = document.getElementById('lista-barra-cantidad');
  const barraTotal = document.getElementById('lista-barra-total');
  const ventana = document.getElementById('lista');
  const filas = document.getElementById('lista-filas');
  const total = document.getElementById('lista-total');
  const totalNota = document.getElementById('lista-total-nota');
  const botonBarista = document.getElementById('lista-barista');
  const botonVaciar = document.getElementById('lista-vaciar');
  const botonWhatsapp = document.getElementById('lista-whatsapp');
  const titulo = document.getElementById('lista-titulo');
  const ayuda = document.getElementById('lista-ayuda');

  // Los dibujos usan ids internos ("dentro-taza"); cada copia necesita el suyo (igual que en menu.js)
  let contador = 0;
  const dibujoUnico = (p) => {
    const n = contador++;
    return dibujar(p).replace(/dentro-(\w+)/g, (_, forma) => `dentro-${forma}-l${n}`);
  };

  function sumar() {
    let plata = 0;
    let sinPrecio = 0;
    items.forEach((i) => {
      const p = PRODUCTOS.get(i.nombre);
      if (p.precio) plata += p.precio * i.cantidad;
      else sinPrecio += i.cantidad;
    });
    return { plata, sinPrecio };
  }

  function crearFila(item) {
    const p = PRODUCTOS.get(item.nombre);
    const li = document.createElement('li');
    li.className = 'lista-fila';
    li.dataset.nombre = item.nombre;
    const imagen = p.foto
      ? `<img src="${p.foto}" alt="" loading="lazy" decoding="async"${p.encuadre ? ` style="object-position:${p.encuadre}"` : ''}>`
      : dibujoUnico(p);
    li.innerHTML = `
      <span class="lista-cantidad-grande" aria-hidden="true">${item.cantidad}×</span>
      <span class="lista-mini${p.foto ? '' : ' sin-foto'}" aria-hidden="true">${imagen}</span>
      <span class="lista-texto">
        <span class="lista-nombre"></span>
        <span class="lista-precio">${p.precio && item.cantidad > 1
          ? `${textoPrecio(p.precio * item.cantidad)} <small>(${item.cantidad} × ${textoPrecio(p.precio)})</small>`
          : textoPrecio(p.precio)}</span>
      </span>
      <span class="lista-control">
        <button type="button" class="lista-menos" aria-label="Quitar un ${item.nombre}">${item.cantidad === 1 ? ICONO_BORRAR : '−'}</button>
        <span class="lista-numero" aria-live="polite" aria-label="${item.cantidad} en la lista">${item.cantidad}</span>
        <button type="button" class="lista-mas" aria-label="Añadir otro ${item.nombre}"${item.cantidad >= 20 ? ' disabled' : ''}>+</button>
      </span>`;
    li.querySelector('.lista-nombre').textContent = item.nombre; // textContent: el nombre nunca se toma como HTML
    li.querySelector('.lista-menos').addEventListener('click', () => cambiar(item.nombre, -1));
    li.querySelector('.lista-mas').addEventListener('click', () => cambiar(item.nombre, 1));
    return li;
  }

  const ICONO_BORRAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // El botón "+" de cada cuadro del menú: muestra cuántos llevas de ese producto
  function marcar(boton) {
    const nombre = boton.dataset.nombre;
    const n = cantidad(nombre);
    boton.classList.toggle('en-lista', n > 0);
    boton.innerHTML = n > 0 ? `<span>${n}</span>` : '+';
    boton.setAttribute('aria-label', n > 0 ? `Añadir otro ${nombre} a mi lista (llevas ${n})` : `Añadir ${nombre} a mi lista`);
  }

  // Vuelve a dibujar la barra de abajo y la ventana con lo que haya en la lista
  function pintar() {
    const unidades = totalUnidades();
    const { plata, sinPrecio } = sumar();

    // Barra flotante
    barra.hidden = unidades === 0;
    document.body.classList.toggle('con-lista', unidades > 0);
    barraCantidad.textContent = unidades;
    barraTotal.textContent = plata ? textoPrecio(plata) : '';
    barra.setAttribute('aria-label', `Ver mi lista: ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`);

    // Ventana
    ventana.classList.toggle('vacia', unidades === 0);
    if (unidades === 0) ventana.classList.remove('modo-barista');
    // Se conserva el botón enfocado al redibujar (si tocaste "+", el foco sigue en ese "+")
    const activo = document.activeElement;
    const filaActiva = activo && activo.closest && activo.closest('.lista-fila');
    const enfocar = filaActiva ? [filaActiva.dataset.nombre, activo.className] : null;

    filas.innerHTML = '';
    items.forEach((i) => filas.appendChild(crearFila(i)));
    if (enfocar) {
      const fila = [...filas.children].find((f) => f.dataset.nombre === enfocar[0]);
      const boton = fila && fila.querySelector('.' + enfocar[1]);
      if (boton && !boton.disabled) boton.focus();
      else botonBarista.focus();
    }

    total.textContent = textoPrecio(plata) === 'Precio pronto' ? '$0' : textoPrecio(plata);
    totalNota.textContent = sinPrecio
      ? `+ ${sinPrecio} ${sinPrecio === 1 ? 'producto' : 'productos'} con precio por confirmar`
      : '';
    totalNota.hidden = !sinPrecio;

    document.querySelectorAll('.producto-agregar[data-nombre]').forEach(marcar);
    botonWhatsapp.href = enlaceWhatsapp(plata, sinPrecio);
  }

  // Domicilio: el mensaje de WhatsApp lleva la lista ya escrita. NUMERO viene de js/main.js
  function enlaceWhatsapp(plata, sinPrecio) {
    if (typeof NUMERO === 'undefined' || !NUMERO) return 'https://www.instagram.com/piamonte.cafe/';
    const lineas = items.map((i) => {
      const p = PRODUCTOS.get(i.nombre);
      return `• ${i.cantidad} × ${i.nombre} (${p.precio ? textoPrecio(p.precio * i.cantidad) : 'precio por confirmar'})`;
    });
    const mensaje = [
      'Hola Piamonte, quiero pedir a domicilio:',
      '',
      ...lineas,
      '',
      `Total aproximado: ${textoPrecio(plata) === 'Precio pronto' ? '$0' : textoPrecio(plata)}${sinPrecio ? ' + lo que tiene precio por confirmar' : ''}`,
      '',
      'Mi nombre: ',
      'Mi dirección: ',
    ].join('\n');
    return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensaje)}`;
  }

  // Pequeño salto de la barra cuando se añade algo, para que se note dónde quedó
  function saltarBarra() {
    if (barra.hidden || !barra.animate || menosMovimiento.matches) return;
    barra.animate(
      [{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.06)' }, { transform: 'translateX(-50%) scale(1)' }],
      { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  }

  /* ----- Modo barista: letra grande y sin botones, para leer en la barra ----- */
  function modoBarista(activar) {
    ventana.classList.toggle('modo-barista', activar);
    titulo.textContent = activar ? 'Mi pedido' : 'Mi lista';
    ayuda.textContent = activar
      ? 'Muéstrale esta pantalla al barista.'
      : 'Cuando llegues a la barra, toca «Mostrar al barista».';
    botonBarista.textContent = activar ? 'Volver a editar' : 'Mostrar al barista';
    ventana.scrollTop = 0;
  }

  function abrir() {
    modoBarista(false);
    if (ventana.showModal) ventana.showModal();
    else ventana.setAttribute('open', '');
  }

  barra.addEventListener('click', abrir);
  document.getElementById('lista-cerrar').addEventListener('click', () => ventana.close());
  document.getElementById('lista-seguir').addEventListener('click', () => ventana.close());
  ventana.addEventListener('click', (e) => { if (e.target === ventana) ventana.close(); });
  botonBarista.addEventListener('click', () => modoBarista(!ventana.classList.contains('modo-barista')));

  // Vaciar pide un segundo toque, para no borrar la lista por error
  let confirmar = null;
  botonVaciar.addEventListener('click', () => {
    if (confirmar) {
      clearTimeout(confirmar);
      confirmar = null;
      botonVaciar.textContent = 'Vaciar lista';
      items = [];
      guardar();
      pintar();
      return;
    }
    botonVaciar.textContent = '¿Seguro? Toca otra vez';
    confirmar = setTimeout(() => { botonVaciar.textContent = 'Vaciar lista'; confirmar = null; }, 3000);
  });

  pintar();

  return {
    cantidad,
    marcar,
    agregar(nombre) { cambiar(nombre, 1); saltarBarra(); },
  };
})();
