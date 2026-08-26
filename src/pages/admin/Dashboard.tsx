import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import { listarTodosLosProductos } from '@/services/datos/productos'
import { listarPedidos } from '@/services/datos/pedidos'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { formatearPrecio } from '@/utils/formato'
import type { Producto, Pedido, Configuracion } from '@/types'
import '@/styles/admin-comun.css'

const COLOR_GRAFICO = '#d81b1b'

export default function AdminDashboard() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [config, setConfig] = useState<Configuracion | null>(null)

  useEffect(() => {
    listarTodosLosProductos().then(setProductos)
    listarPedidos().then(setPedidos)
    obtenerConfiguracion().then(setConfig)
  }, [])

  const pedidosPagados = pedidos.filter((p) => p.estadoPago === 'pagado')

  const hoy = new Date().toDateString()
  const ventasHoy = pedidosPagados.filter((p) => new Date(p.fechaCreacion).toDateString() === hoy)
  const totalVentasHoy = ventasHoy.reduce((acc, p) => acc + p.total, 0)
  const pedidosPendientes = pedidos.filter((p) => p.estadoPedido === 'pendiente_pago' || p.estadoPedido === 'esperando_comprobante')
  const umbral = config?.stock.umbralStockBajo ?? 5
  const stockBajo = productos.filter((p) => p.stockActual > 0 && p.stockActual <= umbral)
  const sinStock = productos.filter((p) => p.stockActual <= 0)

  // Ventas de los últimos 14 días, agrupadas por fecha.
  const ventasPorDia = useMemo(() => {
    const dias: { fecha: string; etiqueta: string; total: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const fecha = d.toDateString()
      const etiqueta = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
      const total = pedidosPagados
        .filter((p) => new Date(p.fechaCreacion).toDateString() === fecha)
        .reduce((acc, p) => acc + p.total, 0)
      dias.push({ fecha, etiqueta, total })
    }
    return dias
  }, [pedidosPagados])

  // Productos más vendidos (por unidades, en pedidos pagados).
  const productosMasVendidos = useMemo(() => {
    const conteo: Record<string, { nombre: string; unidades: number }> = {}
    for (const p of pedidosPagados) {
      for (const item of p.productos) {
        if (!conteo[item.productoId]) conteo[item.productoId] = { nombre: item.nombre, unidades: 0 }
        conteo[item.productoId].unidades += item.cantidad
      }
    }
    return Object.values(conteo).sort((a, b) => b.unidades - a.unidades).slice(0, 5)
  }, [pedidosPagados])

  // Distribución por método de pago.
  const metodosPago = useMemo(() => {
    const transferencia = pedidosPagados.filter((p) => p.metodoPago === 'transferencia').length
    const mercadopago = pedidosPagados.filter((p) => p.metodoPago === 'mercadopago').length
    return [
      { metodo: 'Transferencia', cantidad: transferencia },
      { metodo: 'Mercado Pago', cantidad: mercadopago }
    ]
  }, [pedidosPagados])

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

      {pedidosPagados.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)', marginTop: 20 }}>
          Todavía no hay pedidos pagados — los gráficos van a aparecer apenas se confirme la primera venta.
        </p>
      ) : (
        <>
          <div className="admin-grafico">
            <h2 className="admin-grafico__titulo">Ventas de los últimos 14 días</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis dataKey="etiqueta" stroke="#a3a3a8" fontSize={12} />
                <YAxis stroke="#a3a3a8" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#151517', border: '1px solid #2a2a2e', borderRadius: 8 }}
                  formatter={(value: number) => [formatearPrecio(value), 'Ventas']}
                />
                <Line type="monotone" dataKey="total" stroke={COLOR_GRAFICO} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-grafico">
            <h2 className="admin-grafico__titulo">Productos más vendidos</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productosMasVendidos} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis type="number" stroke="#a3a3a8" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" stroke="#a3a3a8" fontSize={12} width={140} />
                <Tooltip
                  contentStyle={{ background: '#151517', border: '1px solid #2a2a2e', borderRadius: 8 }}
                  formatter={(value: number) => [value, 'Unidades vendidas']}
                />
                <Bar dataKey="unidades" fill={COLOR_GRAFICO} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-grafico">
            <h2 className="admin-grafico__titulo">Métodos de pago</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={metodosPago}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" />
                <XAxis dataKey="metodo" stroke="#a3a3a8" fontSize={12} />
                <YAxis stroke="#a3a3a8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#151517', border: '1px solid #2a2a2e', borderRadius: 8 }} />
                <Bar dataKey="cantidad" fill={COLOR_GRAFICO} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}
