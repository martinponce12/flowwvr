import { useEffect, useState } from 'react'
import LayoutTienda from '@/components/layout/LayoutTienda'
import TarjetaProducto from '@/components/catalogo/TarjetaProducto'
import { listarProductosPublicados } from '@/services/datos/productos'
import { listarCategorias } from '@/services/datos/categorias'
import type { Producto, Categoria } from '@/types'
import './catalogo.css'

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)

  useEffect(() => {
    listarProductosPublicados().then(setProductos)
    listarCategorias().then(setCategorias)
  }, [])

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoriaId === categoriaActiva)
    : productos

  return (
    <LayoutTienda>
      <div className="contenedor catalogo">
        <h1 className="catalogo__titulo">Catálogo</h1>

        <div className="catalogo__filtros">
          <button
            className={`filtro ${categoriaActiva === null ? 'filtro--activo' : ''}`}
            onClick={() => setCategoriaActiva(null)}
          >
            Todos
          </button>
          {categorias.filter((c) => c.activa).map((c) => (
            <button
              key={c.id}
              className={`filtro ${categoriaActiva === c.id ? 'filtro--activo' : ''}`}
              onClick={() => setCategoriaActiva(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="catalogo__vacio">No hay productos en esta categoría todavía.</p>
        ) : (
          <div className="grilla-productos">
            {productosFiltrados.map((p) => (
              <TarjetaProducto key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </LayoutTienda>
  )
}
