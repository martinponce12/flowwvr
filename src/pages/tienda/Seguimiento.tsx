import { useState } from 'react'
import LayoutTienda from '@/components/layout/LayoutTienda'
import Boton from '@/components/ui/Boton'
import { ETIQUETAS_ESTADO, COLOR_ESTADO } from '@/utils/estadosPedido'
import { formatearPrecio } from '@/utils/formato'
import type { EstadoPedido } from '@/types'
import './seguimiento.css'

interface ResultadoConsulta {
  estadoPedido: EstadoPedido
  trackingManual: string | null
  operadorManual: string | null
  total: number
  fechaCreacion: string
}

export default function Seguimiento() {
  const [pedidoId, setPedidoId] = useState('')
  const [dni, setDni] = useState('')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function consultar() {
    setError('')
    setResultado(null)
    setCargando(true)
    try {
      const resp = await fetch('/.netlify/functions/consultar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId: pedidoId.trim(), dni: dni.trim() })
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error ?? 'No pudimos consultar el pedido.')
        return
      }
      setResultado(data)
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
          Ingresá el código de pedido que te mostramos al confirmar la compra, junto con tu DNI.
        </p>

        <div className="seguimiento__form">
          <input placeholder="Código de pedido" value={pedidoId} onChange={(e) => setPedidoId(e.target.value)} />
          <input placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
          <Boton disabled={!pedidoId || !dni || cargando} onClick={consultar}>
            {cargando ? 'Buscando...' : 'Consultar'}
          </Boton>
        </div>

        {error && <p className="seguimiento__error">{error}</p>}

        {resultado && (
          <div className="seguimiento__resultado">
            <span className={`admin-badge-estado ${COLOR_ESTADO[resultado.estadoPedido]}`}>
              {ETIQUETAS_ESTADO[resultado.estadoPedido]}
            </span>
            <p>Total: <strong>{formatearPrecio(resultado.total)}</strong></p>
            <p>Fecha del pedido: {new Date(resultado.fechaCreacion).toLocaleDateString('es-AR')}</p>
            {resultado.operadorManual && <p>Enviado por: {resultado.operadorManual}</p>}
            {resultado.trackingManual && <p>Seguimiento: {resultado.trackingManual}</p>}
          </div>
        )}
      </div>
    </LayoutTienda>
  )
}
