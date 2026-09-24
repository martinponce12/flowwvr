import './imagen-producto.css'

interface Props {
  imagenes?: string[]
  colorPlaceholder?: string
  nombre: string
}

// Mientras no haya fotos reales cargadas, mostramos un placeholder con
// textura holográfica en vez de un ícono genérico roto. Muestra la primera
// foto del array (la "principal"); las demás (dorso, packaging) se ven en
// la galería de la página de detalle.
export default function ImagenProducto({ imagenes, colorPlaceholder, nombre }: Props) {
  const principal = imagenes?.[0]
  if (principal) {
    return <img src={principal} alt={nombre} className="imagen-producto" />
  }
  return (
    <div className={`imagen-producto imagen-producto--placeholder ph-${colorPlaceholder ?? 'default'}`}>
      <span>🔥</span>
    </div>
  )
}
