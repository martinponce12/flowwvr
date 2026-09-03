import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'

// Permite que un cliente consulte SUS pedidos usando solo su DNI (no hace
// falta que haya guardado el código). Se buscan todos los pedidos con ese
// DNI y se devuelven los más recientes primero. No se expone la colección
// completa de pedidos (eso solo puede leerlo el admin): esta función usa
// el Admin SDK, que ignora las Security Rules, y solo devuelve los campos
// que el cliente necesita ver.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  const { dni } = JSON.parse(event.body || '{}')
  if (!dni) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta el DNI' }) }
  }

  const db = obtenerDb()
  const snap = await db.collection('pedidos')
    .where('dni', '==', String(dni).trim())
    .get()

  if (snap.empty) {
    return { statusCode: 404, body: JSON.stringify({ error: 'No encontramos pedidos con ese DNI.' }) }
  }

  const pedidos = snap.docs
    .map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        estadoPedido: data.estadoPedido,
        trackingManual: data.trackingManual ?? null,
        operadorManual: data.operadorManual ?? null,
        total: data.total,
        fechaCreacion: data.fechaCreacion
      }
    })
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 5) // últimos 5 pedidos, para no exponer un historial infinito

  return { statusCode: 200, body: JSON.stringify({ pedidos }) }
}
