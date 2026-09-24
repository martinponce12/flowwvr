// Subida de fotos de producto a Cloudinary (plan gratis: 25 GB, sin tarjeta).
// Reemplaza a Firebase Storage para evitar depender del plan Blaze.
//
// "Unsigned upload preset": es un modo de Cloudinary pensado exactamente
// para subir archivos directo desde el navegador del cliente, sin pasar por
// un servidor propio ni exponer ningún secreto. El cloud name y el nombre
// del preset NO son datos sensibles (funcionan igual que la config web de
// Firebase): están pensados para ir en el frontend. Lo único que hay que
// cuidar es configurar el preset en Cloudinary para que solo acepte
// imágenes y limite el tamaño — eso se hace una vez, desde el panel de
// Cloudinary (ver README).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryHabilitado = Boolean(CLOUD_NAME && UPLOAD_PRESET)

const LADO_MAXIMO_PX = 1200
const CALIDAD_JPEG = 0.82

// Redimensiona y comprime la imagen en el navegador ANTES de subirla, para
// que una foto de 8-10 MB sacada con el celular no tarde una eternidad en
// subir ni ocupe espacio de más. No requiere ninguna librería: usa el
// <canvas> del navegador, que ya viene incluido.
function redimensionarImagen(archivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > LADO_MAXIMO_PX || height > LADO_MAXIMO_PX) {
          if (width > height) {
            height = Math.round((height * LADO_MAXIMO_PX) / width)
            width = LADO_MAXIMO_PX
          } else {
            width = Math.round((width * LADO_MAXIMO_PX) / height)
            height = LADO_MAXIMO_PX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
          'image/jpeg',
          CALIDAD_JPEG
        )
      }
      img.onerror = () => reject(new Error('No se pudo leer la imagen'))
      img.src = lector.result as string
    }
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.readAsDataURL(archivo)
  })
}

export async function subirImagenProducto(archivo: File): Promise<string> {
  if (!cloudinaryHabilitado) {
    throw new Error('Cloudinary no está configurado todavía (faltan VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).')
  }

  const imagenRedimensionada = await redimensionarImagen(archivo)

  const formData = new FormData()
  formData.append('file', imagenRedimensionada)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'flowwvr/productos')

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!resp.ok) {
    throw new Error('No se pudo subir la imagen. Intentá de nuevo.')
  }

  const data = await resp.json()
  return data.secure_url as string
}
