// Datos de los cuerpos del sistema solar.
// distanciaSolKm: distancia media al Sol (0 para el Sol).
// diametroKm: diámetro ecuatorial. diametroVsTierra: ratio (Tierra = 1).
// textura: nombre del archivo en public/textures/.
export const BODIES = [
  {
    id: 'sol', nombre: 'Sol', numeral: 'ESTRELLA',
    diametroKm: 1392700, diametroVsTierra: 109.2,
    distanciaSolKm: 0, lunas: 0,
    datoCurioso: 'Contiene el 99,86 % de toda la masa del sistema solar.',
    colorAcento: '#f4c06f', textura: 'sol.jpg',
  },
  {
    id: 'mercurio', nombre: 'Mercurio', numeral: 'PLANETA I',
    diametroKm: 4879, diametroVsTierra: 0.38,
    distanciaSolKm: 57900000, lunas: 0,
    datoCurioso: 'Un día en Mercurio dura 59 días terrestres.',
    colorAcento: '#c4a882', textura: 'mercurio.jpg',
  },
  {
    id: 'venus', nombre: 'Venus', numeral: 'PLANETA II',
    diametroKm: 12104, diametroVsTierra: 0.95,
    distanciaSolKm: 108200000, lunas: 0,
    datoCurioso: 'Es el planeta más caliente: 465 °C en superficie.',
    colorAcento: '#e8c87a', textura: 'venus.jpg',
  },
  {
    id: 'tierra', nombre: 'Tierra', numeral: 'PLANETA III',
    diametroKm: 12742, diametroVsTierra: 1,
    distanciaSolKm: 149600000, lunas: 1,
    datoCurioso: 'El único lugar conocido del universo con vida.',
    colorAcento: '#6b8cba', textura: 'tierra.jpg', atmosfera: '#5a9bd4',
  },
  {
    id: 'marte', nombre: 'Marte', numeral: 'PLANETA IV',
    diametroKm: 6779, diametroVsTierra: 0.53,
    distanciaSolKm: 227900000, lunas: 2,
    datoCurioso: 'Alberga el volcán más alto del sistema solar: Monte Olimpo, 22 km.',
    colorAcento: '#d46b4a', textura: 'marte.jpg',
  },
  {
    id: 'jupiter', nombre: 'Júpiter', numeral: 'PLANETA V',
    diametroKm: 139820, diametroVsTierra: 10.97,
    distanciaSolKm: 778600000, lunas: 95,
    datoCurioso: 'La Gran Mancha Roja es una tormenta más grande que la Tierra.',
    colorAcento: '#d8a878', textura: 'jupiter.jpg',
  },
  {
    id: 'saturno', nombre: 'Saturno', numeral: 'PLANETA VI',
    diametroKm: 116460, diametroVsTierra: 9.14,
    distanciaSolKm: 1433500000, lunas: 146,
    datoCurioso: 'Sus anillos tienen ~20 m de grosor pero se extienden 282.000 km.',
    colorAcento: '#c8a45a', textura: 'saturno.jpg', tieneAnillos: true,
  },
  {
    id: 'urano', nombre: 'Urano', numeral: 'PLANETA VII',
    diametroKm: 50724, diametroVsTierra: 3.98,
    distanciaSolKm: 2872500000, lunas: 28,
    datoCurioso: 'Rota de lado: su eje está inclinado casi 98°.',
    colorAcento: '#a8d8e0', textura: 'urano.jpg',
  },
  {
    id: 'neptuno', nombre: 'Neptuno', numeral: 'PLANETA VIII',
    diametroKm: 49244, diametroVsTierra: 3.86,
    distanciaSolKm: 4495100000, lunas: 16,
    datoCurioso: 'Tiene los vientos más rápidos: hasta 2.100 km/h.',
    colorAcento: '#4a6ed0', textura: 'neptuno.jpg',
  },
]
