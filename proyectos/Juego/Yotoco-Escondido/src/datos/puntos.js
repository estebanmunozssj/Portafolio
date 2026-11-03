// Los puntos de la ruta.
// Por ahora son de PRUEBA: se cambian por los lugares reales al final.
// La clave secreta de cada QR NO va aquí: vivirá en el servidor.
export const puntos = [
  {
    // EJEMPLO para la prueba en casa
    id: 'punto-1',
    nombre: 'La guarida peluda',
    pistas: [
      'Tengo cuatro patas pero no soy mesa, y muevo la cola cuando llegas a casa. ¿Quién soy?',
      {
        texto: 'Búscame donde duermo la siesta.',
        imagen: 'img/pistas/cama-cachorro.jpg',
        descripcion: 'Un cojín negro con dibujos de controles de videojuego, en el piso junto a una pared de mármol negro',
        ancho: 675,
        alto: 900,
      },
      'Estoy en mi cojín de controles de videojuego, junto a la pared de mármol negro.',
    ],
    postal: {
      imagen: 'img/postales/cachorro.jpg',
      descripcion: 'Un cachorro café claro sentado sobre una cama',
      frase: '¡Lo encontraste! El guardián de la casa te da su sello.',
    },
  },
  {
    id: 'punto-2',
    nombre: 'Lugar por definir 2',
    pistas: [
      'Adivinanza de prueba del punto 2.',
      'Segunda ayuda de prueba del punto 2.',
      'Pista directa de prueba del punto 2.',
    ],
  },
  {
    id: 'punto-3',
    nombre: 'Lugar por definir 3',
    pistas: [
      'Adivinanza de prueba del punto 3.',
      'Segunda ayuda de prueba del punto 3.',
      'Pista directa de prueba del punto 3.',
    ],
  },
]
