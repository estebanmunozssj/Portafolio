// Configuración de Vite para la demo del portafolio.
import { defineConfig } from 'vite'

// Chrome no deja cargar "módulos" ni archivos con "crossorigin" cuando la página
// se abre con doble clic (file://). Esto los quita para que la demo abra igual.
const abrirConDobleClic = {
  name: 'abrir-con-doble-clic',
  enforce: 'post',
  transformIndexHtml(html) {
    return html
      .replace(/ type="module"/g, '')
      .replace(/ crossorigin/g, '')
      .replace(/<script src=/g, '<script defer src=')
  },
}

export default defineConfig({
  // Rutas relativas: así la demo funciona dentro de una subcarpeta en GitHub Pages
  base: './',
  plugins: [abrirConDobleClic],
  build: {
    // Se guarda en "demo/" porque "dist/" está en el .gitignore y no se subiría
    outDir: 'demo',
    // Un solo archivo de JS normal (no módulo)
    rollupOptions: { output: { format: 'iife' } },
  },
})
