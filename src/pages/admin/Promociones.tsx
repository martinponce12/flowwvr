import { useEffect, useState } from 'react'
import LayoutAdmin from '@/components/admin/LayoutAdmin'
import Boton from '@/components/ui/Boton'
import { listarPromociones, crearPromocion, actualizarPromocion, eliminarPromocion } from '@/services/datos/promociones'
import type { Promocion, TipoPromocion } from '@/types'
import '@/styles/admin-comun.css'

const VACIO: Omit<Promocion, 'id'> = { codigo: '', tipo: 'porcentaje', valor: 0, usosActuales: 0, activa: true }

export default function AdminPromociones() {
  const [promos, setPromos] = useState<Promocion[]>([])
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  function cargar() { listarPromociones().then(setPromos) }
  useEffect(cargar, [])

  async function guardar() {
    if (!form.codigo) return
    const datos = { ...form, codigo: form.codigo.toUpperCase() }
    if (editando) await actualizarPromocion(editando, datos)
    else await crearPromocion(datos)
    setMostrarForm(false)
    setForm(VACIO)
    setEditando(null)
    cargar()
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta promoción?')) return
    await eliminarPromocion(id)
    cargar()
  }

  return (
    <LayoutAdmin>
      <div className="admin-toolbar">
        <h1 className="admin-titulo" style={{ marginBottom: 0 }}>Promociones</h1>
        <Boton onClick={() => { setForm(VACIO); setEditando(null); setMostrarForm(true) }}>+ Nueva promoción</Boton>
      </div>

      {mostrarForm && (
        <div className="admin-form">
          <div><label>Código</label><input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="Ej: FLOWWVR10" /></div>
          <div>
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPromocion })}>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto fijo</option>
              <option value="envio_gratis">Envío gratis</option>
            </select>
          </div>
          {form.tipo !== 'envio_gratis' && (
            <div>
              <label>{form.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto ($)'}</label>
              <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} />
            </div>
          )}
          <div><label>Límite de usos (opcional)</label><input type="number" value={form.limiteUsos ?? ''} onChange={(e) => setForm({ ...form, limiteUsos: e.target.value ? Number(e.target.value) : undefined })} /></div>
          <div className="admin-form-fila"><input type="checkbox" checked={form.activa} onChange={(e) => setForm({ ...form, activa: e.target.checked })} /> Activa</div>
          <div className="admin-form-acciones">
            <Boton onClick={guardar}>Guardar</Boton>
            <Boton variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
          </div>
        </div>
      )}

      <table className="admin-tabla">
        <thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Usos</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id}>
              <td>{p.codigo}</td>
              <td>{p.tipo}</td>
              <td>{p.tipo === 'envio_gratis' ? '—' : p.tipo === 'porcentaje' ? `${p.valor}%` : `$${p.valor}`}</td>
              <td>{p.usosActuales}{p.limiteUsos ? ` / ${p.limiteUsos}` : ''}</td>
              <td>{p.activa ? 'Activa' : 'Inactiva'}</td>
              <td style={{ display: 'flex', gap: 10 }}>
                <button className="admin-accion-link" onClick={() => { setForm({ codigo: p.codigo, tipo: p.tipo, valor: p.valor, limiteUsos: p.limiteUsos, usosActuales: p.usosActuales, activa: p.activa }); setEditando(p.id); setMostrarForm(true) }}>Editar</button>
                <button className="admin-accion-link admin-accion-link--peligro" onClick={() => borrar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LayoutAdmin>
  )
}
