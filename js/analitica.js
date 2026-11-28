'use strict';

/* ===== Google Analytics 4 ===== */
/* Antes iba dentro del HTML. Está en su propio archivo para que la política de seguridad (CSP)
   no tenga que permitir código suelto en la página. gtag.js se carga aparte, con async. */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-97SQJ39PMK');
