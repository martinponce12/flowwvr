import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import ImagenProducto from '@/components/ui/ImagenProducto'
import Boton from '@/components/ui/Boton'
import Badge from '@/components/ui/Badge'
import { obtenerProducto } from '@/services/datos/productos'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import { useCarrito } from '@/store/carrito'
import { linkWhatsapp } from '@/utils/whatsapp'
import { formatearPrecio } from '@/utils/formato'
import type { Producto, Configuracion } from '@/types'
import './detalle-producto.css'

export default function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined)
  const [config, setConfig] = useState<Configuracion | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const agregarProducto = useCarrito((s) => s.agregarProducto)

  useEffect(() => {
    if (!id) return
    obtenerProducto(id).then(setProducto)
    obtenerConfiguracion().then(setConfig)
  }, [id])

  if (producto === undefined) return <LayoutTienda><div className="contenedor">Cargando...</div></LayoutTienda>
  if (producto === null) {
    return (
      <LayoutTienda>
        <div className="contenedor" style={{ padding: '48px 0' }}>
          <p>No encontramos ese producto.</p>
          <Link to="/catalogo">Volver al catálogo</Link>
        </div>
      </LayoutTienda>
    )
  }

  const sinStock = producto.stockActual <= 0
  const linkWa = config ? linkWhatsapp(config.tienda.whatsapp, `Hola! Quiero personalizar el ${producto.nombre}`) : '#'

  return (
    <LayoutTienda>
      <div className="contenedor detalle-producto">
        <div className="detalle-producto__imagen">
          <ImagenProducto imagenUrl={producto.imagenUrl} colorPlaceholder={producto.colorPlaceholder} nombre={producto.nombre} />
        </div>

        <div className="detalle-producto__info">
          <div className="detalle-producto__badges">
            {producto.destacado && <Badge tipo="destacado" />}
            {producto.nuevo && <Badge tipo="nuevo" />}
            {sinStock && <Badge tipo="sin-stock" />}
          </div>

          <h1 className="detalle-producto__nombre">{producto.nombre}</h1>
          <p className="detalle-producto__precio">
            {formatearPrecio(producto.precioPromocional ?? producto.precio)}
          </p>
          <p className="detalle-producto__descripcion">{producto.descripcion}</p>

          {!sinStock && (
            <div className="detalle-producto__cantidad">
              <button onClick={() => setCantidad((c) => Math.max(1, c - 1))}>-</button>
              <span>{cantidad}</span>
              <button onClick={() => setCantidad((c) => Math.min(producto.stockActual, c + 1))}>+</button>
            </div>
          )}

          <Boton
            disabled={sinStock}
            onClick={() => {
              agregarProducto(producto, cantidad)
              setAgregado(true)
            }}
          >
            {sinStock ? 'Sin stock' : agregado ? 'Agregado ✓' : 'Agregar al carrito'}
          </Boton>

          {agregado && (
            <button className="detalle-producto__ir-carrito" onClick={() => navigate('/carrito')}>
              Ir al carrito →
            </button>
          )}

          <a href={linkWa} target="_blank" rel="noreferrer" className="detalle-producto__personalizar">
            ✨ ¿Querés personalizarlo? Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </LayoutTienda>
  )
}
