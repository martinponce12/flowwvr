export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precioPromocional?: number
  stockActual: number
  categoriaId: string
  imagenUrl?: string
  colorPlaceholder?: string // usado mientras no hay foto real
  peso: number
  alto: number
  ancho: number
  largo: number
  publicado: boolean
  destacado: boolean
  nuevo: boolean
}

export interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  imagenUrl?: string
  activa: boolean
  orden: number
}

export interface ZonaEnvio {
  id: string
  nombre: string
  provincias: string[]
  tarifa: number
  plazoEstimado: string
  activa: boolean
}

export type TipoPromocion = 'porcentaje' | 'monto_fijo' | 'envio_gratis'

export interface Promocion {
  id: string
  codigo: string
  tipo: TipoPromocion
  valor: number
  productos?: string[]
  categorias?: string[]
  fechaInicio?: string
  fechaFin?: string
  limiteUsos?: number
  usosActuales: number
  activa: boolean
}

export interface ItemCarrito {
  productoId: string
  nombre: string
  precioUnitario: number
  cantidad: number
  imagenUrl?: string
  colorPlaceholder?: string
}

export interface DireccionEnvio {
  provincia: string
  localidad: string
  codigoPostal: string
  calle: string
  numero: string
  piso?: string
  referencia?: string
}

export type MetodoPago = 'mercadopago' | 'transferencia'
export type EstadoPago = 'pendiente' | 'esperando_comprobante' | 'pagado' | 'rechazado'
export type EstadoPedido =
  | 'pendiente_pago'
  | 'esperando_comprobante'
  | 'pagado'
  | 'preparando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'reembolsado'

export interface Pedido {
  id: string
  cliente: string
  dni: string
  whatsapp: string
  email: string
  notasPersonalizacion?: string
  direccion: DireccionEnvio
  productos: ItemCarrito[]
  subtotal: number
  promocionId?: string
  descuento: number
  zonaEnvioId?: string
  costoEnvio: number
  total: number
  trackingManual?: string
  operadorManual?: string
  metodoPago: MetodoPago
  estadoPago: EstadoPago
  estadoPedido: EstadoPedido
  fechaCreacion: string
  fechaActualizacion: string
}

export interface ConfiguracionNegocio {
  nombre: string
  whatsapp: string
  email: string
  instagram: string
  tagline?: string
}

export interface ConfiguracionTransferencia {
  alias: string
  titular: string
  bancoOBilletera: string
}

export interface ConfiguracionLegales {
  diasArrepentimiento: number
  textoTerminos: string
  textoPrivacidad: string
  textoCambiosDevoluciones: string
}

export interface ConfiguracionStock {
  umbralStockBajo: number
}

export interface Configuracion {
  tienda: ConfiguracionNegocio
  transferencia: ConfiguracionTransferencia
  legales: ConfiguracionLegales
  stock: ConfiguracionStock
}

export interface Administrador {
  uid: string
  nombre: string
  email: string
  activo: boolean
}
