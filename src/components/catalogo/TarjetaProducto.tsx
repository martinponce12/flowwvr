import { Link } from 'react-router-dom'
import type { Producto } from '@/types'
import ImagenProducto from '@/components/ui/ImagenProducto'
import Badge from '@/components/ui/Badge'
import { formatearPrecio } from '@/utils/formato'
import './tarjeta-producto.css'

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const sinStock = producto.stockActual <= 0
  const ultimasUnidades = !sinStock && producto.stockActual <= 3

  return (
    <Link to={`/producto/${producto.id}`} className="tarjeta-producto">
      <div className="tarjeta-producto__imagen-wrap">
        <ImagenProducto
          imagenes={producto.imagenes}
          colorPlaceholder={producto.colorPlaceholder}
          nombre={producto.nombre}
        />
        <div className="tarjeta-producto__badges">
          {producto.destacado && <Badge tipo="destacado" />}
          {producto.nuevo && <Badge tipo="nuevo" />}
          {sinStock && <Badge tipo="sin-stock" />}
          {ultimasUnidades && <Badge tipo="ultimas-unidades" />}
        </div>
      </div>
      <p className="tarjeta-producto__nombre">{producto.nombre}</p>
      <p className="tarjeta-producto__precio">
        {producto.precioPromocional ? (
          <>
            <span className="tarjeta-producto__precio-tachado">{formatearPrecio(producto.precio)}</span>{' '}
            {formatearPrecio(producto.precioPromocional)}
          </>
        ) : (
          formatearPrecio(producto.precio)
        )}
      </p>
    </Link>
  )
}
