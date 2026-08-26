import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'
import { enviarEmail, plantillaPagoConfirmado } from './_lib/email'

// Recibe la notificación de Mercado Pago cuando cambia el estado de un pago.
//
// Reglas críticas:
// - Nunca confiar en el payload a ciegas: se vuelve a consultar el pago por
//   su ID contra la API de Mercado Pago.
// - Idempotente: si Mercado Pago reintenta la notificación, no se descuenta
//   stock dos veces (se chequea contra la colección `webhooksProcesados`).
// - El descuento de stock se hace producto por producto usando una
//   transacción de Firestore para evitar condiciones de carrera.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return { statusCode: 500, body: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }
  }

  const params = event.queryStringParameters || {}
  let paymentId = params['data.id'] || params['id']

  try {
    const body = event.body ? JSON.parse(event.body) : null
    if (!paymentId && body?.data?.id) paymentId = body.data.id
  } catch {
    // body no era JSON, seguimos con lo que haya en query params
  }

  if (!paymentId) {
    // Mercado Pago manda distintos formatos de notificación; si no
    // reconocemos ninguno, respondemos 200 igual para que no reintente en loop.
    return { statusCode: 200, body: 'sin payment id reconocible' }
  }

  const db = obtenerDb()

  // Idempotencia: si ya procesamos este pago, no hacemos nada de nuevo.
  const yaProcesadoRef = db.collection('webhooksProcesados').doc(String(paymentId))
  const yaProcesado = await yaProcesadoRef.get()
  if (yaProcesado.exists) {
    return { statusCode: 200, body: 'ya procesado' }
  }

  // Nunca confiamos en el payload: volvemos a consultar el pago real.
  const respuestaPago = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!respuestaPago.ok) {
    return { statusCode: 200, body: 'no se pudo verificar el pago' }
  }
  const pago = await respuestaPago.json()

  if (pago.status !== 'approved') {
    return { statusCode: 200, body: `pago en estado ${pago.status}, sin acción` }
  }

  const pedidoId = pago.external_reference
  if (!pedidoId) {
    return { statusCode: 200, body: 'pago sin external_reference' }
  }

  const pedidoRef = db.collection('pedidos').doc(pedidoId)

  await db.runTransaction(async (tx) => {
    const pedidoSnap = await tx.get(pedidoRef)
    if (!pedidoSnap.exists) return
    const pedido = pedidoSnap.data() as any

    // Si por algún motivo ya estaba pagado, no descontamos stock de nuevo.
    if (pedido.estadoPago === 'pagado') return

    for (const item of pedido.productos) {
      const productoRef = db.collection('productos').doc(item.productoId)
      const productoSnap = await tx.get(productoRef)
      if (!productoSnap.exists) continue
      const stockActual = productoSnap.data()?.stockActual ?? 0
      tx.update(productoRef, { stockActual: Math.max(0, stockActual - item.cantidad) })
    }

    tx.update(pedidoRef, {
      estadoPago: 'pagado',
      estadoPedido: 'pagado',
      fechaActualizacion: new Date().toISOString()
    })
  })

  await yaProcesadoRef.set({ procesadoEn: new Date().toISOString(), pedidoId })

  const pedidoActualizado = await pedidoRef.get()
  if (pedidoActualizado.exists) {
    const configSnap = await db.collection('configuracion').doc('general').get()
    const nombreTienda = configSnap.exists ? (configSnap.data() as any)?.tienda?.nombre : 'FlowwVR'
    const pedido = { id: pedidoId, ...pedidoActualizado.data() } as any
    await enviarEmail({
      to: pedido.email,
      subject: `¡Tu pago fue confirmado! Pedido #${pedidoId} — ${nombreTienda}`,
      html: plantillaPagoConfirmado(pedido, nombreTienda)
    })
  }

  return { statusCode: 200, body: 'ok' }
}
