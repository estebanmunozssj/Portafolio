const c = document.getElementById("carrusel");
let i = 0;
setInterval(() => {
  i = (i + 1) % c.children.length;
  c.scrollTo({ left: c.clientWidth * i });
}, 4000);

const btn = document.getElementById("menu-btn");
const nav = document.getElementById("nav");

btn.addEventListener("click", () => {
  const abierto = nav.classList.toggle("abierto");
  btn.setAttribute("aria-expanded", abierto);
  btn.textContent = abierto ? "✕" : "≡";
  btn.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
});

// Cierra el menú al tocar un enlace
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("abierto");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "≡";
  });
});

const form = document.getElementById("formulario");
const estado = document.getElementById("mensaje-estado");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    estado.textContent = "Enviando...";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (res.ok) {
        estado.textContent = "¡Gracias! Te responderemos pronto.";
        form.reset();
      } else {
        estado.textContent = "No se pudo enviar. Inténtalo de nuevo.";
      }
    } catch {
      estado.textContent = "Error de conexión. Inténtalo de nuevo.";
    }
  });
}
