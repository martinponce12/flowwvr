import type { Handler } from '@netlify/functions'
import { obtenerDb } from './_lib/firebaseAdmin'

// Corre en el servidor (Netlify), nunca en el navegador.
// El MERCADOPAGO_ACCESS_TOKEN vive solo acá como variable de entorno.
//
// Recibe el ID de un pedido ya creado en Firestore (estado "pendiente_pago")
// y devuelve el link de pago (init_point) de Mercado Pago Checkout Pro.
// Los items y el total se arman a partir del pedido guardado en Firestore
// (nunca confiando en precios enviados desde el frontend).

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  const { pedidoId } = JSON.parse(event.body || '{}')
  if (!pedidoId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta pedidoId' }) }
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    return { statusCode: 500, body: JSON.stringify({ error: 'MERCADOPAGO_ACCESS_TOKEN no configurado' }) }
  }

  const db = obtenerDb()
  const pedidoSnap = await db.collection('pedidos').doc(pedidoId).get()
  if (!pedidoSnap.exists) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Pedido no encontrado' }) }
  }
  const pedido = pedidoSnap.data() as any

  const items = pedido.productos.map((p: any) => ({
    title: p.nombre,
    quantity: p.cantidad,
    unit_price: p.precioUnitario,
    currency_id: 'ARS'
  }))

  if (pedido.costoEnvio > 0) {
    items.push({ title: 'Envío', quantity: 1, unit_price: pedido.costoEnvio, currency_id: 'ARS' })
  }
  if (pedido.descuento > 0) {
    items.push({ title: 'Descuento', quantity: 1, unit_price: -pedido.descuento, currency_id: 'ARS' })
  }

  const preferencia = {
    items,
    external_reference: pedidoId,
    payer: { name: pedido.cliente, email: pedido.email },
    notification_url: `${process.env.URL}/.netlify/functions/webhook-mercadopago`,
    back_urls: {
      success: `${process.env.URL}/checkout/exito`,
      failure: `${process.env.URL}/checkout/error`,
      pending: `${process.env.URL}/checkout/pendiente`
    },
    auto_return: 'approved'
  }

  const respuesta = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(preferencia)
  })

  const data = await respuesta.json()
  if (!respuesta.ok) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Error al crear preferencia', detalle: data }) }
  }

  return { statusCode: 200, body: JSON.stringify({ linkPago: data.init_point }) }
}
