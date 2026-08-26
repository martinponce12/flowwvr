import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'

// Permite que un cliente consulte el estado de SU pedido sin exponer la
// colección completa de pedidos (que solo puede leer el admin). Se valida
// que el DNI ingresado coincida con el del pedido antes de devolver datos,
// para que nadie pueda ver un pedido ajeno solo por adivinar el ID.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  const { pedidoId, dni } = JSON.parse(event.body || '{}')
  if (!pedidoId || !dni) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Faltan datos' }) }
  }

  const db = obtenerDb()
  const snap = await db.collection('pedidos').doc(String(pedidoId).trim()).get()

  if (!snap.exists) {
    return { statusCode: 404, body: JSON.stringify({ error: 'No encontramos ese pedido. Revisá el código.' }) }
  }

  const pedido = snap.data() as any
  if (String(pedido.dni).trim() !== String(dni).trim()) {
    return { statusCode: 403, body: JSON.stringify({ error: 'El DNI no coincide con el pedido.' }) }
  }

  // Solo devolvemos lo que el cliente necesita ver, nada más.
  return {
    statusCode: 200,
    body: JSON.stringify({
      estadoPedido: pedido.estadoPedido,
      estadoPago: pedido.estadoPago,
      trackingManual: pedido.trackingManual ?? null,
      operadorManual: pedido.operadorManual ?? null,
      total: pedido.total,
      fechaCreacion: pedido.fechaCreacion,
      fechaActualizacion: pedido.fechaActualizacion
    })
  }
}
