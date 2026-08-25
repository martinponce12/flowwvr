import { Link, useParams } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import Boton from '@/components/ui/Boton'

const CONTENIDO: Record<string, { titulo: string; texto: string }> = {
  exito: { titulo: '¡Pago aprobado! 🔥', texto: 'Ya recibimos tu pago. Te vamos a contactar por WhatsApp para coordinar el envío.' },
  error: { titulo: 'El pago no se pudo procesar', texto: 'Podés intentar de nuevo o elegir transferencia como método de pago.' },
  pendiente: { titulo: 'Pago pendiente', texto: 'Tu pago está siendo procesado. Te avisamos apenas se confirme.' }
}

export default function ResultadoPago() {
  const { estado } = useParams()
  const info = CONTENIDO[estado ?? ''] ?? CONTENIDO.pendiente

  return (
    <LayoutTienda>
      <div className="contenedor" style={{ padding: '64px 0', textAlign: 'center' }}>
        <h1 style={{ marginBottom: 14 }}>{info.titulo}</h1>
        <p style={{ marginBottom: 24 }}>{info.texto}</p>
        <Link to="/"><Boton>Volver al inicio</Boton></Link>
      </div>
    </LayoutTienda>
  )
}
