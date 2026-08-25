import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, modoDemo } from './config'

// Sube una foto de producto a Firebase Storage y devuelve la URL pública
// para guardar en `producto.imagenUrl`.
//
// En modo demo (sin credenciales de Firebase todavía) no hay Storage real:
// convertimos la imagen a un data URL en memoria para que se pueda seguir
// probando el panel igual. Esto NO persiste entre recargas de página (es
// solo para previsualizar mientras no hay backend real conectado).
export async function subirImagenProducto(archivo: File): Promise<string> {
  if (modoDemo || !storage) {
    return await new Promise((resolve, reject) => {
      const lector = new FileReader()
      lector.onload = () => resolve(lector.result as string)
      lector.onerror = reject
      lector.readAsDataURL(archivo)
    })
  }

  const nombreArchivo = `productos/${Date.now()}-${archivo.name}`
  const referencia = ref(storage, nombreArchivo)
  await uploadBytes(referencia, archivo)
  return await getDownloadURL(referencia)
}
