import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import { listarCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '@/services/datos/categorias'
import type { Categoria } from '@/types'
import '@/styles/admin-comun.css'

const VACIO: Omit<Categoria, 'id'> = { nombre: '', descripcion: '', activa: true, orden: 0 }

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  function cargar() { listarCategorias().then(setCategorias) }
  useEffect(cargar, [])

  async function guardar() {
    if (!form.nombre) return
    if (editando) await actualizarCategoria(editando, form)
    else await crearCategoria(form)
    setMostrarForm(false)
    setForm(VACIO)
    setEditando(null)
    cargar()
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await eliminarCategoria(id)
    cargar()
  }

  return (
    <LayoutAdmin>
      <div className="admin-toolbar">
        <h1 className="admin-titulo" style={{ marginBottom: 0 }}>Categorías</h1>
        <Boton onClick={() => { setForm(VACIO); setEditando(null); setMostrarForm(true) }}>+ Nueva categoría</Boton>
      </div>

      {mostrarForm && (
        <div className="admin-form">
          <div><label>Nombre</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><label>Orden</label><input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} /></div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa</div>
          <div className="admin-form-acciones">
            <Boton onClick={guardar}>Guardar</Boton>
            <Boton variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </div>
        </div>
      )}

      <table className="admin-tabla">
        <thead><tr><th>Nombre</th><th>Orden</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.orden}</td>
              <td>{c.activa ? 'Activa' : 'Oculta'}</td>
              <td style={{ display: 'flex', gap: 10 }}>
                <button className="admin-accion-link" onClick={() => { setForm({ nombre: c.nombre, descripcion: c.descripcion, activa: c.activa, orden: c.orden }); setEditando(c.id); setMostrarForm(true) }}>Editar</button>
                <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrar(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LayoutAdmin>
  )
}
