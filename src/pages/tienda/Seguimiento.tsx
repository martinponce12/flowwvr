import { useState } from 'react'
import LayoutTienda from '@/components/layout/LayoutTienda'
import Boton from '@/components/ui/Boton'
import { ETIQUETAS_ESTADO, COLOR_ESTADO } from '@/utils/estadosPedido'
import { formatearPrecio } from '@/utils/formato'
import type { EstadoPedido } from '@/types'
import './seguimiento.css'

interface PedidoResumen {
  id: string
  estadoPedido: EstadoPedido
  trackingManual: string | null
  operadorManual: string | null
  total: number
  fechaCreacion: string
}

export default function Seguimiento() {
  const [dni, setDni] = useState('')
  const [pedidos, setPedidos] = useState<PedidoResumen[] | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function consultar() {
    setError('')
    setPedidos(null)
    setCargando(true)
    try {
      const resp = await fetch('/.netlify/functions/consultar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: dni.trim() })
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error ?? 'No pudimos consultar tus pedidos.')
        return
      }
      setPedidos(data.pedidos)
    } catch {
      setError('No pudimos conectar. Probá de nuevo en unos segundos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <LayoutTienda>
      <div className="contenedor seguimiento">
        <h1 className="seguimiento__titulo">Seguí tu pedido</h1>
        <p className="seguimiento__ayuda">
          Ingresá el mismo DNI que usaste al comprar y te mostramos tus pedidos más recientes.
        </p>

        <div className="seguimiento__form">
          <input
            placeholder="DNI"
            inputMode="numeric"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
          />
          <Boton disabled={!dni || cargando} onClick={consultar}>
            {cargando ? 'Buscando...' : 'Consultar'}
          </Boton>
        </div>

        {error && <p className="seguimiento__error">{error}</p>}

        {pedidos && (
          <div className="seguimiento__lista">
            {pedidos.map((p) => (
              <div key={p.id} className="seguimiento__resultado">
                <div className="seguimiento__resultado-encabezado">
                  <span className={`admin-badge-estado ${COLOR_ESTADO[p.estadoPedido]}`}>
                    {ETIQUETAS_ESTADO[p.estadoPedido]}
                  </span>
                  <span className="seguimiento__codigo">#{p.id}</span>
                </div>
                <p>Total: <strong>{formatearPrecio(p.total)}</strong></p>
                <p>Fecha del pedido: {new Date(p.fechaCreacion).toLocaleDateString('es-AR')}</p>
                {p.operadorManual && <p>Enviado por: {p.operadorManual}</p>}
                {p.trackingManual && <p>Seguimiento: {p.trackingManual}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutTienda>
  )
}
