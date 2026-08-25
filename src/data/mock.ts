import type { Producto, Categoria, ZonaEnvio, Configuracion, Promocion } from '@/types'

// Datos de ejemplo para poder ver la tienda funcionando ANTES de conectar
// Firebase real. Se reemplazan/editan desde el panel admin apenas haya
// credenciales cargadas (services/datos/* cambia a Firestore automáticamente).

export const categoriasMock: Categoria[] = [
  { id: 'cat-holografico', nombre: 'Holográficos', activa: true, orden: 1 },
  { id: 'cat-stickers', nombre: 'Con stickers', activa: true, orden: 2 },
  { id: 'cat-lisos', nombre: 'Lisos / minimal', activa: true, orden: 3 }
]

export const productosMock: Producto[] = [
  {
    id: 'prod-1',
    nombre: 'Encendedor Holográfico Ondas',
    descripcion:
      'Funda holográfica hecha a mano con efecto de ondas iridiscentes. Cambia de color según la luz. Encendedor incluido.',
    precio: 3500,
    stockActual: 12,
    categoriaId: 'cat-holografico',
    colorPlaceholder: 'holografico',
    peso: 25,
    alto: 8,
    ancho: 3,
    largo: 1.5,
    publicado: true,
    destacado: true,
    nuevo: false
  },
  {
    id: 'prod-2',
    nombre: 'Encendedor Smiley Grid',
    descripcion: 'Diseño a cuadros con caritas felices holográficas. El clásico que nunca falla.',
    precio: 3200,
    stockActual: 4,
    categoriaId: 'cat-stickers',
    colorPlaceholder: 'smiley',
    peso: 25,
    alto: 8,
    ancho: 3,
    largo: 1.5,
    publicado: true,
    destacado: true,
    nuevo: true
  },
  {
    id: 'prod-3',
    nombre: 'Encendedor Serpiente Metalizada',
    descripcion: 'Textura de piel de serpiente en tonos metalizados verdes. Edición limitada.',
    precio: 3800,
    stockActual: 0,
    categoriaId: 'cat-holografico',
    colorPlaceholder: 'serpiente',
    peso: 25,
    alto: 8,
    ancho: 3,
    largo: 1.5,
    publicado: true,
    destacado: false,
    nuevo: false
  },
  {
    id: 'prod-4',
    nombre: 'Encendedor Negro Minimal',
    descripcion: 'Para los que prefieren lo simple: negro mate con detalle metálico. Base para personalizar.',
    precio: 2800,
    stockActual: 20,
    categoriaId: 'cat-lisos',
    colorPlaceholder: 'negro',
    peso: 25,
    alto: 8,
    ancho: 3,
    largo: 1.5,
    publicado: true,
    destacado: false,
    nuevo: true
  }
]

export const zonasEnvioMock: ZonaEnvio[] = [
  {
    id: 'zona-caba',
    nombre: 'CABA',
    provincias: ['Ciudad Autónoma de Buenos Aires'],
    tarifa: 3500,
    plazoEstimado: '2 a 3 días hábiles',
    activa: true
  },
  {
    id: 'zona-gba',
    nombre: 'GBA',
    provincias: ['Buenos Aires'],
    tarifa: 4200,
    plazoEstimado: '3 a 4 días hábiles',
    activa: true
  },
  {
    id: 'zona-interior',
    nombre: 'Interior del país',
    provincias: [
      'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos',
      'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
      'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
      'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
    ],
    tarifa: 5900,
    plazoEstimado: '5 a 8 días hábiles',
    activa: true
  }
]

export const promocionesMock: Promocion[] = [
  {
    id: 'promo-flowwvr10',
    codigo: 'FLOWWVR10',
    tipo: 'porcentaje',
    valor: 10,
    usosActuales: 0,
    activa: true
  }
]

export const configuracionMock: Configuracion = {
  tienda: {
    nombre: 'FlowwVR',
    whatsapp: '5491100000000',
    email: 'hola@flowwvr.com',
    instagram: 'flowwvr',
    tagline: 'No vendemos encendedores. Vendemos ese detallito que te hace diferente.'
  },
  transferencia: {
    alias: 'FLOWWVR.MP',
    titular: 'Completar en el panel admin',
    bancoOBilletera: 'Mercado Pago'
  },
  legales: {
    diasArrepentimiento: 10,
    textoTerminos: 'Completar Términos y Condiciones desde el panel de administración.',
    textoPrivacidad: 'Completar Política de Privacidad desde el panel de administración.',
    textoCambiosDevoluciones:
      'Tenés 10 días desde que recibís tu pedido para arrepentirte de la compra. Escribinos por WhatsApp y coordinamos la devolución.'
  },
  stock: {
    umbralStockBajo: 5
  }
}
