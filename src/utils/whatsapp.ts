// Normaliza un número de WhatsApp argentino a formato internacional wa.me.
//
// El problema: si al link de wa.me le pasás solo "1140848518" (formato local,
// sin código de país), WhatsApp interpreta el "1" inicial como código de país
// de EEUU (+1) y busca "140848518" ahí — por eso "no encuentra el usuario".
// Un número argentino de wa.me necesita: 54 (país) + 9 (indicador de móvil) +
// código de área + número, todo junto y sin el "0" ni el "15" locales.
//
// Ejemplos que esta función corrige automáticamente:
//   "1140848518"       -> "5491140848518"
//   "01140848518"      -> "5491140848518"
//   "011 15-4084-8518" -> "5491140848518"
//   "5491140848518"    -> "5491140848518" (ya estaba bien, no lo toca)
export function normalizarWhatsappAR(numero: string): string {
  let digitos = numero.replace(/\D/g, '')

  if (digitos.startsWith('549')) return digitos
  if (digitos.startsWith('54')) return `549${digitos.slice(2)}`
  if (digitos.startsWith('0')) digitos = digitos.slice(1)
  if (digitos.startsWith('15')) digitos = digitos.slice(2)

  return `549${digitos}`
}

export function linkWhatsapp(numero: string, mensaje?: string): string {
  const numeroNormalizado = normalizarWhatsappAR(numero)
  const base = `https://wa.me/${numeroNormalizado}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}
