import { useEffect, useState, type ChangeEvent } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import {
  listarTodosLosProductos, crearProducto, actualizarProducto, eliminarProducto
} from '@/services/datos/productos'
import { listarCategorias } from '@/services/datos/categorias'
import { subirImagenProducto, cloudinaryHabilitado } from '@/services/cloudinary/upload'
import { formatearPrecio } from '@/utils/formato'
import type { Producto, Categoria } from '@/types'
import '@/styles/admin-comun.css'


const VACIO: Omit<Producto, 'id'> = {
  nombre: '', descripcion: '', precio: 0, stockActual: 0, categoriaId: '',
  imagenes: [], peso: 25, alto: 8, ancho: 3, largo: 1.5, publicado: true, destacado: false, nuevo: false
}

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Producto, 'id'>>(VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [subiendoIndice, setSubiendoIndice] = useState<number | null>(null)
  const [errorSubida, setErrorSubida] = useState('')

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
    setForm({ ...resto, imagenes: resto.imagenes ?? [] })
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

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await eliminarProducto(id)
    cargar()
  }

  async function subirFoto(indice: number, e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setErrorSubida('')
    setSubiendoIndice(indice)
    try {
      const url = await subirImagenProducto(archivo)
      setForm((f) => {
        const imagenes = [...(f.imagenes ?? [])]
        imagenes[indice] = url
        return { ...f, imagenes }
      })
    } catch (err: any) {
      setErrorSubida(err?.message ?? 'No se pudo subir la imagen.')
    } finally {
      setSubiendoIndice(null)
      e.target.value = ''
    }
  }

  function quitarFoto(indice: number) {
    setForm((f) => {
      const imagenes = [...(f.imagenes ?? [])]
      imagenes.splice(indice, 1)
      return { ...f, imagenes }
    })
  }

  const etiquetasFoto = ['Frente', 'Dorso', 'Packaging']

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
            <label>Fotos (hasta 3: frente, dorso, packaging)</label>
            {!cloudinaryHabilitado && (
              <p style={{ fontSize: '0.8rem', color: 'var(--warn)', marginBottom: 8 }}>
                La carga de fotos todavía no está configurada (falta Cloudinary). Pedile al desarrollador que lo active.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[0, 1, 2].map((indice) => {
                const url = form.imagenes?.[indice]
                return (
                  <div key={indice} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 88, height: 88, borderRadius: 8, overflow: 'hidden',
                      background: 'var(--bg-surface-2)', border: '1px solid var(--borde)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4
                    }}>
                      {url ? (
                        <img src={url} alt={etiquetasFoto[indice]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--fg-muted)' }}>{subiendoIndice === indice ? 'Subiendo...' : 'Vacío'}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--fg-muted)', marginBottom: 4 }}>{etiquetasFoto[indice]}</p>
                    {url ? (
                      <button className="admin-accion-link admin-accion-link--peligro" style={{ fontSize: '0.7rem' }} onClick={() => quitarFoto(indice)}>Quitar</button>
                    ) : (
                      <label style={{ fontSize: '0.7rem', color: 'var(--accent-flame)', cursor: cloudinaryHabilitado ? 'pointer' : 'not-allowed' }}>
                        Subir
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!cloudinaryHabilitado || subiendoIndice !== null}
                          onChange={(e) => subirFoto(indice, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
            {errorSubida && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 6 }}>{errorSubida}</p>}
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
