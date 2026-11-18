'use strict';

/* =========================================================
   PERFUME EN EL AIRE (solo en el inicio)
   Sobre el frasco elegido de la vitrina se dibujan dos cosas, en un <canvas> encima del armario,
   con el color de ese frasco (ver "El color de las partículas" más abajo):
   1. BRUMA: volutas color perla, casi transparentes, que suben despacio, se estiran y se desvanecen
   2. DESTELLOS: puntitos de luz champaña que suben más rápido y titilan,
      como las gotas finas de un atomizador al rociar

   Para que sea discreto y no gaste batería:
   - pocas partículas, lentas y casi transparentes
   - se apaga si la persona pidió "reducir movimiento", si tocó "Pausar movimiento",
     si la vitrina no está en pantalla o si la pestaña está escondida
   ========================================================= */

(function () {
  const armario = document.querySelector('.armario');
  if (!armario) return;

  const lienzo = document.createElement('canvas');
  lienzo.className = 'humo';
  lienzo.setAttribute('aria-hidden', 'true'); // es decoración
  armario.append(lienzo);
  const pincel = lienzo.getContext('2d');

  /* ---------- Ajustes (se pueden cambiar a gusto) ---------- */
  const BRUMA = {
    maximo: 10,              // volutas a la vez
    cadaMs: 520,             // cada cuánto nace una
    brillo: 0.13,            // qué tan visible es (0 a 1): bajo = más discreto
    color: '251, 248, 241'   // color si el frasco no tiene uno claro: perla (crema claro de la marca, #FBF8F1)
  };
  const DESTELLOS = {
    maximo: 9,
    cadaMs: 300,
    brillo: 0.75,
    color: '230, 207, 152'   // color si el frasco no tiene uno claro: champaña de la marca (#E6CF98)
  };

  const pideMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const brumas = [];
  const destellos = [];
  let ancho = 0;
  let alto = 0;
  let enPantalla = false;
  let corriendo = false;
  let ultimaBruma = 0;
  let ultimoDestello = 0;
  let ultimoDibujo = 0;
  const CADA_CUADRO_MS = 33; // se dibuja ~30 veces por segundo: igual de suave para algo tan lento, y gasta la mitad

  /* ---------- Tamaño del lienzo = tamaño del armario ---------- */
  // offsetWidth/offsetHeight: el tamaño del armario sin la ampliación (scale) que tiene en celular,
  // así el dibujo queda alineado con los frascos aunque el armario esté ampliado
  function medir() {
    const nitidez = Math.min(window.devicePixelRatio || 1, 2); // máximo 2: más no se nota y cuesta más
    ancho = armario.offsetWidth;
    alto = armario.offsetHeight;
    lienzo.width = Math.round(ancho * nitidez);
    lienzo.height = Math.round(alto * nitidez);
    pincel.setTransform(nitidez, 0, 0, nitidez, 0, 0);
  }

  /* ---------- El color de las partículas = el color del frasco elegido ---------- */
  // 1. Si el perfume tiene "color" en js/perfumes.js (ej: color: '#2F5D9E'), se usa ese.
  // 2. Si no, se saca de la foto del frasco: el color más vivo que tenga (azul, ámbar, rojo…).
  // 3. Si el frasco es plateado, gris, negro o transparente (no tiene un color claro), perla y champaña.
  // El color se aclara mezclándolo con el crema de la marca, para que parezca aire y no pintura.
  const CREMA = [251, 248, 241];
  const coloresGuardados = new Map(); // cada foto se analiza una sola vez

  function mezclar(color, conCrema) {
    return color.map(function (canal, i) {
      return Math.round(canal * (1 - conCrema) + CREMA[i] * conCrema);
    }).join(', ');
  }

  function desdeHex(hex) {
    const limpio = String(hex).replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(limpio)) return null;
    return [0, 2, 4].map(function (i) { return parseInt(limpio.slice(i, i + 2), 16); });
  }

  // Mira la foto en tamaño pequeño (24 × 24) y promedia los píxeles con color,
  // dándole más peso a los más vivos. Devuelve [r, g, b] o null si el frasco no tiene un color claro
  function colorDeLaFoto(foto) {
    const lienzoChico = document.createElement('canvas');
    lienzoChico.width = 24;
    lienzoChico.height = 24;
    const lapiz = lienzoChico.getContext('2d', { willReadFrequently: true });
    lapiz.drawImage(foto, 0, 0, 24, 24);
    const datos = lapiz.getImageData(0, 0, 24, 24).data; // falla si la foto es de otro sitio: se atrapa abajo

    let r = 0, g = 0, b = 0, peso = 0, visibles = 0, conColor = 0;
    for (let i = 0; i < datos.length; i += 4) {
      if (datos[i + 3] < 200) continue; // el fondo transparente no cuenta
      visibles++;
      const mayor = Math.max(datos[i], datos[i + 1], datos[i + 2]);
      const menor = Math.min(datos[i], datos[i + 1], datos[i + 2]);
      const viveza = (mayor - menor) / 255;     // 0 = gris, 1 = color puro
      const luz = (mayor + menor) / 510;
      if (viveza < 0.18 || luz < 0.1 || luz > 0.93) continue; // gris, casi negro o casi blanco: no cuenta
      conColor++;
      r += datos[i] * viveza;
      g += datos[i + 1] * viveza;
      b += datos[i + 2] * viveza;
      peso += viveza;
    }
    // Si menos del 8 % del frasco tiene color, es un frasco plateado, gris o transparente
    if (!visibles || conColor / visibles < 0.08) return null;
    return [r / peso, g / peso, b / peso];
  }

  function coloresDelFrasco(foto) {
    const boton = foto.closest('.frasco');
    const perfume = boton && typeof buscarPerfume === 'function' ? buscarPerfume(boton.dataset.id) : null;
    const clave = (perfume ? perfume.id + '|' + (perfume.color || '') : '') + '|' + foto.currentSrc;
    if (coloresGuardados.has(clave)) return coloresGuardados.get(clave);
    if (!(perfume && perfume.color) && !(foto.complete && foto.naturalWidth)) {
      return { bruma: BRUMA.color, destello: DESTELLOS.color }; // la foto todavía no carga: por ahora perla
    }

    let color = perfume && perfume.color ? desdeHex(perfume.color) : null;
    if (!color) {
      try {
        color = colorDeLaFoto(foto);
      } catch (error) {
        color = null; // no se pudo leer la foto: perla
      }
    }
    const colores = color
      ? { bruma: mezclar(color, 0.55), destello: mezclar(color, 0.25) }
      : { bruma: BRUMA.color, destello: DESTELLOS.color };
    coloresGuardados.set(clave, colores);
    return colores;
  }

  /* ---------- De dónde sale: la boquilla del frasco elegido (arriba, al centro) ---------- */
  function origen() {
    const foto = armario.querySelector('.frasco.activo img');
    if (!foto) return null;
    const caja = armario.getBoundingClientRect();
    const frasco = foto.getBoundingClientRect();
    const ampliacion = caja.width / ancho || 1; // en celular el armario está ampliado (1,16)
    return {
      x: (frasco.left - caja.left + frasco.width / 2) / ampliacion,
      y: (frasco.top - caja.top + frasco.height * 0.12) / ampliacion,
      tamano: frasco.width / ampliacion,
      colores: coloresDelFrasco(foto)
    };
  }

  function nacerBruma(o, ahora) {
    brumas.push({
      x: o.x + (Math.random() - 0.5) * o.tamano * 0.2,
      y: o.y,
      radio: o.tamano * (0.07 + Math.random() * 0.05),
      nace: ahora,
      dura: 2800 + Math.random() * 1800,     // vive entre 2,8 y 4,6 segundos
      sube: 14 + Math.random() * 8,          // píxeles por segundo
      onda: Math.random() * Math.PI * 2,     // cada voluta se mece distinto
      deriva: (Math.random() - 0.5) * 8,     // y se corre un poco de lado
      color: o.colores.bruma                 // guarda su color: al cambiar de frasco, termina con el suyo
    });
  }

  function nacerDestello(o, ahora) {
    destellos.push({
      x: o.x + (Math.random() - 0.5) * o.tamano * 0.25,
      y: o.y,
      radio: 1 + Math.random() * 1.1,        // puntitos de 2 a 4 píxeles
      nace: ahora,
      dura: 1600 + Math.random() * 1400,
      sube: 24 + Math.random() * 18,         // suben más rápido que la bruma
      abre: (Math.random() - 0.5) * 34,      // se abren en abanico, como un rocío
      titila: 6 + Math.random() * 6,         // qué tan rápido titila
      color: o.colores.destello
    });
  }

  /* ---------- Dibujar un cuadro ---------- */
  function cuadro(ahora) {
    if (!debeMoverse()) {
      parar();
      return;
    }
    if (ahora - ultimoDibujo < CADA_CUADRO_MS) {
      requestAnimationFrame(cuadro);
      return;
    }
    ultimoDibujo = ahora;

    const o = origen();
    if (o && brumas.length < BRUMA.maximo && ahora - ultimaBruma > BRUMA.cadaMs) {
      nacerBruma(o, ahora);
      ultimaBruma = ahora;
    }
    if (o && destellos.length < DESTELLOS.maximo && ahora - ultimoDestello > DESTELLOS.cadaMs) {
      nacerDestello(o, ahora);
      ultimoDestello = ahora;
    }

    pincel.clearRect(0, 0, ancho, alto);
    dibujarBrumas(ahora);
    dibujarDestellos(ahora);

    requestAnimationFrame(cuadro);
  }

  function dibujarBrumas(ahora) {
    for (let i = brumas.length - 1; i >= 0; i--) {
      const p = brumas[i];
      const edad = (ahora - p.nace) / p.dura;          // de 0 (nace) a 1 (desaparece)
      if (edad >= 1) {
        brumas.splice(i, 1);
        continue;
      }
      const segundos = (ahora - p.nace) / 1000;
      const x = p.x + Math.sin(p.onda + segundos * 1.3) * 5 + p.deriva * segundos;
      const y = p.y - p.sube * segundos;
      const radio = p.radio * (1 + edad * 1.8);        // se abre mientras sube
      const opacidad = Math.sin(Math.PI * edad) * BRUMA.brillo;

      // Cada voluta se estira a lo ancho al subir (de redonda a alargada), como el perfume al dispersarse
      pincel.save();
      pincel.translate(x, y);
      pincel.scale(1 + edad * 0.9, 1);
      const degradado = pincel.createRadialGradient(0, 0, 0, 0, 0, radio);
      degradado.addColorStop(0, 'rgba(' + p.color + ', ' + opacidad + ')');
      degradado.addColorStop(1, 'rgba(' + p.color + ', 0)');
      pincel.fillStyle = degradado;
      pincel.beginPath();
      pincel.arc(0, 0, radio, 0, Math.PI * 2);
      pincel.fill();
      pincel.restore();
    }
  }

  function dibujarDestellos(ahora) {
    for (let i = destellos.length - 1; i >= 0; i--) {
      const d = destellos[i];
      const edad = (ahora - d.nace) / d.dura;
      if (edad >= 1) {
        destellos.splice(i, 1);
        continue;
      }
      const segundos = (ahora - d.nace) / 1000;
      // Suben y se abren en abanico, cada vez más despacio (como gotas que pierden impulso)
      const x = d.x + d.abre * Math.sqrt(segundos);
      const y = d.y - d.sube * segundos;
      const titileo = 0.55 + 0.45 * Math.sin(segundos * d.titila);
      const opacidad = Math.sin(Math.PI * edad) * DESTELLOS.brillo * titileo;

      pincel.fillStyle = 'rgba(' + d.color + ', ' + opacidad + ')';
      pincel.beginPath();
      pincel.arc(x, y, d.radio, 0, Math.PI * 2);
      pincel.fill();
    }
  }

  /* ---------- Cuándo se mueve y cuándo no ---------- */
  function debeMoverse() {
    return enPantalla &&
      !document.hidden &&
      !pideMenosMovimiento.matches &&
      !document.documentElement.classList.contains('sin-movimiento');
  }

  function arrancar() {
    if (corriendo || !debeMoverse()) return;
    corriendo = true;
    requestAnimationFrame(cuadro);
  }

  function parar() {
    corriendo = false;
    brumas.length = 0;
    destellos.length = 0;
    pincel.clearRect(0, 0, ancho, alto);
  }

  // Solo cuando la vitrina se ve en pantalla
  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    if (enPantalla) arrancar();
  }).observe(armario);

  // Al volver a la pestaña, al reanudar el movimiento o al cambiar la preferencia del teléfono
  document.addEventListener('visibilitychange', arrancar);
  pideMenosMovimiento.addEventListener('change', arrancar);
  new MutationObserver(arrancar).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', medir);
  medir();
})();
