// Firestore rechaza guardar cualquier campo cuyo valor sea `undefined`
// (a diferencia de `null`, que sí acepta). Como varios formularios arman
// objetos con campos opcionales (ej. "notas" vacías, "código promocional"
// no usado, "límite de usos" en blanco), esos campos pueden llegar como
// `undefined` y romper el guardado con un error que además queda tapado
// por el catch genérico del formulario. Esta función limpia esos campos
// antes de mandar el objeto a Firestore.
export function limpiarUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, valor]) => valor !== undefined)
  ) as T
}
