import { useEffect, useState, type ChangeEvent } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import {
  listarTodosLosProductos, crearProducto, actualizarProducto, eliminarProducto
} from '@/services/datos/productos'
import { listarCategorias } from '@/services/datos/categorias'
import { subirImagenProducto } from '@/services/firebase/storage'
import { formatearPrecio } from '@/utils/formato'
import type { Producto, Categoria } from '@/types'
import '@/styles/admin-comun.css'

const VACIO: Omit<Producto, 'id'> = {
  nombre: '', descripcion: '', precio: 0, stockActual: 0, categoriaId: '',
  peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: false, nuevo: false
}

const storageHabilitado = import.meta.env.VITE_STORAGE_HABILITADO === 'true'

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Producto, 'id'>>(VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  function cargar() {
    listarTodosLosProductos().then(setProductos)
    listarCategorias().then(setCategorias)
  }

  useEffect(cargar, [])

  function nuevo() {
    setForm(VACIO)
    setEditando(null)
    setMostrarForm(true)
  }

  function editar(p: Producto) {
    const { id, ...resto } = p
    setForm(resto)
    setEditando(id)
    setMostrarForm(true)
  }

  async function guardar() {
    if (!form.nombre || !form.categoriaId) return
    if (editando) {
      await actualizarProducto(editando, form)
    } else {
      await crearProducto(form)
    }
    setMostrarForm(false)
    cargar()
  }

  async function subirImagen(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendoImagen(true)
    try {
      const url = await subirImagenProducto(archivo)
      setForm((f) => ({ ...f, imagenUrl: url }))
    } finally {
      setSubiendoImagen(false)
    }
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await eliminarProducto(id)
    cargar()
  }

  return (
    <LayoutAdmin>
      <div className="admin-toolbar">
        <h1 className="admin-titulo" style={{ marginBottom: 0 }}>Productos</h1>
        <Boton onClick={nuevo}>+ Nuevo producto</Boton>
      </div>

      {mostrarForm && (
        <div className="admin-form">
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label>Categoría</label>
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label>Precio</label>
            <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
          </div>
          <div>
            <label>Stock actual</label>
            <input type="number" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} />
          </div>
          <div>
            <label>Foto del producto</label>
            {storageHabilitado ? (
              <>
                <input type="file" accept="image/*" onChange={subirImagen} disabled={subiendoImagen} />
                {subiendoImagen && <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginTop: 6 }}>Subiendo...</p>}
              </>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--warn)' }}>
                La carga directa de fotos todavía no está activada (falta Firebase Storage). Por ahora, pegá la URL de la imagen abajo.
              </p>
            )}
            {form.imagenUrl && (
              <img src={form.imagenUrl} alt="Vista previa" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
            )}
            <label style={{ marginTop: 10 }}>{storageHabilitado ? 'O pegar una URL de imagen (opcional)' : 'URL de la imagen'}</label>
            <input value={form.imagenUrl ?? ''} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} /> Publicado</div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} /> Destacado</div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.nuevo} onChange={(e) => setForm({ ...form, nuevo: e.target.checked })} /> Nuevo</div>
          <div className="admin-form-acciones">
            <Boton onClick={guardar}>Guardar</Boton>
            <Boton variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </div>
        </div>
      )}

      <table className="admin-tabla">
        <thead>
          <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{categorias.find((c) => c.id === p.categoriaId)?.nombre ?? '—'}</td>
              <td>{formatearPrecio(p.precio)}</td>
              <td>{p.stockActual}</td>
              <td>{p.publicado ? 'Publicado' : 'Oculto'}</td>
              <td style={{ display: 'flex', gap: 10 }}>
                <button className="admin-accion-link" onClick={() => editar(p)}>Editar</button>
                <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LayoutAdmin>
  )
}
