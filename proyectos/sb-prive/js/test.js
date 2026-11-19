'use strict';

/* =========================================================
   TEST "¿CUÁL ES TU PERFUME?" (sección "¿No sabes cuál elegir?" del inicio)
   Tres preguntas, una a la vez. Al final le da puntos a cada perfume de js/perfumes.js,
   muestra los tres que más se parecen y arma el mensaje de WhatsApp con las respuestas.
   Usa lo compartido de js/comun.js: tarjetaPerfume y enlaceWhatsApp.
   ========================================================= */

(function () {
  const formulario = document.getElementById('test');
  if (!formulario || typeof PERFUMES === 'undefined') return;

  const preguntas = Array.from(formulario.querySelectorAll('.test__pregunta'));
  const textoPaso = formulario.querySelector('.test__paso');
  const botonAtras = formulario.querySelector('.test__atras');
  const resultado = formulario.querySelector('.test__resultado');
  const tituloResultado = formulario.querySelector('.test__titulo');
  const listaResultado = formulario.querySelector('.test__lista');
  const botonWhatsApp = formulario.querySelector('.test__whatsapp');

  // Con JavaScript el test se muestra (sin él, la sección queda solo con el botón de WhatsApp)
  formulario.hidden = false;

  /* ---------- Cómo se traduce cada respuesta ---------- */
  // Intensidad: la respuesta y el dato de cada perfume, en la misma escala de 0 a 3
  const NIVEL_RESPUESTA = { suave: 0, media: 1, fuerte: 2.5 };
  const NIVEL_PERFUME = { 'Cerca de la piel': 0, 'Media': 1, 'Fuerte': 2, 'Muy fuerte': 3 };

  // Momento: palabras del dato "momentos" de perfumes.js que cuentan para cada respuesta
  const PALABRAS_MOMENTO = {
    dia: ['dia', 'oficina', 'clima calido', 'diario'],
    noche: ['noche', 'clima frio', 'cita'],
    ocasion: ['ocasion especial', 'evento', 'cita', 'noche']
  };

  // Cómo se dice cada respuesta en el mensaje de WhatsApp
  const FRASE = {
    dia: 'de día', noche: 'de noche', ocasion: 'para una ocasión especial',
    suave: 'cerca de la piel', media: 'que se note', fuerte: 'que deje huella'
  };

  function sinTildes(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /* ---------- Puntos de cada perfume ---------- */
  //   Aroma igual: 10 puntos (es lo que más pesa).
  //   Intensidad: hasta 4 puntos, menos cuanto más lejos esté de lo que pidió.
  //   Momento: 3 puntos, solo si el perfume ya tiene el dato "momentos" (falta del cliente).
  //   Si empatan, gana el que está entre los más pedidos.
  function puntos(perfume, respuestas) {
    let total = 0;
    if (perfume.aroma === respuestas.aroma) total += 10;

    if (perfume.intensidad in NIVEL_PERFUME) {
      const distancia = Math.abs(NIVEL_PERFUME[perfume.intensidad] - NIVEL_RESPUESTA[respuestas.intensidad]);
      total += Math.max(0, 4 - distancia * 2);
    }

    if (Array.isArray(perfume.momentos)) {
      const momentos = perfume.momentos.map(sinTildes);
      const coincide = PALABRAS_MOMENTO[respuestas.momento].some(function (palabra) {
        return momentos.includes(palabra);
      });
      if (coincide) total += 3;
    }

    if (perfume.masPedido) total += 0.5;
    return total;
  }

  function recomendar(respuestas) {
    return PERFUMES
      .map(function (p, orden) { return { p: p, puntos: puntos(p, respuestas), orden: orden }; })
      .sort(function (a, b) { return b.puntos - a.puntos || a.orden - b.orden; })
      .slice(0, 3)
      .map(function (r) { return r.p; });
  }

  /* ---------- Ir de una pregunta a otra ---------- */
  let actual = 0;

  function mostrarPaso(numero, moverFoco) {
    actual = numero;
    const enResultado = numero >= preguntas.length;
    preguntas.forEach(function (pregunta, i) { pregunta.hidden = i !== numero; });
    resultado.hidden = !enResultado;
    textoPaso.hidden = enResultado;
    botonAtras.hidden = numero === 0;
    if (!enResultado) textoPaso.textContent = 'Pregunta ' + (numero + 1) + ' de ' + preguntas.length;

    if (enResultado) {
      mostrarResultado();
      tituloResultado.focus();
    } else if (moverFoco) {
      // Con teclado, el foco pasa a la opción marcada (o a la primera) de la nueva pregunta
      const opcion = preguntas[numero].querySelector('input:checked') || preguntas[numero].querySelector('input');
      opcion.focus();
    }
  }

  function respondida(numero) {
    return !!preguntas[numero].querySelector('input:checked');
  }

  // Con el dedo o el mouse: al tocar una opción pasa sola a la siguiente (con una pausa corta para ver la marca).
  // Con el teclado no: las flechas ya marcan opciones al moverse, así que se avanza con Enter
  let conPuntero = false;
  formulario.addEventListener('pointerdown', function () { conPuntero = true; });
  formulario.addEventListener('keydown', function () { conPuntero = false; });

  formulario.addEventListener('change', function (evento) {
    if (!conPuntero || evento.target.type !== 'radio') return;
    const numero = preguntas.indexOf(evento.target.closest('.test__pregunta'));
    setTimeout(function () { mostrarPaso(numero + 1, false); }, 250);
  });

  // Enter dentro del formulario lo "envía": aquí significa "siguiente"
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (actual < preguntas.length && respondida(actual)) mostrarPaso(actual + 1, true);
  });

  botonAtras.addEventListener('click', function () {
    mostrarPaso(Math.min(actual, preguntas.length) - 1, true);
  });

  // "Volver a empezar" (type="reset") borra las respuestas; aquí se vuelve a la primera pregunta
  formulario.addEventListener('reset', function () {
    setTimeout(function () { mostrarPaso(0, true); }, 0);
  });

  /* ---------- El resultado ---------- */
  function mostrarResultado() {
    const datos = new FormData(formulario);
    const respuestas = { aroma: datos.get('aroma'), momento: datos.get('momento'), intensidad: datos.get('intensidad') };
    const elegidos = recomendar(respuestas);

    listaResultado.replaceChildren.apply(listaResultado, elegidos.map(function (p) {
      return tarjetaPerfume(p, 'h4'); // h4: dentro del h3 "Te recomendamos"
    }));

    const nombres = elegidos.map(function (p) { return p.nombre + ' de ' + p.marca; });
    const lista = nombres.length > 1
      ? nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1]
      : nombres[0];
    botonWhatsApp.href = enlaceWhatsApp(
      'Hola, hice el test de la página. Quiero oler ' + respuestas.aroma.toLowerCase() + ', ' +
      FRASE[respuestas.momento] + ', ' + FRASE[respuestas.intensidad] + '. ' +
      'Me recomendaron ' + lista + '. ¿Me ayudan a elegir?'
    );
  }
})();
