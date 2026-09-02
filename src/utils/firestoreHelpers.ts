// Firestore rechaza guardar cualquier campo cuyo valor sea `undefined`
// (a diferencia de `null`, que sí acepta) — sin importar en qué nivel de
// anidamiento esté. Varios formularios arman objetos con campos opcionales
// (ej. "notas" vacías, "código promocional" no usado, o un producto del
// carrito que todavía no tiene foto cargada, cuyo `imagenUrl` queda como
// `undefined` DENTRO del array de productos del pedido). Esta función
// recorre el objeto entero — incluyendo arrays y objetos anidados a
// cualquier profundidad — y elimina esos campos antes de guardar.
export function limpiarUndefined<T>(valor: T): T {
  if (Array.isArray(valor)) {
    return valor.map((item) => limpiarUndefined(item)) as unknown as T
  }

  if (valor !== null && typeof valor === 'object' && !(valor instanceof Date)) {
    const resultado: Record<string, unknown> = {}
    for (const [clave, v] of Object.entries(valor as Record<string, unknown>)) {
      if (v === undefined) continue
      resultado[clave] = limpiarUndefined(v)
    }
    return resultado as T
  }

  return valor
}