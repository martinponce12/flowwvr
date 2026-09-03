import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { listarPedidos, actualizarPedido, eliminarPedido } from '@/services/datos/pedidos'
import { actualizarProducto, obtenerProducto } from '@/services/datos/productos'
import { linkWhatsapp } from '@/utils/whatsapp'
import { ETIQUETAS_ESTADO, COLOR_ESTADO } from '@/utils/estadosPedido'
import { formatearPrecio } from '@/utils/formato'
import type { Pedido, EstadoPedido } from '@/types'
import '@/styles/admin-comun.css'

const ESTADOS: EstadoPedido[] = [
  'pendiente_pago', 'esperando_comprobante', 'pagado', 'preparando',
  'enviado', 'entregado', 'cancelado', 'reembolsado'
]

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null)
  const [tracking, setTracking] = useState('')
  const [operador, setOperador] = useState('')

  function cargar() { listarPedidos().then(setPedidos) }
  useEffect(cargar, [])

  async function cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido) {
    const cambios: Partial<Pedido> = { estadoPedido: nuevoEstado, fechaActualizacion: new Date().toISOString() }
    if (nuevoEstado === 'pagado') cambios.estadoPago = 'pagado'

    if ((nuevoEstado === 'cancelado' || nuevoEstado === 'reembolsado') && pedido.estadoPago === 'pagado') {
      for (const item of pedido.productos) {
        const producto = await obtenerProducto(item.productoId)
        if (producto) await actualizarProducto(item.productoId, { stockActual: producto.stockActual + item.cantidad })
      }
    }

    if (nuevoEstado === 'pagado' && pedido.estadoPago !== 'pagado') {
      for (const item of pedido.productos) {
        const producto = await obtenerProducto(item.productoId)
        if (producto) await actualizarProducto(item.productoId, { stockActual: Math.max(0, producto.stockActual - item.cantidad) })
      }
      fetch('/.netlify/functions/notificar-pago-confirmado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: pedido.id })
      }).catch(() => {})
    }

    await actualizarPedido(pedido.id, cambios)
    cargar()
    setSeleccionado(null)
  }

  async function guardarTracking(pedido: Pedido) {
    await actualizarPedido(pedido.id, { trackingManual: tracking, operadorManual: operador, fechaActualizacion: new Date().toISOString() })
    cargar()
    setSeleccionado(null)
  }

  async function borrarPedido(pedido: Pedido) {
    const advertencia = pedido.estadoPago === 'pagado'
      ? 'Este pedido ya está pagado. Al eliminarlo se repone el stock de sus productos automáticamente. ¿Confirmás que querés eliminarlo?'
      : '¿Eliminar este pedido? Esta acción no se puede deshacer.'
    if (!confirm(advertencia)) return

    if (pedido.estadoPago === 'pagado') {
      for (const item of pedido.productos) {
        const producto = await obtenerProducto(item.productoId)
        if (producto) await actualizarProducto(item.productoId, { stockActual: producto.stockActual + item.cantidad })
      }
    }

    await eliminarPedido(pedido.id)
    cargar()
    setSeleccionado(null)
  }

  return (
    <LayoutAdmin>
      <h1 className="admin-titulo">Pedidos</h1>

      <table className="admin-tabla">
        <thead><tr><th>Código</th><th>Cliente</th><th>DNI</th><th>Total</th><th>Pago</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem' }}>{p.id}</td>
              <td>{p.cliente}</td>
              <td>{p.dni}</td>
              <td>{formatearPrecio(p.total)}</td>
              <td>{p.metodoPago}</td>
              <td><span className={`admin-badge-estado ${COLOR_ESTADO[p.estadoPedido]}`}>{ETIQUETAS_ESTADO[p.estadoPedido]}</span></td>
              <td>{new Date(p.fechaCreacion).toLocaleDateString('es-AR')}</td>
              <td>
                <button className="admin-accion-link" onClick={() => { setSeleccionado(p); setTracking(p.trackingManual ?? ''); setOperador(p.operadorManual ?? '') }}>Ver detalle</button>
                {' · '}
                <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrarPedido(p)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {seleccionado && (
        <div className="admin-form" style={{ maxWidth: 560, marginTop: 20 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Pedido de {seleccionado.cliente}</h2>
          <p><strong>Código:</strong> <span style={{ fontFamily: 'var(--font-display)' }}>{seleccionado.id}</span></p>
          <p><strong>DNI:</strong> {seleccionado.dni} · <strong>WhatsApp:</strong> {seleccionado.whatsapp} · <strong>Email:</strong> {seleccionado.email}</p>
          <p><strong>Dirección:</strong> {seleccionado.direccion.calle} {seleccionado.direccion.numero}, {seleccionado.direccion.localidad}, {seleccionado.direccion.provincia} (CP {seleccionado.direccion.codigoPostal})</p>
          {seleccionado.notasPersonalizacion && <p><strong>Notas:</strong> {seleccionado.notasPersonalizacion}</p>}
          <p><strong>Productos:</strong></p>
          <ul>
            {seleccionado.productos.map((i) => <li key={i.productoId}>{i.cantidad}x {i.nombre} — {formatearPrecio(i.precioUnitario * i.cantidad)}</li>)}
          </ul>
          <p><strong>Total:</strong> {formatearPrecio(seleccionado.total)}</p>

          <div>
            <label>Cambiar estado del pedido</label>
            <select value={seleccionado.estadoPedido} onChange={(e) => cambiarEstado(seleccionado, e.target.value as EstadoPedido)}>
              {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETAS_ESTADO[e]}</option>)}
            </select>
          </div>

          <div><label>Operador logístico usado (manual)</label><input value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Ej: OCA sucursal Once" /></div>
          <div><label>Tracking manual</label><input value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>

          <div className="admin-form-acciones">
            <button className="admin-accion-link" onClick={() => guardarTracking(seleccionado)}>Guardar tracking/operador</button>
            <button className="admin-accion-link" onClick={() => window.open(linkWhatsapp(seleccionado.whatsapp), '_blank')}>Contactar por WhatsApp</button>
            <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrarPedido(seleccionado)}>Eliminar pedido</button>
            <button className="admin-accion-link admin-accion-link--peligro" onClick={() => setSeleccionado(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </LayoutAdmin>
  )
}
