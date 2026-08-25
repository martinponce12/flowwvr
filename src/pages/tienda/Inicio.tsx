import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutTienda from '@/components/layout/LayoutTienda'
import TarjetaProducto from '@/components/catalogo/TarjetaProducto'
import Boton from '@/components/ui/Boton'
import { listarProductosPublicados } from '@/services/datos/productos'
import { obtenerConfiguracion } from '@/services/datos/configuracion'
import type { Producto, Configuracion } from '@/types'
import './inicio.css'

export default function Inicio() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [config, setConfig] = useState<Configuracion | null>(null)

  useEffect(() => {
    listarProductosPublicados().then(setProductos)
    obtenerConfiguracion().then(setConfig)
  }, [])

  const destacados = productos.filter((p) => p.destacado)

  return (
    <LayoutTienda>
      <section className="hero">
        <div className="hero__cuadrille cuadrille" aria-hidden="true" />
        <div className="contenedor hero__contenido">
          <img src="/logo.png" alt="FlowwVR" className="hero__logo" />
          <p className="hero__tagline">{config?.tagline ?? config?.tienda.tagline}</p>
          <Link to="/catalogo">
            <Boton>Ver catálogo</Boton>
          </Link>
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="contenedor seccion">
          <h2 className="seccion__titulo">Destacados</h2>
          <div className="grilla-productos">
            {destacados.map((p) => (
              <TarjetaProducto key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      <section className="contenedor seccion info-rapida">
        <div className="info-rapida__item">
          <strong>Envíos a todo el país 🇦🇷</strong>
          <p>Elegí tu zona en el carrito y pagás todo junto.</p>
        </div>
        <div className="info-rapida__item">
          <strong>¿Querés personalizarlo?</strong>
          <p>Escribinos por WhatsApp y lo coordinamos con vos.</p>
        </div>
        <div className="info-rapida__item">
          <strong>10 días para arrepentirte</strong>
          <p>Conforme a la Ley de Defensa del Consumidor.</p>
        </div>
      </section>
    </LayoutTienda>
  )
}
