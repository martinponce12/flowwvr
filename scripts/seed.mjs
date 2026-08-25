// Script para cargar datos iniciales en Firestore real (categorías, zonas de
// envío, configuración y productos de ejemplo), para no tener que cargar
// todo a mano desde el panel la primera vez.
//
// Cómo usarlo:
// 1. En Firebase Console → Configuración del proyecto → Cuentas de servicio
//    → "Generar nueva clave privada" → descargar el JSON.
// 2. Guardarlo como scripts/serviceAccountKey.json (está en .gitignore, no se sube a git).
// 3. Correr: node scripts/seed.mjs
//
// Es opcional: también podés cargar todo a mano desde /admin una vez que
// tengas el primer administrador dado de alta.

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

const serviceAccount = JSON.parse(readFileSync('./scripts/serviceAccountKey.json', 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const categorias = [
  { id: 'cat-holografico', nombre: 'Holográficos', activa: true, orden: 1 },
  { id: 'cat-stickers', nombre: 'Con stickers', activa: true, orden: 2 },
  { id: 'cat-lisos', nombre: 'Lisos / minimal', activa: true, orden: 3 }
]

const zonasEnvio = [
  { id: 'zona-caba', nombre: 'CABA', provincias: ['Ciudad Autónoma de Buenos Aires'], tarifa: 3500, plazoEstimado: '2 a 3 días hábiles', activa: true },
  { id: 'zona-gba', nombre: 'GBA', provincias: ['Buenos Aires'], tarifa: 4200, plazoEstimado: '3 a 4 días hábiles', activa: true },
  {
    id: 'zona-interior', nombre: 'Interior del país', tarifa: 5900, plazoEstimado: '5 a 8 días hábiles', activa: true,
    provincias: ['Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']
  }
]

const productos = [
  { id: 'prod-1', nombre: 'Encendedor Holográfico Ondas', descripcion: 'Funda holográfica hecha a mano con efecto de ondas iridiscentes.', precio: 3500, stockActual: 12, categoriaId: 'cat-holografico', colorPlaceholder: 'holografico', peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: true, nuevo: false },
  { id: 'prod-2', nombre: 'Encendedor Smiley Grid', descripcion: 'Diseño a cuadros con caritas felices holográficas.', precio: 3200, stockActual: 4, categoriaId: 'cat-stickers', colorPlaceholder: 'smiley', peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: true, nuevo: true },
  { id: 'prod-3', nombre: 'Encendedor Serpiente Metalizada', descripcion: 'Textura de piel de serpiente en tonos metalizados. Edición limitada.', precio: 3800, stockActual: 0, categoriaId: 'cat-holografico', colorPlaceholder: 'serpiente', peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: false, nuevo: false },
  { id: 'prod-4', nombre: 'Encendedor Negro Minimal', descripcion: 'Negro mate con detalle metálico. Base para personalizar.', precio: 2800, stockActual: 20, categoriaId: 'cat-lisos', colorPlaceholder: 'negro', peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: false, nuevo: true }
]

const configuracion = {
  tienda: { nombre: 'FlowwVR', whatsapp: '5491100000000', email: 'hola@flowwvr.com', instagram: 'flowwvr', tagline: 'No vendemos encendedores. Vendemos ese detallito que te hace diferente.' },
  transferencia: { alias: 'FLOWWVR.MP', titular: 'Completar en el panel admin', bancoOBilletera: 'Mercado Pago' },
  legales: {
    diasArrepentimiento: 10,
    textoTerminos: 'Completar Términos y Condiciones desde el panel de administración.',
    textoPrivacidad: 'Completar Política de Privacidad desde el panel de administración.',
    textoCambiosDevoluciones: 'Escribinos por WhatsApp y coordinamos la devolución.'
  },
  stock: { umbralStockBajo: 5 }
}

async function seed() {
  const batch = db.batch()
  categorias.forEach((c) => batch.set(db.collection('categorias').doc(c.id), c))
  zonasEnvio.forEach((z) => batch.set(db.collection('zonasEnvio').doc(z.id), z))
  productos.forEach((p) => batch.set(db.collection('productos').doc(p.id), p))
  batch.set(db.collection('configuracion').doc('general'), configuracion)
  await batch.commit()
  console.log('Listo: categorías, zonas de envío, productos de ejemplo y configuración cargados en Firestore.')
}

seed().catch((err) => {
  console.error('Error al cargar datos iniciales:', err)
  process.exit(1)
})
