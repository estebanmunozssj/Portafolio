// Carrusel del hero: cambia de foto cada 4,5 s, se pausa con el botón, con la pestaña oculta
// o si la persona pidió menos movimiento en su sistema. Los puntos llevan a cada foto.
(() => {
  const hero = document.querySelector("[data-carrusel]");
  if (!hero) return;
  const fotos = [...hero.querySelectorAll(".carrusel__img")];
  const puntos = [...hero.querySelectorAll(".carrusel__dot")];
  const pausa = hero.querySelector(".carrusel__pausa");
  if (fotos.length < 2) return;
  let actual = 0, reloj = null;
  let pausado = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mostrar = (i) => {
    actual = (i + fotos.length) % fotos.length;
    fotos.forEach((f, n) => { f.classList.toggle("is-on", n === actual); n === actual ? f.removeAttribute("aria-hidden") : f.setAttribute("aria-hidden", "true"); });
    puntos.forEach((p, n) => n === actual ? p.setAttribute("aria-current", "true") : p.removeAttribute("aria-current"));
  };
  const parar = () => { clearInterval(reloj); reloj = null; };
  const arrancar = () => { parar(); if (!pausado && !document.hidden) reloj = setInterval(() => mostrar(actual + 1), 4500); };
  const marcarPausa = () => {
    pausa.setAttribute("aria-pressed", String(pausado));
    pausa.setAttribute("aria-label", pausado ? "Reanudar el carrusel" : "Pausar el carrusel");
  };

  pausa.addEventListener("click", () => { pausado = !pausado; marcarPausa(); arrancar(); });
  puntos.forEach((p, n) => p.addEventListener("click", () => { mostrar(n); arrancar(); }));
  document.addEventListener("visibilitychange", arrancar);
  marcarPausa();
  arrancar();
})();
