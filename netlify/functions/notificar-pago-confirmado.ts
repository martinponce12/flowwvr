import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'
import { enviarEmail, plantillaPagoConfirmado } from './_lib/email'

// Se llama desde el panel admin cuando el admin marca un pedido como
// "Pagado" manualmente (transferencia), y también desde el webhook de
// Mercado Pago cuando el pago se aprueba automáticamente.

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
    subject: `¡Tu pago fue confirmado! Pedido #${pedidoId} — ${nombreTienda}`,
    html: plantillaPagoConfirmado(pedido, nombreTienda)
  })

  return { statusCode: 200, body: 'ok' }
}
