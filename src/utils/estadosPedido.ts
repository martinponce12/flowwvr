import type { EstadoPedido } from '@/types'

// Etiquetas y colores centralizados para el estado de un pedido, usados
// tanto en el panel admin como en la página pública de seguimiento.
export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  pendiente_pago: 'Pendiente de pago',
  esperando_comprobante: 'Esperando comprobante',
  pagado: 'Pagado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado'
}

// Clase de color por estado (definidas en global.css)
export const COLOR_ESTADO: Record<EstadoPedido, string> = {
  pendiente_pago: 'estado--pendiente',
  esperando_comprobante: 'estado--pendiente',
  pagado: 'estado--ok',
  preparando: 'estado--info',
  enviado: 'estado--info',
  entregado: 'estado--ok',
  cancelado: 'estado--error',
  reembolsado: 'estado--error'
}
