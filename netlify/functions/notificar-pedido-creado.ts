import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'
import { enviarEmail, plantillaPedidoCreado } from './_lib/email'

// Se llama desde el checkout justo después de crear el pedido. Manda el
// primer mail de confirmación al cliente. Si falla (o Resend no está
// configurado todavía), no debe romper la compra — por eso el frontend
// llama a esto en paralelo y no espera una respuesta crítica.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  const { pedidoId } = JSON.parse(event.body || '{}')
  if (!pedidoId) return { statusCode: 400, body: 'Falta pedidoId' }

  const db = obtenerDb()
  const snap = await db.collection('pedidos').doc(pedidoId).get()
  if (!snap.exists) return { statusCode: 404, body: 'Pedido no encontrado' }

  const configSnap = await db.collection('configuracion').doc('general').get()
  const nombreTienda = configSnap.exists ? (configSnap.data() as any)?.tienda?.nombre : 'FlowwVR'

  const pedido = { id: pedidoId, ...snap.data() } as any

  await enviarEmail({
    to: pedido.email,
    subject: `Confirmamos tu pedido #${pedidoId} — ${nombreTienda}`,
    html: plantillaPedidoCreado(pedido, nombreTienda)
  })

  return { statusCode: 200, body: 'ok' }
}
