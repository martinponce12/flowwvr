import './imagen-producto.css'

interface Props {
  imagenUrl?: string
  colorPlaceholder?: string
  nombre: string
}

// Mientras no haya fotos reales cargadas, mostramos un placeholder con
// textura holográfica (coherente con la identidad de marca) en vez de un
// ícono genérico roto. Apenas el admin suba `imagenUrl`, se muestra la foto real.
export default function ImagenProducto({ imagenUrl, colorPlaceholder, nombre }: Props) {
  if (imagenUrl) {
    return <img src={imagenUrl} alt={nombre} className="imagen-producto" />
  }
  return (
    <div className={`imagen-producto imagen-producto--placeholder ph-${colorPlaceholder ?? 'default'}`}>
      <span>🔥</span>
    </div>
  )
}
