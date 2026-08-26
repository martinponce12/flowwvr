// Envío de emails transaccionales vía Resend (plan gratis: 3.000 emails/mes,
// sin tarjeta). Si RESEND_API_KEY no está configurada, no rompe nada: la
// función simplemente no manda el mail (útil mientras no lo activaste todavía).

const REMITENTE_POR_DEFECTO = 'FlowwVR <onboarding@resend.dev>'

export async function enviarEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // Resend no configurado todavía: no hacemos nada, no rompemos el flujo.

  const from = process.env.RESEND_FROM_EMAIL || REMITENTE_POR_DEFECTO

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: params.to, subject: params.subject, html: params.html })
  })
}

export function plantillaPedidoCreado(pedido: any, nombreTienda: string): string {
  const items = pedido.productos
    .map((p: any) => `<li>${p.cantidad}x ${p.nombre}</li>`)
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#d81b1b;">¡Gracias por tu compra en ${nombreTienda}! 🔥</h2>
      <p>Recibimos tu pedido y ya está siendo procesado.</p>
      <p style="background:#f5f5f5; padding:10px 14px; border-radius:8px; font-weight:bold;">
        Código de seguimiento: ${pedido.id}
      </p>
      <p><strong>Productos:</strong></p>
      <ul>${items}</ul>
      <p><strong>Total:</strong> $${pedido.total}</p>
      <p>Podés consultar el estado de tu pedido en cualquier momento con tu código y tu DNI, desde la sección "Seguí tu pedido" del sitio.</p>
    </div>
  `
}

export function plantillaPagoConfirmado(pedido: any, nombreTienda: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#d81b1b;">¡Tu pago fue confirmado! ✅</h2>
      <p>Ya estamos preparando tu pedido de ${nombreTienda}.</p>
      <p style="background:#f5f5f5; padding:10px 14px; border-radius:8px; font-weight:bold;">
        Código de seguimiento: ${pedido.id}
      </p>
      <p>Te vamos a avisar por WhatsApp cuando lo despachemos. También podés consultar el estado con tu código y tu DNI en la sección "Seguí tu pedido" del sitio.</p>
    </div>
  `
}
