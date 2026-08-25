import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { listarTodosLosProductos } from '@/services/datos/productos'
import { listarPedidos } from '@/services/datos/pedidos'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { formatearPrecio } from '@/utils/formato'
import type { Producto, Pedido, Configuracion } from '@/types'
import '@/styles/admin-comun.css'

export default function AdminDashboard() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [config, setConfig] = useState<Configuracion | null>(null)

  useEffect(() => {
    listarTodosLosProductos().then(setProductos)
    listarPedidos().then(setPedidos)
    obtenerConfiguracion().then(setConfig)
  }, [])

  const hoy = new Date().toDateString()
  const ventasHoy = pedidos.filter((p) => p.estadoPago === 'pagado' && new Date(p.fechaCreacion).toDateString() === hoy)
  const totalVentasHoy = ventasHoy.reduce((acc, p) => acc + p.total, 0)
  const pedidosPendientes = pedidos.filter((p) => p.estadoPedido === 'pendiente_pago' || p.estadoPedido === 'esperando_comprobante')
  const umbral = config?.stock.umbralStockBajo ?? 5
  const stockBajo = productos.filter((p) => p.stockActual > 0 && p.stockActual <= umbral)
  const sinStock = productos.filter((p) => p.stockActual <= 0)

  return (
    <LayoutAdmin>
      <h1 className="admin-titulo">Dashboard</h1>

      <div className="admin-stats">
        <div className="admin-stat"><strong>{formatearPrecio(totalVentasHoy)}</strong><span>Ventas de hoy</span></div>
        <div className="admin-stat"><strong>{pedidos.length}</strong><span>Pedidos totales</span></div>
        <div className="admin-stat"><strong>{pedidosPendientes.length}</strong><span>Pedidos pendientes</span></div>
        <div className="admin-stat"><strong>{productos.length}</strong><span>Productos publicados</span></div>
      </div>

      {(stockBajo.length > 0 || sinStock.length > 0) && (
        <div className="admin-stats">
          {stockBajo.length > 0 && (
            <div className="admin-stat"><strong>⚠️ {stockBajo.length}</strong><span>Productos con poco stock</span></div>
          )}
          {sinStock.length > 0 && (
            <div className="admin-stat"><strong>🔴 {sinStock.length}</strong><span>Productos agotados</span></div>
          )}
        </div>
      )}
    </LayoutAdmin>
  )
}
